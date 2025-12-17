<?php
/**
 * Configuração Google Drive - Grupo Raça
 * 
 * IMPORTANTE: Este arquivo contém configurações sensíveis.
 * NUNCA compartilhe publicamente ou faça commit no Git.
 */

return [
    // Caminho para o arquivo de credenciais JSON (Service Account - opcional)
    'credentials_path' => __DIR__ . '/grupo-raca-drive-credentials.json',
    
    // ID da pasta raiz no Google Drive
    'root_folder_id' => '1v8BQP6rK7659-bbhlvkT10RQcZDOEMXY',
    
    // OAuth Credentials (para upload centralizado - REQUERIDO)
    // Obtenha em: https://console.cloud.google.com/apis/credentials
    'oauth_client_id' => '', // Preencher com Client ID do OAuth
    'oauth_client_secret' => '', // Preencher com Client Secret do OAuth
    'oauth_redirect_uri' => 'https://gruporaca.app.br/api/oauth-drive.php',
    
    // Escopos necessários para acessar o Google Drive
    'scopes' => [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file'
    ],
    
    // Configurações de upload
    'upload' => [
        'max_file_size' => 100 * 1024 * 1024, // 100MB
        'allowed_types' => [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'video/mp4',
            'video/quicktime',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
        ]
    ],
    
    // Mapeamento de pastas por usuário (será usado pelo sistema)
    'folder_mapping' => [
        // ROOT e ADMIN têm acesso a todas as pastas (*)
        // USER têm acesso apenas à sua pasta específica
        // Exemplo:
        // 'fotografo@gruporaca.com.br' => 'fotografos',
        // 'deolhonomarchador@gruporaca.com.br' => 'midias/de-olho-no-marchador',
    ]
];
?>

