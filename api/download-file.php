<?php
/**
 * Download de Arquivo do Google Drive
 * Força download do arquivo em vez de abrir no navegador
 */

require_once 'config.php';
require_once 'permissions_db.php';

$user = requireAuth();

// Verificar se ID do arquivo foi fornecido
$fileId = $_GET['id'] ?? null;
if (!$fileId) {
    http_response_code(400);
    die('ID do arquivo é obrigatório');
}

try {
    require_once __DIR__ . '/drive_service.php';
    require_once __DIR__ . '/oauth_token_storage.php';
    
    // Carregar token OAuth do arquivo (não da sessão)
    $oauthToken = OAuthTokenStorage::loadToken();
    $driveService = new DriveService($oauthToken);
    
    // Obter informações do arquivo
    $fileInfo = $driveService->getFileInfo($fileId);
    
    // Obter token de acesso
    $service = $driveService->getService();
    $client = $service->getClient();
    $accessToken = $client->getAccessToken();
    if (!$accessToken) {
        $client->fetchAccessTokenWithAssertion();
        $accessToken = $client->getAccessToken();
    }
    
    if (!$accessToken || !isset($accessToken['access_token'])) {
        http_response_code(500);
        die('Erro ao obter token de acesso');
    }
    
    // Construir URL de download direto usando a API v3
    $apiUrl = "https://www.googleapis.com/drive/v3/files/{$fileId}?alt=media";
    
    // Usar cURL para baixar o conteúdo com autenticação
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $accessToken['access_token']
    ]);
    
    $content = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($httpCode === 200 && $content !== false && !$error) {
        // Definir headers para forçar download
        $fileName = $fileInfo['name'] ?? 'arquivo';
        $mimeType = $fileInfo['mimeType'] ?? 'application/octet-stream';
        
        header('Content-Type: ' . $mimeType);
        header('Content-Disposition: attachment; filename="' . addslashes($fileName) . '"');
        header('Content-Length: ' . strlen($content));
        header('Cache-Control: private, no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');
        
        // Enviar conteúdo
        echo $content;
        exit;
    } else {
        error_log("Erro ao baixar arquivo via API v3: HTTP {$httpCode}, Erro: {$error}");
        http_response_code(500);
        die('Erro ao baixar arquivo');
    }
} catch (Exception $e) {
    error_log('Erro ao fazer download: ' . $e->getMessage());
    http_response_code(500);
    die('Erro ao fazer download: ' . $e->getMessage());
}
?>

