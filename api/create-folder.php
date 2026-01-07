<?php
/**
 * Criar Subpasta
 * Permite criar subpastas dentro da pasta atual do usuário
 */

require_once 'config.php';
require_once 'permissions_db.php';

$user = requireAuth();

// Função para converter pasta do usuário para caminho do Google Drive
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
        // Se o usuário especificou uma subpasta, adicionar à pasta dele
        if ($folder !== '*' && $folder !== $userFolder) {
            return $userFolder . '/' . ltrim($folder, '/');
        }
        return $userFolder;
    }
    
    return '*';
}

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

// POST: Criar subpasta
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $folderName = trim($data['folderName'] ?? '');
        $parentFolder = $data['parentFolder'] ?? '*';
        
        if (empty($folderName)) {
            jsonError('Nome da pasta é obrigatório', 400);
        }
        
        // Validar nome da pasta (sem caracteres especiais perigosos)
        if (preg_match('/[<>:"|?*\\\\]/', $folderName)) {
            jsonError('Nome da pasta contém caracteres inválidos', 400);
        }
        
        // Verificar permissão de upload (necessária para criar pastas)
        if (!hasPermission($user, 'upload', $parentFolder)) {
            jsonError('Sem permissão para criar pastas nesta pasta', 403);
        }
        
        // Verificar acesso à pasta pai
        if (!canAccessFolder($user, $parentFolder)) {
            jsonError('Sem acesso a esta pasta', 403);
        }
        
        // Criar pasta no Google Drive
        $driveFolder = convertUserFolderToDrivePath($user, $parentFolder);
        // ensureFolder retorna o ID da pasta (cria se não existir)
        $parentFolderId = $driveService->ensureFolder($driveFolder);
        // Criar a nova pasta dentro da pasta pai
        $folderId = $driveService->createFolder($folderName, $parentFolderId);
        
        // Construir o caminho completo da nova pasta
        $newFolderPath = $driveFolder === '*' 
            ? $folderName 
            : $driveFolder . '/' . $folderName;
        
        jsonResponse([
            'success' => true,
            'message' => 'Subpasta criada com sucesso',
            'folder' => [
                'id' => $folderId,
                'name' => $folderName,
                'path' => $newFolderPath
            ],
            'storage' => 'google_drive'
        ]);
    } catch (Exception $e) {
        error_log('Erro ao criar subpasta: ' . $e->getMessage());
        jsonError('Erro ao criar subpasta: ' . $e->getMessage(), 500);
    }
}

jsonError('Método não permitido', 405);
?>

