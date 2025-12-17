# 📊 Comparação: Versão 1 vs Versão 2 do Banco de Dados

## 🔄 Mudanças Principais

### **Tabela `files` - Melhorias**

| Campo | Versão 1 | Versão 2 | Motivo |
|-------|----------|----------|--------|
| `drive_file_id` | `NOT NULL` | `DEFAULT NULL` | Permite trabalhar antes do Google Drive estar configurado |
| `uploaded_by_name` | ❌ Não existe | ✅ Adicionado | Cache do nome (evita JOIN, melhora performance) |
| `description` | ❌ Não existe | ✅ Adicionado | Descrição do arquivo (mencionado nos documentos) |
| `animal_name` | ❌ Não existe | ✅ Adicionado | Usado no formulário de upload do frontend |
| `animal_id` | ❌ Não existe | ✅ Adicionado | Usado no formulário de upload do frontend |
| `deleted_at` | ❌ Não existe | ✅ Adicionado | Soft delete com timestamp (mais flexível) |
| Índices | Básicos | ✅ Melhorados | Índices para `animal_name`, `animal_id`, `deleted_at` |
| Fulltext | Apenas `name` | ✅ `name` + `description` | Busca melhorada |

### **Tabela `audit_log` - Melhorias**

| Melhoria | Versão 1 | Versão 2 |
|----------|----------|----------|
| Índice composto | ❌ | ✅ `idx_resource` (`resource_type`, `resource_id`) |

### **Tabela `sessions` - Status**

| Status | Observação |
|--------|-----------|
| Mantida | Pode ser removida se usar apenas sessões PHP nativas |

---

## ✅ Vantagens da Versão 2

1. **Compatibilidade com Frontend**
   - Campos `animal_name` e `animal_id` já usados no formulário
   - `uploaded_by_name` evita JOIN desnecessário

2. **Flexibilidade**
   - `drive_file_id` pode ser NULL (trabalha antes do Google Drive)
   - `deleted_at` permite recuperação de arquivos

3. **Performance**
   - Mais índices = buscas mais rápidas
   - Cache de nome do usuário = menos JOINs
   - Fulltext em descrição = busca melhorada

4. **Funcionalidades**
   - Campo `description` para descrições detalhadas
   - Soft delete com timestamp para auditoria

---

## 📋 Recomendação

**Use a Versão 2 (`database_v2.sql`)** porque:

✅ Já está alinhada com o frontend  
✅ Permite trabalhar antes do Google Drive  
✅ Melhor performance  
✅ Mais funcionalidades  
✅ Mais flexível para futuras expansões  

---

## 🔄 Como Migrar (se já criou a Versão 1)

Se você já criou as tabelas com a Versão 1, execute este SQL para atualizar:

```sql
-- Adicionar novos campos
ALTER TABLE `files` 
  MODIFY `drive_file_id` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN `uploaded_by_name` VARCHAR(255) DEFAULT NULL AFTER `uploaded_by`,
  ADD COLUMN `description` TEXT DEFAULT NULL AFTER `uploaded_at`,
  ADD COLUMN `animal_name` VARCHAR(255) DEFAULT NULL AFTER `description`,
  ADD COLUMN `animal_id` VARCHAR(50) DEFAULT NULL AFTER `animal_name`,
  ADD COLUMN `deleted_at` TIMESTAMP NULL DEFAULT NULL AFTER `active`;

-- Adicionar novos índices
ALTER TABLE `files`
  ADD INDEX `idx_animal_name` (`animal_name`),
  ADD INDEX `idx_animal_id` (`animal_id`),
  ADD INDEX `idx_deleted_at` (`deleted_at`),
  ADD FULLTEXT INDEX `idx_description` (`description`);

-- Adicionar índice composto em audit_log
ALTER TABLE `audit_log`
  ADD INDEX `idx_resource` (`resource_type`, `resource_id`);
```

---

## 🎯 Decisão Final

**Recomendação:** Use `database_v2.sql` diretamente - é a versão completa e otimizada! 🚀

