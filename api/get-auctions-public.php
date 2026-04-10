<?php
/**
 * API Pública para Buscar Leilões (usado pelo site)
 * Retorna apenas leilões ativos, ordenados por data
 */

require_once 'config.php';
require_once 'db_config.php';

// GET: Listar leilões ativos para o site
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $conn = getDBConnection();

        // Desativar automaticamente leilões encerrados (end_date < hoje)
        // Assim eles deixam de aparecer no site e ficam como "Inativo" no painel.
        try {
            $stmt = $conn->prepare("
                UPDATE auctions
                SET active = 0
                WHERE active = 1
                  AND end_date < CURDATE()
            ");
            $stmt->execute();
        } catch (Exception $e) {
            // Não bloquear o carregamento público caso falhe a manutenção
            error_log('Aviso: não foi possível desativar leilões encerrados: ' . $e->getMessage());
        }
        
        // Buscar apenas leilões ativos, ordenados por data de início
        $stmt = $conn->prepare("
            SELECT 
                id,
                title,
                breed,
                start_date,
                end_date,
                image_path,
                image_drive_id,
                link_url
            FROM auctions
            WHERE active = 1
              AND end_date >= CURDATE()
            ORDER BY start_date ASC, created_at DESC
        ");
        $stmt->execute();
        $auctions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Formatar para o frontend
        $formattedAuctions = [];
        foreach ($auctions as $auction) {
            $startDate = new DateTime($auction['start_date']);
            $endDate = new DateTime($auction['end_date']);
            
            // Calcular status
            $today = new DateTime();
            $today->setTime(0, 0, 0);
            $startDate->setTime(0, 0, 0);
            $endDate->setTime(0, 0, 0);
            
            $status = 'ENCERRADO';
            if ($today < $startDate) {
                $status = 'EM_BREVE';
            } elseif ($today >= $startDate && $today <= $endDate) {
                $status = 'NO_AR';
            }
            
            // Formatar data para exibição (formato brasileiro)
            $dateDisplay = '';
            $months = [
                1 => 'janeiro', 2 => 'fevereiro', 3 => 'março', 4 => 'abril',
                5 => 'maio', 6 => 'junho', 7 => 'julho', 8 => 'agosto',
                9 => 'setembro', 10 => 'outubro', 11 => 'novembro', 12 => 'dezembro'
            ];
            
            if ($startDate->format('Y-m-d') === $endDate->format('Y-m-d')) {
                // Mesma data (leilão de um dia)
                $day = (int)$startDate->format('d');
                $month = (int)$startDate->format('m');
                $monthName = $months[$month] ?? $startDate->format('F');
                $dateDisplay = $day . ' de ' . $monthName;
            } else {
                // Período
                $startDay = (int)$startDate->format('d');
                $startMonth = (int)$startDate->format('m');
                $endDay = (int)$endDate->format('d');
                $endMonth = (int)$endDate->format('m');
                
                if ($startMonth === $endMonth) {
                    // Mesmo mês
                    $monthName = $months[$startMonth] ?? $startDate->format('F');
                    $dateDisplay = $startDay . ' a ' . $endDay . ' de ' . $monthName;
                } else {
                    // Meses diferentes
                    $startMonthName = $months[$startMonth] ?? $startDate->format('F');
                    $endMonthName = $months[$endMonth] ?? $endDate->format('F');
                    $dateDisplay = $startDay . ' de ' . $startMonthName . ' a ' . 
                        $endDay . ' de ' . $endMonthName;
                }
            }
            
            $formattedAuctions[] = [
                'id' => (int)$auction['id'],
                'title' => $auction['title'],
                'date' => $dateDisplay,
                'startDate' => $auction['start_date'],
                'endDate' => $auction['end_date'],
                'breed' => $auction['breed'],
                'image' => $auction['image_path'] 
                    ?: ($auction['image_drive_id'] 
                        ? '/api/view-auction-image.php?id=' . $auction['image_drive_id'] 
                        : ''),
                'link_url' => $auction['link_url'] ?: null,
                'status' => $status
            ];
        }
        
        jsonResponse([
            'auctions' => $formattedAuctions,
            'total' => count($formattedAuctions)
        ]);
    } catch (Exception $e) {
        error_log('Erro ao listar leilões públicos: ' . $e->getMessage());
        jsonResponse([
            'auctions' => [],
            'total' => 0,
            'error' => 'Erro ao carregar leilões'
        ]);
    }
}

jsonError('Método não permitido', 405);
?>
