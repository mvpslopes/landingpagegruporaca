-- ============================================
-- Criar Tabela para Gerenciamento de Leilões
-- ============================================

CREATE TABLE IF NOT EXISTS `auctions` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL COMMENT 'Nome do Leilão',
  `breed` VARCHAR(100) NOT NULL COMMENT 'Raça do Cavalo (ex: Mangalarga Marchador, Campolina Marchador)',
  `start_date` DATE NOT NULL COMMENT 'Data de Início do Leilão',
  `end_date` DATE NOT NULL COMMENT 'Data de Fim do Leilão',
  `image_path` VARCHAR(500) DEFAULT NULL COMMENT 'Caminho da imagem do leilão (salva no Google Drive ou servidor)',
  `image_drive_id` VARCHAR(255) DEFAULT NULL COMMENT 'ID do arquivo no Google Drive (se usar Drive)',
  `active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Se o leilão está ativo (aparece no site)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` INT(11) UNSIGNED DEFAULT NULL COMMENT 'ID do usuário que criou o leilão',
  PRIMARY KEY (`id`),
  INDEX `idx_start_date` (`start_date`),
  INDEX `idx_end_date` (`end_date`),
  INDEX `idx_active` (`active`),
  INDEX `idx_breed` (`breed`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Comentários sobre a estrutura:
-- ============================================
-- - title: Nome completo do leilão
-- - breed: Raça do cavalo (Mangalarga Marchador, Campolina Marchador, etc)
-- - start_date: Data de início (formato DATE: YYYY-MM-DD)
-- - end_date: Data de fim (formato DATE: YYYY-MM-DD)
-- - image_path: Caminho relativo da imagem (ex: /leiloes/L01.jpeg) OU caminho no Drive
-- - image_drive_id: ID do arquivo no Google Drive (se usar Drive para armazenar)
-- - active: Se false, o leilão não aparece no site (mas fica no banco)
-- - created_by: Usuário que criou (para auditoria)
--
-- Status do leilão é calculado automaticamente:
-- - EM BREVE: hoje < start_date
-- - NO AR: start_date <= hoje <= end_date
-- - ENCERRADO: hoje > end_date
-- ============================================
