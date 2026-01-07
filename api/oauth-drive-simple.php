<?php
/**
 * Versão simplificada do oauth-drive.php para debug
 */

// Forçar exibição de erros
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// Limpar qualquer output buffer
while (ob_get_level() > 0) {
    ob_end_clean();
}

// Iniciar sessão
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Verificar se está autenticado
$isAuthenticated = isset($_SESSION['user']);

// Se não estiver autenticado, mostrar página de login
if (!$isAuthenticated && $_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['code'])) {
    ?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Autorizar Google Drive - Grupo Raça</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 15px;
        }
        .btn {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            margin-top: 10px;
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
        ol {
            margin-left: 20px;
            margin-bottom: 20px;
        }
        li {
            margin-bottom: 8px;
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

// Se chegou aqui, está autenticado - carregar o resto
// NÃO incluir config.php ainda para não definir headers JSON
// Vamos carregar apenas o necessário para verificar autenticação

// Iniciar sessão se necessário
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Verificar autenticação manualmente (sem usar requireAuth que define headers JSON)
if (!isset($_SESSION['user'])) {
    header('Content-Type: text/html; charset=utf-8');
    die('Erro: Não autenticado. Faça login no sistema interno primeiro.');
}

$user = $_SESSION['user'];

// Carregar autoloader
$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    die('Erro: Biblioteca Google API não encontrada');
}

// Suprimir erros do Composer relacionados a aliases.php (arquivo opcional)
$oldErrorReporting = error_reporting(E_ALL & ~E_WARNING & ~E_NOTICE);
require_once $autoloadPath;
error_reporting($oldErrorReporting);

// Carregar aliases se existir (pode estar vazio)
$aliasesPath = __DIR__ . '/src/aliases.php';
if (file_exists($aliasesPath)) {
    @require_once $aliasesPath;
}

// Criar aliases dinamicamente se necessário
if (class_exists('Google\Client') && !class_exists('Google_Client')) {
    class_alias('Google\Client', 'Google_Client');
}

// Verificar se a classe está disponível (com ou sem namespace)
if (!class_exists('Google_Client') && !class_exists('Google\Client')) {
    die('Erro: Classe Google_Client não encontrada. Verifique se a biblioteca Google API foi carregada corretamente.');
}

// Carregar configuração
$configPath = __DIR__ . '/config/drive_config.php';
if (!file_exists($configPath)) {
    die('Erro: Configuração não encontrada');
}
$config = require $configPath;

// Inicializar cliente OAuth (tentar com alias primeiro, depois namespace)
if (class_exists('Google_Client')) {
    $client = new Google_Client();
} elseif (class_exists('Google\Client')) {
    $client = new \Google\Client();
} else {
    die('Erro: Não foi possível instanciar Google_Client');
}
$client->setClientId($config['oauth_client_id'] ?? '');
$client->setClientSecret($config['oauth_client_secret'] ?? '');
$client->setRedirectUri($config['oauth_redirect_uri'] ?? '');
$client->setScopes($config['scopes']);
$client->setAccessType('offline');
$client->setPrompt('consent');

// GET: Obter URL de autenticação
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['code'])) {
    $authUrl = $client->createAuthUrl();
    
    // Redirecionar automaticamente
    header('Location: ' . $authUrl);
    exit;
}

// GET: Receber código de autorização
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['code'])) {
    try {
        $accessToken = $client->fetchAccessTokenWithAuthCode($_GET['code']);
        
        if (isset($accessToken['error'])) {
            // Incluir config.php para usar jsonError
            require_once __DIR__ . '/config.php';
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
            // Incluir config.php para usar jsonError
            require_once __DIR__ . '/config.php';
            jsonError('Apenas Root/Admin podem autorizar upload centralizado', 403);
        }
        
        // Incluir config.php para usar jsonResponse
        require_once __DIR__ . '/config.php';
        jsonResponse([
            'success' => true,
            'message' => 'Autenticação Google Drive realizada com sucesso!',
            'user' => $user
        ]);
    } catch (Exception $e) {
        error_log('Erro OAuth: ' . $e->getMessage());
        // Incluir config.php para usar jsonError
        require_once __DIR__ . '/config.php';
        jsonError('Erro ao processar autenticação: ' . $e->getMessage(), 500);
    }
}

// Incluir config.php para usar jsonError
require_once __DIR__ . '/config.php';
jsonError('Método não permitido', 405);
?>

