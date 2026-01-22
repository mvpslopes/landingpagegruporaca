<?php
/**
 * Criar Link Público para Imagem no Google Drive
 * Torna o arquivo público e retorna link direto para uso em <img src="">
 */

require_once 'config.php';
require_once 'permissions_db.php';

$user = requireAuth();

// Apenas ROOT e ADMIN
if ($user['role'] !== 'root' && $user['role'] !== 'admin') {
    jsonError('Acesso negado', 403);
}

// Ler dados do body JSON (POST) ou query string (GET)
$fileId = null;
$rawInput = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    if (!empty($rawInput)) {
        $data = json_decode($rawInput, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('Erro ao decodificar JSON: ' . json_last_error_msg());
            error_log('Body recebido: ' . $rawInput);
            jsonError('JSON inválido: ' . json_last_error_msg(), 400);
        }
        $fileId = $data['file_id'] ?? null;
    } else {
        // Tentar $_POST como fallback
        $fileId = $_POST['file_id'] ?? null;
    }
} else {
    $fileId = $_GET['file_id'] ?? null;
}

if (!$fileId || empty(trim($fileId))) {
    $debugInfo = [
        'method' => $_SERVER['REQUEST_METHOD'],
        'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'não definido',
        'post_data' => $_POST,
        'get_data' => $_GET,
        'body_raw' => $rawInput ?: (($_SERVER['REQUEST_METHOD'] === 'POST') ? 'vazio' : 'N/A')
    ];
    error_log('create-public-image-link.php - Debug: ' . json_encode($debugInfo, JSON_PRETTY_PRINT));
    jsonError('ID do arquivo é obrigatório. Verifique os logs do servidor para mais detalhes.', 400);
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
    
    // Tornar arquivo público (permissão para qualquer pessoa com o link)
    if (class_exists('Google_Service_Drive_Permission')) {
        $permission = new Google_Service_Drive_Permission();
    } elseif (class_exists('Google\Service\Drive\Permission')) {
        $permission = new \Google\Service\Drive\Permission();
    } else {
        throw new Exception('Classe Google_Service_Drive_Permission não encontrada');
    }
    
    $permission->setType('anyone');
    $permission->setRole('reader');
    
    try {
        $service->permissions->create($fileId, $permission, [
            'supportsAllDrives' => true,
            'fields' => 'id'
        ]);
    } catch (Exception $e) {
        // Se já tiver permissão, ignorar erro
        $errorMsg = $e->getMessage();
        if (strpos($errorMsg, 'Permission already exists') === false && 
            strpos($errorMsg, 'already exists') === false) {
            error_log('Aviso ao criar permissão: ' . $errorMsg);
        }
    }
    
    // Obter informações do arquivo
    $fileInfo = $driveService->getFileInfo($fileId);
    
    if (!$fileInfo) {
        jsonError('Arquivo não encontrado', 404);
    }
    
    // Usar proxy do servidor em vez de link direto do Google Drive
    // Isso evita problemas de CORS e funciona melhor em <img src="">
    $proxyImageUrl = "/api/view-auction-image.php?id={$fileId}";
    
    // Link direto do Google Drive (para referência, mas não recomendado para <img>)
    $directImageUrl = "https://drive.google.com/uc?export=view&id={$fileId}";
    
    // Alternativa: usar thumbnailLink se disponível (mais rápido)
    $thumbnailUrl = $fileInfo['thumbnailLink'] ?? null;
    
    // Garantir que todos os valores são strings válidas
    $response = [
        'success' => true,
        'file_id' => (string)$fileId,
        'direct_url' => (string)$directImageUrl,
        'proxy_url' => (string)$proxyImageUrl,
        'thumbnail_url' => $thumbnailUrl ? (string)$thumbnailUrl : null,
        'web_view_link' => isset($fileInfo['webViewLink']) ? (string)$fileInfo['webViewLink'] : '',
        'recommended_url' => (string)$proxyImageUrl // URL recomendada: usar proxy do servidor
    ];
    
    jsonResponse($response);
    
} catch (Exception $e) {
    error_log('Erro ao criar link público: ' . $e->getMessage());
    jsonError('Erro ao criar link público: ' . $e->getMessage(), 500);
}
?>
