# 📤 Como Fazer Upload da Biblioteca Google API PHP

## 📍 Localização da Biblioteca

A biblioteca está em:
```
C:\Users\Marcus Lopes\Desktop\google-api-php-client-v2.18.3-PHP8.3
```

## 🎯 O que precisa ser feito

Fazer upload de **2 pastas** da biblioteca para a pasta `api/` no servidor:

1. **Pasta `vendor/`** (ESSENCIAL)
2. **Pasta `src/`** (se existir na biblioteca)

---

## 📂 Estrutura Final no Servidor

## 📍 Caminho Real no Servidor

Baseado na sua configuração, o caminho é:

**`/public_html/api/`**

Após o upload, a estrutura deve ficar assim:

```
/public_html/api/
├── vendor/                    ← UPLOAD ESTA PASTA
│   ├── autoload.php          ← Arquivo essencial
│   ├── google/
│   │   └── apiclient/
│   │       └── src/
│   │           └── Google/
│   │               ├── Client.php
│   │               └── Service/
│   │                   └── Drive.php
│   └── [outras dependências]
├── src/                      ← UPLOAD ESTA PASTA (se existir)
│   └── aliases.php
├── config/
├── auth.php
├── files.php
└── [outros arquivos PHP]
```

---

## 🚀 Passo a Passo - File Manager da Hostinger

### 1. Acessar o File Manager

1. No hPanel da Hostinger, clique em **"Gerenciador de Arquivos"**
2. **Navegue até a pasta onde a pasta `api/` está localizada**
   - Verifique o caminho completo no File Manager
   - Entre dentro da pasta `api/`

### 2. Fazer Upload da Pasta `vendor/`

1. **No seu computador:**
   - Abra: `C:\Users\Marcus Lopes\Desktop\google-api-php-client-v2.18.3-PHP8.3`
   - Localize a pasta `vendor/`

2. **No File Manager:**
   - Clique no botão **"Upload"** ou **"Enviar arquivos"**
   - Selecione a pasta `vendor/` completa
   - ⚠️ **IMPORTANTE**: A pasta `vendor/` é grande, o upload pode levar vários minutos

3. **Aguarde o upload completar**
   - Verifique se todos os arquivos foram enviados
   - A pasta `vendor/` deve aparecer dentro de `api/`

### 3. Fazer Upload da Pasta `src/` (se existir)

1. **Verifique se existe:**
   - Na biblioteca local, veja se há uma pasta `src/` na raiz
   - Se existir, faça upload dela também

2. **Upload:**
   - Mesmo processo: selecione a pasta `src/` e faça upload

---

## ✅ Verificação Após Upload

### 1. Verificar Estrutura

No File Manager, confirme que existem:

- ✅ `/api/vendor/autoload.php`
- ✅ `/api/vendor/google/apiclient/src/Google/Client.php`
- ✅ `/api/vendor/google/apiclient/src/Google/Service/Drive.php`

### 2. Testar via Script

Acesse no navegador:
```
https://gruporaca.app.br/mvpslopes/landingpagegruporaca/api/verificar-biblioteca.php
```

**Resultado esperado:**
- ✅ Autoloader encontrado
- ✅ Classe Google_Client disponível
- ✅ Classe Google_Service_Drive disponível

---

## 🔄 Alternativa: Upload via FTP

Se o File Manager não funcionar bem para pastas grandes:

### Usando FileZilla ou WinSCP

1. **Conecte-se via FTP:**
   - Host: `ftp.gruporaca.app.br` (ou o fornecido pela Hostinger)
   - Usuário e senha FTP

2. **Navegue até:**
   - Servidor: `/public_html/mvpslopes/landingpagegruporaca/api/`

3. **Faça upload:**
   - Arraste a pasta `vendor/` completa
   - Arraste a pasta `src/` se existir
   - ⚠️ Configure para modo **BINÁRIO** (não ASCII)

4. **Aguarde:**
   - O upload pode levar vários minutos devido ao tamanho

---

## ⚠️ Importante

- A pasta `vendor/` pode ter **vários MB** de tamanho
- O upload pode levar **5-15 minutos** dependendo da conexão
- **NÃO interrompa** o upload no meio
- Certifique-se de que **TODOS os arquivos** foram enviados

---

## 🐛 Problemas Comuns

### "Autoloader não encontrado"
- Verifique se `/api/vendor/autoload.php` existe
- Confirme que a pasta `vendor/` foi enviada completamente

### "Classe Google_Client não encontrada"
- Verifique se `/api/vendor/google/apiclient/src/Google/Client.php` existe
- Confirme que toda a estrutura de pastas foi mantida

### Upload incompleto
- Tente fazer upload novamente
- Use FTP se o File Manager estiver com problemas
- Verifique o espaço em disco disponível

---

## 📝 Checklist Final

Após fazer o upload, verifique:

- [ ] Pasta `vendor/` está em `/api/vendor/`
- [ ] Arquivo `/api/vendor/autoload.php` existe
- [ ] Arquivo `/api/vendor/google/apiclient/src/Google/Client.php` existe
- [ ] Script `verificar-biblioteca.php` mostra tudo OK
- [ ] Não há erros de permissão

---

## 🎉 Próximos Passos

Após confirmar que a biblioteca está funcionando:

1. Configure as credenciais do Google Drive (se necessário)
2. Teste a conexão: `test-drive-connection.php`
3. O sistema estará pronto para usar Google Drive!

