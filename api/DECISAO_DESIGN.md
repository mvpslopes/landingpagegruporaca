# 🎯 Decisão de Design - Antes de Criar as Tabelas

## ✅ **Recomendação: Usar Versão 2 (`database_v2.sql`)**

### **Por quê?**

1. **✅ Alinhada com o Frontend**
   - Campos `animal_name` e `animal_id` já estão sendo usados no formulário de upload
   - `uploaded_by_name` evita fazer JOIN toda vez que listar arquivos

2. **✅ Funciona Antes do Google Drive**
   - `drive_file_id` pode ser NULL
   - Permite testar e desenvolver antes da integração

3. **✅ Melhor Performance**
   - Mais índices = buscas mais rápidas
   - Cache de nome do usuário = menos consultas ao banco

4. **✅ Mais Funcionalidades**
   - Campo `description` para descrições detalhadas
   - Soft delete com `deleted_at` para auditoria completa

---

## 📋 **Checklist de Decisões**

### **✅ Campos Adicionais na Tabela `files`**

- [x] **`animal_name`** - SIM (já usado no frontend)
- [x] **`animal_id`** - SIM (já usado no frontend)
- [x] **`description`** - SIM (mencionado nos documentos)
- [x] **`uploaded_by_name`** - SIM (melhora performance)
- [x] **`deleted_at`** - SIM (soft delete melhorado)

### **✅ Ajustes de Campos**

- [x] **`drive_file_id`** - Permite NULL (até Google Drive estar configurado)
- [x] **Índices adicionais** - Para `animal_name`, `animal_id`, `deleted_at`
- [x] **Fulltext em `description`** - Para buscas melhoradas

### **✅ Tabela `sessions`**

- [x] **Manter** - Pode ser útil no futuro, não atrapalha se não usar

---

## 🚀 **Próximo Passo**

**Use o arquivo:** `api/database_v2.sql`

Este é o SQL completo e otimizado, pronto para importar no phpMyAdmin!

---

## 📊 **Resumo das Mudanças**

| Item | Status |
|------|--------|
| Campos adicionais | ✅ 5 novos campos |
| Índices melhorados | ✅ 4 novos índices |
| Fulltext search | ✅ Expandido |
| Compatibilidade | ✅ Funciona antes do Google Drive |
| Performance | ✅ Otimizada |

---

**Decisão Final:** ✅ **Usar `database_v2.sql`** - Versão completa e otimizada!

