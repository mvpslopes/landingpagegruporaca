<?php
/**
 * Teste completo do login - Simula exatamente o que o frontend faz
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Tratar OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

echo "{\n";
echo "  \"test\": \"Iniciando teste completo...\",\n";

try {
    echo "  \"step1\": \"Carregando config.php...\",\n";
    require_once 'config.php';
    echo "  \"step1_result\": \"✅ config.php carregado\",\n";
    
    echo "  \"step2\": \"Carregando permissions_db.php...\",\n";
    require_once 'permissions_db.php';
    echo "  \"step2_result\": \"✅ permissions_db.php carregado\",\n";
    
    echo "  \"step3\": \"Testando conexão com banco...\",\n";
    $conn = getDBConnection();
    echo "  \"step3_result\": \"✅ Conexão estabelecida\",\n";
    
    echo "  \"step4\": \"Buscando usuário...\",\n";
    $user = getUserByEmail('marcus@gruporaca.com.br');
    if (!$user) {
        echo "  \"step4_result\": \"❌ Usuário não encontrado\"\n";
        exit;
    }
    echo "  \"step4_result\": \"✅ Usuário encontrado: " . $user['name'] . "\",\n";
    
    echo "  \"step5\": \"Verificando senha...\",\n";
    $senhaValida = password_verify('Gr@up0R@c@2024!M@rcus#Secure', $user['password']);
    if (!$senhaValida) {
        echo "  \"step5_result\": \"❌ Senha inválida\"\n";
        exit;
    }
    echo "  \"step5_result\": \"✅ Senha válida\",\n";
    
    echo "  \"step6\": \"Testando updateLastLogin...\",\n";
    try {
        updateLastLogin($user['id']);
        echo "  \"step6_result\": \"✅ updateLastLogin OK\",\n";
    } catch (Exception $e) {
        echo "  \"step6_result\": \"⚠️ Erro: " . $e->getMessage() . "\",\n";
    }
    
    echo "  \"step7\": \"Criando sessão...\",\n";
    $_SESSION['user'] = [
        'id' => $user['id'],
        'email' => $user['email'],
        'name' => $user['name'],
        'role' => $user['role'],
        'folder' => $user['folder'] ?? '',
        'permissions' => $user['permissions'] ?? []
    ];
    $_SESSION['last_activity'] = time();
    echo "  \"step7_result\": \"✅ Sessão criada\",\n";
    
    echo "  \"step8\": \"Testando logAudit...\",\n";
    try {
        logAudit($user['id'], 'login', null, null, ['email' => $user['email']]);
        echo "  \"step8_result\": \"✅ logAudit OK\",\n";
    } catch (Exception $e) {
        echo "  \"step8_result\": \"⚠️ Erro: " . $e->getMessage() . "\",\n";
    }
    
    echo "  \"step9\": \"Criando resposta JSON...\",\n";
    unset($user['password']);
    $response = [
        'success' => true,
        'user' => $_SESSION['user']
    ];
    
    echo "  \"step9_result\": \"✅ JSON criado\",\n";
    echo "  \"final_response\": " . json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    echo "}\n";
    
} catch (Throwable $e) {
    echo "  \"error\": true,\n";
    echo "  \"message\": \"" . addslashes($e->getMessage()) . "\",\n";
    echo "  \"file\": \"" . $e->getFile() . "\",\n";
    echo "  \"line\": " . $e->getLine() . ",\n";
    echo "  \"trace\": \"" . addslashes($e->getTraceAsString()) . "\"\n";
    echo "}\n";
}
?>

