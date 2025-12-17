# 🔧 Como Resolver o Erro de Storage Quota

## ❌ Erro Encontrado

```
Service Accounts do not have storage quota
```

## ✅ Solução: Usar Pasta Compartilhada de Conta Google Pessoal

Service Accounts não têm quota própria, mas podem fazer upload em **pastas compartilhadas** de contas Google pessoais.

## 📋 Passo a Passo

### 1. Verificar onde está a pasta raiz

A pasta `GRUPO_RACA` (ID: `1EeKxOPybc3QRtVS6RgOUY0TEirl4MBsD`) precisa estar em uma **conta Google pessoal** (não Service Account).

### 2. Se a pasta estiver na Service Account

**Opção A: Mover para conta pessoal (Recomendado)**

1. Acesse Google Drive com uma conta Google pessoal
2. Crie uma nova pasta chamada `GRUPO_RACA`
3. Compartilhe com a Service Account: `grupo-raca-drive-service@tidal-triumph-481417-g3.iam.gserviceaccount.com` como **Editor**
4. Mova todas as subpastas (`leiloes`, `deolhonomarchador`, etc.) para essa nova pasta
5. Atualize o `root_folder_id` no arquivo `api/config/drive_config.php` com o novo ID

**Opção B: Criar Shared Drive (se tiver Google Workspace)**

1. Crie um Shared Drive no Google Workspace
2. Adicione a Service Account como membro
3. Mova a pasta para o Shared Drive
4. O código já suporta Shared Drives automaticamente

### 3. Verificar Permissões

Certifique-se de que:
- ✅ A pasta raiz está compartilhada com a Service Account
- ✅ Todas as subpastas estão compartilhadas (ou herdam da raiz)
- ✅ Permissão é **Editor** (não apenas Visualizador)

### 4. Testar Upload

Após mover a pasta para conta pessoal:
1. Faça upload de um arquivo de teste
2. Verifique se aparece no Google Drive
3. Verifique se aparece na interface do sistema

## 🎯 Resumo

**O problema:** Service Account não tem quota própria  
**A solução:** Fazer upload em pastas de contas Google pessoais compartilhadas

O código já foi atualizado para suportar Shared Drives e pastas compartilhadas. Basta garantir que a pasta raiz esteja em uma conta pessoal compartilhada.

