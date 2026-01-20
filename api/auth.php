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
    
    // Permitir acesso a todos os usuários ativos
    // O sistema de permissões (hasPermission) vai controlar o que cada role pode fazer
    // ROOT: acesso total
    // ADMIN: acesso ao sistema interno (sem gerenciar usuários)
    // USER: acesso limitado à própria pasta (conforme permissões no banco)
    
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
            // Primeiro, encerrar qualquer sessão antiga do mesmo usuário que ainda esteja aberta
            $stmt = $conn->prepare("
                UPDATE internal_sessions 
                SET logout_time = NOW(),
                    session_duration = TIMESTAMPDIFF(SECOND, login_time, NOW())
                WHERE user_id = ? AND logout_time IS NULL
            ");
            $stmt->execute([$user['id']]);
            
            // Agora criar nova sessão
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
    $userId = null;
    $sessionId = null;
    
    if (isset($_SESSION['user'])) {
        $userId = $_SESSION['user']['id'];
        $sessionId = $_SESSION['internal_session_id'] ?? null;
        
        try {
            logAudit($userId, 'logout', null, null, []);
        } catch (Exception $e) {
            error_log("Erro no log de auditoria: " . $e->getMessage());
        }
    }
    
    // Sempre tentar encerrar a sessão no banco, mesmo se a sessão PHP já foi destruída
    if ($sessionId || $userId) {
        try {
            require_once 'db_config.php';
            $conn = getDBConnection();
            if ($conn) {
                if ($sessionId) {
                    // Tentar encerrar sessão específica
                    $stmt = $conn->prepare("
                        UPDATE internal_sessions 
                        SET logout_time = NOW(),
                            session_duration = TIMESTAMPDIFF(SECOND, login_time, NOW())
                        WHERE id = ? AND logout_time IS NULL
                    ");
                    $stmt->execute([$sessionId]);
                } else if ($userId) {
                    // Se não tiver session_id mas tiver user_id, encerrar todas as sessões abertas do usuário
                    $stmt = $conn->prepare("
                        UPDATE internal_sessions 
                        SET logout_time = NOW(),
                            session_duration = TIMESTAMPDIFF(SECOND, login_time, NOW())
                        WHERE user_id = ? AND logout_time IS NULL
                    ");
                    $stmt->execute([$userId]);
                }
            }
        } catch (Exception $e) {
            error_log("Erro ao atualizar sessão interna: " . $e->getMessage());
        }
    }
    
    // Sempre destruir a sessão PHP, mesmo se não houver usuário na sessão
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_destroy();
    }
    
    jsonResponse(['success' => true, 'message' => 'Logout realizado com sucesso']);
}

// Rota: GET /api/auth.php?action=check
if ($_SERVER['REQUEST_METHOD'] === 'GET' && ($_GET['action'] ?? '') === 'check') {
    // Limpar sessões expiradas no banco automaticamente (executa a cada verificação)
    try {
        require_once 'db_config.php';
        $conn = getDBConnection();
        if ($conn) {
            // Encerrar sessões que estão abertas há mais de SESSION_TIMEOUT segundos
            $stmt = $conn->prepare("
                UPDATE internal_sessions 
                SET logout_time = NOW(),
                    session_duration = TIMESTAMPDIFF(SECOND, login_time, NOW())
                WHERE logout_time IS NULL 
                AND TIMESTAMPDIFF(SECOND, login_time, NOW()) > ?
            ");
            $stmt->execute([SESSION_TIMEOUT]);
        }
    } catch (Exception $e) {
        error_log("Erro ao limpar sessões expiradas automaticamente: " . $e->getMessage());
    }
    
    // Verificar timeout de sessão
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > SESSION_TIMEOUT) {
        // Encerrar sessão no banco de dados antes de destruir a sessão PHP
        if (isset($_SESSION['internal_session_id'])) {
            try {
                require_once 'db_config.php';
                $conn = getDBConnection();
                if ($conn) {
                    $stmt = $conn->prepare("
                        UPDATE internal_sessions 
                        SET logout_time = NOW(),
                            session_duration = TIMESTAMPDIFF(SECOND, login_time, NOW())
                        WHERE id = ? AND logout_time IS NULL
                    ");
                    $stmt->execute([$_SESSION['internal_session_id']]);
                }
            } catch (Exception $e) {
                error_log("Erro ao encerrar sessão expirada no banco: " . $e->getMessage());
            }
        }
        session_destroy();
        jsonError('Sessão expirada por inatividade', 401);
    }
    
    if (isset($_SESSION['user'])) {
        $_SESSION['last_activity'] = time();
        jsonResponse([
            'authenticated' => true,
            'user' => $_SESSION['user'],
            'last_activity' => $_SESSION['last_activity'],
            'timeout' => SESSION_TIMEOUT
        ]);
    } else {
        jsonResponse([
            'authenticated' => false
        ]);
    }
}

// Rota: POST /api/auth.php?action=cleanup_expired
// Limpa sessões expiradas no banco de dados (pode ser chamado periodicamente)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_GET['action'] ?? '') === 'cleanup_expired') {
    requireAuth(); // Apenas usuários autenticados podem executar
    
    try {
        require_once 'db_config.php';
        $conn = getDBConnection();
        if ($conn) {
            // Encerrar sessões que estão abertas há mais de SESSION_TIMEOUT segundos
            $stmt = $conn->prepare("
                UPDATE internal_sessions 
                SET logout_time = NOW(),
                    session_duration = TIMESTAMPDIFF(SECOND, login_time, NOW())
                WHERE logout_time IS NULL 
                AND TIMESTAMPDIFF(SECOND, login_time, NOW()) > ?
            ");
            $stmt->execute([SESSION_TIMEOUT]);
            $affected = $stmt->rowCount();
            
            jsonResponse([
                'success' => true,
                'message' => "Sessões expiradas encerradas: {$affected}",
                'cleaned' => $affected
            ]);
        } else {
            jsonError('Erro ao conectar ao banco de dados', 500);
        }
    } catch (Exception $e) {
        error_log("Erro ao limpar sessões expiradas: " . $e->getMessage());
        jsonError('Erro ao limpar sessões expiradas: ' . $e->getMessage(), 500);
    }
}

// Se chegou aqui, nenhuma ação foi correspondida
ob_clean(); // Limpar qualquer output anterior
jsonError('Ação inválida', 400);
?>

