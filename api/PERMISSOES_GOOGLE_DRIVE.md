# 🔐 Permissões e Compartilhamento - Google Drive

## ✅ Resposta Rápida

**SIM, você precisa compartilhar as pastas com a Service Account!**

## 📧 Email da Service Account

```
grupo-raca-drive-service@tidal-triumph-481417-g3.iam.gserviceaccount.com
```

## 🎯 O que fazer

### 1. Pasta Raiz (OBRIGATÓRIO)

A pasta raiz **já deve estar compartilhada** com a Service Account. Se não estiver:

1. Abra a pasta raiz no Google Drive (ID: `1EeKxOPybc3QRtVS6RgOUY0TEirl4MBsD`)
2. Clique com botão direito → **"Compartilhar"**
3. Adicione o email: `grupo-raca-drive-service@tidal-triumph-481417-g3.iam.gserviceaccount.com`
4. Dê permissão: **Editor** (ou **Visualizador e Editor**)
5. Clique em **"Enviar"**

### 2. Pastas dos Usuários (OBRIGATÓRIO)

**Para cada pasta criada**, você precisa compartilhar com a Service Account:

1. Abra a pasta (ex: `leiloes`, `deolhonomarchador`, etc.)
2. Clique com botão direito → **"Compartilhar"**
3. Adicione o email: `grupo-raca-drive-service@tidal-triumph-481417-g3.iam.gserviceaccount.com`
4. Dê permissão: **Editor** (ou **Visualizador e Editor**)
5. Clique em **"Enviar"**

## 📋 Lista de Pastas para Compartilhar

Compartilhe estas 8 pastas com a Service Account:

1. ✅ `leiloes`
2. ✅ `deolhonomarchador`
3. ✅ `topmarchador`
4. ✅ `arquitemraca`
5. ✅ `racaemarcha`
6. ✅ `portalmarchador`
7. ✅ `puramarcha`
8. ✅ `campolina`

## 🔑 Nível de Permissão

**Use sempre: Editor** (ou "Visualizador e Editor")

Isso permite que a Service Account:
- ✅ Ler arquivos
- ✅ Criar novos arquivos
- ✅ Editar arquivos existentes
- ✅ Criar subpastas
- ✅ Listar conteúdo das pastas

**NÃO use:** "Visualizador" (apenas leitura) - não permitirá uploads

## ⚠️ Importante

### Herança de Permissões

Se você compartilhar a **pasta raiz** com a Service Account como **Editor**, as pastas filhas **podem herdar** essa permissão. Porém, é mais seguro compartilhar cada pasta individualmente para garantir que tudo funcione.

### Verificação

Após compartilhar, você pode verificar:
1. Abra a pasta no Google Drive
2. Clique em "Compartilhar"
3. Verifique se o email da Service Account aparece na lista

## 🚀 Alternativa: Script Automático

Se preferir, o script `criar-pastas-drive.php` cria as pastas **E configura as permissões automaticamente** quando executado. Mas se você criar manualmente, precisa compartilhar manualmente também.

## ✅ Checklist Final

- [ ] Pasta raiz compartilhada com Service Account (Editor)
- [ ] Pasta `leiloes` compartilhada com Service Account (Editor)
- [ ] Pasta `deolhonomarchador` compartilhada com Service Account (Editor)
- [ ] Pasta `topmarchador` compartilhada com Service Account (Editor)
- [ ] Pasta `arquitemraca` compartilhada com Service Account (Editor)
- [ ] Pasta `racaemarcha` compartilhada com Service Account (Editor)
- [ ] Pasta `portalmarchador` compartilhada com Service Account (Editor)
- [ ] Pasta `puramarcha` compartilhada com Service Account (Editor)
- [ ] Pasta `campolina` compartilhada com Service Account (Editor)

## 🧪 Teste

Após compartilhar todas as pastas, teste:

1. Acesse: `https://gruporaca.app.br/api/test-drive-connection.php`
2. Ou faça login como um usuário USER e tente listar arquivos

Se tudo estiver correto, você verá as pastas e poderá fazer uploads!

