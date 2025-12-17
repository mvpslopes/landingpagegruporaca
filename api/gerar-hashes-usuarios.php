<?php
/**
 * Script para Gerar Hashes das Senhas dos Usuários
 * Execute este script para gerar os hashes bcrypt de todas as senhas
 */

$usuarios = [
    // Admin
    ['email' => 'thaty@gruporaca.com.br', 'senha' => 'thaty@2025raca', 'nome' => 'Thaty', 'role' => 'admin'],
    ['email' => 'lara@gruporaca.com.br', 'senha' => 'lara@2025raca', 'nome' => 'Lara', 'role' => 'admin'],
    ['email' => 'anabeatriz@gruporaca.com.br', 'senha' => 'ana@2025raca', 'nome' => 'Ana Beatriz', 'role' => 'admin'],
    ['email' => 'ariane@gruporaca.com.br', 'senha' => 'ariane@2025raca', 'nome' => 'Ariane Andrade', 'role' => 'admin'],
    
    // User (Limitado)
    ['email' => 'larissa@gruporaca.com.br', 'senha' => 'larissa@2025user', 'nome' => 'Larissa Mendes', 'role' => 'user'],
    ['email' => 'deolhonomarchador@gruporaca.com.br', 'senha' => 'deolhonomarchador@2025user', 'nome' => 'De Olho no Marchador', 'role' => 'user'],
    ['email' => 'topmarchador@gruporaca.com.br', 'senha' => 'topmarchador@2025user', 'nome' => 'Top Marchador', 'role' => 'user'],
    ['email' => 'arquitemraca@gruporaca.com.br', 'senha' => 'arquitemraca@2025user', 'nome' => 'Arquitetem Raça', 'role' => 'user'],
    ['email' => 'racaemarcha@gruporaca.com.br', 'senha' => 'racaemarcha@user2025', 'nome' => 'Raça e Marcha', 'role' => 'user'],
    ['email' => 'portalmarchador@gruporaca.com.br', 'senha' => 'portalmarchador@user2025', 'nome' => 'Portal Marchador', 'role' => 'user'],
    ['email' => 'puramarcha@gruporaca.com.br', 'senha' => 'puramarcha@user2025', 'nome' => 'Pura Marcha', 'role' => 'user'],
    ['email' => 'campolina@gruporaca.com.br', 'senha' => 'campolina@user2025', 'nome' => 'Campolina', 'role' => 'user'],
    
    // Root (Marcus) - mantém senha antiga
    ['email' => 'marcus@gruporaca.com.br', 'senha' => 'Gr@up0R@c@2024!M@rcus#Secure', 'nome' => 'Marcus Lopes', 'role' => 'root'],
];

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerar Hashes de Senhas</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
        th { background: #667eea; color: white; }
        tr:nth-child(even) { background: #f9f9f9; }
        .hash { font-family: monospace; font-size: 11px; word-break: break-all; }
        .sql-box { background: #f0f0f0; padding: 15px; border-radius: 5px; margin-top: 20px; }
        .sql-box pre { margin: 0; font-size: 12px; }
        button { background: #667eea; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px; }
        button:hover { background: #5568d3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 Hashes de Senhas dos Usuários</h1>
        
        <table>
            <thead>
                <tr>
                    <th>Email</th>
                    <th>Nome</th>
                    <th>Role</th>
                    <th>Senha</th>
                    <th>Hash Bcrypt</th>
                </tr>
            </thead>
            <tbody>
                <?php
                $sqlStatements = [];
                
                foreach ($usuarios as $usuario) {
                    $hash = password_hash($usuario['senha'], PASSWORD_BCRYPT);
                    
                    // Definir permissões baseado no role
                    if ($usuario['role'] === 'root') {
                        $permissions = "JSON_OBJECT('upload', true, 'download', true, 'delete', true, 'view_all', true, 'manage_users', true, 'manage_permissions', true)";
                        $folder = '*';
                    } elseif ($usuario['role'] === 'admin') {
                        $permissions = "JSON_OBJECT('upload', true, 'download', true, 'delete', true, 'view_all', true, 'manage_users', false, 'manage_permissions', false)";
                        $folder = '*';
                    } else {
                        $permissions = "JSON_OBJECT('upload', true, 'download', true, 'delete', false, 'view_all', false, 'manage_users', false, 'manage_permissions', false)";
                        $folder = strtolower(explode('@', $usuario['email'])[0]); // Usa o prefixo do email como pasta
                    }
                    
                    // Gerar SQL
                    $sql = "INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`, `active`) VALUES\n";
                    $sql .= "('{$usuario['email']}', '{$hash}', '{$usuario['nome']}', '{$usuario['role']}', '{$folder}', {$permissions}, 1)\n";
                    $sql .= "ON DUPLICATE KEY UPDATE \n";
                    $sql .= "  `password` = VALUES(`password`),\n";
                    $sql .= "  `name` = VALUES(`name`),\n";
                    $sql .= "  `role` = VALUES(`role`),\n";
                    $sql .= "  `folder` = VALUES(`folder`),\n";
                    $sql .= "  `permissions` = VALUES(`permissions`);";
                    
                    $sqlStatements[] = $sql;
                    
                    echo "<tr>";
                    echo "<td>{$usuario['email']}</td>";
                    echo "<td>{$usuario['nome']}</td>";
                    echo "<td><strong>{$usuario['role']}</strong></td>";
                    echo "<td>{$usuario['senha']}</td>";
                    echo "<td class='hash'>{$hash}</td>";
                    echo "</tr>";
                }
                ?>
            </tbody>
        </table>
        
        <div class="sql-box">
            <h2>📋 Script SQL Completo</h2>
            <p>Copie e cole este script no phpMyAdmin:</p>
            <pre><?php
echo "-- ============================================\n";
echo "-- ATUALIZAR E CRIAR USUÁRIOS DO SISTEMA\n";
echo "-- ============================================\n\n";
echo "USE `u179630068_gruporaca_db`;\n\n";

foreach ($sqlStatements as $sql) {
    echo $sql . "\n\n";
}

echo "-- ============================================\n";
echo "-- Verificar usuários criados:\n";
echo "-- SELECT id, email, name, role, folder, active FROM users ORDER BY role, name;\n";
echo "-- ============================================\n";
            ?></pre>
            <button onclick="copySQL()">📋 Copiar SQL</button>
        </div>
    </div>
    
    <script>
        function copySQL() {
            const sqlBox = document.querySelector('.sql-box pre');
            const text = sqlBox.textContent;
            navigator.clipboard.writeText(text).then(() => {
                alert('SQL copiado para a área de transferência!');
            });
        }
    </script>
</body>
</html>

