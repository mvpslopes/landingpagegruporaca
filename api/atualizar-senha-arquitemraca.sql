-- ============================================
-- Atualizar Senha do Usuário: Arquitetem Raça
-- Email: arquitemraca@gruporaca.com.br
-- Senha: arquitemraca@2025user
-- ============================================

USE `u179630068_gruporaca_db`;

-- Atualizar senha do usuário e garantir que está ativo
UPDATE `users` 
SET 
    `password` = '$2y$12$qUts69/2aMB2.t1I.VqYG.2FonSpFEJtMsSXKpianpmSrtdwETYaq',
    `active` = 1
WHERE 
    `email` = 'arquitemraca@gruporaca.com.br';

-- Verificar se foi atualizado
SELECT 
    id,
    email,
    name,
    role,
    folder,
    active,
    CASE 
        WHEN `password` = '$2y$12$qUts69/2aMB2.t1I.VqYG.2FonSpFEJtMsSXKpianpmSrtdwETYaq' 
        THEN '✅ Senha atualizada corretamente' 
        ELSE '❌ Senha não corresponde' 
    END as status_senha
FROM `users` 
WHERE `email` = 'arquitemraca@gruporaca.com.br';
