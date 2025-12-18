# 📋 Como Configurar Microsoft OneDrive

Este guia explica como configurar a integração com Microsoft OneDrive para o sistema de banco de dados de fotos.

## 🎯 Pré-requisitos

1. Conta Microsoft (pessoal ou corporativa)
2. Acesso ao Azure Portal (https://portal.azure.com)
3. Acesso de root/admin no sistema

## 📝 Passo 1: Criar Aplicativo no Azure Portal

1. Acesse: https://portal.azure.com
2. Faça login com sua conta Microsoft
3. Vá em **Azure Active Directory** > **App registrations** > **New registration**
4. Preencha:
   - **Name**: `Grupo Raça OneDrive Integration`
   - **Supported account types**: Selecione **Accounts in any organizational directory and personal Microsoft accounts**
   - **Redirect URI**: 
     - Type: `Web`
     - URI: `https://gruporaca.app.br/api/oauth-onedrive.php`
5. Clique em **Register**

## 🔑 Passo 2: Obter Credenciais

Após criar o aplicativo:

1. Na página do aplicativo, vá em **Overview**
2. Copie o **Application (client) ID** - você precisará disso
3. Vá em **Certificates & secrets** > **New client secret**
4. Preencha:
   - **Description**: `OneDrive API Secret`
   - **Expires**: Escolha uma data (recomendo 24 meses)
5. Clique em **Add**
6. **IMPORTANTE**: Copie o **Value** do secret imediatamente (ele só aparece uma vez!)

## 🔐 Passo 3: Configurar Permissões (API Permissions)

1. Vá em **API permissions**
2. Clique em **Add a permission**
3. Selecione **Microsoft Graph**
4. Selecione **Delegated permissions**
5. Adicione as seguintes permissões:
   - `Files.ReadWrite`
   - `Files.ReadWrite.All`
   - `offline_access`
6. Clique em **Add permissions**
7. **IMPORTANTE**: Clique em **Grant admin consent** (se você for admin do tenant)

## 📄 Passo 4: Configurar o Sistema

1. Edite o arquivo: `api/config/onedrive_config.php`
2. Preencha os seguintes campos:

```php
'oauth_client_id' => 'SEU_APPLICATION_CLIENT_ID_AQUI',
'oauth_client_secret' => 'SEU_CLIENT_SECRET_VALUE_AQUI',
'oauth_redirect_uri' => 'https://gruporaca.app.br/api/oauth-onedrive.php',
'oauth_tenant_id' => 'common', // Use 'common' para contas pessoais
```

## ✅ Passo 5: Autorizar o Sistema

1. Faça login no sistema como **root** ou **admin**
2. Acesse a página de banco de dados
3. Clique em **Autorizar OneDrive** (ou similar)
4. Você será redirecionado para Microsoft para autorizar
5. Faça login e conceda as permissões
6. Você será redirecionado de volta ao sistema

## 🎉 Pronto!

Agora o sistema está configurado para usar Microsoft OneDrive. Todos os uploads serão feitos usando a quota do usuário que autorizou.

## 💡 Informações Importantes

### Planos OneDrive

- **Gratuito**: 5 GB de armazenamento
- **OneDrive Standalone**: R$ 9,99/mês por 100 GB
- **Microsoft 365 Personal**: R$ 34,99/mês por 1 TB (inclui Office)
- **Microsoft 365 Family**: R$ 44,99/mês por 6 TB (1 TB por usuário, até 6 usuários)

### Limitações

- Upload de arquivos até 4MB: Upload direto
- Upload de arquivos > 4MB: Requer upload em sessão (ainda não implementado)
- Limite de tamanho por arquivo: 250 GB (OneDrive Business)

### Renovação de Token

O token OAuth expira após algumas horas. O sistema tentará renovar automaticamente usando o `refresh_token`. Se falhar, será necessário reautorizar.

## 🐛 Solução de Problemas

### Erro: "Token de acesso OneDrive não encontrado"
- **Solução**: Faça a autorização OAuth novamente (Passo 5)

### Erro: "Insufficient privileges"
- **Solução**: Verifique se as permissões foram concedidas corretamente (Passo 3) e se você clicou em "Grant admin consent"

### Erro: "Redirect URI mismatch"
- **Solução**: Verifique se o Redirect URI no Azure Portal corresponde exatamente ao configurado em `onedrive_config.php`

### Erro: "Invalid client secret"
- **Solução**: O client secret expirou ou foi copiado incorretamente. Crie um novo secret no Azure Portal (Passo 2)

## 📚 Documentação Adicional

- Microsoft Graph API: https://learn.microsoft.com/en-us/graph/overview
- OneDrive API: https://learn.microsoft.com/en-us/onedrive/developer/rest-api/
- Azure Portal: https://portal.azure.com

