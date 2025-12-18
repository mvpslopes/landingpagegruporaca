<?php
/**
 * Gerenciamento de Arquivos
 * Integrado com Backblaze B2 Cloud Storage
 */

require_once 'config.php';
require_once 'permissions_db.php';

$user = requireAuth();

// Tentar carregar B2Service
$b2Service = null;
try {
    require_once __DIR__ . '/b2_service.php';
    $b2Service = new B2Service();
} catch (Exception $e) {
    error_log('Erro ao carregar B2Service: ' . $e->getMessage());
    // Continuar sem B2Service (modo simulado)
}

// GET: Listar arquivos
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $folder = $_GET['folder'] ?? '*';
    
    // Verificar acesso à pasta
    if (!canAccessFolder($user, $folder)) {
        jsonError('Sem acesso a esta pasta', 403);
    }
    
    // Se B2Service estiver disponível, usar Backblaze B2
    if ($b2Service) {
        try {
            // Converter pasta do usuário para caminho do B2
            $b2Folder = convertUserFolderToB2Path($user, $folder);
            $files = $b2Service->listFiles($b2Folder, true);
            
            jsonResponse([
                'files' => $files,
                'folder' => $folder,
                'b2Folder' => $b2Folder
            ]);
        } catch (Exception $e) {
            error_log('Erro ao listar arquivos do B2: ' . $e->getMessage());
            jsonResponse([
                'files' => [],
                'folder' => $folder,
                'error' => 'Erro ao conectar com Backblaze B2',
                'message' => $e->getMessage()
            ]);
        }
    } else {
        // Modo simulado (quando B2Service não está disponível)
        jsonResponse([
            'files' => [],
            'folder' => $folder,
            'message' => 'Backblaze B2 não configurado. Configure as credenciais no arquivo config/b2_config.php'
        ]);
    }
}

// POST: Upload de arquivo
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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
    
    // Se B2Service estiver disponível, fazer upload real
    try {
        // Criar B2Service
        require_once __DIR__ . '/b2_service.php';
        $b2ServiceInstance = new B2Service();
        
        $uploadedFile = $_FILES['file'];
        $fileName = $uploadedFile['name'];
        $tmpPath = $uploadedFile['tmp_name'];
        
        // Converter pasta do usuário para caminho do B2
        $b2Folder = convertUserFolderToB2Path($user, $folder);
        
        // Fazer upload
        $result = $b2ServiceInstance->uploadFile($tmpPath, $fileName, $b2Folder);
        
        jsonResponse([
            'success' => true,
            'message' => 'Arquivo enviado com sucesso',
            'file' => $result,
            'folder' => $folder
        ]);
    } catch (Exception $e) {
        error_log('Erro ao fazer upload: ' . $e->getMessage());
        jsonError('Erro ao fazer upload: ' . $e->getMessage(), 500);
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
    
    // Se B2Service estiver disponível, deletar do B2
    if ($b2Service) {
        try {
            // No B2, precisamos do fileName também para deletar
            $fileName = $_GET['fileName'] ?? null;
            if (!$fileName) {
                jsonError('Nome do arquivo é obrigatório para deletar', 400);
            }
            $b2Service->deleteFile($fileId, $fileName);
            jsonResponse([
                'success' => true,
                'message' => 'Arquivo deletado com sucesso'
            ]);
        } catch (Exception $e) {
            error_log('Erro ao deletar arquivo: ' . $e->getMessage());
            jsonError('Erro ao deletar arquivo: ' . $e->getMessage(), 500);
        }
    } else {
        jsonError('Backblaze B2 não configurado. Configure as credenciais no arquivo config/b2_config.php', 503);
    }
}

/**
 * Converter pasta do usuário para caminho do Backblaze B2
 */
function convertUserFolderToB2Path($user, $folder) {
    // Se for ROOT ou ADMIN, pode acessar qualquer pasta
    if ($user['role'] === 'root' || $user['role'] === 'admin') {
        if ($folder === '*') {
            return '*'; // Pasta raiz
        }
        return $folder; // Usar o caminho diretamente
    }
    
    // Se for USER, usar apenas sua pasta
    if ($user['role'] === 'user') {
        $userFolder = $user['folder'] ?? '*';
        if ($userFolder === '*') {
            return '*';
        }
        // Se o usuário especificou uma subpasta, adicionar à pasta dele
        if ($folder !== '*' && $folder !== $userFolder) {
            return $userFolder . '/' . ltrim($folder, '/');
        }
        return $userFolder;
    }
    
    return '*';
}

jsonError('Método não permitido', 405);
?>

