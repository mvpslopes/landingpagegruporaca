<?php
/**
 * Script de Diagnóstico: Verificar Pastas na Raiz
 * 
 * Este script ajuda a diagnosticar problemas com pastas criadas na raiz
 * que não podem ser acessadas.
 */

require_once 'config.php';
require_once 'permissions_db.php';
require_once 'drive_service.php';
require_once 'oauth_token_storage.php';

// Verificar autenticação (apenas ROOT pode executar)
$user = requireAuth();
if ($user['role'] !== 'root') {
    jsonError('Apenas usuários ROOT podem executar este script', 403);
}

// Carregar DriveService
$driveService = null;
try {
    $oauthToken = OAuthTokenStorage::loadToken();
    $driveService = new DriveService($oauthToken);
} catch (Exception $e) {
    error_log('Erro ao carregar DriveService: ' . $e->getMessage());
    jsonError('Erro ao conectar com Google Drive: ' . $e->getMessage(), 503);
}

// Listar todas as pastas na raiz
try {
    $rootFolderId = $driveService->getRootFolderId();
    
    // Buscar todas as pastas na raiz
    $query = "'" . addslashes($rootFolderId) . "' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
    
    $results = $driveService->getService()->files->listFiles([
        'q' => $query,
        'fields' => 'files(id, name, createdTime, modifiedTime)',
        'orderBy' => 'name',
        'supportsAllDrives' => true,
        'includeItemsFromAllDrives' => true
    ]);
    
    $folders = [];
    foreach ($results->getFiles() as $file) {
        $folderName = $file->getName();
        
        // Verificar se consegue encontrar a pasta pelo nome
        $foundById = $driveService->getFolderIdByName($folderName, $rootFolderId);
        
        $folders[] = [
            'id' => $file->getId(),
            'name' => $folderName,
            'createdTime' => $file->getCreatedTime(),
            'modifiedTime' => $file->getModifiedTime(),
            'canBeFoundByName' => $foundById !== null,
            'foundId' => $foundById,
            'isProblematic' => $folderName === '*' || empty($folderName)
        ];
    }
    
    jsonResponse([
        'rootFolderId' => $rootFolderId,
        'totalFolders' => count($folders),
        'folders' => $folders,
        'problematicFolders' => array_filter($folders, function($f) {
            return $f['isProblematic'] || !$f['canBeFoundByName'];
        })
    ]);
} catch (Exception $e) {
    error_log('Erro ao diagnosticar pastas: ' . $e->getMessage());
    jsonError('Erro ao diagnosticar pastas: ' . $e->getMessage(), 500);
}
?>

