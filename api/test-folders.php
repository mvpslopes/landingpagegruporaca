<?php
/**
 * Teste do Endpoint de Pastas
 * Acesse este arquivo diretamente no navegador para testar
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/html; charset=utf-8');

echo "<h1>Teste de Endpoint de Pastas</h1>";

// 1. Verificar se o arquivo existe
echo "<h2>1. Verificando arquivos...</h2>";
$files = [
    'config.php',
    'permissions_db.php',
    'drive_service.php',
    'folders.php'
];

foreach ($files as $file) {
    $path = __DIR__ . '/' . $file;
    if (file_exists($path)) {
        echo "✅ {$file} existe<br>";
    } else {
        echo "❌ {$file} NÃO existe<br>";
    }
}

// 2. Testar carregamento de dependências
echo "<h2>2. Testando carregamento...</h2>";
try {
    require_once 'config.php';
    echo "✅ config.php carregado<br>";
} catch (Exception $e) {
    echo "❌ Erro ao carregar config.php: " . $e->getMessage() . "<br>";
    exit;
}

try {
    require_once 'permissions_db.php';
    echo "✅ permissions_db.php carregado<br>";
} catch (Exception $e) {
    echo "❌ Erro ao carregar permissions_db.php: " . $e->getMessage() . "<br>";
    exit;
}

// 3. Verificar sessão
echo "<h2>3. Verificando sessão...</h2>";
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (isset($_SESSION['user'])) {
    echo "✅ Usuário logado: " . htmlspecialchars($_SESSION['user']['email']) . "<br>";
    echo "Role: " . htmlspecialchars($_SESSION['user']['role']) . "<br>";
} else {
    echo "⚠️ Nenhum usuário logado. Faça login primeiro em: <a href='../'>Sistema</a><br>";
    echo "<p>Ou teste diretamente o endpoint: <a href='folders.php'>folders.php</a></p>";
    exit;
}

// 4. Testar DriveService
echo "<h2>4. Testando DriveService...</h2>";
try {
    require_once 'drive_service.php';
    $driveService = new DriveService();
    echo "✅ DriveService criado<br>";
    
    $config = $driveService->getConfig();
    echo "✅ Config carregado. Pasta raiz: " . htmlspecialchars($config['root_folder_id']) . "<br>";
} catch (Exception $e) {
    echo "❌ Erro ao criar DriveService: " . $e->getMessage() . "<br>";
    exit;
}

// 5. Testar listagem de pastas
echo "<h2>5. Testando listagem de pastas...</h2>";
try {
    $rootFolderId = $driveService->getConfig()['root_folder_id'];
    echo "Pasta raiz ID: " . htmlspecialchars($rootFolderId) . "<br>";
    
    $query = "'{$rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
    echo "Query: " . htmlspecialchars($query) . "<br>";
    
    $service = $driveService->getService();
    $results = $service->files->listFiles([
        'q' => $query,
        'fields' => 'files(id, name)',
        'orderBy' => 'name'
    ]);
    
    $folders = $results->getFiles();
    echo "✅ Pastas encontradas: " . count($folders) . "<br>";
    
    if (count($folders) > 0) {
        echo "<h3>Lista de Pastas:</h3>";
        echo "<ul>";
        foreach ($folders as $folder) {
            echo "<li><strong>" . htmlspecialchars($folder->getName()) . "</strong> (ID: " . htmlspecialchars($folder->getId()) . ")</li>";
        }
        echo "</ul>";
    } else {
        echo "⚠️ Nenhuma pasta encontrada na pasta raiz do Google Drive<br>";
    }
    
} catch (Exception $e) {
    echo "❌ Erro ao listar pastas: " . $e->getMessage() . "<br>";
    echo "Stack trace: <pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}

// 6. Testar endpoint folders.php
echo "<h2>6. Testando endpoint folders.php...</h2>";
echo "<p>Teste manual: <a href='folders.php' target='_blank'>Abrir folders.php</a></p>";
?>

