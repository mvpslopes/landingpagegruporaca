<?php
/**
 * OAuth Google Drive - Autenticação do Usuário
 * 
 * Permite que usuários façam login com Google e façam upload usando sua própria quota
 */

// Habilitar exibição de erros para debug
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/oauth-errors.log');

// Verificar autenticação ANTES de incluir config.php (que define headers JSON)
// Iniciar sessão manualmente para verificar autenticação
if (session_status() === PHP_SESSION_NONE) {
    @session_start();
}

// Se não estiver autenticado e for requisição GET de navegador, mostrar página HTML
if (!isset($_SESSION['user']) && $_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['code'])) {
    // Limpar qualquer output anterior
    if (ob_get_level() > 0) {
        ob_clean();
    }
    header('Content-Type: text/html; charset=utf-8');
    ?>
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Autorizar Google Drive - Grupo Raça</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                max-width: 500px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            h1 {
                color: #333;
                margin-top: 0;
            }
            p {
                color: #666;
                line-height: 1.6;
            }
            .btn {
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 12px 24px;
                border-radius: 6px;
                text-decoration: none;
                margin-top: 20px;
                transition: background 0.3s;
            }
            .btn:hover {
                background: #5568d3;
            }
            .warning {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔐 Autenticação Necessária</h1>
            <p>Para autorizar o acesso ao Google Drive, você precisa estar logado no sistema interno.</p>
            
            <div class="warning">
                <strong>⚠️ Apenas usuários Root ou Admin podem autorizar o Google Drive.</strong>
            </div>
            
            <p><strong>Passos:</strong></p>
            <ol>
                <li>Faça login no sistema interno</li>
                <li>Volte para esta página</li>
                <li>Você será redirecionado automaticamente para autorizar o Google Drive</li>
            </ol>
            
            <a href="/login" class="btn">Fazer Login</a>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Agora incluir config.php (que define headers JSON)
require_once __DIR__ . '/config.php';

// Carregar autoloader do Composer
$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    jsonError('Biblioteca Google API não encontrada', 503);
}

// Suprimir erros do Composer relacionados a aliases.php (arquivo opcional)
$oldErrorReporting = error_reporting(E_ALL & ~E_WARNING & ~E_NOTICE);
require_once $autoloadPath;
error_reporting($oldErrorReporting);

// Carregar aliases se existir (pode estar vazio)
$aliasesPath = __DIR__ . '/src/aliases.php';
if (file_exists($aliasesPath)) {
    @require_once $aliasesPath;
} else {
    $aliasesPathAlt = __DIR__ . '/vendor/google/apiclient/src/aliases.php';
    if (file_exists($aliasesPathAlt)) {
        @require_once $aliasesPathAlt;
    }
}

// Criar aliases dinamicamente se necessário
if (class_exists('Google\Client') && !class_exists('Google_Client')) {
    class_alias('Google\Client', 'Google_Client');
}

// Verificar se a classe está disponível (com ou sem namespace)
if (!class_exists('Google_Client') && !class_exists('Google\Client')) {
    jsonError('Classe Google_Client não encontrada. Verifique se a biblioteca Google API foi carregada corretamente.', 503);
}

// Carregar configuração
$configPath = __DIR__ . '/config/drive_config.php';
if (!file_exists($configPath)) {
    jsonError('Configuração não encontrada', 500);
}
$config = require $configPath;

// Verificar autenticação (vai retornar erro JSON se não autenticado)
$user = requireAuth();

// Inicializar cliente OAuth (tentar com alias primeiro, depois namespace)
if (class_exists('Google_Client')) {
    $client = new Google_Client();
} elseif (class_exists('Google\Client')) {
    $client = new \Google\Client();
} else {
    jsonError('Não foi possível instanciar Google_Client', 503);
}
$client->setClientId($config['oauth_client_id'] ?? '');
$client->setClientSecret($config['oauth_client_secret'] ?? '');
$client->setRedirectUri($config['oauth_redirect_uri'] ?? '');
$client->setScopes($config['scopes']);
$client->setAccessType('offline');
$client->setPrompt('consent'); // Forçar consentimento para obter refresh token

// GET: Obter URL de autenticação
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['code'])) {
    $authUrl = $client->createAuthUrl();
    
    // Se for requisição de navegador, redirecionar automaticamente
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $isBrowser = strpos($userAgent, 'Mozilla') !== false || strpos($userAgent, 'Chrome') !== false || strpos($userAgent, 'Safari') !== false;
    
    if ($isBrowser) {
        // Redirecionar automaticamente para autorização do Google
        header('Location: ' . $authUrl);
        exit;
    }
    
    // Se for requisição API, retornar JSON
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
        
        // Armazenar token (persistente para todos os usuários)
        if ($user['role'] === 'root' || $user['role'] === 'admin') {
            require_once __DIR__ . '/oauth_token_storage.php';
            
            $tokenData = [
                'access_token' => $accessToken['access_token'],
                'refresh_token' => $accessToken['refresh_token'] ?? null,
                'expires_in' => $accessToken['expires_in'] ?? 3600,
                'created' => time(),
                'authorized_by' => $user['email'],
                'token_type' => $accessToken['token_type'] ?? 'Bearer'
            ];
            
            // Salvar em arquivo (todos os usuários podem usar)
            OAuthTokenStorage::saveToken($tokenData);
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
    require_once __DIR__ . '/oauth_token_storage.php';
    $hasToken = OAuthTokenStorage::hasToken();
    $tokenInfo = OAuthTokenStorage::getTokenInfo();
    
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
    
    require_once __DIR__ . '/oauth_token_storage.php';
    $token = OAuthTokenStorage::loadToken();
    if ($token && isset($token['access_token'])) {
        $client->revokeToken($token['access_token']);
        OAuthTokenStorage::removeToken();
        
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

