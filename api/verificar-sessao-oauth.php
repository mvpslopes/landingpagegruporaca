<?php
/**
 * Verificar sessão e token OAuth
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 Verificar Sessão e Token OAuth</h1>";
echo "<hr>";

// Iniciar sessão
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

echo "<h2>1. Informações da Sessão</h2>";
echo "Session ID: " . session_id() . "<br>";
echo "Status da sessão: " . (session_status() === PHP_SESSION_ACTIVE ? 'Ativa' : 'Inativa') . "<br>";
echo "<br>";

echo "<h2>2. Usuário na Sessão</h2>";
if (isset($_SESSION['user'])) {
    echo "✓ Usuário encontrado na sessão<br>";
    echo "Email: " . htmlspecialchars($_SESSION['user']['email'] ?? 'N/A') . "<br>";
    echo "Role: " . htmlspecialchars($_SESSION['user']['role'] ?? 'N/A') . "<br>";
    echo "ID: " . htmlspecialchars($_SESSION['user']['id'] ?? 'N/A') . "<br>";
} else {
    echo "✗ Nenhum usuário na sessão<br>";
    echo "<p><strong>Você precisa fazer login primeiro!</strong></p>";
    echo "<p><a href='/login'>Fazer Login</a></p>";
    exit;
}
echo "<br>";

echo "<h2>3. Token OAuth na Sessão</h2>";
if (isset($_SESSION['oauth_tokens']['central'])) {
    echo "✓ Token OAuth encontrado!<br>";
    $token = $_SESSION['oauth_tokens']['central'];
    echo "Autorizado por: " . htmlspecialchars($token['authorized_by'] ?? 'N/A') . "<br>";
    echo "Criado em: " . (isset($token['created']) ? date('d/m/Y H:i:s', $token['created']) : 'N/A') . "<br>";
    echo "Access token: " . (isset($token['access_token']) ? 'Presente (' . strlen($token['access_token']) . ' caracteres)' : 'Ausente') . "<br>";
    echo "Refresh token: " . (isset($token['refresh_token']) ? 'Presente' : 'Ausente') . "<br>";
    
    // Verificar se expirou
    if (isset($token['created']) && isset($token['expires_in'])) {
        $expiresAt = $token['created'] + $token['expires_in'];
        $now = time();
        if ($now > $expiresAt) {
            echo "⚠️ Token expirado (expirou em " . date('d/m/Y H:i:s', $expiresAt) . ")<br>";
            echo "Mas pode ser renovado automaticamente com o refresh token.<br>";
        } else {
            echo "✓ Token válido (expira em " . date('d/m/Y H:i:s', $expiresAt) . ")<br>";
        }
    }
} else {
    echo "✗ Token OAuth NÃO encontrado na sessão<br>";
    echo "<br>";
    echo "<h3>📋 Próximos Passos:</h3>";
    echo "<ol>";
    echo "<li>Certifique-se de estar logado como <strong>Root</strong> ou <strong>Admin</strong></li>";
    echo "<li>Clique no link abaixo para autorizar o Google Drive</li>";
    echo "<li>Você será redirecionado para o Google</li>";
    echo "<li>Autorize o acesso</li>";
    echo "<li>Você será redirecionado de volta e o token será salvo</li>";
    echo "</ol>";
    echo "<br>";
    echo "<p><a href='oauth-drive-simple.php' style='display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;'>🔐 Autorizar Google Drive</a></p>";
}
echo "<br>";

echo "<h2>4. Conteúdo Completo da Sessão</h2>";
echo "<details>";
echo "<summary>Clique para expandir</summary>";
echo "<pre>";
print_r($_SESSION);
echo "</pre>";
echo "</details>";
echo "<br>";

echo "<hr>";
echo "<h2>💡 Dicas</h2>";
echo "<ul>";
echo "<li>O token OAuth é salvo na sessão PHP</li>";
echo "<li>Se você fizer logout, o token será perdido</li>";
echo "<li>Se a sessão expirar, você precisará autorizar novamente</li>";
echo "<li>O refresh token permite renovar o access token automaticamente</li>";
echo "</ul>";
?>

