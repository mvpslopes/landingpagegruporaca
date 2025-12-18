<?php
/**
 * Listar Pastas Disponíveis
 * Para ROOT/ADMIN: lista todas as pastas do Backblaze B2
 * Para USER: lista apenas sua pasta
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
    jsonError('Backblaze B2 não configurado', 503);
}

// GET: Listar pastas disponíveis
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $folders = [];
        
        // Se for ROOT ou ADMIN, listar todas as pastas da raiz do B2
        if ($user['role'] === 'root' || $user['role'] === 'admin') {
            // Listar todos os arquivos para extrair nomes de pastas
            try {
                $allFiles = $b2Service->listFiles('*', true);
                
                // Extrair nomes únicos de pastas (primeiro nível)
                $folderNames = [];
                foreach ($allFiles as $item) {
                    if ($item['type'] === 'folder') {
                        $folderName = $item['name'];
                        // Se a pasta está na raiz (não tem / no nome), adicionar
                        if (strpos($folderName, '/') === false && !in_array($folderName, $folderNames)) {
                            $folderNames[] = $folderName;
                        }
                    } else {
                        // Para arquivos, extrair a primeira parte do caminho do fileName
                        // No B2, o caminho está no fileName, não no folder
                        $fileName = $item['name'] ?? '';
                        if (strpos($fileName, '/') !== false) {
                            $pathParts = explode('/', $fileName);
                            $firstPart = $pathParts[0];
                            if (!empty($firstPart) && !in_array($firstPart, $folderNames)) {
                                $folderNames[] = $firstPart;
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
                
                // Ordenar por nome
                usort($folders, function($a, $b) {
                    return strcmp($a['name'], $b['name']);
                });
            } catch (Exception $e) {
                // Se houver erro ao listar do B2, continuar com lista vazia
                error_log('Erro ao listar pastas do B2: ' . $e->getMessage());
            }
            
            // Adicionar opção "Todas" no início
            array_unshift($folders, [
                'id' => '*',
                'name' => 'Todas',
                'path' => '*'
            ]);
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
        
        jsonResponse([
            'folders' => $folders,
            'userRole' => $user['role']
        ]);
    } catch (Exception $e) {
        error_log('Erro ao listar pastas: ' . $e->getMessage());
        jsonError('Erro ao listar pastas: ' . $e->getMessage(), 500);
    }
}

jsonError('Método não permitido', 405);
?>

