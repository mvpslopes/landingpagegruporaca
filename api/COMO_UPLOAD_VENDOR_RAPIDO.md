# ⚡ Como Fazer Upload da Pasta vendor/ Rapidamente

## 📊 Tamanho da Pasta vendor/

A pasta `vendor/` tem aproximadamente **29.000 arquivos** e pode ter **50-100 MB** de tamanho.

Isso é **NORMAL** - a biblioteca Google API PHP Client inclui todas as dependências necessárias.

---

## 🚀 Método 1: Upload via FTP (RECOMENDADO - Mais Rápido)

### Usando FileZilla

1. **Baixe e instale FileZilla**: https://filezilla-project.org/

2. **Conecte-se ao servidor:**
   - Host: `ftp.gruporaca.app.br` (ou o fornecido pela Hostinger)
   - Usuário: Seu usuário FTP
   - Senha: Sua senha FTP
   - Porta: 21

3. **Navegue até:**
   - Servidor: `/public_html/api/`
   - Local: `C:\Users\Marcus Lopes\Desktop\google-api-php-client-v2.18.3-PHP8.3\`

4. **Faça upload:**
   - Arraste a pasta `vendor/` do lado local para o lado servidor
   - Arraste a pasta `src/` se existir
   - ⚠️ Configure para modo **BINÁRIO** (não ASCII)
   - O upload pode levar 10-30 minutos, mas é mais confiável

5. **Vantagens:**
   - ✅ Mais rápido que File Manager
   - ✅ Pode retomar se interromper
   - ✅ Mostra progresso em tempo real
   - ✅ Mais confiável para muitos arquivos

---

## 🗜️ Método 2: Comprimir e Extrair (Alternativa)

### Passo 1: Comprimir Localmente

1. **No seu computador:**
   - Navegue até: `C:\Users\Marcus Lopes\Desktop\google-api-php-client-v2.18.3-PHP8.3\`
   - Clique com botão direito na pasta `vendor/`
   - Selecione "Enviar para" → "Pasta compactada (em zip)"
   - Isso criará `vendor.zip`

2. **Repita para `src/`** (se existir):
   - Crie `src.zip`

### Passo 2: Upload do ZIP

1. **No File Manager da Hostinger:**
   - Navegue até: `/public_html/api/`
   - Faça upload de `vendor.zip` (muito mais rápido - 1 arquivo vs 29.000)
   - Faça upload de `src.zip` se existir

### Passo 3: Extrair no Servidor

**Opção A - Via File Manager:**
1. Clique com botão direito em `vendor.zip`
2. Selecione "Extrair" ou "Unzip"
3. Aguarde a extração (pode levar alguns minutos)
4. Delete o arquivo `vendor.zip` após extrair

**Opção B - Via SSH (se tiver acesso):**
```bash
cd /public_html/api/
unzip vendor.zip
unzip src.zip  # se existir
rm vendor.zip src.zip  # remover os zips após extrair
```

---

## ⏱️ Tempo Estimado

| Método | Tempo Estimado |
|--------|----------------|
| File Manager (direto) | 30-60 minutos ⚠️ Pode dar timeout |
| FTP (FileZilla) | 10-30 minutos ✅ Recomendado |
| ZIP + Extrair | 5-10 minutos ✅ Mais rápido |

---

## ✅ Verificação Após Upload

Após fazer upload (qualquer método), verifique:

1. **Acesse:**
   ```
   https://gruporaca.app.br/api/verificar-biblioteca.php
   ```

2. **Deve mostrar:**
   - ✅ Autoloader encontrado
   - ✅ Classe Google_Client disponível
   - ✅ Classe Google_Service_Drive disponível

---

## 🐛 Problemas Comuns

### Upload interrompido
- **Solução**: Use FTP (FileZilla) que pode retomar
- Ou use o método ZIP

### Timeout no File Manager
- **Solução**: Use FTP ou método ZIP

### Pasta vendor muito grande
- **Solução**: Isso é normal! A biblioteca é grande mesmo
- Use FTP ou método ZIP para ser mais rápido

---

## 💡 Dica Final

**Recomendação**: Use **FileZilla (FTP)** - é o método mais confiável e rápido para muitos arquivos.

