<?php
/**
 * Teste Simples - Verificar se PHP está funcionando
 */

// Limpar qualquer output
while (ob_get_level() > 0) {
    ob_end_clean();
}

header('Content-Type: application/json; charset=utf-8');

try {
    $result = [
        'success' => true,
        'message' => 'PHP está funcionando',
        'php_version' => phpversion(),
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    echo json_encode($result, JSON_PRETTY_PRINT);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
    exit;
}
?>

