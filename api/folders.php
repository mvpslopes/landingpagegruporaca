<?php
/**
 * Listar Pastas Disponíveis
 * Para ROOT/ADMIN: lista todas as pastas do Google Drive
 * Para USER: lista apenas sua pasta
 */

require_once 'config.php';
require_once 'permissions_db.php';

$user = requireAuth();

// Tentar carregar DriveService
$driveService = null;
try {
    require_once __DIR__ . '/drive_service.php';
    $driveService = new DriveService();
} catch (Exception $e) {
    error_log('Erro ao carregar DriveService: ' . $e->getMessage());
    jsonError('Google Drive não configurado', 503);
}

// GET: Listar pastas disponíveis
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $folders = [];
        
        // Se for ROOT ou ADMIN, listar todas as pastas da pasta raiz
        if ($user['role'] === 'root' || $user['role'] === 'admin') {
            // Listar apenas pastas da pasta raiz
            $rootFolderId = $driveService->getConfig()['root_folder_id'];
            
            $query = "'{$rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
            
            $results = $driveService->getService()->files->listFiles([
                'q' => $query,
                'fields' => 'files(id, name)',
                'orderBy' => 'name',
                'supportsAllDrives' => true,
                'includeItemsFromAllDrives' => true
            ]);
            
            foreach ($results->getFiles() as $folder) {
                $folderName = $folder->getName();
                $folders[] = [
                    'id' => $folder->getId(),
                    'name' => $folderName,
                    'path' => $folderName // Para ROOT/ADMIN, o path é o nome da pasta
                ];
            }
            
            // Adicionar opção "Todas" no início
            array_unshift($folders, [
                'id' => '*',
                'name' => 'Todas',
                'path' => '*'
            ]);
        } else {
            // Se for USER, retornar apenas sua pasta
            $userFolder = $user['folder'] ?? '*';
            if ($userFolder !== '*') {
                $folders[] = [
                    'id' => $userFolder,
                    'name' => $userFolder,
                    'path' => $userFolder
                ];
            }
        }
        
        jsonResponse([
            'folders' => $folders,
            'userRole' => $user['role']
        ]);
    } catch (Exception $e) {
        error_log('Erro ao listar pastas: ' . $e->getMessage());
        jsonError('Erro ao listar pastas: ' . $e->getMessage(), 500);
    }
}

jsonError('Método não permitido', 405);
?>

