<?php
/**
 * Script SIMPLES para verificar se a pasta está em Shared Drive
 * Versão sem dependências complexas
 */

// Configurações básicas
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/plain; charset=utf-8');

echo "=== VERIFICAR SE PASTA ESTA EM SHARED DRIVE ===\n\n";

// ID da pasta
$rootFolderId = '1v8BQP6rK7659-bbhlvkT10RQcZDOEMXY';
echo "Pasta ID: {$rootFolderId}\n\n";

try {
    // Tentar carregar apenas o necessário
    $autoloadPath = __DIR__ . '/vendor/autoload.php';
    if (!file_exists($autoloadPath)) {
        throw new Exception('Autoloader não encontrado');
    }
    
    require_once $autoloadPath;
    
    // Carregar aliases
    $aliasesPath = __DIR__ . '/src/aliases.php';
    if (file_exists($aliasesPath)) {
        require_once $aliasesPath;
    }
    
    // Carregar configuração
    $configPath = __DIR__ . '/config/drive_config.php';
    if (!file_exists($configPath)) {
        throw new Exception('Config não encontrado');
    }
    $config = require $configPath;
    
    // Inicializar cliente
    $client = new Google_Client();
    $client->setAuthConfig($config['credentials_path']);
    $client->setScopes($config['scopes']);
    
    $service = new Google_Service_Drive($client);
    
    echo "Conectando ao Google Drive...\n";
    
    // Obter informações da pasta
    $folder = $service->files->get($rootFolderId, [
        'fields' => 'id, name, driveId, owners',
        'supportsAllDrives' => true
    ]);
    
    echo "Pasta encontrada: {$folder->getName()}\n\n";
    
    $driveId = $folder->getDriveId();
    $isInSharedDrive = !empty($driveId);
    
    if ($isInSharedDrive) {
        echo "RESULTADO: ✅ A pasta ESTA em um Shared Drive!\n";
        echo "Drive ID: {$driveId}\n";
        echo "\nO problema de quota DEVERIA estar resolvido.\n";
        echo "Se ainda nao funcionar, verifique se a Service Account tem permissao no Shared Drive.\n";
    } else {
        echo "RESULTADO: ❌ A pasta NAO esta em um Shared Drive.\n";
        echo "A pasta esta em uma conta Google pessoal.\n";
        if ($folder->getOwners() && count($folder->getOwners()) > 0) {
            echo "Proprietario: {$folder->getOwners()[0]->getEmailAddress()}\n";
        }
        echo "\nSOLUCAO: Criar um Shared Drive (requer Google Workspace)\n";
        echo "Sem Shared Drive, o problema de quota NAO pode ser resolvido.\n";
    }
    
} catch (Exception $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
    echo "\nTrace:\n" . $e->getTraceAsString() . "\n";
}

?>

