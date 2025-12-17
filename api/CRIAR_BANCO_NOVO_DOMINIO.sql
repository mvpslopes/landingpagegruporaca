-- ============================================
-- SCRIPT COMPLETO PARA CRIAR BANCO DE DADOS
-- Novo Domínio: gruporaca.app.br
-- ============================================
-- 
-- INSTRUÇÕES:
-- 1. Na Hostinger, acesse o phpMyAdmin
-- 2. Selecione o banco de dados: gruporaca_db
--    (Se a Hostinger adicionou um prefixo, altere o nome abaixo)
-- 3. Clique na aba "SQL"
-- 4. Cole todo este script e clique em "Executar"
-- ============================================

-- Banco de dados: u179630068_gruporaca_db
USE `u179630068_gruporaca_db`;

-- ============================================
-- Tabela: users (Usuários do Sistema)
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
-- Tabela: files (Arquivos do Sistema)
-- ============================================
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
  INDEX `idx_uploaded_at` (`uploaded_at`),
  INDEX `idx_active` (`active`),
  FULLTEXT INDEX `idx_name` (`name`),
  FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabela: sessions (Sessões de Usuários)
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
-- Tabela: audit_log (Log de Auditoria)
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
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERIR USUÁRIOS INICIAIS
-- ============================================
-- 
-- ⚠️ IMPORTANTE: As senhas abaixo são hashes bcrypt
-- Senha padrão para todos: Gr@up0R@c@2024!M@rcus#Secure
-- 
-- Para gerar um novo hash, use: https://gruporaca.app.br/mvpslopes/landingpagegruporaca/api/gerar-hash-senha.php
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
-- VERIFICAÇÃO
-- ============================================
-- Execute estas queries para verificar se tudo foi criado corretamente:

-- Verificar tabelas criadas:
-- SHOW TABLES;

-- Verificar usuários criados:
-- SELECT id, email, name, role, active FROM users;

-- Verificar estrutura da tabela users:
-- DESCRIBE users;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Senha padrão para todos os usuários: Gr@up0R@c@2024!M@rcus#Secure
-- 2. Altere as senhas após o primeiro login (quando implementar essa funcionalidade)
-- 3. O campo 'folder' com valor '*' significa acesso a todas as pastas
-- 4. As permissões são armazenadas em formato JSON
-- 5. O campo 'drive_file_id' será preenchido quando integrar com Google Drive
-- 6. Todos os emails usam o domínio @gruporaca.com.br (mantido do sistema antigo)
-- ============================================

