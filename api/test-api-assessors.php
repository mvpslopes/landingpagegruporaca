<?php
/**
 * Teste direto da API de assessores
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

header('Content-Type: application/json; charset=utf-8');

try {
    require_once __DIR__ . '/config.php';
    require_once __DIR__ . '/db_config.php';
    require_once __DIR__ . '/permissions_db.php';
    
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    $user = requireAuth();
    
    if (!isset($user['role']) || ($user['role'] !== 'admin' && $user['role'] !== 'root')) {
        echo json_encode(['error' => 'Acesso negado'], JSON_PRETTY_PRINT);
        exit;
    }
    
    $conn = getDBConnection();
    if (!$conn) {
        throw new Exception('Não foi possível conectar ao banco de dados');
    }
    
    // Simular o que statistics.php faz
    $period = '7d';
    date_default_timezone_set('America/Sao_Paulo');
    $dateFormat = 'Y-m-d H:i:s';
    $now = new DateTime('now', new DateTimeZone('America/Sao_Paulo'));
    $startDate = clone $now;
    $startDate->modify('-7 days');
    $startDateStr = $startDate->format($dateFormat);
    $endDateStr = $now->format($dateFormat);
    
    // Total por categoria
    $stmt = $conn->prepare("
        SELECT category, COUNT(*) as total, COUNT(CASE WHEN active = 1 THEN 1 END) as active_count
        FROM assessors
        GROUP BY category
    ");
    $stmt->execute();
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Top assessores mais clicados
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
            LEFT JOIN assessor_clicks ac ON a.id = ac.assessor_id
            WHERE a.active = 1
            GROUP BY a.id, a.name, a.category
            ORDER BY total_clicks DESC
            LIMIT 10
        ");
        $stmt->execute();
        $topAssessors = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Tabela assessor_clicks não encontrada: " . $e->getMessage());
    }
    
    // Cliques por tipo
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
    
    $result = [
        'categories' => is_array($categories) ? $categories : [],
        'top_assessors' => is_array($topAssessors) ? $topAssessors : [],
        'clicks_by_type' => is_array($clicksByType) ? $clicksByType : [],
        'period' => $period
    ];
    
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}

