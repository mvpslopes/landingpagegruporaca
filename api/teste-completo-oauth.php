<?php
/**
 * Teste completo do OAuth Google Drive
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/html; charset=utf-8');

echo "<h1>✅ Teste Completo OAuth Google Drive</h1>";
echo "<hr>";

// Teste 1: Verificar autoloader
echo "<h2>1. Autoloader</h2>";
require_once __DIR__ . '/vendor/autoload.php';
echo "✓ Autoloader carregado<br><br>";

// Teste 2: Verificar classes
echo "<h2>2. Classes Disponíveis</h2>";
if (class_exists('Google\Client')) {
    echo "✓ Google\\Client encontrada<br>";
} else {
    die("✗ Google\\Client NÃO encontrada");
}

if (class_exists('Google_Client')) {
    echo "✓ Google_Client (alias) encontrada<br>";
} else {
    // Criar alias
    if (class_exists('Google\Client')) {
        class_alias('Google\Client', 'Google_Client');
        echo "✓ Alias Google_Client criado<br>";
    }
}
echo "<br>";

// Teste 3: Carregar configuração
echo "<h2>3. Configuração</h2>";
$configPath = __DIR__ . '/config/drive_config.php';
if (!file_exists($configPath)) {
    die("✗ Configuração não encontrada");
}
$config = require $configPath;
echo "✓ Configuração carregada<br>";
echo "OAuth Client ID: " . (isset($config['oauth_client_id']) ? 'Configurado' : 'NÃO configurado') . "<br>";
echo "OAuth Client Secret: " . (isset($config['oauth_client_secret']) ? 'Configurado' : 'NÃO configurado') . "<br>";
echo "<br>";

// Teste 4: Inicializar cliente OAuth
echo "<h2>4. Cliente OAuth</h2>";
try {
    if (class_exists('Google_Client')) {
        $client = new Google_Client();
    } else {
        $client = new \Google\Client();
    }
    
    $client->setClientId($config['oauth_client_id'] ?? '');
    $client->setClientSecret($config['oauth_client_secret'] ?? '');
    $client->setRedirectUri($config['oauth_redirect_uri'] ?? '');
    $client->setScopes($config['scopes'] ?? []);
    $client->setAccessType('offline');
    $client->setPrompt('consent');
    
    echo "✓ Cliente OAuth inicializado com sucesso<br>";
    
    // Criar URL de autorização
    $authUrl = $client->createAuthUrl();
    echo "✓ URL de autorização criada<br>";
    echo "URL: <a href='" . htmlspecialchars($authUrl) . "' target='_blank'>" . htmlspecialchars($authUrl) . "</a><br>";
    
} catch (Exception $e) {
    die("✗ Erro ao inicializar cliente: " . htmlspecialchars($e->getMessage()));
}
echo "<br>";

// Teste 5: Verificar sessão
echo "<h2>5. Sessão</h2>";
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (isset($_SESSION['user'])) {
    echo "✓ Usuário autenticado: " . htmlspecialchars($_SESSION['user']['email'] ?? 'N/A') . "<br>";
    echo "Role: " . htmlspecialchars($_SESSION['user']['role'] ?? 'N/A') . "<br>";
} else {
    echo "⚠️ Usuário NÃO autenticado<br>";
    echo "Você precisa fazer login antes de autorizar o Google Drive<br>";
}
echo "<br>";

echo "<hr>";
echo "<h2>✅ Todos os Testes Passaram!</h2>";
echo "<p><strong>Próximos passos:</strong></p>";
echo "<ol>";
echo "<li>Faça login no sistema interno</li>";
echo "<li>Acesse: <a href='oauth-drive-simple.php'>oauth-drive-simple.php</a></li>";
echo "<li>Você será redirecionado para autorizar o Google Drive</li>";
echo "</ol>";
?>

