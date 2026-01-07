<?php
/**
 * Verificar acesso ao Google Drive Shared Drive
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 Verificar Acesso ao Google Drive</h1>";
echo "<hr>";

// 1. Verificar sessão
echo "<h2>1. Sessão e Token OAuth</h2>";
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user'])) {
    die("✗ Nenhum usuário logado. Faça login primeiro.");
}

echo "✓ Usuário logado: " . htmlspecialchars($_SESSION['user']['email']) . "<br>";

if (!isset($_SESSION['oauth_tokens']['central'])) {
    die("✗ Token OAuth não encontrado. Autorize o Google Drive primeiro em: <a href='oauth-drive-simple.php'>oauth-drive-simple.php</a>");
}

echo "✓ Token OAuth encontrado<br>";
$token = $_SESSION['oauth_tokens']['central'];
echo "Autorizado por: " . htmlspecialchars($token['authorized_by'] ?? 'N/A') . "<br><br>";

// 2. Carregar configuração
echo "<h2>2. Configuração</h2>";
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/drive_service.php';

$configPath = __DIR__ . '/config/drive_config.php';
$config = require $configPath;

echo "Root Folder ID: " . htmlspecialchars($config['root_folder_id']) . "<br>";
echo "OAuth Client ID: " . (isset($config['oauth_client_id']) ? 'Configurado' : 'NÃO configurado') . "<br><br>";

// 3. Testar acesso
echo "<h2>3. Testar Acesso ao Google Drive</h2>";
try {
    $driveService = new DriveService($token);
    echo "✓ DriveService instanciado<br>";
    
    // Tentar acessar a pasta raiz
    $rootFolderId = $config['root_folder_id'];
    echo "Tentando acessar pasta: " . htmlspecialchars($rootFolderId) . "<br>";
    
    $service = $driveService->getService();
    
    // Obter informações da pasta
    try {
        $folder = $service->files->get($rootFolderId, [
            'fields' => 'id, name, driveId, shared, owners, permissions, capabilities',
            'supportsAllDrives' => true
        ]);
        
        echo "<h3>✓ Pasta Acessível!</h3>";
        echo "Nome: " . htmlspecialchars($folder->getName()) . "<br>";
        echo "ID: " . htmlspecialchars($folder->getId()) . "<br>";
        
        $driveId = $folder->getDriveId();
        if ($driveId) {
            echo "✓ Está em Shared Drive (ID: " . htmlspecialchars($driveId) . ")<br>";
        } else {
            echo "⚠️ NÃO está em Shared Drive (pasta pessoal)<br>";
        }
        
        // Verificar permissões
        if ($folder->getCapabilities()) {
            $caps = $folder->getCapabilities();
            echo "<h4>Permissões:</h4>";
            echo "Pode editar: " . ($caps->getCanEdit() ? 'SIM' : 'NÃO') . "<br>";
            echo "Pode compartilhar: " . ($caps->getCanShare() ? 'SIM' : 'NÃO') . "<br>";
            echo "Pode baixar: " . ($caps->getCanDownload() ? 'SIM' : 'NÃO') . "<br>";
        }
        
    } catch (Exception $e) {
        echo "<h3>✗ Erro ao acessar pasta</h3>";
        echo "Erro: " . htmlspecialchars($e->getMessage()) . "<br>";
        echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
        
        if (strpos($e->getMessage(), 'permission') !== false || strpos($e->getMessage(), '403') !== false) {
            echo "<h4>⚠️ Problema de Permissão Detectado</h4>";
            echo "<p><strong>Solução:</strong></p>";
            echo "<ol>";
            echo "<li>Acesse o Google Drive: <a href='https://drive.google.com' target='_blank'>https://drive.google.com</a></li>";
            echo "<li>Navegue até a pasta <strong>GRUPO_RACA</strong> (ID: " . htmlspecialchars($rootFolderId) . ")</li>";
            echo "<li>Clique com botão direito na pasta > <strong>Compartilhar</strong></li>";
            echo "<li>Adicione o email que autorizou o OAuth: <strong>" . htmlspecialchars($token['authorized_by'] ?? 'N/A') . "</strong></li>";
            echo "<li>Dê permissão de <strong>Editor</strong> ou <strong>Gerenciador de Conteúdo</strong></li>";
            echo "<li>Se a pasta está em Shared Drive, adicione o usuário como membro do Shared Drive</li>";
            echo "</ol>";
        }
    }
    
    // 4. Tentar listar arquivos
    echo "<h2>4. Testar Listagem de Arquivos</h2>";
    try {
        $files = $driveService->listFiles('', true);
        echo "✓ Arquivos listados com sucesso<br>";
        echo "Total de itens: " . count($files) . "<br>";
        
        if (count($files) > 0) {
            echo "<h4>Primeiros 5 itens:</h4>";
            echo "<pre>";
            print_r(array_slice($files, 0, 5));
            echo "</pre>";
        }
    } catch (Exception $e) {
        echo "✗ Erro ao listar arquivos: " . htmlspecialchars($e->getMessage()) . "<br>";
    }
    
} catch (Exception $e) {
    echo "✗ Erro geral: " . htmlspecialchars($e->getMessage()) . "<br>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}

echo "<hr>";
echo "<h2>📋 Resumo</h2>";
echo "<p>Se você viu erros de permissão, siga os passos acima para compartilhar a pasta com o usuário que autorizou o OAuth.</p>";
echo "<p>Se tudo está funcionando, o sistema está pronto para uso!</p>";
?>

