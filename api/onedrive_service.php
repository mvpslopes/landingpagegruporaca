<?php
/**
 * Microsoft OneDrive Service - Grupo Raça
 * 
 * Classe para gerenciar operações com Microsoft OneDrive usando Microsoft Graph API
 */

// Carregar autoloader do Composer
$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    throw new Exception('Autoloader do Composer não encontrado em: ' . $autoloadPath . '. Execute: composer require microsoft/microsoft-graph');
}

require_once $autoloadPath;

class OneDriveService {
    private $client;
    private $config;
    private $rootFolderId;
    private $accessToken;
    
    public function __construct($accessToken = null) {
        // Carregar configuração
        $configPath = __DIR__ . '/config/onedrive_config.php';
        if (!file_exists($configPath)) {
            throw new Exception('Arquivo de configuração do OneDrive não encontrado: ' . $configPath);
        }
        
        $this->config = require $configPath;
        $this->rootFolderId = $this->config['root_folder_id'] ?? 'root';
        
        // Se tiver token, usar
        if ($accessToken) {
            $this->accessToken = is_array($accessToken) ? $accessToken['access_token'] : $accessToken;
        } else {
            // Tentar obter token da sessão
            if (isset($_SESSION['onedrive_token'])) {
                $this->accessToken = $_SESSION['onedrive_token']['access_token'];
            } else {
                throw new Exception('Token de acesso OneDrive não encontrado. Faça autenticação OAuth primeiro.');
            }
        }
    }
    
    /**
     * Fazer requisição autenticada para Microsoft Graph API
     */
    private function makeRequest($method, $endpoint, $data = null) {
        $url = 'https://graph.microsoft.com/v1.0' . $endpoint;
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->accessToken,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 400) {
            $error = json_decode($response, true);
            throw new Exception('Erro na API OneDrive: ' . ($error['error']['message'] ?? 'Erro desconhecido'));
        }
        
        return json_decode($response, true);
    }
    
    /**
     * Obter ID de uma pasta pelo caminho
     */
    private function getFolderIdByPath($folderPath) {
        if ($folderPath === '*' || $folderPath === '') {
            return 'root';
        }
        
        // Converter caminho para formato OneDrive (ex: "pasta1/pasta2" -> "/drive/root:/pasta1/pasta2:")
        $pathParts = explode('/', $folderPath);
        $path = '/drive/root:';
        
        foreach ($pathParts as $part) {
            if (!empty($part)) {
                $path .= '/' . urlencode($part);
            }
        }
        $path .= ':';
        
        try {
            $result = $this->makeRequest('GET', $path);
            return $result['id'];
        } catch (Exception $e) {
            // Se pasta não existe, criar
            return $this->ensureFolder($folderPath);
        }
    }
    
    /**
     * Garantir que uma pasta existe (criar se não existir)
     */
    public function ensureFolder($folderPath) {
        if ($folderPath === '*' || $folderPath === '') {
            return 'root';
        }
        
        $pathParts = explode('/', $folderPath);
        $currentPath = '';
        $parentId = 'root';
        
        foreach ($pathParts as $part) {
            if (empty($part)) continue;
            
            $currentPath = $currentPath ? $currentPath . '/' . $part : $part;
            
            // Tentar encontrar pasta
            $searchPath = '/drive/root:';
            $pathForSearch = '';
            foreach (explode('/', $currentPath) as $p) {
                if (!empty($p)) {
                    $pathForSearch .= '/' . urlencode($p);
                }
            }
            $searchPath .= $pathForSearch . ':';
            
            try {
                $result = $this->makeRequest('GET', $searchPath);
                $parentId = $result['id'];
            } catch (Exception $e) {
                // Pasta não existe, criar
                $parentEndpoint = $parentId === 'root' ? '/drive/root/children' : '/drive/items/' . $parentId . '/children';
                
                $folderData = [
                    'name' => $part,
                    'folder' => new stdClass(),
                    '@microsoft.graph.conflictBehavior' => 'rename'
                ];
                
                $result = $this->makeRequest('POST', $parentEndpoint, $folderData);
                $parentId = $result['id'];
            }
        }
        
        return $parentId;
    }
    
    /**
     * Listar arquivos de uma pasta
     */
    public function listFiles($folderPath = '*', $includeFolders = true) {
        try {
            $folderId = $this->getFolderIdByPath($folderPath);
            $endpoint = $folderId === 'root' 
                ? '/drive/root/children' 
                : '/drive/items/' . $folderId . '/children';
            
            $result = $this->makeRequest('GET', $endpoint . '?$orderby=lastModifiedDateTime desc');
            
            $files = [];
            foreach ($result['value'] ?? [] as $item) {
                $isFolder = isset($item['folder']);
                
                if (!$includeFolders && $isFolder) {
                    continue;
                }
                
                $files[] = [
                    'id' => $item['id'],
                    'name' => $item['name'],
                    'type' => $isFolder ? 'folder' : 'file',
                    'mimeType' => $item['file']['mimeType'] ?? ($isFolder ? 'application/vnd.microsoft.drive.folder' : ''),
                    'size' => $isFolder ? null : ($item['size'] ?? 0),
                    'modifiedTime' => $item['lastModifiedDateTime'] ?? '',
                    'viewLink' => $item['webUrl'] ?? '',
                    'downloadLink' => $item['@microsoft.graph.downloadUrl'] ?? '',
                    'folder' => $folderPath
                ];
            }
            
            return $files;
        } catch (Exception $e) {
            error_log('Erro ao listar arquivos OneDrive: ' . $e->getMessage());
            throw new Exception('Erro ao listar arquivos: ' . $e->getMessage());
        }
    }
    
    /**
     * Upload de arquivo
     */
    public function uploadFile($filePath, $fileName, $folderPath = '*') {
        try {
            // Verificar tamanho do arquivo
            $fileSize = filesize($filePath);
            if ($fileSize > $this->config['upload']['max_file_size']) {
                throw new Exception('Arquivo muito grande. Tamanho máximo: ' . ($this->config['upload']['max_file_size'] / 1024 / 1024) . 'MB');
            }
            
            // Verificar tipo de arquivo
            $mimeType = mime_content_type($filePath);
            if (!in_array($mimeType, $this->config['upload']['allowed_types'])) {
                throw new Exception('Tipo de arquivo não permitido: ' . $mimeType);
            }
            
            // Obter ID da pasta de destino
            $folderId = $this->getFolderIdByPath($folderPath);
            
            // Para arquivos menores que 4MB, usar upload simples
            if ($fileSize < 4 * 1024 * 1024) {
                $endpoint = $folderId === 'root' 
                    ? '/drive/root:/' . urlencode($fileName) . ':/content' 
                    : '/drive/items/' . $folderId . ':/' . urlencode($fileName) . ':/content';
                
                $content = file_get_contents($filePath);
                
                $ch = curl_init('https://graph.microsoft.com/v1.0' . $endpoint);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
                curl_setopt($ch, CURLOPT_POSTFIELDS, $content);
                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                    'Authorization: Bearer ' . $this->accessToken,
                    'Content-Type: ' . $mimeType,
                    'Content-Length: ' . $fileSize
                ]);
                
                $response = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                
                if ($httpCode >= 400) {
                    $error = json_decode($response, true);
                    throw new Exception('Erro ao fazer upload: ' . ($error['error']['message'] ?? 'Erro desconhecido'));
                }
                
                $file = json_decode($response, true);
            } else {
                // Para arquivos maiores, usar upload em sessão (upload de sessão)
                throw new Exception('Upload de arquivos grandes (>4MB) ainda não implementado. Use arquivos menores que 4MB.');
            }
            
            return [
                'id' => $file['id'],
                'name' => $file['name'],
                'type' => 'file',
                'mimeType' => $file['file']['mimeType'] ?? $mimeType,
                'size' => (int)$file['size'],
                'modifiedTime' => $file['lastModifiedDateTime'],
                'viewLink' => $file['webUrl'],
                'downloadLink' => $file['@microsoft.graph.downloadUrl'] ?? '',
                'folder' => $folderPath
            ];
        } catch (Exception $e) {
            error_log('Erro ao fazer upload OneDrive: ' . $e->getMessage());
            throw new Exception('Erro ao fazer upload: ' . $e->getMessage());
        }
    }
    
    /**
     * Deletar arquivo
     */
    public function deleteFile($fileId) {
        try {
            $this->makeRequest('DELETE', '/drive/items/' . $fileId);
            return true;
        } catch (Exception $e) {
            error_log('Erro ao deletar arquivo OneDrive: ' . $e->getMessage());
            throw new Exception('Erro ao deletar arquivo: ' . $e->getMessage());
        }
    }
    
    /**
     * Criar pasta
     */
    public function createFolder($folderName, $parentPath = '*') {
        try {
            $parentId = $this->getFolderIdByPath($parentPath);
            $endpoint = $parentId === 'root' 
                ? '/drive/root/children' 
                : '/drive/items/' . $parentId . '/children';
            
            $folderData = [
                'name' => $folderName,
                'folder' => new stdClass(),
                '@microsoft.graph.conflictBehavior' => 'rename'
            ];
            
            $result = $this->makeRequest('POST', $endpoint, $folderData);
            
            return [
                'id' => $result['id'],
                'name' => $result['name'],
                'type' => 'folder',
                'folder' => $parentPath
            ];
        } catch (Exception $e) {
            error_log('Erro ao criar pasta OneDrive: ' . $e->getMessage());
            throw new Exception('Erro ao criar pasta: ' . $e->getMessage());
        }
    }
}
?>

