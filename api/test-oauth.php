<?php
/**
 * Arquivo de teste para diagnosticar problemas no oauth-drive.php
 */

// Habilitar exibição de erros
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

header('Content-Type: text/html; charset=utf-8');

echo "<h1>Teste OAuth Drive</h1>";
echo "<hr>";

// Teste 1: Verificar se PHP está funcionando
echo "<h2>Teste 1: PHP funcionando</h2>";
echo "✓ PHP está funcionando<br>";
echo "Versão PHP: " . phpversion() . "<br><br>";

// Teste 2: Verificar sessão
echo "<h2>Teste 2: Sessão</h2>";
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
echo "✓ Sessão iniciada<br>";
echo "Session ID: " . session_id() . "<br>";
echo "Usuário na sessão: " . (isset($_SESSION['user']) ? 'SIM' : 'NÃO') . "<br>";
if (isset($_SESSION['user'])) {
    echo "Email: " . ($_SESSION['user']['email'] ?? 'N/A') . "<br>";
    echo "Role: " . ($_SESSION['user']['role'] ?? 'N/A') . "<br>";
}
echo "<br>";

// Teste 3: Verificar se config.php existe e pode ser carregado
echo "<h2>Teste 3: config.php</h2>";
$configFile = __DIR__ . '/config.php';
if (file_exists($configFile)) {
    echo "✓ config.php existe<br>";
    try {
        require_once $configFile;
        echo "✓ config.php carregado com sucesso<br>";
    } catch (Exception $e) {
        echo "✗ Erro ao carregar config.php: " . $e->getMessage() . "<br>";
    }
} else {
    echo "✗ config.php não encontrado<br>";
}
echo "<br>";

// Teste 4: Verificar se drive_config.php existe
echo "<h2>Teste 4: drive_config.php</h2>";
$driveConfigFile = __DIR__ . '/config/drive_config.php';
if (file_exists($driveConfigFile)) {
    echo "✓ drive_config.php existe<br>";
    try {
        $config = require $driveConfigFile;
        echo "✓ drive_config.php carregado<br>";
        echo "OAuth Client ID: " . (isset($config['oauth_client_id']) ? 'Configurado' : 'NÃO configurado') . "<br>";
        echo "OAuth Client Secret: " . (isset($config['oauth_client_secret']) ? 'Configurado' : 'NÃO configurado') . "<br>";
    } catch (Exception $e) {
        echo "✗ Erro ao carregar drive_config.php: " . $e->getMessage() . "<br>";
    }
} else {
    echo "✗ drive_config.php não encontrado<br>";
}
echo "<br>";

// Teste 5: Verificar se vendor/autoload.php existe
echo "<h2>Teste 5: Google API Library</h2>";
$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (file_exists($autoloadPath)) {
    echo "✓ vendor/autoload.php existe<br>";
    try {
        require_once $autoloadPath;
        echo "✓ Autoloader carregado<br>";
    } catch (Exception $e) {
        echo "✗ Erro ao carregar autoloader: " . $e->getMessage() . "<br>";
    }
} else {
    echo "✗ vendor/autoload.php não encontrado<br>";
}
echo "<br>";

// Teste 6: Tentar criar Google_Client
echo "<h2>Teste 6: Google_Client</h2>";
if (class_exists('Google_Client')) {
    echo "✓ Classe Google_Client disponível<br>";
    try {
        $client = new Google_Client();
        echo "✓ Google_Client instanciado com sucesso<br>";
    } catch (Exception $e) {
        echo "✗ Erro ao instanciar Google_Client: " . $e->getMessage() . "<br>";
    }
} else {
    echo "✗ Classe Google_Client não encontrada<br>";
}
echo "<br>";

// Teste 7: Verificar oauth-drive.php
echo "<h2>Teste 7: oauth-drive.php</h2>";
$oauthFile = __DIR__ . '/oauth-drive.php';
if (file_exists($oauthFile)) {
    echo "✓ oauth-drive.php existe<br>";
    // Verificar sintaxe
    $output = [];
    $return = 0;
    exec("php -l " . escapeshellarg($oauthFile) . " 2>&1", $output, $return);
    if ($return === 0) {
        echo "✓ Sintaxe PHP válida<br>";
    } else {
        echo "✗ Erro de sintaxe:<br>";
        echo "<pre>" . implode("\n", $output) . "</pre>";
    }
} else {
    echo "✗ oauth-drive.php não encontrado<br>";
}
echo "<br>";

// Teste 8: Verificar permissões de arquivo
echo "<h2>Teste 8: Permissões</h2>";
echo "Permissões de oauth-drive.php: " . substr(sprintf('%o', fileperms($oauthFile)), -4) . "<br>";
echo "Permissões de config.php: " . substr(sprintf('%o', fileperms($configFile)), -4) . "<br>";
echo "<br>";

echo "<hr>";
echo "<h2>Conclusão</h2>";
echo "<p>Se todos os testes passaram, o problema pode ser:</p>";
echo "<ul>";
echo "<li>Cache do navegador (tente Ctrl+F5)</li>";
echo "<li>Erro silencioso no oauth-drive.php</li>";
echo "<li>Problema com headers já enviados</li>";
echo "</ul>";
echo "<p><a href='oauth-drive.php'>Tentar acessar oauth-drive.php</a></p>";
?>

