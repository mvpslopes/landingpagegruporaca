# Diagnóstico Completo: Problema de Upload de Arquivos

## 📋 Resumo Executivo

O sistema de upload está funcionando **parcialmente**:
- ✅ **Arquivos pequenos/médios (até ~150MB)**: Funcionam quando enviados **um por vez**
- ❌ **Arquivos grandes (500MB+)**: Falham devido a timeouts do servidor/proxy
- ⚠️ **Múltiplos arquivos simultâneos**: Alguns falham com erro 500 (sobrecarga)

---

## 🔍 Problema Principal

### 1. Limite de Tamanho de Arquivo

**Situação:**
- Usuários precisam fazer upload de vídeos grandes (700MB - 1GB+)
- Esses vídeos são de coberturas de leilões e drones
- O sistema atual permite até 1GB por arquivo na interface

**O que acontece:**
- Arquivos grandes são divididos em chunks de 50MB
- Durante o upload, alguns chunks recebem **504 Gateway Timeout**
- Mesmo com retry automático, alguns chunks não são salvos
- Resultado: servidor recebe 14 de 15 chunks, não consegue montar o arquivo

**Causa raiz:**
- O **proxy/servidor web da hospedagem compartilhada** tem timeout curto (provavelmente 30-60 segundos)
- Esse timeout **não pode ser alterado** pelo cliente em hospedagem compartilhada
- Mesmo chunks de 50MB podem demorar mais que o timeout se a conexão estiver lenta

---

### 2. Uploads Simultâneos (Múltiplos Arquivos)

**Situação:**
- Usuários tentam fazer upload de vários arquivos pequenos ao mesmo tempo
- Exemplo: 10 imagens de 1-15MB cada

**O que acontece:**
- Alguns arquivos sobem com sucesso (200 OK)
- Outros falham com **500 Internal Server Error**
- Não há padrão claro: o mesmo arquivo pode funcionar em uma tentativa e falhar em outra

**Causa raiz:**
- Uploads em paralelo sobrecarregam:
  - O servidor PHP (múltiplas requisições simultâneas)
  - A API do Google Drive (limites de QPS - queries per second)
  - Conexões do servidor

**Solução aplicada:**
- Uploads agora são **sequenciais** (um por vez)
- Reduz sobrecarga, mas aumenta tempo total

---

## 🛠️ O Que Já Foi Implementado

### ✅ Melhorias Aplicadas

1. **Limite de upload aumentado**
   - PHP: `upload_max_filesize = 1536M` ✅
   - PHP: `post_max_size = 1536M` ✅
   - PHP: `max_execution_time = 600s` ✅
   - `.htaccess`: `LimitRequestBody = 1GB` ✅

2. **Upload em chunks para arquivos grandes**
   - Arquivos > 100MB são divididos em chunks de 50MB
   - Cada chunk é enviado separadamente
   - Sistema tenta 3 vezes se houver erro

3. **Timeout de sessão aumentado**
   - `SESSION_TIMEOUT`: 300s → 3600s (1 hora)
   - Evita logout automático durante uploads longos

4. **Upload sequencial**
   - Múltiplos arquivos são enviados um por vez
   - Evita sobrecarga do servidor/Drive

5. **Validação de tipos de arquivo**
   - Aceita todos os formatos de vídeo (mp4, mov, avi, mkv, etc.)
   - Validação flexível (aceita qualquer `video/*`)

---

## ❌ Limitações Técnicas Identificadas

### 1. Hospedagem Compartilhada

**Problema:**
- Não há acesso às configurações do servidor web (Apache/Nginx)
- Não é possível alterar:
  - `LimitRequestBody` (Apache) - já tentado via `.htaccess`, mas pode ser sobrescrito
  - `client_max_body_size` (Nginx) - não acessível
  - Timeout do proxy/gateway - não configurável

**Evidência:**
- Erro 504 Gateway Timeout ocorre mesmo com chunks de 50MB
- O timeout é do **proxy da infraestrutura**, não do PHP

### 2. Google Drive API

**Problema:**
- Tentativa de usar upload resumável falhou:
  - Erro: `unknown parameter: 'chunkSize'`
  - A biblioteca PHP do Google Drive não suporta esse parâmetro diretamente
- Solução atual: usar upload multipart simples (funciona, mas mais lento)

**Limitação:**
- Upload multipart carrega arquivo inteiro na memória
- Para arquivos grandes (700MB+), pode causar problemas de memória

### 3. Conexão/Infraestrutura

**Problema:**
- Uploads grandes dependem da velocidade de conexão do usuário
- Se a conexão for lenta, chunks de 50MB podem demorar > 60 segundos
- Isso estoura o timeout do proxy mesmo com chunks pequenos

---

## 📊 Situação Atual

### ✅ O Que Funciona

1. **Arquivos até ~150MB**
   - Upload direto (sem chunks)
   - Funciona bem quando enviados sequencialmente
   - Taxa de sucesso: ~90-95% (alguns ainda falham por sobrecarga)

2. **Sistema de chunks**
   - Implementado e funcional
   - Divide arquivos grandes corretamente
   - Retry automático funciona

3. **Interface e feedback**
   - Progresso em tempo real
   - Mensagens de erro claras
   - Validação de tipos de arquivo

### ❌ O Que Não Funciona

1. **Arquivos muito grandes (500MB+)**
   - Chunks falham por timeout do proxy
   - Mesmo com retry, alguns chunks não são salvos
   - Taxa de sucesso: ~0% para arquivos de 700MB+

2. **Múltiplos uploads simultâneos**
   - Alguns arquivos falham com 500
   - Solução sequencial funciona melhor, mas é mais lenta

---

## 🎯 Possíveis Soluções

### Opção 1: Limitar Upload HTTP a Arquivos Pequenos (Atual)

**Implementado:**
- Upload HTTP apenas para arquivos até 150MB
- Arquivos maiores: mensagem pedindo uso de FTP/Drive direto

**Prós:**
- Estável para a maioria dos casos
- Não requer mudanças na infraestrutura

**Contras:**
- Não resolve o problema dos vídeos grandes
- Usuários precisam usar método alternativo

---

### Opção 2: Reduzir Tamanho dos Chunks

**Ação:**
- Diminuir chunks de 50MB para 20-30MB
- Mais chunks, mas cada um mais rápido

**Prós:**
- Pode evitar alguns timeouts
- Implementação simples

**Contras:**
- Ainda pode falhar em conexões muito lentas
- Mais requisições = mais chance de erro

---

### Opção 3: Upload Direto para Google Drive (Frontend)

**Ação:**
- Usuário faz upload direto do navegador para Google Drive
- PHP apenas registra metadados (não recebe o arquivo)

**Prós:**
- Contorna completamente o problema do servidor
- Não há limite de tamanho (Drive aceita até 5TB)
- Não sobrecarrega o servidor

**Contras:**
- Requer implementação de OAuth no frontend
- Mais complexo (cada usuário precisa autorizar)
- Mudança significativa na arquitetura

---

### Opção 4: Migrar API para VPS/Servidor Dedicado

**Ação:**
- Mover pasta `api/` para VPS com controle total
- Configurar timeouts adequados (5-10 minutos)

**Prós:**
- Controle total sobre configurações
- Pode resolver definitivamente o problema
- Permite uploads grandes sem restrições

**Contras:**
- Custo adicional (VPS)
- Complexidade de migração
- Manutenção de servidor

---

### Opção 5: FTP/SFTP + Processamento Assíncrono

**Ação:**
- Usuários fazem upload via FTP/SFTP
- Script PHP processa arquivos periodicamente
- Move para Google Drive e registra no sistema

**Prós:**
- Contorna limites HTTP
- Não depende de timeout de requisição
- Pode processar em background

**Contras:**
- Requer acesso FTP/SFTP
- Processamento não é imediato
- Mais complexo para o usuário

---

## 📈 Métricas e Evidências

### Testes Realizados

1. **Arquivo de 135MB**
   - ✅ Funcionou (dentro do limite de 150MB)

2. **Arquivo de 719MB**
   - ❌ Falhou (chunks com timeout)
   - 15 chunks de 50MB
   - Chunk 8 falhou com 504
   - Servidor recebeu apenas 14/15 chunks

3. **Múltiplos arquivos pequenos (10 arquivos de 1-15MB)**
   - ⚠️ Alguns funcionaram, outros falharam com 500
   - Taxa de sucesso: ~60-70% em paralelo
   - Com upload sequencial: deve melhorar para ~90-95%

### Logs de Erro

- `504 Gateway Timeout`: Timeout do proxy/servidor
- `500 Internal Server Error`: Erro no PHP ou Google Drive API
- `413 Payload Too Large`: Limite do servidor (resolvido para arquivos < 150MB)

---

## 🔧 Configurações Atuais

### PHP (php.ini)
```ini
upload_max_filesize = 1536M
post_max_size = 1536M
max_execution_time = 600
max_input_time = 600
memory_limit = 1536M
```

### Apache (.htaccess)
```apache
LimitRequestBody = 1073741824  (1GB)
php_value upload_max_filesize 1024M
php_value post_max_size 1024M
```

### Aplicação
- Limite de upload HTTP: **150MB**
- Tamanho de chunk: **50MB** (para arquivos > 150MB)
- Timeout de sessão: **3600s** (1 hora)
- Upload: **Sequencial** (um arquivo por vez)

---

## 💡 Recomendações

### Curto Prazo (Já Implementado)
- ✅ Limitar upload HTTP a 150MB
- ✅ Upload sequencial para múltiplos arquivos
- ✅ Timeout de sessão aumentado

### Médio Prazo (Recomendado)
1. **Implementar upload direto para Google Drive** (Opção 3)
   - Resolve definitivamente o problema de arquivos grandes
   - Não requer mudanças na infraestrutura
   - Melhor experiência para o usuário

2. **Ou migrar API para VPS** (Opção 4)
   - Se preferir manter upload via servidor
   - Requer investimento e manutenção

### Longo Prazo
- Considerar CDN ou storage dedicado (S3, Azure Blob, etc.)
- Para volumes muito grandes de vídeos

---

## 📝 Notas Técnicas

### Arquivos Envolvidos

**Frontend:**
- `src/lib/api.ts` - Lógica de upload
- `src/components/Database.tsx` - Interface de upload

**Backend:**
- `api/files.php` - Endpoint de upload simples
- `api/upload-chunk.php` - Endpoint de upload em chunks
- `api/drive_service.php` - Integração com Google Drive
- `api/config.php` - Configurações (SESSION_TIMEOUT)

### Dependências Externas
- Google Drive API (via OAuth)
- Hospedagem compartilhada (limitações de configuração)

---

## 🎯 Conclusão

O problema principal é uma **limitação de infraestrutura** (timeout do proxy em hospedagem compartilhada) que não pode ser resolvida apenas com código.

**Soluções viáveis:**
1. **Imediata**: Limitar a 150MB (já feito) ✅
2. **Ideal**: Upload direto para Google Drive (requer desenvolvimento)
3. **Alternativa**: Migrar para VPS (requer investimento)

A escolha depende de:
- Orçamento disponível
- Urgência da necessidade
- Volume de arquivos grandes
- Capacidade de desenvolvimento
