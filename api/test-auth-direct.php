<?php
/**
 * Teste direto do auth.php (simula requisição do frontend)
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// Simular requisição POST
$_SERVER['REQUEST_METHOD'] = 'POST';
$_GET['action'] = 'login';

// Simular dados JSON
$jsonData = json_encode([
    'email' => 'marcus@gruporaca.com.br',
    'password' => 'Gr@up0R@c@2024!M@rcus#Secure'
]);

// Capturar output
ob_start();

// Simular php://input
file_put_contents('php://temp', $jsonData);
$_POST = json_decode($jsonData, true);

// Incluir auth.php
try {
    // Redirecionar stdin temporariamente
    $originalInput = file_get_contents('php://input');
    
    require_once 'auth.php';
    
    $output = ob_get_clean();
    echo "<h2>Teste Direto do auth.php</h2>";
    echo "<pre>" . htmlspecialchars($output) . "</pre>";
    
} catch (Exception $e) {
    ob_end_clean();
    echo "<h2>❌ Erro ao executar auth.php:</h2>";
    echo "<p style='color:red;'>" . $e->getMessage() . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}
