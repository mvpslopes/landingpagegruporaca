# Melhorias no Sistema de Upload

## Resumo das Alterações

Este documento descreve as melhorias implementadas no sistema de upload para suportar arquivos maiores e melhorar a performance.

## Alterações Realizadas

### 1. Aumento do Limite de Tamanho de Arquivo

**Antes:** 100 MB por arquivo  
**Agora:** 1 GB (1024 MB) por arquivo

**Arquivos modificados:**
- `api/config/drive_config.php`
- `api/config/b2_config.php`
- `api/config/onedrive_config.php`

### 2. Upload Resumável para Arquivos Grandes

Implementado upload resumável (chunked upload) no Google Drive para arquivos maiores que 10 MB.

**Benefícios:**
- Melhor confiabilidade para arquivos grandes
- Possibilidade de retomar uploads interrompidos
- Melhor uso de largura de banda
- Redução de timeouts

**Arquivo modificado:**
- `api/drive_service.php` - Adicionado método `uploadFileResumable()`

### 3. Progresso Real de Upload

Implementado monitoramento de progresso em tempo real no frontend usando XMLHttpRequest.

**Benefícios:**
- Feedback visual preciso do progresso
- Usuário pode acompanhar o upload em tempo real
- Melhor experiência para arquivos grandes

**Arquivos modificados:**
- `src/lib/api.ts` - Função `uploadFile()` agora suporta callback de progresso
- `src/components/Database.tsx` - Interface atualizada com progresso percentual

### 4. Atualização da Interface do Usuário

- Limite atualizado de 100MB para 1GB na mensagem informativa
- Barra de progresso com porcentagem exibida
- Melhor feedback visual durante o upload

## Configurações do Servidor PHP e Web

⚠️ **CRÍTICO:** O erro **413 (Payload Too Large)** ocorre quando o servidor web rejeita o upload antes de chegar ao PHP. É necessário configurar **3 níveis diferentes**:

### 1. PHP (php.ini)

```ini
upload_max_filesize = 1024M
post_max_size = 1024M
max_execution_time = 3600
max_input_time = 3600
memory_limit = 512M
```

### 2. Apache (.htaccess)

O arquivo `api/.htaccess` já foi atualizado com as configurações necessárias. Se ainda houver erro 413, verifique:

- Se o servidor permite `php_value` no `.htaccess`
- Se há `LimitRequestBody` configurado (já adicionado)

### 3. Nginx (se aplicável)

```nginx
client_max_body_size 1024M;
client_body_timeout 3600s;
```

**📖 Para instruções detalhadas, consulte:** `api/RESOLVER_ERRO_413.md`

## Limites por Serviço de Armazenamento

- **Google Drive:** Suporta até 5 TB por arquivo (nosso limite: 1 GB)
- **Backblaze B2:** Suporta até 10 GB por arquivo (nosso limite: 1 GB)
- **OneDrive:** Suporta até 250 GB por arquivo (nosso limite: 1 GB)

## Como Funciona o Upload Resumável

1. **Arquivos pequenos (< 10 MB):** Upload simples (multipart)
2. **Arquivos grandes (≥ 10 MB):** Upload resumável automático
   - Arquivo é dividido em chunks de 256 KB
   - Cada chunk é enviado sequencialmente
   - Progresso é monitorado em tempo real
   - Em caso de falha, pode ser retomado

## Testes Recomendados

1. ✅ Upload de arquivo pequeno (< 10 MB)
2. ✅ Upload de arquivo médio (50-100 MB)
3. ✅ Upload de arquivo grande (500 MB - 1 GB)
4. ✅ Upload múltiplo de arquivos grandes
5. ✅ Verificar progresso em tempo real
6. ✅ Testar com diferentes tipos de arquivo (vídeos, imagens, PDFs)

## Notas Técnicas

- O upload resumável é gerenciado automaticamente pela biblioteca Google API PHP
- O tamanho do chunk padrão é 256 KB (configurável em `drive_config.php`)
- O progresso é calculado baseado no upload do navegador para o servidor PHP
- O upload do PHP para o Google Drive também é monitorado internamente

## Suporte

Em caso de problemas:
1. Verificar logs do PHP (`error_log`)
2. Verificar logs do navegador (Console)
3. Verificar configurações do PHP (php.ini)
4. Verificar conexão com Google Drive API
