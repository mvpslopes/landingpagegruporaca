<?php
/**
 * Criar Subpasta
 * Permite criar subpastas dentro da pasta atual do usuário
 */

require_once 'config.php';
require_once 'permissions_db.php';

$user = requireAuth();

// Função para converter pasta do usuário para caminho do Google Drive
function convertUserFolderToDrivePath($user, $folder) {
    // Se for ROOT ou ADMIN, pode acessar qualquer pasta
    if ($user['role'] === 'root' || $user['role'] === 'admin') {
        if ($folder === '*') {
            return '*'; // Pasta raiz
        }
        return $folder; // Usar o caminho diretamente
    }
    
    // Se for USER, usar apenas sua pasta
    if ($user['role'] === 'user') {
        $userFolder = $user['folder'] ?? '*';
        if ($userFolder === '*') {
            return '*';
        }
        // Se o usuário especificou uma subpasta, adicionar à pasta dele
        if ($folder !== '*' && $folder !== $userFolder) {
            return $userFolder . '/' . ltrim($folder, '/');
        }
        return $userFolder;
    }
    
    return '*';
}

// Tentar carregar DriveService
$driveService = null;
try {
    require_once __DIR__ . '/drive_service.php';
    $driveService = new DriveService();
} catch (Exception $e) {
    error_log('Erro ao carregar DriveService: ' . $e->getMessage());
    jsonError('Google Drive não configurado', 503);
}

// POST: Criar subpasta
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $folderName = trim($data['folderName'] ?? '');
        $parentFolder = $data['parentFolder'] ?? '*';
        
        if (empty($folderName)) {
            jsonError('Nome da pasta é obrigatório', 400);
        }
        
        // Validar nome da pasta (sem caracteres especiais perigosos)
        if (preg_match('/[<>:"|?*\\\\]/', $folderName)) {
            jsonError('Nome da pasta contém caracteres inválidos', 400);
        }
        
        // Verificar permissão de upload (necessária para criar pastas)
        if (!hasPermission($user, 'upload', $parentFolder)) {
            jsonError('Sem permissão para criar pastas nesta pasta', 403);
        }
        
        // Verificar acesso à pasta pai
        if (!canAccessFolder($user, $parentFolder)) {
            jsonError('Sem acesso a esta pasta', 403);
        }
        
        // Converter pasta do usuário para caminho do Drive
        $driveFolder = convertUserFolderToDrivePath($user, $parentFolder);
        
        // Obter ID da pasta pai
        $parentFolderId = null;
        if ($driveFolder === '*') {
            $parentFolderId = $driveService->getConfig()['root_folder_id'];
        } else {
            $parentFolderId = $driveService->ensureFolder($driveFolder);
        }
        
        // Verificar se a pasta já existe
        $existingFolderId = $driveService->getFolderIdByName($folderName, $parentFolderId);
        if ($existingFolderId) {
            jsonError('Uma pasta com este nome já existe', 409);
        }
        
        // Criar a pasta
        $newFolderId = $driveService->createFolder($folderName, $parentFolderId);
        
        // Construir o caminho completo da nova pasta
        $newFolderPath = $driveFolder === '*' 
            ? $folderName 
            : $driveFolder . '/' . $folderName;
        
        jsonResponse([
            'success' => true,
            'message' => 'Subpasta criada com sucesso',
            'folder' => [
                'id' => $newFolderId,
                'name' => $folderName,
                'path' => $newFolderPath
            ]
        ]);
    } catch (Exception $e) {
        error_log('Erro ao criar subpasta: ' . $e->getMessage());
        jsonError('Erro ao criar subpasta: ' . $e->getMessage(), 500);
    }
}

jsonError('Método não permitido', 405);
?>

