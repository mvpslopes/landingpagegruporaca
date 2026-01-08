<?php
/**
 * Listar Todos os Usuários do Sistema
 * 
 * ⚠️ ATENÇÃO: As senhas são armazenadas como hash bcrypt e NÃO podem ser recuperadas.
 * Para redefinir uma senha, use o sistema de gerenciamento de usuários ou crie um novo hash.
 * 
 * Acesso: Apenas ROOT
 */

require_once 'config.php';
require_once 'permissions_db.php';

$user = requireAuth();

// Apenas ROOT pode acessar
if ($user['role'] !== 'root') {
    jsonError('Acesso negado. Apenas ROOT pode listar usuários.', 403);
}

// Carregar todos os usuários
$users = loadUsers();

// Preparar lista formatada
$userList = [];
foreach ($users as $u) {
    $userList[] = [
        'id' => $u['id'],
        'email' => $u['email'],
        'name' => $u['name'],
        'role' => $u['role'],
        'folder' => $u['folder'] ?? '*',
        'active' => $u['active'] ?? true,
        'permissions' => $u['permissions'] ?? [],
        'created_at' => $u['created_at'] ?? null,
        'last_login' => $u['last_login'] ?? null
    ];
}

// Agrupar por role
$grouped = [
    'root' => [],
    'admin' => [],
    'user' => []
];

foreach ($userList as $u) {
    $grouped[$u['role']][] = $u;
}

// Retornar resultado formatado
jsonResponse([
    'total' => count($userList),
    'by_role' => [
        'root' => count($grouped['root']),
        'admin' => count($grouped['admin']),
        'user' => count($grouped['user'])
    ],
    'users' => $userList,
    'grouped' => $grouped,
    'note' => '⚠️ As senhas são armazenadas como hash bcrypt e não podem ser recuperadas. Para redefinir uma senha, use o sistema de gerenciamento de usuários.'
]);
?>

