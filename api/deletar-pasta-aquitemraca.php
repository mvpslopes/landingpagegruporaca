<?php
/**
 * Script para deletar a pasta "aquitemraca" do Google Drive
 * Execute este script uma vez para remover a pasta
 */

require_once 'config.php';
require_once 'drive_service.php';
require_once 'oauth_token_storage.php';

header('Content-Type: application/json');

try {
    $oauthToken = OAuthTokenStorage::loadToken();
    if (!$oauthToken) {
        jsonError('Token OAuth não encontrado. É necessário autorizar o Google Drive primeiro.', 401);
    }
    
    $driveService = new DriveService($oauthToken);
    $rootFolderId = $driveService->getRootFolderId();
    
    // Buscar pasta "aquitemraca" (case-insensitive)
    $folderName = 'AQUITEMRACA';
    $folderId = $driveService->getFolderIdByName($folderName, $rootFolderId);
    
    if (!$folderId) {
        // Tentar também em minúsculas
        $folderId = $driveService->getFolderIdByName('aquitemraca', $rootFolderId);
    }
    
    if (!$folderId) {
        jsonResponse([
            'success' => true,
            'message' => 'Pasta "aquitemraca" não encontrada. Pode já ter sido deletada.',
            'folderName' => $folderName
        ]);
    }
    
    // Deletar a pasta
    $driveService->getService()->files->delete($folderId, [
        'supportsAllDrives' => true
    ]);
    
    error_log("Pasta 'aquitemraca' deletada com sucesso (ID: {$folderId})");
    
    jsonResponse([
        'success' => true,
        'message' => 'Pasta "aquitemraca" deletada com sucesso',
        'folderId' => $folderId,
        'folderName' => $folderName
    ]);
    
} catch (Exception $e) {
    error_log('Erro ao deletar pasta aquitemraca: ' . $e->getMessage());
    jsonError('Erro ao deletar pasta: ' . $e->getMessage(), 500);
}
?>
