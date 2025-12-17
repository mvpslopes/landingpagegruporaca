# 🔍 Como Verificar se a Pasta está em Shared Drive (Manual)

Como o acesso via web está com problemas de SSL, você pode verificar manualmente:

## 📋 Método 1: Visual no Google Drive

1. **Acesse a pasta no Google Drive:**
   - https://drive.google.com/drive/folders/1v8BQP6rK7659-bbhlvkT10RQcZDOEMXY

2. **Olhe na barra lateral esquerda:**
   - Se você ver **"Drives Compartilhados"** ou **"Shared Drives"** e a pasta estiver listada lá → **É Shared Drive** ✅
   - Se a pasta estiver em **"Meu Drive"** ou **"My Drive"** → **É conta pessoal** ❌

## 📋 Método 2: Verificar Propriedades

1. **Clique com botão direito na pasta `GRUPO_RACA`**
2. **Selecione "Detalhes" ou "Details"**
3. **Procure por "Drive compartilhado" ou "Shared Drive"**
4. **Se aparecer** → É Shared Drive ✅
5. **Se não aparecer** → É conta pessoal ❌

## 📋 Método 3: Verificar URL

1. **Olhe a URL da pasta no navegador**
2. **Se a URL contém `/drive/folders/`** → Pode ser conta pessoal ou Shared Drive
3. **Se a URL contém `/drive/shared-drives/`** → É Shared Drive ✅

## ✅ Se for Shared Drive

Se a pasta estiver em um **Shared Drive**, o problema de quota **deveria estar resolvido**. Se ainda não funcionar:

1. **Verifique se a Service Account tem permissão no Shared Drive:**
   - Abra o Shared Drive
   - Clique em "Gerenciar membros"
   - Verifique se `grupo-raca-drive-service@tidal-triumph-481417-g3.iam.gserviceaccount.com` está listado
   - Permissão deve ser **Editor** ou superior

2. **Se a Service Account não estiver no Shared Drive:**
   - Adicione como membro
   - Permissão: **Editor** ou **Gerenciador de Conteúdo**

## ❌ Se NÃO for Shared Drive

Se a pasta ainda estiver em uma **conta pessoal**, o problema de quota **NÃO pode ser resolvido** sem:

1. **Criar Shared Drive** (requer Google Workspace)
2. **Domain-Wide Delegation** (requer Google Workspace Admin)

## 🎯 Solução Definitiva

**A única solução real para contas pessoais é criar um Shared Drive:**

### Se você tem Google Workspace:

1. **Criar Shared Drive:**
   - Google Drive → "Drives Compartilhados" → "Novo"
   - Nome: "Grupo Raça - Arquivos"

2. **Mover a pasta:**
   - Mova a pasta `GRUPO_RACA` para dentro do Shared Drive
   - Anote o novo ID da pasta (pode mudar)

3. **Adicionar Service Account:**
   - No Shared Drive → "Gerenciar membros"
   - Adicione: `grupo-raca-drive-service@tidal-triumph-481417-g3.iam.gserviceaccount.com`
   - Permissão: **Editor** ou **Gerenciador de Conteúdo**

4. **Atualizar configuração:**
   - Atualize o `root_folder_id` no `drive_config.php` se o ID mudar

### Se você NÃO tem Google Workspace:

- Considere fazer upgrade para Google Workspace
- Ou use Domain-Wide Delegation (se tiver acesso admin)

## 📝 Próximos Passos

1. **Verifique** se a pasta está em Shared Drive (métodos acima)
2. **Se for Shared Drive:** Verifique permissões da Service Account
3. **Se NÃO for Shared Drive:** Crie um Shared Drive (requer Google Workspace)

