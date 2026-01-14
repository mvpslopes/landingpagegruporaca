<?php
/**
 * Gerenciamento de Arquivos
 * Integrado com Google Drive (Shared Drive)
 */

// Desabilitar exibição de erros e warnings
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Iniciar output buffering ANTES de qualquer coisa
if (ob_get_level() == 0) {
    ob_start();
} else {
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    ob_start();
}

// Capturar erros fatais
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== NULL && in_array($error['type'], [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE])) {
        ob_clean();
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(500);
        echo json_encode([
            'error' => 'Erro fatal: ' . $error['message'],
            'file' => $error['file'],
            'line' => $error['line']
        ]);
        exit;
    }
});

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
        
        // Para usuários USER, garantir que sempre usem sua pasta base se não especificada
        if ($user['role'] === 'user') {
            $userFolder = $user['folder'] ?? '';
            if (empty($folder) || $folder === '*') {
                // Se não especificou pasta, usar a pasta base do usuário
                if (!empty($userFolder) && $userFolder !== '*') {
                    $folder = $userFolder;
                }
            }
        }
        
        // Verificar acesso à pasta
        if (!canAccessFolder($user, $folder)) {
            jsonError('Sem acesso a esta pasta', 403);
        }
        
        // Usar Google Drive
        try {
            // Converter pasta do usuário para caminho do Google Drive
            $driveFolder = convertUserFolderToDrivePath($user, $folder);
            $files = $driveService->listFiles($driveFolder, true);
            
            // Para usuários USER, garantir que só vejam arquivos de sua pasta
            if ($user['role'] === 'user') {
                $userFolder = $user['folder'] ?? '';
                if (!empty($userFolder) && $userFolder !== '*') {
                    $filteredFiles = [];
                    foreach ($files as $file) {
                        // O arquivo está na pasta que foi solicitada (driveFolder)
                        // Se driveFolder começa com userFolder, então está correto
                        if (strpos($driveFolder, $userFolder) === 0 || $driveFolder === $userFolder) {
                            $filteredFiles[] = $file;
                        }
                    }
                    $files = $filteredFiles;
                }
            }
            
            // Limpar qualquer output antes de enviar JSON
            ob_clean();
            
            jsonResponse([
                'files' => $files,
                'folder' => $folder,
                'driveFolder' => $driveFolder,
                'storage' => 'google_drive'
            ]);
        } catch (Exception $e) {
            error_log('Erro ao listar arquivos do Google Drive: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            
            // Limpar qualquer output antes de enviar JSON
            ob_clean();
            
            // Limpar qualquer output antes de enviar JSON
            ob_clean();
            
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
        
        // Limpar qualquer output antes de enviar JSON
        ob_clean();
        
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

// DELETE: Deletar arquivo ou pasta
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $fileId = $_GET['id'] ?? null;
    $folder = $_GET['folder'] ?? '*';
    $type = $_GET['type'] ?? 'file'; // 'file' ou 'folder'
    
    if (!$fileId) {
        jsonError('ID do arquivo é obrigatório');
    }
    
    // Se for uma pasta, verificar se está vinculada a um usuário
    if ($type === 'folder') {
        // Obter o nome da pasta do Google Drive
        try {
            $file = $driveService->getService()->files->get($fileId, [
                'fields' => 'name',
                'supportsAllDrives' => true
            ]);
            $folderName = $file->getName();
            
            // Verificar se a pasta está vinculada a um usuário
            if (isFolderLinkedToUser($folderName)) {
                jsonError('Não é possível deletar esta pasta. Ela está vinculada a um perfil de usuário.', 403);
            }
        } catch (Exception $e) {
            error_log('Erro ao verificar pasta antes de deletar: ' . $e->getMessage());
            // Continuar com a verificação de permissão mesmo se houver erro
        }
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
            'message' => ($type === 'folder' ? 'Pasta' : 'Arquivo') . ' deletado com sucesso',
            'storage' => 'google_drive'
        ]);
    } catch (Exception $e) {
        error_log('Erro ao deletar arquivo: ' . $e->getMessage());
        jsonError('Erro ao deletar arquivo: ' . $e->getMessage(), 500);
    }
}

// PATCH: Renomear arquivo ou pasta
if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $fileId = $data['id'] ?? null;
        $newName = trim($data['name'] ?? '');
        $folder = $data['folder'] ?? '*';
        $type = $data['type'] ?? 'file';
        
        if (!$fileId || empty($newName)) {
            jsonError('ID e novo nome são obrigatórios', 400);
        }
        
        // Validar nome (deve estar em maiúsculas)
        if (preg_match('/[a-z]/', $newName)) {
            jsonError('O nome deve estar em MAIÚSCULAS', 400);
        }
        
        // Se for uma pasta, verificar se está vinculada a um usuário
        if ($type === 'folder') {
            // Obter o nome atual da pasta do Google Drive
            try {
                $file = $driveService->getService()->files->get($fileId, [
                    'fields' => 'name',
                    'supportsAllDrives' => true
                ]);
                $currentFolderName = $file->getName();
                
                // Verificar se a pasta atual está vinculada a um usuário
                if (isFolderLinkedToUser($currentFolderName)) {
                    jsonError('Não é possível renomear esta pasta. Ela está vinculada a um perfil de usuário.', 403);
                }
                
                // Verificar se o novo nome também não está vinculado a outro usuário
                $normalizedNewName = strtoupper(trim($newName));
                if (isFolderLinkedToUser($normalizedNewName)) {
                    jsonError('O novo nome da pasta está vinculado a outro perfil de usuário. Escolha outro nome.', 403);
                }
            } catch (Exception $e) {
                error_log('Erro ao verificar pasta antes de renomear: ' . $e->getMessage());
                // Continuar com a verificação de permissão mesmo se houver erro
            }
        }
        
        // Verificar permissão de upload (necessária para renomear)
        if (!hasPermission($user, 'upload', $folder)) {
            jsonError('Sem permissão para renomear', 403);
        }
        
        // Verificar acesso à pasta
        if (!canAccessFolder($user, $folder)) {
            jsonError('Sem acesso a esta pasta', 403);
        }
        
        // Renomear no Google Drive
        $driveService->renameFile($fileId, strtoupper($newName));
        
        jsonResponse([
            'success' => true,
            'message' => ($type === 'folder' ? 'Pasta' : 'Arquivo') . ' renomeado com sucesso',
            'storage' => 'google_drive'
        ]);
    } catch (Exception $e) {
        error_log('Erro ao renomear: ' . $e->getMessage());
        jsonError('Erro ao renomear: ' . $e->getMessage(), 500);
    }
}

// PUT: Mover arquivo ou pasta
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $fileId = $data['id'] ?? null;
        $fromFolder = $data['fromFolder'] ?? '*';
        $toFolder = $data['toFolder'] ?? '*';
        $type = $data['type'] ?? 'file';
        
        if (!$fileId) {
            jsonError('ID do arquivo é obrigatório', 400);
        }
        
        // Verificar permissão de upload (necessária para mover)
        if (!hasPermission($user, 'upload', $fromFolder) || !hasPermission($user, 'upload', $toFolder)) {
            jsonError('Sem permissão para mover', 403);
        }
        
        // Verificar acesso às pastas
        if (!canAccessFolder($user, $fromFolder) || !canAccessFolder($user, $toFolder)) {
            jsonError('Sem acesso a uma das pastas', 403);
        }
        
        // Converter pastas para caminhos do Google Drive
        $driveFromFolder = convertUserFolderToDrivePath($user, $fromFolder);
        $driveToFolder = convertUserFolderToDrivePath($user, $toFolder);
        
        // Obter IDs das pastas
        $fromFolderId = $driveFromFolder === '*' 
            ? $driveService->getRootFolderId()
            : $driveService->ensureFolder($driveFromFolder);
        
        $toFolderId = $driveToFolder === '*'
            ? $driveService->getRootFolderId()
            : $driveService->ensureFolder($driveToFolder);
        
        // Mover no Google Drive
        $driveService->moveFile($fileId, $toFolderId, $fromFolderId);
        
        jsonResponse([
            'success' => true,
            'message' => ($type === 'folder' ? 'Pasta' : 'Arquivo') . ' movido com sucesso',
            'storage' => 'google_drive'
        ]);
    } catch (Exception $e) {
        error_log('Erro ao mover: ' . $e->getMessage());
        jsonError('Erro ao mover: ' . $e->getMessage(), 500);
    }
}

/**
 * Converter pasta do usuário para caminho do Google Drive
 */
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

jsonError('Método não permitido', 405);
?>

