# ✅ Como Validar o Banco de Dados

## 🎯 Método 1: Script de Validação Automática (Recomendado)

### **Passo a Passo:**

1. **Acesse via navegador:**
   ```
   https://todaarte.com.br/api/validate-database.php
   ```

2. **O script vai verificar:**
   - ✅ Se todas as 4 tabelas existem
   - ✅ Se todos os campos estão corretos
   - ✅ Se os índices foram criados
   - ✅ Se os usuários iniciais foram inseridos
   - ✅ Se as Foreign Keys estão configuradas
   - ✅ Se o charset está correto

3. **Resultado:**
   - ✅ **Verde** = Tudo OK
   - ⚠️ **Amarelo** = Avisos (não críticos)
   - ❌ **Vermelho** = Erros (precisa corrigir)

4. **⚠️ IMPORTANTE:** Delete o arquivo `validate-database.php` após validar por segurança!

---

## 🎯 Método 2: Validação Manual no phpMyAdmin

### **1. Verificar Tabelas**

1. Acesse o **phpMyAdmin**
2. Selecione o banco `u179630068_gruporaca_db`
3. Deve aparecer **4 tabelas:**
   - ✅ `users`
   - ✅ `files`
   - ✅ `sessions`
   - ✅ `audit_log`

### **2. Verificar Estrutura da Tabela `users`**

1. Clique na tabela `users`
2. Vá na aba **"Estrutura"**
3. Deve ter os campos:
   - ✅ `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
   - ✅ `email` (VARCHAR, UNIQUE)
   - ✅ `password` (VARCHAR)
   - ✅ `name` (VARCHAR)
   - ✅ `role` (ENUM: 'root', 'admin', 'user')
   - ✅ `folder` (VARCHAR)
   - ✅ `permissions` (JSON)
   - ✅ `created_at` (TIMESTAMP)
   - ✅ `created_by` (INT)
   - ✅ `last_login` (TIMESTAMP)
   - ✅ `active` (TINYINT)

### **3. Verificar Estrutura da Tabela `files`**

1. Clique na tabela `files`
2. Vá na aba **"Estrutura"**
3. Deve ter os campos principais:
   - ✅ `id` (PRIMARY KEY)
   - ✅ `drive_file_id` (VARCHAR, pode ser NULL)
   - ✅ `name` (VARCHAR)
   - ✅ `folder` (VARCHAR)
   - ✅ `size` (BIGINT)
   - ✅ `uploaded_by` (INT, FOREIGN KEY)
   - ✅ `uploaded_by_name` (VARCHAR) - **Se tiver = Versão 2**
   - ✅ `animal_name` (VARCHAR) - **Se tiver = Versão 2**
   - ✅ `animal_id` (VARCHAR) - **Se tiver = Versão 2**
   - ✅ `description` (TEXT) - **Se tiver = Versão 2**
   - ✅ `deleted_at` (TIMESTAMP) - **Se tiver = Versão 2**

### **4. Verificar Usuários Iniciais**

1. Clique na tabela `users`
2. Vá na aba **"Procurar"** ou **"Browse"**
3. Deve aparecer **6 usuários:**
   - ✅ Marcus Lopes (ROOT)
   - ✅ Thaty (ADMIN)
   - ✅ Lara (ADMIN)
   - ✅ Ana Beatriz (ADMIN)
   - ✅ Larissa Mendes (ADMIN)
   - ✅ Ariane Andrade (ADMIN)

### **5. Verificar Índices**

1. Na tabela `users`, vá em **"Estrutura"** → **"Índices"**
2. Deve ter:
   - ✅ `PRIMARY` (id)
   - ✅ `idx_email` (email)
   - ✅ `idx_role` (role)
   - ✅ `idx_active` (active)

3. Na tabela `files`, verifique:
   - ✅ `PRIMARY` (id)
   - ✅ `idx_folder` (folder)
   - ✅ `idx_uploaded_by` (uploaded_by)
   - ✅ `idx_active` (active)

### **6. Verificar Foreign Keys**

1. Na tabela `files`, vá em **"Estrutura"** → **"Relacionamentos"**
2. Deve ter:
   - ✅ `uploaded_by` → `users.id`

---

## 📊 Checklist de Validação

### **Estrutura:**
- [ ] 4 tabelas criadas (users, files, sessions, audit_log)
- [ ] Tabela `users` com todos os campos
- [ ] Tabela `files` com todos os campos
- [ ] Índices criados corretamente
- [ ] Foreign Keys configuradas

### **Dados:**
- [ ] 6 usuários inseridos
- [ ] 1 usuário ROOT (Marcus Lopes)
- [ ] 5 usuários ADMIN
- [ ] Senhas com hash bcrypt

### **Configuração:**
- [ ] Charset: utf8mb4
- [ ] Engine: InnoDB
- [ ] Campos JSON funcionando

---

## 🔍 SQL para Validação Rápida

Execute no phpMyAdmin na aba **SQL**:

```sql
-- Verificar tabelas
SHOW TABLES;

-- Contar usuários
SELECT COUNT(*) as total FROM users WHERE active = 1;

-- Verificar usuários por role
SELECT role, COUNT(*) as total FROM users GROUP BY role;

-- Verificar estrutura da tabela files
DESCRIBE files;

-- Verificar índices
SHOW INDEX FROM files;
```

---

## ✅ Resultado Esperado

### **Se tudo estiver OK:**
- ✅ 4 tabelas criadas
- ✅ 6 usuários inseridos
- ✅ Todos os campos presentes
- ✅ Índices criados
- ✅ Foreign Keys funcionando

### **Se houver problemas:**
- ❌ Tabelas faltando → Execute o SQL novamente
- ❌ Campos faltando → Verifique se usou a versão correta do SQL
- ❌ Usuários faltando → Execute a parte de INSERT do SQL

---

**Pronto!** Após validar, me informe o resultado! 🎯

