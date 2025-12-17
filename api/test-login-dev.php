<?php
/**
 * Teste de Login - Modo Desenvolvimento
 * Acesse: http://localhost/api/test-login-dev.php
 */

require_once 'db_config.php';
require_once 'permissions_db.php';

header('Content-Type: application/json; charset=utf-8');

// Usuário ROOT padrão para testes em produção
$email = 'marcus@todaarte.com.br';
$senha = 'Gr@up0R@c@2024!M@rcus#Secure';

$result = [
    'success' => false,
    'errors' => [],
    'info' => []
];

try {
    // 1. Verificar conexão
    $conn = getDBConnection();
    $result['info'][] = '✅ Conexão com banco estabelecida';
    
    // 2. Buscar usuário
    $user = getUserByEmail($email);
    
    if (!$user) {
        $result['errors'][] = '❌ Usuário não encontrado no banco';
        echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    $result['info'][] = '✅ Usuário encontrado: ' . $user['name'];
    $result['info'][] = 'Role: ' . $user['role'];
    
    // 3. Verificar senha
    $verificado = password_verify($senha, $user['password']);
    
    if ($verificado) {
        $result['success'] = true;
        $result['info'][] = '✅ Senha verificada com sucesso!';
        $result['user'] = [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'role' => $user['role']
        ];
    } else {
        $result['errors'][] = '❌ Senha não confere com o hash no banco';
        $result['info'][] = 'Hash no banco: ' . substr($user['password'], 0, 30) . '...';
        
        // Gerar novo hash
        $novoHash = password_hash($senha, PASSWORD_BCRYPT);
        $result['info'][] = 'Novo hash gerado (use este para atualizar): ' . $novoHash;
        
        // Atualizar automaticamente
        $stmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
        $stmt->execute([$novoHash, $email]);
        
        if ($stmt->rowCount() > 0) {
            $result['info'][] = '✅ Hash atualizado automaticamente no banco!';
            $result['success'] = true;
        }
    }
    
} catch (Exception $e) {
    $result['errors'][] = 'Erro: ' . $e->getMessage();
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>

