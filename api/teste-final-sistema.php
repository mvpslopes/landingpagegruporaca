<?php
/**
 * Teste Final do Sistema - Verificar se tudo está funcionando
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/html; charset=utf-8');

echo "<h1>✅ Teste Final do Sistema</h1>";
echo "<hr>";

// 1. Verificar token OAuth
echo "<h2>1. Token OAuth</h2>";
require_once __DIR__ . '/oauth_token_storage.php';

if (OAuthTokenStorage::hasToken()) {
    echo "✓ Token OAuth encontrado no arquivo<br>";
    $tokenInfo = OAuthTokenStorage::getTokenInfo();
    if ($tokenInfo) {
        echo "Autorizado por: " . htmlspecialchars($tokenInfo['authorized_by']) . "<br>";
        echo "Criado em: " . date('d/m/Y H:i:s', $tokenInfo['created']) . "<br>";
        echo "Expira em: " . date('d/m/Y H:i:s', $tokenInfo['expires_at']) . "<br>";
        echo "Tem refresh token: " . ($tokenInfo['has_refresh_token'] ? 'SIM' : 'NÃO') . "<br>";
    }
} else {
    echo "✗ Token OAuth NÃO encontrado<br>";
    echo "<p>Você precisa autorizar o Google Drive primeiro.</p>";
    exit;
}
echo "<br>";

// 2. Testar DriveService
echo "<h2>2. DriveService</h2>";
try {
    require_once __DIR__ . '/drive_service.php';
    $token = OAuthTokenStorage::loadToken();
    $driveService = new DriveService($token);
    echo "✓ DriveService instanciado com sucesso<br>";
} catch (Exception $e) {
    echo "✗ Erro ao instanciar DriveService: " . htmlspecialchars($e->getMessage()) . "<br>";
    exit;
}
echo "<br>";

// 3. Testar acesso à pasta
echo "<h2>3. Acesso à Pasta GRUPO_RACA</h2>";
try {
    $service = $driveService->getService();
    $rootFolderId = '1bXf338lIktS_6ss1-WoKuMfI-gpWryjn';
    
    $folder = $service->files->get($rootFolderId, [
        'fields' => 'id, name, driveId',
        'supportsAllDrives' => true
    ]);
    
    echo "✓ Pasta acessível!<br>";
    echo "Nome: " . htmlspecialchars($folder->getName()) . "<br>";
    echo "ID: " . htmlspecialchars($folder->getId()) . "<br>";
    
    $driveId = $folder->getDriveId();
    if ($driveId) {
        echo "✓ Está em Shared Drive (ID: " . htmlspecialchars($driveId) . ")<br>";
    } else {
        echo "⚠️ NÃO está em Shared Drive (pasta pessoal)<br>";
        echo "<p><strong>Importante:</strong> Certifique-se de que a conta que autorizou tem acesso a esta pasta.</p>";
    }
} catch (Exception $e) {
    echo "✗ Erro ao acessar pasta: " . htmlspecialchars($e->getMessage()) . "<br>";
    echo "<br>";
    echo "<h3>⚠️ Ação Necessária:</h3>";
    echo "<p>A conta que autorizou o OAuth precisa ter acesso à pasta GRUPO_RACA.</p>";
    echo "<ol>";
    echo "<li>Acesse: <a href='https://drive.google.com' target='_blank'>https://drive.google.com</a></li>";
    echo "<li>Navegue até a pasta GRUPO_RACA</li>";
    echo "<li>Clique com botão direito → <strong>Compartilhar</strong></li>";
    echo "<li>Adicione o email: <strong>" . htmlspecialchars($tokenInfo['authorized_by'] ?? 'N/A') . "</strong></li>";
    echo "<li>Dê permissão: <strong>Editor</strong> ou <strong>Gerenciador de Conteúdo</strong></li>";
    echo "</ol>";
}
echo "<br>";

// 4. Testar listagem de arquivos
echo "<h2>4. Listagem de Arquivos</h2>";
try {
    $files = $driveService->listFiles('', true);
    echo "✓ Arquivos listados com sucesso<br>";
    echo "Total de itens: " . count($files) . "<br>";
    
    if (count($files) > 0) {
        echo "<h4>Primeiros 3 itens:</h4>";
        echo "<ul>";
        foreach (array_slice($files, 0, 3) as $item) {
            $type = $item['type'] === 'folder' ? '📁' : '📄';
            echo "<li>{$type} " . htmlspecialchars($item['name'] ?? 'Sem nome') . "</li>";
        }
        echo "</ul>";
    } else {
        echo "ℹ️ Nenhum arquivo encontrado (pasta vazia ou sem acesso)<br>";
    }
} catch (Exception $e) {
    echo "✗ Erro ao listar arquivos: " . htmlspecialchars($e->getMessage()) . "<br>";
}
echo "<br>";

// 5. Testar endpoints
echo "<h2>5. Testar Endpoints</h2>";

// Testar folders.php
echo "<h3>folders.php</h3>";
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$_SESSION['user'] = [
    'id' => 1,
    'email' => 'marcus@gruporaca.com.br',
    'role' => 'root',
    'folder' => '*'
];

$_SERVER['REQUEST_METHOD'] = 'GET';
ob_start();
try {
    include __DIR__ . '/folders.php';
    $output = ob_get_clean();
    $json = json_decode($output, true);
    if ($json && isset($json['folders'])) {
        echo "✓ folders.php funcionando<br>";
        echo "Pastas encontradas: " . count($json['folders']) . "<br>";
    } else {
        echo "⚠️ folders.php retornou resposta inválida<br>";
    }
} catch (Exception $e) {
    ob_end_clean();
    echo "✗ Erro em folders.php: " . htmlspecialchars($e->getMessage()) . "<br>";
}

echo "<br>";

echo "<hr>";
echo "<h2>✅ Resumo</h2>";

if (OAuthTokenStorage::hasToken()) {
    echo "<p style='color: green; font-weight: bold;'>✓ Token OAuth configurado</p>";
} else {
    echo "<p style='color: red; font-weight: bold;'>✗ Token OAuth não encontrado</p>";
}

echo "<p><strong>Próximos passos:</strong></p>";
echo "<ol>";
echo "<li>Se todos os testes passaram, o sistema está pronto para uso!</li>";
echo "<li>Acesse o sistema normalmente e teste fazer upload de um arquivo</li>";
echo "<li>Se houver erro de acesso à pasta, compartilhe a pasta GRUPO_RACA com a conta que autorizou</li>";
echo "</ol>";

echo "<p><a href='../' style='display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px;'>🚀 Acessar Sistema</a></p>";
?>

