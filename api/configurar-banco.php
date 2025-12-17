<?php
/**
 * Script para Configurar Banco de Dados do Novo Domínio
 * 
 * Este script ajuda a configurar as credenciais do banco de dados
 * para o novo domínio gruporaca.app.br
 */

// Prevenir acesso direto em produção (remova este bloco durante a configuração)
if (strpos($_SERVER['SERVER_NAME'] ?? '', 'gruporaca.app.br') !== false && !isset($_GET['config'])) {
    die('Acesso negado. Adicione ?config=1 na URL para acessar.');
}

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configurar Banco de Dados - Novo Domínio</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }
        .info-box {
            background: #f0f7ff;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .warning-box {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .success-box {
            background: #d4edda;
            border-left: 4px solid #28a745;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .error-box {
            background: #f8d7da;
            border-left: 4px solid #dc3545;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        form {
            margin-top: 20px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #555;
        }
        input[type="text"],
        input[type="password"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        input[type="text"]:focus,
        input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
        }
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        .code-block {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            overflow-x: auto;
            margin: 10px 0;
        }
        .step {
            margin: 20px 0;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 5px;
        }
        .step-number {
            display: inline-block;
            background: #667eea;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            text-align: center;
            line-height: 30px;
            font-weight: bold;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Configurar Banco de Dados - Novo Domínio</h1>
        
        <?php
        // Processar formulário
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['db_name']) && isset($_POST['db_user']) && isset($_POST['db_pass'])) {
            $dbName = trim($_POST['db_name']);
            $dbUser = trim($_POST['db_user']);
            $dbPass = trim($_POST['db_pass']);
            
            if (empty($dbName) || empty($dbUser) || empty($dbPass)) {
                echo '<div class="error-box"><strong>❌ Erro:</strong> Todos os campos são obrigatórios!</div>';
            } else {
                // Ler o arquivo db_config.php
                $configFile = __DIR__ . '/db_config.php';
                $configContent = file_get_contents($configFile);
                
                // Substituir as credenciais
                $configContent = preg_replace(
                    "/define\('DB_NAME', 'u\[numero\]_gruporaca_db'\);.*?\/\/ ⚠️ SUBSTITUA.*?/s",
                    "define('DB_NAME', '$dbName');",
                    $configContent
                );
                
                $configContent = preg_replace(
                    "/define\('DB_USER', 'u\[numero\]_gruporaca_user'\);.*?\/\/ ⚠️ SUBSTITUA.*?/s",
                    "define('DB_USER', '$dbUser');",
                    $configContent
                );
                
                $configContent = preg_replace(
                    "/define\('DB_PASS', 'SUA_SENHA_AQUI'\);.*?\/\/ ⚠️ SUBSTITUA.*?/s",
                    "define('DB_PASS', '$dbPass');",
                    $configContent
                );
                
                // Salvar o arquivo
                if (file_put_contents($configFile, $configContent)) {
                    echo '<div class="success-box"><strong>✅ Sucesso!</strong> Arquivo db_config.php atualizado com as novas credenciais.</div>';
                    
                    // Testar conexão
                    echo '<div class="info-box"><strong>🧪 Testando conexão...</strong></div>';
                    try {
                        require_once $configFile;
                        $conn = getDBConnection();
                        echo '<div class="success-box"><strong>✅ Conexão estabelecida com sucesso!</strong><br>O banco de dados está configurado corretamente.</div>';
                    } catch (Exception $e) {
                        echo '<div class="error-box"><strong>❌ Erro na conexão:</strong> ' . htmlspecialchars($e->getMessage()) . '</div>';
                        echo '<div class="warning-box"><strong>⚠️ Verifique:</strong><ul style="margin-left: 20px; margin-top: 10px;"><li>Se o banco de dados foi criado na Hostinger</li><li>Se as credenciais estão corretas</li><li>Se o usuário tem permissões no banco</li></ul></div>';
                    }
                } else {
                    echo '<div class="error-box"><strong>❌ Erro:</strong> Não foi possível salvar o arquivo. Verifique as permissões.</div>';
                }
            }
        }
        ?>
        
        <div class="info-box">
            <strong>ℹ️ Instruções:</strong><br>
            Preencha as informações do banco de dados criado na Hostinger para o domínio <strong>gruporaca.app.br</strong>
        </div>
        
        <div class="step">
            <span class="step-number">1</span>
            <strong>Onde encontrar as credenciais:</strong>
            <ul style="margin-left: 30px; margin-top: 10px;">
                <li>Acesse o painel hPanel da Hostinger</li>
                <li>Vá em <strong>Bancos de Dados MySQL</strong></li>
                <li>Procure pelo banco criado para gruporaca.app.br</li>
                <li>Anote: Nome do banco, Usuário e Senha</li>
            </ul>
        </div>
        
        <form method="POST">
            <div class="form-group">
                <label for="db_name">Nome do Banco de Dados:</label>
                <input type="text" id="db_name" name="db_name" 
                       placeholder="Ex: u179630068_gruporaca_db" 
                       value="<?php echo isset($_POST['db_name']) ? htmlspecialchars($_POST['db_name']) : ''; ?>" required>
                <small style="color: #666;">Formato: u[numero]_gruporaca_db</small>
            </div>
            
            <div class="form-group">
                <label for="db_user">Usuário do Banco:</label>
                <input type="text" id="db_user" name="db_user" 
                       placeholder="Ex: u179630068_gruporaca_user" 
                       value="<?php echo isset($_POST['db_user']) ? htmlspecialchars($_POST['db_user']) : ''; ?>" required>
                <small style="color: #666;">Formato: u[numero]_gruporaca_user</small>
            </div>
            
            <div class="form-group">
                <label for="db_pass">Senha do Banco:</label>
                <input type="password" id="db_pass" name="db_pass" 
                       placeholder="Digite a senha do banco" required>
                <small style="color: #666;">Senha fornecida pela Hostinger</small>
            </div>
            
            <button type="submit">💾 Salvar e Testar Conexão</button>
        </form>
        
        <div class="warning-box" style="margin-top: 30px;">
            <strong>⚠️ Importante:</strong><br>
            Após configurar, você precisará:
            <ol style="margin-left: 20px; margin-top: 10px;">
                <li>Criar as tabelas no banco usando os scripts SQL disponíveis</li>
                <li>Testar a conexão usando <code>api/test-db-connection.php</code></li>
                <li>Remover ou proteger este arquivo após a configuração</li>
            </ol>
        </div>
    </div>
</body>
</html>

