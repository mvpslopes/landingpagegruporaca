# 🔑 Como Criar Service Account do Zero - Google Workspace

## 📋 Pré-requisitos

✅ **Conta Google Workspace ativa** (`gruporaca.app.br`)  
✅ **Acesso ao Google Cloud Console** com a conta do Workspace  
✅ **Verificação em duas etapas ativada** (obrigatório desde 31/12/2025)

---

## 🚀 Passo 1: Acessar Google Cloud Console

1. Acesse: https://console.cloud.google.com
2. **Faça login com a conta do Google Workspace** (ex: `admin@gruporaca.app.br`)
3. Se aparecer mensagem sobre verificação em duas etapas:
   - Acesse: https://myaccount.google.com/security
   - Ative a verificação em duas etapas
   - Aguarde até 60 segundos
   - Volte ao Google Cloud Console

---

## 📁 Passo 2: Criar ou Selecionar Projeto

### Opção A: Criar Novo Projeto (Recomendado)

1. No topo da página, clique no **seletor de projetos** (ao lado do logo do Google Cloud)
2. Clique em **"Novo Projeto"**
3. Preencha:
   - **Nome do projeto**: `Grupo Raca Drive`
   - **Organização**: Selecione `gruporaca.app.br` (se aparecer)
4. Clique em **"Criar"**
5. Aguarde alguns segundos e selecione o projeto criado

### Opção B: Usar Projeto Existente

1. No seletor de projetos, escolha um projeto existente
2. Se não houver nenhum, siga a Opção A

---

## 🔑 Passo 3: Habilitar Google Drive API

1. No menu lateral, vá em **"APIs & Services"** → **"Library"** (Biblioteca)
2. Na busca, digite: **"Google Drive API"**
3. Clique em **"Google Drive API"**
4. Clique em **"Enable"** (Habilitar)
5. Aguarde alguns segundos até aparecer "API enabled"

---

## 👤 Passo 4: Criar Service Account

1. No menu lateral, vá em **"IAM & Admin"** → **"Service Accounts"**
2. Clique em **"Create Service Account"** (Criar Conta de Serviço)
3. Preencha:
   - **Service account name**: `grupo-raca-drive-service`
   - **Service account ID**: Será preenchido automaticamente (algo como `grupo-raca-drive-service@seu-projeto.iam.gserviceaccount.com`)
   - **Description**: `Service Account para gerenciar arquivos no Google Drive Shared Drive`
4. Clique em **"Create and Continue"**

---

## 🔐 Passo 5: Conceder Permissões

1. Na seção **"Grant this service account access to project"**:
   - **Role**: Selecione **"Editor"** ou **"Owner"** (para ter acesso completo)
   - Ou deixe sem role se preferir (pode adicionar depois)
2. Clique em **"Continue"**
3. Na seção **"Grant users access to this service account"**:
   - Pode deixar vazio (não é necessário para nosso caso)
4. Clique em **"Done"**

---

## 📥 Passo 6: Criar e Baixar Chave JSON

1. Na lista de Service Accounts, clique na que você acabou de criar (`grupo-raca-drive-service`)
2. Vá na aba **"Keys"**
3. Clique em **"Add Key"** → **"Create new key"**
4. Selecione o tipo: **"JSON"**
5. Clique em **"Create"**
6. O arquivo JSON será baixado automaticamente
7. **Renomeie o arquivo** para: `grupo-raca-drive-credentials.json`

---

## 📤 Passo 7: Fazer Upload do Arquivo

1. Faça upload do arquivo `grupo-raca-drive-credentials.json` para:
   ```
   api/config/grupo-raca-drive-credentials.json
   ```
2. **IMPORTANTE**: Este arquivo contém credenciais sensíveis
   - Não compartilhe publicamente
   - Não faça commit no Git
   - Mantenha seguro

---

## 🗂️ Passo 8: Adicionar Service Account ao Shared Drive

1. Acesse [Google Drive](https://drive.google.com)
2. No menu lateral, clique em **"Drives Compartilhados"** (Shared Drives)
3. Abra o Shared Drive **"Grupo Raça - Arquivos"** (ou crie um novo se não existir)
4. Clique no ícone de **"Gerenciar membros"** (pessoas) no topo
5. Clique em **"Adicionar membros"**
6. Digite o **email da Service Account** (o que aparece no arquivo JSON, campo `client_email`)
   - Exemplo: `grupo-raca-drive-service@seu-projeto.iam.gserviceaccount.com`
7. Selecione a permissão: **"Gerenciador de Conteúdo"** (Content Manager)
8. Clique em **"Enviar"**

---

## ✅ Passo 9: Verificar Configuração

1. Edite o arquivo `api/config/drive_config.php`
2. Verifique se o caminho está correto:
   ```php
   'credentials_path' => __DIR__ . '/grupo-raca-drive-credentials.json',
   ```
3. Verifique se o `root_folder_id` está correto (ID da pasta GRUPO_RACA no Shared Drive)

---

## 🧪 Passo 10: Testar Conexão

1. Acesse: `https://gruporaca.app.br/api/test-drive-connection.php`
2. Deve retornar:
   ```json
   {
     "success": true,
     "rootFolder": {
       "id": "1bXf338lIktS_6ss1-WoKuMfI-gpWryjn",
       "name": "GRUPO_RACA"
     }
   }
   ```

---

## 🆘 Troubleshooting

### Erro: "Service Accounts do not have storage quota"
- ✅ **Solução**: Use Shared Drive (já configurado)
- A Service Account deve ter acesso ao Shared Drive

### Erro: "Permission denied"
- Verifique se a Service Account foi adicionada ao Shared Drive
- Verifique se a permissão é "Gerenciador de Conteúdo" ou superior

### Erro: "API not enabled"
- Verifique se a Google Drive API está habilitada no projeto
- Vá em "APIs & Services" → "Library" → Busque "Google Drive API" → "Enable"

---

## 📝 Notas Importantes

- **Service Account Email**: Anote o email da Service Account (aparece no JSON baixado)
- **Projeto ID**: Anote o ID do projeto (aparece no JSON baixado)
- **Shared Drive**: Certifique-se de que o Shared Drive existe e a Service Account tem acesso
- **Segurança**: Nunca compartilhe o arquivo JSON publicamente

---

## 🎉 Pronto!

Após completar todos os passos, o sistema estará configurado para usar Google Drive com Shared Drive.

