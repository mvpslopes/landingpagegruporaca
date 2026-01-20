<?php
/**
 * Script para Limpar Pasta com Nome "*"
 * 
 * Este script remove qualquer pasta na raiz que tenha o nome literal "*"
 * (que não deveria existir)
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

try {
    $rootFolderId = $driveService->getRootFolderId();
    
    // Buscar todas as pastas na raiz
    $query = "'" . addslashes($rootFolderId) . "' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
    
    $results = $driveService->getService()->files->listFiles([
        'q' => $query,
        'fields' => 'files(id, name)',
        'supportsAllDrives' => true,
        'includeItemsFromAllDrives' => true
    ]);
    
    $problematicFolders = [];
    $allFolders = [];
    
    foreach ($results->getFiles() as $file) {
        $folderName = $file->getName();
        $folderId = $file->getId();
        
        $allFolders[] = [
            'id' => $folderId,
            'name' => $folderName
        ];
        
        // Verificar se o nome é "*" ou está vazio
        if ($folderName === '*' || empty(trim($folderName))) {
            $problematicFolders[] = [
                'id' => $folderId,
                'name' => $folderName
            ];
        }
    }
    
    // Se houver pastas problemáticas, oferecer para deletá-las
    if (count($problematicFolders) > 0) {
        // Deletar pastas problemáticas
        $deleted = [];
        foreach ($problematicFolders as $folder) {
            try {
                $driveService->getService()->files->delete($folder['id'], [
                    'supportsAllDrives' => true
                ]);
                $deleted[] = $folder;
                error_log("Pasta problemática deletada: '{$folder['name']}' (ID: {$folder['id']})");
            } catch (Exception $e) {
                error_log("Erro ao deletar pasta '{$folder['name']}': " . $e->getMessage());
            }
        }
        
        jsonResponse([
            'success' => true,
            'message' => 'Pastas problemáticas removidas',
            'totalFolders' => count($allFolders),
            'problematicFolders' => $problematicFolders,
            'deleted' => $deleted,
            'allFolders' => $allFolders
        ]);
    } else {
        jsonResponse([
            'success' => true,
            'message' => 'Nenhuma pasta problemática encontrada',
            'totalFolders' => count($allFolders),
            'allFolders' => $allFolders
        ]);
    }
} catch (Exception $e) {
    error_log('Erro ao limpar pastas: ' . $e->getMessage());
    jsonError('Erro ao limpar pastas: ' . $e->getMessage(), 500);
}
?>

