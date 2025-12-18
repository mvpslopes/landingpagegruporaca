<?php
/**
 * Criar Subpasta
 * Permite criar subpastas dentro da pasta atual do usuário
 */

require_once 'config.php';
require_once 'permissions_db.php';

$user = requireAuth();

// Função para converter pasta do usuário para caminho do Backblaze B2
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

// Tentar carregar B2Service
$b2Service = null;
try {
    require_once __DIR__ . '/b2_service.php';
    $b2Service = new B2Service();
} catch (Exception $e) {
    error_log('Erro ao carregar B2Service: ' . $e->getMessage());
    jsonError('Backblaze B2 não configurado', 503);
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
        
        // Converter pasta do usuário para caminho do Backblaze B2
        $b2Folder = convertUserFolderToB2Path($user, $parentFolder);
        
        // Criar a pasta usando B2Service
        $result = $b2Service->createFolder($folderName, $b2Folder);
        
        // Construir o caminho completo da nova pasta
        $newFolderPath = $b2Folder === '*' 
            ? $folderName 
            : $b2Folder . '/' . $folderName;
        
        jsonResponse([
            'success' => true,
            'message' => 'Subpasta criada com sucesso',
            'folder' => [
                'id' => $result['id'],
                'name' => $result['name'],
                'path' => $newFolderPath
            ]
        ]);
    } catch (Exception $e) {
        error_log('Erro ao criar subpasta: ' . $e->getMessage());
        jsonError('Erro ao criar subpasta: ' . $e->getMessage(), 500);
    }
}

jsonError('Método não permitido', 405);
?>

