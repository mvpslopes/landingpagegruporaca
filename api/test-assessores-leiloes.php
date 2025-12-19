<?php
/**
 * Arquivo de teste para verificar assessores e leilões
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

header('Content-Type: text/plain; charset=utf-8');

try {
    require_once __DIR__ . '/config.php';
    require_once __DIR__ . '/db_config.php';
    
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    $user = requireAuth();
    
    if (!isset($user['role']) || ($user['role'] !== 'admin' && $user['role'] !== 'root')) {
        echo "Acesso negado. Apenas administradores podem ver estatísticas.\n";
        exit;
    }
    
    $conn = getDBConnection();
    if (!$conn) {
        throw new Exception('Não foi possível conectar ao banco de dados');
    }
    
    echo "=== TESTE DE ASSESSORES E LEILÕES ===\n\n";
    
    // Teste 1: Verificar se a tabela assessors existe
    echo "Teste 1: Verificando tabela assessors...\n";
    try {
        $stmt = $conn->query("SHOW TABLES LIKE 'assessors'");
        if ($stmt->rowCount() > 0) {
            echo "✓ Tabela 'assessors' existe\n";
            
            // Contar assessores
            $countStmt = $conn->query("SELECT COUNT(*) as total FROM assessors");
            $count = $countStmt->fetch(PDO::FETCH_ASSOC);
            echo "  - Total de assessores: " . ($count['total'] ?? 0) . "\n";
            
            // Contar por categoria
            $catStmt = $conn->query("SELECT category, COUNT(*) as total FROM assessors GROUP BY category");
            $categories = $catStmt->fetchAll(PDO::FETCH_ASSOC);
            echo "  - Por categoria:\n";
            foreach ($categories as $cat) {
                echo "    * " . $cat['category'] . ": " . $cat['total'] . "\n";
            }
            
            // Listar alguns assessores
            $listStmt = $conn->query("SELECT name, category FROM assessors LIMIT 5");
            $assessors = $listStmt->fetchAll(PDO::FETCH_ASSOC);
            echo "  - Primeiros 5 assessores:\n";
            foreach ($assessors as $ass) {
                echo "    * " . $ass['name'] . " (" . $ass['category'] . ")\n";
            }
        } else {
            echo "✗ Tabela 'assessors' NÃO existe\n";
        }
    } catch (Exception $e) {
        echo "✗ Erro: " . $e->getMessage() . "\n";
    }
    echo "\n";
    
    // Teste 2: Verificar se a tabela auctions existe
    echo "Teste 2: Verificando tabela auctions...\n";
    try {
        $stmt = $conn->query("SHOW TABLES LIKE 'auctions'");
        if ($stmt->rowCount() > 0) {
            echo "✓ Tabela 'auctions' existe\n";
            
            // Contar leilões
            $countStmt = $conn->query("SELECT COUNT(*) as total FROM auctions");
            $count = $countStmt->fetch(PDO::FETCH_ASSOC);
            echo "  - Total de leilões: " . ($count['total'] ?? 0) . "\n";
            
            // Contar por status
            $statusStmt = $conn->query("SELECT status, COUNT(*) as total FROM auctions GROUP BY status");
            $statuses = $statusStmt->fetchAll(PDO::FETCH_ASSOC);
            echo "  - Por status:\n";
            foreach ($statuses as $stat) {
                echo "    * " . $stat['status'] . ": " . $stat['total'] . "\n";
            }
        } else {
            echo "✗ Tabela 'auctions' NÃO existe\n";
        }
    } catch (Exception $e) {
        echo "✗ Erro: " . $e->getMessage() . "\n";
    }
    echo "\n";
    
    // Teste 3: Testar query de assessors (como statistics.php)
    echo "Teste 3: Testando query de assessors...\n";
    try {
        $stmt = $conn->prepare("
            SELECT category, COUNT(*) as total, COUNT(CASE WHEN active = 1 THEN 1 END) as active_count
            FROM assessors
            GROUP BY category
        ");
        $stmt->execute();
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "✓ Query executada com sucesso\n";
        echo "  - Resultados:\n";
        foreach ($categories as $cat) {
            echo "    * " . $cat['category'] . ": " . $cat['total'] . " total, " . $cat['active_count'] . " ativos\n";
        }
    } catch (Exception $e) {
        echo "✗ Erro: " . $e->getMessage() . "\n";
    }
    echo "\n";
    
    // Teste 4: Testar query de auctions (como statistics.php)
    echo "Teste 4: Testando query de auctions...\n";
    try {
        $stmt = $conn->prepare("
            SELECT status, COUNT(*) as total
            FROM auctions
            GROUP BY status
        ");
        $stmt->execute();
        $auctionsByStatus = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "✓ Query executada com sucesso\n";
        echo "  - Resultados:\n";
        if (count($auctionsByStatus) > 0) {
            foreach ($auctionsByStatus as $stat) {
                echo "    * " . $stat['status'] . ": " . $stat['total'] . "\n";
            }
        } else {
            echo "    * Nenhum leilão cadastrado ainda\n";
        }
    } catch (Exception $e) {
        echo "✗ Erro: " . $e->getMessage() . "\n";
    }
    echo "\n";
    
    echo "=== Todos os testes concluídos ===\n";
    
} catch (Exception $e) {
    echo "\n✗ ERRO CRÍTICO: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

