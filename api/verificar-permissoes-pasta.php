<?php
/**
 * Script para verificar permissões da pasta no Google Drive
 * 
 * Este script verifica se a pasta raiz está compartilhada corretamente
 * com a Service Account e se tem as permissões necessárias.
 */

// Não requer autenticação para este script de diagnóstico
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/html; charset=utf-8');

try {
    require_once __DIR__ . '/drive_service.php';

try {
    $driveService = new DriveService();
    $service = $driveService->getService();
    $config = $driveService->getConfig();
    
    $rootFolderId = $config['root_folder_id'];
    
    echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Verificação de Permissões - Google Drive</title>";
    echo "<style>body{font-family:Arial,sans-serif;max-width:800px;margin:20px auto;padding:20px;}";
    echo ".success{color:green;}.error{color:red;}.warning{color:orange;}.info{color:blue;}";
    echo "pre{background:#f5f5f5;padding:10px;border-radius:5px;overflow-x:auto;}</style></head><body>";
    echo "<h1>🔍 Verificação de Permissões - Google Drive</h1>";
    echo "<p>Verificando permissões da pasta raiz...</p>";
    
    // Obter informações da pasta raiz
    try {
        $folder = $service->files->get($rootFolderId, [
            'fields' => 'id, name, mimeType, owners, permissions, shared, driveId, parents',
            'supportsAllDrives' => true
        ]);
        
        $info = [
            'id' => $folder->getId(),
            'name' => $folder->getName(),
            'mimeType' => $folder->getMimeType(),
            'isShared' => $folder->getShared(),
            'isInSharedDrive' => !empty($folder->getDriveId()),
            'driveId' => $folder->getDriveId(),
            'owners' => [],
            'permissions' => []
        ];
        
        // Obter proprietários
        if ($folder->getOwners()) {
            foreach ($folder->getOwners() as $owner) {
                $info['owners'][] = [
                    'emailAddress' => $owner->getEmailAddress(),
                    'displayName' => $owner->getDisplayName(),
                    'kind' => $owner->getKind()
                ];
            }
        }
        
        // Obter permissões
        $permissions = $service->permissions->listPermissions($rootFolderId, [
            'fields' => 'permissions(id, type, role, emailAddress, displayName)',
            'supportsAllDrives' => true
        ]);
        
        if ($permissions->getPermissions()) {
            foreach ($permissions->getPermissions() as $permission) {
                $info['permissions'][] = [
                    'id' => $permission->getId(),
                    'type' => $permission->getType(),
                    'role' => $permission->getRole(),
                    'emailAddress' => $permission->getEmailAddress(),
                    'displayName' => $permission->getDisplayName()
                ];
            }
        }
        
        // Verificar se Service Account tem permissão
        $serviceAccountEmail = 'grupo-raca-drive-service@tidal-triumph-481417-g3.iam.gserviceaccount.com';
        $hasServiceAccountPermission = false;
        $serviceAccountRole = null;
        
        foreach ($info['permissions'] as $perm) {
            if (isset($perm['emailAddress']) && 
                strpos($perm['emailAddress'], $serviceAccountEmail) !== false) {
                $hasServiceAccountPermission = true;
                $serviceAccountRole = $perm['role'];
                break;
            }
        }
        
        $info['serviceAccountHasAccess'] = $hasServiceAccountPermission;
        $info['serviceAccountRole'] = $serviceAccountRole;
        $info['serviceAccountEmail'] = $serviceAccountEmail;
        
        // Diagnóstico
        $diagnosis = [];
        
        if (!$info['isShared']) {
            $diagnosis[] = '⚠️ A pasta NÃO está compartilhada. Ela precisa estar compartilhada com a Service Account.';
        }
        
        if (!$hasServiceAccountPermission) {
            $diagnosis[] = '❌ A Service Account NÃO tem permissão nesta pasta.';
            $diagnosis[] = "   Adicione: {$serviceAccountEmail} como Editor";
        } else {
            if ($serviceAccountRole !== 'writer' && $serviceAccountRole !== 'owner') {
                $diagnosis[] = "⚠️ A Service Account tem permissão '{$serviceAccountRole}', mas precisa ser 'writer' (Editor) ou 'owner'.";
            } else {
                $diagnosis[] = '✅ A Service Account tem permissão adequada.';
            }
        }
        
        if ($info['isInSharedDrive']) {
            $diagnosis[] = '✅ A pasta está em um Shared Drive (Google Workspace).';
        } else {
            $diagnosis[] = 'ℹ️ A pasta está em uma conta Google pessoal.';
            if (count($info['owners']) > 0) {
                $ownerEmail = $info['owners'][0]['emailAddress'] ?? 'N/A';
                $diagnosis[] = "   Proprietário: {$ownerEmail}";
            }
        }
        
        echo "<h2>📊 Informações da Pasta</h2>";
        echo "<pre>" . json_encode($info, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "</pre>";
        
        echo "<h2>🔍 Diagnóstico</h2>";
        echo "<ul>";
        foreach ($diagnosis as $item) {
            $class = 'info';
            if (strpos($item, '✅') !== false) $class = 'success';
            if (strpos($item, '❌') !== false) $class = 'error';
            if (strpos($item, '⚠️') !== false) $class = 'warning';
            echo "<li class='{$class}'>" . htmlspecialchars($item) . "</li>";
        }
        echo "</ul>";
        
        echo "<h2>💡 Recomendações</h2>";
        echo "<ol>";
        echo "<li>Certifique-se de que a pasta está compartilhada com a Service Account</li>";
        echo "<li>A Service Account precisa ter permissão de Editor (writer)</li>";
        echo "<li>Se a pasta estiver em conta pessoal, o proprietário precisa ter espaço disponível</li>";
        echo "<li>Verifique se todas as subpastas também estão compartilhadas</li>";
        echo "</ol>";
        
    } catch (Exception $e) {
        echo "<h2 class='error'>❌ Erro ao verificar pasta</h2>";
        echo "<pre class='error'>" . htmlspecialchars($e->getMessage()) . "\n\n";
        echo "Código: " . $e->getCode() . "\n";
        echo "Trace:\n" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
    }
    
} catch (Exception $e) {
    echo "<h2 class='error'>❌ Erro ao inicializar</h2>";
    echo "<pre class='error'>" . htmlspecialchars($e->getMessage()) . "\n\n";
    echo "Trace:\n" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}

echo "</body></html>";
?>

