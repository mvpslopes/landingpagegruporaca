<?php
/**
 * Teste Passo a Passo - Identificar onde está o problema
 */

// Limpar TUDO antes
while (ob_get_level() > 0) {
    ob_end_clean();
}

// Desabilitar exibição de erros
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Iniciar novo buffer
ob_start();

// Definir header JSON primeiro
header('Content-Type: application/json; charset=utf-8');

$steps = [];
$currentStep = 0;

function addStep($name, $status, $data = null) {
    global $steps, $currentStep;
    $currentStep++;
    $steps[] = [
        'step' => $currentStep,
        'name' => $name,
        'status' => $status,
        'data' => $data
    ];
}

try {
    addStep('Inicialização', 'ok');
    
    // Passo 1: Carregar config.php
    try {
        require_once 'config.php';
        addStep('Carregar config.php', 'ok');
    } catch (Exception $e) {
        addStep('Carregar config.php', 'error', $e->getMessage());
        throw $e;
    } catch (Error $e) {
        addStep('Carregar config.php', 'fatal_error', $e->getMessage());
        throw $e;
    }
    
    // Passo 2: Carregar permissions_db.php
    try {
        require_once 'permissions_db.php';
        addStep('Carregar permissions_db.php', 'ok');
    } catch (Exception $e) {
        addStep('Carregar permissions_db.php', 'error', $e->getMessage());
        throw $e;
    } catch (Error $e) {
        addStep('Carregar permissions_db.php', 'fatal_error', $e->getMessage());
        throw $e;
    }
    
    // Passo 3: Simular sessão
    try {
        $_SESSION['user'] = [
            'id' => 1,
            'email' => 'marcus@gruporaca.com.br',
            'name' => 'Marcus Lopes',
            'role' => 'root'
        ];
        addStep('Simular sessão', 'ok');
    } catch (Exception $e) {
        addStep('Simular sessão', 'error', $e->getMessage());
        throw $e;
    }
    
    // Passo 4: Autenticar
    try {
        $user = requireAuth();
        addStep('Autenticação', 'ok', ['role' => $user['role'] ?? 'unknown']);
    } catch (Exception $e) {
        addStep('Autenticação', 'error', $e->getMessage());
        throw $e;
    }
    
    // Passo 5: Carregar oauth_token_storage.php
    try {
        require_once __DIR__ . '/oauth_token_storage.php';
        addStep('Carregar oauth_token_storage.php', 'ok');
    } catch (Exception $e) {
        addStep('Carregar oauth_token_storage.php', 'error', $e->getMessage());
        throw $e;
    } catch (Error $e) {
        addStep('Carregar oauth_token_storage.php', 'fatal_error', $e->getMessage());
        throw $e;
    }
    
    // Passo 6: Carregar token OAuth
    try {
        $oauthToken = OAuthTokenStorage::loadToken();
        if (!$oauthToken) {
            addStep('Carregar token OAuth', 'error', 'Token não encontrado');
            throw new Exception('Token OAuth não encontrado');
        }
        addStep('Carregar token OAuth', 'ok', ['has_token' => true]);
    } catch (Exception $e) {
        addStep('Carregar token OAuth', 'error', $e->getMessage());
        throw $e;
    }
    
    // Passo 7: Carregar drive_service.php
    try {
        require_once __DIR__ . '/drive_service.php';
        addStep('Carregar drive_service.php', 'ok');
    } catch (Exception $e) {
        addStep('Carregar drive_service.php', 'error', $e->getMessage());
        throw $e;
    } catch (Error $e) {
        addStep('Carregar drive_service.php', 'fatal_error', $e->getMessage());
        throw $e;
    }
    
    // Passo 8: Criar DriveService
    try {
        $driveService = new DriveService($oauthToken);
        addStep('Criar DriveService', 'ok');
    } catch (Exception $e) {
        addStep('Criar DriveService', 'error', $e->getMessage());
        throw $e;
    } catch (Error $e) {
        addStep('Criar DriveService', 'fatal_error', $e->getMessage());
        throw $e;
    }
    
    // Passo 9: Obter Root Folder ID
    try {
        $rootFolderId = $driveService->getRootFolderId();
        if (empty($rootFolderId)) {
            addStep('Obter Root Folder ID', 'error', 'Root folder ID está vazio');
            throw new Exception('Root folder ID está vazio');
        }
        addStep('Obter Root Folder ID', 'ok', ['rootFolderId' => $rootFolderId]);
    } catch (Exception $e) {
        addStep('Obter Root Folder ID', 'error', $e->getMessage());
        throw $e;
    }
    
    // Passo 10: Listar arquivos
    try {
        $allFiles = $driveService->listFiles('*', true);
        $totalFiles = is_array($allFiles) ? count($allFiles) : 0;
        addStep('Listar arquivos', 'ok', ['totalFiles' => $totalFiles]);
    } catch (Exception $e) {
        addStep('Listar arquivos', 'error', $e->getMessage());
        throw $e;
    } catch (Error $e) {
        addStep('Listar arquivos', 'fatal_error', $e->getMessage());
        throw $e;
    }
    
    // Sucesso
    ob_clean();
    echo json_encode([
        'success' => true,
        'message' => 'Todos os passos executados com sucesso',
        'steps' => $steps
    ], JSON_PRETTY_PRINT);
    exit;
    
} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'steps' => $steps
    ], JSON_PRETTY_PRINT);
    exit;
} catch (Error $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro fatal: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'steps' => $steps
    ], JSON_PRETTY_PRINT);
    exit;
}
?>

