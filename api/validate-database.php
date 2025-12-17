<?php
/**
 * Script de Validação do Banco de Dados
 * Valida estrutura, tabelas, campos, índices e dados iniciais
 * 
 * ⚠️ IMPORTANTE: Delete este arquivo após validar por segurança!
 */

require_once 'db_config.php';

header('Content-Type: application/json; charset=utf-8');

$results = [
    'success' => true,
    'errors' => [],
    'warnings' => [],
    'checks' => []
];

try {
    $conn = getDBConnection();
    
    // ============================================
    // 1. Verificar se as tabelas existem
    // ============================================
    $requiredTables = ['users', 'files', 'sessions', 'audit_log'];
    $existingTables = [];
    
    $stmt = $conn->query("SHOW TABLES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $existingTables[] = $row[0];
    }
    
    foreach ($requiredTables as $table) {
        if (in_array($table, $existingTables)) {
            $results['checks'][] = "✅ Tabela '{$table}' existe";
        } else {
            $results['errors'][] = "❌ Tabela '{$table}' NÃO existe";
            $results['success'] = false;
        }
    }
    
    // ============================================
    // 2. Validar estrutura da tabela 'users'
    // ============================================
    if (in_array('users', $existingTables)) {
        $stmt = $conn->query("DESCRIBE users");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $columnNames = array_column($columns, 'Field');
        
        $requiredColumns = [
            'id', 'email', 'password', 'name', 'role', 'folder', 
            'permissions', 'created_at', 'created_by', 'last_login', 'active'
        ];
        
        foreach ($requiredColumns as $col) {
            if (in_array($col, $columnNames)) {
                $results['checks'][] = "✅ Campo 'users.{$col}' existe";
            } else {
                $results['errors'][] = "❌ Campo 'users.{$col}' NÃO existe";
                $results['success'] = false;
            }
        }
        
        // Verificar se 'email' é UNIQUE
        $stmt = $conn->query("SHOW INDEX FROM users WHERE Column_name = 'email' AND Non_unique = 0");
        if ($stmt->rowCount() > 0) {
            $results['checks'][] = "✅ Campo 'users.email' é UNIQUE";
        } else {
            $results['warnings'][] = "⚠️ Campo 'users.email' não tem índice UNIQUE";
        }
    }
    
    // ============================================
    // 3. Validar estrutura da tabela 'files'
    // ============================================
    if (in_array('files', $existingTables)) {
        $stmt = $conn->query("DESCRIBE files");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $columnNames = array_column($columns, 'Field');
        
        $requiredColumns = [
            'id', 'drive_file_id', 'name', 'folder', 'size', 'mime_type',
            'drive_url', 'thumbnail_url', 'uploaded_by', 'uploaded_by_name',
            'uploaded_at', 'description', 'animal_name', 'animal_id',
            'tags', 'metadata', 'active', 'deleted_at'
        ];
        
        foreach ($requiredColumns as $col) {
            if (in_array($col, $columnNames)) {
                $results['checks'][] = "✅ Campo 'files.{$col}' existe";
            } else {
                $results['warnings'][] = "⚠️ Campo 'files.{$col}' NÃO existe (pode ser da versão 1)";
            }
        }
        
        // Verificar se 'drive_file_id' permite NULL (versão 2)
        $stmt = $conn->query("DESCRIBE files WHERE Field = 'drive_file_id'");
        $col = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($col && $col['Null'] === 'YES') {
            $results['checks'][] = "✅ Campo 'files.drive_file_id' permite NULL (Versão 2)";
        } else {
            $results['warnings'][] = "⚠️ Campo 'files.drive_file_id' é NOT NULL (Versão 1)";
        }
    }
    
    // ============================================
    // 4. Validar estrutura da tabela 'sessions'
    // ============================================
    if (in_array('sessions', $existingTables)) {
        $stmt = $conn->query("DESCRIBE sessions");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $columnNames = array_column($columns, 'Field');
        
        $requiredColumns = ['id', 'user_id', 'ip_address', 'user_agent', 'created_at', 'last_activity', 'expires_at'];
        
        foreach ($requiredColumns as $col) {
            if (in_array($col, $columnNames)) {
                $results['checks'][] = "✅ Campo 'sessions.{$col}' existe";
            } else {
                $results['warnings'][] = "⚠️ Campo 'sessions.{$col}' NÃO existe";
            }
        }
    }
    
    // ============================================
    // 5. Validar estrutura da tabela 'audit_log'
    // ============================================
    if (in_array('audit_log', $existingTables)) {
        $stmt = $conn->query("DESCRIBE audit_log");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $columnNames = array_column($columns, 'Field');
        
        $requiredColumns = ['id', 'user_id', 'action', 'resource_type', 'resource_id', 'details', 'ip_address', 'created_at'];
        
        foreach ($requiredColumns as $col) {
            if (in_array($col, $columnNames)) {
                $results['checks'][] = "✅ Campo 'audit_log.{$col}' existe";
            } else {
                $results['warnings'][] = "⚠️ Campo 'audit_log.{$col}' NÃO existe";
            }
        }
    }
    
    // ============================================
    // 6. Verificar usuários iniciais
    // ============================================
    if (in_array('users', $existingTables)) {
        $requiredUsers = [
            'marcus@gruporaca.com.br' => 'Marcus Lopes',
            'thaty@gruporaca.com.br' => 'Thaty',
            'lara@gruporaca.com.br' => 'Lara',
            'ana@gruporaca.com.br' => 'Ana Beatriz',
            'larissa@gruporaca.com.br' => 'Larissa Mendes',
            'ariane@gruporaca.com.br' => 'Ariane Andrade'
        ];
        
        $stmt = $conn->prepare("SELECT email, name, role FROM users WHERE email = ?");
        foreach ($requiredUsers as $email => $name) {
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user) {
                $results['checks'][] = "✅ Usuário '{$name}' ({$email}) existe";
                
                // Verificar role
                if ($email === 'marcus@gruporaca.com.br' && $user['role'] === 'root') {
                    $results['checks'][] = "✅ Usuário ROOT configurado corretamente";
                } elseif ($user['role'] === 'admin') {
                    $results['checks'][] = "✅ Usuário ADMIN '{$name}' configurado corretamente";
                }
            } else {
                $results['errors'][] = "❌ Usuário '{$name}' ({$email}) NÃO existe";
                $results['success'] = false;
            }
        }
        
        // Contar total de usuários
        $stmt = $conn->query("SELECT COUNT(*) as total FROM users WHERE active = 1");
        $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        $results['checks'][] = "📊 Total de usuários ativos: {$total}";
    }
    
    // ============================================
    // 7. Verificar Foreign Keys
    // ============================================
    $stmt = $conn->query("
        SELECT 
            TABLE_NAME,
            CONSTRAINT_NAME,
            REFERENCED_TABLE_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
        AND REFERENCED_TABLE_NAME IS NOT NULL
    ");
    $fks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($fks) > 0) {
        $results['checks'][] = "✅ Foreign Keys configuradas: " . count($fks);
        foreach ($fks as $fk) {
            $results['checks'][] = "   → {$fk['TABLE_NAME']}.{$fk['CONSTRAINT_NAME']} → {$fk['REFERENCED_TABLE_NAME']}";
        }
    } else {
        $results['warnings'][] = "⚠️ Nenhuma Foreign Key encontrada";
    }
    
    // ============================================
    // 8. Verificar Índices
    // ============================================
    $importantIndexes = [
        'users' => ['idx_email', 'idx_role', 'idx_active'],
        'files' => ['idx_folder', 'idx_uploaded_by', 'idx_active'],
        'audit_log' => ['idx_user_id', 'idx_action', 'idx_created_at']
    ];
    
    foreach ($importantIndexes as $table => $indexes) {
        if (in_array($table, $existingTables)) {
            $stmt = $conn->query("SHOW INDEX FROM {$table}");
            $existingIndexes = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $existingIndexes[] = $row['Key_name'];
            }
            
            foreach ($indexes as $idx) {
                if (in_array($idx, $existingIndexes)) {
                    $results['checks'][] = "✅ Índice '{$table}.{$idx}' existe";
                } else {
                    $results['warnings'][] = "⚠️ Índice '{$table}.{$idx}' NÃO existe";
                }
            }
        }
    }
    
    // ============================================
    // 9. Verificar Charset
    // ============================================
    $stmt = $conn->query("SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME 
                          FROM information_schema.SCHEMATA 
                          WHERE SCHEMA_NAME = DATABASE()");
    $charset = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($charset['DEFAULT_CHARACTER_SET_NAME'] === 'utf8mb4') {
        $results['checks'][] = "✅ Charset do banco: utf8mb4";
    } else {
        $results['warnings'][] = "⚠️ Charset do banco: {$charset['DEFAULT_CHARACTER_SET_NAME']} (recomendado: utf8mb4)";
    }
    
    // ============================================
    // 10. Resumo Final
    // ============================================
    $results['summary'] = [
        'total_checks' => count($results['checks']),
        'total_errors' => count($results['errors']),
        'total_warnings' => count($results['warnings']),
        'tables_found' => count($existingTables),
        'tables_required' => count($requiredTables)
    ];
    
} catch (PDOException $e) {
    $results['success'] = false;
    $results['errors'][] = "❌ Erro ao conectar/validar: " . $e->getMessage();
}

// Formatar saída
echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
?>

