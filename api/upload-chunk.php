<?php
/**
 * Upload em Chunks - Grupo Raça
 * 
 * Este endpoint recebe chunks de arquivo e os junta para fazer upload completo.
 * Resolve o problema de erro 413 em hospedagens compartilhadas.
 */

// Aumentar timeouts para processar chunks grandes
set_time_limit(600); // 10 minutos
ini_set('max_execution_time', 600);
ini_set('max_input_time', 600);

// Headers para evitar timeout do servidor web
if (function_exists('apache_setenv')) {
    @apache_setenv('no-gzip', 1);
}
@ini_set('zlib.output_compression', 0);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/permissions_db.php';
require_once __DIR__ . '/drive_service.php';

// Função para converter pasta do usuário para caminho do Google Drive
function convertUserFolderToDrivePath($user, $folder) {
    // Se for ROOT, ADMIN ou VIEWER, pode acessar qualquer pasta
    if ($user['role'] === 'root' || $user['role'] === 'admin' || $user['role'] === 'viewer') {
        if ($folder === '*') {
            return '*'; // Pasta raiz (GRUPO_RACA)
        }
        return $folder; // Usar o caminho diretamente
    }
    
    // Se for USER, usar apenas sua pasta
    if ($user['role'] === 'user') {
        $userFolder = $user['folder'] ?? '*';
        if ($userFolder === '*') {
            return '*';
        }
        
        // Se folder for '*', usar a pasta do usuário diretamente (sem criar subpastas)
        if ($folder === '*') {
            return $userFolder;
        }
        
        // Se o usuário especificou uma subpasta, adicionar à pasta dele
        if ($folder !== $userFolder) {
            // Se a subpasta já começa com o nome da pasta do usuário, usar diretamente
            if (strpos($folder, $userFolder . '/') === 0) {
                return $folder;
            }
            return $userFolder . '/' . ltrim($folder, '/');
        }
        
        // Se folder for igual à pasta do usuário, usar diretamente (sem criar subpastas)
        return $userFolder;
    }
    
    return '*';
}

// Verificar autenticação
$user = requireAuth();

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método não permitido', 405);
}

try {
    // Obter parâmetros
    $chunkIndex = isset($_POST['chunkIndex']) ? (int)$_POST['chunkIndex'] : null;
    $totalChunks = isset($_POST['totalChunks']) ? (int)$_POST['totalChunks'] : null;
    $fileName = $_POST['fileName'] ?? null;
    $fileSize = isset($_POST['fileSize']) ? (int)$_POST['fileSize'] : null;
    $folder = $_POST['folder'] ?? ($user['folder'] ?? '*');
    
    // Validar parâmetros obrigatórios
    if ($chunkIndex === null || $totalChunks === null || !$fileName || $fileSize === null) {
        jsonError('Parâmetros obrigatórios faltando: chunkIndex, totalChunks, fileName, fileSize', 400);
    }
    
    // Verificar permissão
    if (!hasPermission($user, 'upload', $folder)) {
        jsonError('Sem permissão para upload', 403);
    }
    
    // Verificar acesso à pasta
    if (!canAccessFolder($user, $folder)) {
        jsonError('Sem acesso a esta pasta', 403);
    }
    
    // Verificar se chunk foi enviado
    if (!isset($_FILES['chunk']) || $_FILES['chunk']['error'] !== UPLOAD_ERR_OK) {
        jsonError('Chunk não recebido ou erro no upload', 400);
    }
    
    // Diretório temporário para chunks (usar hash do nome + tamanho + pasta para evitar conflitos)
    $tempDir = sys_get_temp_dir() . '/upload_chunks_' . md5($fileName . $fileSize . $folder);
    
    // Criar diretório se não existir
    if (!is_dir($tempDir)) {
        mkdir($tempDir, 0700, true);
    }
    
    // Caminho do chunk
    $chunkPath = $tempDir . '/' . $chunkIndex;
    
    // Se o chunk já existe, verificar se está completo (pode ter sido salvo antes de timeout)
    if (file_exists($chunkPath)) {
        $existingSize = filesize($chunkPath);
        $uploadedSize = $_FILES['chunk']['size'];
        
        // Se o chunk existente tem o mesmo tamanho, considerar como já recebido
        if ($existingSize === $uploadedSize) {
            error_log("Chunk {$chunkIndex} já existe e está completo ({$existingSize} bytes). Ignorando reenvio.");
            // Continuar para verificar se todos os chunks foram recebidos
        } else {
            // Tamanho diferente, substituir
            error_log("Chunk {$chunkIndex} existe mas tamanho diferente ({$existingSize} vs {$uploadedSize}). Substituindo.");
            unlink($chunkPath);
            if (!move_uploaded_file($_FILES['chunk']['tmp_name'], $chunkPath)) {
                jsonError('Erro ao salvar chunk', 500);
            }
        }
    } else {
        // Chunk não existe, salvar normalmente
        if (!move_uploaded_file($_FILES['chunk']['tmp_name'], $chunkPath)) {
            jsonError('Erro ao salvar chunk', 500);
        }
    }
    
    // Verificar se todos os chunks foram recebidos
    $receivedChunks = [];
    for ($i = 0; $i < $totalChunks; $i++) {
        if (file_exists($tempDir . '/' . $i)) {
            $receivedChunks[] = $i;
        }
    }
    
    // Se ainda não recebeu todos os chunks, retornar status
    if (count($receivedChunks) < $totalChunks) {
        error_log("Chunk {$chunkIndex} recebido. Total recebido: " . count($receivedChunks) . "/{$totalChunks}");
        jsonResponse([
            'success' => true,
            'message' => 'Chunk recebido',
            'chunkIndex' => $chunkIndex,
            'receivedChunks' => count($receivedChunks),
            'totalChunks' => $totalChunks,
            'complete' => false
        ]);
    }
    
    // Todos os chunks recebidos - processar
    error_log("Todos os {$totalChunks} chunks foram recebidos. Iniciando junção do arquivo...");
    
    // Todos os chunks recebidos - juntar arquivo
    $finalPath = $tempDir . '/final_' . basename($fileName);
    $finalHandle = fopen($finalPath, 'wb');
    
    if (!$finalHandle) {
        // Limpar chunks
        array_map('unlink', glob($tempDir . '/*'));
        rmdir($tempDir);
        jsonError('Erro ao criar arquivo final', 500);
    }
    
    // Juntar chunks em ordem
    for ($i = 0; $i < $totalChunks; $i++) {
        $chunkFile = $tempDir . '/' . $i;
        if (!file_exists($chunkFile)) {
            fclose($finalHandle);
            unlink($finalPath);
            array_map('unlink', glob($tempDir . '/*'));
            rmdir($tempDir);
            jsonError("Chunk $i não encontrado", 500);
        }
        
        $chunkHandle = fopen($chunkFile, 'rb');
        if (!$chunkHandle) {
            fclose($finalHandle);
            unlink($finalPath);
            array_map('unlink', glob($tempDir . '/*'));
            rmdir($tempDir);
            jsonError("Erro ao ler chunk $i", 500);
        }
        
        // Copiar chunk para arquivo final
        while (!feof($chunkHandle)) {
            fwrite($finalHandle, fread($chunkHandle, 8192));
        }
        
        fclose($chunkHandle);
        unlink($chunkFile); // Remover chunk após juntar
    }
    
    fclose($finalHandle);
    
    // Verificar tamanho do arquivo final
    $finalSize = filesize($finalPath);
    if ($finalSize !== $fileSize) {
        unlink($finalPath);
        rmdir($tempDir);
        jsonError("Tamanho do arquivo final ($finalSize) não corresponde ao esperado ($fileSize)", 500);
    }
    
    // Fazer upload para Google Drive
    try {
        // Carregar token OAuth (igual ao files.php)
        $oauthToken = null;
        try {
            require_once __DIR__ . '/oauth_token_storage.php';
            $oauthToken = OAuthTokenStorage::loadToken();
        } catch (Exception $e) {
            error_log('Aviso: Não foi possível carregar token OAuth: ' . $e->getMessage());
        }
        
        $driveService = new DriveService($oauthToken);
        $driveFolder = convertUserFolderToDrivePath($user, $folder);
        $result = $driveService->uploadFile($finalPath, $fileName, $driveFolder);
        
        // Limpar arquivo temporário
        unlink($finalPath);
        rmdir($tempDir);
        
        error_log("Upload completo! Arquivo '{$fileName}' enviado com sucesso para Google Drive.");
        
        jsonResponse([
            'success' => true,
            'message' => 'Arquivo enviado com sucesso',
            'file' => $result,
            'folder' => $folder,
            'storage' => 'google_drive',
            'complete' => true,
            'receivedChunks' => $totalChunks,
            'totalChunks' => $totalChunks
        ]);
    } catch (Exception $e) {
        // Limpar em caso de erro
        if (file_exists($finalPath)) {
            unlink($finalPath);
        }
        if (is_dir($tempDir)) {
            array_map('unlink', glob($tempDir . '/*'));
            rmdir($tempDir);
        }
        
        error_log('Erro ao fazer upload para Drive: ' . $e->getMessage());
        
        // Se erro for sobre falta de autenticação, sugerir autorização OAuth
        if (strpos($e->getMessage(), 'Nenhuma autenticação configurada') !== false || 
            strpos($e->getMessage(), 'Service Account') !== false ||
            strpos($e->getMessage(), 'OAuth') !== false) {
            jsonError('Google Drive não autorizado. Um administrador precisa autorizar o acesso OAuth primeiro. Acesse: /api/oauth-drive.php', 503);
        } else {
            jsonError('Erro ao fazer upload: ' . $e->getMessage(), 500);
        }
    }
    
} catch (Exception $e) {
    error_log('Erro geral em upload-chunk.php: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    jsonError('Erro ao processar upload: ' . $e->getMessage(), 500);
}
