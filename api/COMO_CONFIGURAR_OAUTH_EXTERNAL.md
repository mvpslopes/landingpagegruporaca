# 🔧 Como Configurar OAuth Consent Screen como "External"

## 🎯 Problema
O erro **403: org_internal** ocorre quando o OAuth Consent Screen está configurado como **"Internal"** (apenas para usuários da organização), mas você está tentando autorizar com uma conta pessoal do Gmail.

## ✅ Solução 1: Usar Conta do Google Workspace (Recomendado)

### Passos:
1. Faça login com uma conta do Google Workspace do domínio `gruporaca.app.br`
   - Exemplo: `admin@gruporaca.app.br` ou `seuemail@gruporaca.app.br`
2. Acesse: `https://gruporaca.app.br/api/oauth-drive-simple.php`
3. Autorize o acesso

**Vantagem:** Mais seguro, apenas usuários da organização podem autorizar.

---

## ✅ Solução 2: Configurar como "External" (Público)

Se você precisa autorizar com contas pessoais do Gmail:

### Passo 1: Acessar Google Cloud Console
1. Acesse: https://console.cloud.google.com/
2. Selecione o projeto do Grupo Raça
3. Vá em **"APIs & Services"** > **"OAuth consent screen"**

### Passo 2: Alterar Tipo de Usuário
1. Na seção **"User type"**, clique em **"EDIT APP"**
2. Altere de **"Internal"** para **"External"**
3. Clique em **"SAVE AND CONTINUE"**

### Passo 3: Configurar Informações do App
1. **App name:** Grupo Raça Drive
2. **User support email:** Seu email do Google Workspace
3. **Developer contact information:** Seu email
4. Clique em **"SAVE AND CONTINUE"**

### Passo 4: Adicionar Escopos
1. Os escopos já devem estar configurados:
   - `https://www.googleapis.com/auth/drive`
   - `https://www.googleapis.com/auth/drive.file`
2. Clique em **"SAVE AND CONTINUE"**

### Passo 5: Adicionar Usuários de Teste (IMPORTANTE)
1. Na seção **"Test users"**, clique em **"ADD USERS"**
2. Adicione os emails que podem autorizar:
   - `marcusviniciuspsl9013@gmail.com` (sua conta pessoal)
   - Qualquer outra conta que precise autorizar
3. Clique em **"ADD"**
4. Clique em **"SAVE AND CONTINUE"**

### Passo 6: Revisar e Publicar
1. Revise todas as configurações
2. Clique em **"BACK TO DASHBOARD"**
3. **IMPORTANTE:** Se o app estiver em modo "Testing", apenas os usuários de teste poderão autorizar
4. Para produção, você precisará enviar o app para revisão do Google

### Passo 7: Testar
1. Faça logout do Google (se estiver logado)
2. Acesse: `https://gruporaca.app.br/api/oauth-drive-simple.php`
3. Faça login com a conta pessoal adicionada como usuário de teste
4. Autorize o acesso

---

## ⚠️ Importante

### Modo "Testing" vs "In Production"
- **Testing:** Apenas usuários de teste podem autorizar (máximo 100 usuários)
- **In Production:** Qualquer usuário pode autorizar (requer revisão do Google)

### Para Produção:
1. O app precisa estar em modo "In Production"
2. Requer revisão do Google (pode levar alguns dias)
3. O Google verifica se o app segue as políticas

### Para Desenvolvimento/Teste:
- Use modo "Testing" com usuários de teste
- Não requer revisão
- Funciona imediatamente

---

## 🔒 Recomendação

**Para uso interno da empresa, recomendo:**
- Manter como "Internal" (mais seguro)
- Usar apenas contas do Google Workspace (`@gruporaca.app.br`)
- Não permitir contas pessoais do Gmail

**Para permitir contas pessoais:**
- Mudar para "External"
- Adicionar usuários de teste
- Ou enviar para revisão do Google (produção)

---

## 📝 Notas

- Mudanças no OAuth Consent Screen podem levar alguns minutos para propagar
- Se ainda der erro após mudar, limpe o cache do navegador
- Usuários de teste precisam ser adicionados manualmente

