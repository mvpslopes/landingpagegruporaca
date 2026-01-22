-- ============================================
-- Script para Verificar e Corrigir Tabela de Leilões
-- Execute este script para garantir que a tabela está correta
-- ============================================

-- 1) Verificar estrutura atual da tabela
DESCRIBE `auctions`;

-- 2) Se a coluna 'breed' não existir, adicionar
-- (Execute apenas se o DESCRIBE mostrar que a coluna não existe)
ALTER TABLE `auctions` 
ADD COLUMN `breed` VARCHAR(100) NOT NULL DEFAULT 'Mangalarga Marchador' COMMENT 'Raça do Cavalo (ex: Mangalarga Marchador, Campolina Marchador)' 
AFTER `title`;

-- 3) Adicionar índice na coluna breed (se não existir)
CREATE INDEX `idx_breed` ON `auctions` (`breed`);

-- 4) Verificar novamente a estrutura
DESCRIBE `auctions`;

-- ============================================
-- Se você quiser recriar a tabela do zero (CUIDADO: apaga todos os dados):
-- ============================================
-- DROP TABLE IF EXISTS `auctions`;
-- 
-- CREATE TABLE `auctions` (
--   `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
--   `title` VARCHAR(255) NOT NULL COMMENT 'Nome do Leilão',
--   `breed` VARCHAR(100) NOT NULL COMMENT 'Raça do Cavalo (ex: Mangalarga Marchador, Campolina Marchador)',
--   `start_date` DATE NOT NULL COMMENT 'Data de Início do Leilão',
--   `end_date` DATE NOT NULL COMMENT 'Data de Fim do Leilão',
--   `image_path` VARCHAR(500) DEFAULT NULL COMMENT 'Caminho da imagem do leilão (salva no Google Drive ou servidor)',
--   `image_drive_id` VARCHAR(255) DEFAULT NULL COMMENT 'ID do arquivo no Google Drive (se usar Drive)',
--   `active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Se o leilão está ativo (aparece no site)',
--   `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   `created_by` INT(11) UNSIGNED DEFAULT NULL COMMENT 'ID do usuário que criou o leilão',
--   PRIMARY KEY (`id`),
--   INDEX `idx_start_date` (`start_date`),
--   INDEX `idx_end_date` (`end_date`),
--   INDEX `idx_active` (`active`),
--   INDEX `idx_breed` (`breed`),
--   FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
