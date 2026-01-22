<?php
/**
 * Criar Pasta IMAGENS_LEILOES_SITE no Google Drive
 * Executar uma vez para criar a pasta onde as imagens serão armazenadas
 * Pasta privada (visível apenas para ROOT)
 */

require_once 'config.php';
require_once 'permissions_db.php';

$user = requireAuth();

// Apenas ROOT
if ($user['role'] !== 'root') {
    jsonError('Acesso negado. Apenas ROOT pode criar esta pasta.', 403);
}

try {
    require_once __DIR__ . '/drive_service.php';
    require_once __DIR__ . '/oauth_token_storage.php';
    
    $oauthToken = OAuthTokenStorage::loadToken();
    if (!$oauthToken) {
        jsonError('Google Drive não autorizado', 503);
    }
    
    $driveService = new DriveService($oauthToken);
    $service = $driveService->getService();
    $client = $service->getClient();
    
    // Renovar token se necessário
    if ($client->isAccessTokenExpired()) {
        if (isset($oauthToken['refresh_token']) && !empty($oauthToken['refresh_token'])) {
            try {
                $newToken = $client->refreshToken($oauthToken['refresh_token']);
                if ($newToken) {
                    $updatedToken = array_merge($oauthToken, $newToken);
                    OAuthTokenStorage::saveToken($updatedToken);
                    $oauthToken = $updatedToken;
                    $client->setAccessToken($updatedToken);
                }
            } catch (Exception $e) {
                error_log('Erro ao renovar token: ' . $e->getMessage());
                jsonError('Token OAuth expirado', 500);
            }
        } else {
            jsonError('Token OAuth expirado', 500);
        }
    }
    
    $accessToken = $client->getAccessToken();
    if (!$accessToken || !isset($accessToken['access_token'])) {
        jsonError('Erro ao obter token', 500);
    }
    
    // Obter ID da pasta raiz
    $rootFolderId = $driveService->getRootFolderId();
    
    // Verificar se pasta já existe
    $folderName = 'IMAGENS_LEILOES_SITE';
    $existingFolderId = $driveService->getFolderIdByName($folderName, $rootFolderId);
    
    if ($existingFolderId) {
        // Obter informações da pasta existente
        $existingFolder = $service->files->get($existingFolderId, [
            'supportsAllDrives' => true,
            'fields' => 'id, name, webViewLink'
        ]);
        
        jsonResponse([
            'success' => true,
            'message' => 'Pasta já existe',
            'folder_id' => $existingFolder->getId(),
            'folder_name' => $existingFolder->getName(),
            'folder_url' => $existingFolder->getWebViewLink()
        ]);
    }
    
    // Criar nova pasta
    if (class_exists('Google_Service_Drive_DriveFile')) {
        $folderMetadata = new Google_Service_Drive_DriveFile();
    } elseif (class_exists('Google\Service\Drive\DriveFile')) {
        $folderMetadata = new \Google\Service\Drive\DriveFile();
    } else {
        throw new Exception('Classe Google_Service_Drive_DriveFile não encontrada');
    }
    
    $folderMetadata->setName($folderName);
    $folderMetadata->setMimeType('application/vnd.google-apps.folder');
    $folderMetadata->setParents([$rootFolderId]);
    
    $folder = $service->files->create($folderMetadata, [
        'supportsAllDrives' => true,
        'fields' => 'id, name, webViewLink'
    ]);
    
    // Pasta será privada (apenas ROOT pode ver)
    // Não tornamos pública para manter privacidade
    
    jsonResponse([
        'success' => true,
        'message' => 'Pasta criada com sucesso',
        'folder_id' => $folder->getId(),
        'folder_name' => $folder->getName(),
        'folder_url' => $folder->getWebViewLink()
    ]);
    
} catch (Exception $e) {
    error_log('Erro ao criar pasta: ' . $e->getMessage());
    jsonError('Erro ao criar pasta: ' . $e->getMessage(), 500);
}
?>
