<?php
/**
 * Gerador de Hash Bcrypt para Senha Segura
 * 
 * Execute este arquivo no servidor via navegador:
 * https://todaarte.com.br/api/gerar-hash-senha.php
 * 
 * ⚠️ DELETE este arquivo após gerar o hash por segurança!
 */

// Senha segura gerada
$senha = 'Gr@up0R@c@2024!M@rcus#Secure';

// Gerar hash bcrypt
$hash = password_hash($senha, PASSWORD_BCRYPT);

// Verificar se o hash está correto
$verificado = password_verify($senha, $hash);

header('Content-Type: text/plain; charset=utf-8');

echo "========================================\n";
echo "SENHA E HASH GERADOS\n";
echo "========================================\n\n";
echo "Senha: {$senha}\n\n";
echo "Hash Bcrypt:\n";
echo "{$hash}\n\n";
echo "========================================\n";
echo "Status: " . ($verificado ? "✅ Hash válido" : "❌ Hash inválido") . "\n";
echo "========================================\n\n";
echo "INSTRUÇÕES:\n";
echo "1. Copie o hash acima\n";
echo "2. Cole no arquivo criar-usuario-root.sql\n";
echo "3. Substitua a linha do password\n";
echo "4. Execute o SQL no phpMyAdmin\n";
echo "5. DELETE este arquivo por segurança!\n";
?>

