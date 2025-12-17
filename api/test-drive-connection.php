<?php
/**
 * Teste de Conexão com Google Drive
 * 
 * Acesse: https://todaarte.com.br/api/test-drive-connection.php
 */

require_once __DIR__ . '/config.php';

// Tentar carregar DriveService
try {
    require_once __DIR__ . '/drive_service.php';
    
    $driveService = new DriveService();
    $result = $driveService->testConnection();
    
    jsonResponse($result);
} catch (Exception $e) {
    jsonError('Erro ao conectar com Google Drive: ' . $e->getMessage(), 500);
}
?>

