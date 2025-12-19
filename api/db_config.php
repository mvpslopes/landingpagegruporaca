<?php
/**
 * Configuração de Conexão com Banco de Dados MySQL
 * 
 * Detecta automaticamente se está em desenvolvimento local (XAMPP) ou produção (Hostinger)
 */

// Detectar se está rodando localmente (XAMPP)
$isLocal = (
    ($_SERVER['SERVER_NAME'] ?? '') === 'localhost' || 
    ($_SERVER['SERVER_NAME'] ?? '') === '127.0.0.1' ||
    ($_SERVER['HTTP_HOST'] ?? '') === 'localhost' ||
    ($_SERVER['HTTP_HOST'] ?? '') === '127.0.0.1' ||
    strpos($_SERVER['SERVER_NAME'] ?? '', '.local') !== false ||
    file_exists(__DIR__ . '/.local') // Arquivo marcador para forçar modo local
);

if ($isLocal) {
    // Configurações para desenvolvimento local (XAMPP)
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'gruporaca_db'); // Banco local (crie no phpMyAdmin)
    define('DB_USER', 'root'); // Usuário padrão do XAMPP
    define('DB_PASS', ''); // Senha padrão do XAMPP (vazio)
} else {
    // Configurações para produção (Hostinger)
    // Usar as credenciais do novo domínio gruporaca.app.br
    // Funciona também com domínios temporários da Hostinger
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'u179630068_gruporaca_db');
    define('DB_USER', 'u179630068_gruporaca_user');
    define('DB_PASS', 'Gr@up0R@c@2024!#Secure');
}

define('DB_CHARSET', 'utf8mb4');

/**
 * Criar conexão com o banco de dados
 */
function getDBConnection() {
    static $conn = null;
    
    if ($conn === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];
            
            $conn = new PDO($dsn, DB_USER, DB_PASS, $options);
            
            // Configurar fuso horário do MySQL para Brasília
            try {
                $conn->exec("SET time_zone = '-03:00'");
            } catch (PDOException $e) {
                // Se não conseguir configurar timezone, continua sem erro
                error_log("Aviso: Não foi possível configurar timezone do MySQL: " . $e->getMessage());
            }
        } catch (PDOException $e) {
            error_log("Erro de conexão com banco de dados: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao conectar com o banco de dados']);
            exit;
        }
    }
    
    return $conn;
}

/**
 * Testar conexão (útil para debug)
 */
function testConnection() {
    try {
        $conn = getDBConnection();
        return ['success' => true, 'message' => 'Conexão estabelecida com sucesso'];
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}
?>

