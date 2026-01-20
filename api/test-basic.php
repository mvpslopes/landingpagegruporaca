<?php
// Teste básico - sem dependências
header('Content-Type: application/json');
echo json_encode(['test' => 'ok', 'php_version' => phpversion()]);
exit;
?>

