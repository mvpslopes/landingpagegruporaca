-- ============================================
-- Script de Migração: Adicionar coluna 'breed'
-- Execute este script se a tabela auctions já existir sem a coluna breed
-- ============================================

-- Verificar se a coluna não existe e adicionar
ALTER TABLE `auctions` 
ADD COLUMN IF NOT EXISTS `breed` VARCHAR(100) NOT NULL COMMENT 'Raça do Cavalo (ex: Mangalarga Marchador, Campolina Marchador)' 
AFTER `title`;

-- Se a coluna já existir, você pode atualizar valores vazios com um valor padrão
-- UPDATE `auctions` SET `breed` = 'Mangalarga Marchador' WHERE `breed` IS NULL OR `breed` = '';

-- Adicionar índice se não existir
CREATE INDEX IF NOT EXISTS `idx_breed` ON `auctions` (`breed`);

-- ============================================
-- NOTA: Se o MySQL não suportar IF NOT EXISTS no ALTER TABLE,
-- execute apenas a linha abaixo (pode dar erro se a coluna já existir):
-- ============================================
-- ALTER TABLE `auctions` 
-- ADD COLUMN `breed` VARCHAR(100) NOT NULL DEFAULT 'Mangalarga Marchador' COMMENT 'Raça do Cavalo' 
-- AFTER `title`;
