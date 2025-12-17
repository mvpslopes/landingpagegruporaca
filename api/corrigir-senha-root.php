<?php
/**
 * Script para Corrigir Senha do Usuário ROOT
 * 
 * Este script:
 * 1. Gera um novo hash bcrypt válido
 * 2. Atualiza a senha no banco
 * 3. Testa se funciona
 * 
 * ⚠️ DELETE este arquivo após usar por segurança!
 */

require_once 'db_config.php';
require_once 'permissions_db.php';

header('Content-Type: text/html; charset=utf-8');

$email = 'marcus@gruporaca.com.br';
$senha = 'Gr@up0R@c@2024!M@rcus#Secure';

echo "<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Corrigir Senha ROOT</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 5px; margin: 10px 0; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>🔧 Corrigir Senha do Usuário ROOT</h1>";

try {
    $conn = getDBConnection();
    
    // Verificar se usuário existe
    $user = getUserByEmail($email);
    
    if (!$user) {
        echo "<div class='error'>
            <strong>❌ Usuário não encontrado!</strong><br>
            Execute o script SQL para criar o usuário primeiro.
        </div>";
        exit;
    }
    
    echo "<div class='info'>
        <strong>📋 Usuário encontrado:</strong><br>
        ID: {$user['id']}<br>
        Email: {$user['email']}<br>
        Nome: {$user['name']}<br>
        Role: {$user['role']}
    </div>";
    
    // Gerar novo hash bcrypt (formato $2y$ que é mais compatível)
    echo "<div class='info'><strong>🔐 Gerando novo hash bcrypt...</strong></div>";
    
    $novoHash = password_hash($senha, PASSWORD_BCRYPT);
    
    echo "<div class='info'>
        <strong>Hash gerado:</strong><br>
        <code>{$novoHash}</code>
    </div>";
    
    // Verificar se o novo hash funciona
    $teste = password_verify($senha, $novoHash);
    
    if (!$teste) {
        echo "<div class='error'><strong>❌ Erro ao gerar hash!</strong></div>";
        exit;
    }
    
    echo "<div class='success'><strong>✅ Hash verificado com sucesso!</strong></div>";
    
    // Atualizar no banco
    echo "<div class='info'><strong>💾 Atualizando senha no banco de dados...</strong></div>";
    
    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
    $stmt->execute([$novoHash, $email]);
    
    if ($stmt->rowCount() > 0) {
        echo "<div class='success'>
            <strong>✅ Senha atualizada com sucesso!</strong><br>
            O hash foi atualizado no banco de dados.
        </div>";
    } else {
        echo "<div class='warning'>
            <strong>⚠️ Nenhuma linha foi atualizada.</strong><br>
            Pode ser que o hash já seja o mesmo.
        </div>";
    }
    
    // Verificar novamente
    $userAtualizado = getUserByEmail($email);
    $verificado = password_verify($senha, $userAtualizado['password']);
    
    if ($verificado) {
        echo "<div class='success'>
            <strong>✅ TESTE FINAL: Senha funciona perfeitamente!</strong><br>
            Você pode fazer login agora com:<br>
            Email: <code>{$email}</code><br>
            Senha: <code>{$senha}</code>
        </div>";
    } else {
        echo "<div class='error'>
            <strong>❌ TESTE FINAL: Ainda há problema com a senha.</strong><br>
            Verifique o banco de dados manualmente.
        </div>";
    }
    
    // Mostrar SQL para referência
    echo "<div class='info'>
        <strong>📝 SQL executado (para referência):</strong><br>
        <pre>UPDATE users SET password = '{$novoHash}' WHERE email = '{$email}';</pre>
    </div>";
    
    echo "<div class='warning'>
        <strong>⚠️ IMPORTANTE:</strong><br>
        1. Delete este arquivo após usar por segurança!<br>
        2. Tente fazer login agora no sistema<br>
        3. Se ainda não funcionar, verifique a URL da API no frontend
    </div>";
    
} catch (Exception $e) {
    echo "<div class='error'>
        <strong>❌ Erro:</strong> " . htmlspecialchars($e->getMessage()) . "
    </div>";
}

echo "</body></html>";
?>

