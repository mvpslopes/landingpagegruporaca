-- ============================================
-- Script para Configurar Banco Local (XAMPP)
-- Execute este script no phpMyAdmin do XAMPP
-- ============================================

-- 1. Criar o banco de dados
CREATE DATABASE IF NOT EXISTS `gruporaca_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `gruporaca_db`;

-- 2. Criar tabela users
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `role` ENUM('root', 'admin', 'user') NOT NULL DEFAULT 'user',
  `folder` VARCHAR(255) DEFAULT NULL,
  `permissions` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` INT(11) UNSIGNED DEFAULT NULL,
  `last_login` TIMESTAMP NULL DEFAULT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`),
  INDEX `idx_active` (`active`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Criar tabela sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` VARCHAR(128) NOT NULL,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_expires_at` (`expires_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Criar tabela files (opcional, para testes futuros)
CREATE TABLE IF NOT EXISTS `files` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `drive_file_id` VARCHAR(255) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `folder` VARCHAR(255) NOT NULL,
  `size` BIGINT(20) UNSIGNED NOT NULL,
  `mime_type` VARCHAR(100) DEFAULT NULL,
  `drive_url` TEXT DEFAULT NULL,
  `thumbnail_url` TEXT DEFAULT NULL,
  `uploaded_by` INT(11) UNSIGNED NOT NULL,
  `uploaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tags` JSON DEFAULT NULL,
  `metadata` JSON DEFAULT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  INDEX `idx_folder` (`folder`),
  INDEX `idx_uploaded_by` (`uploaded_by`),
  FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Inserir usuário ROOT (Marcus Lopes)
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

-- 6. Verificar se foi criado
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

