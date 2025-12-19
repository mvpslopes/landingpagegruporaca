<?php
/**
 * API de Estatísticas - Fornece dados agregados para o dashboard
 * 
 * Endpoints (apenas para admin/root):
 * - GET /api/statistics.php?action=overview - Visão geral
 * - GET /api/statistics.php?action=pageviews - Estatísticas de páginas
 * - GET /api/statistics.php?action=clicks - Estatísticas de cliques
 * - GET /api/statistics.php?action=flow - Fluxo de navegação
 * - GET /api/statistics.php?action=devices - Estatísticas por dispositivo
 * - GET /api/statistics.php?action=realtime - Dados em tempo real
 */

// Habilitar exibição de erros para debug (remover em produção)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Verificar se os arquivos necessários existem
$configFile = __DIR__ . '/config.php';
$dbConfigFile = __DIR__ . '/db_config.php';
$permissionsFile = __DIR__ . '/permissions_db.php';

if (!file_exists($configFile)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Arquivo config.php não encontrado']);
    exit;
}
if (!file_exists($dbConfigFile)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Arquivo db_config.php não encontrado']);
    exit;
}
if (!file_exists($permissionsFile)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Arquivo permissions_db.php não encontrado']);
    exit;
}

require_once $configFile;
require_once $dbConfigFile;
require_once $permissionsFile;

// Verificar autenticação e permissões
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

try {
    $user = requireAuth();
    if (!$user || !is_array($user)) {
        throw new Exception('Usuário não autenticado');
    }
} catch (Exception $e) {
    error_log("Erro na autenticação: " . $e->getMessage());
    jsonError('Erro de autenticação: ' . $e->getMessage(), 401);
}

// Apenas admin e root podem acessar
if (!isset($user['role']) || ($user['role'] !== 'admin' && $user['role'] !== 'root')) {
    jsonError('Acesso negado. Apenas administradores podem ver estatísticas.', 403);
}

try {
    $conn = getDBConnection();
    if (!$conn) {
        throw new Exception('Não foi possível conectar ao banco de dados');
    }
} catch (Exception $e) {
    error_log("Erro na conexão com banco: " . $e->getMessage());
    jsonError('Erro ao conectar ao banco de dados: ' . $e->getMessage(), 500);
}

$action = isset($_GET['action']) ? trim($_GET['action']) : 'overview';
$period = isset($_GET['period']) ? trim($_GET['period']) : '7d'; // 1d, 7d, 30d, 90d, custom

// Configurar fuso horário para Brasília
date_default_timezone_set('America/Sao_Paulo');

// Calcular datas baseado no período
$dateFormat = 'Y-m-d H:i:s';
$now = new DateTime('now', new DateTimeZone('America/Sao_Paulo'));
$startDate = clone $now;

switch ($period) {
    case '1d':
        $startDate->modify('-1 day');
        break;
    case '7d':
        $startDate->modify('-7 days');
        break;
    case '30d':
        $startDate->modify('-30 days');
        break;
    case '90d':
        $startDate->modify('-90 days');
        break;
    case 'custom':
        $startDate = isset($_GET['start']) ? new DateTime($_GET['start']) : $startDate->modify('-7 days');
        $now = isset($_GET['end']) ? new DateTime($_GET['end']) : $now;
        break;
    default:
        $startDate->modify('-7 days');
}

$startDateStr = $startDate->format($dateFormat);
$endDateStr = $now->format($dateFormat);

try {
    switch ($action) {
        case 'overview':
            // Visão geral
            // Total de visitas
            $stmt = $conn->prepare("
                SELECT COUNT(DISTINCT session_id) as total_visits,
                       COUNT(*) as total_pageviews
                FROM page_views
                WHERE created_at >= ? AND created_at <= ?
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $visits = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Visitantes únicos (por IP)
            $stmt = $conn->prepare("
                SELECT COUNT(DISTINCT ip_address) as unique_visitors
                FROM page_views
                WHERE created_at >= ? AND created_at <= ?
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $visitors = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Tempo médio na página
            $stmt = $conn->prepare("
                SELECT AVG(time_on_page) as avg_time_on_page
                FROM page_views
                WHERE created_at >= ? AND created_at <= ? AND time_on_page IS NOT NULL
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $avgTime = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Total de cliques
            $stmt = $conn->prepare("
                SELECT COUNT(*) as total_clicks
                FROM click_events
                WHERE created_at >= ? AND created_at <= ?
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $clicks = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Taxa de rejeição (sessões com apenas 1 página)
            $stmt = $conn->prepare("
                SELECT 
                    COUNT(DISTINCT CASE WHEN page_count = 1 THEN session_id END) as bounce_sessions,
                    COUNT(DISTINCT session_id) as total_sessions
                FROM (
                    SELECT session_id, COUNT(*) as page_count
                    FROM page_views
                    WHERE created_at >= ? AND created_at <= ?
                    GROUP BY session_id
                ) as session_pages
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $bounceData = $stmt->fetch(PDO::FETCH_ASSOC);
            $bounceRate = ($bounceData && isset($bounceData['total_sessions']) && $bounceData['total_sessions'] > 0) 
                ? round(($bounceData['bounce_sessions'] / $bounceData['total_sessions']) * 100, 1)
                : 0;
            
            // Duração média de sessão
            // Se total_time não estiver disponível, calcular baseado no tempo entre primeiro e último pageview
            $stmt = $conn->prepare("
                SELECT AVG(total_time) as avg_session_duration
                FROM user_sessions
                WHERE created_at >= ? AND created_at <= ? AND total_time > 0
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $sessionDuration = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Se não houver total_time, calcular baseado na diferença entre primeiro e último pageview
            $avgSessionDuration = isset($sessionDuration['avg_session_duration']) ? $sessionDuration['avg_session_duration'] : 0;
            if (empty($avgSessionDuration) || $avgSessionDuration == 0) {
                try {
                    $stmt = $conn->prepare("
                        SELECT AVG(TIMESTAMPDIFF(SECOND, MIN(created_at), MAX(created_at))) as avg_session_duration
                        FROM page_views
                        WHERE created_at >= ? AND created_at <= ?
                        GROUP BY session_id
                        HAVING COUNT(*) > 1
                    ");
                    $stmt->execute([$startDateStr, $endDateStr]);
                    $calculatedDuration = $stmt->fetch(PDO::FETCH_ASSOC);
                    if ($calculatedDuration && isset($calculatedDuration['avg_session_duration']) && $calculatedDuration['avg_session_duration'] > 0) {
                        if (!$sessionDuration || !is_array($sessionDuration)) {
                            $sessionDuration = [];
                        }
                        $sessionDuration['avg_session_duration'] = $calculatedDuration['avg_session_duration'];
                    } else {
                        if (!$sessionDuration || !is_array($sessionDuration)) {
                            $sessionDuration = [];
                        }
                        $sessionDuration['avg_session_duration'] = 0;
                    }
                } catch (Exception $e) {
                    error_log("Erro ao calcular duração de sessão: " . $e->getMessage());
                    if (!$sessionDuration || !is_array($sessionDuration)) {
                        $sessionDuration = [];
                    }
                    $sessionDuration['avg_session_duration'] = 0;
                }
            }
            
            // Gráfico de visitas ao longo do tempo
            $stmt = $conn->prepare("
                SELECT DATE(created_at) as date, COUNT(DISTINCT session_id) as visits
                FROM page_views
                WHERE created_at >= ? AND created_at <= ?
                GROUP BY DATE(created_at)
                ORDER BY date ASC
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $visitsChart = $stmt->fetchAll();
            
            // Horários de pico (por hora do dia) - Usando timezone configurado
            $stmt = $conn->prepare("
                SELECT 
                    HOUR(created_at) as hour, 
                    COUNT(DISTINCT session_id) as visits
                FROM page_views
                WHERE created_at >= ? AND created_at <= ?
                GROUP BY HOUR(created_at)
                ORDER BY hour ASC
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $peakHours = $stmt->fetchAll();
            
            // Dias da semana mais ativos
            $stmt = $conn->prepare("
                SELECT DAYNAME(created_at) as day_name, DAYOFWEEK(created_at) as day_num, COUNT(DISTINCT session_id) as visits
                FROM page_views
                WHERE created_at >= ? AND created_at <= ?
                GROUP BY day_name, day_num
                ORDER BY day_num ASC
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $weekDays = $stmt->fetchAll();
            
            // Garantir que todos os valores existem antes de retornar (compatível com PHP 5.6+)
            $totalVisits = isset($visits['total_visits']) ? (int)$visits['total_visits'] : 0;
            $totalPageviews = isset($visits['total_pageviews']) ? (int)$visits['total_pageviews'] : 0;
            $uniqueVisitors = isset($visitors['unique_visitors']) ? (int)$visitors['unique_visitors'] : 0;
            $avgTimeOnPage = isset($avgTime['avg_time_on_page']) ? round((float)$avgTime['avg_time_on_page'], 2) : 0;
            $totalClicks = isset($clicks['total_clicks']) ? (int)$clicks['total_clicks'] : 0;
            $avgSessionDuration = isset($sessionDuration['avg_session_duration']) ? round((float)$sessionDuration['avg_session_duration'], 2) : 0;
            
            jsonResponse([
                'total_visits' => $totalVisits,
                'total_pageviews' => $totalPageviews,
                'unique_visitors' => $uniqueVisitors,
                'avg_time_on_page' => $avgTimeOnPage,
                'total_clicks' => $totalClicks,
                'bounce_rate' => $bounceRate,
                'avg_session_duration' => $avgSessionDuration,
                'visits_chart' => is_array($visitsChart) ? $visitsChart : [],
                'peak_hours' => is_array($peakHours) ? $peakHours : [],
                'week_days' => is_array($weekDays) ? $weekDays : [],
                'period' => $period,
                'start_date' => $startDateStr,
                'end_date' => $endDateStr
            ]);
            break;
            
        case 'pageviews':
            // Páginas mais visitadas
            $stmt = $conn->prepare("
                SELECT 
                    page_path,
                    COUNT(*) as views,
                    COUNT(DISTINCT session_id) as unique_views,
                    AVG(time_on_page) as avg_time
                FROM page_views
                WHERE created_at >= ? AND created_at <= ?
                GROUP BY page_path
                ORDER BY views DESC
                LIMIT 20
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $pages = $stmt->fetchAll();
            
            jsonResponse([
                'pages' => $pages,
                'period' => $period
            ]);
            break;
            
        case 'clicks':
            // Estatísticas de cliques
            // Elementos mais clicados
            $stmt = $conn->prepare("
                SELECT 
                    element_type,
                    element_id,
                    element_text,
                    COUNT(*) as click_count
                FROM click_events
                WHERE created_at >= ? AND created_at <= ?
                GROUP BY element_type, element_id, element_text
                ORDER BY click_count DESC
                LIMIT 30
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $topClicks = $stmt->fetchAll();
            
            // Distribuição por tipo
            $stmt = $conn->prepare("
                SELECT 
                    element_type,
                    COUNT(*) as count
                FROM click_events
                WHERE created_at >= ? AND created_at <= ?
                GROUP BY element_type
                ORDER BY count DESC
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $byType = $stmt->fetchAll();
            
            jsonResponse([
                'top_clicks' => $topClicks,
                'by_type' => $byType,
                'period' => $period
            ]);
            break;
            
        case 'flow':
            // Fluxo de navegação
            // Páginas de entrada
            $stmt = $conn->prepare("
                SELECT 
                    first_page as page,
                    COUNT(*) as count
                FROM user_sessions
                WHERE created_at >= ? AND created_at <= ? AND first_page IS NOT NULL
                GROUP BY first_page
                ORDER BY count DESC
                LIMIT 10
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $entryPages = $stmt->fetchAll();
            
            // Páginas de saída (última página visitada em cada sessão)
            $stmt = $conn->prepare("
                SELECT 
                    pv.page_path,
                    COUNT(*) as exit_count
                FROM page_views pv
                INNER JOIN (
                    SELECT session_id, MAX(created_at) as last_view
                    FROM page_views
                    WHERE created_at >= ? AND created_at <= ?
                    GROUP BY session_id
                ) as last_views ON pv.session_id = last_views.session_id 
                    AND pv.created_at = last_views.last_view
                WHERE pv.created_at >= ? AND pv.created_at <= ?
                GROUP BY pv.page_path
                ORDER BY exit_count DESC
                LIMIT 10
            ");
            $stmt->execute([$startDateStr, $endDateStr, $startDateStr, $endDateStr]);
            $exitPages = $stmt->fetchAll();
            
            // Caminhos mais comuns
            $stmt = $conn->prepare("
                SELECT 
                    from_page,
                    to_page,
                    COUNT(*) as count
                FROM navigation_flow
                WHERE created_at >= ? AND created_at <= ?
                GROUP BY from_page, to_page
                ORDER BY count DESC
                LIMIT 20
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $paths = $stmt->fetchAll();
            
            // Origem do tráfego (referrers)
            $stmt = $conn->prepare("
                SELECT 
                    CASE 
                        WHEN referrer IS NULL OR referrer = '' THEN 'Direto'
                        WHEN referrer LIKE '%google%' OR referrer LIKE '%bing%' OR referrer LIKE '%yahoo%' THEN 'Buscadores'
                        WHEN referrer LIKE '%facebook%' OR referrer LIKE '%instagram%' OR referrer LIKE '%twitter%' THEN 'Redes Sociais'
                        ELSE 'Outros'
                    END as source,
                    COUNT(DISTINCT session_id) as sessions
                FROM page_views
                WHERE created_at >= ? AND created_at <= ?
                GROUP BY source
                ORDER BY sessions DESC
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $trafficSources = $stmt->fetchAll();
            
            jsonResponse([
                'entry_pages' => $entryPages,
                'exit_pages' => $exitPages,
                'navigation_paths' => $paths,
                'traffic_sources' => $trafficSources,
                'period' => $period
            ]);
            break;
            
        case 'devices':
            // Estatísticas por dispositivo
            $stmt = $conn->prepare("
                SELECT 
                    device_type,
                    browser,
                    os,
                    COUNT(DISTINCT session_id) as sessions,
                    COUNT(*) as pageviews
                FROM page_views
                WHERE created_at >= ? AND created_at <= ?
                GROUP BY device_type, browser, os
                ORDER BY sessions DESC
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $devices = $stmt->fetchAll();
            
            // Resumo por tipo de dispositivo
            $stmt = $conn->prepare("
                SELECT 
                    device_type,
                    COUNT(DISTINCT session_id) as sessions
                FROM page_views
                WHERE created_at >= ? AND created_at <= ?
                GROUP BY device_type
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $deviceSummary = $stmt->fetchAll();
            
            // Navegadores mais usados
            $stmt = $conn->prepare("
                SELECT 
                    browser,
                    COUNT(DISTINCT session_id) as sessions,
                    COUNT(*) as pageviews
                FROM page_views
                WHERE created_at >= ? AND created_at <= ? AND browser IS NOT NULL
                GROUP BY browser
                ORDER BY sessions DESC
                LIMIT 10
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $browsers = $stmt->fetchAll();
            
            // Sistemas operacionais mais usados
            $stmt = $conn->prepare("
                SELECT 
                    os,
                    COUNT(DISTINCT session_id) as sessions,
                    COUNT(*) as pageviews
                FROM page_views
                WHERE created_at >= ? AND created_at <= ? AND os IS NOT NULL
                GROUP BY os
                ORDER BY sessions DESC
                LIMIT 10
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $operatingSystems = $stmt->fetchAll();
            
            jsonResponse([
                'devices' => $devices,
                'device_summary' => $deviceSummary,
                'browsers' => $browsers,
                'operating_systems' => $operatingSystems,
                'period' => $period
            ]);
            break;
            
        case 'realtime':
            // Dados em tempo real (últimos 5 minutos)
            $realtimeStart = (new DateTime())->modify('-5 minutes')->format($dateFormat);
            
            // Visitantes online agora
            $stmt = $conn->prepare("
                SELECT COUNT(DISTINCT session_id) as online_visitors
                FROM page_views
                WHERE created_at >= ?
            ");
            $stmt->execute([$realtimeStart]);
            $online = $stmt->fetch();
            
            // Páginas sendo visualizadas agora
            $stmt = $conn->prepare("
                SELECT 
                    page_path,
                    COUNT(*) as views
                FROM page_views
                WHERE created_at >= ?
                GROUP BY page_path
                ORDER BY views DESC
                LIMIT 10
            ");
            $stmt->execute([$realtimeStart]);
            $currentPages = $stmt->fetchAll();
            
            jsonResponse([
                'online_visitors' => (int)$online['online_visitors'],
                'current_pages' => $currentPages
            ]);
            break;
            
        case 'locations':
            // Estatísticas de localização
            // Por país
            $stmt = $conn->prepare("
                SELECT 
                    country,
                    COUNT(DISTINCT session_id) as sessions,
                    COUNT(*) as pageviews
                FROM page_views
                WHERE created_at >= ? AND created_at <= ? AND country IS NOT NULL
                GROUP BY country
                ORDER BY sessions DESC
                LIMIT 20
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $countries = $stmt->fetchAll();
            
            // Por cidade
            $stmt = $conn->prepare("
                SELECT 
                    city,
                    country,
                    COUNT(DISTINCT session_id) as sessions,
                    COUNT(*) as pageviews
                FROM page_views
                WHERE created_at >= ? AND created_at <= ? AND city IS NOT NULL
                GROUP BY city, country
                ORDER BY sessions DESC
                LIMIT 30
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $cities = $stmt->fetchAll();
            
            // Por estado/região (se tivermos esse campo no futuro)
            // Por enquanto, agrupamos por país e cidade
            
            jsonResponse([
                'countries' => $countries,
                'cities' => $cities,
                'period' => $period
            ]);
            break;
            
        case 'validation':
            // Endpoint de validação - mostra dados brutos do banco para provar que são reais
            // Total de registros nas tabelas
            $stmt = $conn->query("SELECT COUNT(*) as total FROM page_views");
            $totalPageviews = $stmt->fetch()['total'];
            
            $stmt = $conn->query("SELECT COUNT(*) as total FROM click_events");
            $totalClicks = $stmt->fetch()['total'];
            
            $stmt = $conn->query("SELECT COUNT(*) as total FROM user_sessions");
            $totalSessions = $stmt->fetch()['total'];
            
            // Últimos 5 pageviews reais
            $stmt = $conn->query("
                SELECT session_id, page_path, ip_address, country, city, created_at 
                FROM page_views 
                ORDER BY created_at DESC 
                LIMIT 5
            ");
            $recentPageviews = $stmt->fetchAll();
            
            // Últimos 5 cliques reais
            $stmt = $conn->query("
                SELECT session_id, element_type, page_path, ip_address, created_at 
                FROM click_events 
                ORDER BY created_at DESC 
                LIMIT 5
            ");
            $recentClicks = $stmt->fetchAll();
            
            // Estatísticas de hoje
            $todayStart = (new DateTime('today', new DateTimeZone('America/Sao_Paulo')))->format($dateFormat);
            $todayEnd = (new DateTime('now', new DateTimeZone('America/Sao_Paulo')))->format($dateFormat);
            
            $stmt = $conn->prepare("
                SELECT COUNT(DISTINCT session_id) as visits_today,
                       COUNT(*) as pageviews_today
                FROM page_views
                WHERE created_at >= ? AND created_at <= ?
            ");
            $stmt->execute([$todayStart, $todayEnd]);
            $todayStats = $stmt->fetch();
            
            // IPs únicos de hoje
            $stmt = $conn->prepare("
                SELECT COUNT(DISTINCT ip_address) as unique_ips_today
                FROM page_views
                WHERE created_at >= ? AND created_at <= ? AND ip_address IS NOT NULL
            ");
            $stmt->execute([$todayStart, $todayEnd]);
            $uniqueIPs = $stmt->fetch();
            
            jsonResponse([
                'database_stats' => [
                    'total_pageviews' => (int)$totalPageviews,
                    'total_clicks' => (int)$totalClicks,
                    'total_sessions' => (int)$totalSessions,
                ],
                'today_stats' => [
                    'visits' => (int)$todayStats['visits_today'],
                    'pageviews' => (int)$todayStats['pageviews_today'],
                    'unique_ips' => (int)$uniqueIPs['unique_ips_today'],
                ],
                'recent_pageviews' => $recentPageviews,
                'recent_clicks' => $recentClicks,
                'server_time' => (new DateTime('now', new DateTimeZone('America/Sao_Paulo')))->format('Y-m-d H:i:s T'),
                'timezone' => 'America/Sao_Paulo',
                'validation_timestamp' => time(),
            ]);
            break;
            
        case 'assessors':
            // Estatísticas de Assessores
            // Verificar se a tabela existe
            try {
                $conn->query("SELECT 1 FROM assessors LIMIT 1");
            } catch (PDOException $e) {
                jsonResponse([
                    'categories' => [],
                    'top_assessors' => [],
                    'clicks_by_type' => [],
                    'period' => $period,
                    'error' => 'Tabela assessors não encontrada. Execute o script criar-tabelas-assessores-leiloes.sql'
                ]);
                break;
            }
            
            // Total por categoria
            $stmt = $conn->prepare("
                SELECT category, COUNT(*) as total, COUNT(CASE WHEN active = 1 THEN 1 END) as active_count
                FROM assessors
                GROUP BY category
            ");
            $stmt->execute();
            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Top assessores mais clicados (se a tabela existir)
            // IMPORTANTE: Só retornar assessores que realmente têm cliques (total_clicks > 0)
            $topAssessors = [];
            try {
                $stmt = $conn->prepare("
                    SELECT 
                        a.id,
                        a.name,
                        a.category,
                        COUNT(ac.id) as total_clicks,
                        COUNT(CASE WHEN ac.click_type = 'phone' THEN 1 END) as phone_clicks,
                        COUNT(CASE WHEN ac.click_type = 'whatsapp' THEN 1 END) as whatsapp_clicks,
                        COUNT(CASE WHEN ac.click_type = 'email' THEN 1 END) as email_clicks
                    FROM assessors a
                    INNER JOIN assessor_clicks ac ON a.id = ac.assessor_id
                    WHERE a.active = 1
                    GROUP BY a.id, a.name, a.category
                    HAVING total_clicks > 0
                    ORDER BY total_clicks DESC
                    LIMIT 10
                ");
                $stmt->execute();
                $topAssessors = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (PDOException $e) {
                // Tabela assessor_clicks pode não existir ainda
                error_log("Tabela assessor_clicks não encontrada: " . $e->getMessage());
            }
            
            // Cliques por tipo (se a tabela existir)
            $clicksByType = [];
            try {
                $stmt = $conn->prepare("
                    SELECT click_type, COUNT(*) as total
                    FROM assessor_clicks
                    WHERE created_at >= ? AND created_at <= ?
                    GROUP BY click_type
                ");
                $stmt->execute([$startDateStr, $endDateStr]);
                $clicksByType = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (PDOException $e) {
                // Tabela assessor_clicks pode não existir ainda
            }
            
            jsonResponse([
                'categories' => is_array($categories) ? $categories : [],
                'top_assessors' => is_array($topAssessors) ? $topAssessors : [],
                'clicks_by_type' => is_array($clicksByType) ? $clicksByType : [],
                'period' => $period
            ]);
            break;
            
        case 'auctions':
            // Estatísticas de Leilões
            // Verificar se a tabela existe
            try {
                $conn->query("SELECT 1 FROM auctions LIMIT 1");
            } catch (PDOException $e) {
                jsonResponse([
                    'by_status' => [],
                    'active_count' => 0,
                    'completed_count' => 0,
                    'by_assessor' => [],
                    'conversion_rate' => 0,
                    'total_lots' => 0,
                    'total_sold' => 0,
                    'total_value' => 0,
                    'period' => $period,
                    'error' => 'Tabela auctions não encontrada. Execute o script criar-tabelas-assessores-leiloes.sql'
                ]);
                break;
            }
            
            // Total de leilões por status
            $stmt = $conn->prepare("
                SELECT status, COUNT(*) as total
                FROM auctions
                GROUP BY status
            ");
            $stmt->execute();
            $auctionsByStatus = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Leilões ativos
            $stmt = $conn->prepare("
                SELECT COUNT(*) as total
                FROM auctions
                WHERE status = 'active' AND (end_date IS NULL OR end_date >= NOW())
            ");
            $stmt->execute();
            $activeAuctions = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Leilões completados
            $stmt = $conn->prepare("
                SELECT COUNT(*) as total
                FROM auctions
                WHERE status = 'completed' OR (end_date IS NOT NULL AND end_date < NOW())
            ");
            $stmt->execute();
            $completedAuctions = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Leilões por assessor
            $stmt = $conn->prepare("
                SELECT 
                    a.id as assessor_id,
                    a.name as assessor_name,
                    a.category,
                    COUNT(au.id) as total_auctions,
                    SUM(au.sold_lots) as total_sold_lots,
                    SUM(au.total_lots) as total_lots,
                    SUM(au.total_value) as total_value
                FROM assessors a
                LEFT JOIN auctions au ON a.id = au.assessor_id
                WHERE a.active = 1
                GROUP BY a.id, a.name, a.category
                HAVING total_auctions > 0
                ORDER BY total_auctions DESC
            ");
            $stmt->execute();
            $auctionsByAssessor = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Taxa de conversão geral
            $stmt = $conn->prepare("
                SELECT 
                    SUM(total_lots) as total_lots,
                    SUM(sold_lots) as total_sold,
                    SUM(total_value) as total_value
                FROM auctions
                WHERE status IN ('active', 'completed')
            ");
            $stmt->execute();
            $conversionData = $stmt->fetch(PDO::FETCH_ASSOC);
            $conversionRate = 0;
            if (isset($conversionData['total_lots']) && $conversionData['total_lots'] > 0) {
                $conversionRate = round(($conversionData['total_sold'] / $conversionData['total_lots']) * 100, 2);
            }
            
            jsonResponse([
                'by_status' => is_array($auctionsByStatus) ? $auctionsByStatus : [],
                'active_count' => $activeCount,
                'completed_count' => $completedCount,
                'by_assessor' => is_array($auctionsByAssessor) ? $auctionsByAssessor : [],
                'conversion_rate' => $conversionRate,
                'total_lots' => isset($conversionData['total_lots']) ? (int)$conversionData['total_lots'] : 0,
                'total_sold' => isset($conversionData['total_sold']) ? (int)$conversionData['total_sold'] : 0,
                'total_value' => isset($conversionData['total_value']) ? (float)$conversionData['total_value'] : 0,
                'period' => $period
            ]);
            break;
            
        case 'internal_users':
            // Estatísticas de usuários do sistema interno (apenas para root)
            if (!isset($user['role']) || $user['role'] !== 'root') {
                jsonError('Acesso negado. Apenas root pode ver estatísticas de usuários do sistema interno.', 403);
            }
            
            // Verificar se a tabela existe
            try {
                $conn->query("SELECT 1 FROM internal_sessions LIMIT 1");
            } catch (PDOException $e) {
                jsonResponse([
                    'total_users' => 0,
                    'total_sessions' => 0,
                    'avg_session_duration' => 0,
                    'users' => [],
                    'sessions_chart' => [],
                    'period' => $period,
                    'error' => 'Tabela internal_sessions não encontrada. Execute o script criar-tabela-sessoes-internas.sql'
                ]);
                break;
            }
            
            // Total de usuários únicos
            $stmt = $conn->prepare("
                SELECT COUNT(DISTINCT user_id) as total_users
                FROM internal_sessions
                WHERE login_time >= ? AND login_time <= ?
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $totalUsers = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Total de sessões
            $stmt = $conn->prepare("
                SELECT COUNT(*) as total_sessions
                FROM internal_sessions
                WHERE login_time >= ? AND login_time <= ?
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $totalSessions = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Tempo médio de sessão (apenas sessões finalizadas)
            $stmt = $conn->prepare("
                SELECT AVG(session_duration) as avg_duration
                FROM internal_sessions
                WHERE login_time >= ? AND login_time <= ? 
                AND logout_time IS NOT NULL 
                AND session_duration IS NOT NULL
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $avgDuration = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Lista de usuários com estatísticas
            $stmt = $conn->prepare("
                SELECT 
                    user_id,
                    email,
                    name,
                    role,
                    COUNT(*) as total_sessions,
                    AVG(CASE WHEN session_duration IS NOT NULL THEN session_duration ELSE NULL END) as avg_duration,
                    SUM(CASE WHEN session_duration IS NOT NULL THEN session_duration ELSE 0 END) as total_time,
                    MAX(login_time) as last_login
                FROM internal_sessions
                WHERE login_time >= ? AND login_time <= ?
                GROUP BY user_id, email, name, role
                ORDER BY total_sessions DESC, last_login DESC
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Gráfico de acessos ao longo do tempo
            $stmt = $conn->prepare("
                SELECT DATE(login_time) as date, COUNT(*) as sessions, COUNT(DISTINCT user_id) as unique_users
                FROM internal_sessions
                WHERE login_time >= ? AND login_time <= ?
                GROUP BY DATE(login_time)
                ORDER BY date ASC
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $sessionsChart = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Histórico completo de acessos (TODAS as sessões do período)
            $stmt = $conn->prepare("
                SELECT 
                    id,
                    user_id,
                    name,
                    email,
                    role,
                    ip_address,
                    login_time,
                    logout_time,
                    session_duration,
                    created_at
                FROM internal_sessions
                WHERE login_time >= ? AND login_time <= ?
                ORDER BY login_time DESC
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $accessHistory = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            jsonResponse([
                'total_users' => (int)(isset($totalUsers['total_users']) ? $totalUsers['total_users'] : 0),
                'total_sessions' => (int)(isset($totalSessions['total_sessions']) ? $totalSessions['total_sessions'] : 0),
                'avg_session_duration' => round((float)(isset($avgDuration['avg_duration']) ? $avgDuration['avg_duration'] : 0), 2),
                'users' => is_array($users) ? $users : [],
                'sessions_chart' => is_array($sessionsChart) ? $sessionsChart : [],
                'access_history' => is_array($accessHistory) ? $accessHistory : [],
                'period' => $period
            ]);
            break;
            
        default:
            jsonError('Ação inválida', 400);
    }
} catch (PDOException $e) {
    error_log("Erro nas estatísticas: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    jsonError('Erro ao buscar estatísticas: ' . $e->getMessage(), 500);
} catch (Exception $e) {
    error_log("Erro geral nas estatísticas: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    jsonError('Erro ao buscar estatísticas: ' . $e->getMessage(), 500);
}

