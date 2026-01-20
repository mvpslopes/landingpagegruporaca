<?php
/**
 * Script de Debug para folders.php
 * Testa a listagem de pastas sem autenticação
 */

// Desabilitar exibição de erros
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Iniciar output buffering
ob_start();

// Limpar qualquer output anterior
while (ob_get_level() > 0) {
    ob_end_clean();
}
ob_start();

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
$driveService = null;
try {
    require_once __DIR__ . '/drive_service.php';
    
    // Tentar obter token OAuth
    $oauthToken = null;
    require_once __DIR__ . '/oauth_token_storage.php';
    $oauthToken = OAuthTokenStorage::loadToken();
    
    if (!$oauthToken) {
        throw new Exception('Token OAuth não encontrado');
    }
    
    $driveService = new DriveService($oauthToken);
    
    // Testar listagem de pastas
    try {
        $allFiles = $driveService->listFiles('*', true);
        
        // Extrair nomes únicos de pastas
        $folderNames = [];
        if (is_array($allFiles)) {
            foreach ($allFiles as $item) {
                if (isset($item['type']) && $item['type'] === 'folder') {
                    $folderName = $item['name'] ?? '';
                    if (!empty($folderName) && !in_array($folderName, $folderNames)) {
                        $folderNames[] = $folderName;
                    }
                }
            }
        }
        
        // Limpar output
        ob_clean();
        
        jsonResponse([
            'success' => true,
            'totalFiles' => count($allFiles),
            'folders' => $folderNames,
            'allFiles' => $allFiles
        ]);
    } catch (Exception $e) {
        ob_clean();
        jsonResponse([
            'success' => false,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
} catch (Exception $e) {
    ob_clean();
    jsonError('Erro ao carregar DriveService: ' . $e->getMessage(), 500);
}
?>

