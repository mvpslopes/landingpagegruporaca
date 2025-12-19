-- ============================================
-- Criar Tabelas para Estatísticas de Assessores e Leilões
-- ============================================

-- Tabela: assessors (Assessores)
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
  UNIQUE KEY `unique_name_category` (`name`, `category`),
  INDEX `idx_category` (`category`),
  INDEX `idx_active` (`active`),
  INDEX `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela: auctions (Leilões)
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

-- Tabela: assessor_clicks (Cliques por Assessor)
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

-- ============================================
-- Popular Tabela de Assessores
-- Dados do componente Assessors.tsx
-- ============================================

-- Assessoria Grupo Raça
INSERT INTO `assessors` (`name`, `category`, `phone`, `email`, `whatsapp`) VALUES
('DAVID CHARLES', 'grupo_raca', NULL, NULL, NULL),
('BRUNO SOUZA LIMA', 'grupo_raca', '(32) 9198-0744', 'bruno.souza.lima@gruporaca.com.br', '553291980744'),
('BRUNO LAGARTIXA', 'grupo_raca', '(31) 97153-7765', 'bruno.lagartixa@gruporaca.com.br', '5531971537765'),
('DUDU GUIDUCCI', 'grupo_raca', '(32) 99804-0180', 'dudu.guiducci@gruporaca.com.br', '5532998040180'),
('DUDU ÁGUIA', 'grupo_raca', '(32) 99909-8350', 'dudu.aguia@gruporaca.com.br', '5532999098350'),
('ERICK', 'grupo_raca', '(31) 99995-2074', 'erick@gruporaca.com.br', '5531999952074'),
('FELIPE SÁ', 'grupo_raca', '(22) 99913-6263', 'felipe.sa@gruporaca.com.br', '5522999136263'),
('GABRIEL', 'grupo_raca', '(31) 9642-7108', 'gabriel.araujo@gruporaca.com.br', '553196427108'),
('GABRIEL QUEIXADA', 'grupo_raca', '(32) 98873-7345', 'gabriel.queixada@gruporaca.com.br', '5532988737345'),
('GABRIELA', 'grupo_raca', '(31) 99881-6001', 'gabriela.barcelos@gruporaca.com.br', '5531998816001'),
('GREGÓRIO', 'grupo_raca', '(21) 98166-1949', 'gregorio.neves@gruporaca.com.br', '5521981661949'),
('HUGO FERRARI', 'grupo_raca', '(21) 98122-5464', 'hugo.ferrari@gruporaca.com.br', '5521981225464'),
('JM', 'grupo_raca', '(37) 99963-6962', 'jm.assessoria@gruporaca.com.br', '5537999636962'),
('JOÃO CATIREIROS', 'grupo_raca', '(31) 9893-3338', 'joao.catireiros@gruporaca.com.br', '553198933338'),
('JOÃO PAULO', 'grupo_raca', '(12) 99715-5058', 'joao.paulo@gruporaca.com.br', '5512997155058'),
('JOEL', 'grupo_raca', '(33) 99870-8447', 'joel@gruporaca.com.br', '5533998708447'),
('JUNINHO', 'grupo_raca', '(31) 98531-4468', 'juninho@gruporaca.com.br', '5531985314468'),
('JÚNIOR MARTINS', 'grupo_raca', '(31) 9721-5761', 'junior.martins@gruporaca.com.br', '553197215761'),
('KAIKE', 'grupo_raca', '(32) 9946-8519', 'kaike@gruporaca.com.br', '553299468519'),
('KAUAN', 'grupo_raca', '(37) 99669-0014', 'kauan@gruporaca.com.br', '5537996690014'),
('LEONE', 'grupo_raca', '(21) 97969-6063', 'leone@gruporaca.com.br', '5521979696063'),
('MELQUIADES LEANDRO', 'grupo_raca', '(31) 9843-7379', 'melquiades.leandro@gruporaca.com.br', '553198437379'),
('MARCOS PIQUITO', 'grupo_raca', '(32) 9120-7075', 'marcos.piquito@gruporaca.com.br', '553291207075'),
('MARTINS', 'grupo_raca', '(24) 99229-7942', 'martins@gruporaca.com.br', '5524992297942'),
('MICHEL GODOI', 'grupo_raca', '(35) 99248-7070', 'michel.godoi@gruporaca.com.br', '5535992487070'),
('RAFAEL R.A', 'grupo_raca', '(32) 8825-0180', 'rafael.ra@gruporaca.com.br', '553288250180'),
('WALLACE', 'grupo_raca', '(24) 99854-4235', 'wallace@gruporaca.com.br', '5524998544235'),
('STEVAN', 'grupo_raca', '(31) 99675-4188', 'stevan.dominici@gruporaca.com.br', '5531996754188'),
('TILÃO', 'grupo_raca', '(32) 99983-4354', 'tilao@gruporaca.com.br', '5532999834354'),
('VERONESE', 'grupo_raca', '(32) 98825-0180', 'veronese@gruporaca.com.br', '5532988250180'),
('VINÍCIUS RODRIGUES', 'grupo_raca', '(38) 99892-1576', 'vinicius.rodrigues@gruporaca.com.br', '5538998921576'),
('EVOLUÇÃO DA MARCHA', 'grupo_raca', '(21) 96015-9538', 'evolucao.marcha@gruporaca.com.br', '5521960159538')
ON DUPLICATE KEY UPDATE `phone` = VALUES(`phone`), `email` = VALUES(`email`), `whatsapp` = VALUES(`whatsapp`);

-- Assessoria Campolina
INSERT INTO `assessors` (`name`, `category`, `phone`, `email`, `whatsapp`) VALUES
('ANDRÉ', 'campolina', '(75) 9888-9377', 'andre@gruporaca.com.br', '557598889377'),
('DINHO', 'campolina', '(21) 99322-3340', 'dinho@gruporaca.com.br', '5521993223340'),
('DUDU IDUALTE', 'campolina', '(34) 98406-2220', 'dudu.idualte@gruporaca.com.br', '5534984062220'),
('JOANN ALVES', 'campolina', '(71) 99957-5796', 'joann.alves@gruporaca.com.br', '5571999575796'),
('MARCELO BERNARDO', 'campolina', '(32) 99905-4175', 'marcelo.bernardo@gruporaca.com.br', '5532999054175'),
('TEÓFILO ALMEIDA', 'campolina', '(31) 9691-5876', 'teofilo.almeida@gruporaca.com.br', '553196915876')
ON DUPLICATE KEY UPDATE `phone` = VALUES(`phone`), `email` = VALUES(`email`), `whatsapp` = VALUES(`whatsapp`);

-- Assessorias Parceiras
INSERT INTO `assessors` (`name`, `category`, `phone`, `email`, `whatsapp`) VALUES
('GREKO', 'parceiras', '(22) 99966-1061', 'greko.lima@gruporaca.com.br', '5522999661061'),
('JEFERSON', 'parceiras', '(48) 99191-1474', 'jefferson.mattos@gruporaca.com.br', '5548991911474'),
('MARCELO ZEFERINO', 'parceiras', '(31) 8649-7175', 'marcelo.zeferino@gruporaca.com.br', '553186497175'),
('PEDRO', 'parceiras', '(32) 98813-7113', 'pedro@gruporaca.com.br', '5532988137113'),
('RAMIRO', 'parceiras', '(35) 9907-7171', 'ramiro@gruporaca.com.br', '553599077171'),
('RAÇA E MARCHA', 'parceiras', '(31) 9826-7101', '', '553198267101'),
('ROGÉRIO FÁVERO', 'parceiras', '(27) 99961-6321', 'rogerio.favero@gruporaca.com.br', '5527999616321'),
('RUY GOMES', 'parceiras', '(24) 99934-6827', 'ruy.gomes@gruporaca.com.br', '5524999346827'),
('TICO', 'parceiras', '(31) 99539-1747', 'tico.expresso@gruporaca.com.br', '5531995391747'),
('TRANCA', 'parceiras', '(32) 99905-4175', 'marcelo.tranca@gruporaca.com.br', '5532999054175'),
('ZIRDA', 'parceiras', '(35) 8413-4770', 'zirda@gruporaca.com.br', '553584134770')
ON DUPLICATE KEY UPDATE `phone` = VALUES(`phone`), `email` = VALUES(`email`), `whatsapp` = VALUES(`whatsapp`);

