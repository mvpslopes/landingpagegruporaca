<?php
/**
 * Teste de Config
 */

// Limpar qualquer output
while (ob_get_level() > 0) {
    ob_end_clean();
}

header('Content-Type: application/json; charset=utf-8');

try {
    require_once 'config.php';
    
    $result = [
        'success' => true,
        'message' => 'Config carregado com sucesso',
        'session_status' => session_status(),
        'session_started' => session_status() === PHP_SESSION_ACTIVE
    ];
    
    echo json_encode($result, JSON_PRETTY_PRINT);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    exit;
} catch (Error $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
    exit;
}
?>

