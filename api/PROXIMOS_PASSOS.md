# ✅ Próximos Passos - Banco de Dados Configurado

## 🎯 Status Atual

✅ **Banco de dados criado:**
- Nome: `u179630068_gruporaca_db`
- Usuário: `u179630068_gruporaca_user`
- Senha: Configurada no `db_config.php`

---

## 📋 Passo 1: Importar Estrutura do Banco

### **Via phpMyAdmin (Recomendado):**

1. Acesse o **phpMyAdmin** na Hostinger:
   - No painel, clique em **"Enter phpMyAdmin"** ao lado do banco
   - Ou acesse: `https://seudominio.com/phpmyadmin`

2. Selecione o banco `u179630068_gruporaca_db` no menu lateral

3. Vá na aba **"SQL"** no topo

4. Copie TODO o conteúdo do arquivo `api/database.sql`

5. Cole no campo SQL do phpMyAdmin

6. Clique em **"Executar"** ou **"Go"**

7. Verifique se apareceu a mensagem de sucesso e se as 4 tabelas foram criadas:
   - ✅ `users`
   - ✅ `files`
   - ✅ `sessions`
   - ✅ `audit_log`

---

## 🧪 Passo 2: Testar Conexão

1. Acesse via navegador:
   ```
   https://todaarte.com.br/api/test-connection.php
   ```

2. Deve aparecer:
   ```json
   {
     "success": true,
     "message": "Conexão estabelecida com sucesso"
   }
   ```

3. ⚠️ **IMPORTANTE:** Se funcionou, **DELETE** o arquivo `test-connection.php` por segurança!

---

## 🔐 Passo 3: Verificar Senha

Se a senha que você criou no banco for **diferente** da que está no `db_config.php`:

1. Abra o arquivo `api/db_config.php`
2. Atualize a linha:
   ```php
   define('DB_PASS', 'SUA_SENHA_REAL_AQUI');
   ```
3. Salve o arquivo

---

## ✅ Passo 4: Verificar Usuários Inseridos

1. No phpMyAdmin, selecione o banco `u179630068_gruporaca_db`
2. Clique na tabela `users`
3. Vá na aba **"Browse"** ou **"Procurar"**
4. Deve aparecer 6 usuários:
   - Marcus Lopes (ROOT)
   - Thaty (ADMIN)
   - Lara (ADMIN)
   - Ana Beatriz (ADMIN)
   - Larissa Mendes (ADMIN)
   - Ariane Andrade (ADMIN)

**Senha padrão de todos:** `password`

---

## 🚀 Passo 5: Testar o Sistema

1. Acesse a página do Banco de Dados no site
2. Faça login com:
   - Email: `marcus@gruporaca.com.br`
   - Senha: `password`
3. Teste as funcionalidades:
   - ✅ Login/Logout
   - ✅ Visualizar interface
   - ✅ Gerenciar usuários (ROOT)
   - ✅ Criar novo usuário

---

## 🔒 Passo 6: Segurança (Importante!)

### **1. Deletar arquivo de teste:**
```bash
# Delete o arquivo:
api/test-connection.php
```

### **2. Alterar senhas padrão:**
Após o primeiro login, altere as senhas de todos os usuários.

### **3. Verificar proteção:**
O arquivo `api/db_config.php` já está protegido pelo `.htaccess`, mas verifique se está funcionando.

---

## 📊 Estrutura Criada

### **Tabelas:**
- ✅ `users` - 6 usuários inseridos
- ✅ `files` - Pronta para receber arquivos do Google Drive
- ✅ `sessions` - Gerenciamento de sessões
- ✅ `audit_log` - Log de auditoria

### **Usuários Iniciais:**
- ✅ ROOT: Marcus Lopes
- ✅ ADMIN: Thaty, Lara, Ana Beatriz, Larissa Mendes, Ariane Andrade

---

## ⚠️ Problemas Comuns

### **Erro: "Access denied"**
- Verifique se a senha no `db_config.php` está correta
- Confirme que o usuário tem permissões no banco

### **Erro: "Table doesn't exist"**
- Execute o script SQL novamente
- Verifique se todas as tabelas foram criadas

### **Erro: "Connection refused"**
- Na Hostinger, o host pode ser diferente de 'localhost'
- Verifique na documentação da Hostinger qual é o host correto
- Pode ser algo como: `mysql.hostinger.com` ou um IP específico

---

## ✅ Checklist Final

- [ ] Estrutura SQL importada no phpMyAdmin
- [ ] 4 tabelas criadas (users, files, sessions, audit_log)
- [ ] 6 usuários inseridos na tabela users
- [ ] Conexão testada com sucesso
- [ ] Arquivo `test-connection.php` deletado
- [ ] Senha no `db_config.php` está correta
- [ ] Login testado no sistema
- [ ] Funcionalidades básicas testadas

---

**Pronto!** O sistema está configurado e pronto para uso! 🎉

