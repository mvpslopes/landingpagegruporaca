<?php
/**
 * Gerador de Senha Segura e Hash Bcrypt
 * Execute: php gerar-senha-segura.php
 */

// Gerar senha segura
$senha = 'Gr@up0R@c@2024!M@rcus#Secure';

// Gerar hash bcrypt
$hash = password_hash($senha, PASSWORD_BCRYPT);

echo "========================================\n";
echo "SENHA GERADA COM SUCESSO\n";
echo "========================================\n\n";
echo "Senha: {$senha}\n";
echo "Hash: {$hash}\n\n";
echo "========================================\n";
echo "Use este hash no arquivo SQL\n";
echo "========================================\n";
?>

