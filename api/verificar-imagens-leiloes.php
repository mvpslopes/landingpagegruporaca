<?php
/**
 * Script para Verificar Imagens dos Leilões
 * Mostra quais leilões têm imagens e se estão configuradas corretamente
 */

require_once 'config.php';
require_once 'db_config.php';

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Verificação de Imagens dos Leilões</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #333; color: white; }
        .success { color: #28a745; font-weight: bold; }
        .error { color: #dc3545; font-weight: bold; }
        .warning { color: #ffc107; font-weight: bold; }
        img { max-width: 200px; max-height: 150px; object-fit: contain; border: 1px solid #ddd; }
    </style>
</head>
<body>
<div class='container'>
<h1>🔍 Verificação de Imagens dos Leilões</h1>";

try {
    $conn = getDBConnection();
    
    $stmt = $conn->query("
        SELECT 
            id,
            title,
            image_path,
            image_drive_id,
            active
        FROM auctions
        ORDER BY id DESC
    ");
    
    $auctions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($auctions)) {
        echo "<p>Nenhum leilão cadastrado.</p>";
    } else {
        echo "<table>";
        echo "<tr><th>ID</th><th>Título</th><th>image_path</th><th>image_drive_id</th><th>Status</th><th>Preview</th></tr>";
        
        foreach ($auctions as $auction) {
            $hasImage = !empty($auction['image_drive_id']) || !empty($auction['image_path']);
            $imageUrl = '';
            
            if (!empty($auction['image_drive_id'])) {
                $imageUrl = '/api/view-auction-image.php?id=' . $auction['image_drive_id'];
                $imageStatus = "<span class='success'>✅ Drive ID</span>";
            } elseif (!empty($auction['image_path'])) {
                $imageUrl = $auction['image_path'];
                $imageStatus = "<span class='warning'>⚠️ Path</span>";
            } else {
                $imageStatus = "<span class='error'>❌ Sem imagem</span>";
            }
            
            echo "<tr>";
            echo "<td>{$auction['id']}</td>";
            echo "<td><strong>{$auction['title']}</strong></td>";
            echo "<td>" . ($auction['image_path'] ?: '<em>vazio</em>') . "</td>";
            echo "<td>" . ($auction['image_drive_id'] ?: '<em>vazio</em>') . "</td>";
            echo "<td>{$imageStatus}</td>";
            echo "<td>";
            if ($imageUrl) {
                $fullUrl = (strpos($imageUrl, 'http') === 0) ? $imageUrl : "https://gruporaca.app.br{$imageUrl}";
                echo "<img src='{$fullUrl}' alt='{$auction['title']}' onerror=\"this.style.display='none'; this.nextElementSibling.style.display='block'; console.error('Erro ao carregar:', '{$fullUrl}');\" />";
                echo "<span style='display:none; color:red;'>❌ Erro ao carregar</span>";
                echo "<br><small><a href='{$fullUrl}' target='_blank'>Abrir em nova aba</a></small>";
            } else {
                echo "<em>Sem imagem</em>";
            }
            echo "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
    }
    
} catch (Exception $e) {
    echo "<p style='color:red;'>Erro: {$e->getMessage()}</p>";
}

echo "</div></body></html>";
?>
