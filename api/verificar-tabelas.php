<?php
/**
 * Verificar se todas as tabelas existem
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'db_config.php';

header('Content-Type: text/html; charset=utf-8');

echo "<h2>Verificação de Tabelas no Banco Local</h2>";

try {
    $conn = getDBConnection();
    
    // Listar todas as tabelas
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "<h3>Tabelas encontradas:</h3>";
    echo "<ul>";
    foreach ($tables as $table) {
        echo "<li>✅ $table</li>";
    }
    echo "</ul>";
    
    // Verificar tabelas necessárias
    $requiredTables = ['users', 'sessions', 'files', 'audit_log'];
    
    echo "<h3>Verificação de Tabelas Necessárias:</h3>";
    echo "<ul>";
    foreach ($requiredTables as $table) {
        if (in_array($table, $tables)) {
            echo "<li>✅ <strong>$table</strong> - Existe</li>";
        } else {
            echo "<li>❌ <strong>$table</strong> - <span style='color:red;'>NÃO EXISTE!</span></li>";
        }
    }
    echo "</ul>";
    
    // Se audit_log não existe, mostrar SQL para criar
    if (!in_array('audit_log', $tables)) {
        echo "<h3 style='color:red;'>⚠️ A tabela audit_log não existe!</h3>";
        echo "<p>Execute este SQL no phpMyAdmin:</p>";
        echo "<pre style='background:#f0f0f0;padding:10px;border:1px solid #ccc;'>";
        echo "USE `gruporaca_db`;\n\n";
        echo "CREATE TABLE IF NOT EXISTS `audit_log` (\n";
        echo "  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,\n";
        echo "  `user_id` INT(11) UNSIGNED NOT NULL,\n";
        echo "  `action` VARCHAR(100) NOT NULL,\n";
        echo "  `resource_type` VARCHAR(50) DEFAULT NULL,\n";
        echo "  `resource_id` INT(11) UNSIGNED DEFAULT NULL,\n";
        echo "  `details` JSON DEFAULT NULL,\n";
        echo "  `ip_address` VARCHAR(45) DEFAULT NULL,\n";
        echo "  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,\n";
        echo "  PRIMARY KEY (`id`),\n";
        echo "  INDEX `idx_user_id` (`user_id`),\n";
        echo "  INDEX `idx_action` (`action`),\n";
        echo "  INDEX `idx_created_at` (`created_at`)\n";
        echo ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
        echo "</pre>";
    }
    
} catch (Exception $e) {
    echo "<p style='color:red;'>❌ Erro: " . $e->getMessage() . "</p>";
}
?>

