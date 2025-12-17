-- ============================================
-- Criar Usuário ROOT - Marcus Lopes
-- Execute este script no phpMyAdmin (aba SQL)
-- ============================================
--
-- ⚠️ IMPORTANTE: 
-- MySQL não tem função nativa para gerar hash bcrypt.
-- Você precisa gerar o hash primeiro e colar aqui.
--
-- Para gerar o hash:
-- 1. Acesse: https://todaarte.com.br/api/gerar-hash-senha.php
-- 2. OU use: https://bcrypt-generator.com/
-- 3. Senha: Gr@up0R@c@2024!M@rcus#Secure
-- 4. Copie o hash gerado
-- 5. Cole no lugar de 'HASH_BCRYPT_AQUI' abaixo
-- ============================================

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
    '$2a$12$shrk4Z9PF.4VyqhLzguv0uogluDuMRKy/GeCR.jn0sHXfIZVA82fu', -- Hash bcrypt da senha: Gr@up0R@c@2024!M@rcus#Secure
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

-- Verificar se foi criado
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
-- DADOS DE LOGIN:
-- Email: marcus@gruporaca.com.br
-- Senha: Gr@up0R@c@2024!M@rcus#Secure
-- Role: root
-- ============================================

