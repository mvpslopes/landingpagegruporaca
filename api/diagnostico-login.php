<?php
/**
 * Diagnóstico Completo do Problema de Login
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 Diagnóstico de Login - Grupo Raça</h1>";

// 1. Informações do Servidor
echo "<h2>1. Informações do Servidor:</h2>";
echo "<pre>";
echo "SERVER_NAME: " . ($_SERVER['SERVER_NAME'] ?? 'não definido') . "\n";
echo "HTTP_HOST: " . ($_SERVER['HTTP_HOST'] ?? 'não definido') . "\n";
echo "REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'não definido') . "\n";
echo "SCRIPT_NAME: " . ($_SERVER['SCRIPT_NAME'] ?? 'não definido') . "\n";
echo "</pre>";

// 2. Verificar arquivos
echo "<h2>2. Verificando Arquivos:</h2>";
$files = [
    'db_config.php',
    'config.php',
    'permissions_db.php',
    'auth.php'
];

foreach ($files as $file) {
    $path = __DIR__ . '/' . $file;
    if (file_exists($path)) {
        echo "✅ $file existe<br>";
    } else {
        echo "❌ $file NÃO existe<br>";
    }
}

// 3. Carregar db_config.php
echo "<h2>3. Carregando db_config.php:</h2>";
try {
    require_once 'db_config.php';
    echo "✅ db_config.php carregado<br>";
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "<br>";
    exit;
}

// 4. Verificar detecção de ambiente
echo "<h2>4. Detecção de Ambiente:</h2>";
$serverName = $_SERVER['SERVER_NAME'] ?? $_SERVER['HTTP_HOST'] ?? '';
$isLocal = (
    ($_SERVER['SERVER_NAME'] ?? '') === 'localhost' || 
    ($_SERVER['SERVER_NAME'] ?? '') === '127.0.0.1' ||
    ($_SERVER['HTTP_HOST'] ?? '') === 'localhost' ||
    ($_SERVER['HTTP_HOST'] ?? '') === '127.0.0.1' ||
    strpos($_SERVER['SERVER_NAME'] ?? '', '.local') !== false ||
    file_exists(__DIR__ . '/.local')
);

echo "É local? " . ($isLocal ? 'SIM ✅' : 'NÃO ❌') . "<br>";
echo "Domínio detectado: " . htmlspecialchars($serverName) . "<br>";

if (!$isLocal) {
    if (strpos($serverName, 'gruporaca.app.br') !== false) {
        echo "✅ Domínio gruporaca.app.br detectado<br>";
    } else {
        echo "⚠️ Domínio NÃO é gruporaca.app.br (pode ser problema!)<br>";
        echo "Sugestão: Verificar se o domínio está configurado corretamente no Hostinger<br>";
    }
}

// 5. Constantes do Banco
echo "<h2>5. Constantes do Banco de Dados:</h2>";
echo "<pre>";
echo "DB_HOST: " . (defined('DB_HOST') ? DB_HOST : 'NÃO DEFINIDO') . "\n";
echo "DB_NAME: " . (defined('DB_NAME') ? DB_NAME : 'NÃO DEFINIDO') . "\n";
echo "DB_USER: " . (defined('DB_USER') ? DB_USER : 'NÃO DEFINIDO') . "\n";
echo "DB_PASS: " . (defined('DB_PASS') ? (DB_PASS ? '***' : '(vazio)') : 'NÃO DEFINIDO') . "\n";
echo "</pre>";

// 6. Testar Conexão
echo "<h2>6. Testando Conexão com Banco:</h2>";
try {
    $conn = getDBConnection();
    echo "✅ Conexão estabelecida!<br>";
    
    // Testar query
    $stmt = $conn->query("SELECT COUNT(*) as total FROM users");
    $result = $stmt->fetch();
    echo "✅ Total de usuários no banco: " . $result['total'] . "<br>";
    
    // Listar alguns usuários
    $stmt = $conn->query("SELECT id, email, name, role FROM users LIMIT 5");
    $users = $stmt->fetchAll();
    echo "<h3>Usuários encontrados:</h3>";
    echo "<ul>";
    foreach ($users as $user) {
        echo "<li>" . htmlspecialchars($user['email']) . " (" . htmlspecialchars($user['role']) . ")</li>";
    }
    echo "</ul>";
    
} catch (PDOException $e) {
    echo "❌ Erro de conexão: " . $e->getMessage() . "<br>";
    echo "Código: " . $e->getCode() . "<br>";
}

// 7. Testar getUserByEmail
echo "<h2>7. Testando getUserByEmail():</h2>";
try {
    require_once 'permissions_db.php';
    $testEmail = 'marcus@gruporaca.com.br';
    $user = getUserByEmail($testEmail);
    
    if ($user) {
        echo "✅ Usuário encontrado: " . htmlspecialchars($user['email']) . "<br>";
        echo "Nome: " . htmlspecialchars($user['name']) . "<br>";
        echo "Role: " . htmlspecialchars($user['role']) . "<br>";
    } else {
        echo "❌ Usuário NÃO encontrado com email: " . htmlspecialchars($testEmail) . "<br>";
    }
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "<br>";
}

// 8. Verificar logs de erro do PHP
echo "<h2>8. Logs de Erro do PHP:</h2>";
$errorLog = ini_get('error_log');
if ($errorLog && file_exists($errorLog)) {
    echo "Arquivo de log: " . htmlspecialchars($errorLog) . "<br>";
    $lastLines = file($errorLog);
    if ($lastLines) {
        echo "<pre>";
        echo htmlspecialchars(implode('', array_slice($lastLines, -10)));
        echo "</pre>";
    }
} else {
    echo "⚠️ Arquivo de log não encontrado ou não configurado<br>";
}

echo "<hr>";
echo "<p><strong>Próximos passos:</strong></p>";
echo "<ol>";
echo "<li>Se a conexão falhou, verifique as credenciais do banco</li>";
echo "<li>Se o domínio não foi detectado corretamente, pode ser necessário ajustar o db_config.php</li>";
echo "<li>Se getUserByEmail() falhou, verifique se o usuário existe no banco</li>";
echo "</ol>";
?>

