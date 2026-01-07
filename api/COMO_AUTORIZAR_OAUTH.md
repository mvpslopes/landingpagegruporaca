# 🔐 Como Autorizar o Google Drive OAuth

## 📋 Passo a Passo Completo

### 1. **Acessar a Página de Autorização**

Acesse no navegador (use uma conta Google REAL do Google Workspace):
```
https://gruporaca.app.br/api/oauth-drive-simple.php
```

**IMPORTANTE:** 
- Você precisa estar **logado no sistema interno** primeiro (como Root ou Admin)
- Use uma conta Google **REAL** do Google Workspace (ex: `admin@gruporaca.app.br` ou similar)

---

### 2. **O que Acontece**

1. **Sistema verifica se você está logado**
   - Se não estiver, mostra página para fazer login
   - Se estiver, continua

2. **Redirecionamento para Google**
   - Você será redirecionado automaticamente para o Google
   - URL será algo como: `https://accounts.google.com/o/oauth2/auth?...`

3. **Tela de Autorização do Google**
   - O Google mostra uma tela pedindo permissão
   - Texto: "Grupo Raça Drive quer acessar sua conta do Google"
   - Mostra os escopos solicitados (acesso ao Google Drive)

4. **Escolher Conta Google**
   - ⚠️ **ESCOLHA UMA CONTA REAL DO GOOGLE WORKSPACE**
   - Exemplo: `admin@gruporaca.app.br` ou `seuemail@gruporaca.app.br`
   - **NÃO use** a conta fictícia do sistema (`marcus@gruporaca.com.br`)

5. **Autorizar**
   - Clique em **"Permitir"** ou **"Allow"**
   - O Google processa a autorização

6. **Redirecionamento de Volta**
   - Você será redirecionado de volta para: `https://gruporaca.app.br/api/oauth-drive-simple.php?code=...`
   - O sistema processa o código e salva o token

7. **Mensagem de Sucesso**
   - Você verá: `{"success": true, "message": "Autenticação Google Drive realizada com sucesso!"}`
   - O token foi salvo no arquivo `api/data/oauth_drive_token.json`

---

## ✅ Qual Conta Google Usar?

### ✅ **USE (Recomendado):**
- Conta real do Google Workspace: `admin@gruporaca.app.br`
- Conta real do Google Workspace: `seuemail@gruporaca.app.br`
- Qualquer conta real do Google Workspace que tenha acesso ao Google Drive

### ❌ **NÃO USE:**
- Conta fictícia do sistema: `marcus@gruporaca.com.br` (não existe no Google)
- Conta pessoal do Gmail (se não tiver acesso ao Shared Drive)

---

## 🔑 Requisitos da Conta

A conta Google que você usar para autorizar precisa:

1. **Ter acesso ao Google Drive**
2. **Ter acesso à pasta GRUPO_RACA** (ou você precisa compartilhar depois)
3. **Ser uma conta real** (não fictícia)

---

## 📝 Processo Completo

### Passo 1: Fazer Login no Sistema
```
1. Acesse: https://gruporaca.app.br/login
2. Faça login como Root ou Admin
3. Use: marcus@gruporaca.com.br (ou outra conta do sistema)
```

### Passo 2: Autorizar Google Drive
```
1. Acesse: https://gruporaca.app.br/api/oauth-drive-simple.php
2. Você será redirecionado para o Google
3. Na tela do Google, escolha uma conta REAL do Google Workspace
4. Clique em "Permitir"
5. Você será redirecionado de volta
6. Verá mensagem de sucesso
```

### Passo 3: Compartilhar Pasta (Se Necessário)
```
1. Acesse: https://drive.google.com
2. Navegue até a pasta GRUPO_RACA
3. Clique com botão direito → Compartilhar
4. Adicione o email da conta que autorizou
5. Dê permissão: Editor ou Gerenciador de Conteúdo
```

---

## 🔍 Verificar se Funcionou

Após autorizar, teste:

1. **Verificar token:**
   ```
   https://gruporaca.app.br/api/verificar-sessao-oauth.php
   ```
   Deve mostrar: ✓ Token OAuth encontrado

2. **Testar acesso:**
   ```
   https://gruporaca.app.br/api/verificar-acesso-drive.php
   ```
   Deve mostrar: ✓ Pasta Acessível

3. **Usar o sistema:**
   - Acesse o sistema normalmente
   - Tente fazer upload de um arquivo
   - Deve funcionar sem erros

---

## ⚠️ Importante

- **Uma única autorização** serve para todos os usuários
- **Não precisa autorizar** cada usuário individualmente
- **Token fica salvo** no servidor (arquivo)
- **Funciona em qualquer computador** após autorizar

---

## 🆘 Problemas Comuns

### "Erro 403: org_internal"
- **Causa:** OAuth Consent Screen está como "Internal"
- **Solução:** Use conta do Google Workspace (`@gruporaca.app.br`)

### "Token não encontrado"
- **Causa:** Autorização não foi concluída
- **Solução:** Autorize novamente seguindo os passos acima

### "Sem acesso à pasta"
- **Causa:** Conta que autorizou não tem acesso à pasta GRUPO_RACA
- **Solução:** Compartilhe a pasta com a conta que autorizou

---

## 📞 Resumo Rápido

1. **Login no sistema** (conta fictícia OK)
2. **Acessar** `/api/oauth-drive-simple.php`
3. **Autorizar com conta REAL** do Google Workspace
4. **Compartilhar pasta** com a conta que autorizou
5. **Pronto!** Todos os usuários podem usar

