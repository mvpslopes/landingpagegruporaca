<?php
/**
 * Autenticação de Usuários
 */

// Ativar exibição de erros em desenvolvimento
if (file_exists(__DIR__ . '/.local')) {
    error_reporting(E_ALL);
    ini_set('display_errors', 0); // Desabilitar display para não quebrar JSON
    ini_set('display_startup_errors', 0);
    ini_set('log_errors', 1);
}

// Iniciar output buffering para capturar erros
ob_start();

require_once 'config.php';
require_once 'permissions_db.php';

// Rota: POST /api/auth.php?action=login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_GET['action'] ?? '') === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        jsonError('Email e senha são obrigatórios');
    }
    
    $user = getUserByEmail($email);
    
    if (!$user || !password_verify($password, $user['password'])) {
        jsonError('Email ou senha incorretos', 401);
    }
    
    // Verificar se o usuário tem permissão para acessar o sistema interno
    // Apenas admin e root podem acessar
    if ($user['role'] !== 'admin' && $user['role'] !== 'root') {
        jsonError('Você não tem permissão de acesso habilitada. Apenas administradores podem acessar o sistema interno.', 403);
    }
    
    // Atualizar último login
    try {
        updateLastLogin($user['id']);
    } catch (Exception $e) {
        error_log("Erro ao atualizar último login: " . $e->getMessage());
    }
    
    // Criar sessão
    $_SESSION['user'] = [
        'id' => $user['id'],
        'email' => $user['email'],
        'name' => $user['name'],
        'role' => $user['role'],
        'folder' => $user['folder'] ?? '',
        'permissions' => $user['permissions'] ?? []
    ];
    
    $_SESSION['last_activity'] = time();
    
    // Log de auditoria
    try {
        logAudit($user['id'], 'login', null, null, ['email' => $user['email']]);
    } catch (Exception $e) {
        error_log("Erro no log de auditoria: " . $e->getMessage());
    }
    
    // Registrar sessão do sistema interno
    try {
        require_once 'db_config.php';
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
        
        $conn = getDBConnection();
        if ($conn) {
            $stmt = $conn->prepare("
                INSERT INTO internal_sessions 
                (user_id, email, name, role, ip_address, user_agent, login_time)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $user['id'],
                $user['email'],
                $user['name'],
                $user['role'],
                $ipAddress,
                $userAgent
            ]);
            
            // Salvar ID da sessão interna para usar no logout
            $_SESSION['internal_session_id'] = $conn->lastInsertId();
        }
    } catch (Exception $e) {
        error_log("Erro ao registrar sessão interna: " . $e->getMessage());
    }
    
    // Remover senha antes de retornar
    unset($user['password']);
    
    jsonResponse([
        'success' => true,
        'user' => $_SESSION['user']
    ]);
}

// Rota: POST /api/auth.php?action=logout
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_GET['action'] ?? '') === 'logout') {
    if (isset($_SESSION['user'])) {
        try {
            logAudit($_SESSION['user']['id'], 'logout', null, null, []);
        } catch (Exception $e) {
            error_log("Erro no log de auditoria: " . $e->getMessage());
        }
        
        // Atualizar sessão interna com logout_time e calcular duração
        if (isset($_SESSION['internal_session_id'])) {
            try {
                require_once 'db_config.php';
                $conn = getDBConnection();
                if ($conn) {
                    $stmt = $conn->prepare("
                        UPDATE internal_sessions 
                        SET logout_time = NOW(),
                            session_duration = TIMESTAMPDIFF(SECOND, login_time, NOW())
                        WHERE id = ?
                    ");
                    $stmt->execute([$_SESSION['internal_session_id']]);
                }
            } catch (Exception $e) {
                error_log("Erro ao atualizar sessão interna: " . $e->getMessage());
            }
        }
    }
    session_destroy();
    jsonResponse(['success' => true, 'message' => 'Logout realizado com sucesso']);
}

// Rota: GET /api/auth.php?action=check
if ($_SERVER['REQUEST_METHOD'] === 'GET' && ($_GET['action'] ?? '') === 'check') {
    // Verificar timeout de sessão
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > SESSION_TIMEOUT) {
        session_destroy();
        jsonError('Sessão expirada', 401);
    }
    
    if (isset($_SESSION['user'])) {
        $_SESSION['last_activity'] = time();
        jsonResponse([
            'authenticated' => true,
            'user' => $_SESSION['user']
        ]);
    } else {
        jsonResponse([
            'authenticated' => false
        ]);
    }
}

// Se chegou aqui, nenhuma ação foi correspondida
ob_clean(); // Limpar qualquer output anterior
jsonError('Ação inválida', 400);
?>

