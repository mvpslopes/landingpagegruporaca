# 📦 Arquivos para Upload - Sistema de Estatísticas

## ✅ Checklist de Upload

### 1. **Backend PHP (NOVOS)** ⚠️ IMPORTANTE

Estes arquivos são **NOVOS** e precisam ser enviados para a pasta `api/` na hospedagem:

```
api/tracking.php          ← NOVO - Recebe eventos de tracking
api/statistics.php        ← NOVO - Fornece dados para dashboard
```

**Localização na hospedagem:** `/api/tracking.php` e `/api/statistics.php`

---

### 2. **Frontend (MODIFICADO - Precisa Rebuild)**

Os seguintes arquivos foram **MODIFICADOS** e precisam ser rebuildados:

#### Arquivos Modificados:
- `src/App.tsx` - Adicionado `useTracking()`
- `src/lib/api.ts` - Adicionada função `getStatistics()`
- `src/components/CTA.tsx` - Adicionado tracking de cliques
- `src/components/Hero.tsx` - Adicionado tracking de cliques
- `src/components/WhatsAppButton.tsx` - Adicionado tracking de cliques

#### Arquivo Novo:
- `src/hooks/useTracking.ts` - Hook de tracking

**⚠️ IMPORTANTE:** Você precisa fazer o **BUILD** do frontend antes de subir!

---

### 3. **Build do Frontend**

Execute o comando de build antes de fazer upload:

```bash
npm run build
```

Isso vai gerar os arquivos otimizados na pasta `dist/` que você já conhece.

---

### 4. **Arquivos para Upload na Hospedagem**

#### **Pasta `api/` (Backend PHP):**
```
api/tracking.php          ← NOVO
api/statistics.php        ← NOVO
```

#### **Pasta `dist/` (Frontend Build):**
Após executar `npm run build`, envie **TODOS** os arquivos da pasta `dist/`:
- `index.html`
- `assets/` (pasta inteira com JS e CSS)
- Todas as imagens
- `.htaccess` (se existir)

---

## 📋 Passo a Passo

### **Passo 1: Fazer Build**
```bash
npm run build
```

### **Passo 2: Upload dos Arquivos PHP**
Via FTP/File Manager, envie para a pasta `api/`:
- `api/tracking.php`
- `api/statistics.php`

### **Passo 3: Upload do Frontend**
Via FTP/File Manager, envie **TODOS** os arquivos da pasta `dist/` para a raiz do site (geralmente `public_html/` ou similar).

### **Passo 4: Verificar Banco de Dados**
Certifique-se de que as tabelas foram criadas:
- ✅ `page_views`
- ✅ `click_events`
- ✅ `user_sessions`
- ✅ `navigation_flow`

---

## 🔍 Verificação Pós-Upload

### 1. **Testar Tracking**
1. Acesse o site
2. Clique em alguns botões (Cadastre-se, WhatsApp, etc)
3. Navegue entre páginas
4. Verifique no banco de dados se os dados estão sendo salvos:
   ```sql
   SELECT COUNT(*) FROM page_views;
   SELECT COUNT(*) FROM click_events;
   SELECT COUNT(*) FROM user_sessions;
   ```

### 2. **Testar API de Estatísticas**
Faça login como admin/root e acesse:
```
https://seusite.com/api/statistics.php?action=overview&period=7d
```

Deve retornar JSON com dados (se já houver visitas).

---

## ⚠️ Observações Importantes

1. **Permissões:** Os arquivos PHP devem ter permissão de leitura (644 ou 755)

2. **Banco de Dados:** As tabelas já devem estar criadas (você disse que criou)

3. **Sessões:** O tracking usa cookies para manter sessões. Certifique-se de que cookies estão funcionando

4. **CORS:** Os arquivos PHP já têm headers CORS configurados

5. **Segurança:** A API `statistics.php` já verifica se o usuário é admin/root

---

## 📊 Resumo dos Arquivos

| Tipo | Arquivo | Status | Ação |
|------|---------|-------|------|
| Backend | `api/tracking.php` | NOVO | Upload direto |
| Backend | `api/statistics.php` | NOVO | Upload direto |
| Frontend | `src/hooks/useTracking.ts` | NOVO | Incluído no build |
| Frontend | `src/App.tsx` | MODIFICADO | Incluído no build |
| Frontend | `src/lib/api.ts` | MODIFICADO | Incluído no build |
| Frontend | `src/components/CTA.tsx` | MODIFICADO | Incluído no build |
| Frontend | `src/components/Hero.tsx` | MODIFICADO | Incluído no build |
| Frontend | `src/components/WhatsAppButton.tsx` | MODIFICADO | Incluído no build |

---

## 🚀 Comandos Rápidos

```bash
# 1. Fazer build
npm run build

# 2. Verificar se build foi criado
ls dist/

# 3. Verificar se arquivos PHP existem
ls api/tracking.php
ls api/statistics.php
```

---

**Pronto!** Após fazer o build e upload, o sistema de estatísticas estará funcionando! 🎉

