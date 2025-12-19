<?php
/**
 * API de Tracking - Recebe eventos de tracking do frontend
 * 
 * Endpoints:
 * - POST /api/tracking.php?action=pageview - Registrar visualização de página
 * - POST /api/tracking.php?action=click - Registrar clique
 * - POST /api/tracking.php?action=session_start - Iniciar sessão
 * - POST /api/tracking.php?action=session_end - Finalizar sessão
 * - POST /api/tracking.php?action=navigation - Registrar navegação
 */

require_once 'config.php';
require_once 'db_config.php';

// Configurar fuso horário para Brasília
date_default_timezone_set('America/Sao_Paulo');

// Função para gerar/obter session_id
function getOrCreateSessionId() {
    // Tentar obter do cookie ou criar novo
    if (isset($_COOKIE['gruporaca_session_id'])) {
        $sessionId = $_COOKIE['gruporaca_session_id'];
    } else {
        $sessionId = bin2hex(random_bytes(32));
        // Cookie válido por 30 dias
        setcookie('gruporaca_session_id', $sessionId, time() + (30 * 24 * 60 * 60), '/', '', false, true);
    }
    return $sessionId;
}

// Função para detectar dispositivo
function detectDevice($userAgent) {
    if (empty($userAgent)) return null;
    
    $userAgent = strtolower($userAgent);
    
    if (strpos($userAgent, 'mobile') !== false || strpos($userAgent, 'android') !== false || strpos($userAgent, 'iphone') !== false) {
        return 'mobile';
    } elseif (strpos($userAgent, 'tablet') !== false || strpos($userAgent, 'ipad') !== false) {
        return 'tablet';
    }
    return 'desktop';
}

// Função para detectar navegador
function detectBrowser($userAgent) {
    if (empty($userAgent)) return null;
    
    $userAgent = strtolower($userAgent);
    
    if (strpos($userAgent, 'chrome') !== false && strpos($userAgent, 'edg') === false) return 'Chrome';
    if (strpos($userAgent, 'firefox') !== false) return 'Firefox';
    if (strpos($userAgent, 'safari') !== false && strpos($userAgent, 'chrome') === false) return 'Safari';
    if (strpos($userAgent, 'edg') !== false) return 'Edge';
    if (strpos($userAgent, 'opera') !== false) return 'Opera';
    
    return 'Unknown';
}

// Função para detectar OS
function detectOS($userAgent) {
    if (empty($userAgent)) return null;
    
    $userAgent = strtolower($userAgent);
    
    if (strpos($userAgent, 'windows') !== false) return 'Windows';
    if (strpos($userAgent, 'mac') !== false) return 'macOS';
    if (strpos($userAgent, 'linux') !== false) return 'Linux';
    if (strpos($userAgent, 'android') !== false) return 'Android';
    if (strpos($userAgent, 'ios') !== false || strpos($userAgent, 'iphone') !== false || strpos($userAgent, 'ipad') !== false) return 'iOS';
    
    return 'Unknown';
}

// Função para obter IP do cliente
function getClientIP() {
    $ipKeys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_X_CLUSTER_CLIENT_IP', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR'];
    
    foreach ($ipKeys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? null;
}

// Função para obter localização por IP (usando API gratuita)
function getLocationByIP($ip) {
    // Ignorar IPs locais/privados
    if (empty($ip) || filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
        error_log("IP inválido ou local para geolocalização: " . $ip);
        return ['country' => null, 'region' => null, 'city' => null];
    }
    
    // Usar ip-api.com (gratuito, até 45 requisições/minuto)
    // Alternativa: ipapi.co (gratuito, 1000 requisições/dia)
    $url = "http://ip-api.com/json/{$ip}?fields=status,country,regionName,city";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 3); // Timeout de 3 segundos
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    
    $response = @curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($curlError) {
        error_log("Erro cURL ao buscar localização: " . $curlError);
    }
    
    if ($httpCode === 200 && $response) {
        $data = json_decode($response, true);
        if ($data && isset($data['status']) && $data['status'] === 'success') {
            $location = [
                'country' => $data['country'] ?? null,
                'region' => $data['regionName'] ?? null, // Estado/Região
                'city' => $data['city'] ?? null
            ];
            error_log("Localização obtida para IP {$ip}: " . json_encode($location));
            return $location;
        } else {
            error_log("API de localização retornou status diferente de success para IP {$ip}: " . json_encode($data));
        }
    } else {
        error_log("Falha ao buscar localização para IP {$ip}. HTTP Code: {$httpCode}");
    }
    
    return ['country' => null, 'region' => null, 'city' => null];
}

// Obter dados da requisição
$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true) ?? [];

if (empty($action)) {
    jsonError('Ação não especificada');
}

$conn = getDBConnection();
$sessionId = getOrCreateSessionId();
$ipAddress = getClientIP();
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
$deviceType = detectDevice($userAgent);
$browser = detectBrowser($userAgent);
$os = detectOS($userAgent);

// Obter localização (apenas uma vez por sessão para evitar muitas requisições)
$location = null;
if ($ipAddress && $action === 'pageview') {
    // Verificar se já temos localização para esta sessão
    $stmt = $conn->prepare("SELECT country, city FROM page_views WHERE session_id = ? AND country IS NOT NULL LIMIT 1");
    $stmt->execute([$sessionId]);
    $existingLocation = $stmt->fetch();
    
    if (!$existingLocation) {
        // Buscar localização apenas se não tivermos ainda
        $location = getLocationByIP($ipAddress);
    } else {
        $location = [
            'country' => $existingLocation['country'],
            'region' => null,
            'city' => $existingLocation['city']
        ];
    }
}

try {
    switch ($action) {
        case 'session_start':
            // Iniciar nova sessão
            $referrer = $data['referrer'] ?? $_SERVER['HTTP_REFERER'] ?? null;
            $firstPage = $data['first_page'] ?? $_SERVER['REQUEST_URI'] ?? '/';
            
            // Verificar se sessão já existe
            $stmt = $conn->prepare("SELECT id FROM user_sessions WHERE id = ?");
            $stmt->execute([$sessionId]);
            
            if (!$stmt->fetch()) {
                // Criar nova sessão
                $stmt = $conn->prepare("
                    INSERT INTO user_sessions 
                    (id, user_id, ip_address, user_agent, device_type, browser, os, first_page, referrer, pages_viewed, total_time, created_at, last_activity)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW(), NOW())
                ");
                
                $userId = isset($_SESSION['user']['id']) ? $_SESSION['user']['id'] : null;
                $stmt->execute([
                    $sessionId,
                    $userId,
                    $ipAddress,
                    $userAgent,
                    $deviceType,
                    $browser,
                    $os,
                    $firstPage,
                    $referrer
                ]);
            }
            
            jsonResponse(['success' => true, 'session_id' => $sessionId]);
            break;
            
        case 'pageview':
            // Registrar visualização de página
            $pagePath = $data['page_path'] ?? $_SERVER['REQUEST_URI'] ?? '/';
            $pageTitle = $data['page_title'] ?? null;
            $referrer = $data['referrer'] ?? $_SERVER['HTTP_REFERER'] ?? null;
            $timeOnPage = $data['time_on_page'] ?? null;
            
            // Se time_on_page está presente, é uma atualização (usuário saiu ou mudou de página)
            // Se time_on_page é null, é uma nova visualização
            if ($timeOnPage !== null) {
                // Atualizar o último pageview desta sessão e página com o tempo
                $stmt = $conn->prepare("
                    UPDATE page_views 
                    SET time_on_page = ?
                    WHERE session_id = ? 
                      AND page_path = ? 
                      AND time_on_page IS NULL
                    ORDER BY created_at DESC
                    LIMIT 1
                ");
                $stmt->execute([$timeOnPage, $sessionId, $pagePath]);
                
                // Atualizar sessão
                $stmt = $conn->prepare("
                    UPDATE user_sessions 
                    SET last_activity = NOW()
                    WHERE id = ?
                ");
                $stmt->execute([$sessionId]);
            } else {
                // Verificar se já existe um pageview recente (últimos 5 segundos) para evitar duplicação
                $stmt = $conn->prepare("
                    SELECT id FROM page_views 
                    WHERE session_id = ? 
                      AND page_path = ? 
                      AND created_at >= DATE_SUB(NOW(), INTERVAL 5 SECOND)
                      AND time_on_page IS NULL
                    LIMIT 1
                ");
                $stmt->execute([$sessionId, $pagePath]);
                
                if (!$stmt->fetch()) {
                    // Inserir novo page view apenas se não houver um recente
                    // Usar localização se disponível
                    $country = $location['country'] ?? null;
                    $city = $location['city'] ?? null;
                    
                    $stmt = $conn->prepare("
                        INSERT INTO page_views 
                        (session_id, page_path, page_title, referrer, ip_address, user_agent, device_type, browser, os, country, city, time_on_page, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                    ");
                    
                    $stmt->execute([
                        $sessionId,
                        $pagePath,
                        $pageTitle,
                        $referrer,
                        $ipAddress,
                        $userAgent,
                        $deviceType,
                        $browser,
                        $os,
                        $country,
                        $city,
                        $timeOnPage
                    ]);
                    
                    // Atualizar sessão
                    $stmt = $conn->prepare("
                        UPDATE user_sessions 
                        SET pages_viewed = pages_viewed + 1,
                            last_activity = NOW()
                        WHERE id = ?
                    ");
                    $stmt->execute([$sessionId]);
                }
            }
            
            jsonResponse(['success' => true]);
            break;
            
        case 'click':
            // Registrar clique
            $elementType = $data['element_type'] ?? 'unknown';
            $elementId = $data['element_id'] ?? null;
            $elementText = $data['element_text'] ?? null;
            $pagePath = $data['page_path'] ?? $_SERVER['REQUEST_URI'] ?? '/';
            $clickX = $data['click_position_x'] ?? null;
            $clickY = $data['click_position_y'] ?? null;
            
            $stmt = $conn->prepare("
                INSERT INTO click_events 
                (session_id, element_type, element_id, element_text, page_path, click_position_x, click_position_y, ip_address, user_agent, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                $sessionId,
                $elementType,
                $elementId,
                $elementText,
                $pagePath,
                $clickX,
                $clickY,
                $ipAddress,
                $userAgent
            ]);
            
            jsonResponse(['success' => true]);
            break;
            
        case 'assessor_click':
            // Registrar clique em assessor (telefone, whatsapp, email, perfil)
            $assessorName = isset($data['assessor_name']) ? trim(strtoupper($data['assessor_name'])) : null;
            $assessorCategory = isset($data['assessor_category']) ? trim($data['assessor_category']) : null;
            $clickType = isset($data['click_type']) ? trim($data['click_type']) : 'profile'; // phone, whatsapp, email, profile
            
            if (!$assessorName) {
                jsonError('Nome do assessor é obrigatório', 400);
            }
            
            // Validar click_type
            $validClickTypes = ['phone', 'whatsapp', 'email', 'profile'];
            if (!in_array($clickType, $validClickTypes)) {
                $clickType = 'profile';
            }
            
            // Buscar ID do assessor no banco pelo nome e categoria
            $assessorId = null;
            try {
                if ($assessorCategory) {
                    // Buscar por nome e categoria
                    $stmt = $conn->prepare("
                        SELECT id FROM assessors 
                        WHERE UPPER(TRIM(name)) = ? AND category = ?
                        LIMIT 1
                    ");
                    $stmt->execute([$assessorName, $assessorCategory]);
                } else {
                    // Buscar apenas por nome (pode haver duplicatas, pegar o primeiro)
                    $stmt = $conn->prepare("
                        SELECT id FROM assessors 
                        WHERE UPPER(TRIM(name)) = ?
                        LIMIT 1
                    ");
                    $stmt->execute([$assessorName]);
                }
                
                $assessor = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($assessor && isset($assessor['id'])) {
                    $assessorId = (int)$assessor['id'];
                }
            } catch (PDOException $e) {
                error_log("Erro ao buscar assessor: " . $e->getMessage());
            }
            
            // Se encontrou o assessor, registrar o clique
            if ($assessorId) {
                try {
                    // Verificar se a tabela assessor_clicks existe
                    $stmt = $conn->prepare("
                        INSERT INTO assessor_clicks 
                        (assessor_id, session_id, click_type, ip_address, user_agent, created_at)
                        VALUES (?, ?, ?, ?, ?, NOW())
                    ");
                    $stmt->execute([
                        $assessorId,
                        $sessionId,
                        $clickType,
                        $ipAddress,
                        $userAgent
                    ]);
                } catch (PDOException $e) {
                    // Tabela pode não existir ainda, apenas logar o erro
                    error_log("Erro ao registrar clique de assessor (tabela pode não existir): " . $e->getMessage());
                }
            } else {
                error_log("Assessor não encontrado: {$assessorName} (categoria: {$assessorCategory})");
            }
            
            jsonResponse(['success' => true, 'assessor_id' => $assessorId]);
            break;
            
        case 'navigation':
            // Registrar navegação entre páginas
            $fromPage = $data['from_page'] ?? null;
            $toPage = $data['to_page'] ?? $_SERVER['REQUEST_URI'] ?? '/';
            $actionType = $data['action_type'] ?? 'click';
            $transitionTime = $data['transition_time'] ?? null;
            
            $stmt = $conn->prepare("
                INSERT INTO navigation_flow 
                (session_id, from_page, to_page, action_type, transition_time, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                $sessionId,
                $fromPage,
                $toPage,
                $actionType,
                $transitionTime
            ]);
            
            jsonResponse(['success' => true]);
            break;
            
        case 'session_end':
            // Finalizar sessão
            $totalTime = $data['total_time'] ?? 0;
            
            $stmt = $conn->prepare("
                UPDATE user_sessions 
                SET total_time = ?,
                    ended_at = NOW(),
                    last_activity = NOW()
                WHERE id = ?
            ");
            
            $stmt->execute([$totalTime, $sessionId]);
            
            jsonResponse(['success' => true]);
            break;
            
        default:
            jsonError('Ação inválida', 400);
    }
} catch (PDOException $e) {
    error_log("Erro no tracking: " . $e->getMessage());
    jsonError('Erro ao processar tracking', 500);
}

