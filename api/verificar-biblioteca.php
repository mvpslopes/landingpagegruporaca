<?php
/**
 * Script de Verificação da Biblioteca Google API PHP
 * 
 * Acesse: https://todaarte.com.br/api/verificar-biblioteca.php
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificação - Biblioteca Google API PHP</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h2 {
            color: #333;
            border-bottom: 2px solid #4285f4;
            padding-bottom: 10px;
        }
        .check {
            color: #34a853;
            font-weight: bold;
        }
        .error {
            color: #ea4335;
            font-weight: bold;
        }
        .warning {
            color: #fbbc04;
            font-weight: bold;
        }
        .info {
            background: #e8f0fe;
            padding: 15px;
            border-radius: 4px;
            margin: 10px 0;
        }
        a {
            color: #4285f4;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background: #4285f4;
            color: white;
            border-radius: 4px;
        }
        a:hover {
            background: #357ae8;
        }
        code {
            background: #f1f1f1;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>🔍 Verificação da Biblioteca Google API PHP</h2>
        
        <?php
        $allOk = true;
        $errors = [];
        $warnings = [];
        
        // 1. Verificar se o arquivo principal existe
        echo "<h3>1. Verificando Arquivos</h3>";
        
        $clientPath = __DIR__ . '/vendor/google/apiclient/src/Google/Client.php';
        if (file_exists($clientPath)) {
            echo "<p class='check'>✅ Arquivo <code>Client.php</code> encontrado!</p>";
        } else {
            echo "<p class='error'>❌ Arquivo <code>Client.php</code> NÃO encontrado!</p>";
            echo "<p class='info'>Caminho esperado: <code>$clientPath</code></p>";
            $allOk = false;
            $errors[] = "Arquivo Client.php não encontrado";
        }
        
        $servicePath = __DIR__ . '/vendor/google/apiclient/src/Google/Service/Drive.php';
        if (file_exists($servicePath)) {
            echo "<p class='check'>✅ Arquivo <code>Drive.php</code> encontrado!</p>";
        } else {
            echo "<p class='warning'>⚠️ Arquivo <code>Drive.php</code> não encontrado!</p>";
            $warnings[] = "Arquivo Drive.php não encontrado";
        }
        
        // 2. Tentar carregar a classe
        echo "<h3>2. Carregando Classes</h3>";
        
        if (file_exists($clientPath)) {
            try {
                require_once $clientPath;
                echo "<p class='check'>✅ Arquivo <code>Client.php</code> carregado com sucesso!</p>";
            } catch (Exception $e) {
                echo "<p class='error'>❌ Erro ao carregar: " . htmlspecialchars($e->getMessage()) . "</p>";
                $allOk = false;
                $errors[] = "Erro ao carregar Client.php";
            }
            
            // Verificar se a classe existe
            if (class_exists('Google_Client')) {
                echo "<p class='check'>✅ Classe <code>Google_Client</code> disponível!</p>";
            } else {
                echo "<p class='error'>❌ Classe <code>Google_Client</code> NÃO disponível!</p>";
                $allOk = false;
                $errors[] = "Classe Google_Client não disponível";
            }
        }
        
        // 3. Verificar configuração do Drive
        echo "<h3>3. Verificando Configuração</h3>";
        
        $configPath = __DIR__ . '/config/drive_config.php';
        if (file_exists($configPath)) {
            echo "<p class='check'>✅ Arquivo de configuração encontrado!</p>";
            
            try {
                $config = require $configPath;
                if (isset($config['root_folder_id'])) {
                    echo "<p class='check'>✅ ID da pasta raiz configurado: <code>" . htmlspecialchars($config['root_folder_id']) . "</code></p>";
                } else {
                    echo "<p class='error'>❌ ID da pasta raiz não configurado!</p>";
                    $allOk = false;
                }
            } catch (Exception $e) {
                echo "<p class='error'>❌ Erro ao carregar configuração: " . htmlspecialchars($e->getMessage()) . "</p>";
                $allOk = false;
            }
        } else {
            echo "<p class='error'>❌ Arquivo de configuração não encontrado!</p>";
            $allOk = false;
        }
        
        $credentialsPath = __DIR__ . '/config/grupo-raca-drive-credentials.json';
        if (file_exists($credentialsPath)) {
            echo "<p class='check'>✅ Arquivo de credenciais encontrado!</p>";
            
            // Verificar permissões
            $perms = substr(sprintf('%o', fileperms($credentialsPath)), -4);
            if ($perms === '0600' || $perms === '0400') {
                echo "<p class='check'>✅ Permissões do arquivo corretas: <code>$perms</code></p>";
            } else {
                echo "<p class='warning'>⚠️ Permissões do arquivo: <code>$perms</code> (recomendado: 600)</p>";
            }
        } else {
            echo "<p class='error'>❌ Arquivo de credenciais não encontrado!</p>";
            $allOk = false;
        }
        
        // 4. Resumo
        echo "<h3>4. Resumo</h3>";
        
        if ($allOk && empty($errors)) {
            echo "<div class='info'>";
            echo "<p class='check'><strong>✅ Tudo OK! Biblioteca instalada corretamente!</strong></p>";
            echo "<p>Você pode testar a conexão com o Google Drive agora.</p>";
            echo "</div>";
            echo "<a href='test-drive-connection.php'>Testar Conexão com Google Drive →</a>";
        } else {
            echo "<div class='info' style='background: #fce8e6;'>";
            echo "<p class='error'><strong>❌ Problemas encontrados:</strong></p>";
            echo "<ul>";
            foreach ($errors as $error) {
                echo "<li>" . htmlspecialchars($error) . "</li>";
            }
            echo "</ul>";
            if (!empty($warnings)) {
                echo "<p class='warning'><strong>⚠️ Avisos:</strong></p>";
                echo "<ul>";
                foreach ($warnings as $warning) {
                    echo "<li>" . htmlspecialchars($warning) . "</li>";
                }
                echo "</ul>";
            }
            echo "</div>";
            echo "<p class='info'>Verifique a instalação manual seguindo o guia: <code>INSTALACAO_MANUAL_GOOGLE_API.md</code></p>";
        }
        ?>
    </div>
</body>
</html>

