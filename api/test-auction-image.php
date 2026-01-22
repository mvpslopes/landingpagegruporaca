<?php
/**
 * Teste de Acesso à Imagem de Leilão
 * Script para diagnosticar problemas com imagens
 */

require_once 'config.php';
require_once 'db_config.php';

header('Content-Type: text/html; charset=utf-8');

$fileId = $_GET['id'] ?? '1pk1jsZHEyVdyp2Smw73tvaOycXrYceyr';

echo "<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Teste de Imagem de Leilão</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .info { color: #17a2b8; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
        img { max-width: 500px; border: 2px solid #ddd; margin: 10px 0; }
    </style>
</head>
<body>
<div class='container'>
<h1>🔍 Teste de Acesso à Imagem de Leilão</h1>
<p><strong>File ID:</strong> {$fileId}</p>";

try {
    // 1. Verificar banco de dados
    echo "<h2>1. Verificação no Banco de Dados</h2>";
    $conn = getDBConnection();
    $stmt = $conn->prepare("SELECT id, title, image_drive_id, active FROM auctions WHERE image_drive_id = ? LIMIT 1");
    $stmt->execute([$fileId]);
    $auction = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($auction) {
        echo "<p class='success'>✅ Leilão encontrado: <strong>{$auction['title']}</strong></p>";
        echo "<p>Status: " . ($auction['active'] ? 'Ativo' : 'Inativo') . "</p>";
    } else {
        echo "<p class='error'>❌ Leilão não encontrado com este image_drive_id</p>";
    }
    
    // 2. Verificar token OAuth
    echo "<h2>2. Verificação do Token OAuth</h2>";
    require_once __DIR__ . '/oauth_token_storage.php';
    $oauthToken = OAuthTokenStorage::loadToken();
    
    if ($oauthToken) {
        echo "<p class='success'>✅ Token OAuth encontrado</p>";
        echo "<p>Token tem refresh_token: " . (isset($oauthToken['refresh_token']) ? 'Sim' : 'Não') . "</p>";
        if (isset($oauthToken['expires_in'])) {
            echo "<p>Expira em: " . ($oauthToken['expires_in'] ?? 'N/A') . " segundos</p>";
        }
    } else {
        echo "<p class='error'>❌ Token OAuth não encontrado</p>";
        echo "</div></body></html>";
        exit;
    }
    
    // 3. Testar DriveService
    echo "<h2>3. Teste do DriveService</h2>";
    require_once __DIR__ . '/drive_service.php';
    $driveService = new DriveService($oauthToken);
    
    echo "<p class='info'>Tentando obter informações do arquivo...</p>";
    $fileInfo = $driveService->getFileInfo($fileId);
    
    if ($fileInfo) {
        echo "<p class='success'>✅ Arquivo encontrado no Google Drive</p>";
        echo "<pre>";
        echo "Nome: " . ($fileInfo['name'] ?? 'N/A') . "\n";
        echo "Tipo MIME: " . ($fileInfo['mimeType'] ?? 'N/A') . "\n";
        echo "Tamanho: " . (isset($fileInfo['size']) ? number_format($fileInfo['size'] / 1024, 2) . ' KB' : 'N/A') . "\n";
        echo "</pre>";
        
        $mimeType = $fileInfo['mimeType'] ?? '';
        if (strpos($mimeType, 'image/') === 0) {
            echo "<p class='success'>✅ É uma imagem</p>";
        } else {
            echo "<p class='error'>❌ Não é uma imagem (tipo: {$mimeType})</p>";
        }
    } else {
        echo "<p class='error'>❌ Arquivo não encontrado no Google Drive</p>";
        echo "</div></body></html>";
        exit;
    }
    
    // 4. Testar download direto
    echo "<h2>4. Teste de Download Direto</h2>";
    $service = $driveService->getService();
    $client = $service->getClient();
    
    // Renovar token se necessário
    if ($client->isAccessTokenExpired()) {
        echo "<p class='info'>Token expirado, tentando renovar...</p>";
        if (isset($oauthToken['refresh_token']) && !empty($oauthToken['refresh_token'])) {
            try {
                $newToken = $client->refreshToken($oauthToken['refresh_token']);
                if ($newToken) {
                    $updatedToken = array_merge($oauthToken, $newToken);
                    OAuthTokenStorage::saveToken($updatedToken);
                    $oauthToken = $updatedToken;
                    echo "<p class='success'>✅ Token renovado com sucesso</p>";
                }
            } catch (Exception $e) {
                echo "<p class='error'>❌ Erro ao renovar token: {$e->getMessage()}</p>";
            }
        }
    }
    
    $accessToken = $client->getAccessToken();
    if (!$accessToken || !isset($accessToken['access_token'])) {
        echo "<p class='error'>❌ Não foi possível obter token de acesso</p>";
        echo "</div></body></html>";
        exit;
    }
    
    echo "<p class='success'>✅ Token de acesso obtido</p>";
    
    // Testar URL de download
    $apiUrl = "https://www.googleapis.com/drive/v3/files/{$fileId}?alt=media";
    echo "<p>URL de teste: <code>{$apiUrl}</code></p>";
    
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $accessToken['access_token']
    ]);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_NOBODY, false);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $error = curl_error($ch);
    curl_close($ch);
    
    echo "<p>HTTP Status Code: <strong>{$httpCode}</strong></p>";
    
    if ($httpCode === 200) {
        $headers = substr($response, 0, $headerSize);
        $body = substr($response, $headerSize);
        
        echo "<p class='success'>✅ Download bem-sucedido!</p>";
        echo "<p>Tamanho do arquivo: " . strlen($body) . " bytes</p>";
        
        // Tentar exibir a imagem
        $mimeType = $fileInfo['mimeType'] ?? 'image/jpeg';
        $base64 = base64_encode($body);
        echo "<h2>5. Preview da Imagem</h2>";
        echo "<img src='data:{$mimeType};base64,{$base64}' alt='Preview' />";
        
        // Testar URL direta
        echo "<h2>6. URL Direta para Teste</h2>";
        $directUrl = "https://gruporaca.app.br/api/view-auction-image.php?id={$fileId}";
        $directUrlDebug = "https://gruporaca.app.br/api/view-auction-image.php?id={$fileId}&debug=1";
        echo "<p><strong>URL Normal:</strong> <a href='{$directUrl}' target='_blank'>{$directUrl}</a></p>";
        echo "<p><strong>URL com Debug:</strong> <a href='{$directUrlDebug}' target='_blank'>{$directUrlDebug}</a></p>";
        echo "<p>Teste direto: <img src='{$directUrl}' alt='Teste' style='max-width: 300px;' onerror=\"this.style.border='3px solid red'; this.alt='ERRO AO CARREGAR'; console.error('Erro ao carregar imagem:', this.src);\" /></p>";
        
    } else {
        echo "<p class='error'>❌ Erro no download (HTTP {$httpCode})</p>";
        if ($error) {
            echo "<p class='error'>Erro cURL: {$error}</p>";
        }
        if ($response) {
            echo "<pre>" . htmlspecialchars(substr($response, 0, 500)) . "</pre>";
        }
    }
    
} catch (Exception $e) {
    echo "<p class='error'>❌ Exceção: {$e->getMessage()}</p>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}

echo "</div></body></html>";
?>
