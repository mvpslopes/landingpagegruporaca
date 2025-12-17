# 🔧 Configuração do Banco de Dados para o Novo Domínio

## 📋 Informações Necessárias

Para configurar o banco de dados no novo domínio `gruporaca.app.br`, você precisa das seguintes informações da Hostinger:

### 1. Nome do Banco de Dados
- Formato geral: `u[numero]_[nome]`
- Exemplo: `u179630068_gruporaca_db`

### 2. Usuário do Banco de Dados
- Formato geral: `u[numero]_[nome]`
- Exemplo: `u179630068_gruporaca_user`

### 3. Senha do Banco de Dados
- Senha fornecida pela Hostinger ao criar o banco

### 4. Host do Banco de Dados
- Geralmente: `localhost` (na Hostinger)

---

## 🔍 Como Obter essas Informações na Hostinger

### Opção 1: Painel hPanel
1. Acesse o painel da Hostinger (hPanel)
2. Vá em **Bancos de Dados MySQL**
3. Procure pelo banco criado para `gruporaca.app.br`
4. Anote:
   - **Nome do banco**
   - **Usuário do banco**
   - **Senha** (clique em "Mostrar" se necessário)

### Opção 2: Criar Novo Banco (se ainda não criou)
1. No hPanel, vá em **Bancos de Dados MySQL**
2. Clique em **Criar Banco de Dados**
3. Preencha:
   - **Nome do banco**: `gruporaca_db` (a Hostinger adicionará o prefixo automaticamente)
   - **Usuário**: `gruporaca_user` (a Hostinger adicionará o prefixo automaticamente)
   - **Senha**: Crie uma senha segura
4. Anote todas as informações

---

## 📝 Informações Atuais (Domínio Antigo)

Para referência, as credenciais do domínio antigo eram:

```
DB_NAME: u179630068_gruporaca_db
DB_USER: u179630068_gruporaca_user
DB_PASS: Gr@up0R@c@2024!DB#Secure
```

---

## ⚙️ Próximos Passos

Após obter as novas credenciais:

1. **Atualizar `api/db_config.php`** com as novas credenciais
2. **Criar o banco de dados** usando os scripts SQL disponíveis
3. **Testar a conexão** usando `api/test-db-connection.php`

---

## 📞 Suporte

Se precisar de ajuda para obter as credenciais, entre em contato com o suporte da Hostinger.

