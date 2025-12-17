-- ============================================
-- Atualizar Pasta da Larissa para "leiloes"
-- ============================================

UPDATE `users` 
SET `folder` = 'leiloes'
WHERE `email` = 'larissa@gruporaca.com.br';

-- Verificar se foi atualizado
SELECT id, email, name, role, folder, active 
FROM users 
WHERE email = 'larissa@gruporaca.com.br';

