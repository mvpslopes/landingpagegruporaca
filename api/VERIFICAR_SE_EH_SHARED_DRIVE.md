# 🔍 Verificar se a Pasta está em Shared Drive

## ❓ Por que criar pastas funciona mas upload não?

- **Pastas** = apenas metadados (não ocupam espaço) ✅ Funciona
- **Arquivos** = ocupam espaço (precisam de quota) ❌ Não funciona

## 🔍 Como Verificar se é Shared Drive

### Método 1: Visual no Google Drive

1. Acesse a pasta: https://drive.google.com/drive/folders/1v8BQP6rK7659-bbhlvkT10RQcZDOEMXY
2. Olhe na barra lateral esquerda
3. Se você ver "Drives Compartilhados" ou "Shared Drives" e a pasta estiver listada lá, **é Shared Drive** ✅
4. Se a pasta estiver em "Meu Drive" ou "My Drive", **é conta pessoal** ❌

### Método 2: Verificar Propriedades da Pasta

1. Clique com botão direito na pasta
2. Selecione "Detalhes" ou "Details"
3. Procure por "Drive compartilhado" ou "Shared Drive"
4. Se aparecer, **é Shared Drive** ✅

### Método 3: Via API (Script)

Execute o script `verificar-permissoes-pasta.php` que criamos anteriormente para verificar se `driveId` está presente.

## ✅ Se for Shared Drive

Se a pasta estiver em um **Shared Drive**, o problema de quota **deveria estar resolvido**. Se ainda não funcionar:

1. Verifique se a Service Account tem permissão no Shared Drive
2. Verifique se a Service Account tem permissão de **Editor** ou superior
3. O código já suporta Shared Drives (`supportsAllDrives: true`)

## ❌ Se NÃO for Shared Drive

Se a pasta ainda estiver em uma **conta pessoal**, o problema de quota **não pode ser resolvido** sem:

1. **Criar Shared Drive** (requer Google Workspace)
2. **Domain-Wide Delegation** (requer Google Workspace Admin)
3. **OAuth do usuário** (não prático)

## 🎯 Solução Definitiva

**A única solução real para contas pessoais é criar um Shared Drive:**

1. Se você tem Google Workspace:
   - Crie um Shared Drive
   - Mova a pasta para lá
   - Adicione a Service Account como membro

2. Se você NÃO tem Google Workspace:
   - Considere fazer upgrade para Google Workspace
   - Ou use Domain-Wide Delegation (se tiver acesso admin)

## 📝 Próximos Passos

1. **Verifique** se a pasta está em Shared Drive
2. **Se for Shared Drive:** Verifique permissões da Service Account
3. **Se NÃO for Shared Drive:** Crie um Shared Drive (requer Google Workspace)

