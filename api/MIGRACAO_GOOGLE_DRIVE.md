# ✅ Migração para Google Drive - Concluída

## 📋 O que foi feito

O sistema foi migrado para Google Drive usando Shared Drive do Google Workspace para resolver o problema de quota de Service Accounts.

## 📁 Arquivos Modificados

1. **`api/config/drive_config.php`**
   - ✅ Atualizado `root_folder_id` para: `1bXf338lIktS_6ss1-WoKuMfI-gpWryjn` (pasta GRUPO_RACA no Shared Drive)

2. **`api/files.php`**
   - ✅ Substituído `B2Service` por `DriveService` (com fallback para B2)
   - ✅ Adicionada função `convertUserFolderToDrivePath()` para converter caminhos
   - ✅ Suporte para listar, upload e delete de arquivos no Google Drive
   - ✅ Fallback automático para Backblaze B2 se Google Drive não estiver configurado

3. **`api/create-folder.php`**
   - ✅ Substituído `B2Service` por `DriveService` (com fallback para B2)
   - ✅ Suporte para criar pastas no Google Drive
   - ✅ Fallback automático para Backblaze B2 se Google Drive não estiver configurado

## ✅ Configuração Concluída

- **Shared Drive**: "Grupo Raça - Arquivos"
- **Pasta Raiz**: `GRUPO_RACA` (ID: `1bXf338lIktS_6ss1-WoKuMfI-gpWryjn`)
- **Service Account**: `grupo-raca-drive-service@tidal-triumph-481417-g3.iam.gserviceaccount.com`
- **Permissão**: Gerenciador de Conteúdo (Content Manager)

## 🔧 Como Funciona

- **Prioridade**: Google Drive (se configurado)
- **Fallback**: Backblaze B2 (se Google Drive não estiver disponível)
- **Pastas**: Criadas automaticamente no Google Drive usando `ensureFolder()`
- **Upload**: Arquivos são enviados diretamente para o Shared Drive
- **Download**: Links diretos do Google Drive
- **Listagem**: Lista arquivos e pastas do Google Drive

## ⚠️ Verificações Necessárias

### 1. Arquivo de Credenciais
Verifique se o arquivo existe:
```
api/config/grupo-raca-drive-credentials.json
```

Se não existir:
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Vá em **"IAM & Admin"** → **"Service Accounts"**
3. Clique na Service Account `grupo-raca-drive-service`
4. Aba **"Keys"** → **"Add Key"** → **"Create new key"**
5. Selecione **"JSON"** e baixe
6. Renomeie para `grupo-raca-drive-credentials.json`
7. Faça upload para `api/config/`

### 2. Teste de Conexão
Acesse: `https://gruporaca.app.br/api/test-drive-connection.php`

Deve retornar:
```json
{
  "success": true,
  "rootFolder": {
    "id": "1bXf338lIktS_6ss1-WoKuMfI-gpWryjn",
    "name": "GRUPO_RACA"
  }
}
```

## 🎉 Pronto para Usar!

O sistema está configurado e pronto para usar Google Drive. Basta fazer upload dos arquivos atualizados para a hospedagem.

## 📚 Documentação

- Google Drive API: https://developers.google.com/drive/api
- Shared Drives: https://developers.google.com/drive/api/v3/enable-shareddrives

