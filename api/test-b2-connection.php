<?php
/**
 * Teste de Conexão Backblaze B2
 * 
 * Use este arquivo para testar se a conexão com Backblaze B2 está funcionando
 */

require_once __DIR__ . '/config.php';

// Verificar se usuário está autenticado
session_start();
if (!isset($_SESSION['user'])) {
    die('Erro: Usuário não autenticado. Faça login primeiro.');
}

echo "<h1>Teste de Conexão Backblaze B2</h1>";

try {
    require_once __DIR__ . '/b2_service.php';
    $b2Service = new B2Service();
    
    echo "<h2>✅ Conexão estabelecida com sucesso!</h2>";
    
    // Tentar listar arquivos
    echo "<h3>Testando listagem de arquivos...</h3>";
    try {
        $files = $b2Service->listFiles('*', true);
        echo "<p><strong>Arquivos encontrados:</strong> " . count($files) . "</p>";
        
        if (count($files) > 0) {
            echo "<h4>Primeiros 10 arquivos/pastas:</h4>";
            echo "<ul>";
            foreach (array_slice($files, 0, 10) as $file) {
                echo "<li>";
                echo "<strong>" . htmlspecialchars($file['name']) . "</strong> ";
                echo "(" . ($file['type'] === 'folder' ? 'Pasta' : 'Arquivo') . ")";
                if ($file['type'] === 'file') {
                    echo " - " . number_format($file['size'] / 1024, 2) . " KB";
                }
                echo "</li>";
            }
            echo "</ul>";
        } else {
            echo "<p>Nenhum arquivo encontrado no bucket. Isso é normal se você ainda não fez upload de arquivos.</p>";
        }
    } catch (Exception $e) {
        echo "<p style='color: red;'><strong>Erro ao listar arquivos:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
    }
    
    echo "<hr>";
    echo "<h3>✅ Teste concluído!</h3>";
    echo "<p>Se você viu esta mensagem, a conexão com Backblaze B2 está funcionando.</p>";
    
} catch (Exception $e) {
    echo "<h2 style='color: red;'>❌ Erro na conexão</h2>";
    echo "<p><strong>Mensagem de erro:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p><strong>Arquivo:</strong> " . htmlspecialchars($e->getFile()) . "</p>";
    echo "<p><strong>Linha:</strong> " . $e->getLine() . "</p>";
    
    echo "<hr>";
    echo "<h3>Possíveis causas:</h3>";
    echo "<ul>";
    echo "<li>Credenciais incorretas no arquivo <code>api/config/b2_config.php</code></li>";
    echo "<li>Bucket não existe ou nome incorreto</li>";
    echo "<li>Application Key sem permissões adequadas</li>";
    echo "<li>Problema de conexão com a internet</li>";
    echo "</ul>";
    
    echo "<h3>Verifique:</h3>";
    echo "<ol>";
    echo "<li>O arquivo <code>api/config/b2_config.php</code> existe?</li>";
    echo "<li>As credenciais estão corretas?</li>";
    echo "<li>O bucket 'grupo-raca' existe no Backblaze B2?</li>";
    echo "<li>A Application Key tem permissões de leitura?</li>";
    echo "</ol>";
}

echo "<hr>";
echo "<p><a href='javascript:history.back()'>← Voltar</a></p>";
?>

