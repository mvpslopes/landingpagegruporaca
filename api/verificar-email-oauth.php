<?php
/**
 * Verificar qual email REAL autorizou o OAuth
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 Verificar Email Real do OAuth</h1>";
echo "<hr>";

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

echo "<h2>1. Informações da Sessão</h2>";
if (isset($_SESSION['oauth_tokens']['central'])) {
    $token = $_SESSION['oauth_tokens']['central'];
    echo "✓ Token OAuth encontrado<br>";
    echo "Autorizado por (sistema): " . htmlspecialchars($token['authorized_by'] ?? 'N/A') . "<br>";
    echo "<br>";
    
    // Tentar obter informações do token do Google
    echo "<h2>2. Verificar Email Real do Google</h2>";
    try {
        require_once __DIR__ . '/config.php';
        require_once __DIR__ . '/drive_service.php';
        
        $driveService = new DriveService($token);
        $client = $driveService->getService()->getClient();
        
        // Obter informações do usuário autenticado
        $oauth2 = new \Google\Service\Oauth2($client);
        $userInfo = $oauth2->userinfo->get();
        
        echo "✓ Email REAL do Google que autorizou: <strong>" . htmlspecialchars($userInfo->getEmail()) . "</strong><br>";
        echo "Nome: " . htmlspecialchars($userInfo->getName() ?? 'N/A') . "<br>";
        echo "<br>";
        
        echo "<h3>📋 Próximos Passos:</h3>";
        echo "<p><strong>Você precisa compartilhar a pasta GRUPO_RACA com este email REAL:</strong></p>";
        echo "<p style='font-size: 18px; color: #667eea; font-weight: bold;'>" . htmlspecialchars($userInfo->getEmail()) . "</p>";
        echo "<ol>";
        echo "<li>Acesse o Google Drive: <a href='https://drive.google.com' target='_blank'>https://drive.google.com</a></li>";
        echo "<li>Navegue até a pasta <strong>GRUPO_RACA</strong></li>";
        echo "<li>Clique com botão direito → <strong>Compartilhar</strong></li>";
        echo "<li>Adicione o email: <strong>" . htmlspecialchars($userInfo->getEmail()) . "</strong></li>";
        echo "<li>Dê permissão: <strong>Editor</strong> ou <strong>Gerenciador de Conteúdo</strong></li>";
        echo "<li>Clique em <strong>Enviar</strong></li>";
        echo "</ol>";
        
    } catch (Exception $e) {
        echo "⚠️ Não foi possível obter o email do Google automaticamente<br>";
        echo "Erro: " . htmlspecialchars($e->getMessage()) . "<br>";
        echo "<br>";
        echo "<h3>💡 Solução Manual:</h3>";
        echo "<p>Quando você autorizou o OAuth, você fez login com qual conta do Google?</p>";
        echo "<ul>";
        echo "<li>Foi uma conta pessoal do Gmail?</li>";
        echo "<li>Foi uma conta do Google Workspace (@gruporaca.app.br)?</li>";
        echo "<li>Foi outra conta?</li>";
        echo "</ul>";
        echo "<p><strong>Compartilhe a pasta com o email da conta Google que você usou para autorizar.</strong></p>";
    }
} else {
    echo "✗ Token OAuth não encontrado na sessão<br>";
    echo "<p>Você precisa autorizar o Google Drive primeiro:</p>";
    echo "<p><a href='oauth-drive-simple.php' style='display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;'>🔐 Autorizar Google Drive</a></p>";
    echo "<br>";
    echo "<h3>⚠️ Importante:</h3>";
    echo "<p>Quando autorizar, use uma conta Google REAL (não fictícia) que tenha acesso ao Google Drive.</p>";
    echo "<p>Recomendação: Use uma conta do Google Workspace (@gruporaca.app.br) se disponível.</p>";
}
?>

