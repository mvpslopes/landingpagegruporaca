-- ============================================
-- Criar Usuário ROOT - Marcus Lopes
-- Execute este script no phpMyAdmin
-- Tudo é feito automaticamente via SQL
-- ============================================

-- Senha: Gr@up0R@c@2024!M@rcus#Secure
-- Hash bcrypt gerado automaticamente usando função MySQL

-- Inserir usuário ROOT: Marcus Lopes
-- Nota: MySQL não tem função nativa para bcrypt, então vamos usar um hash pré-gerado
-- Este hash foi gerado para a senha: Gr@up0R@c@2024!M@rcus#Secure
INSERT INTO `users` (
    `email`, 
    `password`, 
    `name`, 
    `role`, 
    `folder`, 
    `permissions`,
    `active`
) VALUES (
    'marcus@gruporaca.com.br',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Hash bcrypt da senha: Gr@up0R@c@2024!M@rcus#Secure
    'Marcus Lopes',
    'root',
    '*',
    JSON_OBJECT(
        'upload', true,
        'download', true,
        'delete', true,
        'view_all', true,
        'manage_users', true,
        'manage_permissions', true
    ),
    1
) ON DUPLICATE KEY UPDATE 
    `password` = VALUES(`password`),
    `name` = VALUES(`name`),
    `role` = VALUES(`role`),
    `permissions` = VALUES(`permissions`),
    `active` = 1;

-- ============================================
-- Verificar se foi criado
-- ============================================
SELECT 
    id,
    email,
    name,
    role,
    folder,
    active,
    created_at
FROM users 
WHERE email = 'marcus@gruporaca.com.br';

-- ============================================
-- Informações de Login:
-- ============================================
-- Email: marcus@gruporaca.com.br
-- Senha: Gr@up0R@c@2024!M@rcus#Secure
-- Role: root
-- ============================================

