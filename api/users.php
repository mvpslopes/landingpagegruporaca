<?php
/**
 * Gerenciamento de Usuários (apenas ROOT)
 */

require_once 'config.php';
require_once 'permissions_db.php';

$user = requireAuth();

// Verificar se é ROOT
if (($user['role'] ?? '') !== 'root') {
    jsonError('Apenas ROOT pode gerenciar usuários', 403);
}

// GET: Listar todos os usuários
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $users = loadUsers();
    
    // Remover senhas antes de retornar
    foreach ($users as &$u) {
        unset($u['password']);
    }
    
    jsonResponse(['users' => $users]);
}

// POST: Criar novo usuário
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $required = ['email', 'password', 'name', 'role'];
    foreach ($required as $field) {
        if (empty($data[$field] ?? '')) {
            jsonError("Campo obrigatório: $field");
        }
    }
    
    $result = createUser($user, [
        'email' => $data['email'],
        'password' => $data['password'],
        'name' => $data['name'],
        'role' => $data['role'],
        'folder' => $data['folder'] ?? ''
    ]);
    
    if ($result['success']) {
        jsonResponse($result);
    } else {
        jsonError($result['error'] ?? 'Erro ao criar usuário', 400);
    }
}

// DELETE: Deletar usuário
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $userId = $_GET['id'] ?? null;
    
    if (!$userId) {
        jsonError('ID do usuário é obrigatório');
    }
    
    $result = deleteUser($user, $userId);
    
    if ($result['success']) {
        jsonResponse(['success' => true, 'message' => 'Usuário deletado com sucesso']);
    } else {
        jsonError($result['error'] ?? 'Erro ao deletar usuário', 400);
    }
}

// PUT: Atualizar permissões
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $userId = $data['id'] ?? null;
    $permissions = $data['permissions'] ?? [];
    
    if (!$userId) {
        jsonError('ID do usuário é obrigatório');
    }
    
    $result = updateUserPermissions($user, $userId, $permissions);
    
    if ($result['success']) {
        jsonResponse($result);
    } else {
        jsonError($result['error'] ?? 'Erro ao atualizar permissões', 400);
    }
}

jsonError('Método não permitido', 405);
?>

