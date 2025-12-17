<?php
/**
 * Script de teste de conexão com banco de dados
 * 
 * ⚠️ IMPORTANTE: Delete este arquivo após testar por segurança!
 */

require_once 'db_config.php';

header('Content-Type: application/json; charset=utf-8');

$result = testConnection();
echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>

