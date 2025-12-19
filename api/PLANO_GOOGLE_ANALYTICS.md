# 📊 Plano de Integração: Google Analytics 4 (GA4)

## 🎯 Objetivo
Integrar Google Analytics 4 no site e criar um dashboard interno que exiba as estatísticas do GA4, permitindo que administradores vejam dados de cliques, acessos e fluxo de navegação diretamente no sistema interno.

## ✅ Vantagens da Integração com GA4

1. **Gratuito e Robusto:** Google Analytics é gratuito e altamente escalável
2. **Sem Banco de Dados Próprio:** Não precisa criar tabelas de tracking
3. **Conformidade LGPD:** Google já implementa medidas de privacidade
4. **Dados Ricos:** Dispositivos, geolocalização, origem do tráfego, etc
5. **Tempo de Desenvolvimento:** Muito menor (~4-6h vs 13-17h)
6. **Manutenção:** Google cuida da infraestrutura

## 📋 Estrutura da Solução

### **Parte 1: Integração do GA4 no Site** ⏱️ ~1 hora

#### 1.1. Criar Conta/Propriedade no Google Analytics
- Acessar https://analytics.google.com
- Criar propriedade GA4
- Obter Measurement ID (formato: `G-XXXXXXXXXX`)

#### 1.2. Adicionar Script do GA4 no HTML
- Adicionar script do gtag.js no `index.html`
- Configurar eventos customizados para cliques importantes

#### 1.3. Eventos Customizados
Rastrear cliques em elementos importantes:
- Botão "Cadastre-se" (CTA principal)
- Botão WhatsApp
- Links de "Visitar Site Oficial"
- Links de assessores
- Botões de leilões

### **Parte 2: API do Google Analytics** ⏱️ ~2-3 horas

#### 2.1. Configurar Google Cloud Project
- Criar projeto no Google Cloud Console
- Habilitar Google Analytics Reporting API
- Criar Service Account
- Obter credenciais JSON

#### 2.2. Backend PHP para Buscar Dados
- Criar `api/analytics.php` que usa Google Analytics Reporting API
- Endpoints para buscar:
  - Visitas e visitantes únicos
  - Páginas mais visitadas
  - Eventos (cliques)
  - Dispositivos
  - Origem do tráfego
  - Tempo na página

#### 2.3. Autenticação
- Usar Service Account para autenticar
- Armazenar credenciais JSON de forma segura
- Validar permissões (apenas admin/root)

### **Parte 3: Dashboard de Estatísticas** ⏱️ ~2-3 horas

#### 3.1. Componente React
- Criar `src/components/Analytics.tsx`
- Exibir dados do GA4 em formato visual
- Gráficos e métricas principais

#### 3.2. Integração no Dashboard
- Adicionar aba "Estatísticas" no menu
- Restringir acesso para admin/root
- Filtros de período (hoje, semana, mês, customizado)

## 🔧 Implementação Técnica

### **1. Script do Google Analytics (index.html)**

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    'page_path': window.location.pathname,
    'send_page_view': true
  });
</script>
```

### **2. Eventos Customizados (src/utils/analytics.ts)**

```typescript
// Função para rastrear eventos customizados
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, parameters);
  }
};

// Exemplos de uso:
// trackEvent('click_cta', { button_name: 'Cadastre-se', location: 'hero' });
// trackEvent('click_whatsapp', { phone: '+553197215761' });
// trackEvent('click_link', { link_text: 'Visitar Site Oficial', link_url: 'https://gruporaca.com' });
```

### **3. Backend PHP (api/analytics.php)**

Usar biblioteca `google/apiclient` do Composer:

```php
<?php
require_once 'vendor/autoload.php';
require_once 'config.php';
require_once 'permissions_db.php';

use Google\Client;
use Google\Service\AnalyticsReporting;

// Verificar permissões (apenas admin/root)
session_start();
if (!isset($_SESSION['user']) || 
    ($_SESSION['user']['role'] !== 'admin' && $_SESSION['user']['role'] !== 'root')) {
    jsonError('Acesso negado', 403);
}

// Configurar cliente Google
$client = new Client();
$client->setAuthConfig('config/ga-credentials.json');
$client->addScope(AnalyticsReporting::ANALYTICS_READONLY);

// Buscar dados do GA4
// ... implementação dos endpoints
```

### **4. Componente React (src/components/Analytics.tsx)**

```typescript
import { useState, useEffect } from 'react';
import { BarChart3, Users, MousePointer, Globe, Smartphone } from 'lucide-react';
import * as api from '../lib/api';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d'); // 7 dias, 30 dias, etc

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.getAnalytics(period);
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Renderizar dashboard com gráficos
  // ...
}
```

## 📊 Métricas Disponíveis no GA4

1. **Visitas e Visitantes:**
   - Total de usuários
   - Novos vs recorrentes
   - Sessões
   - Taxa de rejeição

2. **Páginas:**
   - Páginas mais visitadas
   - Tempo médio na página
   - Taxa de saída

3. **Eventos (Cliques):**
   - Eventos customizados
   - Elementos mais clicados
   - Taxa de conversão

4. **Dispositivos:**
   - Desktop/Mobile/Tablet
   - Navegadores
   - Sistemas operacionais

5. **Origem do Tráfego:**
   - Tráfego orgânico
   - Referências
   - Direto
   - Social

6. **Geografia:**
   - País
   - Cidade
   - Idioma

## 🔐 Segurança e Configuração

### **Credenciais do Google Analytics**

1. **Measurement ID (Frontend):**
   - Pode ser público (vai no HTML)
   - Formato: `G-XXXXXXXXXX`

2. **Service Account (Backend):**
   - Deve ser privado
   - Arquivo JSON com credenciais
   - Armazenar em `api/config/ga-credentials.json`
   - Adicionar ao `.gitignore`

### **Permissões no Google Analytics**

1. No Google Analytics, adicionar Service Account como "Viewer"
2. No Google Cloud Console, garantir que a API está habilitada

## 📦 Dependências

### **Backend (PHP)**
```json
{
  "require": {
    "google/apiclient": "^2.15"
  }
}
```

### **Frontend (React)**
- Não precisa de bibliotecas adicionais
- Usar `window.gtag` diretamente ou criar utilitário simples

## 🚀 Fases de Implementação

### **Fase 1: Configuração Inicial** ⏱️ ~1 hora
- [ ] Criar propriedade no Google Analytics
- [ ] Obter Measurement ID
- [ ] Adicionar script do GA4 no `index.html`
- [ ] Testar se está coletando dados

### **Fase 2: Eventos Customizados** ⏱️ ~1 hora
- [ ] Criar utilitário `src/utils/analytics.ts`
- [ ] Adicionar tracking de cliques em elementos importantes
- [ ] Testar eventos no GA4 em tempo real

### **Fase 3: Backend API** ⏱️ ~2-3 horas
- [ ] Configurar Google Cloud Project
- [ ] Criar Service Account
- [ ] Instalar `google/apiclient` via Composer
- [ ] Criar `api/analytics.php` com endpoints
- [ ] Testar busca de dados

### **Fase 4: Dashboard Frontend** ⏱️ ~2-3 horas
- [ ] Criar componente `Analytics.tsx`
- [ ] Integrar com API backend
- [ ] Criar visualizações (gráficos, cards, tabelas)
- [ ] Adicionar filtros de período
- [ ] Adicionar aba no Dashboard
- [ ] Implementar controle de acesso

### **Fase 5: Melhorias** ⏱️ ~1 hora
- [ ] Adicionar loading states
- [ ] Tratamento de erros
- [ ] Cache de dados (opcional)
- [ ] Exportação de relatórios (opcional)

## ⚠️ Considerações Importantes

1. **LGPD/GDPR:**
   - Google Analytics já implementa medidas de privacidade
   - Pode ser necessário banner de cookies (depende do país)
   - IP anonimização pode ser configurada

2. **Performance:**
   - Script do GA4 é assíncrono (não bloqueia carregamento)
   - API do Google tem limites de requisições (quota)

3. **Custo:**
   - Google Analytics é gratuito
   - Google Cloud tem tier gratuito generoso
   - Service Account é gratuito

4. **Limitações:**
   - Dados em tempo real têm delay de algumas horas
   - Alguns dados podem levar até 24-48h para aparecer
   - API tem limites de quota (mas generosos para uso normal)

## 📝 Checklist de Configuração

### **Google Analytics:**
- [ ] Conta criada
- [ ] Propriedade GA4 criada
- [ ] Measurement ID obtido
- [ ] Script adicionado no site
- [ ] Eventos customizados configurados

### **Google Cloud:**
- [ ] Projeto criado
- [ ] Google Analytics Reporting API habilitada
- [ ] Service Account criada
- [ ] Credenciais JSON baixadas
- [ ] Service Account adicionada como Viewer no GA4

### **Backend:**
- [ ] Composer instalado
- [ ] `google/apiclient` instalado
- [ ] Credenciais JSON configuradas
- [ ] `api/analytics.php` criado
- [ ] Endpoints testados

### **Frontend:**
- [ ] Utilitário de tracking criado
- [ ] Eventos customizados implementados
- [ ] Componente Analytics criado
- [ ] Integrado no Dashboard
- [ ] Controle de acesso implementado

## 🎯 Resultado Final

Após implementação, o sistema interno terá:
- ✅ Aba "Estatísticas" no Dashboard
- ✅ Dados do Google Analytics exibidos
- ✅ Gráficos e visualizações
- ✅ Filtros de período
- ✅ Acesso restrito a admin/root
- ✅ Eventos customizados rastreados
- ✅ Sem necessidade de banco de dados próprio

---

**Tempo Total Estimado:** ~6-9 horas de desenvolvimento
**Prioridade:** Alta (solução mais eficiente)
**Complexidade:** Média-Baixa

