<?php
/**
 * Visualizar Imagem de Leilão (Público) - Versão 2
 * Endpoint público para exibir imagens de leilões sem autenticação
 * Versão otimizada que garante headers corretos
 */

// Desabilitar completamente output buffering
while (ob_get_level()) {
    ob_end_clean();
}

// Desabilitar compressão e buffering
@ini_set('output_buffering', 'off');
@ini_set('zlib.output_compression', false);
@ini_set('implicit_flush', true);

// Capturar qualquer output dos requires
ob_start();

// Carregar configurações
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db_config.php';

// Capturar e descartar qualquer output dos requires
$output = ob_get_clean();
if (!empty($output)) {
    error_log('Output capturado dos requires: ' . substr($output, 0, 100));
}

// Verificar se ID foi fornecido
$fileId = $_GET['id'] ?? null;
if (!$fileId) {
    http_response_code(400);
    header('Content-Type: application/json', true);
    echo json_encode(['error' => 'ID do arquivo é obrigatório']);
    exit;
}

try {
    // Verificar no banco
    $conn = getDBConnection();
    $stmt = $conn->prepare("SELECT id FROM auctions WHERE image_drive_id = ? LIMIT 1");
    $stmt->execute([$fileId]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        header('Content-Type: application/json', true);
        echo json_encode(['error' => 'Imagem não encontrada']);
        exit;
    }
    
    // Carregar serviços
    require_once __DIR__ . '/drive_service.php';
    require_once __DIR__ . '/oauth_token_storage.php';
    
    // Capturar output novamente
    $output = ob_get_clean();
    if (!empty($output)) {
        error_log('Output capturado dos requires de serviços: ' . substr($output, 0, 100));
    }
    
    $oauthToken = OAuthTokenStorage::loadToken();
    if (!$oauthToken) {
        http_response_code(503);
        header('Content-Type: application/json', true);
        echo json_encode(['error' => 'Google Drive não autorizado']);
        exit;
    }
    
    $driveService = new DriveService($oauthToken);
    $fileInfo = $driveService->getFileInfo($fileId);
    
    if (!$fileInfo) {
        http_response_code(404);
        header('Content-Type: application/json', true);
        echo json_encode(['error' => 'Arquivo não encontrado']);
        exit;
    }
    
    $mimeType = $fileInfo['mimeType'] ?? 'image/jpeg';
    if (strpos($mimeType, 'image/') !== 0) {
        http_response_code(400);
        header('Content-Type: application/json', true);
        echo json_encode(['error' => 'Arquivo não é uma imagem']);
        exit;
    }
    
    // Obter token
    $service = $driveService->getService();
    $client = $service->getClient();
    
    if ($client->isAccessTokenExpired()) {
        if (isset($oauthToken['refresh_token']) && !empty($oauthToken['refresh_token'])) {
            try {
                $newToken = $client->refreshToken($oauthToken['refresh_token']);
                if ($newToken) {
                    $updatedToken = array_merge($oauthToken, $newToken);
                    OAuthTokenStorage::saveToken($updatedToken);
                    $oauthToken = $updatedToken;
                }
            } catch (Exception $e) {
                error_log('Erro ao renovar token: ' . $e->getMessage());
                http_response_code(500);
                header('Content-Type: application/json', true);
                echo json_encode(['error' => 'Token expirado']);
                exit;
            }
        }
    }
    
    $accessToken = $client->getAccessToken();
    if (!$accessToken || !isset($accessToken['access_token'])) {
        http_response_code(500);
        header('Content-Type: application/json', true);
        echo json_encode(['error' => 'Erro ao obter token']);
        exit;
    }
    
    // Fazer download
    $apiUrl = "https://www.googleapis.com/drive/v3/files/{$fileId}?alt=media&supportsAllDrives=true";
    
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $accessToken['access_token']
    ]);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $fileContent = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    curl_close($ch);
    
    if ($httpCode !== 200 || $fileContent === false || empty($fileContent)) {
        error_log("Erro download: HTTP {$httpCode}, Erro: {$error}");
        http_response_code(500);
        header('Content-Type: application/json', true);
        echo json_encode(['error' => 'Erro ao baixar arquivo']);
        exit;
    }
    
    // Usar Content-Type do Google Drive se disponível
    if ($contentType && strpos($contentType, 'image/') === 0) {
        $mimeType = $contentType;
    }
    
    // CRÍTICO: Limpar qualquer output antes de enviar headers
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    // Verificar se headers já foram enviados
    if (headers_sent($file, $line)) {
        error_log("Headers já enviados em {$file}:{$line}");
        // Tentar enviar mesmo assim
    }
    
    // Enviar headers (replace=true para sobrescrever qualquer header anterior)
    header('Content-Type: ' . $mimeType, true);
    header('Content-Length: ' . strlen($fileContent), true);
    header('Cache-Control: public, max-age=3600', true);
    header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 3600) . ' GMT', true);
    header('Access-Control-Allow-Origin: *', true);
    header('X-Content-Type-Options: nosniff', true);
    
    // Enviar conteúdo
    echo $fileContent;
    exit;
    
} catch (Exception $e) {
    error_log('Exceção: ' . $e->getMessage());
    error_log('Stack: ' . $e->getTraceAsString());
    
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    http_response_code(500);
    header('Content-Type: application/json', true);
    
    if (isset($_GET['debug'])) {
        echo json_encode([
            'error' => 'Erro ao processar',
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]);
    } else {
        echo json_encode(['error' => 'Erro ao processar imagem']);
    }
    exit;
}
?>
