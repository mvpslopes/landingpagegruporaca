<?php
/**
 * Script de Verificação de Configurações de Upload
 * 
 * Este script verifica se as configurações do servidor estão adequadas
 * para suportar uploads de arquivos grandes (até 1GB).
 * 
 * ⚠️ IMPORTANTE: Remova este arquivo após verificar as configurações!
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificação de Configurações de Upload</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 10px;
        }
        .config-item {
            margin: 15px 0;
            padding: 15px;
            background: #f9f9f9;
            border-left: 4px solid #ddd;
            border-radius: 4px;
        }
        .config-item.ok {
            border-left-color: #4CAF50;
            background: #e8f5e9;
        }
        .config-item.warning {
            border-left-color: #ff9800;
            background: #fff3e0;
        }
        .config-item.error {
            border-left-color: #f44336;
            background: #ffebee;
        }
        .label {
            font-weight: bold;
            color: #555;
        }
        .value {
            color: #333;
            font-family: monospace;
            margin-left: 10px;
        }
        .status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 10px;
        }
        .status.ok {
            background: #4CAF50;
            color: white;
        }
        .status.warning {
            background: #ff9800;
            color: white;
        }
        .status.error {
            background: #f44336;
            color: white;
        }
        .recommendation {
            margin-top: 10px;
            padding: 10px;
            background: #e3f2fd;
            border-left: 4px solid #2196F3;
            border-radius: 4px;
            font-size: 14px;
        }
        .summary {
            margin-top: 30px;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Verificação de Configurações de Upload</h1>
        
        <?php
        // Função para converter bytes para formato legível
        function formatBytes($bytes, $precision = 2) {
            $units = array('B', 'KB', 'MB', 'GB', 'TB');
            $bytes = max($bytes, 0);
            $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
            $pow = min($pow, count($units) - 1);
            $bytes /= pow(1024, $pow);
            return round($bytes, $precision) . ' ' . $units[$pow];
        }
        
        // Função para converter formato legível para bytes
        function parseSize($size) {
            $unit = preg_replace('/[^bkmgtpezy]/i', '', $size);
            $size = preg_replace('/[^0-9\.]/', '', $size);
            if ($unit) {
                return round($size * pow(1024, stripos('bkmgtpezy', $unit[0])));
            } else {
                return round($size);
            }
        }
        
        // Valores recomendados (1GB)
        $recommended_upload = 1024 * 1024 * 1024; // 1GB em bytes
        $recommended_post = 1024 * 1024 * 1024; // 1GB em bytes
        $recommended_execution = 3600; // 1 hora
        $recommended_input = 3600; // 1 hora
        $recommended_memory = 512 * 1024 * 1024; // 512MB
        
        // Obter valores atuais
        $upload_max = ini_get('upload_max_filesize');
        $post_max = ini_get('post_max_size');
        $execution_time = ini_get('max_execution_time');
        $input_time = ini_get('max_input_time');
        $memory_limit = ini_get('memory_limit');
        
        // Converter para bytes para comparação
        $upload_max_bytes = parseSize($upload_max);
        $post_max_bytes = parseSize($post_max);
        $memory_limit_bytes = parseSize($memory_limit);
        
        // Verificar status de cada configuração
        $checks = [
            'upload_max_filesize' => [
                'label' => 'Tamanho máximo de upload',
                'current' => $upload_max,
                'current_bytes' => $upload_max_bytes,
                'recommended' => formatBytes($recommended_upload),
                'recommended_bytes' => $recommended_upload,
                'status' => $upload_max_bytes >= $recommended_upload ? 'ok' : ($upload_max_bytes >= 100 * 1024 * 1024 ? 'warning' : 'error')
            ],
            'post_max_size' => [
                'label' => 'Tamanho máximo de POST',
                'current' => $post_max,
                'current_bytes' => $post_max_bytes,
                'recommended' => formatBytes($recommended_post),
                'recommended_bytes' => $recommended_post,
                'status' => $post_max_bytes >= $recommended_post ? 'ok' : ($post_max_bytes >= $upload_max_bytes ? 'warning' : 'error'),
                'note' => 'Deve ser maior ou igual a upload_max_filesize'
            ],
            'max_execution_time' => [
                'label' => 'Tempo máximo de execução',
                'current' => $execution_time . ' segundos',
                'current_bytes' => $execution_time,
                'recommended' => $recommended_execution . ' segundos (1 hora)',
                'recommended_bytes' => $recommended_execution,
                'status' => $execution_time >= $recommended_execution ? 'ok' : ($execution_time >= 600 ? 'warning' : 'error')
            ],
            'max_input_time' => [
                'label' => 'Tempo máximo de input',
                'current' => $input_time . ' segundos',
                'current_bytes' => $input_time,
                'recommended' => $recommended_input . ' segundos (1 hora)',
                'recommended_bytes' => $recommended_input,
                'status' => $input_time >= $recommended_input ? 'ok' : ($input_time >= 600 ? 'warning' : 'error')
            ],
            'memory_limit' => [
                'label' => 'Limite de memória',
                'current' => $memory_limit,
                'current_bytes' => $memory_limit_bytes,
                'recommended' => formatBytes($recommended_memory),
                'recommended_bytes' => $recommended_memory,
                'status' => $memory_limit_bytes >= $recommended_memory ? 'ok' : ($memory_limit_bytes >= 256 * 1024 * 1024 ? 'warning' : 'error')
            ]
        ];
        
        // Exibir cada configuração
        foreach ($checks as $key => $check) {
            $status_class = $check['status'];
            $status_text = $status_class === 'ok' ? 'OK' : ($status_class === 'warning' ? 'ATENÇÃO' : 'ERRO');
            
            echo '<div class="config-item ' . $status_class . '">';
            echo '<div class="label">' . $check['label'] . ':</div>';
            echo '<div class="value">Atual: ' . $check['current'] . ' <span class="status ' . $status_class . '">' . $status_text . '</span></div>';
            echo '<div class="value">Recomendado: ' . $check['recommended'] . '</div>';
            if (isset($check['note'])) {
                echo '<div class="recommendation">ℹ️ ' . $check['note'] . '</div>';
            }
            echo '</div>';
        }
        
        // Resumo
        $all_ok = true;
        $has_warnings = false;
        foreach ($checks as $check) {
            if ($check['status'] === 'error') {
                $all_ok = false;
            }
            if ($check['status'] === 'warning') {
                $has_warnings = true;
            }
        }
        
        echo '<div class="summary">';
        echo '<h2>📊 Resumo</h2>';
        
        if ($all_ok && !$has_warnings) {
            echo '<p style="color: #4CAF50; font-weight: bold;">✅ Todas as configurações estão adequadas para uploads de até 1GB!</p>';
        } elseif ($all_ok && $has_warnings) {
            echo '<p style="color: #ff9800; font-weight: bold;">⚠️ Configurações funcionais, mas recomenda-se ajustar para melhor performance.</p>';
        } else {
            echo '<p style="color: #f44336; font-weight: bold;">❌ Algumas configurações precisam ser ajustadas para suportar uploads de 1GB.</p>';
            echo '<p>Consulte o arquivo <strong>api/RESOLVER_ERRO_413.md</strong> para instruções detalhadas.</p>';
        }
        
        // Verificar se post_max_size é maior que upload_max_filesize
        if ($post_max_bytes < $upload_max_bytes) {
            echo '<p style="color: #f44336; font-weight: bold;">⚠️ ATENÇÃO: post_max_size deve ser maior ou igual a upload_max_filesize!</p>';
        }
        
        echo '</div>';
        ?>
        
        <div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
            <strong>⚠️ IMPORTANTE:</strong> Remova este arquivo após verificar as configurações por questões de segurança!
        </div>
    </div>
</body>
</html>
