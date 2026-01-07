<?php
/**
 * Armazenamento persistente de token OAuth
 * Permite que múltiplos usuários usem o mesmo token
 */

class OAuthTokenStorage {
    private static $tokenFile = __DIR__ . '/data/oauth_drive_token.json';
    
    /**
     * Salvar token OAuth
     */
    public static function saveToken($token) {
        $dataDir = dirname(self::$tokenFile);
        if (!file_exists($dataDir)) {
            mkdir($dataDir, 0755, true);
        }
        
        $data = [
            'access_token' => $token['access_token'] ?? null,
            'refresh_token' => $token['refresh_token'] ?? null,
            'expires_in' => $token['expires_in'] ?? 3600,
            'created' => $token['created'] ?? time(),
            'authorized_by' => $token['authorized_by'] ?? 'N/A',
            'token_type' => $token['token_type'] ?? 'Bearer'
        ];
        
        // Salvar em arquivo
        file_put_contents(self::$tokenFile, json_encode($data, JSON_PRETTY_PRINT), LOCK_EX);
        
        // Também salvar na sessão atual (para compatibilidade)
        if (session_status() === PHP_SESSION_ACTIVE) {
            if (!isset($_SESSION['oauth_tokens'])) {
                $_SESSION['oauth_tokens'] = [];
            }
            $_SESSION['oauth_tokens']['central'] = $data;
        }
    }
    
    /**
     * Carregar token OAuth
     */
    public static function loadToken() {
        // Primeiro tentar da sessão (para compatibilidade)
        if (session_status() === PHP_SESSION_ACTIVE && isset($_SESSION['oauth_tokens']['central'])) {
            return $_SESSION['oauth_tokens']['central'];
        }
        
        // Se não tiver na sessão, carregar do arquivo
        if (file_exists(self::$tokenFile)) {
            $data = json_decode(file_get_contents(self::$tokenFile), true);
            if ($data && isset($data['access_token'])) {
                // Também salvar na sessão atual
                if (session_status() === PHP_SESSION_ACTIVE) {
                    if (!isset($_SESSION['oauth_tokens'])) {
                        $_SESSION['oauth_tokens'] = [];
                    }
                    $_SESSION['oauth_tokens']['central'] = $data;
                }
                return $data;
            }
        }
        
        return null;
    }
    
    /**
     * Verificar se token existe
     */
    public static function hasToken() {
        return self::loadToken() !== null;
    }
    
    /**
     * Remover token
     */
    public static function removeToken() {
        if (file_exists(self::$tokenFile)) {
            unlink(self::$tokenFile);
        }
        
        if (session_status() === PHP_SESSION_ACTIVE && isset($_SESSION['oauth_tokens']['central'])) {
            unset($_SESSION['oauth_tokens']['central']);
        }
    }
    
    /**
     * Obter informações do token
     */
    public static function getTokenInfo() {
        $token = self::loadToken();
        if (!$token) {
            return null;
        }
        
        return [
            'authorized_by' => $token['authorized_by'] ?? 'N/A',
            'created' => $token['created'] ?? 0,
            'expires_at' => ($token['created'] ?? 0) + ($token['expires_in'] ?? 3600),
            'has_refresh_token' => !empty($token['refresh_token'])
        ];
    }
}

