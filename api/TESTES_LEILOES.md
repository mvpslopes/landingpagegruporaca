# 🧪 Scripts de Teste - Sistema de Leilões

## Domínio: `gruporaca.app.br`

### 1. Validação da Tabela
**URL:** https://gruporaca.app.br/api/validar-tabela-leiloes.php

Verifica se a estrutura da tabela `auctions` está correta.

---

### 2. Verificação de Imagens
**URL:** https://gruporaca.app.br/api/verificar-imagens-leiloes.php

Mostra todos os leilões cadastrados e se suas imagens estão configuradas corretamente.

---

### 3. Teste de Acesso à Imagem (Diagnóstico Completo)
**URL:** https://gruporaca.app.br/api/test-auction-image.php?id=1pk1jsZHEyVdyp2Smw73tvaOycXrYceyr

Testa passo a passo:
- ✅ Verificação no banco de dados
- ✅ Verificação do token OAuth
- ✅ Teste do DriveService
- ✅ Teste de download direto
- ✅ Preview da imagem

**Para testar outro leilão, substitua o `id=` pelo `image_drive_id` do leilão.**

---

### 4. Teste Direto da Imagem
**URL:** https://gruporaca.app.br/api/view-auction-image.php?id=1pk1jsZHEyVdyp2Smw73tvaOycXrYceyr

Deve abrir a imagem diretamente no navegador.

**Com debug (mostra erros detalhados):**
https://gruporaca.app.br/api/view-auction-image.php?id=1pk1jsZHEyVdyp2Smw73tvaOycXrYceyr&debug=1

---

### 5. API Pública de Leilões
**URL:** https://gruporaca.app.br/api/get-auctions-public.php

Retorna JSON com todos os leilões ativos para o site.

---

## 🔧 Scripts SQL

### Adicionar Colunas Faltantes
Execute no phpMyAdmin ou cliente MySQL:
```sql
-- Arquivo: api/corrigir-tabela-leiloes-completo.sql
```

### Verificar Estrutura
```sql
DESCRIBE auctions;
```

---

## 📝 Checklist de Troubleshooting

Se a imagem não aparecer:

1. ✅ Verificar se `image_drive_id` está salvo no banco
2. ✅ Testar: https://gruporaca.app.br/api/test-auction-image.php?id=SEU_ID
3. ✅ Verificar logs do servidor (erros PHP)
4. ✅ Verificar se token OAuth está válido
5. ✅ Testar URL direta: https://gruporaca.app.br/api/view-auction-image.php?id=SEU_ID

---

## 🐛 Erros Comuns

### Erro 500
- Verificar logs do PHP
- Testar com `?debug=1` na URL
- Verificar se token OAuth está válido

### Imagem não carrega (sem erro)
- Verificar se arquivo existe no Google Drive
- Verificar permissões do arquivo no Drive
- Testar com script de diagnóstico

### Token OAuth expirado
- Acessar: https://gruporaca.app.br/api/oauth-drive.php
- Reautorizar o acesso ao Google Drive
