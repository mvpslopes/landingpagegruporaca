<?php
/**
 * Teste do endpoint folders.php com Google Drive
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/html; charset=utf-8');

echo "<h1>Teste folders.php com Google Drive</h1>";
echo "<hr>";

// 1. Verificar sessão
echo "<h2>1. Sessão</h2>";
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (isset($_SESSION['user'])) {
    echo "✓ Usuário logado: " . htmlspecialchars($_SESSION['user']['email']) . "<br>";
    echo "Role: " . htmlspecialchars($_SESSION['user']['role']) . "<br>";
} else {
    die("✗ Nenhum usuário logado. Faça login primeiro.");
}
echo "<br>";

// 2. Verificar token OAuth
echo "<h2>2. Token OAuth</h2>";
if (isset($_SESSION['oauth_tokens']['central'])) {
    echo "✓ Token OAuth encontrado na sessão<br>";
    $token = $_SESSION['oauth_tokens']['central'];
    echo "Access token: " . (isset($token['access_token']) ? 'Presente' : 'Ausente') . "<br>";
    echo "Refresh token: " . (isset($token['refresh_token']) ? 'Presente' : 'Ausente') . "<br>";
    echo "Criado em: " . (isset($token['created']) ? date('Y-m-d H:i:s', $token['created']) : 'N/A') . "<br>";
} else {
    echo "✗ Token OAuth NÃO encontrado na sessão<br>";
    echo "Você precisa autorizar o Google Drive primeiro em: <a href='oauth-drive-simple.php'>oauth-drive-simple.php</a><br>";
}
echo "<br>";

// 3. Testar DriveService
echo "<h2>3. DriveService</h2>";
try {
    require_once __DIR__ . '/drive_service.php';
    
    $oauthToken = null;
    if (isset($_SESSION['oauth_tokens']['central'])) {
        $oauthToken = $_SESSION['oauth_tokens']['central'];
    }
    
    $driveService = new DriveService($oauthToken);
    echo "✓ DriveService instanciado com sucesso<br>";
} catch (Exception $e) {
    die("✗ Erro ao instanciar DriveService: " . htmlspecialchars($e->getMessage()) . "<br><pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>");
}
echo "<br>";

// 4. Testar listFiles
echo "<h2>4. Listar Arquivos (raiz)</h2>";
try {
    $files = $driveService->listFiles('', true);
    echo "✓ Arquivos listados com sucesso<br>";
    echo "Total de itens: " . count($files) . "<br>";
    
    // Mostrar primeiros 5 itens
    echo "<h3>Primeiros itens:</h3>";
    echo "<pre>";
    print_r(array_slice($files, 0, 5));
    echo "</pre>";
} catch (Exception $e) {
    echo "✗ Erro ao listar arquivos: " . htmlspecialchars($e->getMessage()) . "<br>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}
echo "<br>";

// 5. Testar folders.php diretamente
echo "<h2>5. Testar folders.php</h2>";
echo "<p>Testando o endpoint diretamente...</p>";

// Simular requisição GET
$_SERVER['REQUEST_METHOD'] = 'GET';

// Capturar output
ob_start();
try {
    include __DIR__ . '/folders.php';
    $output = ob_get_clean();
    echo "<h3>Resposta:</h3>";
    echo "<pre>" . htmlspecialchars($output) . "</pre>";
    
    // Tentar parsear JSON
    $json = json_decode($output, true);
    if ($json !== null) {
        echo "✓ JSON válido<br>";
        echo "<pre>" . print_r($json, true) . "</pre>";
    } else {
        echo "✗ JSON inválido ou vazio<br>";
        echo "Erro JSON: " . json_last_error_msg() . "<br>";
    }
} catch (Exception $e) {
    ob_end_clean();
    echo "✗ Erro ao executar folders.php: " . htmlspecialchars($e->getMessage()) . "<br>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}
?>

