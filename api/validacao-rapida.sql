-- ============================================
-- Validação Rápida do Banco de Dados
-- Execute no phpMyAdmin na aba SQL
-- ============================================

-- 1. Verificar se todas as tabelas existem
SHOW TABLES;

-- 2. Contar total de usuários
SELECT COUNT(*) as total_usuarios FROM users WHERE active = 1;

-- 3. Verificar usuários por role
SELECT role, COUNT(*) as total FROM users WHERE active = 1 GROUP BY role;

-- 4. Listar todos os usuários
SELECT id, email, name, role, folder, active FROM users ORDER BY role, name;

-- 5. Verificar estrutura da tabela files
DESCRIBE files;

-- 6. Verificar se campos da Versão 2 existem
SELECT 
    CASE WHEN COUNT(*) > 0 THEN '✅ Versão 2' ELSE '⚠️ Versão 1' END as versao
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'files'
AND COLUMN_NAME IN ('uploaded_by_name', 'animal_name', 'animal_id', 'description', 'deleted_at')
HAVING COUNT(*) = 5;

-- 7. Verificar índices da tabela files
SHOW INDEX FROM files;

-- 8. Verificar Foreign Keys
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- 9. Verificar charset do banco
SELECT 
    DEFAULT_CHARACTER_SET_NAME as charset,
    DEFAULT_COLLATION_NAME as collation
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME = DATABASE();

-- 10. Resumo geral
SELECT 
    (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()) as total_tabelas,
    (SELECT COUNT(*) FROM users WHERE active = 1) as total_usuarios,
    (SELECT COUNT(*) FROM files WHERE active = 1) as total_arquivos,
    (SELECT COUNT(*) FROM audit_log) as total_logs;

