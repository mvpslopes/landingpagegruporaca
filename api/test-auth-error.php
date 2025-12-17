<?php
/**
 * Teste de Erro do auth.php
 */

// Ativar exibição de erros
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

echo "<h2>Teste de Dependências do auth.php</h2>";

// 1. Testar config.php
echo "<h3>1. Testando config.php...</h3>";
try {
    require_once 'config.php';
    echo "✅ config.php carregado com sucesso<br>";
} catch (Exception $e) {
    echo "❌ Erro ao carregar config.php: " . $e->getMessage() . "<br>";
    exit;
}

// 2. Testar db_config.php
echo "<h3>2. Testando db_config.php...</h3>";
try {
    require_once 'db_config.php';
    echo "✅ db_config.php carregado com sucesso<br>";
} catch (Exception $e) {
    echo "❌ Erro ao carregar db_config.php: " . $e->getMessage() . "<br>";
    exit;
}

// 3. Testar conexão com banco
echo "<h3>3. Testando conexão com banco...</h3>";
try {
    $conn = getDBConnection();
    echo "✅ Conexão com banco estabelecida<br>";
} catch (Exception $e) {
    echo "❌ Erro na conexão: " . $e->getMessage() . "<br>";
    exit;
}

// 4. Testar permissions_db.php
echo "<h3>4. Testando permissions_db.php...</h3>";
try {
    require_once 'permissions_db.php';
    echo "✅ permissions_db.php carregado com sucesso<br>";
} catch (Exception $e) {
    echo "❌ Erro ao carregar permissions_db.php: " . $e->getMessage() . "<br>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
    exit;
}

// 5. Testar função getUserByEmail
echo "<h3>5. Testando função getUserByEmail...</h3>";
try {
    $user = getUserByEmail('marcus@gruporaca.com.br');
    if ($user) {
        echo "✅ Usuário encontrado: " . $user['name'] . "<br>";
    } else {
        echo "⚠️ Usuário não encontrado<br>";
    }
} catch (Exception $e) {
    echo "❌ Erro ao buscar usuário: " . $e->getMessage() . "<br>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
    exit;
}

echo "<h3>✅ Todos os testes passaram!</h3>";
echo "<p>O auth.php deve funcionar agora.</p>";
?>

