# 🔐 Como Funcionam as Permissões com OAuth Centralizado

## ✅ Resposta Rápida

**NÃO, o token OAuth centralizado NÃO interfere nos níveis de acesso!**

O token OAuth é apenas uma **"chave de acesso"** ao Google Drive. As **permissões** (quem pode ver o quê) são controladas pelo **sistema interno**.

---

## 🔄 Como Funciona o Fluxo

### 1. **Autenticação no Sistema** (Login)
```
Usuário faz login → Sistema identifica:
- Role: root, admin ou user
- Folder: pasta específica do usuário
- Permissions: upload, download, delete, etc.
```

### 2. **Verificação de Permissões** (Antes de Acessar)
```
Usuário tenta acessar pasta → Sistema verifica:
- canAccessFolder() → Pode acessar esta pasta?
- hasPermission() → Tem permissão para esta ação?
```

### 3. **Acesso ao Google Drive** (Se Permitido)
```
Se permitido → Sistema usa token OAuth para acessar Google Drive
Mas só lista/upload na pasta que o usuário tem permissão
```

---

## 📋 Exemplos Práticos

### Exemplo 1: Usuário "user" tentando acessar pasta "leiloes"

```php
// 1. Sistema verifica permissão
$user = ['role' => 'user', 'folder' => 'puramarcha'];
$folder = 'leiloes';

canAccessFolder($user, 'leiloes'); 
// ❌ Retorna FALSE (user só acessa 'puramarcha')

// 2. Sistema BLOQUEIA antes mesmo de acessar Google Drive
jsonError('Sem acesso a esta pasta', 403);
```

**Resultado:** Usuário não vê nada, mesmo tendo token OAuth.

---

### Exemplo 2: Usuário "user" acessando sua própria pasta

```php
// 1. Sistema verifica permissão
$user = ['role' => 'user', 'folder' => 'puramarcha'];
$folder = 'puramarcha';

canAccessFolder($user, 'puramarcha'); 
// ✅ Retorna TRUE

// 2. Sistema converte para caminho do Google Drive
convertUserFolderToDrivePath($user, 'puramarcha');
// Retorna: 'puramarcha' (pasta específica do usuário)

// 3. Sistema usa token OAuth para listar APENAS essa pasta
$driveService->listFiles('puramarcha', true);
```

**Resultado:** Usuário vê apenas arquivos da pasta `puramarcha`.

---

### Exemplo 3: Admin acessando todas as pastas

```php
// 1. Sistema verifica permissão
$user = ['role' => 'admin', 'folder' => '*'];
$folder = '*';

canAccessFolder($user, '*'); 
// ✅ Retorna TRUE (admin acessa tudo)

// 2. Sistema converte para caminho do Google Drive
convertUserFolderToDrivePath($user, '*');
// Retorna: '*' (pasta raiz)

// 3. Sistema usa token OAuth para listar TODAS as pastas
$driveService->listFiles('', true);
```

**Resultado:** Admin vê todas as pastas e arquivos.

---

## 🛡️ Camadas de Segurança

### Camada 1: Sistema Interno (Permissões)
- ✅ Verifica `canAccessFolder()` ANTES de acessar Google Drive
- ✅ Verifica `hasPermission()` para cada ação (upload, delete, etc.)
- ✅ Converte pasta do usuário para caminho correto no Drive
- ✅ Bloqueia acesso não autorizado

### Camada 2: Google Drive (Autenticação)
- ✅ Token OAuth apenas autentica no Google Drive
- ✅ Não controla permissões internas
- ✅ Apenas permite acesso técnico ao Drive

---

## 📊 Tabela de Permissões

| Role | Pode Ver | Pode Upload | Pode Delete | Pasta Acessível |
|------|----------|-------------|-------------|-----------------|
| **ROOT** | Todas | Todas | Todas | `*` (todas) |
| **ADMIN** | Todas | Todas | Todas | `*` (todas) |
| **USER** | Apenas sua | Apenas sua | ❌ Não | `puramarcha` (exemplo) |

---

## ✅ Garantias

1. **Token OAuth é compartilhado** → Todos usam o mesmo token
2. **Permissões são individuais** → Cada usuário vê apenas o que tem permissão
3. **Verificação acontece ANTES** → Sistema bloqueia antes de acessar Google Drive
4. **Conversão de caminho** → `convertUserFolderToDrivePath()` garante que usuário só acessa sua pasta

---

## 🔍 Código que Garante Segurança

### Em `files.php`:
```php
// 1. Verificar acesso ANTES de acessar Google Drive
if (!canAccessFolder($user, $folder)) {
    jsonError('Sem acesso a esta pasta', 403);
    // ❌ Para aqui - nem tenta acessar Google Drive
}

// 2. Converter para caminho correto
$driveFolder = convertUserFolderToDrivePath($user, $folder);
// USER com folder='puramarcha' → sempre retorna 'puramarcha'
// ADMIN com folder='*' → retorna '*' (todas)

// 3. Só então acessa Google Drive
$files = $driveService->listFiles($driveFolder, true);
```

---

## 💡 Resumo

- **Token OAuth** = Chave de acesso ao Google Drive (compartilhada)
- **Permissões** = Controle de quem vê o quê (individual por usuário)
- **Sistema verifica permissões ANTES** de usar o token OAuth
- **Cada usuário vê apenas o que tem permissão**, mesmo usando o mesmo token

**É como ter uma chave mestra (token OAuth) para abrir o prédio (Google Drive), mas cada pessoa (usuário) só pode entrar nos quartos (pastas) que tem permissão!**

