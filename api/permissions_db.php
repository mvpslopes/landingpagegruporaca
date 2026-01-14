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
    
    // VIEWER - pode ver todas as pastas, baixar, fazer upload, mas não pode deletar nem gerenciar
    if ($role === 'viewer') {
        // VIEWER não pode deletar
        if ($action === 'delete') {
            return false;
        }
        
        // VIEWER não pode gerenciar usuários
        if ($action === 'manage_users' || $action === 'manage_permissions') {
            return false;
        }
        
        // VIEWER pode fazer upload, baixar e visualizar
        if ($action === 'upload' || $action === 'download' || $action === 'view_all') {
            return true;
        }
        
        return false;
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
        
        // USER só acessa sua própria pasta e subpastas
        $userFolder = $user['folder'] ?? '';
        if ($folder && $folder !== '*' && $folder !== $userFolder) {
            // Verificar se é uma subpasta dentro da pasta do usuário
            if (!$userFolder || strpos($folder, $userFolder . '/') !== 0) {
                return false;
            }
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
    
    // ROOT, ADMIN e VIEWER acessam todas as pastas
    if ($role === 'root' || $role === 'admin' || $role === 'viewer') {
        return true;
    }
    
    // USER só acessa sua própria pasta e subpastas
    if ($role === 'user') {
        if ($folder === '*' || $folder === $userFolder) {
            return true;
        }
        // Permitir acesso a subpastas dentro da pasta do usuário
        if ($userFolder && strpos($folder, $userFolder . '/') === 0) {
            return true;
        }
        return false;
    }
    
    return false;
}

/**
 * Verificar se uma pasta está vinculada a um usuário do tipo "user"
 * Retorna true se a pasta está vinculada, false caso contrário
 */
function isFolderLinkedToUser($folderName) {
    if (empty($folderName) || $folderName === '*') {
        return false;
    }
    
    try {
        $conn = getDBConnection();
        
        // Normalizar nome da pasta para comparação (maiúsculas)
        $normalizedFolderName = strtoupper(trim($folderName));
        
        // Buscar usuários do tipo "user" que tenham esta pasta vinculada
        $stmt = $conn->prepare("
            SELECT id, email, name, folder 
            FROM users 
            WHERE role = 'user' 
            AND active = 1 
            AND folder = ?
            LIMIT 1
        ");
        $stmt->execute([$normalizedFolderName]);
        $user = $stmt->fetch();
        
        if ($user) {
            error_log("Pasta '{$normalizedFolderName}' está vinculada ao usuário: {$user['email']} (ID: {$user['id']})");
            return true;
        }
        
        return false;
    } catch (PDOException $e) {
        error_log("Erro ao verificar se pasta está vinculada a usuário: " . $e->getMessage());
        // Em caso de erro, retornar true para ser mais seguro (bloquear)
        return true;
    }
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
        } elseif ($userData['role'] === 'viewer') {
            $permissions = [
                'upload' => true,
                'download' => true,
                'delete' => false,
                'view_all' => true,
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
        
        // Lista de pastas bloqueadas (não criar automaticamente)
        $blockedFolders = ['AQUITEMRACA'];
        
        // Se for usuário "user" e não tiver pasta definida, gerar automaticamente a partir do email
        $userFolder = $userData['folder'] ?? '';
        if (($userData['role'] ?? 'user') === 'user' && empty($userFolder)) {
            // Extrair a parte antes do @ do email
            $emailPrefix = explode('@', $userData['email'])[0];
            // Remover caracteres especiais e converter para MAIÚSCULAS
            $userFolder = strtoupper(preg_replace('/[^a-z0-9]/', '', $emailPrefix));
            
            // Verificar se a pasta está bloqueada
            if (in_array($userFolder, $blockedFolders)) {
                // Não criar pasta automaticamente se estiver bloqueada
                $blockedFolderName = $userFolder;
                $userFolder = '';
                error_log("Pasta bloqueada detectada: {$blockedFolderName}. Pasta não será criada automaticamente.");
            }
        } else if (!empty($userFolder)) {
            // Se a pasta foi fornecida, garantir que está em maiúsculas
            $userFolder = strtoupper(trim($userFolder));
            
            // Verificar se a pasta está bloqueada
            if (in_array($userFolder, $blockedFolders)) {
                return ['success' => false, 'error' => "A pasta '{$userFolder}' está bloqueada e não pode ser usada"];
            }
        }
        
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
            $userFolder,
            json_encode($permissions),
            $rootUser['id']
        ]);
        
        $userId = $conn->lastInsertId();
        
        // Buscar usuário criado
        $newUser = getUserById($userId);
        unset($newUser['password']);
        
        // Criar pasta raiz no Google Drive se o usuário tiver uma pasta definida
        // (userFolder já foi definido acima, pode ser gerado automaticamente ou fornecido)
        // Não criar se a pasta estiver bloqueada
        if ($userData['role'] === 'user' && !empty($userFolder) && $userFolder !== '*' && !in_array($userFolder, $blockedFolders)) {
            try {
                require_once __DIR__ . '/drive_service.php';
                require_once __DIR__ . '/oauth_token_storage.php';
                
                $oauthToken = OAuthTokenStorage::loadToken();
                if ($oauthToken) {
                    $driveService = new DriveService($oauthToken);
                    
                    // Verificar se a pasta já existe
                    $existingFolderId = $driveService->getFolderIdByName($userFolder, $driveService->getRootFolderId());
                    
                    if (!$existingFolderId) {
                        // Criar a pasta na raiz do Google Drive
                        $folderId = $driveService->createFolder($userFolder, $driveService->getRootFolderId());
                        error_log("Pasta raiz criada automaticamente para usuário {$userData['email']}: {$userFolder} (ID: {$folderId})");
                    } else {
                        error_log("Pasta raiz já existe para usuário {$userData['email']}: {$userFolder}");
                    }
                } else {
                    error_log("Aviso: Token OAuth não encontrado. Pasta raiz não foi criada para {$userData['email']}");
                }
            } catch (Exception $e) {
                // Não falhar a criação do usuário se houver erro ao criar a pasta
                // A pasta pode ser criada manualmente depois
                error_log("Erro ao criar pasta raiz para {$userData['email']}: " . $e->getMessage());
            }
        }
        
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
 * Atualizar usuário completo (apenas ROOT)
 */
function updateUser($rootUser, $userId, $userData) {
    // Apenas ROOT pode editar usuários
    if (($rootUser['role'] ?? '') !== 'root') {
        return ['success' => false, 'error' => 'Apenas ROOT pode editar usuários'];
    }
    
    try {
        $conn = getDBConnection();
        
        // Verificar se usuário existe e não é ROOT
        $stmt = $conn->prepare("SELECT id, role, email FROM users WHERE id = ? AND active = 1 LIMIT 1");
        $stmt->execute([$userId]);
        $existingUser = $stmt->fetch();
        
        if (!$existingUser) {
            return ['success' => false, 'error' => 'Usuário não encontrado'];
        }
        
        if ($existingUser['role'] === 'root') {
            return ['success' => false, 'error' => 'Não é possível editar o usuário ROOT'];
        }
        
        // Se o email foi alterado, verificar se já existe
        if (isset($userData['email']) && $userData['email'] !== $existingUser['email']) {
            $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1");
            $stmt->execute([$userData['email'], $userId]);
            if ($stmt->fetch()) {
                return ['success' => false, 'error' => 'Email já cadastrado'];
            }
        }
        
        // Construir query de atualização dinamicamente
        $updateFields = [];
        $updateValues = [];
        
        if (isset($userData['name'])) {
            $updateFields[] = "name = ?";
            $updateValues[] = $userData['name'];
        }
        
        if (isset($userData['email'])) {
            $updateFields[] = "email = ?";
            $updateValues[] = $userData['email'];
        }
        
        if (isset($userData['password']) && !empty($userData['password'])) {
            $updateFields[] = "password = ?";
            $updateValues[] = password_hash($userData['password'], PASSWORD_BCRYPT);
        }
        
        if (isset($userData['role'])) {
            $updateFields[] = "role = ?";
            $updateValues[] = $userData['role'];
            
            // Atualizar permissões baseadas no novo role
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
            } elseif ($userData['role'] === 'viewer') {
                $permissions = [
                    'upload' => true,
                    'download' => true,
                    'delete' => false,
                    'view_all' => true,
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
            
            if (!empty($permissions)) {
                $updateFields[] = "permissions = ?";
                $updateValues[] = json_encode($permissions);
            }
        }
        
        if (isset($userData['folder'])) {
            $updateFields[] = "folder = ?";
            $updateValues[] = strtoupper(trim($userData['folder']));
        }
        
        if (empty($updateFields)) {
            return ['success' => false, 'error' => 'Nenhum campo para atualizar'];
        }
        
        // Adicionar ID ao final dos valores
        $updateValues[] = $userId;
        
        // Executar atualização
        $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute($updateValues);
        
        // Buscar usuário atualizado
        $updatedUser = getUserById($userId);
        unset($updatedUser['password']);
        
        // Log de auditoria
        logAudit($rootUser['id'], 'update_user', 'user', $userId, [
            'updated_fields' => array_keys($userData)
        ]);
        
        return ['success' => true, 'user' => $updatedUser];
    } catch (PDOException $e) {
        error_log("Erro ao atualizar usuário: " . $e->getMessage());
        return ['success' => false, 'error' => 'Erro ao atualizar usuário no banco de dados'];
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

