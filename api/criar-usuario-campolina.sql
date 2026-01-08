-- ============================================
-- Criar Usuário Campolina como 'user'
-- ============================================

USE `u179630068_gruporaca_db`;

-- Criar usuário Campolina
INSERT INTO `users` (`email`, `password`, `name`, `role`, `folder`, `permissions`, `active`) VALUES
('campolina@gruporaca.com.br', '$2y$12$HIYxz9csLzB9HKxbn2Onbe6uP431uQMsyS4yTzn2k3sk70DNR6XOG', 'Campolina', 'user', 'campolina', 
 JSON_OBJECT(
    'upload', true,
    'download', true,
    'delete', false,
    'view_all', false,
    'manage_users', false,
    'manage_permissions', false
 ), 1)
ON DUPLICATE KEY UPDATE 
    `password` = VALUES(`password`),
    `name` = VALUES(`name`),
    `role` = VALUES(`role`),
    `folder` = VALUES(`folder`),
    `permissions` = VALUES(`permissions`),
    `active` = 1;

-- Verificar se foi criado
SELECT 
    id,
    email,
    name,
    role,
    folder,
    active
FROM users 
WHERE email = 'campolina@gruporaca.com.br';

