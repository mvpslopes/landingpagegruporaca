<?php
/**
 * Teste de Autenticação - Simula exatamente o que auth.php faz
 * Acesse: https://todaarte.com.br/api/test-auth-producao.php
 */

// Iniciar output buffering
ob_start();

require_once 'config.php';
require_once 'permissions_db.php';

header('Content-Type: application/json; charset=utf-8');

$result = [
    'success' => false,
    'errors' => [],
    'info' => [],
    'session_info' => []
];

try {
    // 1. Verificar se sessão está funcionando
    $result['info'][] = '✅ Sessão iniciada: ' . (session_status() === PHP_SESSION_ACTIVE ? 'SIM' : 'NÃO');
    $result['session_info']['session_id'] = session_id();
    $result['session_info']['session_name'] = session_name();
    
    // 2. Simular login (igual ao auth.php)
    $email = 'marcus@todaarte.com.br';
    $password = 'Gr@up0R@c@2024!M@rcus#Secure';
    
    $result['info'][] = 'Testando login com: ' . $email;
    
    // 3. Buscar usuário
    $user = getUserByEmail($email);
    
    if (!$user) {
        $result['errors'][] = '❌ Usuário não encontrado';
        ob_clean();
        echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    $result['info'][] = '✅ Usuário encontrado: ' . $user['name'];
    
    // 4. Verificar senha
    if (!password_verify($password, $user['password'])) {
        $result['errors'][] = '❌ Senha incorreta';
        ob_clean();
        echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    $result['info'][] = '✅ Senha verificada';
    
    // 5. Criar sessão (igual ao auth.php)
    $_SESSION['user'] = [
        'id' => $user['id'],
        'email' => $user['email'],
        'name' => $user['name'],
        'role' => $user['role'],
        'folder' => $user['folder'] ?? '',
        'permissions' => $user['permissions'] ?? []
    ];
    
    $_SESSION['last_activity'] = time();
    
    $result['info'][] = '✅ Sessão criada com sucesso';
    $result['session_info']['user_in_session'] = $_SESSION['user'];
    
    // 6. Retornar resposta (igual ao auth.php)
    unset($user['password']);
    
    $result['success'] = true;
    $result['user'] = $_SESSION['user'];
    $result['info'][] = '✅ Login completo - tudo funcionando!';
    
} catch (Exception $e) {
    $result['errors'][] = 'Erro: ' . $e->getMessage();
    $result['errors'][] = 'Trace: ' . $e->getTraceAsString();
}

ob_clean();
echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>

