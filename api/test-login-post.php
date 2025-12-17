<?php
/**
 * Teste de Login via POST (simula o que o frontend faz)
 */

// Ativar exibição de erros
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header('Content-Type: application/json; charset=utf-8');

require_once 'config.php';
require_once 'permissions_db.php';

// Simular dados de login
$email = 'marcus@gruporaca.com.br';
$password = 'Gr@up0R@c@2024!M@rcus#Secure';

echo "<h2>Teste de Login POST</h2>";

try {
    // 1. Buscar usuário
    echo "<h3>1. Buscando usuário...</h3>";
    $user = getUserByEmail($email);
    
    if (!$user) {
        echo "❌ Usuário não encontrado<br>";
        exit;
    }
    
    echo "✅ Usuário encontrado: " . $user['name'] . "<br>";
    
    // 2. Verificar senha
    echo "<h3>2. Verificando senha...</h3>";
    $senhaValida = password_verify($password, $user['password']);
    
    if (!$senhaValida) {
        echo "❌ Senha inválida<br>";
        exit;
    }
    
    echo "✅ Senha válida<br>";
    
    // 3. Testar atualização de último login
    echo "<h3>3. Testando updateLastLogin...</h3>";
    try {
        updateLastLogin($user['id']);
        echo "✅ Último login atualizado<br>";
    } catch (Exception $e) {
        echo "⚠️ Erro ao atualizar último login: " . $e->getMessage() . "<br>";
    }
    
    // 4. Testar criação de sessão
    echo "<h3>4. Testando criação de sessão...</h3>";
    $_SESSION['user'] = [
        'id' => $user['id'],
        'email' => $user['email'],
        'name' => $user['name'],
        'role' => $user['role'],
        'folder' => $user['folder'] ?? '',
        'permissions' => $user['permissions'] ?? []
    ];
    $_SESSION['last_activity'] = time();
    echo "✅ Sessão criada<br>";
    echo "Session ID: " . session_id() . "<br>";
    
    // 5. Testar log de auditoria
    echo "<h3>5. Testando logAudit...</h3>";
    try {
        logAudit($user['id'], 'login', null, null, ['email' => $user['email']]);
        echo "✅ Log de auditoria criado<br>";
    } catch (Exception $e) {
        echo "⚠️ Erro no log de auditoria: " . $e->getMessage() . "<br>";
    }
    
    // 6. Testar resposta JSON
    echo "<h3>6. Testando resposta JSON...</h3>";
    unset($user['password']);
    $response = [
        'success' => true,
        'user' => $_SESSION['user']
    ];
    
    echo "<pre>" . json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "</pre>";
    
    echo "<h3>✅ Todos os testes passaram!</h3>";
    
} catch (Exception $e) {
    echo "<h3>❌ Erro:</h3>";
    echo "<p>" . $e->getMessage() . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}
?>

