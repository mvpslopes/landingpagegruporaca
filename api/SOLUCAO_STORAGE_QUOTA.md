# 🔧 Solução: Erro de Storage Quota no Google Drive

## ❌ Problema

**Erro:** `Service Accounts do not have storage quota`

Service Accounts do Google não têm quota de armazenamento própria. Elas precisam usar:
- **Shared Drives** (Google Workspace) OU
- **Pastas de contas Google pessoais**

## ✅ Soluções

### Opção 1: Usar Shared Drive (Recomendado - Google Workspace)

Se você tem Google Workspace:

1. **Criar um Shared Drive:**
   - Acesse Google Drive
   - Clique em "Novo" → "Shared Drive"
   - Nome: "Grupo Raça - Arquivos"
   - Adicione a Service Account como membro com permissão de "Gerenciador de Conteúdo"

2. **Mover a pasta raiz para o Shared Drive:**
   - Mova a pasta `GRUPO_RACA` para dentro do Shared Drive
   - Anote o novo ID da pasta (pode mudar)

3. **Atualizar configuração:**
   - Atualize `root_folder_id` no `drive_config.php` se necessário
   - O código já suporta Shared Drives automaticamente

### Opção 2: Usar Pasta de Conta Google Pessoal

Se você NÃO tem Google Workspace:

1. **Criar pasta em conta Google pessoal:**
   - Use uma conta Google pessoal (não Service Account)
   - Crie a pasta `GRUPO_RACA` nessa conta
   - Compartilhe com a Service Account como Editor

2. **Fazer upload para essa pasta:**
   - A Service Account pode fazer upload em pastas compartilhadas
   - O arquivo será "propriedade" da conta pessoal, mas acessível pela Service Account

### Opção 3: Usar Domain-Wide Delegation (Avançado)

Se você tem Google Workspace Admin:

1. Habilitar Domain-Wide Delegation na Service Account
2. Fazer upload "em nome de" um usuário do Workspace
3. Requer configuração adicional no Google Cloud Console

## 🎯 Solução Rápida (Recomendada)

**A solução mais simples é usar uma conta Google pessoal:**

1. Crie a pasta `GRUPO_RACA` em uma conta Google pessoal
2. Compartilhe com a Service Account como Editor
3. A Service Account pode fazer upload nessa pasta
4. Os arquivos ficam na conta pessoal, mas são acessíveis pela Service Account

## 📝 Próximos Passos

1. Verificar se a pasta raiz está em Shared Drive ou conta pessoal
2. Se necessário, mover para conta pessoal
3. Garantir que a Service Account tem acesso como Editor
4. Testar upload novamente

