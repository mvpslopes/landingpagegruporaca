-- Remove Kauan e Jeferson da assessoria no banco (desativa; mantém histórico de cliques se houver)
UPDATE `assessors`
SET `active` = 0
WHERE UPPER(TRIM(`name`)) IN ('KAUAN', 'JEFERSON');
