<?php
/**
 * Configuração Microsoft OneDrive - Grupo Raça
 * 
 * IMPORTANTE: Este arquivo contém configurações sensíveis.
 * NUNCA compartilhe publicamente ou faça commit no Git.
 */

return [
    // ID da pasta raiz no OneDrive (geralmente 'root')
    'root_folder_id' => 'root',
    
    // OAuth Credentials (REQUERIDO)
    // Obtenha em: https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
    'oauth_client_id' => '', // Preencher com Application (client) ID
    'oauth_client_secret' => '', // Preencher com Client secret value
    'oauth_redirect_uri' => 'https://gruporaca.app.br/api/oauth-onedrive.php',
    'oauth_tenant_id' => 'common', // 'common' para contas pessoais, ou seu Tenant ID
    
    // Escopos necessários para acessar o OneDrive
    'scopes' => [
        'Files.ReadWrite',
        'Files.ReadWrite.All',
        'offline_access' // Para obter refresh token
    ],
    
    // Configurações de upload
    'upload' => [
        'max_file_size' => 100 * 1024 * 1024, // 100MB (OneDrive suporta até 250GB, mas limitamos a 100MB por padrão)
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

