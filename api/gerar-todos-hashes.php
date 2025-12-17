<?php
// Script rápido para gerar todos os hashes

$senhas = [
    'thaty@2025raca',
    'lara@2025raca',
    'ana@2025raca',
    'ariane@2025raca',
    'larissa@2025user',
    'deolhonomarchador@2025user',
    'topmarchador@2025user',
    'arquitemraca@2025user',
    'racaemarcha@user2025',
    'portalmarchador@user2025',
    'puramarcha@user2025',
    'campolina@user2025',
    'Gr@up0R@c@2024!M@rcus#Secure', // Marcus
];

echo "Hashes gerados:\n\n";
foreach ($senhas as $senha) {
    $hash = password_hash($senha, PASSWORD_BCRYPT);
    echo "Senha: $senha\n";
    echo "Hash:  $hash\n\n";
}

