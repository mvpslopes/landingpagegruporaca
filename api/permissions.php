<?php
/**
 * Sistema de Permissões - 3 Níveis de Acesso
 * ROOT, ADMIN, USER
 */

require_once 'config.php';

/**
 * Carregar usuários do arquivo JSON
 */
function loadUsers() {
    if (!file_exists(USERS_FILE)) {
        return [];
    }
    $data = json_decode(file_get_contents(USERS_FILE), true);
    return $data['users'] ?? [];
}

/**
 * Salvar usuários no arquivo JSON
 */
function saveUsers($users) {
    $data = ['users' => $users];
    file_put_contents(USERS_FILE, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

/**
 * Buscar usuário por email
 */
function getUserByEmail($email) {
    $users = loadUsers();
    foreach ($users as $user) {
        if ($user['email'] === $email) {
            return $user;
        }
    }
    return null;
}

/**
 * Buscar usuário por ID
 */
function getUserById($id) {
    $users = loadUsers();
    foreach ($users as $user) {
        if ($user['id'] == $id) {
            return $user;
        }
    }
    return null;
}

/**
 * Verificar se usuário tem permissão para uma ação
 */
function hasPermission($user, $action, $folder = null) {
    if (!$user) {
        return false;
    }
    
    $role = $user['role'] ?? 'user';
    
    // ROOT tem acesso total
    if ($role === 'root') {
        return true;
    }
    
    // ADMIN tem acesso a tudo exceto gerenciar usuários
    if ($role === 'admin') {
        if ($action === 'manage_users' || $action === 'manage_permissions') {
            return false;
        }
        return true;
    }
    
    // USER - verificar permissões específicas
    if ($role === 'user') {
        // USER não pode deletar
        if ($action === 'delete') {
            return false;
        }
        
        // USER não pode gerenciar usuários
        if ($action === 'manage_users' || $action === 'manage_permissions') {
            return false;
        }
        
        // USER só acessa sua própria pasta
        $userFolder = $user['folder'] ?? '';
        if ($folder && $folder !== $userFolder && $folder !== '*') {
            return false;
        }
        
        // Verificar permissão específica
        $permissions = $user['permissions'] ?? [];
        return $permissions[$action] ?? false;
    }
    
    return false;
}

/**
 * Verificar se usuário pode acessar uma pasta
 */
function canAccessFolder($user, $folder) {
    if (!$user) {
        return false;
    }
    
    $role = $user['role'] ?? 'user';
    $userFolder = $user['folder'] ?? '';
    
    // ROOT e ADMIN acessam todas as pastas
    if ($role === 'root' || $role === 'admin') {
        return true;
    }
    
    // USER só acessa sua própria pasta
    if ($role === 'user') {
        return $folder === $userFolder || $folder === '*';
    }
    
    return false;
}

/**
 * Criar novo usuário (apenas ROOT)
 */
function createUser($rootUser, $userData) {
    // Apenas ROOT pode criar usuários
    if (($rootUser['role'] ?? '') !== 'root') {
        return ['success' => false, 'error' => 'Apenas ROOT pode criar usuários'];
    }
    
    $users = loadUsers();
    
    // Verificar se email já existe
    foreach ($users as $user) {
        if ($user['email'] === $userData['email']) {
            return ['success' => false, 'error' => 'Email já cadastrado'];
        }
    }
    
    // Gerar novo ID
    $newId = 1;
    foreach ($users as $user) {
        if ($user['id'] >= $newId) {
            $newId = $user['id'] + 1;
        }
    }
    
    // Definir permissões baseadas no role
    $permissions = [];
    if ($userData['role'] === 'user') {
        $permissions = [
            'upload' => true,
            'download' => true,
            'delete' => false,
            'view_all' => false,
            'manage_users' => false,
            'manage_permissions' => false
        ];
    } elseif ($userData['role'] === 'admin') {
        $permissions = [
            'upload' => true,
            'download' => true,
            'delete' => true,
            'view_all' => true,
            'manage_users' => false,
            'manage_permissions' => false
        ];
    }
    
    // Criar novo usuário
    $newUser = [
        'id' => $newId,
        'email' => $userData['email'],
        'password' => password_hash($userData['password'], PASSWORD_BCRYPT),
        'name' => $userData['name'],
        'role' => $userData['role'] ?? 'user',
        'folder' => $userData['folder'] ?? '',
        'permissions' => $permissions,
        'createdAt' => date('c'),
        'createdBy' => $rootUser['email']
    ];
    
    $users[] = $newUser;
    saveUsers($users);
    
    // Remover senha antes de retornar
    unset($newUser['password']);
    
    return ['success' => true, 'user' => $newUser];
}

/**
 * Deletar usuário (apenas ROOT)
 */
function deleteUser($rootUser, $userId) {
    // Apenas ROOT pode deletar usuários
    if (($rootUser['role'] ?? '') !== 'root') {
        return ['success' => false, 'error' => 'Apenas ROOT pode deletar usuários'];
    }
    
    $users = loadUsers();
    
    // Não permitir deletar o próprio ROOT
    foreach ($users as $key => $user) {
        if ($user['id'] == $userId) {
            if (($user['role'] ?? '') === 'root') {
                return ['success' => false, 'error' => 'Não é possível deletar o usuário ROOT'];
            }
            unset($users[$key]);
            break;
        }
    }
    
    $users = array_values($users); // Reindexar array
    saveUsers($users);
    
    return ['success' => true];
}

/**
 * Atualizar permissões de usuário (apenas ROOT)
 */
function updateUserPermissions($rootUser, $userId, $permissions) {
    // Apenas ROOT pode editar permissões
    if (($rootUser['role'] ?? '') !== 'root') {
        return ['success' => false, 'error' => 'Apenas ROOT pode editar permissões'];
    }
    
    $users = loadUsers();
    
    foreach ($users as $key => $user) {
        if ($user['id'] == $userId) {
            // Não permitir editar ROOT
            if (($user['role'] ?? '') === 'root') {
                return ['success' => false, 'error' => 'Não é possível editar permissões do ROOT'];
            }
            
            $users[$key]['permissions'] = array_merge($users[$key]['permissions'] ?? [], $permissions);
            saveUsers($users);
            
            $updatedUser = $users[$key];
            unset($updatedUser['password']);
            
            return ['success' => true, 'user' => $updatedUser];
        }
    }
    
    return ['success' => false, 'error' => 'Usuário não encontrado'];
}
?>

