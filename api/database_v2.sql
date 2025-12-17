-- ============================================
-- Banco de Dados: Sistema de Banco de Dados Grupo Raça
-- VERSÃO 2.0 - Otimizada e Completa
-- ============================================

-- Criar banco de dados (execute no phpMyAdmin ou via linha de comando)
-- CREATE DATABASE IF NOT EXISTS `u179630068_gruporaca_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `u179630068_gruporaca_db`;

-- ============================================
-- Tabela: users
-- ============================================
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

-- ============================================
-- Tabela: files (VERSÃO MELHORADA)
-- ============================================
CREATE TABLE IF NOT EXISTS `files` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `drive_file_id` VARCHAR(255) DEFAULT NULL UNIQUE, -- Permite NULL até Google Drive estar configurado
  `name` VARCHAR(255) NOT NULL,
  `folder` VARCHAR(255) NOT NULL,
  `size` BIGINT(20) UNSIGNED NOT NULL,
  `mime_type` VARCHAR(100) DEFAULT NULL,
  `drive_url` TEXT DEFAULT NULL,
  `thumbnail_url` TEXT DEFAULT NULL,
  `uploaded_by` INT(11) UNSIGNED NOT NULL,
  `uploaded_by_name` VARCHAR(255) DEFAULT NULL, -- Cache do nome do usuário (evita JOIN)
  `uploaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `description` TEXT DEFAULT NULL, -- Descrição do arquivo
  `animal_name` VARCHAR(255) DEFAULT NULL, -- Nome do animal (usado no frontend)
  `animal_id` VARCHAR(50) DEFAULT NULL, -- ID do animal (usado no frontend)
  `tags` JSON DEFAULT NULL,
  `metadata` JSON DEFAULT NULL, -- Outros metadados flexíveis
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL, -- Soft delete com timestamp
  PRIMARY KEY (`id`),
  INDEX `idx_folder` (`folder`),
  INDEX `idx_uploaded_by` (`uploaded_by`),
  INDEX `idx_uploaded_at` (`uploaded_at`),
  INDEX `idx_active` (`active`),
  INDEX `idx_animal_name` (`animal_name`), -- Para busca por animal
  INDEX `idx_animal_id` (`animal_id`), -- Para busca por ID do animal
  INDEX `idx_deleted_at` (`deleted_at`), -- Para filtrar deletados
  FULLTEXT INDEX `idx_name` (`name`), -- Busca fulltext no nome
  FULLTEXT INDEX `idx_description` (`description`), -- Busca fulltext na descrição
  FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabela: sessions (OPCIONAL - pode ser removida se usar sessões PHP nativas)
-- ============================================
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` VARCHAR(128) NOT NULL,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_activity` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_expires_at` (`expires_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabela: audit_log
-- ============================================
CREATE TABLE IF NOT EXISTS `audit_log` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `resource_type` VARCHAR(50) DEFAULT NULL,
  `resource_id` INT(11) UNSIGNED DEFAULT NULL,
  `details` JSON DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_action` (`action`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_resource` (`resource_type`, `resource_id`), -- Índice composto para buscas
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Inserir usuários iniciais
-- ============================================

-- ROOT: Marcus Lopes
INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`) VALUES
('marcus@gruporaca.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Marcus Lopes', 'root', '*', 
 JSON_OBJECT(
   'upload', true,
   'download', true,
   'delete', true,
   'view_all', true,
   'manage_users', true,
   'manage_permissions', true
 )
) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ADMIN: Thaty
INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`) VALUES
('thaty@gruporaca.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Thaty', 'admin', '*',
 JSON_OBJECT(
   'upload', true,
   'download', true,
   'delete', true,
   'view_all', true,
   'manage_users', false,
   'manage_permissions', false
 )
) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ADMIN: Lara
INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`) VALUES
('lara@gruporaca.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lara', 'admin', '*',
 JSON_OBJECT(
   'upload', true,
   'download', true,
   'delete', true,
   'view_all', true,
   'manage_users', false,
   'manage_permissions', false
 )
) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ADMIN: Ana Beatriz
INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`) VALUES
('ana@gruporaca.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ana Beatriz', 'admin', '*',
 JSON_OBJECT(
   'upload', true,
   'download', true,
   'delete', true,
   'view_all', true,
   'manage_users', false,
   'manage_permissions', false
 )
) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ADMIN: Larissa Mendes
INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`) VALUES
('larissa@gruporaca.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Larissa Mendes', 'admin', '*',
 JSON_OBJECT(
   'upload', true,
   'download', true,
   'delete', true,
   'view_all', true,
   'manage_users', false,
   'manage_permissions', false
 )
) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ADMIN: Ariane Andrade
INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`) VALUES
('ariane@gruporaca.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ariane Andrade', 'admin', '*',
 JSON_OBJECT(
   'upload', true,
   'download', true,
   'delete', true,
   'view_all', true,
   'manage_users', false,
   'manage_permissions', false
 )
) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ============================================
-- Melhorias Implementadas:
-- ============================================
-- 1. ✅ Campo `drive_file_id` agora permite NULL (até Google Drive estar configurado)
-- 2. ✅ Adicionado `uploaded_by_name` para cache do nome (evita JOIN)
-- 3. ✅ Adicionado `description` para descrição do arquivo
-- 4. ✅ Adicionado `animal_name` e `animal_id` (usados no frontend)
-- 5. ✅ Adicionado `deleted_at` para soft delete com timestamp
-- 6. ✅ Índices adicionais para `animal_name`, `animal_id` e `deleted_at`
-- 7. ✅ Fulltext index em `description` para buscas
-- 8. ✅ Índice composto em `audit_log` para melhor performance
-- 9. ✅ Tabela `sessions` mantida (opcional, pode ser removida se não usar)
--
-- Notas:
-- - A senha padrão para todos os usuários é: "password"
-- - Altere as senhas após o primeiro login
-- - O campo 'folder' com valor '*' significa acesso a todas as pastas
-- - As permissões são armazenadas em formato JSON
-- - O campo 'drive_file_id' será preenchido quando integrar com Google Drive

