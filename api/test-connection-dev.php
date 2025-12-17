<?php
/**
 * Teste de Conexão - Modo Desenvolvimento
 * Acesse: http://localhost/api/test-connection-dev.php
 */

require_once 'db_config.php';

header('Content-Type: application/json; charset=utf-8');

$result = testConnection();

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>

