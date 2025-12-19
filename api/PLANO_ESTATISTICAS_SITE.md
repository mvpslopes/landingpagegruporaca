# 📊 Plano de Implementação: Sistema de Estatísticas do Site

## 🎯 Objetivo
Criar uma aba de estatísticas no sistema interno que forneça dados sobre:
- **Cliques** em botões, links e elementos interativos
- **Estatísticas de acesso** (visitas, visitantes únicos, tempo médio)
- **Fluxo de acesso** (páginas visitadas, origem do tráfego, dispositivos)

## 🗄️ Estrutura do Banco de Dados

### 1. Tabela: `page_views` (Visualizações de Página)
```sql
CREATE TABLE IF NOT EXISTS `page_views` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` VARCHAR(128) NOT NULL,
  `page_path` VARCHAR(255) NOT NULL,
  `page_title` VARCHAR(255) DEFAULT NULL,
  `referrer` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `device_type` ENUM('desktop', 'mobile', 'tablet') DEFAULT NULL,
  `browser` VARCHAR(100) DEFAULT NULL,
  `os` VARCHAR(100) DEFAULT NULL,
  `country` VARCHAR(100) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `time_on_page` INT(11) UNSIGNED DEFAULT NULL COMMENT 'Tempo em segundos',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_session_id` (`session_id`),
  INDEX `idx_page_path` (`page_path`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_device_type` (`device_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Tabela: `click_events` (Eventos de Clique)
```sql
CREATE TABLE IF NOT EXISTS `click_events` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` VARCHAR(128) NOT NULL,
  `element_type` VARCHAR(50) NOT NULL COMMENT 'button, link, image, etc',
  `element_id` VARCHAR(255) DEFAULT NULL,
  `element_text` VARCHAR(255) DEFAULT NULL,
  `page_path` VARCHAR(255) NOT NULL,
  `click_position_x` INT(11) DEFAULT NULL,
  `click_position_y` INT(11) DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_session_id` (`session_id`),
  INDEX `idx_element_type` (`element_type`),
  INDEX `idx_page_path` (`page_path`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Tabela: `user_sessions` (Sessões de Usuários)
```sql
CREATE TABLE IF NOT EXISTS `user_sessions` (
  `id` VARCHAR(128) NOT NULL,
  `user_id` INT(11) UNSIGNED DEFAULT NULL COMMENT 'NULL para visitantes anônimos',
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `device_type` ENUM('desktop', 'mobile', 'tablet') DEFAULT NULL,
  `browser` VARCHAR(100) DEFAULT NULL,
  `os` VARCHAR(100) DEFAULT NULL,
  `country` VARCHAR(100) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `first_page` VARCHAR(255) DEFAULT NULL,
  `referrer` TEXT DEFAULT NULL,
  `pages_viewed` INT(11) UNSIGNED DEFAULT 1,
  `total_time` INT(11) UNSIGNED DEFAULT 0 COMMENT 'Tempo total em segundos',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_activity` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ended_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_device_type` (`device_type`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4. Tabela: `navigation_flow` (Fluxo de Navegação)
```sql
CREATE TABLE IF NOT EXISTS `navigation_flow` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` VARCHAR(128) NOT NULL,
  `from_page` VARCHAR(255) DEFAULT NULL,
  `to_page` VARCHAR(255) NOT NULL,
  `action_type` VARCHAR(50) DEFAULT NULL COMMENT 'click, scroll, form_submit, etc',
  `transition_time` INT(11) UNSIGNED DEFAULT NULL COMMENT 'Tempo entre páginas em segundos',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_session_id` (`session_id`),
  INDEX `idx_from_page` (`from_page`),
  INDEX `idx_to_page` (`to_page`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 🔧 Backend (API PHP)

### 1. Arquivo: `api/tracking.php`
**Responsabilidades:**
- Receber eventos de tracking do frontend
- Validar e sanitizar dados
- Armazenar no banco de dados
- Retornar confirmação

**Endpoints:**
- `POST /api/tracking.php?action=pageview` - Registrar visualização de página
- `POST /api/tracking.php?action=click` - Registrar clique
- `POST /api/tracking.php?action=session_start` - Iniciar sessão
- `POST /api/tracking.php?action=session_end` - Finalizar sessão
- `POST /api/tracking.php?action=navigation` - Registrar navegação

### 2. Arquivo: `api/statistics.php`
**Responsabilidades:**
- Fornecer dados agregados para o dashboard
- Filtrar por período (hoje, semana, mês, customizado)
- Calcular métricas (visitas, visitantes únicos, tempo médio, etc)
- Retornar dados em formato JSON

**Endpoints (apenas para admin/root):**
- `GET /api/statistics.php?action=overview` - Visão geral
- `GET /api/statistics.php?action=pageviews` - Estatísticas de páginas
- `GET /api/statistics.php?action=clicks` - Estatísticas de cliques
- `GET /api/statistics.php?action=flow` - Fluxo de navegação
- `GET /api/statistics.php?action=devices` - Estatísticas por dispositivo
- `GET /api/statistics.php?action=geographic` - Estatísticas geográficas
- `GET /api/statistics.php?action=realtime` - Dados em tempo real

## 🎨 Frontend (React/TypeScript)

### 1. Hook: `src/hooks/useTracking.ts`
**Responsabilidades:**
- Gerenciar sessão do usuário (criar/atualizar)
- Rastrear visualizações de página
- Rastrear cliques em elementos
- Rastrear navegação entre páginas
- Detectar informações do dispositivo/navegador

### 2. Componente: `src/components/Statistics.tsx`
**Responsabilidades:**
- Exibir dashboard de estatísticas
- Gráficos e visualizações
- Filtros de período
- Exportação de dados (opcional)

**Seções:**
1. **Visão Geral**
   - Total de visitas
   - Visitantes únicos
   - Tempo médio na página
   - Taxa de rejeição
   - Gráfico de visitas ao longo do tempo

2. **Páginas Mais Visitadas**
   - Lista de páginas com número de visualizações
   - Tempo médio por página
   - Taxa de saída

3. **Cliques**
   - Elementos mais clicados
   - Distribuição de cliques por tipo
   - Mapa de calor (opcional)

4. **Fluxo de Navegação**
   - Fluxograma de navegação
   - Páginas de entrada
   - Páginas de saída
   - Caminhos mais comuns

5. **Dispositivos e Navegadores**
   - Distribuição por dispositivo (desktop/mobile/tablet)
   - Navegadores mais usados
   - Sistemas operacionais

6. **Geografia**
   - Visitantes por país/cidade
   - Mapa de calor geográfico

7. **Tempo Real**
   - Visitantes online agora
   - Páginas sendo visualizadas agora

### 3. Integração no Dashboard
- Adicionar nova aba "Estatísticas" no menu lateral
- Restringir acesso apenas para `role === 'admin' || role === 'root'`
- Integrar componente Statistics no Dashboard

### 4. Script de Tracking Global
- Adicionar tracking automático em todas as páginas
- Rastrear cliques em botões e links importantes
- Rastrear tempo na página
- Detectar quando usuário sai da página

## 📋 Fases de Implementação

### **Fase 1: Banco de Dados e Backend Básico** ⏱️ ~2-3 horas
- [ ] Criar tabelas no banco de dados
- [ ] Criar `api/tracking.php` com endpoints básicos
- [ ] Criar `api/statistics.php` com endpoints de consulta
- [ ] Implementar validação de permissões (admin/root)
- [ ] Testar endpoints com Postman/curl

### **Fase 2: Sistema de Tracking no Frontend** ⏱️ ~2-3 horas
- [ ] Criar hook `useTracking.ts`
- [ ] Implementar rastreamento de visualizações
- [ ] Implementar rastreamento de cliques
- [ ] Implementar gerenciamento de sessão
- [ ] Adicionar tracking em componentes principais (Hero, CTA, Footer, etc)
- [ ] Testar coleta de dados

### **Fase 3: Dashboard de Estatísticas** ⏱️ ~4-5 horas
- [ ] Criar componente `Statistics.tsx`
- [ ] Implementar seção "Visão Geral"
- [ ] Implementar gráficos (usar biblioteca como Chart.js ou Recharts)
- [ ] Implementar filtros de período
- [ ] Adicionar aba no Dashboard
- [ ] Implementar controle de acesso (admin/root)

### **Fase 4: Estatísticas Avançadas** ⏱️ ~3-4 horas
- [ ] Implementar seção "Páginas Mais Visitadas"
- [ ] Implementar seção "Cliques"
- [ ] Implementar seção "Fluxo de Navegação"
- [ ] Implementar seção "Dispositivos"
- [ ] Implementar seção "Geografia" (básica, sem API externa inicialmente)

### **Fase 5: Melhorias e Otimizações** ⏱️ ~2 horas
- [ ] Implementar cache de estatísticas (opcional)
- [ ] Otimizar queries do banco de dados
- [ ] Adicionar exportação de dados (CSV/PDF)
- [ ] Melhorar UI/UX do dashboard
- [ ] Adicionar loading states e tratamento de erros

## 🔒 Segurança e Privacidade

1. **LGPD/GDPR Compliance:**
   - Não coletar dados pessoais identificáveis sem consentimento
   - IPs podem ser anonimizados (últimos octetos)
   - Permitir opt-out de tracking

2. **Proteção de Dados:**
   - Validar e sanitizar todos os inputs
   - Proteger endpoints com autenticação
   - Rate limiting para prevenir abuso

3. **Performance:**
   - Tracking assíncrono (não bloquear carregamento da página)
   - Batch de eventos (enviar múltiplos eventos de uma vez)
   - Limpeza periódica de dados antigos (opcional)

## 📊 Métricas Principais

1. **Visitas e Visitantes:**
   - Total de visitas
   - Visitantes únicos (por IP ou sessão)
   - Visitantes recorrentes vs novos

2. **Engajamento:**
   - Tempo médio na página
   - Páginas por sessão
   - Taxa de rejeição
   - Taxa de conversão (cliques em CTA)

3. **Navegação:**
   - Páginas mais visitadas
   - Caminhos de navegação
   - Páginas de entrada/saída
   - Tempo médio por página

4. **Interações:**
   - Cliques em botões/links
   - Elementos mais clicados
   - Taxa de clique por elemento

5. **Técnico:**
   - Distribuição por dispositivo
   - Navegadores e sistemas operacionais
   - Origem do tráfego (referrer)

## 🚀 Próximos Passos

1. **Aprovação do Plano:** Revisar e aprovar este plano
2. **Início da Fase 1:** Criar estrutura do banco de dados
3. **Testes Incrementais:** Testar cada fase antes de avançar
4. **Deploy Gradual:** Implementar em produção gradualmente

## 📝 Notas Técnicas

- **Biblioteca de Gráficos:** Sugestão: Recharts (React) ou Chart.js
- **Detecção de Dispositivo:** Usar User-Agent parsing (biblioteca como `ua-parser-js`)
- **Geolocalização:** Inicialmente básica (pode melhorar com API como MaxMind GeoIP2)
- **Sessões:** Usar cookies ou localStorage para manter sessão entre páginas
- **Performance:** Considerar usar Web Workers para processamento pesado de tracking

## ⚠️ Considerações Importantes

1. **Impacto na Performance:** Tracking deve ser leve e não afetar a experiência do usuário
2. **Volume de Dados:** Com o tempo, o banco pode crescer. Considerar arquivamento de dados antigos
3. **Privacidade:** Garantir conformidade com LGPD
4. **Escalabilidade:** Se o site crescer muito, considerar soluções como Google Analytics ou Plausible como alternativa

---

**Tempo Total Estimado:** ~13-17 horas de desenvolvimento
**Prioridade:** Média-Alta
**Complexidade:** Média

