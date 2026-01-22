<?php
/**
 * Script de Validação da Tabela de Leilões
 * Verifica se a estrutura da tabela está correta
 */

require_once 'config.php';
require_once 'db_config.php';

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Validação da Tabela de Leilões</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; }
        .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #28a745; }
        .error { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #dc3545; }
        .warning { background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #ffc107; }
        .info { background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #17a2b8; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #333; color: white; font-weight: bold; }
        tr:hover { background: #f5f5f5; }
        .col-exists { color: #28a745; font-weight: bold; }
        .col-missing { color: #dc3545; font-weight: bold; }
        .sql-box { background: #f8f9fa; padding: 15px; border-radius: 5px; border: 1px solid #dee2e6; margin: 10px 0; font-family: monospace; white-space: pre-wrap; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
    </style>
</head>
<body>
<div class='container'>";

echo "<h1>🔍 Validação da Tabela de Leilões</h1>";

try {
    $conn = getDBConnection();
    
    // 1. Verificar se a tabela existe
    echo "<h2>1. Verificação da Existência da Tabela</h2>";
    $stmt = $conn->query("SHOW TABLES LIKE 'auctions'");
    $tableExists = $stmt->rowCount() > 0;
    
    if ($tableExists) {
        echo "<div class='success'>✅ A tabela 'auctions' existe no banco de dados.</div>";
    } else {
        echo "<div class='error'>❌ A tabela 'auctions' NÃO existe no banco de dados.</div>";
        echo "<div class='info'>Execute o script: <code>criar-tabela-leiloes.sql</code></div>";
        echo "</div></body></html>";
        exit;
    }
    
    // 2. Listar todas as colunas da tabela
    echo "<h2>2. Estrutura Atual da Tabela</h2>";
    $stmt = $conn->query("DESCRIBE auctions");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table>";
    echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Chave</th><th>Padrão</th><th>Extra</th></tr>";
    foreach ($columns as $col) {
        echo "<tr>";
        echo "<td><strong>{$col['Field']}</strong></td>";
        echo "<td>{$col['Type']}</td>";
        echo "<td>{$col['Null']}</td>";
        echo "<td>{$col['Key']}</td>";
        echo "<td>" . ($col['Default'] ?? 'NULL') . "</td>";
        echo "<td>{$col['Extra']}</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    // 3. Verificar colunas obrigatórias
    echo "<h2>3. Validação de Colunas Obrigatórias</h2>";
    
    $requiredColumns = [
        'id' => ['type' => 'INT', 'key' => 'PRI'],
        'title' => ['type' => 'VARCHAR', 'null' => 'NO'],
        'breed' => ['type' => 'VARCHAR', 'null' => 'NO'],
        'start_date' => ['type' => 'DATE', 'null' => 'NO'],
        'end_date' => ['type' => 'DATE', 'null' => 'NO'],
        'image_path' => ['type' => 'VARCHAR', 'null' => 'YES'],
        'image_drive_id' => ['type' => 'VARCHAR', 'null' => 'YES'],
        'active' => ['type' => 'TINYINT', 'null' => 'NO'],
        'created_at' => ['type' => 'TIMESTAMP', 'null' => 'NO'],
        'updated_at' => ['type' => 'TIMESTAMP', 'null' => 'NO'],
        'created_by' => ['type' => 'INT', 'null' => 'YES'],
    ];
    
    $existingColumns = [];
    foreach ($columns as $col) {
        $existingColumns[strtolower($col['Field'])] = $col;
    }
    
    $missingColumns = [];
    $wrongTypeColumns = [];
    
    foreach ($requiredColumns as $colName => $requirements) {
        $colLower = strtolower($colName);
        if (!isset($existingColumns[$colLower])) {
            $missingColumns[] = $colName;
            echo "<div class='error'>❌ Coluna '<strong>{$colName}</strong>' NÃO encontrada na tabela.</div>";
        } else {
            $col = $existingColumns[$colLower];
            $typeMatch = stripos($col['Type'], $requirements['type']) !== false;
            $nullMatch = !isset($requirements['null']) || $col['Null'] === $requirements['null'];
            
            if (!$typeMatch || !$nullMatch) {
                $wrongTypeColumns[] = $colName;
                echo "<div class='warning'>⚠️ Coluna '<strong>{$colName}</strong>' existe mas pode ter tipo/null incorreto.</div>";
                echo "<div class='info'>Esperado: {$requirements['type']}, Null: " . ($requirements['null'] ?? 'YES') . " | Encontrado: {$col['Type']}, Null: {$col['Null']}</div>";
            } else {
                echo "<div class='success'>✅ Coluna '<strong>{$colName}</strong>' existe e está correta.</div>";
            }
        }
    }
    
    // 4. Verificar índices
    echo "<h2>4. Verificação de Índices</h2>";
    $stmt = $conn->query("SHOW INDEXES FROM auctions");
    $indexes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $requiredIndexes = ['idx_start_date', 'idx_end_date', 'idx_active', 'idx_breed'];
    $existingIndexes = [];
    foreach ($indexes as $idx) {
        if ($idx['Key_name'] !== 'PRIMARY') {
            $existingIndexes[] = $idx['Key_name'];
        }
    }
    
    foreach ($requiredIndexes as $idxName) {
        if (in_array($idxName, $existingIndexes)) {
            echo "<div class='success'>✅ Índice '<strong>{$idxName}</strong>' existe.</div>";
        } else {
            echo "<div class='warning'>⚠️ Índice '<strong>{$idxName}</strong>' não encontrado.</div>";
        }
    }
    
    // 5. Gerar script de correção
    echo "<h2>5. Script de Correção</h2>";
    
    if (empty($missingColumns) && empty($wrongTypeColumns)) {
        echo "<div class='success'>✅ A tabela está correta! Todas as colunas necessárias existem.</div>";
    } else {
        echo "<div class='error'>❌ Problemas encontrados. Use o script abaixo para corrigir:</div>";
        
        $sqlFix = "-- Script de Correção Gerado Automaticamente\n";
        $sqlFix .= "-- Data: " . date('Y-m-d H:i:s') . "\n\n";
        
        foreach ($missingColumns as $colName) {
            $requirements = $requiredColumns[$colName];
            $sqlFix .= "-- Adicionar coluna: {$colName}\n";
            
            if ($colName === 'breed') {
                $sqlFix .= "ALTER TABLE `auctions` \n";
                $sqlFix .= "ADD COLUMN `breed` VARCHAR(100) NOT NULL DEFAULT 'Mangalarga Marchador' COMMENT 'Raça do Cavalo' \n";
                $sqlFix .= "AFTER `title`;\n\n";
            } elseif ($colName === 'id') {
                // ID geralmente já existe, mas se não existir, precisa recriar a tabela
                $sqlFix .= "-- ATENÇÃO: A coluna 'id' não existe. Considere recriar a tabela.\n\n";
            } else {
                $sqlFix .= "ALTER TABLE `auctions` \n";
                $sqlFix .= "ADD COLUMN `{$colName}` ... ;\n\n";
            }
        }
        
        // Adicionar índices faltantes
        foreach ($requiredIndexes as $idxName) {
            if (!in_array($idxName, $existingIndexes)) {
                $colName = str_replace('idx_', '', $idxName);
                $sqlFix .= "-- Adicionar índice: {$idxName}\n";
                $sqlFix .= "CREATE INDEX `{$idxName}` ON `auctions` (`{$colName}`);\n\n";
            }
        }
        
        echo "<div class='sql-box'>{$sqlFix}</div>";
        
        // Script específico para breed se estiver faltando
        if (in_array('breed', $missingColumns)) {
            echo "<div class='info'><strong>Script específico para adicionar a coluna 'breed':</strong></div>";
            echo "<div class='sql-box'>ALTER TABLE `auctions` 
ADD COLUMN `breed` VARCHAR(100) NOT NULL DEFAULT 'Mangalarga Marchador' COMMENT 'Raça do Cavalo (ex: Mangalarga Marchador, Campolina Marchador)' 
AFTER `title`;

CREATE INDEX `idx_breed` ON `auctions` (`breed`);</div>";
        }
    }
    
    // 6. Testar query
    echo "<h2>6. Teste de Query</h2>";
    try {
        $stmt = $conn->query("SELECT id, title, breed, start_date, end_date FROM auctions LIMIT 1");
        echo "<div class='success'>✅ Query de teste executada com sucesso!</div>";
    } catch (PDOException $e) {
        echo "<div class='error'>❌ Erro ao executar query de teste:</div>";
        echo "<div class='error'>{$e->getMessage()}</div>";
    }
    
    // 7. Contar registros
    echo "<h2>7. Estatísticas</h2>";
    try {
        $stmt = $conn->query("SELECT COUNT(*) as total FROM auctions");
        $count = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "<div class='info'>Total de leilões cadastrados: <strong>{$count['total']}</strong></div>";
    } catch (PDOException $e) {
        echo "<div class='error'>Erro ao contar registros: {$e->getMessage()}</div>";
    }
    
} catch (PDOException $e) {
    echo "<div class='error'>❌ Erro ao conectar ao banco de dados:</div>";
    echo "<div class='error'>{$e->getMessage()}</div>";
} catch (Exception $e) {
    echo "<div class='error'>❌ Erro: {$e->getMessage()}</div>";
}

echo "</div></body></html>";
?>
