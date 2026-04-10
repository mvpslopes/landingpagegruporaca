-- ============================================
-- Adicionar coluna de link do leilão (redirecionamento)
-- ============================================
-- Objetivo:
-- - Permitir personalizar o link de "Ver Detalhes" no site por leilão
-- - Campo opcional: se vazio, o site usa o link padrão
--
-- Execute no MySQL:
-- ALTER TABLE `auctions` ...
--

ALTER TABLE `auctions`
ADD COLUMN `link_url` VARCHAR(500) DEFAULT NULL COMMENT 'Link de redirecionamento do leilão (ex: https://...)'
AFTER `image_drive_id`;

-- (Opcional) Índice para consultas/ordenações futuras
CREATE INDEX `idx_link_url` ON `auctions` (`link_url`);

-- Verificar estrutura
DESCRIBE `auctions`;

