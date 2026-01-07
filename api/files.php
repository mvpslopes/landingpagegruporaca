<?php
/**
 * Gerenciamento de Arquivos
 * Integrado com Google Drive (Shared Drive)
 */

require_once 'config.php';
require_once 'permissions_db.php';

$user = requireAuth();

// Carregar DriveService
$driveService = null;
try {
    require_once __DIR__ . '/drive_service.php';
    
    // Tentar obter token OAuth (arquivo persistente ou sessão)
    $oauthToken = null;
    require_once __DIR__ . '/oauth_token_storage.php';
    $oauthToken = OAuthTokenStorage::loadToken();
    
    $driveService = new DriveService($oauthToken);
} catch (Exception $e) {
    error_log('Erro ao carregar DriveService: ' . $e->getMessage());
    
    // Se erro for sobre falta de autenticação, sugerir autorização OAuth
    if (strpos($e->getMessage(), 'Nenhuma autenticação configurada') !== false || 
        strpos($e->getMessage(), 'Service Account') !== false) {
        jsonError('Google Drive não autorizado. Um administrador precisa autorizar o acesso OAuth primeiro. Acesse: /api/oauth-drive.php', 503);
    } else {
        jsonError('Erro ao conectar com Google Drive: ' . $e->getMessage(), 503);
    }
}

// GET: Listar arquivos
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $folder = $_GET['folder'] ?? '*';
        
        // Verificar acesso à pasta
        if (!canAccessFolder($user, $folder)) {
            jsonError('Sem acesso a esta pasta', 403);
        }
        
        // Usar Google Drive
        try {
            // Converter pasta do usuário para caminho do Google Drive
            $driveFolder = convertUserFolderToDrivePath($user, $folder);
            $files = $driveService->listFiles($driveFolder, true);
            
            jsonResponse([
                'files' => $files,
                'folder' => $folder,
                'driveFolder' => $driveFolder,
                'storage' => 'google_drive'
            ]);
        } catch (Exception $e) {
            error_log('Erro ao listar arquivos do Google Drive: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            jsonResponse([
                'files' => [],
                'folder' => $folder,
                'error' => 'Erro ao conectar com Google Drive',
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    } catch (Exception $e) {
        error_log('Erro geral em files.php: ' . $e->getMessage());
        error_log('Stack trace: ' . $e->getTraceAsString());
        jsonError('Erro ao processar requisição: ' . $e->getMessage(), 500);
    }
}

// POST: Upload de arquivo
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $folder = $_POST['folder'] ?? ($user['folder'] ?? '*');
        
        // Verificar permissão de upload
        if (!hasPermission($user, 'upload', $folder)) {
            jsonError('Sem permissão para upload', 403);
        }
        
        // Verificar acesso à pasta
        if (!canAccessFolder($user, $folder)) {
            jsonError('Sem acesso a esta pasta', 403);
        }
        
        // Verificar se arquivo foi enviado
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            jsonError('Nenhum arquivo enviado ou erro no upload', 400);
        }
        
        // Upload para Google Drive
        try {
            $uploadedFile = $_FILES['file'];
            $fileName = $uploadedFile['name'];
            $tmpPath = $uploadedFile['tmp_name'];
            
            // Converter pasta do usuário para caminho do Google Drive
            $driveFolder = convertUserFolderToDrivePath($user, $folder);
            $result = $driveService->uploadFile($tmpPath, $fileName, $driveFolder);
            
            jsonResponse([
                'success' => true,
                'message' => 'Arquivo enviado com sucesso',
                'file' => $result,
                'folder' => $folder,
                'storage' => 'google_drive'
            ]);
        } catch (Exception $e) {
            error_log('Erro ao fazer upload: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            jsonError('Erro ao fazer upload: ' . $e->getMessage(), 500);
        }
    } catch (Exception $e) {
        error_log('Erro geral em files.php (POST): ' . $e->getMessage());
        error_log('Stack trace: ' . $e->getTraceAsString());
        jsonError('Erro ao processar upload: ' . $e->getMessage(), 500);
    }
}

// DELETE: Deletar arquivo
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $fileId = $_GET['id'] ?? null;
    $folder = $_GET['folder'] ?? '*';
    
    if (!$fileId) {
        jsonError('ID do arquivo é obrigatório');
    }
    
    // Verificar permissão de delete
    if (!hasPermission($user, 'delete', $folder)) {
        jsonError('Sem permissão para deletar', 403);
    }
    
    // Verificar acesso à pasta
    if (!canAccessFolder($user, $folder)) {
        jsonError('Sem acesso a esta pasta', 403);
    }
    
    // Deletar do Google Drive
    try {
        $driveService->deleteFile($fileId);
        jsonResponse([
            'success' => true,
            'message' => 'Arquivo deletado com sucesso',
            'storage' => 'google_drive'
        ]);
    } catch (Exception $e) {
        error_log('Erro ao deletar arquivo: ' . $e->getMessage());
        jsonError('Erro ao deletar arquivo: ' . $e->getMessage(), 500);
    }
}

/**
 * Converter pasta do usuário para caminho do Google Drive
 */
function convertUserFolderToDrivePath($user, $folder) {
    // Se for ROOT ou ADMIN, pode acessar qualquer pasta
    if ($user['role'] === 'root' || $user['role'] === 'admin') {
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

jsonError('Método não permitido', 405);
?>

