<?php
/**
 * Backblaze B2 Service - Grupo Raça
 * 
 * Classe para gerenciar operações com Backblaze B2 Cloud Storage
 */

class B2Service {
    private $applicationKeyId;
    private $applicationKey;
    private $accountId;
    private $bucketId;
    private $bucketName;
    private $apiUrl;
    private $downloadUrl;
    private $authorizationToken;
    private $config;
    
    public function __construct() {
        // Carregar configuração
        $configPath = __DIR__ . '/config/b2_config.php';
        if (!file_exists($configPath)) {
            throw new Exception('Arquivo de configuração do B2 não encontrado: ' . $configPath);
        }
        
        $this->config = require $configPath;
        $this->applicationKeyId = $this->config['application_key_id'];
        $this->applicationKey = $this->config['application_key'];
        $this->bucketName = $this->config['bucket_name'];
        
        // Autenticar e obter URLs da API
        $this->authenticate();
    }
    
    /**
     * Autenticar no B2 e obter authorization token e URLs
     */
    private function authenticate() {
        $authString = base64_encode($this->applicationKeyId . ':' . $this->applicationKey);
        
        $ch = curl_init('https://api.backblazeb2.com/b2api/v2/b2_authorize_account');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Basic ' . $authString
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception('Erro ao autenticar no Backblaze B2: ' . $response);
        }
        
        $data = json_decode($response, true);
        $this->authorizationToken = $data['authorizationToken'];
        $this->apiUrl = $data['apiUrl'];
        $this->downloadUrl = $data['downloadUrl'];
        $this->accountId = $data['accountId'];
        
        // Obter bucket ID
        $this->bucketId = $this->getBucketId();
    }
    
    /**
     * Obter ID do bucket pelo nome
     */
    private function getBucketId() {
        $ch = curl_init($this->apiUrl . '/b2api/v2/b2_list_buckets');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: ' . $this->authorizationToken
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'accountId' => $this->accountId
        ]));
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception('Erro ao listar buckets: ' . $response);
        }
        
        $data = json_decode($response, true);
        foreach ($data['buckets'] as $bucket) {
            if ($bucket['bucketName'] === $this->bucketName) {
                return $bucket['bucketId'];
            }
        }
        
        throw new Exception('Bucket não encontrado: ' . $this->bucketName);
    }
    
    /**
     * Obter URL de upload
     */
    private function getUploadUrl() {
        $ch = curl_init($this->apiUrl . '/b2api/v2/b2_get_upload_url');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: ' . $this->authorizationToken
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'bucketId' => $this->bucketId
        ]));
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception('Erro ao obter URL de upload: ' . $response);
        }
        
        return json_decode($response, true);
    }
    
    /**
     * Listar arquivos de uma pasta
     */
    public function listFiles($folderPath = '*', $includeFolders = true) {
        try {
            // B2 não tem pastas reais, usa prefixos no nome do arquivo
            $prefix = ($folderPath === '*' || $folderPath === '') ? '' : $folderPath . '/';
            
            $ch = curl_init($this->apiUrl . '/b2api/v2/b2_list_file_names');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: ' . $this->authorizationToken
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'bucketId' => $this->bucketId,
            'prefix' => $prefix,
            'maxFileCount' => 1000
        ]));
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception('Erro ao listar arquivos: ' . $response);
        }
        
        $data = json_decode($response, true);
        $files = [];
        $folders = [];
        
        foreach ($data['files'] ?? [] as $file) {
            $fileName = $file['fileName'];
            
            // Se o arquivo está em uma subpasta, extrair o nome da pasta
            $relativePath = str_replace($prefix, '', $fileName);
            
            // Verificar se é uma "pasta" (termina com /)
            if (substr($fileName, -1) === '/') {
                if ($includeFolders) {
                    $folderName = rtrim(str_replace($prefix, '', $fileName), '/');
                    if (!empty($folderName) && !in_array($folderName, $folders)) {
                        $folders[] = $folderName;
                        $files[] = [
                            'id' => $fileName,
                            'name' => $folderName,
                            'type' => 'folder',
                            'mimeType' => 'application/vnd.backblaze.folder',
                            'size' => null,
                            'modifiedTime' => $file['uploadTimestamp'] ?? '',
                            'viewLink' => '',
                            'downloadLink' => '',
                            'folder' => $folderPath
                        ];
                    }
                }
            } else {
                // É um arquivo
                $files[] = [
                    'id' => $file['fileId'],
                    'name' => basename($fileName),
                    'type' => 'file',
                    'mimeType' => $file['contentType'] ?? 'application/octet-stream',
                    'size' => (int)$file['contentLength'],
                    'modifiedTime' => date('c', $file['uploadTimestamp'] / 1000),
                    'viewLink' => $this->downloadUrl . '/file/' . $this->bucketName . '/' . $fileName,
                    'downloadLink' => $this->downloadUrl . '/file/' . $this->bucketName . '/' . $fileName,
                    'folder' => $folderPath
                ];
            }
        }
        
        return $files;
        } catch (Exception $e) {
            error_log('Erro ao listar arquivos B2: ' . $e->getMessage());
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
            
            // Construir caminho completo do arquivo no B2
            $b2FileName = ($folderPath === '*' || $folderPath === '') ? $fileName : $folderPath . '/' . $fileName;
            
            // Obter URL de upload
            $uploadData = $this->getUploadUrl();
            $uploadUrl = $uploadData['uploadUrl'];
            $uploadAuthToken = $uploadData['authorizationToken'];
            
            // Calcular SHA1 do arquivo
            $fileContent = file_get_contents($filePath);
            $sha1 = sha1($fileContent);
            
            // Fazer upload
            $ch = curl_init($uploadUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: ' . $uploadAuthToken,
                'X-Bz-File-Name: ' . $b2FileName,
                'X-Bz-Content-Type: ' . $mimeType,
                'X-Bz-Content-Sha1: ' . $sha1,
                'Content-Length: ' . $fileSize
            ]);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $fileContent);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode !== 200) {
                $error = json_decode($response, true);
                throw new Exception('Erro ao fazer upload: ' . ($error['message'] ?? 'Erro desconhecido'));
            }
            
            $file = json_decode($response, true);
            
            return [
                'id' => $file['fileId'],
                'name' => $fileName,
                'type' => 'file',
                'mimeType' => $mimeType,
                'size' => (int)$file['contentLength'],
                'modifiedTime' => date('c', $file['uploadTimestamp'] / 1000),
                'viewLink' => $this->downloadUrl . '/file/' . $this->bucketName . '/' . $b2FileName,
                'downloadLink' => $this->downloadUrl . '/file/' . $this->bucketName . '/' . $b2FileName,
                'folder' => $folderPath
            ];
        } catch (Exception $e) {
            error_log('Erro ao fazer upload B2: ' . $e->getMessage());
            throw new Exception('Erro ao fazer upload: ' . $e->getMessage());
        }
    }
    
    /**
     * Deletar arquivo
     */
    public function deleteFile($fileId, $fileName) {
        try {
            $ch = curl_init($this->apiUrl . '/b2api/v2/b2_delete_file_version');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: ' . $this->authorizationToken
            ]);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                'fileId' => $fileId,
                'fileName' => $fileName
            ]));
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode !== 200) {
                throw new Exception('Erro ao deletar arquivo: ' . $response);
            }
            
            return true;
        } catch (Exception $e) {
            error_log('Erro ao deletar arquivo B2: ' . $e->getMessage());
            throw new Exception('Erro ao deletar arquivo: ' . $e->getMessage());
        }
    }
    
    /**
     * Criar pasta (no B2, pastas são apenas prefixos)
     */
    public function createFolder($folderName, $parentPath = '*') {
        try {
            // No B2, pastas são apenas convenções de nomenclatura
            // Criamos um arquivo marcador vazio para representar a pasta
            $folderPath = ($parentPath === '*' || $parentPath === '') 
                ? $folderName . '/.folder' 
                : $parentPath . '/' . $folderName . '/.folder';
            
            // Criar arquivo marcador vazio
            $tempFile = tmpfile();
            fwrite($tempFile, '');
            $tempPath = stream_get_meta_data($tempFile)['uri'];
            
            try {
                $result = $this->uploadFile($tempPath, '.folder', ($parentPath === '*' ? '' : $parentPath) . '/' . $folderName);
                
                return [
                    'id' => $folderPath,
                    'name' => $folderName,
                    'type' => 'folder',
                    'folder' => $parentPath
                ];
            } finally {
                fclose($tempFile);
            }
        } catch (Exception $e) {
            error_log('Erro ao criar pasta B2: ' . $e->getMessage());
            throw new Exception('Erro ao criar pasta: ' . $e->getMessage());
        }
    }
}
?>

