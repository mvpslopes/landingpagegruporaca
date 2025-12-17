# 🔧 Como Configurar OAuth Centralizado para Google Drive

## 🎯 Como Funciona

1. **Um usuário autorizado (Root/Admin) faz login OAuth uma vez**
2. **O sistema armazena o token desse usuário**
3. **Todos os uploads são feitos usando esse token centralizado**
4. **Funciona com conta pessoal gratuita (15 GB)**

## 📋 Passo a Passo

### 1. Criar Credenciais OAuth no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Selecione o projeto (ou crie um novo)
3. Vá em **APIs & Services** → **Credentials**
4. Clique em **Create Credentials** → **OAuth client ID**
5. Tipo: **Web application**
6. Nome: "Grupo Raça Drive Upload"
7. **Authorized redirect URIs:**
   - Adicione: `https://gruporaca.app.br/api/oauth-drive.php`
   - Adicione: `http://localhost/api/oauth-drive.php` (para desenvolvimento)
8. Clique em **Create**
9. **Copie o Client ID e Client Secret**

### 2. Configurar no Sistema

Adicione as credenciais OAuth no arquivo `api/config/drive_config.php`:

```php
return [
    // ... configurações existentes ...
    
    // OAuth Credentials (para upload centralizado)
    'oauth_client_id' => 'SEU_CLIENT_ID_AQUI',
    'oauth_client_secret' => 'SEU_CLIENT_SECRET_AQUI',
    'oauth_redirect_uri' => 'https://gruporaca.app.br/api/oauth-drive.php',
    
    // ... resto das configurações ...
];
```

### 3. Autorizar Upload Centralizado

1. **Root/Admin faz login no sistema**
2. **Acessa a página de configurações** (vou criar)
3. **Clica em "Conectar Google Drive"**
4. **Autoriza o acesso**
5. **Pronto!** Todos os uploads agora usam esse token

### 4. Como Funciona

- ✅ **Upload centralizado:** Todos os uploads usam o token do usuário autorizado
- ✅ **Sem Service Account:** Usa OAuth do usuário real
- ✅ **Funciona com conta pessoal:** Usa quota do usuário (15 GB gratuito)
- ✅ **Gerenciamento centralizado:** Sistema controla todos os arquivos

## 🔒 Segurança

- Apenas Root/Admin pode autorizar
- Token armazenado na sessão do servidor
- Token pode ser revogado a qualquer momento

## 📝 Próximos Passos

1. Criar credenciais OAuth no Google Cloud Console
2. Adicionar credenciais no `drive_config.php`
3. Implementar autorização OAuth
4. Modificar upload para usar token OAuth

