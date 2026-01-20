## Resumo — Configuração de API e Requisições HTTP (LandingGrupoRaca)

Este documento consolida onde a aplicação configura a API, como faz requisições HTTP, detalhes de CORS e autenticação, e exemplos de chamadas para comparação com outro projeto.

---

## 1) Configuração da API

- **URL base padrão**: `'/api'`
- **Variável de ambiente** (Vite): `VITE_API_URL`
- **Local**: `src/lib/api.ts`

Trecho:

```ts
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

- **Arquivo `.env`**: não há `.env*` versionado na raiz do repositório (a base fica no código e pode ser sobrescrita por `VITE_API_URL` no ambiente).
- **Tipo de API**:
  - **API própria**: pasta `api/` com endpoints **PHP**.
  - **Integrações externas**: há scripts ligados a **Google Drive / OneDrive / Backblaze B2** dentro de `api/` (ex.: `api/oauth-drive.php`, `api/drive_service.php`, `api/onedrive_service.php`, etc.).

---

## 2) Como as requisições são feitas (HTTP client)

- **Biblioteca**: `fetch` nativo (não foi encontrado `axios` em `src/`).
- **Arquivo principal de chamadas**: `src/lib/api.ts`.
- **`credentials`**: a aplicação usa **`credentials: 'include'`** em praticamente todas as chamadas da API (sessão via cookie).
- **Headers comuns**:
  - Em chamadas JSON: `Content-Type: application/json`
  - Não foi observado envio de `Authorization` no frontend (apesar do backend permitir em CORS).

Exemplo (login) — `src/lib/api.ts`:

```ts
await fetch(`${API_BASE_URL}/auth.php?action=login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email, password }),
});
```

Outros pontos de uso de `fetch`:

- `src/App.tsx`: logout chama `'/api/auth.php?action=logout'` com `credentials: 'include'`.
- `src/components/Database.tsx`: chamadas para `view-file.php` / `download-file.php` também usam `credentials: 'include'`.

---

## 3) CORS (API própria / PHP)

Arquivo central: `api/config.php` (incluído por endpoints como `api/auth.php`).

Headers vistos em `api/config.php`:

```php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

- **Origens permitidas**: `*`
- **Allow-Credentials**:
  - **Não** está presente no `api/config.php`.
  - Existe em `api/view-file.php`: `Access-Control-Allow-Credentials: true` (junto com `Access-Control-Allow-Origin: *`).

Preflight:

- `api/config.php` trata `OPTIONS` retornando `200` e encerrando.

Observação para diagnóstico:

- O frontend usa `credentials: 'include'`. Em cenário **cross-origin**, CORS com credenciais **não pode** usar `Access-Control-Allow-Origin: *` e precisa de `Access-Control-Allow-Credentials: true` (além de origem específica).

---

## 4) Autenticação

- **Tipo**: sessão PHP (cookie de sessão; o frontend envia cookies via `credentials: 'include'`).
- **Onde inicia a sessão**: `api/config.php`:

```php
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}
```

- **Login no backend**: `api/auth.php?action=login`
  - Lê JSON do `php://input`
  - Valida usuário e senha
  - Define `$_SESSION['user']` (dados do usuário) e `$_SESSION['last_activity']`

- **Armazenamento no frontend**:
  - `localStorage` guarda um objeto do usuário para persistência da UI:
    - `gruporaca_user` (em `src/App.tsx` e `src/components/Login.tsx`)
  - Módulo “Database” tem fallback de `database_user` em `localStorage` (em `src/components/Database.tsx`).
  - Isso **não é** o token de autenticação; a autenticação “de verdade” depende do cookie da sessão do PHP.

Extra (tracking):

- `api/tracking.php` cria um cookie `gruporaca_session_id` (HttpOnly) para tracking, separado da sessão de auth.

---

## 5) Estrutura de pastas e `.htaccess`

- **Frontend**: `src/` (Vite + React + TypeScript).
- **API**: `api/` (PHP), separada do frontend.

Arquivos `.htaccess`:

- `public/.htaccess`: regras para SPA (React Router), gzip e cache de estáticos.
- `api/.htaccess`: regras de proteção (nega acesso a certos arquivos como `.json`, `db_config.php`, etc.) e headers de segurança.

Vite proxy (dev): `vite.config.ts`

- Proxy para `/api` apontando para `http://localhost` (servidor PHP/XAMPP) durante desenvolvimento.

---

## 6) Exemplo completo de requisição (Login)

Frontend → API (arquivo: `src/lib/api.ts`)

- **URL**: `${API_BASE_URL}/auth.php?action=login`
  - Efetivo: `VITE_API_URL + '/auth.php?action=login'` ou `'/api/auth.php?action=login'`
- **Método**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Credentials**:
  - `credentials: 'include'`
- **Body**:
  - `{"email":"...","password":"..."}`

Backend (arquivo: `api/auth.php`)

- Rota: `POST /api/auth.php?action=login`
- Cria sessão e retorna JSON com usuário (sem senha), ex.:
  - `{ "success": true, "user": { ... } }`

