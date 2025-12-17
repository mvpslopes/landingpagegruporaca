# 🔍 Como Verificar Permissões Manualmente

Como o acesso via web pode estar com problemas de SSL, você pode verificar as permissões manualmente no Google Drive.

## 📋 Passo a Passo

### 1. Acesse a Pasta no Google Drive

1. Abra o Google Drive da conta pessoal onde está a pasta `GRUPO_RACA`
2. Localize a pasta `GRUPO_RACA` (ID: `1EeKxOPybc3QRtVS6RgOUY0TEirl4MBsD`)

### 2. Verificar Compartilhamento

1. Clique com botão direito na pasta `GRUPO_RACA`
2. Selecione **"Compartilhar"** ou **"Share"**
3. Verifique se aparece o email: `grupo-raca-drive-service@tidal-triumph-481417-g3.iam.gserviceaccount.com`

### 3. Se a Service Account NÃO estiver na lista:

1. Clique em **"Adicionar pessoas e grupos"** ou **"Add people and groups"**
2. Digite: `grupo-raca-drive-service@tidal-triumph-481417-g3.iam.gserviceaccount.com`
3. Selecione a permissão: **Editor** (não Visualizador)
4. Clique em **"Enviar"** ou **"Send"**

### 4. Verificar Permissão da Subpasta `leiloes`

1. Entre na pasta `GRUPO_RACA`
2. Localize a subpasta `leiloes`
3. Clique com botão direito → **"Compartilhar"**
4. Verifique se a Service Account tem acesso
5. Se não tiver, adicione com permissão de **Editor**

### 5. Verificar Espaço Disponível

1. No Google Drive, clique no ícone de engrenagem ⚙️
2. Selecione **"Configurações"** ou **"Settings"**
3. Vá em **"Armazenamento"** ou **"Storage"**
4. Verifique se há espaço disponível

## ✅ Checklist

- [ ] Pasta `GRUPO_RACA` está compartilhada com a Service Account
- [ ] Service Account tem permissão de **Editor** (não Visualizador)
- [ ] Subpasta `leiloes` está compartilhada ou herda permissões
- [ ] Conta pessoal tem espaço disponível no Google Drive
- [ ] Todas as outras subpastas também estão acessíveis

## 🔧 Solução Rápida

Se você não conseguir verificar via web, faça o seguinte:

1. **Compartilhe a pasta raiz novamente:**
   - Abra `GRUPO_RACA` no Google Drive
   - Compartilhe com: `grupo-raca-drive-service@tidal-triumph-481417-g3.iam.gserviceaccount.com`
   - Permissão: **Editor**
   - Marque **"Notificar pessoas"** como desmarcado (não precisa notificar)

2. **Verifique cada subpasta:**
   - Entre em cada subpasta (`leiloes`, `deolhonomarchador`, etc.)
   - Certifique-se de que a Service Account tem acesso
   - Se necessário, compartilhe individualmente

3. **Teste o upload novamente:**
   - Tente fazer upload de um arquivo pequeno
   - Se funcionar, o problema estava nas permissões

## ⚠️ Importante

- A Service Account precisa ter permissão de **Editor** (writer), não apenas Visualizador
- A conta pessoal precisa ter **espaço disponível** no Google Drive
- Todas as subpastas precisam estar acessíveis pela Service Account

