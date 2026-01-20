<?php
/**
 * Registrar Arquivo do Google Drive
 * 
 * Registra metadados de arquivo que foi enviado diretamente do navegador para Google Drive
 * O servidor não recebe o arquivo, apenas os metadados
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/permissions_db.php';

$user = requireAuth();

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método não permitido', 405);
}

// Obter dados do JSON
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    jsonError('Dados inválidos', 400);
}

// Validar campos obrigatórios
$fileId = $data['fileId'] ?? null;
$fileName = $data['name'] ?? null;
$folder = $data['folder'] ?? '*';
$fileSize = $data['size'] ?? 0;
$mimeType = $data['mimeType'] ?? 'application/octet-stream';
$webViewLink = $data['webViewLink'] ?? '';
$webContentLink = $data['webContentLink'] ?? '';

if (!$fileId || !$fileName) {
    jsonError('fileId e name são obrigatórios', 400);
}

try {
    require_once __DIR__ . '/drive_service.php';
    require_once __DIR__ . '/oauth_token_storage.php';
    
    // Carregar token OAuth (para verificar se arquivo existe)
    $oauthToken = OAuthTokenStorage::loadToken();
    if (!$oauthToken) {
        jsonError('Google Drive não autorizado', 503);
    }
    
    $driveService = new DriveService($oauthToken);
    
    // Verificar se arquivo existe no Google Drive
    try {
        $fileInfo = $driveService->getFileInfo($fileId);
    } catch (Exception $e) {
        jsonError('Arquivo não encontrado no Google Drive: ' . $e->getMessage(), 404);
    }
    
    // Converter pasta do usuário para caminho do Google Drive
    function convertUserFolderToDrivePath($user, $folder) {
        if ($user['role'] === 'root' || $user['role'] === 'admin' || $user['role'] === 'viewer') {
            if ($folder === '*') {
                return '*';
            }
            return $folder;
        }
        
        if ($user['role'] === 'user') {
            $userFolder = $user['folder'] ?? '*';
            if ($userFolder === '*') {
                return '*';
            }
            
            if ($folder === '*') {
                return $userFolder;
            }
            
            if (strpos($folder, $userFolder . '/') === 0) {
                return $folder;
            }
            
            return $userFolder . '/' . $folder;
        }
        
        return '*';
    }
    
    $driveFolder = convertUserFolderToDrivePath($user, $folder);
    
    // Retornar informações do arquivo (já está no Google Drive)
    jsonResponse([
        'success' => true,
        'message' => 'Arquivo registrado com sucesso',
        'file' => [
            'id' => $fileId,
            'name' => $fileName,
            'type' => 'file',
            'mimeType' => $mimeType,
            'size' => (int)$fileSize,
            'modifiedTime' => $fileInfo['modifiedTime'] ?? date('c'),
            'viewLink' => $webViewLink ?: $fileInfo['viewLink'] ?? '',
            'downloadLink' => $webContentLink ?: $fileInfo['downloadLink'] ?? '',
            'url' => $webViewLink ?: $fileInfo['viewLink'] ?? '',
            'folder' => $folder,
        ],
        'storage' => 'google_drive',
    ]);
    
} catch (Exception $e) {
    error_log('Erro ao registrar arquivo: ' . $e->getMessage());
    jsonError('Erro ao registrar arquivo: ' . $e->getMessage(), 500);
}
?>
