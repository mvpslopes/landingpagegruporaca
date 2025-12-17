# 📁 Como Criar Pastas no Google Drive para Usuários USER

## ✅ Resposta Rápida

**SIM, você já pode criar as pastas!** O sistema está configurado e funcionando.

## 📋 Lista de Pastas Necessárias

Baseado nos usuários USER cadastrados, você precisa criar estas pastas dentro da **pasta raiz** do Google Drive:

1. `leiloes` (Larissa Mendes)
2. `deolhonomarchador`
3. `topmarchador`
4. `arquitemraca`
5. `racaemarcha`
6. `portalmarchador`
7. `puramarcha`
8. `campolina`

## 🎯 Pasta Raiz do Google Drive

**ID da Pasta Raiz:** `1EeKxOPybc3QRtVS6RgOUY0TEirl4MBsD`

Esta é a pasta onde todas as pastas dos usuários devem ser criadas.

## 📝 Opção 1: Criar Manualmente no Google Drive

### Passo a Passo:

1. **Acesse o Google Drive** com a conta que tem acesso à pasta raiz
2. **Abra a pasta raiz** (ID: `1EeKxOPybc3QRtVS6RgOUY0TEirl4MBsD`)
3. **Crie as pastas** uma por uma:
   - Clique em "Novo" → "Pasta"
   - Nomeie exatamente como na lista acima
   - Repita para cada pasta

4. **Compartilhe com a Service Account (OBRIGATÓRIO):**
   - Para cada pasta criada, clique com botão direito → "Compartilhar"
   - Adicione o email: `grupo-raca-drive-service@tidal-triumph-481417-g3.iam.gserviceaccount.com`
   - Dê permissão de **Editor** (para poder criar/editar arquivos)
   - Clique em "Enviar"
   - **IMPORTANTE:** Repita isso para TODAS as 8 pastas!

5. **Verifique a Pasta Raiz:**
   - A pasta raiz também deve estar compartilhada com a Service Account
   - Se não estiver, compartilhe da mesma forma (Editor)

### ⚠️ Importante:
- Os nomes das pastas devem ser **exatamente** como estão no banco de dados (sem espaços extras, tudo minúsculo)
- Todas as pastas devem estar dentro da pasta raiz
- **A service account precisa ter acesso a TODAS as pastas** (raiz + todas as 8 pastas dos usuários)
- Use sempre permissão **Editor** (não apenas Visualizador)

## 🤖 Opção 2: Criar Automaticamente com Script PHP

**Mais fácil e rápido!** Use o script `criar-pastas-drive.php` que criará todas as pastas automaticamente.

### Como usar:

1. **Acesse no navegador:**
   ```
   https://gruporaca.app.br/api/criar-pastas-drive.php
   ```
   (ou use o domínio temporário da Hostinger)

2. **O script irá:**
   - Conectar ao Google Drive
   - Verificar se a pasta raiz existe
   - Criar todas as pastas necessárias
   - Mostrar o resultado de cada criação

3. **Resultado esperado:**
   - ✅ Pasta criada: `larissa`
   - ✅ Pasta criada: `deolhonomarchador`
   - ✅ Pasta criada: `topmarchador`
   - ... e assim por diante

### ⚠️ Nota:
- Se uma pasta já existir, o script apenas informará que ela já existe
- O script cria as pastas com as permissões corretas automaticamente

## 🔍 Verificar se Funcionou

Após criar as pastas, você pode verificar:

1. **No Google Drive:** Verifique se todas as pastas aparecem na pasta raiz
2. **No sistema:** Faça login como um usuário USER e tente acessar sua pasta
3. **Via API:** Acesse `https://gruporaca.app.br/api/test-drive-connection.php`

## 📊 Mapeamento Completo

| Email | Nome | Pasta no Drive |
|-------|------|----------------|
| larissa@gruporaca.com.br | Larissa Mendes | `leiloes` |
| deolhonomarchador@gruporaca.com.br | De Olho no Marchador | `deolhonomarchador` |
| topmarchador@gruporaca.com.br | Top Marchador | `topmarchador` |
| arquitemraca@gruporaca.com.br | Arquitetem Raça | `arquitemraca` |
| racaemarcha@gruporaca.com.br | Raça e Marcha | `racaemarcha` |
| portalmarchador@gruporaca.com.br | Portal Marchador | `portalmarchador` |
| puramarcha@gruporaca.com.br | Pura Marcha | `puramarcha` |
| campolina@gruporaca.com.br | Campolina | `campolina` |

## 🎯 Próximos Passos

1. ✅ Criar as pastas (manual ou automático)
2. ✅ Verificar se estão acessíveis
3. ✅ Testar login de um usuário USER
4. ✅ Testar upload de arquivo

## 💡 Dica

**Recomendo usar o script automático** (`criar-pastas-drive.php`) porque:
- É mais rápido
- Garante que os nomes estão corretos
- Configura as permissões automaticamente
- Mostra um relatório completo

