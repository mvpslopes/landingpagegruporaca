-- ============================================
-- SQL COMPLETO - Criar Usuário ROOT
-- Copie e cole este SQL no phpMyAdmin
-- ============================================
--
-- SENHA: Gr@up0R@c@2024!M@rcus#Secure
--
-- ⚠️ ANTES DE EXECUTAR:
-- 1. Gere o hash da senha em: https://todaarte.com.br/api/gerar-hash-senha.php
-- 2. OU use: https://bcrypt-generator.com/
-- 3. Substitua 'HASH_AQUI' abaixo pelo hash gerado
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
    'HASH_AQUI', -- ⚠️ SUBSTITUA pelo hash bcrypt gerado
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
    `name` = VALUES(`name`),
    `role` = VALUES(`role`),
    `permissions` = VALUES(`permissions`);

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

