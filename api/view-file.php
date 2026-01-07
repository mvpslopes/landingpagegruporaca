<?php
/**
 * Visualizar Arquivo do Google Drive
 * Serve como proxy para exibir imagens e arquivos do Google Drive
 */

// Limpar qualquer output anterior completamente
while (ob_get_level()) {
    ob_end_clean();
}

// Iniciar novo buffer de output
ob_start();

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
    if (!$oauthToken) {
        http_response_code(503);
        header('Content-Type: application/json');
        echo json_encode([
            'error' => true,
            'message' => 'Google Drive não autorizado. Um administrador precisa autorizar o acesso OAuth primeiro.'
        ]);
        exit;
    }
    
    $driveService = new DriveService($oauthToken);
    
    // Obter informações do arquivo
    $fileInfo = $driveService->getFileInfo($fileId);
    
    // Verificar se o usuário tem acesso ao arquivo
    // (implementar verificação de permissões se necessário)
    
    // Verificar se é imagem
    $isImage = strpos($fileInfo['mimeType'] ?? '', 'image/') === 0;
    
    if ($isImage) {
        // Para imagens, usar o método correto da API do Google Drive
        try {
            $service = $driveService->getService();
            $client = $service->getClient();
            
            // Verificar se token expirou e renovar se necessário
            if ($client->isAccessTokenExpired()) {
                if (isset($oauthToken['refresh_token']) && !empty($oauthToken['refresh_token'])) {
                    try {
                        $newToken = $client->refreshToken($oauthToken['refresh_token']);
                        if ($newToken) {
                            // Atualizar token no arquivo
                            $updatedToken = array_merge($oauthToken, $newToken);
                            OAuthTokenStorage::saveToken($updatedToken);
                            $oauthToken = $updatedToken;
                        }
                    } catch (Exception $e) {
                        error_log('Erro ao renovar token: ' . $e->getMessage());
                        http_response_code(500);
                        header('Content-Type: application/json');
                        echo json_encode([
                            'error' => true,
                            'message' => 'Token OAuth expirado. Reautorize o acesso em /api/oauth-drive.php'
                        ]);
                        exit;
                    }
                } else {
                    error_log('Token OAuth expirado e sem refresh token');
                    http_response_code(500);
                    header('Content-Type: application/json');
                    echo json_encode([
                        'error' => true,
                        'message' => 'Token OAuth expirado. Reautorize o acesso em /api/oauth-drive.php'
                    ]);
                    exit;
                }
            }
            
            // Obter token de acesso (agora deve estar válido)
            $accessToken = $client->getAccessToken();
            if (!$accessToken || !isset($accessToken['access_token'])) {
                error_log('Token de acesso não disponível após renovação');
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode([
                    'error' => true,
                    'message' => 'Erro ao obter token de acesso'
                ]);
                exit;
            }
            
            if ($accessToken && isset($accessToken['access_token'])) {
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
                
                if ($httpCode === 200 && $content !== false && !$error && strlen($content) > 0) {
                    // Limpar qualquer output anterior completamente
                    while (ob_get_level()) {
                        ob_end_clean();
                    }
                    
                    // Definir headers apropriados
                    header('Content-Type: ' . ($fileInfo['mimeType'] ?? 'image/jpeg'));
                    header('Content-Length: ' . strlen($content));
                    header('Cache-Control: public, max-age=3600');
                    header('Access-Control-Allow-Origin: *');
                    header('Access-Control-Allow-Credentials: true');
                    header('X-Content-Type-Options: nosniff');
                    
                    // Enviar conteúdo diretamente
                    echo $content;
                    flush();
                    exit;
                } else {
                    error_log("Erro ao baixar imagem via API v3: HTTP {$httpCode}, Erro: {$error}");
                    
                    // Tentar fallback usando webContentLink se disponível
                    if (isset($fileInfo['downloadLink']) && $fileInfo['downloadLink']) {
                        $separator = strpos($fileInfo['downloadLink'], '?') !== false ? '&' : '?';
                        $downloadUrlWithToken = $fileInfo['downloadLink'] . $separator . 'access_token=' . urlencode($accessToken['access_token']);
                        
                        $ch = curl_init($downloadUrlWithToken);
                        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                        $content = curl_exec($ch);
                        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                        $error = curl_error($ch);
                        curl_close($ch);
                        
                        if ($httpCode === 200 && $content !== false && !$error && strlen($content) > 0) {
                            // Limpar qualquer output anterior completamente
                            while (ob_get_level()) {
                                ob_end_clean();
                            }
                            
                            header('Content-Type: ' . ($fileInfo['mimeType'] ?? 'image/jpeg'));
                            header('Content-Length: ' . strlen($content));
                            header('Cache-Control: public, max-age=3600');
                            header('Access-Control-Allow-Origin: *');
                            header('Access-Control-Allow-Credentials: true');
                            header('X-Content-Type-Options: nosniff');
                            echo $content;
                            flush();
                            exit;
                        } else {
                            error_log("Erro ao baixar imagem via downloadLink: HTTP {$httpCode}, Erro: {$error}");
                        }
                    }
                    
                    // Se tudo falhar, retornar erro JSON para o frontend tratar
                    http_response_code(500);
                    header('Content-Type: application/json');
                    echo json_encode([
                        'error' => true,
                        'message' => 'Erro ao carregar imagem',
                        'httpCode' => $httpCode,
                        'curlError' => $error
                    ]);
                    exit;
                }
            } else {
                error_log('Token de acesso não disponível');
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode([
                    'error' => true,
                    'message' => 'Erro ao obter token de acesso'
                ]);
                exit;
            }
        } catch (Exception $e) {
            error_log('Erro ao baixar imagem: ' . $e->getMessage());
            // Limpar output buffer antes de enviar erro
            while (ob_get_level()) {
                ob_end_clean();
            }
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => true,
                'message' => 'Erro ao carregar imagem: ' . $e->getMessage()
            ]);
            exit;
        }
    } else {
        // Para outros arquivos, redirecionar para viewLink
        $viewLink = $fileInfo['viewLink'] ?? $fileInfo['downloadLink'] ?? null;
        if ($viewLink) {
            // Limpar output buffer antes de redirecionar
            while (ob_get_level()) {
                ob_end_clean();
            }
            header('Location: ' . $viewLink);
            exit;
        } else {
            // Limpar output buffer antes de enviar erro
            while (ob_get_level()) {
                ob_end_clean();
            }
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => true,
                'message' => 'Arquivo não encontrado'
            ]);
            exit;
        }
    }
} catch (Exception $e) {
    error_log('Erro ao visualizar arquivo: ' . $e->getMessage());
    // Limpar output buffer antes de enviar erro
    while (ob_get_level()) {
        ob_end_clean();
    }
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => true,
        'message' => 'Erro ao carregar arquivo: ' . $e->getMessage()
    ]);
    exit;
}
?>

