<?php
/**
 * Script Automático - Criar Usuário ROOT
 * 
 * Este script:
 * 1. Gera o hash bcrypt da senha automaticamente
 * 2. Insere o usuário ROOT no banco de dados
 * 3. Mostra o resultado
 * 
 * ⚠️ IMPORTANTE: Delete este arquivo após usar por segurança!
 */

require_once 'db_config.php';

header('Content-Type: text/html; charset=utf-8');

// Senha segura
$senha = 'Gr@up0R@c@2024!M@rcus#Secure';

// Dados do usuário
$email = 'marcus@gruporaca.com.br';
$name = 'Marcus Lopes';
$role = 'root';

echo "<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Criar Usuário ROOT</title>
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
    <h1>🔐 Criar Usuário ROOT - Marcus Lopes</h1>";

try {
    $conn = getDBConnection();
    
    // Gerar hash bcrypt da senha
    $passwordHash = password_hash($senha, PASSWORD_BCRYPT);
    
    echo "<div class='info'>
        <strong>📋 Informações:</strong><br>
        Email: <code>{$email}</code><br>
        Nome: <code>{$name}</code><br>
        Role: <code>{$role}</code><br>
        Senha: <code>{$senha}</code><br>
        Hash gerado: <code>" . substr($passwordHash, 0, 30) . "...</code>
    </div>";
    
    // Verificar se usuário já existe
    $stmt = $conn->prepare("SELECT id, email, name, role FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existingUser) {
        // Atualizar usuário existente
        $stmt = $conn->prepare("
            UPDATE users 
            SET 
                password = ?,
                name = ?,
                role = ?,
                folder = '*',
                permissions = ?,
                active = 1
            WHERE email = ?
        ");
        
        $permissions = json_encode([
            'upload' => true,
            'download' => true,
            'delete' => true,
            'view_all' => true,
            'manage_users' => true,
            'manage_permissions' => true
        ]);
        
        $stmt->execute([
            $passwordHash,
            $name,
            $role,
            $permissions,
            $email
        ]);
        
        echo "<div class='success'>
            <strong>✅ Usuário atualizado com sucesso!</strong><br>
            O usuário ROOT foi atualizado no banco de dados.
        </div>";
    } else {
        // Inserir novo usuário
        $stmt = $conn->prepare("
            INSERT INTO users (
                email, 
                password, 
                name, 
                role, 
                folder, 
                permissions,
                active
            ) VALUES (?, ?, ?, ?, ?, ?, 1)
        ");
        
        $permissions = json_encode([
            'upload' => true,
            'download' => true,
            'delete' => true,
            'view_all' => true,
            'manage_users' => true,
            'manage_permissions' => true
        ]);
        
        $stmt->execute([
            $email,
            $passwordHash,
            $name,
            $role,
            '*',
            $permissions
        ]);
        
        echo "<div class='success'>
            <strong>✅ Usuário criado com sucesso!</strong><br>
            O usuário ROOT foi inserido no banco de dados.
        </div>";
    }
    
    // Buscar usuário criado para confirmar
    $stmt = $conn->prepare("
        SELECT 
            id,
            email,
            name,
            role,
            folder,
            active,
            created_at
        FROM users 
        WHERE email = ?
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "<div class='info'>
            <strong>📊 Dados do Usuário:</strong><br>
            <pre>";
        print_r($user);
        echo "</pre>
        </div>";
        
        // Verificar se a senha está correta
        $verify = password_verify($senha, $passwordHash);
        if ($verify) {
            echo "<div class='success'>
                <strong>✅ Hash verificado com sucesso!</strong><br>
                A senha foi criptografada corretamente.
            </div>";
        }
    }
    
    echo "<div class='info'>
        <strong>🔑 Dados de Login:</strong><br>
        Email: <code>{$email}</code><br>
        Senha: <code>{$senha}</code><br>
        Role: <code>{$role}</code>
    </div>";
    
    echo "<div class='warning'>
        <strong>⚠️ IMPORTANTE:</strong><br>
        1. Delete este arquivo após usar por segurança!<br>
        2. Faça login no sistema para testar<br>
        3. Altere a senha após o primeiro login (quando implementarmos essa funcionalidade)
    </div>";
    
} catch (PDOException $e) {
    echo "<div class='error'>
        <strong>❌ Erro ao criar usuário:</strong><br>
        " . htmlspecialchars($e->getMessage()) . "
    </div>";
}

echo "</body></html>";
?>

