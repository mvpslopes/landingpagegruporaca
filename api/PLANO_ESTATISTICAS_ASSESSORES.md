# Plano: Estatísticas de Assessores e Leilões

## Objetivo
Adicionar estatísticas sobre assessores e leilões no dashboard de analytics, incluindo:
- Nomes dos assessores por categoria
- Leilões ativos vs passados
- Métricas de performance por assessor
- Outros cálculos relevantes

## Estrutura de Banco de Dados

### Tabela: assessors (Assessores)
```sql
CREATE TABLE IF NOT EXISTS `assessors` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `category` ENUM('grupo_raca', 'campolina', 'parceiras') NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `whatsapp` VARCHAR(20) DEFAULT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_active` (`active`),
  INDEX `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabela: auctions (Leilões)
```sql
CREATE TABLE IF NOT EXISTS `auctions` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `status` ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME DEFAULT NULL,
  `assessor_id` INT(11) UNSIGNED DEFAULT NULL,
  `total_lots` INT(11) DEFAULT 0,
  `sold_lots` INT(11) DEFAULT 0,
  `total_value` DECIMAL(15,2) DEFAULT 0.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_assessor_id` (`assessor_id`),
  INDEX `idx_start_date` (`start_date`),
  INDEX `idx_end_date` (`end_date`),
  FOREIGN KEY (`assessor_id`) REFERENCES `assessors`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabela: assessor_clicks (Cliques por Assessor)
```sql
CREATE TABLE IF NOT EXISTS `assessor_clicks` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `assessor_id` INT(11) UNSIGNED NOT NULL,
  `session_id` VARCHAR(255) NOT NULL,
  `click_type` ENUM('phone', 'whatsapp', 'email', 'profile') NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_assessor_id` (`assessor_id`),
  INDEX `idx_session_id` (`session_id`),
  INDEX `idx_click_type` (`click_type`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`assessor_id`) REFERENCES `assessors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Endpoints da API

### GET /api/statistics.php?action=assessors
Retorna estatísticas dos assessores:
- Total por categoria
- Top assessores mais clicados
- Cliques por tipo (phone, whatsapp, email)
- Assessores mais ativos

### GET /api/statistics.php?action=auctions
Retorna estatísticas dos leilões:
- Total de leilões ativos
- Total de leilões completados
- Leilões por assessor
- Valor total arrecadado
- Taxa de conversão (lotes vendidos / total)

## Componente Frontend

Adicionar nova seção no `Analytics.tsx`:
- Cards com estatísticas de assessores
- Cards com estatísticas de leilões
- Gráficos de performance
- Lista de top assessores

## Implementação

1. Criar tabelas no banco de dados
2. Popular tabela `assessors` com dados do componente `Assessors.tsx`
3. Adicionar endpoints na API
4. Adicionar seção no frontend
5. Integrar tracking de cliques nos assessores

