<?php
/**
 * Configuração do Sistema de Banco de Dados - Grupo Raça
 */

// Configurações de segurança
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Tratar requisições OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configurações
define('USERS_FILE', __DIR__ . '/data/users.json');
define('METADATA_DIR', __DIR__ . '/data/metadata');
define('SESSION_TIMEOUT', 300); // 5 minutos

// Criar diretórios se não existirem
if (!file_exists(__DIR__ . '/data')) {
    mkdir(__DIR__ . '/data', 0755, true);
}
if (!file_exists(METADATA_DIR)) {
    mkdir(METADATA_DIR, 0755, true);
}

// Iniciar sessão
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Função para resposta JSON
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// Função para resposta de erro
function jsonError($message, $statusCode = 400) {
    jsonResponse(['error' => $message], $statusCode);
}

// Função para validar autenticação
function requireAuth() {
    if (!isset($_SESSION['user'])) {
        jsonError('Não autenticado', 401);
    }
    return $_SESSION['user'];
}
?>

