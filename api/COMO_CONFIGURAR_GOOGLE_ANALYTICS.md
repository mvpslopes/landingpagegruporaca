# 📊 Como Configurar Google Analytics 4 (GA4)

## 🎯 Objetivo
Configurar o Google Analytics 4 para coletar dados do site e exibir estatísticas no sistema interno.

## 📋 Passo a Passo

### **Passo 1: Criar Conta no Google Analytics** ⏱️ ~10 minutos

1. Acesse: https://analytics.google.com
2. Faça login com sua conta Google
3. Clique em **"Começar a medir"** ou **"Criar conta"**
4. Preencha:
   - **Nome da conta:** Grupo Raça (ou o nome que preferir)
   - **Nome da propriedade:** Landing Page Grupo Raça
   - **Fuso horário:** (UTC-03:00) Brasília
   - **Moeda:** Real brasileiro (BRL)
5. Clique em **"Avançar"** e depois **"Criar"**

### **Passo 2: Obter Measurement ID** ⏱️ ~2 minutos

1. Após criar a propriedade, você será direcionado para a tela de configuração
2. Procure por **"Measurement ID"** ou **"ID de medição"**
3. O formato será: `G-XXXXXXXXXX` (exemplo: `G-ABC123XYZ`)
4. **Copie este ID** - você vai precisar dele!

### **Passo 3: Configurar o Site** ⏱️ ~5 minutos

1. Abra o arquivo `index.html` na raiz do projeto
2. Procure por esta linha:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   ```
3. Substitua `G-XXXXXXXXXX` pelo seu Measurement ID real
4. Procure também por:
   ```javascript
   gtag('config', 'G-XXXXXXXXXX', {
   ```
5. Substitua `G-XXXXXXXXXX` pelo seu Measurement ID real também

### **Passo 4: Testar se Está Funcionando** ⏱️ ~5 minutos

1. Faça o build do projeto:
   ```bash
   npm run build
   ```
2. Acesse o site em produção (ou localhost se estiver testando)
3. Navegue pelo site e clique em alguns botões
4. No Google Analytics, vá em **"Relatórios"** → **"Tempo real"**
5. Você deve ver sua visita aparecendo em tempo real!

### **Passo 5: Verificar Eventos Customizados** ⏱️ ~5 minutos

1. No Google Analytics, vá em **"Eventos"** → **"Tempo real"**
2. Clique nos botões do site:
   - Botão "Cadastre-se"
   - Botão "Agenda de Leilões"
   - Botão WhatsApp
   - Link "Site Oficial"
3. Os eventos devem aparecer como:
   - `click_button`
   - `click_link`
   - `click_whatsapp`
   - `conversion` (quando clicar em "Cadastre-se")

## ✅ Checklist

- [ ] Conta criada no Google Analytics
- [ ] Propriedade GA4 criada
- [ ] Measurement ID obtido
- [ ] Measurement ID adicionado no `index.html` (substituir `G-XXXXXXXXXX`)
- [ ] Build feito e site atualizado
- [ ] Testado em tempo real no GA4
- [ ] Eventos customizados aparecendo

## 🔍 Onde Encontrar o Measurement ID

1. No Google Analytics, vá em **"Administração"** (ícone de engrenagem)
2. Na coluna **"Propriedade"**, clique em **"Fluxos de dados"**
3. Clique no fluxo de dados do seu site
4. O **Measurement ID** estará no topo da página

## 📊 Eventos que Serão Rastreados

Após configurar, os seguintes eventos serão automaticamente rastreados:

- ✅ **click_button** - Cliques em botões (com nome e localização)
- ✅ **click_link** - Cliques em links externos
- ✅ **click_whatsapp** - Cliques no botão WhatsApp
- ✅ **conversion** - Conversões (cliques em "Cadastre-se")

## ⚠️ Importante

- O Measurement ID pode ser público (não é uma informação sensível)
- Os dados começam a aparecer imediatamente no modo "Tempo real"
- Dados históricos podem levar algumas horas para aparecer
- Certifique-se de substituir `G-XXXXXXXXXX` em **ambos os lugares** no `index.html`

## 🚀 Próximos Passos

Após configurar o GA4 básico, podemos:
1. Configurar a API do Google Analytics para buscar dados no backend
2. Criar o dashboard de estatísticas no sistema interno
3. Adicionar mais eventos customizados se necessário

---

**Dúvidas?** Me avise que eu ajudo! 😊

