# Resumo do Problema - Google Drive Upload

## Problema

Sistema PHP precisa fazer upload de arquivos para Google Drive usando Service Account, mas recebe erro:

```
"Service Accounts do not have storage quota. Leverage shared drives, or use OAuth delegation instead."
```

## Contexto

- **Objetivo:** Sistema centralizado que gerencia uploads de arquivos para Google Drive
- **Conta Google:** Conta pessoal gratuita (15 GB disponível)
- **Método atual:** Service Account do Google Cloud
- **Erro:** Service Accounts não têm quota própria e não podem ser donos de arquivos em contas pessoais

## Solução Necessária

Implementar **OAuth centralizado**:
- Um usuário autorizado (root/admin) faz login OAuth uma vez
- Sistema armazena o token desse usuário
- Todos os uploads usam esse token centralizado
- Funciona com conta pessoal gratuita (usa quota do usuário autorizado)

## Requisitos Técnicos

1. **OAuth Client ID/Secret** do Google Cloud Console
2. **Endpoint de autorização** (`/api/oauth-drive.php`)
3. **Modificar DriveService** para aceitar token OAuth em vez de Service Account
4. **Armazenar token** na sessão do servidor
5. **Renovação automática** de token expirado usando refresh_token

## Status Atual

- ✅ Estrutura OAuth criada (`oauth-drive.php`)
- ✅ `DriveService` modificado para aceitar token OAuth
- ⚠️ Falta configurar OAuth Client ID/Secret no `drive_config.php`
- ⚠️ Falta testar fluxo completo

## Arquivos Modificados

- `api/drive_service.php` - Aceita token OAuth no construtor
- `api/oauth-drive.php` - Endpoint de autorização OAuth
- `api/files.php` - Usa token OAuth para uploads
- `api/config/drive_config.php` - Configuração OAuth (precisa preencher)

