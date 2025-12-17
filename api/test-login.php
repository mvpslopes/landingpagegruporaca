<?php
/**
 * Script de Teste de Login
 * Testa se o hash está correto e se o login funciona
 * 
 * ⚠️ DELETE este arquivo após testar por segurança!
 */

require_once 'db_config.php';
require_once 'permissions_db.php';

header('Content-Type: text/html; charset=utf-8');

$email = 'marcus@gruporaca.com.br';
$senha = 'Gr@up0R@c@2024!M@rcus#Secure';
$hashNoBanco = '$2a$12$shrk4Z9PF.4VyqhLzguv0uogluDuMRKy/GeCR.jn0sHXfIZVA82fu';

echo "<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Teste de Login</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 5px; margin: 10px 0; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🔍 Teste de Login - Diagnóstico</h1>";

try {
    $conn = getDBConnection();
    
    // 1. Verificar se usuário existe
    echo "<div class='info'><strong>1. Verificando se usuário existe no banco...</strong></div>";
    
    $user = getUserByEmail($email);
    
    if (!$user) {
        echo "<div class='error'><strong>❌ ERRO:</strong> Usuário não encontrado no banco de dados!</div>";
        echo "<div class='info'>Execute o script SQL para criar o usuário primeiro.</div>";
        exit;
    }
    
    echo "<div class='success'><strong>✅ Usuário encontrado:</strong><br>";
    echo "ID: {$user['id']}<br>";
    echo "Email: {$user['email']}<br>";
    echo "Nome: {$user['name']}<br>";
    echo "Role: {$user['role']}<br>";
    echo "Hash no banco: " . substr($user['password'], 0, 30) . "...</div>";
    
    // 2. Verificar formato do hash
    echo "<div class='info'><strong>2. Verificando formato do hash...</strong></div>";
    
    $hashFormat = substr($user['password'], 0, 4);
    if ($hashFormat === '$2a$' || $hashFormat === '$2y$') {
        echo "<div class='success'><strong>✅ Formato do hash:</strong> {$hashFormat} (válido)</div>";
    } else {
        echo "<div class='error'><strong>❌ Formato do hash inválido:</strong> {$hashFormat}</div>";
    }
    
    // 3. Testar verificação da senha
    echo "<div class='info'><strong>3. Testando verificação da senha...</strong></div>";
    
    $senhaTeste = 'Gr@up0R@c@2024!M@rcus#Secure';
    $verificado = password_verify($senhaTeste, $user['password']);
    
    if ($verificado) {
        echo "<div class='success'><strong>✅ Senha verificada com sucesso!</strong><br>";
        echo "A senha '{$senhaTeste}' corresponde ao hash no banco.</div>";
    } else {
        echo "<div class='error'><strong>❌ Senha NÃO corresponde ao hash!</strong><br>";
        echo "A senha '{$senhaTeste}' não confere com o hash armazenado.</div>";
        
        // Tentar gerar novo hash
        echo "<div class='info'><strong>4. Gerando novo hash para a senha...</strong></div>";
        $novoHash = password_hash($senhaTeste, PASSWORD_BCRYPT);
        echo "<div class='info'>Novo hash gerado: <code>{$novoHash}</code></div>";
        
        // Verificar se o novo hash funciona
        $verificadoNovo = password_verify($senhaTeste, $novoHash);
        if ($verificadoNovo) {
            echo "<div class='success'><strong>✅ Novo hash funciona corretamente!</strong></div>";
            echo "<div class='info'><strong>SOLUÇÃO:</strong> Atualize o hash no banco com este comando SQL:<br>";
            echo "<pre>UPDATE users SET password = '{$novoHash}' WHERE email = '{$email}';</pre></div>";
        }
    }
    
    // 4. Testar função de login completa
    echo "<div class='info'><strong>5. Testando função de login completa...</strong></div>";
    
    if ($verificado) {
        echo "<div class='success'><strong>✅ Login deve funcionar!</strong><br>";
        echo "O problema pode estar na API. Verifique o arquivo auth.php</div>";
    } else {
        echo "<div class='error'><strong>❌ Login não funcionará até atualizar o hash!</strong></div>";
    }
    
    // 5. Mostrar dados completos
    echo "<div class='info'><strong>6. Dados completos do usuário:</strong></div>";
    echo "<pre>";
    print_r($user);
    echo "</pre>";
    
} catch (Exception $e) {
    echo "<div class='error'><strong>❌ Erro:</strong> " . htmlspecialchars($e->getMessage()) . "</div>";
}

echo "</body></html>";
?>

