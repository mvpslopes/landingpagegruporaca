<?php
/**
 * Teste de Conexão com Google Drive
 */

// Desabilitar exibição de erros
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Iniciar output buffering
while (ob_get_level() > 0) {
    ob_end_clean();
}
ob_start();

header('Content-Type: application/json; charset=utf-8');

try {
    require_once 'config.php';
    require_once 'permissions_db.php';
    
    // Simular usuário ROOT para teste
    $_SESSION['user'] = [
        'id' => 1,
        'email' => 'marcus@gruporaca.com.br',
        'name' => 'Marcus Lopes',
        'role' => 'root'
    ];
    
    $user = requireAuth();
    
    // Carregar DriveService
    require_once __DIR__ . '/drive_service.php';
    require_once __DIR__ . '/oauth_token_storage.php';
    
    $oauthToken = OAuthTokenStorage::loadToken();
    
    if (!$oauthToken) {
        throw new Exception('Token OAuth não encontrado');
    }
    
    $driveService = new DriveService($oauthToken);
    
    // Testar getRootFolderId
    $rootFolderId = $driveService->getRootFolderId();
    
    if (empty($rootFolderId)) {
        throw new Exception('Root folder ID está vazio');
    }
    
    // Testar listFiles com '*'
    try {
        $allFiles = $driveService->listFiles('*', true);
        
        $result = [
            'success' => true,
            'rootFolderId' => $rootFolderId,
            'totalFiles' => is_array($allFiles) ? count($allFiles) : 0,
            'files' => is_array($allFiles) ? array_slice($allFiles, 0, 5) : [], // Primeiros 5 para não sobrecarregar
            'message' => 'Conexão com Google Drive funcionando'
        ];
        
        ob_clean();
        echo json_encode($result, JSON_PRETTY_PRINT);
        exit;
    } catch (Exception $e) {
        ob_clean();
        echo json_encode([
            'success' => false,
            'rootFolderId' => $rootFolderId,
            'error' => 'Erro ao listar arquivos: ' . $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], JSON_PRETTY_PRINT);
        exit;
    }
} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
    exit;
} catch (Error $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro fatal: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
    exit;
}
?>
