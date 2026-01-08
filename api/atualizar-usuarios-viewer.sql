-- ============================================
-- Atualizar e Criar Usuários VIEWER
-- 
-- Este script:
-- 1. Adiciona o role 'viewer' ao banco (se ainda não existir)
-- 2. Atualiza Larissa de 'user' para 'viewer'
-- 3. Cria novo usuário Luiz como 'viewer'
-- ============================================

USE `u179630068_gruporaca_db`;

-- ============================================
-- 1. Adicionar role 'viewer' ao ENUM (se ainda não existir)
-- ============================================
ALTER TABLE `users` 
MODIFY COLUMN `role` ENUM('root', 'admin', 'viewer', 'user') NOT NULL DEFAULT 'user';

-- ============================================
-- 2. Atualizar Larissa: de 'user' para 'viewer'
-- ============================================
UPDATE `users` 
SET 
    `role` = 'viewer',
    `folder` = '*',
    `permissions` = JSON_OBJECT(
        'upload', true,
        'download', true,
        'delete', false,
        'view_all', true,
        'manage_users', false,
        'manage_permissions', false
    )
WHERE `email` = 'larissa@gruporaca.com.br';

-- ============================================
-- 3. Criar novo usuário Luiz como 'viewer'
-- ============================================
-- Senha: luiz@user2025
-- Hash gerado automaticamente

INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`, `active`) VALUES
('luiz@gruporaca.com.br', '$2y$12$VtejB6qruwcxwJV3GLMLduRRoPGp3RPwGITbDADgrtkHZc87MAR3O', 'Luiz', 'viewer', '*', 
 JSON_OBJECT(
    'upload', true,
    'download', true,
    'delete', false,
    'view_all', true,
    'manage_users', false,
    'manage_permissions', false
 ), 1)
ON DUPLICATE KEY UPDATE 
    `role` = 'viewer',
    `folder` = '*',
    `permissions` = JSON_OBJECT(
        'upload', true,
        'download', true,
        'delete', false,
        'view_all', true,
        'manage_users', false,
        'manage_permissions', false
    ),
    `active` = 1;

-- ============================================
-- Verificar usuários atualizados
-- ============================================
SELECT 
    id,
    email,
    name,
    role,
    folder,
    active,
    permissions
FROM users 
WHERE email IN ('larissa@gruporaca.com.br', 'luiz@gruporaca.com.br')
ORDER BY email;

