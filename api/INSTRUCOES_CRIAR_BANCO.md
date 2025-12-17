# 📋 Instruções para Criar o Banco de Dados no Novo Domínio

## 🎯 Objetivo
Criar o banco de dados MySQL e todas as tabelas necessárias para o sistema no novo domínio `gruporaca.app.br`.

---

## 📝 Passo a Passo

### 1️⃣ Criar o Banco de Dados na Hostinger

1. **Acesse o painel hPanel da Hostinger**
   - Faça login no seu painel de controle

2. **Vá em "Bancos de Dados MySQL"**
   - Procure pela seção de bancos de dados

3. **Clique em "Criar Banco de Dados"**
   - Preencha os campos:
     - **Nome do banco**: `gruporaca_db` (a Hostinger adicionará o prefixo automaticamente)
     - **Usuário**: `gruporaca_user` (a Hostinger adicionará o prefixo automaticamente)
     - **Senha**: Crie uma senha segura e anote!

4. **Anote as informações completas:**
   ```
   Nome do banco: u[numero]_gruporaca_db
   Usuário: u[numero]_gruporaca_user
   Senha: [sua_senha]
   Host: localhost (geralmente)
   ```

---

### 2️⃣ Configurar as Credenciais no Código

**Opção A - Usar o script web (Recomendado):**
1. Após fazer o deploy, acesse:
   ```
   https://gruporaca.app.br/mvpslopes/landingpagegruporaca/api/configurar-banco.php?config=1
   ```
2. Preencha as credenciais do banco
3. Clique em "Salvar e Testar Conexão"

**Opção B - Editar manualmente:**
1. Edite o arquivo `api/db_config.php`
2. Localize as linhas 28-30 (configuração para gruporaca.app.br)
3. Substitua:
   ```php
   define('DB_NAME', 'u[numero]_gruporaca_db'); // Substitua [numero]
   define('DB_USER', 'u[numero]_gruporaca_user'); // Substitua [numero]
   define('DB_PASS', 'SUA_SENHA_AQUI'); // Substitua pela senha
   ```

---

### 3️⃣ Criar as Tabelas no Banco

1. **Acesse o phpMyAdmin da Hostinger**
   - No hPanel, vá em "phpMyAdmin"
   - Faça login com as credenciais do banco criado

2. **Selecione o banco de dados**
   - No menu lateral, clique no nome do banco criado

3. **Abra a aba "SQL"**
   - Clique na aba "SQL" no topo

4. **Execute o script SQL**
   - Abra o arquivo `api/CRIAR_BANCO_NOVO_DOMINIO.sql`
   - **IMPORTANTE**: Antes de executar, substitua `[NOME_DO_BANCO]` pelo nome real do banco
   - Cole o conteúdo completo no campo SQL
   - Clique em "Executar"

---

### 4️⃣ Verificar se Tudo Foi Criado

Execute estas queries no phpMyAdmin para verificar:

```sql
-- Ver todas as tabelas
SHOW TABLES;

-- Verificar usuários criados
SELECT id, email, name, role, active FROM users;

-- Verificar estrutura da tabela users
DESCRIBE users;
```

**Resultado esperado:**
- ✅ 4 tabelas criadas: `users`, `files`, `sessions`, `audit_log`
- ✅ 6 usuários criados (1 root + 5 admins)
- ✅ Estrutura das tabelas correta

---

### 5️⃣ Testar a Conexão

1. **Acesse o script de teste:**
   ```
   https://gruporaca.app.br/mvpslopes/landingpagegruporaca/api/test-db-connection.php
   ```

2. **Verifique se aparece:**
   - ✅ Conexão estabelecida com sucesso
   - ✅ Informações do banco corretas

---

## 🔐 Credenciais dos Usuários

**Senha padrão para TODOS os usuários:**
```
Gr@up0R@c@2024!M@rcus#Secure
```

**Usuários criados:**

| Email | Nome | Role |
|-------|------|------|
| marcus@gruporaca.com.br | Marcus Lopes | root |
| thaty@gruporaca.com.br | Thaty | admin |
| lara@gruporaca.com.br | Lara | admin |
| ana@gruporaca.com.br | Ana Beatriz | admin |
| larissa@gruporaca.com.br | Larissa Mendes | admin |
| ariane@gruporaca.com.br | Ariane Andrade | admin |

---

## ⚠️ Importante

1. **Altere as senhas** após o primeiro login (quando implementar essa funcionalidade)
2. **Mantenha as credenciais seguras** - não compartilhe em locais públicos
3. **Faça backup regular** do banco de dados
4. **Teste a conexão** antes de fazer o deploy final

---

## 🐛 Solução de Problemas

### Erro: "Table doesn't exist"
- Verifique se executou o script SQL completo
- Confirme que selecionou o banco correto antes de executar

### Erro: "Access denied"
- Verifique se as credenciais no `db_config.php` estão corretas
- Confirme que o usuário tem permissões no banco

### Erro: "Unknown database"
- Verifique se o nome do banco está correto
- Confirme que o banco foi criado na Hostinger

---

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs de erro do PHP
2. Teste a conexão usando `test-db-connection.php`
3. Entre em contato com o suporte da Hostinger se necessário

