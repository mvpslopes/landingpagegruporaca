<?php
/**
 * OAuth Microsoft OneDrive - Autenticação do Usuário
 * 
 * Permite que usuários façam login com Microsoft e façam upload usando sua própria quota
 */

require_once __DIR__ . '/config.php';

// Verificar se usuário está autenticado no sistema
$user = requireAuth();

// Carregar configuração
$configPath = __DIR__ . '/config/onedrive_config.php';
if (!file_exists($configPath)) {
    jsonError('Configuração não encontrada', 500);
}
$config = require $configPath;

// GET: Obter URL de autenticação
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['code'])) {
    // Apenas root/admin podem autorizar
    if ($user['role'] !== 'root' && $user['role'] !== 'admin') {
        jsonError('Apenas Root/Admin podem autorizar OneDrive', 403);
    }
    
    $scopes = implode(' ', $config['scopes']);
    $redirectUri = urlencode($config['oauth_redirect_uri']);
    $clientId = $config['oauth_client_id'];
    $tenantId = $config['oauth_tenant_id'];
    
    $authUrl = "https://login.microsoftonline.com/{$tenantId}/oauth2/v2.0/authorize?" .
        "client_id={$clientId}&" .
        "response_type=code&" .
        "redirect_uri={$redirectUri}&" .
        "response_mode=query&" .
        "scope={$scopes}&" .
        "state=" . session_id();
    
    jsonResponse([
        'authUrl' => $authUrl,
        'message' => 'Acesse a URL para autorizar o OneDrive'
    ]);
}

// GET: Receber código de autorização
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['code'])) {
    try {
        // Apenas root/admin podem autorizar
        if ($user['role'] !== 'root' && $user['role'] !== 'admin') {
            jsonError('Apenas Root/Admin podem autorizar OneDrive', 403);
        }
        
        $code = $_GET['code'];
        $tenantId = $config['oauth_tenant_id'];
        $clientId = $config['oauth_client_id'];
        $clientSecret = $config['oauth_client_secret'];
        $redirectUri = $config['oauth_redirect_uri'];
        
        // Trocar código por token
        $tokenUrl = "https://login.microsoftonline.com/{$tenantId}/oauth2/v2.0/token";
        
        $data = [
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'code' => $code,
            'redirect_uri' => $redirectUri,
            'grant_type' => 'authorization_code'
        ];
        
        $ch = curl_init($tokenUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/x-www-form-urlencoded'
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 400) {
            $error = json_decode($response, true);
            jsonError('Erro ao obter token: ' . ($error['error_description'] ?? 'Erro desconhecido'), 400);
        }
        
        $tokenData = json_decode($response, true);
        
        // Armazenar token na sessão
        if (!isset($_SESSION['onedrive_token'])) {
            $_SESSION['onedrive_token'] = [];
        }
        
        // Armazenar token centralizado (apenas para root/admin)
        $_SESSION['onedrive_token'] = [
            'access_token' => $tokenData['access_token'],
            'refresh_token' => $tokenData['refresh_token'] ?? null,
            'expires_in' => $tokenData['expires_in'] ?? 3600,
            'created' => time(),
            'authorized_by' => $user['email']
        ];
        
        jsonResponse([
            'success' => true,
            'message' => 'Autenticação OneDrive realizada com sucesso!',
            'user' => $user
        ]);
    } catch (Exception $e) {
        error_log('Erro OAuth OneDrive: ' . $e->getMessage());
        jsonError('Erro ao processar autenticação: ' . $e->getMessage(), 500);
    }
}

// POST: Verificar se sistema tem token OAuth centralizado
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'check') {
    $hasToken = isset($_SESSION['onedrive_token']['access_token']);
    $tokenInfo = null;
    
    if ($hasToken) {
        $tokenInfo = [
            'authorized_by' => $_SESSION['onedrive_token']['authorized_by'] ?? 'N/A',
            'created' => $_SESSION['onedrive_token']['created'] ?? 0
        ];
    }
    
    jsonResponse([
        'hasToken' => $hasToken,
        'tokenInfo' => $tokenInfo,
        'user' => $user,
        'canAuthorize' => ($user['role'] === 'root' || $user['role'] === 'admin')
    ]);
}

// POST: Revogar token centralizado
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'revoke') {
    // Apenas root/admin pode revogar
    if ($user['role'] !== 'root' && $user['role'] !== 'admin') {
        jsonError('Apenas Root/Admin podem revogar autorização', 403);
    }
    
    if (isset($_SESSION['onedrive_token'])) {
        unset($_SESSION['onedrive_token']);
        
        jsonResponse([
            'success' => true,
            'message' => 'Autorização revogada com sucesso'
        ]);
    } else {
        jsonError('Nenhuma autorização encontrada', 404);
    }
}

jsonError('Método não permitido', 405);
?>

