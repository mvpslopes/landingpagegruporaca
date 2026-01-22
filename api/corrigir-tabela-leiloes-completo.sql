-- ============================================
-- Script de Correção Completo da Tabela auctions
-- Execute este script para adicionar as colunas faltantes
-- ============================================

-- 1. Adicionar coluna image_path
ALTER TABLE `auctions` 
ADD COLUMN `image_path` VARCHAR(500) DEFAULT NULL COMMENT 'Caminho da imagem do leilão (salva no Google Drive ou servidor)' 
AFTER `end_date`;

-- 2. Adicionar coluna image_drive_id
ALTER TABLE `auctions` 
ADD COLUMN `image_drive_id` VARCHAR(255) DEFAULT NULL COMMENT 'ID do arquivo no Google Drive (se usar Drive)' 
AFTER `image_path`;

-- 3. Adicionar coluna active
ALTER TABLE `auctions` 
ADD COLUMN `active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Se o leilão está ativo (aparece no site)' 
AFTER `image_drive_id`;

-- 4. Adicionar coluna created_by
ALTER TABLE `auctions` 
ADD COLUMN `created_by` INT(11) UNSIGNED DEFAULT NULL COMMENT 'ID do usuário que criou o leilão' 
AFTER `active`;

-- 5. Adicionar índice idx_active
CREATE INDEX `idx_active` ON `auctions` (`active`);

-- 6. Ajustar end_date para NOT NULL (opcional - apenas se quiser forçar)
-- ALTER TABLE `auctions` 
-- MODIFY COLUMN `end_date` DATETIME NOT NULL;

-- 7. Verificar estrutura final
DESCRIBE `auctions`;

-- ============================================
-- NOTAS:
-- ============================================
-- - As colunas description, status, assessor_id, total_lots, sold_lots, total_value
--   foram mantidas caso sejam usadas em outras partes do sistema
-- - Se não forem necessárias, você pode removê-las com:
--   ALTER TABLE `auctions` DROP COLUMN `description`;
--   ALTER TABLE `auctions` DROP COLUMN `status`;
--   etc.
-- ============================================
