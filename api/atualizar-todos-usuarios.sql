-- ============================================
-- Script Consolidado: Atualizar e Criar Usuários
-- 
-- Este script:
-- 1. Adiciona o role 'viewer' ao banco (se ainda não existir)
-- 2. Atualiza Larissa de 'user' para 'viewer' (com permissão de upload)
-- 3. Cria/atualiza Luiz como 'viewer' (com permissão de upload)
-- 4. Cria usuário Campolina como 'user'
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
-- 3. Criar/Atualizar Luiz como 'viewer'
-- Senha: luiz@user2025
-- ============================================
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
    `password` = VALUES(`password`),
    `name` = VALUES(`name`),
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
-- 4. Criar usuário Campolina como 'user'
-- Senha: campolina@user2025
-- ============================================
INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`, `active`) VALUES
('campolina@gruporaca.com.br', '$2y$12$HIYxz9csLzB9HKxbn2Onbe6uP431uQMsyS4yTzn2k3sk70DNR6XOG', 'Campolina', 'user', 'campolina', 
 JSON_OBJECT(
    'upload', true,
    'download', true,
    'delete', false,
    'view_all', false,
    'manage_users', false,
    'manage_permissions', false
 ), 1)
ON DUPLICATE KEY UPDATE 
    `password` = VALUES(`password`),
    `name` = VALUES(`name`),
    `role` = VALUES(`role`),
    `folder` = VALUES(`folder`),
    `permissions` = VALUES(`permissions`),
    `active` = 1;

-- ============================================
-- Verificar todos os usuários atualizados/criados
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
WHERE email IN ('larissa@gruporaca.com.br', 'luiz@gruporaca.com.br', 'campolina@gruporaca.com.br')
ORDER BY email;

