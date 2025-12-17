# 📤 Instruções para Upload da Biblioteca Google API PHP

## 📋 O que precisa ser feito

A biblioteca Google API PHP Client precisa estar na pasta `api/` do servidor para que o sistema funcione com Google Drive.

---

## 📁 Estrutura Necessária

Após o upload, a estrutura na pasta `api/` deve ficar assim:

```
api/
├── vendor/
│   ├── autoload.php          ← ESSENCIAL
│   ├── google/
│   │   └── apiclient/
│   │       └── src/
│   │           ├── Google/
│   │           │   ├── Client.php
│   │           │   └── Service/
│   │           │       └── Drive.php
│   │           └── aliases.php
│   └── [outras dependências]
├── src/                      ← Opcional (se existir na biblioteca)
│   └── aliases.php
└── [seus arquivos PHP]
```

---

## 🚀 Passo a Passo

### Opção 1: Upload via File Manager da Hostinger (Recomendado)

1. **Acesse o File Manager da Hostinger**
   - No hPanel, vá em "Gerenciador de Arquivos"
   - Navegue até: `/public_html/mvpslopes/landingpagegruporaca/api/`

2. **Extraia a biblioteca localmente primeiro**
   - No seu computador, extraia o arquivo `google-api-php-client-v2.18.3-PHP8.3.zip` (se estiver zipado)
   - Ou navegue até: `C:\Users\Marcus Lopes\Desktop\google-api-php-client-v2.18.3-PHP8.3`

3. **Faça upload da pasta `vendor/`**
   - Dentro da pasta da biblioteca, localize a pasta `vendor/`
   - Faça upload de **TODA a pasta `vendor/`** para `/api/vendor/`
   - ⚠️ **IMPORTANTE**: Isso pode levar alguns minutos, pois a pasta `vendor/` é grande

4. **Verifique se existe pasta `src/`**
   - Se a biblioteca tiver uma pasta `src/` na raiz, faça upload dela também
   - Caso contrário, não é necessário

5. **Verificar estrutura final**
   - Após o upload, você deve ter:
     - `/api/vendor/autoload.php` ✅
     - `/api/vendor/google/apiclient/src/Google/Client.php` ✅
     - `/api/vendor/google/apiclient/src/Google/Service/Drive.php` ✅

---

### Opção 2: Upload via FTP (FileZilla/WinSCP)

1. **Conecte-se via FTP**
   - Host: `ftp.gruporaca.app.br` (ou o fornecido pela Hostinger)
   - Usuário e senha FTP

2. **Navegue até a pasta**
   - No servidor: `/public_html/mvpslopes/landingpagegruporaca/api/`

3. **Faça upload**
   - Arraste a pasta `vendor/` completa da biblioteca
   - Arraste a pasta `src/` se existir
   - ⚠️ **MODO BINÁRIO**: Configure o FTP para modo binário para arquivos grandes

---

## ✅ Verificação

Após fazer o upload, teste se está funcionando:

1. **Acesse o script de verificação:**
   ```
   https://gruporaca.app.br/mvpslopes/landingpagegruporaca/api/verificar-biblioteca.php
   ```

2. **O script deve mostrar:**
   - ✅ Autoloader encontrado
   - ✅ Classe Google_Client disponível
   - ✅ Classe Google_Service_Drive disponível

---

## 📝 Arquivos Essenciais

Os arquivos **MÍNIMOS** necessários são:

1. `/api/vendor/autoload.php` - Autoloader do Composer
2. `/api/vendor/google/apiclient/src/Google/Client.php` - Cliente Google
3. `/api/vendor/google/apiclient/src/Google/Service/Drive.php` - Serviço Drive
4. `/api/vendor/google/apiclient/src/aliases.php` - Aliases (se existir)

Mas é mais seguro fazer upload de **TODA a pasta `vendor/`** completa.

---

## ⚠️ Importante

- A pasta `vendor/` pode ser **muito grande** (vários MB)
- O upload pode levar **alguns minutos**
- Certifique-se de que o upload foi **completo** antes de testar
- Se houver erro de timeout, tente fazer upload em partes menores

---

## 🐛 Solução de Problemas

### Erro: "Autoloader não encontrado"
- Verifique se `/api/vendor/autoload.php` existe
- Confirme que a pasta `vendor/` foi enviada completamente

### Erro: "Classe Google_Client não encontrada"
- Verifique se `/api/vendor/google/apiclient/src/Google/Client.php` existe
- Confirme que toda a estrutura de pastas foi mantida

### Erro de permissões
- Certifique-se de que os arquivos têm permissão de leitura (644)
- As pastas devem ter permissão 755

---

## 📞 Próximos Passos

Após fazer o upload e verificar:

1. ✅ Teste a conexão: `test-drive-connection.php`
2. ✅ Configure as credenciais do Google Drive (se necessário)
3. ✅ Teste upload de arquivos

