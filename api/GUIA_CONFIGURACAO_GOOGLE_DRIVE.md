# 🚀 Guia Completo: Configuração Google Drive com Shared Drive

## 📋 Pré-requisitos

✅ **Google Workspace ativo** (Business Starter ou superior)  
✅ **Domínio verificado** (`gruporaca.app.br`)  
✅ **Service Account criada** no Google Cloud Console  
✅ **Arquivo de credenciais JSON** da Service Account

---

## 🔧 Passo 1: Verificar Domínio no Google Admin

1. Acesse [Google Admin Console](https://admin.google.com)
2. Se ainda não verificou o domínio:
   - Clique no banner vermelho "Verificar"
   - Adicione os registros DNS conforme instruções:
     - **TXT**: `google-site-verification=...`
     - **CNAME**: `wj2aze45dpff` → `gv-hjetxuewe4cfjq.dv.googlehosted.com`
   - Aguarde a propagação (até 48h, geralmente menos)
   - Volte ao Admin Console e clique em "Verificar" novamente

---

## 📁 Passo 2: Criar Shared Drive

1. Acesse [Google Drive](https://drive.google.com)
2. No menu lateral esquerdo, clique em **"Drives Compartilhados"** (Shared Drives)
3. Clique no botão **"Novo"** (ou **"+"** → **"Novo Shared Drive"**)
4. Nome: **`Grupo Raça - Arquivos`**
5. Clique em **"Criar"**

---

## 👤 Passo 3: Adicionar Service Account ao Shared Drive

1. Dentro do Shared Drive criado, clique no ícone de **"Gerenciar membros"** (pessoas)
2. Clique em **"Adicionar membros"**
3. Digite o email da Service Account:
   ```
   grupo-raca-drive-service@tidal-triumph-481417-g3.iam.gserviceaccount.com
   ```
4. Selecione a permissão: **"Gerenciador de Conteúdo"** (Content Manager)
5. Clique em **"Enviar"**

---

## 📂 Passo 4: Criar Pasta Raiz no Shared Drive

1. Dentro do Shared Drive "Grupo Raça - Arquivos", clique em **"Novo"** → **"Pasta"**
2. Nome: **`GRUPO_RACA`**
3. Clique em **"Criar"**
4. **IMPORTANTE**: Anote o ID da pasta:
   - Clique com botão direito na pasta → **"Obter link"**
   - O link será algo como: `https://drive.google.com/drive/folders/1ABC123xyz...`
   - O ID é a parte após `/folders/`: `1ABC123xyz...`
   - **Copie este ID!** Você precisará dele na configuração

---

## 🔑 Passo 5: Verificar Arquivo de Credenciais

1. Verifique se o arquivo existe:
   ```
   api/config/grupo-raca-drive-credentials.json
   ```
2. Se não existir, baixe do Google Cloud Console:
   - Acesse [Google Cloud Console](https://console.cloud.google.com)
   - Vá em **"IAM & Admin"** → **"Service Accounts"**
   - Clique na Service Account `grupo-raca-drive-service`
   - Aba **"Keys"** → **"Add Key"** → **"Create new key"**
   - Selecione **"JSON"** e baixe
   - Renomeie para `grupo-raca-drive-credentials.json`
   - Faça upload para `api/config/`

---

## ⚙️ Passo 6: Configurar o Sistema

1. Edite o arquivo `api/config/drive_config.php`:
   - Atualize `root_folder_id` com o ID da pasta `GRUPO_RACA` criada no Passo 4
   - Verifique se `credentials_path` aponta para o arquivo JSON correto

2. **Opcional**: Se quiser usar OAuth (upload centralizado):
   - Configure `oauth_client_id` e `oauth_client_secret`
   - Obtenha em: https://console.cloud.google.com/apis/credentials

---

## 🔄 Passo 7: Migrar Código de B2 para Google Drive

Após completar os passos acima, o sistema precisará ser atualizado para usar Google Drive em vez de Backblaze B2.

**Arquivos que precisam ser modificados:**
- `api/files.php` - Trocar `B2Service` por `DriveService`
- `api/create-folder.php` - Trocar `B2Service` por `DriveService`

---

## ✅ Passo 8: Testar Conexão

1. Acesse: `https://gruporaca.app.br/api/test-drive-connection.php`
2. Deve retornar:
   ```json
   {
     "success": true,
     "rootFolder": {
       "id": "1ABC123xyz...",
       "name": "GRUPO_RACA"
     }
   }
   ```

---

## 🆘 Troubleshooting

### Erro: "Service Accounts do not have storage quota"
- ✅ **Solução**: Certifique-se de que a pasta está dentro de um **Shared Drive**
- ✅ Verifique se a Service Account foi adicionada como **"Gerenciador de Conteúdo"**

### Erro: "File not found" ou "Permission denied"
- ✅ Verifique se o `root_folder_id` está correto
- ✅ Verifique se a Service Account tem acesso ao Shared Drive
- ✅ Certifique-se de que a pasta está dentro do Shared Drive, não em "Meu Drive"

### Erro: "Domain not verified"
- ✅ Aguarde até 48h para propagação DNS
- ✅ Verifique se os registros TXT e CNAME estão corretos
- ✅ Use ferramentas como [MXToolbox](https://mxtoolbox.com/TXTLookup.aspx) para verificar

---

## 📝 Checklist Final

- [ ] Domínio verificado no Google Admin
- [ ] Shared Drive criado
- [ ] Service Account adicionada ao Shared Drive
- [ ] Pasta `GRUPO_RACA` criada dentro do Shared Drive
- [ ] ID da pasta `GRUPO_RACA` anotado
- [ ] Arquivo `grupo-raca-drive-credentials.json` em `api/config/`
- [ ] `drive_config.php` atualizado com `root_folder_id`
- [ ] Teste de conexão bem-sucedido

---

## 🎉 Pronto!

Após completar todos os passos, o sistema estará pronto para usar Google Drive com Shared Drive!

