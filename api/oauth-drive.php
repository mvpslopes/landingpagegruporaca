<?php
/**
 * OAuth Google Drive - Autenticação do Usuário
 * 
 * Permite que usuários façam login com Google e façam upload usando sua própria quota
 */

require_once __DIR__ . '/config.php';

// Carregar autoloader do Composer
$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    jsonError('Biblioteca Google API não encontrada', 503);
}

require_once $autoloadPath;

// Carregar aliases
$aliasesPath = __DIR__ . '/src/aliases.php';
if (file_exists($aliasesPath)) {
    require_once $aliasesPath;
} else {
    $aliasesPathAlt = __DIR__ . '/vendor/google/apiclient/src/aliases.php';
    if (file_exists($aliasesPathAlt)) {
        require_once $aliasesPathAlt;
    }
}

// Carregar configuração
$configPath = __DIR__ . '/config/drive_config.php';
if (!file_exists($configPath)) {
    jsonError('Configuração não encontrada', 500);
}
$config = require $configPath;

// Verificar se usuário está autenticado no sistema
$user = requireAuth();

// Inicializar cliente OAuth
$client = new Google_Client();
$client->setClientId($config['oauth_client_id'] ?? '');
$client->setClientSecret($config['oauth_client_secret'] ?? '');
$client->setRedirectUri($config['oauth_redirect_uri'] ?? '');
$client->setScopes($config['scopes']);
$client->setAccessType('offline');
$client->setPrompt('consent'); // Forçar consentimento para obter refresh token

// GET: Obter URL de autenticação
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['code'])) {
    $authUrl = $client->createAuthUrl();
    
    jsonResponse([
        'authUrl' => $authUrl,
        'message' => 'Acesse a URL para autorizar o Google Drive'
    ]);
}

// GET: Receber código de autorização
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['code'])) {
    try {
        $accessToken = $client->fetchAccessTokenWithAuthCode($_GET['code']);
        
        if (isset($accessToken['error'])) {
            jsonError('Erro ao obter token: ' . $accessToken['error'], 400);
        }
        
        // Armazenar token na sessão do usuário
        if (!isset($_SESSION['oauth_tokens'])) {
            $_SESSION['oauth_tokens'] = [];
        }
        
        // Armazenar token centralizado (apenas para root/admin)
        if ($user['role'] === 'root' || $user['role'] === 'admin') {
            $_SESSION['oauth_tokens']['central'] = [
                'access_token' => $accessToken['access_token'],
                'refresh_token' => $accessToken['refresh_token'] ?? null,
                'expires_in' => $accessToken['expires_in'] ?? 3600,
                'created' => time(),
                'authorized_by' => $user['email']
            ];
        } else {
            jsonError('Apenas Root/Admin podem autorizar upload centralizado', 403);
        }
        
        jsonResponse([
            'success' => true,
            'message' => 'Autenticação Google Drive realizada com sucesso!',
            'user' => $user
        ]);
    } catch (Exception $e) {
        error_log('Erro OAuth: ' . $e->getMessage());
        jsonError('Erro ao processar autenticação: ' . $e->getMessage(), 500);
    }
}

// POST: Verificar se sistema tem token OAuth centralizado
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'check') {
    $hasToken = isset($_SESSION['oauth_tokens']['central']);
    $tokenInfo = null;
    
    if ($hasToken) {
        $tokenInfo = [
            'authorized_by' => $_SESSION['oauth_tokens']['central']['authorized_by'] ?? 'N/A',
            'created' => $_SESSION['oauth_tokens']['central']['created'] ?? 0
        ];
    }
    
    jsonResponse([
        'hasToken' => $hasToken,
        'tokenInfo' => $tokenInfo,
        'user' => $user,
        'canAuthorize' => ($user['role'] === 'root' || $user['role'] === 'admin')
    ]);
}

// POST: Revogar token centralizado
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'revoke') {
    // Apenas root/admin pode revogar
    if ($user['role'] !== 'root' && $user['role'] !== 'admin') {
        jsonError('Apenas Root/Admin podem revogar autorização', 403);
    }
    
    if (isset($_SESSION['oauth_tokens']['central'])) {
        $token = $_SESSION['oauth_tokens']['central']['access_token'];
        $client->revokeToken($token);
        unset($_SESSION['oauth_tokens']['central']);
        
        jsonResponse([
            'success' => true,
            'message' => 'Autorização revogada com sucesso'
        ]);
    } else {
        jsonError('Nenhuma autorização encontrada', 404);
    }
}

jsonError('Método não permitido', 405);
?>

