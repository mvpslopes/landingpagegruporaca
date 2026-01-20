<?php
/**
 * Obter Token OAuth Centralizado para Upload Direto
 * 
 * Retorna o token OAuth centralizado para uso no frontend
 * O token é renovado automaticamente se necessário
 */

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
    
    // Se token expirou, renovar
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
                jsonError('Token OAuth expirado e não foi possível renovar. Reautorize o acesso em /api/oauth-drive.php', 503);
            }
        } else {
            jsonError('Token OAuth expirado e sem refresh token. Reautorize o acesso em /api/oauth-drive.php', 503);
        }
    }
    
    // Obter token de acesso atual
    $accessToken = $client->getAccessToken();
    if (!$accessToken || !isset($accessToken['access_token'])) {
        jsonError('Erro ao obter token de acesso', 500);
    }
    
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
