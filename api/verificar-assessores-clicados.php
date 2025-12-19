<?php
/**
 * Script para verificar se os dados de "Assessores Mais Clicados" estão corretos
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

header('Content-Type: text/plain; charset=utf-8');

// Conectar diretamente ao banco (sem usar config.php)
require_once __DIR__ . '/db_config.php';

echo "=== VERIFICAÇÃO DE ASSESSORES MAIS CLICADOS ===\n\n";

try {
    $conn = getDBConnection();
    if (!$conn) {
        throw new Exception('Não foi possível conectar ao banco de dados');
    }
    
    // 1. Verificar se a tabela assessor_clicks existe e tem dados
    echo "1. Verificando tabela assessor_clicks...\n";
    try {
        $stmt = $conn->query("SELECT COUNT(*) as total FROM assessor_clicks");
        $count = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "   ✓ Total de cliques registrados: " . ($count['total'] ?? 0) . "\n\n";
        
        if (($count['total'] ?? 0) > 0) {
            // Mostrar últimos 10 cliques
            $stmt = $conn->query("
                SELECT ac.*, a.name, a.category 
                FROM assessor_clicks ac
                LEFT JOIN assessors a ON ac.assessor_id = a.id
                ORDER BY ac.created_at DESC
                LIMIT 10
            ");
            $clicks = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo "   Últimos 10 cliques registrados:\n";
            foreach ($clicks as $click) {
                echo "   - {$click['name']} ({$click['category']}) - {$click['click_type']} - " . date('d/m/Y H:i:s', strtotime($click['created_at'])) . "\n";
            }
            echo "\n";
        }
    } catch (PDOException $e) {
        echo "   ✗ Erro: " . $e->getMessage() . "\n\n";
    }
    
    // 2. Verificar se os assessores mencionados existem no banco
    echo "2. Verificando assessores mencionados na lista...\n";
    $assessorsToCheck = ['RAFAEL R.A', 'FELIPE SÁ', 'GREKO', 'KAUAN', 'DAVID CHARLES'];
    foreach ($assessorsToCheck as $name) {
        $stmt = $conn->prepare("SELECT id, name, category, active FROM assessors WHERE UPPER(TRIM(name)) = ?");
        $stmt->execute([strtoupper(trim($name))]);
        $assessor = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($assessor) {
            // Contar cliques deste assessor
            $stmt2 = $conn->prepare("SELECT COUNT(*) as total FROM assessor_clicks WHERE assessor_id = ?");
            $stmt2->execute([$assessor['id']]);
            $clicks = $stmt2->fetch(PDO::FETCH_ASSOC);
            
            echo "   ✓ {$assessor['name']} (ID: {$assessor['id']}, Categoria: {$assessor['category']}, Ativo: " . ($assessor['active'] ? 'Sim' : 'Não') . ")\n";
            echo "     Cliques registrados: " . ($clicks['total'] ?? 0) . "\n";
        } else {
            echo "   ✗ {$name} NÃO encontrado no banco!\n";
        }
    }
    echo "\n";
    
    // 3. Executar a mesma query que o statistics.php usa
    echo "3. Executando query do statistics.php...\n";
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
        
        echo "   Top 10 assessores (ordenados por total_clicks):\n";
        foreach ($topAssessors as $index => $assessor) {
            $position = $index + 1;
            echo "   {$position}. {$assessor['name']} ({$assessor['category']}) - {$assessor['total_clicks']} cliques\n";
            echo "      - Telefone: {$assessor['phone_clicks']}, WhatsApp: {$assessor['whatsapp_clicks']}, Email: {$assessor['email_clicks']}\n";
        }
    } catch (PDOException $e) {
        echo "   ✗ Erro na query: " . $e->getMessage() . "\n";
    }
    echo "\n";
    
    // 4. Verificar se há assessores com cliques mas que não aparecem no top
    echo "4. Verificando assessores com cliques...\n";
    try {
        $stmt = $conn->query("
            SELECT 
                a.id,
                a.name,
                a.category,
                COUNT(ac.id) as total_clicks
            FROM assessors a
            INNER JOIN assessor_clicks ac ON a.id = ac.assessor_id
            WHERE a.active = 1
            GROUP BY a.id, a.name, a.category
            ORDER BY total_clicks DESC
        ");
        $assessorsWithClicks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($assessorsWithClicks) > 0) {
            echo "   Assessores com cliques registrados:\n";
            foreach ($assessorsWithClicks as $assessor) {
                echo "   - {$assessor['name']} ({$assessor['category']}): {$assessor['total_clicks']} cliques\n";
            }
        } else {
            echo "   ⚠ Nenhum assessor com cliques registrados!\n";
            echo "   Isso significa que:\n";
            echo "   - Ou não houve cliques ainda\n";
            echo "   - Ou o tracking não está funcionando\n";
            echo "   - Ou os nomes não estão sendo encontrados no banco\n";
        }
    } catch (PDOException $e) {
        echo "   ✗ Erro: " . $e->getMessage() . "\n";
    }
    echo "\n";
    
    // 5. Verificar possíveis problemas de matching de nomes
    echo "5. Verificando possíveis problemas de matching...\n";
    echo "   Testando busca por nome (como o tracking faz):\n";
    $testNames = ['RAFAEL R.A', 'FELIPE SÁ', 'GREKO', 'KAUAN', 'DAVID CHARLES'];
    foreach ($testNames as $testName) {
        $nameUpper = strtoupper(trim($testName));
        $stmt = $conn->prepare("SELECT id, name, category FROM assessors WHERE UPPER(TRIM(name)) = ?");
        $stmt->execute([$nameUpper]);
        $found = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($found) {
            echo "   ✓ '{$testName}' → Encontrado: ID {$found['id']}, Categoria: {$found['category']}\n";
        } else {
            echo "   ✗ '{$testName}' → NÃO encontrado!\n";
        }
    }
    
    echo "\n=== VERIFICAÇÃO CONCLUÍDA ===\n";
    
} catch (Exception $e) {
    echo "\n✗ ERRO: " . $e->getMessage() . "\n";
    if (isset($e->getTrace()[0])) {
        echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    }
}
