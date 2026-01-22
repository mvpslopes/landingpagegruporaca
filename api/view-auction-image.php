<?php
/**
 * Visualizar Imagem de Leilão (Público)
 * Endpoint público para exibir imagens de leilões sem autenticação
 *
 * IMPORTANTE:
 * - Este arquivo DEVE começar exatamente com "<?php" (sem BOM/whitespace), senão os headers não funcionam.
 * - Não inclui config.php (que define JSON por padrão).
 */

@ini_set('display_errors', '0');
@ini_set('html_errors', '0');
@ini_set('log_errors', '1');
@ini_set('zlib.output_compression', '0');
error_reporting(0);

// Captura qualquer output acidental (warnings do vendor, etc.) antes de enviar headers
@ob_start();

$fileId = $_GET['id'] ?? null;
if (!$fileId) {
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8', true);
    echo json_encode(['error' => 'ID do arquivo é obrigatório'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    require_once __DIR__ . '/drive_service.php';
    require_once __DIR__ . '/oauth_token_storage.php';

    $oauthToken = OAuthTokenStorage::loadToken();
    if (!$oauthToken) {
        http_response_code(503);
        header('Content-Type: application/json; charset=utf-8', true);
        echo json_encode(['error' => 'Google Drive não autorizado'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $curlDownload = function (string $url, array $headers = []) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge([
            'User-Agent: GrupoRaca/1.0 (+https://gruporaca.app.br)'
        ], $headers));
        $content = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        $error = curl_error($ch);
        curl_close($ch);
        return [$httpCode, $content, $contentType, $error];
    };

    $debugInfo = [];
    $fileContent = null;
    $mimeType = 'image/jpeg';

    // 1) Autenticado via Drive API
    $driveService = new DriveService($oauthToken);
    $service = $driveService->getService();
    $client = $service->getClient();

    if ($client->isAccessTokenExpired() && !empty($oauthToken['refresh_token'])) {
        try {
            $newToken = $client->refreshToken($oauthToken['refresh_token']);
            if ($newToken) {
                $updatedToken = array_merge($oauthToken, $newToken);
                OAuthTokenStorage::saveToken($updatedToken);
                $oauthToken = $updatedToken;
                $client->setAccessToken($updatedToken);
            }
        } catch (Exception $e) {
            $debugInfo['refresh_error'] = $e->getMessage();
        }
    }

    $accessToken = $client->getAccessToken();
    if ($accessToken && isset($accessToken['access_token'])) {
        try {
            $fileInfo = $driveService->getFileInfo($fileId);
            $fileMime = $fileInfo['mimeType'] ?? null;
            if ($fileMime && strpos($fileMime, 'image/') === 0) {
                $mimeType = $fileMime;
            }
        } catch (Exception $e) {
            $debugInfo['file_info_error'] = $e->getMessage();
        }

        $apiUrl = "https://www.googleapis.com/drive/v3/files/{$fileId}?alt=media&supportsAllDrives=true";
        [$httpCode, $content, $contentType, $error] = $curlDownload($apiUrl, [
            'Authorization: Bearer ' . $accessToken['access_token']
        ]);

        if ($httpCode === 200 && $content !== false && !empty($content) && $contentType && strpos($contentType, 'image/') === 0) {
            $fileContent = $content;
            $mimeType = $contentType;
        } else {
            $debugInfo['drive_api_download'] = [
                'http' => $httpCode,
                'content_type' => $contentType,
                'error' => $error
            ];
        }
    } else {
        $debugInfo['access_token_error'] = 'Não foi possível obter access_token';
    }

    // 2) Fallback público
    if ($fileContent === null) {
        $publicUrls = [
            "https://drive.google.com/thumbnail?id={$fileId}&sz=w2000",
            "https://drive.google.com/uc?export=download&id={$fileId}",
            "https://drive.google.com/uc?export=view&id={$fileId}"
        ];

        foreach ($publicUrls as $url) {
            [$httpCode, $content, $contentType, $error] = $curlDownload($url);
            if ($httpCode === 200 && $content !== false && !empty($content) && $contentType && strpos($contentType, 'image/') === 0) {
                $fileContent = $content;
                $mimeType = $contentType;
                $debugInfo['public_fallback_used'] = $url;
                break;
            }

            $debugInfo['public_attempts'][] = [
                'url' => $url,
                'http' => $httpCode,
                'content_type' => $contentType,
                'error' => $error
            ];
        }
    }

    if ($fileContent === null) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8', true);
        echo json_encode([
            'error' => 'Erro ao baixar imagem',
            'debug' => isset($_GET['debug']) ? $debugInfo : null
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    // Se pediu debug, apenas JSON (útil pra diagnóstico)
    if (isset($_GET['debug'])) {
        while (ob_get_level()) {
            @ob_end_clean();
        }
        header('Content-Type: application/json; charset=utf-8', true);
        echo json_encode([
            'success' => true,
            'file_id' => (string)$fileId,
            'mime_type' => (string)$mimeType,
            'bytes' => strlen($fileContent),
            'debug' => $debugInfo,
            'hint' => 'Abra sem &debug=1 para ver a imagem'
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    // Limpar qualquer output capturado e enviar headers corretos
    while (ob_get_level()) {
        @ob_end_clean();
    }

    if (function_exists('header_remove')) {
        @header_remove();
    }

    // Garantir mimeType de imagem
    if (!$mimeType || strpos($mimeType, 'image/') !== 0) {
        $mimeType = 'image/jpeg';
    }

    header('Content-Type: ' . $mimeType, true);
    header('Content-Disposition: inline', true);
    header('Content-Length: ' . strlen($fileContent), true);
    header('Cache-Control: public, max-age=3600', true);
    header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 3600) . ' GMT', true);
    header('Access-Control-Allow-Origin: *', true);
    header('X-Content-Type-Options: nosniff', true);

    echo $fileContent;
    exit;
} catch (Exception $e) {
    while (ob_get_level()) {
        @ob_end_clean();
    }
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8', true);
    echo json_encode([
        'error' => 'Erro ao processar imagem',
        'message' => isset($_GET['debug']) ? $e->getMessage() : null
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
