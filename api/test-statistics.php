<?php
/**
 * Arquivo de teste para diagnosticar erro 500 em statistics.php
 */

// Habilitar exibição de erros
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Usar text/plain para melhor visualização no navegador
header('Content-Type: text/plain; charset=utf-8');

try {
    // Teste 1: Verificar se os arquivos existem
    echo "Teste 1: Verificando arquivos...\n";
    $configFile = __DIR__ . '/config.php';
    $dbConfigFile = __DIR__ . '/db_config.php';
    $permissionsFile = __DIR__ . '/permissions_db.php';
    
    if (!file_exists($configFile)) {
        throw new Exception('config.php não encontrado');
    }
    if (!file_exists($dbConfigFile)) {
        throw new Exception('db_config.php não encontrado');
    }
    if (!file_exists($permissionsFile)) {
        throw new Exception('permissions_db.php não encontrado');
    }
    echo "✓ Arquivos encontrados\n\n";
    
    // Teste 2: Carregar arquivos
    echo "Teste 2: Carregando arquivos...\n";
    require_once $configFile;
    require_once $dbConfigFile;
    require_once $permissionsFile;
    echo "✓ Arquivos carregados\n\n";
    
    // Teste 3: Verificar sessão
    echo "Teste 3: Verificando sessão...\n";
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    echo "✓ Sessão iniciada\n";
    echo "  - Session ID: " . session_id() . "\n";
    echo "  - User na sessão: " . (isset($_SESSION['user']) ? 'SIM' : 'NÃO') . "\n\n";
    
    // Teste 4: Verificar autenticação
    echo "Teste 4: Verificando autenticação...\n";
    try {
        $user = requireAuth();
        if ($user && is_array($user)) {
            echo "✓ Usuário autenticado\n";
            echo "  - Email: " . ($user['email'] ?? 'N/A') . "\n";
            echo "  - Role: " . ($user['role'] ?? 'N/A') . "\n";
        } else {
            echo "✗ Usuário não autenticado\n";
        }
    } catch (Exception $e) {
        echo "✗ Erro na autenticação: " . $e->getMessage() . "\n";
    }
    echo "\n";
    
    // Teste 5: Verificar conexão com banco
    echo "Teste 5: Verificando conexão com banco...\n";
    try {
        $conn = getDBConnection();
        if ($conn) {
            echo "✓ Conexão estabelecida\n";
            
            // Teste 6: Verificar se as tabelas existem
            echo "\nTeste 6: Verificando tabelas...\n";
            $tables = ['page_views', 'click_events', 'user_sessions'];
            foreach ($tables as $table) {
                $stmt = $conn->query("SHOW TABLES LIKE '$table'");
                if ($stmt->rowCount() > 0) {
                    echo "✓ Tabela '$table' existe\n";
                    
                    // Contar registros
                    $countStmt = $conn->query("SELECT COUNT(*) as total FROM $table");
                    $count = $countStmt->fetch(PDO::FETCH_ASSOC);
                    echo "  - Registros: " . ($count['total'] ?? 0) . "\n";
                } else {
                    echo "✗ Tabela '$table' NÃO existe\n";
                }
            }
        } else {
            echo "✗ Não foi possível conectar ao banco\n";
        }
    } catch (Exception $e) {
        echo "✗ Erro na conexão: " . $e->getMessage() . "\n";
    }
    echo "\n";
    
    // Teste 7: Testar query simples
    echo "Teste 7: Testando query simples...\n";
    try {
        if (isset($conn) && $conn) {
            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM page_views");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            echo "✓ Query executada com sucesso\n";
            echo "  - Total de pageviews: " . (isset($result['total']) ? $result['total'] : 0) . "\n";
        } else {
            echo "✗ Conexão não disponível para teste\n";
        }
    } catch (Exception $e) {
        echo "✗ Erro na query: " . $e->getMessage() . "\n";
        echo "  - Detalhes: " . $e->getTraceAsString() . "\n";
    }
    
    // Teste 8: Testar query do statistics.php (overview)
    echo "\nTeste 8: Testando query de overview (como statistics.php)...\n";
    try {
        if (isset($conn) && $conn) {
            $dateFormat = 'Y-m-d H:i:s';
            $now = new DateTime('now', new DateTimeZone('America/Sao_Paulo'));
            $startDate = clone $now;
            $startDate->modify('-7 days');
            $startDateStr = $startDate->format($dateFormat);
            $endDateStr = $now->format($dateFormat);
            
            $stmt = $conn->prepare("
                SELECT COUNT(DISTINCT session_id) as total_visits,
                       COUNT(*) as total_pageviews
                FROM page_views
                WHERE created_at >= ? AND created_at <= ?
            ");
            $stmt->execute([$startDateStr, $endDateStr]);
            $visits = $stmt->fetch(PDO::FETCH_ASSOC);
            echo "✓ Query overview executada com sucesso\n";
            echo "  - Total de visitas: " . (isset($visits['total_visits']) ? $visits['total_visits'] : 0) . "\n";
            echo "  - Total de pageviews: " . (isset($visits['total_pageviews']) ? $visits['total_pageviews'] : 0) . "\n";
        } else {
            echo "✗ Conexão não disponível para teste\n";
        }
    } catch (Exception $e) {
        echo "✗ Erro na query overview: " . $e->getMessage() . "\n";
        echo "  - Detalhes: " . $e->getTraceAsString() . "\n";
    }
    
    echo "\n=== Todos os testes concluídos ===\n";
    
} catch (Exception $e) {
    echo "\n✗ ERRO CRÍTICO: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

