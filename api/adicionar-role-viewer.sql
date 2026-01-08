-- ============================================
-- Adicionar novo role 'viewer' ao sistema
-- 
-- Este script adiciona o role 'viewer' que permite:
-- - Ver todas as pastas (como ADMIN)
-- - Baixar arquivos
-- - NÃO pode deletar
-- - NÃO pode gerenciar usuários
-- ============================================

USE `u179630068_gruporaca_db`;

-- Alterar o ENUM para incluir 'viewer'
ALTER TABLE `users` 
MODIFY COLUMN `role` ENUM('root', 'admin', 'viewer', 'user') NOT NULL DEFAULT 'user';

-- ============================================
-- Verificar se foi alterado corretamente
-- ============================================
DESCRIBE `users`;

-- ============================================
-- Exemplo: Criar um usuário com role 'viewer'
-- ============================================
-- INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`, `active`) VALUES
-- ('viewer@gruporaca.com.br', '$2y$12$HASH_AQUI', 'Visualizador', 'viewer', '*', 
--  JSON_OBJECT('upload', false, 'download', true, 'delete', false, 'view_all', true, 'manage_users', false, 'manage_permissions', false), 1);

