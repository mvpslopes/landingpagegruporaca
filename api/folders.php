<?php
/**
 * Listar Pastas Disponíveis
 * Para ROOT/ADMIN: lista todas as pastas do Google Drive
 * Para USER: lista apenas sua pasta
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

// GET: Listar pastas disponíveis
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $folders = [];
        
        // Se for ROOT, ADMIN ou VIEWER, listar todas as pastas da raiz do Google Drive
        if ($user['role'] === 'root' || $user['role'] === 'admin' || $user['role'] === 'viewer') {
            // Adicionar opção "Todas" primeiro
            $folders[] = [
                'id' => '*',
                'name' => 'Todas',
                'path' => '*'
            ];
            
            // Tentar listar pastas do Google Drive (opcional - se falhar, retorna apenas "Todas")
            try {
                // Listar arquivos da raiz do Google Drive (usar '*' para raiz)
                $allFiles = $driveService->listFiles('*', true);
                
                // Extrair nomes únicos de pastas (primeiro nível)
                $folderNames = [];
                if (is_array($allFiles)) {
                    foreach ($allFiles as $item) {
                        if (isset($item['type']) && $item['type'] === 'folder') {
                            $folderName = $item['name'] ?? '';
                            // Filtrar pastas com nome "*" ou vazio
                            // Normalizar para maiúsculas para consistência
                            $folderName = strtoupper(trim($folderName));
                            if (!empty($folderName) && $folderName !== '*' && !in_array($folderName, $folderNames)) {
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
            } catch (Error $e) {
                // Capturar erros fatais também
                error_log('Erro fatal ao listar pastas do Google Drive: ' . $e->getMessage());
                error_log('Arquivo: ' . $e->getFile() . ' Linha: ' . $e->getLine());
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
        
        // Limpar qualquer output antes de enviar JSON
        ob_clean();
        
        jsonResponse([
            'folders' => $folders,
            'userRole' => $user['role']
        ]);
    } catch (Exception $e) {
        error_log('Erro ao listar pastas: ' . $e->getMessage());
        error_log('Stack trace: ' . $e->getTraceAsString());
        
        // Limpar qualquer output antes de enviar JSON
        ob_clean();
        
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
    } catch (Error $e) {
        error_log('Erro fatal ao listar pastas: ' . $e->getMessage());
        error_log('Arquivo: ' . $e->getFile() . ' Linha: ' . $e->getLine());
        error_log('Stack trace: ' . $e->getTraceAsString());
        
        // Limpar qualquer output antes de enviar JSON
        ob_clean();
        
        // Em caso de erro fatal, retornar pelo menos "Todas"
        jsonResponse([
            'folders' => [[
                'id' => '*',
                'name' => 'Todas',
                'path' => '*'
            ]],
            'userRole' => $user['role'] ?? 'user',
            'error' => 'Erro fatal ao carregar pastas: ' . $e->getMessage()
        ]);
    }
}

jsonError('Método não permitido', 405);
?>

