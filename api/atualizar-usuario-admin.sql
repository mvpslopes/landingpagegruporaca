-- Atualizar usuário para role ADMIN
-- Execute este script no banco de dados para dar permissão de administrador

-- Verificar usuário atual
SELECT id, email, name, role, active 
FROM users 
WHERE email = 'puramarcha@gruporaca.com.br';

-- Atualizar role para 'admin'
UPDATE users 
SET role = 'admin'
WHERE email = 'puramarcha@gruporaca.com.br';

-- Verificar se foi atualizado
SELECT id, email, name, role, active 
FROM users 
WHERE email = 'puramarcha@gruporaca.com.br';

-- Se quiser atualizar para ROOT (acesso total), use:
-- UPDATE users SET role = 'root' WHERE email = 'puramarcha@gruporaca.com.br';

