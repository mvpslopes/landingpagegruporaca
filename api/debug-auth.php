<?php
/**
 * Debug do auth.php - Mostra erros completos
 */

// Ativar TODOS os erros
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
ini_set('log_errors', 1);

// Headers para JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Tratar OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Incluir dependências
    require_once 'config.php';
    require_once 'permissions_db.php';
    
    // Simular requisição de check (GET)
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && ($_GET['action'] ?? '') === 'check') {
        // Verificar timeout de sessão
        if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > SESSION_TIMEOUT) {
            session_destroy();
            echo json_encode(['error' => 'Sessão expirada'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        
        if (isset($_SESSION['user'])) {
            $_SESSION['last_activity'] = time();
            echo json_encode([
                'authenticated' => true,
                'user' => $_SESSION['user']
            ], JSON_UNESCAPED_UNICODE);
            exit;
        } else {
            echo json_encode([
                'authenticated' => false
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
    
    // Simular requisição de login (POST)
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_GET['action'] ?? '') === 'login') {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode([
                'error' => 'JSON inválido: ' . json_last_error_msg(),
                'input' => $input
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        
        if (empty($email) || empty($password)) {
            echo json_encode(['error' => 'Email e senha são obrigatórios'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        
        $user = getUserByEmail($email);
        
        if (!$user) {
            echo json_encode(['error' => 'Email ou senha incorretos'], JSON_UNESCAPED_UNICODE);
            http_response_code(401);
            exit;
        }
        
        if (!password_verify($password, $user['password'])) {
            echo json_encode(['error' => 'Email ou senha incorretos'], JSON_UNESCAPED_UNICODE);
            http_response_code(401);
            exit;
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
        
        // Remover senha antes de retornar
        unset($user['password']);
        
        echo json_encode([
            'success' => true,
            'user' => $_SESSION['user']
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    echo json_encode(['error' => 'Ação inválida'], JSON_UNESCAPED_UNICODE);
    http_response_code(400);
    
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Erro interno do servidor',
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ], JSON_UNESCAPED_UNICODE);
}
?>

