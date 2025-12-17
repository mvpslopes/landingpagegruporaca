<?php
/**
 * Teste do auth.php - Simula exatamente o que o proxy do Vite faz
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Simular OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

echo json_encode([
    'test' => 'Iniciando teste do auth.php',
    'method' => $_SERVER['REQUEST_METHOD'],
    'action' => $_GET['action'] ?? 'nenhuma',
    'server_name' => $_SERVER['SERVER_NAME'] ?? 'não definido',
    'http_host' => $_SERVER['HTTP_HOST'] ?? 'não definido'
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

echo "\n\n---\n\n";

// Agora testar o auth.php real
ob_start();
try {
    require_once 'auth.php';
    $output = ob_get_clean();
    echo "Saída do auth.php:\n";
    echo $output;
} catch (Throwable $e) {
    ob_end_clean();
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
?>

