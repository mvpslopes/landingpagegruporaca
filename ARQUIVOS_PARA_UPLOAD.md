# 📦 Arquivos para Upload na Hospedagem

## ✅ Build Concluído!

O build do frontend foi gerado com sucesso na pasta `dist/`.

## 📋 O que Enviar para a Hospedagem

### 1. **Frontend (Pasta `dist/`)**

Envie **TODOS os arquivos** da pasta `dist/` para `/public_html/` no servidor:

```
dist/
├── index.html          ← Enviar para /public_html/
├── .htaccess          ← Enviar para /public_html/
└── assets/            ← Enviar pasta completa para /public_html/assets/
    ├── index-[hash].js
    ├── index-[hash].css
    └── [outros arquivos]
```

**⚠️ IMPORTANTE:** 
- Envie **TODOS** os arquivos da pasta `dist/`
- Mantenha a estrutura de pastas (especialmente a pasta `assets/`)
- O arquivo `.htaccess` é essencial para o funcionamento do React Router

### 2. **API (Pasta `api/`)**

Envie **TODOS os arquivos** da pasta `api/` para `/public_html/api/` no servidor:

```
api/
├── auth.php
├── config.php
├── db_config.php
├── drive_service.php
├── files.php
├── folders.php
├── oauth-drive.php
├── permissions_db.php
├── users.php
├── create-folder.php
└── config/
    └── drive_config.php
└── [outros arquivos PHP necessários]
```

**⚠️ IMPORTANTE:**
- Envie **TODOS** os arquivos PHP da pasta `api/`
- Mantenha a estrutura de pastas (especialmente `api/config/`)
- **NÃO envie** arquivos `.md` (documentação) - são apenas para referência local
- **NÃO envie** arquivos `.sql` - são apenas para configuração do banco

### 3. **Biblioteca Google API (se ainda não foi enviada)**

Se ainda não enviou, envie a biblioteca Google API PHP Client:

```
google-api-php-client-v2.18.3-PHP8.3/
├── vendor/     ← Enviar para /public_html/api/vendor/
└── src/        ← Enviar para /public_html/api/src/
```

**Localização no servidor:**
- `/public_html/api/vendor/`
- `/public_html/api/src/`

### 4. **Credenciais Google Drive (se ainda não foi enviada)**

Se ainda não enviou, envie o arquivo de credenciais:

```
grupo-raca-drive-credentials.json  ← Enviar para /public_html/api/
```

**⚠️ SEGURANÇA:** 
- Este arquivo contém credenciais sensíveis
- Mantenha-o seguro e não compartilhe publicamente

## 🚀 Como Fazer o Upload

### Opção 1: FileZilla / WinSCP (Recomendado)

1. **Conectar ao servidor:**
   - Host: `ftp.gruporaca.app.br` (ou o fornecido pela Hostinger)
   - Usuário: Seu usuário FTP
   - Senha: Sua senha FTP
   - Porta: 21 (FTP) ou 22 (SFTP)

2. **Upload do Frontend:**
   - Navegue até `/public_html/` no servidor
   - Delete arquivos antigos (se houver)
   - Faça upload de **TODOS** os arquivos da pasta `dist/`

3. **Upload da API:**
   - Navegue até `/public_html/api/` no servidor
   - Faça upload de **TODOS** os arquivos PHP da pasta `api/`
   - Mantenha a estrutura de pastas

### Opção 2: Script PowerShell (Automático)

Se você configurou o `deploy-config.ps1`:

```powershell
# Carregar configurações
. .\deploy-config.ps1

# Executar deploy
.\deploy.ps1 -FtpHost $env:FTP_HOST -FtpUser $env:FTP_USER -FtpPass $env:FTP_PASS -FtpPath $env:FTP_PATH
```

**⚠️ NOTA:** O script atual faz deploy apenas do frontend. Para a API, use FileZilla/WinSCP.

## 📁 Estrutura Final no Servidor

Após o upload, a estrutura deve ser:

```
/public_html/
├── index.html                    ← Frontend
├── .htaccess                     ← Frontend
├── assets/                       ← Frontend
│   ├── index-[hash].js
│   └── index-[hash].css
└── api/                          ← Backend
    ├── auth.php
    ├── config.php
    ├── db_config.php
    ├── drive_service.php
    ├── files.php
    ├── folders.php
    ├── oauth-drive.php
    ├── permissions_db.php
    ├── users.php
    ├── create-folder.php
    ├── grupo-raca-drive-credentials.json
    ├── config/
    │   └── drive_config.php
    ├── vendor/                   ← Google API (se enviado)
    └── src/                      ← Google API (se enviado)
```

## ✅ Checklist de Verificação

Após o upload, verifique:

- [ ] Todos os arquivos da pasta `dist/` foram enviados
- [ ] Arquivo `.htaccess` está na raiz de `/public_html/`
- [ ] Pasta `assets/` foi criada em `/public_html/`
- [ ] Todos os arquivos PHP da pasta `api/` foram enviados
- [ ] Pasta `api/config/` foi criada com `drive_config.php`
- [ ] Arquivo `grupo-raca-drive-credentials.json` está em `/public_html/api/`
- [ ] Bibliotecas Google API estão em `/public_html/api/vendor/` e `/public_html/api/src/` (se aplicável)

## 🔍 Testes Pós-Deploy

1. **Frontend:**
   - Acesse: `https://gruporaca.app.br`
   - Verifique se a página carrega corretamente
   - Teste navegação entre páginas
   - Verifique se as imagens carregam

2. **API:**
   - Acesse: `https://gruporaca.app.br/api/auth.php`
   - Deve retornar JSON (não erro 404)
   - Teste login no sistema

3. **Google Drive:**
   - Faça login no sistema
   - Teste listagem de arquivos
   - Teste upload de arquivo (após configurar OAuth)

## 🐛 Problemas Comuns

### Erro 404 em rotas do React
**Solução:** Verifique se o arquivo `.htaccess` foi enviado para `/public_html/`

### Erro ao acessar API
**Solução:** Verifique se todos os arquivos PHP foram enviados para `/public_html/api/`

### Imagens não carregam
**Solução:** Verifique se a pasta `assets/` foi enviada completamente

### Erro de permissão
**Solução:** Verifique permissões das pastas (755) e arquivos (644) no servidor

---

**📅 Última atualização:** Build gerado com sucesso!
**📦 Tamanho do build:** ~415 KB (JS) + ~41 KB (CSS)

