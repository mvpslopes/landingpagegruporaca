<?php
/**
 * Configuração Google Drive - Grupo Raça
 *
 * Credenciais sensíveis: use variáveis de ambiente (GOOGLE_OAUTH_*)
 * ou o arquivo drive_config.local.php (não versionado — veja drive_config.example.php).
 */

$base = [
    'credentials_path' => __DIR__ . '/grupo-raca-drive-credentials.json',

    'root_folder_id' => getenv('DRIVE_ROOT_FOLDER_ID') ?: '1bXf338lIktS_6ss1-WoKuMfI-gpWryjn',

    'oauth_client_id' => getenv('GOOGLE_OAUTH_CLIENT_ID') ?: '',
    'oauth_client_secret' => getenv('GOOGLE_OAUTH_CLIENT_SECRET') ?: '',
    'oauth_redirect_uri' => getenv('GOOGLE_OAUTH_REDIRECT_URI') ?: 'https://gruporaca.app.br/api/oauth-drive.php',

    'scopes' => [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
    ],

    'upload' => [
        'max_file_size' => 1024 * 1024 * 1024,
        'chunk_size' => 256 * 1024,
        'allowed_types' => [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'video/mp4',
            'video/mpeg',
            'video/quicktime',
            'video/x-msvideo',
            'video/x-ms-wmv',
            'video/webm',
            'video/x-matroska',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ],
    ],

    'folder_mapping' => [],

    // Se false, get-drive-token.php não chama drive/v3/about (útil se o servidor bloquear saída HTTPS para Google)
    'verify_drive_token' => getenv('DRIVE_VERIFY_DRIVE_TOKEN') !== '0',
];

$local = __DIR__ . '/drive_config.local.php';
if (is_file($local)) {
    $localConfig = require $local;
    if (is_array($localConfig)) {
        $base = array_replace_recursive($base, $localConfig);
    }
}

return $base;
