<?php
/**
 * Diagnóstico completo da biblioteca Google API PHP Client
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 Diagnóstico Google API PHP Client</h1>";
echo "<hr>";

// Teste 1: Verificar autoloader
echo "<h2>Teste 1: Autoloader</h2>";
$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (file_exists($autoloadPath)) {
    echo "✓ vendor/autoload.php existe<br>";
    try {
        require_once $autoloadPath;
        echo "✓ Autoloader carregado com sucesso<br>";
    } catch (Exception $e) {
        echo "✗ Erro ao carregar autoloader: " . htmlspecialchars($e->getMessage()) . "<br>";
        echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
    }
} else {
    echo "✗ vendor/autoload.php NÃO encontrado<br>";
    echo "Caminho esperado: " . htmlspecialchars($autoloadPath) . "<br>";
}
echo "<br>";

// Teste 2: Verificar estrutura da biblioteca
echo "<h2>Teste 2: Estrutura da Biblioteca</h2>";
$paths = [
    'vendor/google/apiclient/src/Google/Client.php',
    'vendor/google/apiclient-services/src/Drive.php',
    'vendor/composer/autoload_psr4.php',
    'vendor/composer/autoload_classmap.php'
];

foreach ($paths as $path) {
    $fullPath = __DIR__ . '/' . $path;
    if (file_exists($fullPath)) {
        echo "✓ " . htmlspecialchars($path) . " existe<br>";
    } else {
        echo "✗ " . htmlspecialchars($path) . " NÃO encontrado<br>";
    }
}
echo "<br>";

// Teste 3: Verificar autoloader do Composer
echo "<h2>Teste 3: Autoloader do Composer</h2>";
if (file_exists(__DIR__ . '/vendor/composer/autoload_psr4.php')) {
    $psr4 = require __DIR__ . '/vendor/composer/autoload_psr4.php';
    echo "Namespaces PSR-4 registrados:<br>";
    echo "<pre>";
    foreach ($psr4 as $namespace => $paths) {
        if (strpos($namespace, 'Google') !== false) {
            echo htmlspecialchars($namespace) . " => " . htmlspecialchars(implode(', ', $paths)) . "\n";
        }
    }
    echo "</pre>";
} else {
    echo "✗ autoload_psr4.php não encontrado<br>";
}
echo "<br>";

// Teste 4: Tentar carregar classes manualmente
echo "<h2>Teste 4: Carregamento Manual de Classes</h2>";

// Tentar carregar Google\Client
$clientPath = __DIR__ . '/vendor/google/apiclient/src/Google/Client.php';
if (file_exists($clientPath)) {
    echo "✓ Client.php existe<br>";
    try {
        require_once $clientPath;
        echo "✓ Client.php carregado<br>";
        
        if (class_exists('Google\Client')) {
            echo "✓ Classe Google\\Client encontrada<br>";
        } else {
            echo "✗ Classe Google\\Client NÃO encontrada após carregar arquivo<br>";
        }
    } catch (Exception $e) {
        echo "✗ Erro ao carregar Client.php: " . htmlspecialchars($e->getMessage()) . "<br>";
        echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
    }
} else {
    echo "✗ Client.php NÃO encontrado<br>";
}

// Tentar carregar Google\Service\Drive
$drivePath = __DIR__ . '/vendor/google/apiclient-services/src/Drive.php';
if (file_exists($drivePath)) {
    echo "✓ Drive.php existe<br>";
    try {
        require_once $drivePath;
        echo "✓ Drive.php carregado<br>";
        
        if (class_exists('Google\Service\Drive')) {
            echo "✓ Classe Google\\Service\\Drive encontrada<br>";
        } else {
            echo "✗ Classe Google\\Service\\Drive NÃO encontrada após carregar arquivo<br>";
        }
    } catch (Exception $e) {
        echo "✗ Erro ao carregar Drive.php: " . htmlspecialchars($e->getMessage()) . "<br>";
        echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
    }
} else {
    echo "✗ Drive.php NÃO encontrado<br>";
}
echo "<br>";

// Teste 5: Verificar classes disponíveis
echo "<h2>Teste 5: Classes Disponíveis</h2>";
$classes = [
    'Google_Client',
    'Google\Client',
    'Google_Service_Drive',
    'Google\Service\Drive',
    'Google\Service\Drive\DriveFile',
    'Google_Service_Drive_DriveFile'
];

foreach ($classes as $className) {
    if (class_exists($className)) {
        echo "✓ " . htmlspecialchars($className) . " existe<br>";
    } else {
        echo "✗ " . htmlspecialchars($className) . " NÃO existe<br>";
    }
}
echo "<br>";

// Teste 6: Tentar instanciar
echo "<h2>Teste 6: Instanciação</h2>";
if (class_exists('Google\Client')) {
    try {
        $client = new \Google\Client();
        echo "✓ Google\\Client instanciado com sucesso<br>";
        
        // Criar alias
        if (!class_exists('Google_Client')) {
            class_alias('Google\Client', 'Google_Client');
            echo "✓ Alias Google_Client criado<br>";
        }
        
        // Tentar instanciar com alias
        if (class_exists('Google_Client')) {
            $client2 = new Google_Client();
            echo "✓ Google_Client (alias) instanciado com sucesso<br>";
        }
    } catch (Exception $e) {
        echo "✗ Erro ao instanciar: " . htmlspecialchars($e->getMessage()) . "<br>";
        echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
    }
} else {
    echo "✗ Google\\Client não está disponível para instanciação<br>";
}
echo "<br>";

// Teste 7: Verificar dependências
echo "<h2>Teste 7: Dependências</h2>";
$requiredFiles = [
    'vendor/google/apiclient/src/Google/Client.php',
    'vendor/google/apiclient/src/Google/Service/Resource.php',
    'vendor/google/apiclient-services/src/Drive.php',
    'vendor/google/apiclient-services/src/Google/Service/Drive.php'
];

foreach ($requiredFiles as $file) {
    $fullPath = __DIR__ . '/' . $file;
    if (file_exists($fullPath)) {
        $size = filesize($fullPath);
        echo "✓ " . htmlspecialchars($file) . " existe (" . number_format($size) . " bytes)<br>";
    } else {
        echo "✗ " . htmlspecialchars($file) . " NÃO encontrado<br>";
    }
}
echo "<br>";

echo "<hr>";
echo "<h2>📋 Conclusão</h2>";
echo "<p>Se todas as classes estão marcadas como 'NÃO encontradas', a biblioteca Google API PHP Client pode estar incompleta ou não foi carregada corretamente.</p>";
echo "<p><strong>Próximos passos:</strong></p>";
echo "<ul>";
echo "<li>Verifique se a pasta vendor/ foi enviada completamente</li>";
echo "<li>Verifique se há erros de permissão nos arquivos</li>";
echo "<li>Tente fazer upload novamente da biblioteca completa</li>";
echo "</ul>";
?>

