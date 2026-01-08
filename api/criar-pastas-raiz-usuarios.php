<?php
/**
 * Script para criar pastas raiz dos usuários no Google Drive
 * 
 * Este script cria automaticamente as pastas raiz de todos os usuários
 * que têm uma pasta definida no banco de dados.
 * 
 * Uso: Acesse via navegador ou execute via linha de comando
 */

require_once 'config.php';
require_once 'permissions_db.php';
require_once 'drive_service.php';
require_once 'oauth_token_storage.php';

// Verificar autenticação (apenas ROOT pode executar)
$user = requireAuth();
if ($user['role'] !== 'root') {
    jsonError('Apenas usuários ROOT podem executar este script', 403);
}

// Carregar DriveService
$driveService = null;
try {
    $oauthToken = OAuthTokenStorage::loadToken();
    $driveService = new DriveService($oauthToken);
} catch (Exception $e) {
    error_log('Erro ao carregar DriveService: ' . $e->getMessage());
    jsonError('Erro ao conectar com Google Drive: ' . $e->getMessage(), 503);
}

// Carregar todos os usuários
$users = loadUsers();
$results = [
    'success' => [],
    'errors' => [],
    'skipped' => []
];

foreach ($users as $userData) {
    $userFolder = $userData['folder'] ?? '';
    
    // Pular usuários sem pasta definida ou com pasta '*'
    if (empty($userFolder) || $userFolder === '*') {
        $results['skipped'][] = [
            'user' => $userData['email'],
            'reason' => 'Pasta não definida ou é raiz (*)'
        ];
        continue;
    }
    
    // Pular ROOT e ADMIN (não precisam de pasta específica)
    if ($userData['role'] === 'root' || $userData['role'] === 'admin') {
        $results['skipped'][] = [
            'user' => $userData['email'],
            'reason' => 'Usuário ROOT/ADMIN não precisa de pasta específica'
        ];
        continue;
    }
    
    try {
        // Verificar se a pasta já existe
        $folderId = $driveService->getFolderIdByName($userFolder, $driveService->getRootFolderId());
        
        if ($folderId) {
            $results['skipped'][] = [
                'user' => $userData['email'],
                'folder' => $userFolder,
                'reason' => 'Pasta já existe'
            ];
        } else {
            // Criar a pasta na raiz do Google Drive
            $folderId = $driveService->createFolder($userFolder, $driveService->getRootFolderId());
            
            $results['success'][] = [
                'user' => $userData['email'],
                'folder' => $userFolder,
                'folderId' => $folderId
            ];
        }
    } catch (Exception $e) {
        error_log("Erro ao criar pasta para {$userData['email']}: " . $e->getMessage());
        $results['errors'][] = [
            'user' => $userData['email'],
            'folder' => $userFolder,
            'error' => $e->getMessage()
        ];
    }
}

// Retornar resultados
jsonResponse([
    'message' => 'Processamento concluído',
    'summary' => [
        'total_users' => count($users),
        'created' => count($results['success']),
        'skipped' => count($results['skipped']),
        'errors' => count($results['errors'])
    ],
    'results' => $results
]);
?>

