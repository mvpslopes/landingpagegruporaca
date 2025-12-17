<?php
/**
 * Teste de Conexão com Banco - Debug Completo
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header('Content-Type: text/html; charset=utf-8');

echo "<h2>Teste de Conexão com Banco</h2>";

// 1. Verificar detecção de ambiente
echo "<h3>1. Detecção de Ambiente:</h3>";
echo "SERVER_NAME: " . ($_SERVER['SERVER_NAME'] ?? 'não definido') . "<br>";
echo "HTTP_HOST: " . ($_SERVER['HTTP_HOST'] ?? 'não definido') . "<br>";
echo "Arquivo .local existe: " . (file_exists(__DIR__ . '/.local') ? 'SIM ✅' : 'NÃO ❌') . "<br>";

// 2. Carregar db_config.php
echo "<h3>2. Carregando db_config.php...</h3>";
try {
    require_once 'db_config.php';
    echo "✅ db_config.php carregado<br>";
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "<br>";
    exit;
}

// 3. Verificar constantes definidas
echo "<h3>3. Constantes Definidas:</h3>";
echo "DB_HOST: " . (defined('DB_HOST') ? DB_HOST : 'NÃO DEFINIDO') . "<br>";
echo "DB_NAME: " . (defined('DB_NAME') ? DB_NAME : 'NÃO DEFINIDO') . "<br>";
echo "DB_USER: " . (defined('DB_USER') ? DB_USER : 'NÃO DEFINIDO') . "<br>";
echo "DB_PASS: " . (defined('DB_PASS') ? (DB_PASS ? '***' : '(vazio)') : 'NÃO DEFINIDO') . "<br>";

// 4. Tentar conectar
echo "<h3>4. Tentando Conectar...</h3>";
try {
    $conn = getDBConnection();
    echo "✅ Conexão estabelecida com sucesso!<br>";
    
    // 5. Testar query
    echo "<h3>5. Testando Query...</h3>";
    $stmt = $conn->query("SELECT COUNT(*) as total FROM users");
    $result = $stmt->fetch();
    echo "✅ Total de usuários: " . $result['total'] . "<br>";
    
} catch (PDOException $e) {
    echo "❌ Erro de conexão: " . $e->getMessage() . "<br>";
    echo "Código: " . $e->getCode() . "<br>";
    
    // Verificar se MySQL está rodando
    echo "<h3>6. Verificando MySQL...</h3>";
    echo "Verifique no XAMPP Control Panel se o MySQL está rodando (deve estar verde).<br>";
}
?>

