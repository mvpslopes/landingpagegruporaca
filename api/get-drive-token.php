<?php
/**
 * Obter Token OAuth Centralizado para Upload Direto
 * 
 * Retorna o token OAuth centralizado para uso no frontend
 * O token é renovado automaticamente se necessário
 */

/**
 * Confirma se o access_token é aceito pela Google Drive API (evita loop 401 no navegador com token inválido/cache).
 */
function drive_access_token_works_for_api($bearer) {
    $bearer = trim((string) $bearer);
    if ($bearer === '') {
        return false;
    }
    $url = 'https://www.googleapis.com/drive/v3/about?fields=user&supportsAllDrives=true';
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $bearer],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 25,
        ]);
        curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return $code === 200;
    }
    $ctx = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "Authorization: Bearer {$bearer}\r\nAccept: application/json\r\n",
            'timeout' => 25,
            'ignore_errors' => true,
        ],
    ]);
    @file_get_contents($url, false, $ctx);
    if (!isset($http_response_header) || !is_array($http_response_header)) {
        return false;
    }
    $line = $http_response_header[0];
    return (bool) preg_match('/\b200\b/', $line);
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/permissions_db.php';

$user = requireAuth();

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Método não permitido', 405);
}

try {
    require_once __DIR__ . '/drive_service.php';
    require_once __DIR__ . '/oauth_token_storage.php';
    
    // Carregar token OAuth centralizado
    $oauthToken = OAuthTokenStorage::loadToken();
    if (!$oauthToken) {
        jsonError('Google Drive não autorizado. Um administrador precisa autorizar o acesso OAuth primeiro. Acesse: /api/oauth-drive.php', 503);
    }
    
    // Verificar se token expirou e renovar se necessário
    require_once __DIR__ . '/config/drive_config.php';
    $config = require __DIR__ . '/config/drive_config.php';
    
    // Criar cliente Google para verificar/renovar token
    if (class_exists('Google_Client')) {
        $client = new Google_Client();
    } elseif (class_exists('Google\Client')) {
        $client = new \Google\Client();
    } else {
        jsonError('Classe Google_Client não encontrada', 503);
    }
    
    $client->setClientId($config['oauth_client_id']);
    $client->setClientSecret($config['oauth_client_secret']);
    $client->setAccessToken($oauthToken);
    
    $forceRefresh = isset($_GET['refresh']) && ($_GET['refresh'] === '1' || $_GET['refresh'] === 'true');
    
    $refreshWithStoredRefreshToken = function () use ($client, &$oauthToken) {
        if (!isset($oauthToken['refresh_token']) || $oauthToken['refresh_token'] === '') {
            return false;
        }
        $newToken = $client->refreshToken($oauthToken['refresh_token']);
        if ($newToken) {
            $updatedToken = array_merge($oauthToken, $newToken);
            OAuthTokenStorage::saveToken($updatedToken);
            $oauthToken = $updatedToken;
            $client->setAccessToken($oauthToken);
            return true;
        }
        return false;
    };
    
    try {
        if ($forceRefresh) {
            if (!$refreshWithStoredRefreshToken()) {
                jsonError('Sem refresh token para renovar. Reautorize o acesso em /api/oauth-drive.php', 503);
            }
        } elseif ($client->isAccessTokenExpired()) {
            if (isset($oauthToken['refresh_token']) && !empty($oauthToken['refresh_token'])) {
                if (!$refreshWithStoredRefreshToken()) {
                    jsonError('Token OAuth expirado e não foi possível renovar. Reautorize o acesso em /api/oauth-drive.php', 503);
                }
            } else {
                jsonError('Token OAuth expirado e sem refresh token. Reautorize o acesso em /api/oauth-drive.php', 503);
            }
        }
    } catch (Exception $e) {
        error_log('Erro ao renovar token: ' . $e->getMessage());
        jsonError('Token OAuth não pôde ser renovado. Reautorize o acesso em /api/oauth-drive.php', 503);
    }
    
    // Obter token de acesso atual
    $accessToken = $client->getAccessToken();
    if (!$accessToken || !isset($accessToken['access_token']) || trim((string) $accessToken['access_token']) === '') {
        jsonError('Erro ao obter token de acesso', 500);
    }
    
    // Garantir que o token funciona na Drive API (desligue com DRIVE_VERIFY_DRIVE_TOKEN=0 se o host bloquear HTTPS para googleapis)
    if (!empty($config['verify_drive_token'])) {
        $bearerTest = trim((string) $accessToken['access_token']);
        if (!drive_access_token_works_for_api($bearerTest)) {
            error_log('get-drive-token: Drive API about falhou (401/403); tentando refresh_token uma vez...');
            try {
                if (isset($oauthToken['refresh_token']) && $oauthToken['refresh_token'] !== '' && $refreshWithStoredRefreshToken()) {
                    $accessToken = $client->getAccessToken();
                }
            } catch (Exception $e) {
                error_log('get-drive-token: ' . $e->getMessage());
            }
            $bearer2 = isset($accessToken['access_token']) ? trim((string) $accessToken['access_token']) : '';
            if ($bearer2 === '' || !drive_access_token_works_for_api($bearer2)) {
                jsonError(
                    'O Google recusou o token para a Drive API. Confira: (1) Google Drive API ativada no projeto OAuth; (2) escopos drive na autorização; (3) reautorize em /api/oauth-drive.php com conta root/admin.',
                    503
                );
            }
        }
    }
    
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    // Retornar apenas o access_token (não o refresh_token por segurança)
    jsonResponse([
        'access_token' => $accessToken['access_token'],
        'expires_in' => $accessToken['expires_in'] ?? 3600,
        'token_type' => $accessToken['token_type'] ?? 'Bearer',
    ]);
    
} catch (Exception $e) {
    error_log('Erro ao obter token: ' . $e->getMessage());
    jsonError('Erro ao obter token: ' . $e->getMessage(), 500);
}
?>
