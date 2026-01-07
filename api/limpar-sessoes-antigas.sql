-- ============================================
-- Script para Limpar Sessões Antigas
-- ============================================
-- Este script encerra todas as sessões que estão abertas há mais de 5 minutos (300 segundos)
-- Execute este script uma vez para limpar as sessões antigas que já estavam abertas

-- Verificar quantas sessões serão encerradas
SELECT 
    COUNT(*) as total_sessoes_abertas,
    MIN(login_time) as sessao_mais_antiga,
    MAX(login_time) as sessao_mais_recente
FROM internal_sessions
WHERE logout_time IS NULL
AND TIMESTAMPDIFF(SECOND, login_time, NOW()) > 300;

-- Encerrar todas as sessões abertas há mais de 5 minutos (300 segundos)
UPDATE internal_sessions 
SET logout_time = NOW(),
    session_duration = TIMESTAMPDIFF(SECOND, login_time, NOW())
WHERE logout_time IS NULL 
AND TIMESTAMPDIFF(SECOND, login_time, NOW()) > 300;

-- Verificar resultado
SELECT 
    COUNT(*) as sessoes_encerradas,
    AVG(session_duration) as duracao_media_segundos,
    SUM(session_duration) as tempo_total_segundos
FROM internal_sessions
WHERE logout_time IS NOT NULL
AND logout_time >= DATE_SUB(NOW(), INTERVAL 1 MINUTE);


