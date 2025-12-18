<?php
/**
 * Configuração Backblaze B2 - Grupo Raça
 * 
 * IMPORTANTE: Este arquivo contém configurações sensíveis.
 * NUNCA compartilhe publicamente ou faça commit no Git.
 */

return [
    // Credenciais do Backblaze B2
    'application_key_id' => '0051fe827217cf60000000001', // Application Key ID
    'application_key' => '005f07cb761755f27332730b3f652dafd2370b1ed7', // Application Key
    'bucket_name' => 'grupo-raca', // Nome do bucket
    
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

