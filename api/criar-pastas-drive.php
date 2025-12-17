<?php
/**
 * Script para Criar Pastas no Google Drive para Usuários USER
 * 
 * Este script cria automaticamente todas as pastas necessárias
 * para os usuários do tipo USER no Google Drive.
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>
<html lang='pt-BR'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Criar Pastas no Google Drive - Grupo Raça</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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
        h1 {
            color: #333;
            margin-top: 0;
        }
        .success {
            color: #28a745;
            background: #d4edda;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        .error {
            color: #dc3545;
            background: #f8d7da;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        .info {
            color: #0c5460;
            background: #d1ecf1;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        .warning {
            color: #856404;
            background: #fff3cd;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        ul {
            line-height: 1.8;
        }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class='container'>
        <h1>📁 Criar Pastas no Google Drive</h1>";

try {
    // Carregar dependências
    require_once 'drive_service.php';
    require_once 'db_config.php';
    require_once 'permissions_db.php';
    
    echo "<h2>1. Verificando Conexão com Google Drive...</h2>";
    
    $driveService = new DriveService();
    
    // Verificar pasta raiz
    $rootFolderId = $driveService->getConfig()['root_folder_id'];
    echo "<div class='info'>✅ Pasta raiz configurada: <code>{$rootFolderId}</code></div>";
    
    // Verificar se consegue acessar a pasta raiz
    try {
        $rootFolder = $driveService->getService()->files->get($rootFolderId, ['fields' => 'id,name']);
        echo "<div class='success'>✅ Pasta raiz acessível: <strong>{$rootFolder->getName()}</strong></div>";
    } catch (Exception $e) {
        echo "<div class='error'>❌ Erro ao acessar pasta raiz: " . htmlspecialchars($e->getMessage()) . "</div>";
        throw $e;
    }
    
    echo "<h2>2. Buscando Usuários USER no Banco de Dados...</h2>";
    
    // Buscar todos os usuários USER
    $conn = getDBConnection();
    $stmt = $conn->prepare("SELECT email, name, folder FROM users WHERE role = 'user' AND active = 1 AND folder IS NOT NULL AND folder != '' AND folder != '*' ORDER BY name");
    $stmt->execute();
    $users = $stmt->fetchAll();
    
    if (empty($users)) {
        echo "<div class='warning'>⚠️ Nenhum usuário USER encontrado no banco de dados.</div>";
    } else {
        echo "<div class='info'>✅ Encontrados <strong>" . count($users) . "</strong> usuários USER</div>";
        echo "<ul>";
        foreach ($users as $user) {
            echo "<li><strong>" . htmlspecialchars($user['name']) . "</strong> → pasta: <code>" . htmlspecialchars($user['folder']) . "</code></li>";
        }
        echo "</ul>";
    }
    
    echo "<h2>3. Criando Pastas no Google Drive...</h2>";
    
    $created = 0;
    $existed = 0;
    $errors = 0;
    
    foreach ($users as $user) {
        $folderName = $user['folder'];
        $userName = $user['name'];
        
        echo "<h3>📂 {$folderName} ({$userName})</h3>";
        
        try {
            // Verificar se a pasta já existe
            $existingFolderId = $driveService->getFolderIdByName($folderName, $rootFolderId);
            
            if ($existingFolderId) {
                echo "<div class='info'>ℹ️ Pasta <code>{$folderName}</code> já existe (ID: {$existingFolderId})</div>";
                $existed++;
            } else {
                // Criar a pasta
                $folderId = $driveService->ensureFolder($folderName, $rootFolderId);
                echo "<div class='success'>✅ Pasta <code>{$folderName}</code> criada com sucesso! (ID: {$folderId})</div>";
                $created++;
            }
        } catch (Exception $e) {
            echo "<div class='error'>❌ Erro ao criar pasta <code>{$folderName}</code>: " . htmlspecialchars($e->getMessage()) . "</div>";
            $errors++;
        }
    }
    
    echo "<h2>4. Resumo</h2>";
    echo "<div class='info'>";
    echo "<strong>Total de usuários:</strong> " . count($users) . "<br>";
    echo "<strong>✅ Pastas criadas:</strong> {$created}<br>";
    echo "<strong>ℹ️ Pastas que já existiam:</strong> {$existed}<br>";
    if ($errors > 0) {
        echo "<strong>❌ Erros:</strong> {$errors}<br>";
    }
    echo "</div>";
    
    if ($errors === 0) {
        echo "<div class='success'><strong>🎉 Concluído com sucesso!</strong> Todas as pastas estão prontas para uso.</div>";
    } else {
        echo "<div class='warning'><strong>⚠️ Alguns erros ocorreram.</strong> Verifique as mensagens acima.</div>";
    }
    
    echo "<h2>5. Próximos Passos</h2>";
    echo "<ul>";
    echo "<li>✅ Verifique no Google Drive se todas as pastas foram criadas</li>";
    echo "<li>✅ Teste o login de um usuário USER</li>";
    echo "<li>✅ Teste o upload de um arquivo</li>";
    echo "</ul>";
    
} catch (Exception $e) {
    echo "<div class='error'>";
    echo "<h2>❌ Erro Fatal</h2>";
    echo "<p><strong>Mensagem:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p><strong>Arquivo:</strong> " . htmlspecialchars($e->getFile()) . "</p>";
    echo "<p><strong>Linha:</strong> " . $e->getLine() . "</p>";
    echo "</div>";
    
    echo "<h3>Possíveis Causas:</h3>";
    echo "<ul>";
    echo "<li>Credenciais do Google Drive não configuradas corretamente</li>";
    echo "<li>Service Account não tem acesso à pasta raiz</li>";
    echo "<li>Erro de conexão com o banco de dados</li>";
    echo "<li>Biblioteca Google API não instalada corretamente</li>";
    echo "</ul>";
}

echo "    </div>
</body>
</html>";
?>

