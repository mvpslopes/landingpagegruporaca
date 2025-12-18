# ✅ Migração para Microsoft OneDrive - Concluída

## 📋 O que foi feito

O sistema foi migrado de Google Drive para Microsoft OneDrive para resolver o problema de quota de Service Account.

## 📁 Arquivos Criados

1. **`api/onedrive_service.php`**
   - Classe principal para interagir com Microsoft OneDrive
   - Métodos: `listFiles()`, `uploadFile()`, `deleteFile()`, `createFolder()`
   - Suporta upload de arquivos até 4MB (upload simples)

2. **`api/config/onedrive_config.php`**
   - Configuração do OneDrive (OAuth credentials, escopos, limites)

3. **`api/oauth-onedrive.php`**
   - Endpoint para autenticação OAuth com Microsoft
   - Permite que root/admin autorize o sistema uma vez

4. **`api/COMO_CONFIGURAR_ONEDRIVE.md`**
   - Guia completo de configuração passo a passo

## 📝 Arquivos Modificados

1. **`api/files.php`**
   - Substituído `DriveService` por `OneDriveService`
   - Atualizado para usar token OneDrive OAuth
   - Função renomeada: `convertUserFolderToOneDrivePath()`

2. **`api/create-folder.php`**
   - Substituído `DriveService` por `OneDriveService`
   - Atualizado para criar pastas no OneDrive

## 🔧 Próximos Passos

### 1. Configurar Azure Portal
- Siga o guia em `api/COMO_CONFIGURAR_ONEDRIVE.md`
- Crie aplicativo no Azure Portal
- Obtenha Client ID e Client Secret
- Configure permissões (Files.ReadWrite, Files.ReadWrite.All, offline_access)

### 2. Configurar Sistema
- Edite `api/config/onedrive_config.php`
- Preencha `oauth_client_id` e `oauth_client_secret`
- Verifique `oauth_redirect_uri`

### 3. Autorizar Sistema
- Faça login como root/admin
- Acesse a página de banco de dados
- Clique em "Autorizar OneDrive"
- Faça login com Microsoft e conceda permissões

## ⚠️ Limitações Atuais

1. **Upload de arquivos grandes**: 
   - Arquivos > 4MB ainda não estão implementados
   - Requer upload em sessão (mais complexo)
   - Por enquanto, limite de 4MB por arquivo

2. **Renovação de token**:
   - O refresh token está sendo armazenado
   - Mas a renovação automática ainda precisa ser implementada

## 💰 Custos

- **Gratuito**: 5 GB de armazenamento
- **OneDrive Standalone**: R$ 9,99/mês por 100 GB
- **Microsoft 365 Personal**: R$ 34,99/mês por 1 TB (inclui Office)

## ✅ Vantagens sobre Google Drive

1. ✅ **Mais barato**: R$ 9,99/mês vs R$ 98/mês (Google Workspace)
2. ✅ **Funciona com conta pessoal**: Não precisa de Workspace
3. ✅ **API gratuita**: Sem custos adicionais para usar a API
4. ✅ **Mesma experiência**: Usuários veem pastas e arquivos normalmente

## 🔄 Diferenças Técnicas

| Aspecto | Google Drive | OneDrive |
|---------|--------------|----------|
| Autenticação | Service Account ou OAuth | OAuth apenas |
| API | Google Drive API | Microsoft Graph API |
| Upload simples | Até 5MB | Até 4MB |
| Upload grande | Upload resumido | Upload em sessão |
| Pasta raiz | ID específico | 'root' |

## 📚 Documentação

- Guia de configuração: `api/COMO_CONFIGURAR_ONEDRIVE.md`
- Microsoft Graph API: https://learn.microsoft.com/en-us/graph/overview
- OneDrive API: https://learn.microsoft.com/en-us/onedrive/developer/rest-api/

