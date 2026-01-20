<?php
/**
 * Download de Arquivo do Google Drive
 * Força download do arquivo em vez de abrir no navegador
 */

// Limpar TODOS os output buffers antes de qualquer coisa
while (ob_get_level() > 0) {
    ob_end_clean();
}

// Desabilitar qualquer output automático
ini_set('output_buffering', 'Off');
ini_set('zlib.output_compression', 'Off');

// Incluir configurações necessárias (mas não usar os headers JSON)
session_start();

// Verificar autenticação manualmente (sem usar requireAuth que envia JSON)
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    header('Content-Type: text/plain; charset=utf-8');
    die('Não autenticado');
}

$user = $_SESSION['user'];

// Verificar se ID do arquivo foi fornecido
$fileId = $_GET['id'] ?? null;
if (!$fileId) {
    http_response_code(400);
    header('Content-Type: text/plain; charset=utf-8');
    die('ID do arquivo é obrigatório');
}

try {
    // Iniciar output buffering para capturar qualquer output dos includes
    ob_start();
    
    require_once __DIR__ . '/drive_service.php';
    require_once __DIR__ . '/oauth_token_storage.php';
    
    // Limpar qualquer output que possa ter sido gerado pelos includes
    $output = ob_get_clean();
    if (!empty($output)) {
        error_log("AVISO: Output detectado durante includes: " . substr($output, 0, 200));
        // Limpar novamente para garantir
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
    }
    
    // Carregar token OAuth do arquivo (não da sessão)
    $oauthToken = OAuthTokenStorage::loadToken();
    $driveService = new DriveService($oauthToken);
    
    // Obter informações do arquivo
    $fileInfo = $driveService->getFileInfo($fileId);
    
    // Obter serviço e cliente
    $service = $driveService->getService();
    $client = $service->getClient();
    
    // Verificar e renovar token se necessário
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
            }
        } else {
            $client->fetchAccessTokenWithAssertion();
        }
    }
    
    // Obter token de acesso
    $accessToken = $client->getAccessToken();
    if (!$accessToken || !isset($accessToken['access_token'])) {
        http_response_code(500);
        header('Content-Type: text/plain; charset=utf-8');
        die('Erro ao obter token de acesso');
    }
    
    // Definir informações do arquivo
    $fileName = $fileInfo['name'] ?? 'arquivo';
    $mimeType = $fileInfo['mimeType'] ?? 'application/octet-stream';
    $fileSize = $fileInfo['size'] ?? null;
    
    // Limpar qualquer output que possa ter sido gerado ANTES de baixar
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    
    // Construir URL de download direto usando a API v3
    $apiUrl = "https://www.googleapis.com/drive/v3/files/{$fileId}?alt=media";
    
    // Suporte a Range Requests (HTTP 206) para downloads resumáveis
    $range = $_SERVER['HTTP_RANGE'] ?? null;
    $start = 0;
    $end = $fileSize ? ($fileSize - 1) : null;
    
    if ($range && preg_match('/bytes=(\d+)-(\d*)/', $range, $matches)) {
        $start = intval($matches[1]);
        if (!empty($matches[2])) {
            $end = intval($matches[2]);
        }
        if ($fileSize && $end >= $fileSize) {
            $end = $fileSize - 1;
        }
    }
    
    // Para arquivos grandes (> 100MB), usar streaming direto (proxy pass-through)
    // Isso evita baixar o arquivo inteiro para o servidor primeiro
    $useStreaming = $fileSize && $fileSize > 100 * 1024 * 1024; // > 100MB
    
    if ($useStreaming) {
        // Streaming direto: servidor faz proxy do Google Drive para o usuário
        // Sem armazenar o arquivo no servidor
        
        // Limpar qualquer output buffer novamente antes de enviar
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        
        // Definir headers para download binário
        header('Content-Type: ' . $mimeType);
        header('Content-Disposition: attachment; filename="' . addslashes($fileName) . '"');
        
        if ($range && $fileSize) {
            // Suporte a Range Request (HTTP 206)
            $contentLength = ($end - $start + 1);
            header('HTTP/1.1 206 Partial Content');
            header('Content-Length: ' . $contentLength);
            header('Content-Range: bytes ' . $start . '-' . $end . '/' . $fileSize);
            header('Accept-Ranges: bytes');
        } else {
            if ($fileSize) {
                header('Content-Length: ' . $fileSize);
            }
            header('Accept-Ranges: bytes');
        }
        
        header('Cache-Control: private, no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');
        header('X-Content-Type-Options: nosniff');
        
        // Garantir que não há encoding sendo aplicado
        if (function_exists('mb_http_output')) {
            mb_http_output('pass');
        }
        
        // Configurar cURL para streaming direto (sem armazenar no servidor)
        $ch = curl_init($apiUrl);
        
        // Headers de autenticação
        $headers = [
            'Authorization: Bearer ' . $accessToken['access_token'],
            'Accept: */*'
        ];
        
        // Adicionar Range header se necessário
        if ($range && $fileSize) {
            $headers[] = 'Range: bytes=' . $start . '-' . ($end !== null ? $end : '');
        }
        
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $data) {
            echo $data;
            flush();
            return strlen($data);
        });
        
        // Timeout aumentado para arquivos grandes (30 minutos)
        curl_setopt($ch, CURLOPT_TIMEOUT, 1800);
        
        // Executar streaming
        $success = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if (!$success || ($httpCode !== 200 && $httpCode !== 206) || $error) {
            while (ob_get_level() > 0) {
                ob_end_clean();
            }
            error_log("Erro ao fazer streaming: HTTP {$httpCode}, Erro: {$error}");
            http_response_code(500);
            header('Content-Type: text/plain; charset=utf-8');
            die('Erro ao fazer download');
        }
        
        // Forçar flush e garantir que tudo foi enviado
        if (function_exists('fastcgi_finish_request')) {
            fastcgi_finish_request();
        } else {
            flush();
        }
        
        exit;
    } else {
        // Para arquivos pequenos, usar método tradicional (mais confiável)
        // Criar arquivo temporário para garantir integridade binária
        $tempFile = tempnam(sys_get_temp_dir(), 'gdrive_download_');
        if (!$tempFile) {
            throw new Exception('Não foi possível criar arquivo temporário');
        }
        
        // Usar cURL para baixar diretamente para arquivo (mais seguro para binários)
        $ch = curl_init($apiUrl);
        $fp = fopen($tempFile, 'wb'); // 'wb' = write binary
        
        // Configurações essenciais para download binário
        curl_setopt($ch, CURLOPT_FILE, $fp); // Escrever diretamente no arquivo
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        
        // Headers de autenticação
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $accessToken['access_token'],
            'Accept: */*'
        ]);
        
        // Executar download
        $success = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        $downloadedSize = curl_getinfo($ch, CURLINFO_SIZE_DOWNLOAD);
        curl_close($ch);
        fclose($fp);
        
        if (!$success || $httpCode !== 200 || $error) {
            @unlink($tempFile);
            while (ob_get_level() > 0) {
                ob_end_clean();
            }
            error_log("Erro ao baixar arquivo: HTTP {$httpCode}, Erro: {$error}");
            http_response_code(500);
            header('Content-Type: text/plain; charset=utf-8');
            die('Erro ao baixar arquivo');
        }
        
        // Verificar tamanho do arquivo baixado
        $actualSize = filesize($tempFile);
        if ($actualSize === 0 || $actualSize === false) {
            @unlink($tempFile);
            while (ob_get_level() > 0) {
                ob_end_clean();
            }
            error_log("Arquivo baixado está vazio: File ID {$fileId}");
            http_response_code(500);
            header('Content-Type: text/plain; charset=utf-8');
            die('Arquivo vazio ou corrompido');
        }
        
        // Verificar se o tamanho corresponde ao esperado
        if ($fileSize && $fileSize > 0) {
            $sizeDifference = abs($actualSize - $fileSize);
            $tolerance = max(1, $fileSize * 0.01); // 1% de tolerância
            if ($sizeDifference > $tolerance) {
                error_log("Tamanho do arquivo não corresponde: Esperado {$fileSize}, Obtido {$actualSize}, File ID {$fileId}");
            }
        }
        
        // Limpar qualquer output buffer novamente antes de enviar
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        
        // Definir headers para download binário
        header('Content-Type: ' . $mimeType);
        header('Content-Disposition: attachment; filename="' . addslashes($fileName) . '"');
        header('Content-Length: ' . $actualSize);
        header('Cache-Control: private, no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');
        header('X-Content-Type-Options: nosniff');
        
        // Garantir que não há encoding sendo aplicado
        if (function_exists('mb_http_output')) {
            mb_http_output('pass');
        }
        
        // Usar readfile() que é binary-safe e eficiente
        // Ele lê e envia o arquivo diretamente sem carregar tudo na memória
        $sent = readfile($tempFile);
        
        // Limpar arquivo temporário
        @unlink($tempFile);
        
        if ($sent === false || $sent !== $actualSize) {
            error_log("Erro ao enviar arquivo: Esperado {$actualSize} bytes, Enviado " . ($sent === false ? 'false' : $sent));
        }
        
        // Forçar flush e garantir que tudo foi enviado
        if (function_exists('fastcgi_finish_request')) {
            fastcgi_finish_request();
        } else {
            flush();
        }
        
        exit;
    }
    
} catch (Exception $e) {
    // Limpar qualquer output em caso de erro
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    error_log('Erro ao fazer download: ' . $e->getMessage());
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    die('Erro ao fazer download: ' . $e->getMessage());
}
?>

