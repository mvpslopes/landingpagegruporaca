# 🔐 API do Sistema de Banco de Dados - Grupo Raça

## 📁 Estrutura

```
api/
├── config.php          # Configurações gerais
├── permissions.php     # Sistema de permissões
├── auth.php            # Autenticação (login/logout)
├── users.php           # Gerenciamento de usuários (ROOT)
├── files.php           # Gerenciamento de arquivos
├── data/
│   └── users.json      # Dados dos usuários
└── .htaccess          # Proteção de segurança
```

## 🔑 Endpoints

### Autenticação

**POST** `/api/auth.php?action=login`
```json
{
  "email": "marcus@gruporaca.com.br",
  "password": "password"
}
```

**POST** `/api/auth.php?action=logout`

**GET** `/api/auth.php?action=check`

### Usuários (apenas ROOT)

**GET** `/api/users.php` - Listar todos os usuários

**POST** `/api/users.php` - Criar novo usuário
```json
{
  "email": "novo@email.com",
  "password": "senha123",
  "name": "Nome do Usuário",
  "role": "user",
  "folder": "pasta-do-usuario"
}
```

**DELETE** `/api/users.php?id=123` - Deletar usuário

**PUT** `/api/users.php` - Atualizar permissões
```json
{
  "id": 123,
  "permissions": {
    "upload": true,
    "download": true
  }
}
```

### Arquivos

**GET** `/api/files.php?folder=pasta` - Listar arquivos

**POST** `/api/files.php` - Upload de arquivo (FormData)

**DELETE** `/api/files.php?id=file123&folder=pasta` - Deletar arquivo

## 🔐 Senhas Padrão

**IMPORTANTE:** As senhas no arquivo `users.json` são hashes bcrypt. Para criar novas senhas, use:

```php
password_hash('senha123', PASSWORD_BCRYPT)
```

**Senhas padrão de teste:** `password` (para todos os usuários iniciais)

## 🚀 Próximos Passos

1. ✅ Estrutura base criada
2. ⏳ Integração com Google Drive API
3. ⏳ Upload real de arquivos
4. ⏳ Download de arquivos
5. ⏳ Listagem de arquivos do Drive

## 📝 Notas

- As operações de arquivos estão simuladas por enquanto
- Aguardando aquisição do plano Google Drive para integração completa
- Sistema de permissões já está funcional
- Autenticação por sessão PHP

