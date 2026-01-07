<?php
/**
 * Listar Pastas Disponíveis
 * Para ROOT/ADMIN: lista todas as pastas do Google Drive
 * Para USER: lista apenas sua pasta
 */

// Limpar qualquer output anterior
if (ob_get_level() > 0) {
    ob_clean();
}

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

// GET: Listar pastas disponíveis
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $folders = [];
        
        // Se for ROOT ou ADMIN, listar todas as pastas da raiz do Google Drive
        if ($user['role'] === 'root' || $user['role'] === 'admin') {
            // Adicionar opção "Todas" primeiro
            $folders[] = [
                'id' => '*',
                'name' => 'Todas',
                'path' => '*'
            ];
            
            // Tentar listar pastas do Google Drive (opcional - se falhar, retorna apenas "Todas")
            try {
                // Listar arquivos da raiz do Google Drive
                $allFiles = $driveService->listFiles('', true);
                
                // Extrair nomes únicos de pastas (primeiro nível)
                $folderNames = [];
                if (is_array($allFiles)) {
                    foreach ($allFiles as $item) {
                        if (isset($item['type']) && $item['type'] === 'folder') {
                            $folderName = $item['name'] ?? '';
                            if (!empty($folderName) && !in_array($folderName, $folderNames)) {
                                $folderNames[] = $folderName;
                            }
                        }
                    }
                }
                
                // Adicionar pastas encontradas
                foreach ($folderNames as $folderName) {
                    $folders[] = [
                        'id' => $folderName,
                        'name' => $folderName,
                        'path' => $folderName
                    ];
                }
                
                // Ordenar por nome (mantendo "Todas" no início)
                if (count($folders) > 1) {
                    $todas = array_shift($folders);
                    usort($folders, function($a, $b) {
                        return strcmp($a['name'], $b['name']);
                    });
                    array_unshift($folders, $todas);
                }
            } catch (Exception $e) {
                // Se houver erro ao listar do Google Drive, continuar com apenas "Todas"
                error_log('Erro ao listar pastas do Google Drive: ' . $e->getMessage());
                error_log('Stack trace: ' . $e->getTraceAsString());
                // Já temos "Todas" na lista, então apenas continuar
            }
        } else {
            // Se for USER, retornar apenas sua pasta (definida no banco de dados)
            $userFolder = $user['folder'] ?? '';
            
            // Se o usuário tem uma pasta definida, retornar ela
            if (!empty($userFolder) && $userFolder !== '*') {
                $folders[] = [
                    'id' => $userFolder,
                    'name' => $userFolder,
                    'path' => $userFolder
                ];
            } else {
                // Se não tem pasta definida, retornar "Todas" (raiz)
                $folders[] = [
                    'id' => '*',
                    'name' => 'Todas',
                    'path' => '*'
                ];
            }
        }
        
        // Garantir que sempre retornamos pelo menos "Todas"
        if (empty($folders)) {
            $folders = [[
                'id' => '*',
                'name' => 'Todas',
                'path' => '*'
            ]];
        }
        
        jsonResponse([
            'folders' => $folders,
            'userRole' => $user['role']
        ]);
    } catch (Exception $e) {
        error_log('Erro ao listar pastas: ' . $e->getMessage());
        error_log('Stack trace: ' . $e->getTraceAsString());
        
        // Em caso de erro, retornar pelo menos "Todas"
        jsonResponse([
            'folders' => [[
                'id' => '*',
                'name' => 'Todas',
                'path' => '*'
            ]],
            'userRole' => $user['role'] ?? 'user',
            'error' => 'Erro ao carregar pastas: ' . $e->getMessage()
        ]);
    }
}

jsonError('Método não permitido', 405);
?>

