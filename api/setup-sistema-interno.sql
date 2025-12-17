-- ============================================
-- Sistema Interno Toda Arte - Estrutura do Banco
-- ============================================

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS `clients` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `company` VARCHAR(255) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  INDEX `idx_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Prestadores de Serviço
CREATE TABLE IF NOT EXISTS `service_providers` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `bank_account` VARCHAR(255) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Pagamentos Fixos
CREATE TABLE IF NOT EXISTS `fixed_payments` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `due_day` INT(2) NOT NULL COMMENT 'Dia do mês (1-31)',
  `category` VARCHAR(100) DEFAULT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_active` (`active`),
  INDEX `idx_due_day` (`due_day`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Transações Financeiras Gerais
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` ENUM('income', 'expense') NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `date` DATE NOT NULL,
  `payment_method` VARCHAR(50) DEFAULT NULL,
  `created_by` INT(11) UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_date` (`date`),
  INDEX `idx_category` (`category`),
  INDEX `idx_created_by` (`created_by`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Serviços por Cliente
CREATE TABLE IF NOT EXISTS `client_services` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `client_id` INT(11) UNSIGNED NOT NULL,
  `service_name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `performed_by` ENUM('lara', 'provider', 'client') NOT NULL,
  `provider_id` INT(11) UNSIGNED DEFAULT NULL,
  `date` DATE NOT NULL,
  `month` INT(2) NOT NULL COMMENT 'Mês de referência (1-12)',
  `year` INT(4) NOT NULL COMMENT 'Ano de referência',
  `status` ENUM('pending', 'invoiced', 'paid') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_client_id` (`client_id`),
  INDEX `idx_provider_id` (`provider_id`),
  INDEX `idx_month_year` (`month`, `year`),
  INDEX `idx_status` (`status`),
  INDEX `idx_date` (`date`),
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`provider_id`) REFERENCES `service_providers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Projetos
CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `client_id` INT(11) UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `status` ENUM('active', 'completed', 'archived') NOT NULL DEFAULT 'active',
  `created_by` INT(11) UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_client_id` (`client_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_by` (`created_by`),
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Tarefas (Trello-like)
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id` INT(11) UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `status` ENUM('todo', 'in_progress', 'done') NOT NULL DEFAULT 'todo',
  `assigned_to` INT(11) UNSIGNED DEFAULT NULL,
  `due_date` DATE DEFAULT NULL,
  `position` INT(11) NOT NULL DEFAULT 0 COMMENT 'Ordem no quadro',
  `created_by` INT(11) UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_project_id` (`project_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_assigned_to` (`assigned_to`),
  INDEX `idx_position` (`position`),
  INDEX `idx_created_by` (`created_by`),
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Adicionar coluna client_id na tabela users (se não existir)
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `client_id` INT(11) UNSIGNED DEFAULT NULL,
ADD INDEX IF NOT EXISTS `idx_client_id` (`client_id`),
ADD FOREIGN KEY IF NOT EXISTS (`client_id`) REFERENCES `clients`(`id`) ON DELETE SET NULL;

-- ============================================
-- DADOS FICTÍCIOS PARA TESTE
-- ============================================

-- Inserir clientes fictícios
INSERT INTO `clients` (`name`, `email`, `phone`, `company`) VALUES
('João Silva', 'joao@empresa.com.br', '(27) 99999-1111', 'Empresa ABC Ltda'),
('Maria Santos', 'maria@startup.com.br', '(27) 99999-2222', 'Startup XYZ'),
('Pedro Oliveira', 'pedro@consultoria.com.br', '(27) 99999-3333', 'Consultoria Premium');

-- Inserir prestadores fictícios
INSERT INTO `service_providers` (`name`, `email`, `phone`, `bank_account`) VALUES
('Designer Freelancer', 'designer@email.com', '(27) 99999-4444', 'Banco: 001 | Ag: 1234 | Conta: 56789-0'),
('Redator', 'redator@email.com', '(27) 99999-5555', 'Banco: 237 | Ag: 5678 | Conta: 12345-6'),
('Fotógrafo', 'fotografo@email.com', '(27) 99999-6666', 'Banco: 341 | Ag: 9012 | Conta: 78901-2');

-- Inserir pagamentos fixos fictícios
INSERT INTO `fixed_payments` (`name`, `description`, `amount`, `due_day`, `category`) VALUES
('Aluguel do Escritório', 'Aluguel mensal do espaço', 2500.00, 5, 'Infraestrutura'),
('Plano de Internet', 'Internet empresarial', 199.90, 10, 'Infraestrutura'),
('Software de Design', 'Assinatura Adobe Creative Cloud', 299.00, 15, 'Ferramentas');

-- Inserir transações fictícias
INSERT INTO `transactions` (`type`, `amount`, `description`, `category`, `date`, `payment_method`) VALUES
('income', 5000.00, 'Pagamento projeto Empresa ABC', 'Serviços', CURDATE(), 'Transferência'),
('expense', 500.00, 'Material de escritório', 'Despesas Operacionais', CURDATE(), 'Cartão'),
('income', 3000.00, 'Pagamento projeto Startup XYZ', 'Serviços', DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Transferência');

-- Inserir serviços por cliente (mês atual)
INSERT INTO `client_services` (`client_id`, `service_name`, `description`, `amount`, `performed_by`, `date`, `month`, `year`, `status`) VALUES
(1, 'Desenvolvimento de Site', 'Criação completa do site institucional', 5000.00, 'lara', CURDATE(), MONTH(CURDATE()), YEAR(CURDATE()), 'pending'),
(1, 'Design de Logo', 'Criação de identidade visual', 800.00, 'provider', DATE_SUB(CURDATE(), INTERVAL 3 DAY), MONTH(CURDATE()), YEAR(CURDATE()), 'pending'),
(2, 'Gestão de Redes Sociais', 'Posts e conteúdo para Instagram', 2000.00, 'lara', DATE_SUB(CURDATE(), INTERVAL 7 DAY), MONTH(CURDATE()), YEAR(CURDATE()), 'pending'),
(2, 'Fotografia de Produtos', 'Sessão fotográfica de 20 produtos', 1500.00, 'provider', DATE_SUB(CURDATE(), INTERVAL 10 DAY), MONTH(CURDATE()), YEAR(CURDATE()), 'pending');

-- Inserir projetos fictícios
INSERT INTO `projects` (`client_id`, `name`, `description`, `status`, `created_by`) VALUES
(1, 'Site Institucional Empresa ABC', 'Desenvolvimento completo do site', 'active', 1),
(2, 'Campanha de Marketing Digital', 'Gestão de redes sociais e conteúdo', 'active', 1),
(3, 'Rebranding Consultoria Premium', 'Atualização completa da identidade visual', 'active', 1);

-- Inserir tarefas fictícias
INSERT INTO `tasks` (`project_id`, `title`, `description`, `status`, `assigned_to`, `due_date`, `position`) VALUES
(1, 'Criar wireframes do site', 'Definir estrutura e layout das páginas', 'done', 2, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 0),
(1, 'Desenvolver página inicial', 'Implementar hero section e CTA', 'in_progress', 2, DATE_ADD(CURDATE(), INTERVAL 3 DAY), 1),
(1, 'Configurar formulário de contato', 'Integrar com email e banco de dados', 'todo', 2, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 2),
(2, 'Criar calendário de posts', 'Planejar conteúdo para o mês', 'done', 2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 0),
(2, 'Produzir conteúdo visual', 'Criar imagens e vídeos para posts', 'in_progress', 2, DATE_ADD(CURDATE(), INTERVAL 5 DAY), 1),
(2, 'Agendar posts na plataforma', 'Publicar conteúdo programado', 'todo', 2, DATE_ADD(CURDATE(), INTERVAL 10 DAY), 2);

