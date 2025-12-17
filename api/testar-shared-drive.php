<?php
/**
 * Script para verificar se a pasta está em Shared Drive
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/html; charset=utf-8');

try {
    require_once __DIR__ . '/drive_service.php';
    
    $driveService = new DriveService();
    $service = $driveService->getService();
    $config = $driveService->getConfig();
    
    $rootFolderId = $config['root_folder_id'];
    
    echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Verificar Shared Drive</title>";
    echo "<style>body{font-family:Arial,sans-serif;max-width:800px;margin:20px auto;padding:20px;}";
    echo ".success{color:green;font-weight:bold;}.error{color:red;font-weight:bold;}.info{color:blue;}";
    echo "pre{background:#f5f5f5;padding:10px;border-radius:5px;overflow-x:auto;}</style></head><body>";
    echo "<h1>🔍 Verificar se Pasta está em Shared Drive</h1>";
    echo "<p>Verificando pasta ID: <strong>{$rootFolderId}</strong></p>";
    
    try {
        $folder = $service->files->get($rootFolderId, [
            'fields' => 'id, name, mimeType, driveId, owners, shared',
            'supportsAllDrives' => true
        ]);
        
        $isInSharedDrive = !empty($folder->getDriveId());
        $driveId = $folder->getDriveId();
        
        echo "<h2>📊 Resultado</h2>";
        
        if ($isInSharedDrive) {
            echo "<p class='success'>✅ A pasta ESTÁ em um Shared Drive!</p>";
            echo "<p><strong>Drive ID:</strong> {$driveId}</p>";
            echo "<p class='success'>O problema de quota DEVERIA estar resolvido.</p>";
            echo "<p>Se ainda não funcionar, verifique:</p>";
            echo "<ul>";
            echo "<li>Se a Service Account tem permissão no Shared Drive</li>";
            echo "<li>Se a Service Account tem permissão de <strong>Editor</strong> ou superior</li>";
            echo "<li>Se a Service Account foi adicionada como membro do Shared Drive</li>";
            echo "</ul>";
        } else {
            echo "<p class='error'>❌ A pasta NÃO está em um Shared Drive.</p>";
            echo "<p class='error'>A pasta está em uma conta Google pessoal.</p>";
            echo "<p><strong>Proprietário:</strong> ";
            if ($folder->getOwners() && count($folder->getOwners()) > 0) {
                echo $folder->getOwners()[0]->getEmailAddress();
            } else {
                echo "N/A";
            }
            echo "</p>";
            echo "<h3>🔧 Solução Necessária</h3>";
            echo "<p>Para resolver o problema de quota, você precisa:</p>";
            echo "<ol>";
            echo "<li><strong>Criar um Shared Drive</strong> (requer Google Workspace)</li>";
            echo "<li><strong>Mover a pasta</strong> para o Shared Drive</li>";
            echo "<li><strong>Adicionar a Service Account</strong> como membro do Shared Drive</li>";
            echo "</ol>";
            echo "<p class='error'>Sem Shared Drive, o problema de quota NÃO pode ser resolvido.</p>";
        }
        
        echo "<h2>📋 Informações da Pasta</h2>";
        echo "<pre>";
        echo "ID: " . $folder->getId() . "\n";
        echo "Nome: " . $folder->getName() . "\n";
        echo "Tipo: " . $folder->getMimeType() . "\n";
        echo "Drive ID: " . ($driveId ?: "N/A (não é Shared Drive)") . "\n";
        echo "Compartilhada: " . ($folder->getShared() ? "Sim" : "Não") . "\n";
        if ($folder->getOwners() && count($folder->getOwners()) > 0) {
            echo "Proprietário: " . $folder->getOwners()[0]->getEmailAddress() . "\n";
        }
        echo "</pre>";
        
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

