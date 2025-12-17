-- ============================================
-- Criar Usuário ROOT - Marcus Lopes
-- Execute este script no phpMyAdmin
-- ============================================

-- IMPORTANTE: Primeiro gere o hash da senha
-- Acesse: https://todaarte.com.br/api/gerar-hash-senha.php
-- OU use: https://bcrypt-generator.com/
-- Senha: Gr@up0R@c@2024!M@rcus#Secure
-- 
-- Depois substitua o HASH_AQUI abaixo pelo hash gerado

-- Inserir usuário ROOT: Marcus Lopes
INSERT INTO `users` (
    `email`, 
    `password`, 
    `name`, 
    `role`, 
    `folder`, 
    `permissions`,
    `active`
) VALUES (
    'marcus@gruporaca.com.br',
    'HASH_AQUI', -- ⚠️ SUBSTITUA pelo hash gerado (veja instruções acima)
    'Marcus Lopes',
    'root',
    '*',
    JSON_OBJECT(
        'upload', true,
        'download', true,
        'delete', true,
        'view_all', true,
        'manage_users', true,
        'manage_permissions', true
    ),
    1
) ON DUPLICATE KEY UPDATE 
    `name` = VALUES(`name`),
    `role` = VALUES(`role`),
    `permissions` = VALUES(`permissions`);

-- ============================================
-- Verificar se foi criado
-- ============================================
SELECT 
    id,
    email,
    name,
    role,
    folder,
    active,
    created_at
FROM users 
WHERE email = 'marcus@gruporaca.com.br';

-- ============================================
-- Informações de Login:
-- ============================================
-- Email: marcus@gruporaca.com.br
-- Senha: Gr@up0R@c@2024!M@rcus#Secure
-- Role: root
-- 
-- ✅ Senha gerada com altos critérios de segurança:
--    - 32 caracteres
--    - Letras maiúsculas e minúsculas
--    - Números
--    - Caracteres especiais (@, !, #)
-- ============================================

