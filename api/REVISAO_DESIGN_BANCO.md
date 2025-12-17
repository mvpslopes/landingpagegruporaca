# 🔍 Revisão de Design do Banco de Dados

## 📊 Análise da Estrutura Atual

### ✅ **Tabela `users` - OK**
- Todos os campos necessários estão presentes
- Permissões em JSON (flexível)
- Soft delete implementado
- Logs de auditoria

### ⚠️ **Tabela `files` - PRECISA AJUSTES**

#### **Campos Faltando:**
1. **`description`** - Descrição do arquivo (mencionado nos documentos)
2. **`animal_name`** - Nome do animal (usado no frontend)
3. **`animal_id`** - ID do animal (usado no frontend)
4. **`uploaded_by_name`** - Nome do usuário que fez upload (para exibir sem JOIN)

#### **Campos que Precisam Ajuste:**
1. **`drive_file_id`** - Está como `NOT NULL`, mas antes do Google Drive estar configurado, precisamos permitir NULL
2. **`drive_url`** - Pode ser NULL inicialmente
3. **`thumbnail_url`** - Pode ser NULL

### ⚠️ **Tabela `sessions` - OPCIONAL**
- Estamos usando sessões PHP nativas
- Esta tabela pode não ser necessária agora
- Pode ser adicionada depois se precisar de sessões customizadas

### ✅ **Tabela `audit_log` - OK**
- Estrutura adequada para logs

---

## 🔧 Sugestões de Melhorias

### **1. Tabela `files` - Versão Melhorada**

```sql
CREATE TABLE IF NOT EXISTS `files` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `drive_file_id` VARCHAR(255) DEFAULT NULL UNIQUE, -- Permite NULL até Google Drive estar configurado
  `name` VARCHAR(255) NOT NULL,
  `folder` VARCHAR(255) NOT NULL,
  `size` BIGINT(20) UNSIGNED NOT NULL,
  `mime_type` VARCHAR(100) DEFAULT NULL,
  `drive_url` TEXT DEFAULT NULL,
  `thumbnail_url` TEXT DEFAULT NULL,
  `uploaded_by` INT(11) UNSIGNED NOT NULL,
  `uploaded_by_name` VARCHAR(255) DEFAULT NULL, -- Cache do nome do usuário
  `uploaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `description` TEXT DEFAULT NULL, -- Descrição do arquivo
  `animal_name` VARCHAR(255) DEFAULT NULL, -- Nome do animal (se aplicável)
  `animal_id` VARCHAR(50) DEFAULT NULL, -- ID do animal (se aplicável)
  `tags` JSON DEFAULT NULL,
  `metadata` JSON DEFAULT NULL, -- Outros metadados flexíveis
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL, -- Soft delete com timestamp
  PRIMARY KEY (`id`),
  INDEX `idx_folder` (`folder`),
  INDEX `idx_uploaded_by` (`uploaded_by`),
  INDEX `idx_uploaded_at` (`uploaded_at`),
  INDEX `idx_active` (`active`),
  INDEX `idx_animal_name` (`animal_name`), -- Para busca por animal
  INDEX `idx_animal_id` (`animal_id`), -- Para busca por ID do animal
  FULLTEXT INDEX `idx_name` (`name`),
  FULLTEXT INDEX `idx_description` (`description`), -- Busca fulltext em descrição
  FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **2. Índices Adicionais para Performance**

- Índice em `animal_name` para buscas rápidas
- Índice em `animal_id` para buscas por ID
- Fulltext em `description` para buscas de texto

### **3. Soft Delete Melhorado**

- Adicionar campo `deleted_at` para rastrear quando foi deletado
- Permite recuperação de arquivos deletados

---

## 📋 Checklist de Decisões

### **Antes de Criar as Tabelas, Decida:**

- [ ] **Sessões:** Vamos usar tabela `sessions` ou sessões PHP nativas?
  - **Recomendação:** Sessões PHP nativas (mais simples, já funciona)

- [ ] **Campos de Animal:** Precisamos de `animal_name` e `animal_id`?
  - **Recomendação:** SIM (já está sendo usado no frontend)

- [ ] **Descrição:** Precisamos de campo `description`?
  - **Recomendação:** SIM (mencionado nos documentos)

- [ ] **Cache de Nome:** Precisamos de `uploaded_by_name`?
  - **Recomendação:** SIM (evita JOIN em listagens)

- [ ] **Soft Delete:** Usar `deleted_at` ou apenas `active`?
  - **Recomendação:** Ambos (mais flexível)

- [ ] **Google Drive:** `drive_file_id` pode ser NULL inicialmente?
  - **Recomendação:** SIM (até integrar Google Drive)

---

## 🎯 Versão Final Recomendada

Vou criar uma versão otimizada do SQL com todas as melhorias sugeridas.

