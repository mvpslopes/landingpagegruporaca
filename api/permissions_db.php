<?php
/**
 * Sistema de Permissões - 3 Níveis de Acesso (MySQL)
 * ROOT, ADMIN, USER
 */

require_once 'config.php';
require_once 'db_config.php';

/**
 * Carregar todos os usuários do banco
 */
function loadUsers() {
    try {
        $conn = getDBConnection();
        $stmt = $conn->prepare("SELECT * FROM users WHERE active = 1 ORDER BY id ASC");
        $stmt->execute();
        $users = $stmt->fetchAll();
        
        // Decodificar JSON de permissões
        foreach ($users as &$user) {
            if ($user['permissions']) {
                $user['permissions'] = json_decode($user['permissions'], true);
            } else {
                $user['permissions'] = [];
            }
        }
        
        return $users;
    } catch (PDOException $e) {
        error_log("Erro ao carregar usuários: " . $e->getMessage());
        return [];
    }
}

/**
 * Buscar usuário por email
 */
function getUserByEmail($email) {
    try {
        $conn = getDBConnection();
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? AND active = 1 LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if ($user && $user['permissions']) {
            $user['permissions'] = json_decode($user['permissions'], true);
        } else {
            $user['permissions'] = [];
        }
        
        return $user ?: null;
    } catch (PDOException $e) {
        error_log("Erro ao buscar usuário: " . $e->getMessage());
        return null;
    }
}

/**
 * Buscar usuário por ID
 */
function getUserById($id) {
    try {
        $conn = getDBConnection();
        $stmt = $conn->prepare("SELECT * FROM users WHERE id = ? AND active = 1 LIMIT 1");
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        
        if ($user && $user['permissions']) {
            $user['permissions'] = json_decode($user['permissions'], true);
        } else {
            $user['permissions'] = [];
        }
        
        return $user ?: null;
    } catch (PDOException $e) {
        error_log("Erro ao buscar usuário: " . $e->getMessage());
        return null;
    }
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
    
    try {
        $conn = getDBConnection();
        
        // Verificar se email já existe
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$userData['email']]);
        if ($stmt->fetch()) {
            return ['success' => false, 'error' => 'Email já cadastrado'];
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
        
        // Hash da senha
        $passwordHash = password_hash($userData['password'], PASSWORD_BCRYPT);
        
        // Inserir usuário
        $stmt = $conn->prepare("
            INSERT INTO users (email, password, name, role, folder, permissions, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $userData['email'],
            $passwordHash,
            $userData['name'],
            $userData['role'] ?? 'user',
            $userData['folder'] ?? '',
            json_encode($permissions),
            $rootUser['id']
        ]);
        
        $userId = $conn->lastInsertId();
        
        // Buscar usuário criado
        $newUser = getUserById($userId);
        unset($newUser['password']);
        
        // Log de auditoria
        logAudit($rootUser['id'], 'create_user', 'user', $userId, [
            'email' => $userData['email'],
            'name' => $userData['name'],
            'role' => $userData['role']
        ]);
        
        return ['success' => true, 'user' => $newUser];
    } catch (PDOException $e) {
        error_log("Erro ao criar usuário: " . $e->getMessage());
        return ['success' => false, 'error' => 'Erro ao criar usuário no banco de dados'];
    }
}

/**
 * Deletar usuário (apenas ROOT)
 */
function deleteUser($rootUser, $userId) {
    // Apenas ROOT pode deletar usuários
    if (($rootUser['role'] ?? '') !== 'root') {
        return ['success' => false, 'error' => 'Apenas ROOT pode deletar usuários'];
    }
    
    try {
        $conn = getDBConnection();
        
        // Verificar se é ROOT
        $stmt = $conn->prepare("SELECT role FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            return ['success' => false, 'error' => 'Usuário não encontrado'];
        }
        
        if ($user['role'] === 'root') {
            return ['success' => false, 'error' => 'Não é possível deletar o usuário ROOT'];
        }
        
        // Soft delete (marcar como inativo)
        $stmt = $conn->prepare("UPDATE users SET active = 0 WHERE id = ?");
        $stmt->execute([$userId]);
        
        // Log de auditoria
        logAudit($rootUser['id'], 'delete_user', 'user', $userId, []);
        
        return ['success' => true];
    } catch (PDOException $e) {
        error_log("Erro ao deletar usuário: " . $e->getMessage());
        return ['success' => false, 'error' => 'Erro ao deletar usuário'];
    }
}

/**
 * Atualizar permissões de usuário (apenas ROOT)
 */
function updateUserPermissions($rootUser, $userId, $permissions) {
    // Apenas ROOT pode editar permissões
    if (($rootUser['role'] ?? '') !== 'root') {
        return ['success' => false, 'error' => 'Apenas ROOT pode editar permissões'];
    }
    
    try {
        $conn = getDBConnection();
        
        // Verificar se é ROOT
        $stmt = $conn->prepare("SELECT role, permissions FROM users WHERE id = ? AND active = 1 LIMIT 1");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            return ['success' => false, 'error' => 'Usuário não encontrado'];
        }
        
        if ($user['role'] === 'root') {
            return ['success' => false, 'error' => 'Não é possível editar permissões do ROOT'];
        }
        
        // Mesclar permissões existentes com novas
        $currentPermissions = json_decode($user['permissions'], true) ?? [];
        $updatedPermissions = array_merge($currentPermissions, $permissions);
        
        // Atualizar
        $stmt = $conn->prepare("UPDATE users SET permissions = ? WHERE id = ?");
        $stmt->execute([json_encode($updatedPermissions), $userId]);
        
        // Buscar usuário atualizado
        $updatedUser = getUserById($userId);
        unset($updatedUser['password']);
        
        // Log de auditoria
        logAudit($rootUser['id'], 'update_permissions', 'user', $userId, ['permissions' => $permissions]);
        
        return ['success' => true, 'user' => $updatedUser];
    } catch (PDOException $e) {
        error_log("Erro ao atualizar permissões: " . $e->getMessage());
        return ['success' => false, 'error' => 'Erro ao atualizar permissões'];
    }
}

/**
 * Atualizar último login do usuário
 */
function updateLastLogin($userId) {
    try {
        $conn = getDBConnection();
        $stmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$userId]);
    } catch (PDOException $e) {
        error_log("Erro ao atualizar último login: " . $e->getMessage());
    }
}

/**
 * Log de auditoria
 */
function logAudit($userId, $action, $resourceType = null, $resourceId = null, $details = []) {
    try {
        $conn = getDBConnection();
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
        
        $stmt = $conn->prepare("
            INSERT INTO audit_log (user_id, action, resource_type, resource_id, details, ip_address)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $userId,
            $action,
            $resourceType,
            $resourceId,
            json_encode($details),
            $ipAddress
        ]);
    } catch (PDOException $e) {
        error_log("Erro ao registrar log de auditoria: " . $e->getMessage());
    }
}
?>

