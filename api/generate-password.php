<?php
/**
 * Script para gerar hash de senhas
 * Execute: php generate-password.php
 */

echo "=== Gerador de Hash de Senhas ===\n\n";

if ($argc > 1) {
    $password = $argv[1];
} else {
    echo "Digite a senha: ";
    $password = trim(fgets(STDIN));
}

if (empty($password)) {
    echo "Erro: Senha não pode ser vazia\n";
    exit(1);
}

$hash = password_hash($password, PASSWORD_BCRYPT);

echo "\nSenha: {$password}\n";
echo "Hash: {$hash}\n\n";
echo "Use este hash no arquivo users.json\n";
?>

