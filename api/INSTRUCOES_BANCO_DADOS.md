# 📋 Instruções para Configurar o Banco de Dados MySQL

## 🎯 Sugestões de Nomes e Senhas

### **Nome do Banco de Dados:**
```
u179630068_gruporaca_db
```
*Use o prefixo fornecido pela Hostinger (u179630068_) + nome descritivo*

### **Nome do Usuário:**
```
u179630068_gruporaca_user
```
*Mesmo padrão: prefixo + nome descritivo*

### **Senha do Banco:**
**Sugestão de senha forte:**
```
Gr@up0R@c@2024!DB#Secure
```

**Ou gere uma senha aleatória:**
- Mínimo 16 caracteres
- Inclua letras maiúsculas, minúsculas, números e símbolos
- Não use informações pessoais

---

## 📝 Passo a Passo

### 1. **Criar o Banco de Dados na Hostinger**

1. Acesse o **hPanel** da Hostinger
2. Vá em **Bancos de Dados MySQL**
3. Clique em **Criar Novo Banco de Dados**
4. Preencha:
   - **Nome do Banco:** `gruporaca_db` (o prefixo será adicionado automaticamente)
   - **Usuário:** `gruporaca_user` (o prefixo será adicionado automaticamente)
   - **Senha:** Use a senha forte sugerida acima
5. Clique em **Criar**

**Anote:**
- Nome completo do banco: `u179630068_gruporaca_db`
- Usuário completo: `u179630068_gruporaca_user`
- Senha: (a que você criou)

---

### 2. **Importar a Estrutura do Banco**

1. Acesse o **phpMyAdmin** na Hostinger
2. Selecione o banco criado (`u179630068_gruporaca_db`)
3. Vá na aba **SQL**
4. Copie e cole o conteúdo do arquivo `api/database.sql`
5. Clique em **Executar**

**OU** importe diretamente:
1. Vá na aba **Importar**
2. Selecione o arquivo `api/database.sql`
3. Clique em **Executar**

---

### 3. **Configurar a Conexão PHP**

1. Abra o arquivo `api/db_config.php`
2. Atualize as seguintes linhas:

```php
define('DB_HOST', 'localhost'); // Ou o host fornecido pela Hostinger
define('DB_NAME', 'u179630068_gruporaca_db'); // Nome completo do banco
define('DB_USER', 'u179630068_gruporaca_user'); // Usuário completo
define('DB_PASS', 'SUA_SENHA_AQUI'); // Senha que você criou
```

**Exemplo:**
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'u179630068_gruporaca_db');
define('DB_USER', 'u179630068_gruporaca_user');
define('DB_PASS', 'Gr@up0R@c@2024!DB#Secure');
```

---

### 4. **Testar a Conexão**

Crie um arquivo temporário `api/test-connection.php`:

```php
<?php
require_once 'db_config.php';

$result = testConnection();
echo json_encode($result, JSON_PRETTY_PRINT);
?>
```

Acesse via navegador: `https://seudominio.com/api/test-connection.php`

Se aparecer `{"success":true,"message":"Conexão estabelecida com sucesso"}`, está funcionando!

**⚠️ IMPORTANTE:** Delete o arquivo `test-connection.php` após testar por segurança.

---

### 5. **Alterar Senhas dos Usuários**

Após o primeiro login, altere as senhas padrão:

1. Faça login como ROOT (`marcus@gruporaca.com.br` / `password`)
2. Use o sistema de gerenciamento de usuários
3. Ou altere diretamente no banco:

```sql
-- Gerar novo hash (use o script generate-password.php)
UPDATE users 
SET password = '$2y$10$NOVO_HASH_AQUI' 
WHERE email = 'marcus@gruporaca.com.br';
```

---

## 🔒 Segurança

### **Boas Práticas:**

1. ✅ Use senhas fortes (mínimo 16 caracteres)
2. ✅ Não compartilhe credenciais do banco
3. ✅ Mantenha o arquivo `db_config.php` fora do acesso público
4. ✅ Use conexões SSL se disponível
5. ✅ Faça backups regulares do banco
6. ✅ Monitore os logs de auditoria

### **Proteção do Arquivo de Configuração:**

Adicione no `.htaccess` da pasta `api/`:

```apache
<Files "db_config.php">
    Require all denied
</Files>
```

---

## 📊 Estrutura das Tabelas

### **users**
- Armazena todos os usuários do sistema
- Campos: id, email, password (hash), name, role, folder, permissions (JSON)

### **files**
- Armazena metadados dos arquivos (quando integrar Google Drive)
- Campos: id, drive_file_id, name, folder, size, mime_type, etc.

### **sessions**
- Gerencia sessões ativas (opcional, pode usar sessões PHP nativas)

### **audit_log**
- Registra todas as ações importantes
- Campos: user_id, action, resource_type, resource_id, details, ip_address

---

## ✅ Checklist

- [ ] Banco de dados criado na Hostinger
- [ ] Usuário do banco criado
- [ ] Senha forte definida
- [ ] Estrutura SQL importada
- [ ] `db_config.php` configurado
- [ ] Conexão testada
- [ ] Arquivo `test-connection.php` deletado
- [ ] Senhas padrão alteradas
- [ ] `.htaccess` configurado para proteger `db_config.php`

---

## 🆘 Troubleshooting

### **Erro: "Access denied"**
- Verifique usuário e senha no `db_config.php`
- Confirme que o usuário tem permissões no banco

### **Erro: "Unknown database"**
- Verifique o nome do banco no `db_config.php`
- Confirme que o banco foi criado corretamente

### **Erro: "Connection refused"**
- Verifique o `DB_HOST` (pode ser diferente de 'localhost' na Hostinger)
- Consulte a documentação da Hostinger para o host correto

### **Erro: "Table doesn't exist"**
- Execute o script SQL novamente
- Verifique se todas as tabelas foram criadas

---

**Última atualização:** 2024-01-XX

