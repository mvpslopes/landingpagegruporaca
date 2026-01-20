# Como Resolver o Erro 413 (Payload Too Large)

## Problema

O erro **413 Payload Too Large** ocorre quando o servidor web (Apache/Nginx) rejeita a requisição de upload antes mesmo de chegar ao PHP. Isso acontece porque há limites configurados no servidor web que são menores que o tamanho do arquivo que você está tentando enviar.

## Solução Completa

O erro 413 precisa ser resolvido em **3 níveis diferentes**:

### 1. Configurações do PHP (php.ini)

Edite o arquivo `php.ini` do servidor e configure:

```ini
; Tamanho máximo de arquivo para upload
upload_max_filesize = 1024M

; Tamanho máximo de dados POST (deve ser maior que upload_max_filesize)
post_max_size = 1024M

; Tempo máximo de execução (1 hora para uploads grandes)
max_execution_time = 3600

; Tempo máximo para receber dados POST
max_input_time = 3600

; Limite de memória (ajuste conforme necessário)
memory_limit = 512M
```

**Importante:** `post_max_size` deve ser **maior ou igual** a `upload_max_filesize`.

### 2. Configurações do Apache (.htaccess)

Se você estiver usando Apache, adicione ou atualize o arquivo `.htaccess` na pasta `api/`:

```apache
# Permitir uploads de até 1GB
php_value upload_max_filesize 1024M
php_value post_max_size 1024M
php_value max_execution_time 3600
php_value max_input_time 3600
php_value memory_limit 512M

# Limite do Apache para corpo da requisição (1GB)
LimitRequestBody 1073741824
```

**Nota:** Se o servidor não permitir `php_value` no `.htaccess`, você precisará editar o `php.ini` diretamente.

### 3. Configurações do Nginx

Se você estiver usando Nginx, edite o arquivo de configuração do site (geralmente em `/etc/nginx/sites-available/`):

```nginx
server {
    # ... outras configurações ...
    
    # Limite de tamanho do corpo da requisição (1GB)
    client_max_body_size 1024M;
    
    # Timeout para uploads grandes
    client_body_timeout 3600s;
    
    # Buffer para uploads
    client_body_buffer_size 128k;
    
    location ~ \.php$ {
        # ... outras configurações ...
        
        # Timeout do FastCGI
        fastcgi_read_timeout 3600;
        fastcgi_send_timeout 3600;
    }
}
```

## Verificação das Configurações

### Verificar Configurações do PHP

Crie um arquivo `phpinfo.php` na pasta `api/`:

```php
<?php
phpinfo();
?>
```

Acesse via navegador e verifique os valores de:
- `upload_max_filesize`
- `post_max_size`
- `max_execution_time`
- `max_input_time`
- `memory_limit`

**⚠️ IMPORTANTE:** Remova o arquivo `phpinfo.php` após verificar por questões de segurança!

### Verificar via Linha de Comando

```bash
php -i | grep -E "upload_max_filesize|post_max_size|max_execution_time"
```

## Passo a Passo para Resolver

### Para Servidores Compartilhados (cPanel, etc.)

1. Acesse o painel de controle (cPanel)
2. Procure por "PHP Configuration" ou "Select PHP Version"
3. Edite as configurações PHP:
   - `upload_max_filesize = 1024M`
   - `post_max_size = 1024M`
   - `max_execution_time = 3600`
4. Salve as alterações
5. Reinicie o servidor (se possível) ou aguarde alguns minutos

### Para Servidores Dedicados/VPS

1. **Localize o php.ini:**
   ```bash
   php --ini
   ```

2. **Edite o php.ini:**
   ```bash
   sudo nano /etc/php/8.x/apache2/php.ini
   # ou
   sudo nano /etc/php/8.x/fpm/php.ini
   ```

3. **Aplique as configurações acima**

4. **Reinicie o servidor:**
   ```bash
   # Apache
   sudo systemctl restart apache2
   
   # Nginx + PHP-FPM
   sudo systemctl restart nginx
   sudo systemctl restart php8.x-fpm
   ```

## Teste Após Configuração

1. Tente fazer upload de um arquivo de ~500 MB
2. Se funcionar, teste com arquivos maiores (até 1 GB)
3. Monitore os logs do servidor para verificar se há outros erros

## Troubleshooting

### Erro 413 Persiste

1. **Verifique se as alterações foram aplicadas:**
   - Use `phpinfo()` para confirmar
   - Reinicie o servidor web

2. **Verifique limites do servidor:**
   - Alguns provedores de hospedagem têm limites rígidos
   - Entre em contato com o suporte se necessário

3. **Verifique o .htaccess:**
   - Certifique-se de que não há conflitos
   - Alguns servidores não permitem `php_value` no .htaccess

### Erro 500 Após Configuração

- Verifique a sintaxe do `.htaccess`
- Verifique os logs de erro do Apache/Nginx
- Remova temporariamente o `.htaccess` para testar

### Timeout Durante Upload

- Aumente `max_execution_time` e `max_input_time`
- Aumente `client_body_timeout` no Nginx
- Considere implementar upload em chunks (já implementado para arquivos > 10MB)

## Configuração Recomendada para Arquivos de 1GB

```ini
# PHP
upload_max_filesize = 1024M
post_max_size = 1024M
max_execution_time = 3600
max_input_time = 3600
memory_limit = 512M

# Apache
LimitRequestBody = 1073741824  (1GB em bytes)

# Nginx
client_max_body_size = 1024M
client_body_timeout = 3600s
```

## Nota Importante

O sistema já está configurado no código para aceitar arquivos de até 1GB. O erro 413 é uma limitação do **servidor web**, não do código da aplicação. Após ajustar as configurações do servidor, o upload deve funcionar normalmente.
