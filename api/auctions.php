<?php
/**
 * API de Gerenciamento de Leilões
 * CRUD completo para leilões do site
 */

require_once 'config.php';
require_once 'permissions_db.php';

$user = requireAuth();

// Apenas ROOT e ADMIN podem gerenciar leilões
if ($user['role'] !== 'root' && $user['role'] !== 'admin') {
    jsonError('Apenas ROOT e ADMIN podem gerenciar leilões', 403);
}

// GET: Listar leilões
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $conn = getDBConnection();
        
        // Buscar todos os leilões (ativos e inativos)
        $stmt = $conn->prepare("
            SELECT 
                id,
                title,
                breed,
                start_date,
                end_date,
                image_path,
                image_drive_id,
                active,
                created_at,
                updated_at,
                created_by
            FROM auctions
            ORDER BY start_date DESC, created_at DESC
        ");
        $stmt->execute();
        $auctions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Formatar datas para o frontend
        foreach ($auctions as &$auction) {
            // Calcular status baseado nas datas
            $today = new DateTime();
            $startDate = new DateTime($auction['start_date']);
            $endDate = new DateTime($auction['end_date']);
            
            if ($today < $startDate) {
                $auction['status'] = 'EM_BREVE';
            } elseif ($today >= $startDate && $today <= $endDate) {
                $auction['status'] = 'NO_AR';
            } else {
                $auction['status'] = 'ENCERRADO';
            }
            
            // Formatar data para exibição
            $startDateObj = new DateTime($auction['start_date']);
            $endDateObj = new DateTime($auction['end_date']);
            
            if ($startDateObj->format('Y-m-d') === $endDateObj->format('Y-m-d')) {
                // Mesma data (leilão de um dia)
                $auction['date_display'] = $startDateObj->format('d/m/Y');
            } else {
                // Período
                $auction['date_display'] = $startDateObj->format('d/m/Y') . ' a ' . $endDateObj->format('d/m/Y');
            }
        }
        
        jsonResponse([
            'auctions' => $auctions,
            'total' => count($auctions)
        ]);
    } catch (Exception $e) {
        error_log('Erro ao listar leilões: ' . $e->getMessage());
        jsonError('Erro ao listar leilões: ' . $e->getMessage(), 500);
    }
}

// POST: Criar novo leilão
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $title = trim($data['title'] ?? '');
        $breed = trim($data['breed'] ?? '');
        $startDate = $data['start_date'] ?? '';
        $endDate = $data['end_date'] ?? '';
        $imagePath = trim($data['image_path'] ?? '');
        $imageDriveId = trim($data['image_drive_id'] ?? '');
        $active = isset($data['active']) ? (bool)$data['active'] : true;
        
        // Validações
        if (empty($title)) {
            jsonError('Nome do leilão é obrigatório', 400);
        }
        
        if (empty($breed)) {
            jsonError('Raça do cavalo é obrigatória', 400);
        }
        
        if (empty($startDate)) {
            jsonError('Data de início é obrigatória', 400);
        }
        
        if (empty($endDate)) {
            jsonError('Data de fim é obrigatória', 400);
        }
        
        // Validar formato de data
        $startDateObj = DateTime::createFromFormat('Y-m-d', $startDate);
        $endDateObj = DateTime::createFromFormat('Y-m-d', $endDate);
        
        if (!$startDateObj || !$endDateObj) {
            jsonError('Formato de data inválido. Use YYYY-MM-DD', 400);
        }
        
        if ($startDateObj > $endDateObj) {
            jsonError('Data de início não pode ser posterior à data de fim', 400);
        }
        
        $conn = getDBConnection();
        
        $stmt = $conn->prepare("
            INSERT INTO auctions 
            (title, breed, start_date, end_date, image_path, image_drive_id, active, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $title,
            $breed,
            $startDate,
            $endDate,
            $imagePath ?: null,
            $imageDriveId ?: null,
            $active ? 1 : 0,
            $user['id']
        ]);
        
        $auctionId = $conn->lastInsertId();
        
        // Buscar leilão criado
        $stmt = $conn->prepare("SELECT * FROM auctions WHERE id = ?");
        $stmt->execute([$auctionId]);
        $auction = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Calcular status
        $today = new DateTime();
        $start = new DateTime($auction['start_date']);
        $end = new DateTime($auction['end_date']);
        
        if ($today < $start) {
            $auction['status'] = 'EM_BREVE';
        } elseif ($today >= $start && $today <= $end) {
            $auction['status'] = 'NO_AR';
        } else {
            $auction['status'] = 'ENCERRADO';
        }
        
        // Formatar data
        if ($start->format('Y-m-d') === $end->format('Y-m-d')) {
            $auction['date_display'] = $start->format('d/m/Y');
        } else {
            $auction['date_display'] = $start->format('d/m/Y') . ' a ' . $end->format('d/m/Y');
        }
        
        // Log de auditoria
        logAudit($user['id'], 'create_auction', 'auction', $auctionId, [
            'title' => $title,
            'breed' => $breed
        ]);
        
        jsonResponse([
            'success' => true,
            'message' => 'Leilão criado com sucesso',
            'auction' => $auction
        ]);
    } catch (Exception $e) {
        error_log('Erro ao criar leilão: ' . $e->getMessage());
        jsonError('Erro ao criar leilão: ' . $e->getMessage(), 500);
    }
}

// PATCH: Atualizar leilão
if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $auctionId = $data['id'] ?? null;
        
        if (!$auctionId) {
            jsonError('ID do leilão é obrigatório', 400);
        }
        
        $conn = getDBConnection();
        
        // Verificar se leilão existe
        $stmt = $conn->prepare("SELECT id FROM auctions WHERE id = ?");
        $stmt->execute([$auctionId]);
        if (!$stmt->fetch()) {
            jsonError('Leilão não encontrado', 404);
        }
        
        // Construir query de atualização dinamicamente
        $updateFields = [];
        $updateValues = [];
        
        if (isset($data['title'])) {
            $updateFields[] = "title = ?";
            $updateValues[] = trim($data['title']);
        }
        
        if (isset($data['breed'])) {
            $updateFields[] = "breed = ?";
            $updateValues[] = trim($data['breed']);
        }
        
        if (isset($data['start_date'])) {
            $startDateObj = DateTime::createFromFormat('Y-m-d', $data['start_date']);
            if (!$startDateObj) {
                jsonError('Formato de data de início inválido. Use YYYY-MM-DD', 400);
            }
            $updateFields[] = "start_date = ?";
            $updateValues[] = $data['start_date'];
        }
        
        if (isset($data['end_date'])) {
            $endDateObj = DateTime::createFromFormat('Y-m-d', $data['end_date']);
            if (!$endDateObj) {
                jsonError('Formato de data de fim inválido. Use YYYY-MM-DD', 400);
            }
            $updateFields[] = "end_date = ?";
            $updateValues[] = $data['end_date'];
        }
        
        if (isset($data['image_path'])) {
            $updateFields[] = "image_path = ?";
            $updateValues[] = trim($data['image_path']) ?: null;
        }
        
        if (isset($data['image_drive_id'])) {
            $updateFields[] = "image_drive_id = ?";
            $updateValues[] = trim($data['image_drive_id']) ?: null;
        }
        
        if (isset($data['active'])) {
            $updateFields[] = "active = ?";
            $updateValues[] = $data['active'] ? 1 : 0;
        }
        
        if (empty($updateFields)) {
            jsonError('Nenhum campo para atualizar', 400);
        }
        
        // Validar se datas são consistentes (se ambas foram fornecidas)
        if (isset($data['start_date']) && isset($data['end_date'])) {
            $start = new DateTime($data['start_date']);
            $end = new DateTime($data['end_date']);
            if ($start > $end) {
                jsonError('Data de início não pode ser posterior à data de fim', 400);
            }
        }
        
        $updateValues[] = $auctionId;
        
        $sql = "UPDATE auctions SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute($updateValues);
        
        // Buscar leilão atualizado
        $stmt = $conn->prepare("SELECT * FROM auctions WHERE id = ?");
        $stmt->execute([$auctionId]);
        $auction = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Calcular status
        $today = new DateTime();
        $start = new DateTime($auction['start_date']);
        $end = new DateTime($auction['end_date']);
        
        if ($today < $start) {
            $auction['status'] = 'EM_BREVE';
        } elseif ($today >= $start && $today <= $end) {
            $auction['status'] = 'NO_AR';
        } else {
            $auction['status'] = 'ENCERRADO';
        }
        
        // Formatar data
        if ($start->format('Y-m-d') === $end->format('Y-m-d')) {
            $auction['date_display'] = $start->format('d/m/Y');
        } else {
            $auction['date_display'] = $start->format('d/m/Y') . ' a ' . $end->format('d/m/Y');
        }
        
        // Log de auditoria
        logAudit($user['id'], 'update_auction', 'auction', $auctionId, [
            'updated_fields' => array_keys($data)
        ]);
        
        jsonResponse([
            'success' => true,
            'message' => 'Leilão atualizado com sucesso',
            'auction' => $auction
        ]);
    } catch (Exception $e) {
        error_log('Erro ao atualizar leilão: ' . $e->getMessage());
        jsonError('Erro ao atualizar leilão: ' . $e->getMessage(), 500);
    }
}

// DELETE: Deletar leilão
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $auctionId = $_GET['id'] ?? null;
        
        if (!$auctionId) {
            jsonError('ID do leilão é obrigatório', 400);
        }
        
        $conn = getDBConnection();
        
        // Verificar se leilão existe
        $stmt = $conn->prepare("SELECT id, title FROM auctions WHERE id = ?");
        $stmt->execute([$auctionId]);
        $auction = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$auction) {
            jsonError('Leilão não encontrado', 404);
        }
        
        // Deletar leilão
        $stmt = $conn->prepare("DELETE FROM auctions WHERE id = ?");
        $stmt->execute([$auctionId]);
        
        // Log de auditoria
        logAudit($user['id'], 'delete_auction', 'auction', $auctionId, [
            'title' => $auction['title']
        ]);
        
        jsonResponse([
            'success' => true,
            'message' => 'Leilão deletado com sucesso'
        ]);
    } catch (Exception $e) {
        error_log('Erro ao deletar leilão: ' . $e->getMessage());
        jsonError('Erro ao deletar leilão: ' . $e->getMessage(), 500);
    }
}

jsonError('Método não permitido', 405);
?>
