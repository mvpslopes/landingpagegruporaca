-- ============================================
-- ATUALIZAR E CRIAR USUÁRIOS DO SISTEMA
-- Execute este script no phpMyAdmin
-- ============================================

USE `u179630068_gruporaca_db`;

-- ============================================
-- ROOT: Marcus Lopes
-- ============================================
INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`, `active`) VALUES
('marcus@gruporaca.com.br', '$2y$12$AZsGB7.BOiD1ee1bAnO2LufAYbV./AsvO4bmz/ecKvF59CRdV9q.S', 'Marcus Lopes', 'root', '*', 
 JSON_OBJECT('upload', true, 'download', true, 'delete', true, 'view_all', true, 'manage_users', true, 'manage_permissions', true), 1)
ON DUPLICATE KEY UPDATE 
  `password` = VALUES(`password`),
  `name` = VALUES(`name`),
  `role` = VALUES(`role`),
  `folder` = VALUES(`folder`),
  `permissions` = VALUES(`permissions`);

-- ============================================
-- ADMIN: Thaty
-- ============================================
INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`, `active`) VALUES
('thaty@gruporaca.com.br', '$2y$12$AU2eTkeg9Yj0IG9ppnEJpumOPJ2Q0xlbQl3B0U1DyWaZtj.CDxcJO', 'Thaty', 'admin', '*', 
 JSON_OBJECT('upload', true, 'download', true, 'delete', true, 'view_all', true, 'manage_users', false, 'manage_permissions', false), 1)
ON DUPLICATE KEY UPDATE 
  `password` = VALUES(`password`),
  `name` = VALUES(`name`),
  `role` = VALUES(`role`),
  `folder` = VALUES(`folder`),
  `permissions` = VALUES(`permissions`);

-- ============================================
-- ADMIN: Lara
-- ============================================
INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`, `active`) VALUES
('lara@gruporaca.com.br', '$2y$12$4XXJzQBM9kBap7uiaiWWGO1lztU45gPMfqdAxwM8VD4mP8t795D9G', 'Lara', 'admin', '*', 
 JSON_OBJECT('upload', true, 'download', true, 'delete', true, 'view_all', true, 'manage_users', false, 'manage_permissions', false), 1)
ON DUPLICATE KEY UPDATE 
  `password` = VALUES(`password`),
  `name` = VALUES(`name`),
  `role` = VALUES(`role`),
  `folder` = VALUES(`folder`),
  `permissions` = VALUES(`permissions`);

-- ============================================
-- ADMIN: Ana Beatriz
-- ============================================
INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`, `active`) VALUES
('anabeatriz@gruporaca.com.br', '$2y$12$T0TneRKh1AxHxqpils6cFOUwj4DvbTPlyjk1wOZNX0geIeVV.SfTS', 'Ana Beatriz', 'admin', '*', 
 JSON_OBJECT('upload', true, 'download', true, 'delete', true, 'view_all', true, 'manage_users', false, 'manage_permissions', false), 1)
ON DUPLICATE KEY UPDATE 
  `password` = VALUES(`password`),
  `name` = VALUES(`name`),
  `role` = VALUES(`role`),
  `folder` = VALUES(`folder`),
  `permissions` = VALUES(`permissions`);

-- ============================================
-- ADMIN: Ariane Andrade
-- ============================================
INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`, `active`) VALUES
('ariane@gruporaca.com.br', '$2y$12$n1xBcxhCcjgKxaz22D0SFuEe.Gp7iYDqSz8m.giVMdxnG9sFH7e.6', 'Ariane Andrade', 'admin', '*', 
 JSON_OBJECT('upload', true, 'download', true, 'delete', true, 'view_all', true, 'manage_users', false, 'manage_permissions', false), 1)
ON DUPLICATE KEY UPDATE 
  `password` = VALUES(`password`),
  `name` = VALUES(`name`),
  `role` = VALUES(`role`),
  `folder` = VALUES(`folder`),
  `permissions` = VALUES(`permissions`);

-- ============================================
-- USER: Larissa Mendes
-- ============================================
INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`, `active`) VALUES
('larissa@gruporaca.com.br', '$2y$12$0E.7MLDprJKmdfRTBVknoupgxwxdm6AQIZIZi7HX/j2KTa1CkVGE2', 'Larissa Mendes', 'user', 'leiloes', 
 JSON_OBJECT('upload', true, 'download', true, 'delete', false, 'view_all', false, 'manage_users', false, 'manage_permissions', false), 1)
ON DUPLICATE KEY UPDATE 
  `password` = VALUES(`password`),
  `name` = VALUES(`name`),
  `role` = VALUES(`role`),
  `folder` = VALUES(`folder`),
  `permissions` = VALUES(`permissions`);

-- ============================================
-- USER: De Olho no Marchador
-- ============================================
INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`, `active`) VALUES
('deolhonomarchador@gruporaca.com.br', '$2y$12$dcSqMrWO1PUKaaVAoPjCq.UbKRmM.vqb49zK0THWyrNKcWlfJflhy', 'De Olho no Marchador', 'user', 'deolhonomarchador', 
 JSON_OBJECT('upload', true, 'download', true, 'delete', false, 'view_all', false, 'manage_users', false, 'manage_permissions', false), 1)
ON DUPLICATE KEY UPDATE 
  `password` = VALUES(`password`),
  `name` = VALUES(`name`),
  `role` = VALUES(`role`),
  `folder` = VALUES(`folder`),
  `permissions` = VALUES(`permissions`);

-- ============================================
-- USER: Top Marchador
-- ============================================
INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`, `active`) VALUES
('topmarchador@gruporaca.com.br', '$2y$12$ctymuFs.EtK14gJ8cexYEOsw5A9J95ZQLqhgUxZCLjsDNhmLHhYVa', 'Top Marchador', 'user', 'topmarchador', 
 JSON_OBJECT('upload', true, 'download', true, 'delete', false, 'view_all', false, 'manage_users', false, 'manage_permissions', false), 1)
ON DUPLICATE KEY UPDATE 
  `password` = VALUES(`password`),
  `name` = VALUES(`name`),
  `role` = VALUES(`role`),
  `folder` = VALUES(`folder`),
  `permissions` = VALUES(`permissions`);

-- ============================================
-- USER: Arquitetem Raça
-- ============================================
INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`, `active`) VALUES
('arquitemraca@gruporaca.com.br', '$2y$12$KH93ftZMMg00WfbZtbYwzu6l52EHkUUn4OZ0NUog1rcsw.iysuEai', 'Arquitetem Raça', 'user', 'arquitemraca', 
 JSON_OBJECT('upload', true, 'download', true, 'delete', false, 'view_all', false, 'manage_users', false, 'manage_permissions', false), 1)
ON DUPLICATE KEY UPDATE 
  `password` = VALUES(`password`),
  `name` = VALUES(`name`),
  `role` = VALUES(`role`),
  `folder` = VALUES(`folder`),
  `permissions` = VALUES(`permissions`);

-- ============================================
-- USER: Raça e Marcha
-- ============================================
INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`, `active`) VALUES
('racaemarcha@gruporaca.com.br', '$2y$12$i5.ujPwXPGhr9g0H9Ijbc.cteb1PjNfM2jypReJJSTj2t90aN764C', 'Raça e Marcha', 'user', 'racaemarcha', 
 JSON_OBJECT('upload', true, 'download', true, 'delete', false, 'view_all', false, 'manage_users', false, 'manage_permissions', false), 1)
ON DUPLICATE KEY UPDATE 
  `password` = VALUES(`password`),
  `name` = VALUES(`name`),
  `role` = VALUES(`role`),
  `folder` = VALUES(`folder`),
  `permissions` = VALUES(`permissions`);

-- ============================================
-- USER: Portal Marchador
-- ============================================
INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`, `active`) VALUES
('portalmarchador@gruporaca.com.br', '$2y$12$89JoGidb.iBhZo9rEozB2eW.zO70g1QpMb7HyOjm7bI5vPpbeu//S', 'Portal Marchador', 'user', 'portalmarchador', 
 JSON_OBJECT('upload', true, 'download', true, 'delete', false, 'view_all', false, 'manage_users', false, 'manage_permissions', false), 1)
ON DUPLICATE KEY UPDATE 
  `password` = VALUES(`password`),
  `name` = VALUES(`name`),
  `role` = VALUES(`role`),
  `folder` = VALUES(`folder`),
  `permissions` = VALUES(`permissions`);

-- ============================================
-- USER: Pura Marcha
-- ============================================
INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`, `active`) VALUES
('puramarcha@gruporaca.com.br', '$2y$12$aKKLCEqiy5RbvJbM6v8yEe061xEumgHEKkg/B8dfmTTb6lKUT/68q', 'Pura Marcha', 'user', 'puramarcha', 
 JSON_OBJECT('upload', true, 'download', true, 'delete', false, 'view_all', false, 'manage_users', false, 'manage_permissions', false), 1)
ON DUPLICATE KEY UPDATE 
  `password` = VALUES(`password`),
  `name` = VALUES(`name`),
  `role` = VALUES(`role`),
  `folder` = VALUES(`folder`),
  `permissions` = VALUES(`permissions`);

-- ============================================
-- USER: Campolina
-- ============================================
INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`, `active`) VALUES
('campolina@gruporaca.com.br', '$2y$12$eUMy.s6iky9wZQdIfzVnru0C1MKep8SF18yep2WMzz1iShhh2/Ow6', 'Campolina', 'user', 'campolina', 
 JSON_OBJECT('upload', true, 'download', true, 'delete', false, 'view_all', false, 'manage_users', false, 'manage_permissions', false), 1)
ON DUPLICATE KEY UPDATE 
  `password` = VALUES(`password`),
  `name` = VALUES(`name`),
  `role` = VALUES(`role`),
  `folder` = VALUES(`folder`),
  `permissions` = VALUES(`permissions`);

-- ============================================
-- Verificar usuários criados
-- ============================================
SELECT id, email, name, role, folder, active FROM users ORDER BY role, name;

