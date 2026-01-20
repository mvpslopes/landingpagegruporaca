# Configuração do Sidebar - Sistema Interno

Este conjunto de arquivos contém toda a configuração e estrutura do sidebar do sistema interno, permitindo que você adapte facilmente essa interface em outros projetos.

## 📁 Arquivos

- **`sidebar-config.json`** - Arquivo de configuração completo em JSON com todas as especificações do sidebar
- **`sidebar-config-example.tsx`** - Exemplo de implementação em React/TypeScript
- **`SIDEBAR_CONFIG_README.md`** - Este arquivo de documentação

## 🎨 Características

### Sidebar
- ✅ Design moderno com fundo preto e texto branco
- ✅ Colapsável (expande/contrai)
- ✅ Totalmente responsivo (mobile e desktop)
- ✅ Overlay no mobile
- ✅ Transições suaves
- ✅ Sistema de permissões baseado em roles

### Elementos Incluídos
- Header com logo e título
- Menu de navegação com ícones
- Footer com informações do usuário
- Botão de logout
- Sistema de permissões (root, admin, user)

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
npm install lucide-react
# ou
yarn add lucide-react
```

### 2. Importar a Configuração

```typescript
import sidebarConfig from './sidebar-config.json';
```

### 3. Usar o Componente de Exemplo

O arquivo `sidebar-config-example.tsx` contém uma implementação completa que você pode adaptar:

```typescript
import { Sidebar, Header } from './sidebar-config-example';

function MeuDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <Sidebar
      user={user}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
    />
  );
}
```

## 📋 Estrutura da Configuração

### Sidebar Layout
```json
{
  "layout": {
    "type": "fixed",
    "position": "left",
    "defaultOpen": true,
    "collapsible": true
  }
}
```

### Itens de Menu
Cada item do menu possui:
- `id`: Identificador único
- `label`: Texto exibido
- `icon`: Nome do ícone (lucide-react)
- `permissions`: Roles que podem acessar
- `order`: Ordem de exibição

### Permissões
O sistema suporta três níveis:
- **root**: Acesso total
- **admin**: Acesso administrativo
- **user**: Acesso básico

Use `"*"` no array de roles para permitir acesso a todos.

## 🎨 Personalização

### Cores
Edite a seção `theme.colors` no JSON:

```json
{
  "theme": {
    "colors": {
      "primary": {
        "background": "black",
        "text": "white"
      }
    }
  }
}
```

### Tamanhos
Ajuste os tamanhos do sidebar:

```json
{
  "layout": {
    "responsive": {
      "desktop": {
        "minimizedWidth": "80px",
        "expandedWidth": "256px"
      }
    }
  }
}
```

### Adicionar Novos Itens de Menu

```json
{
  "navigation": {
    "items": [
      {
        "id": "novo_item",
        "label": "Novo Item",
        "icon": "IconName",
        "permissions": {
          "roles": ["admin", "root"]
        },
        "order": 6
      }
    ]
  }
}
```

## 📱 Responsividade

### Mobile (< 768px)
- Sidebar funciona como overlay
- Fecha automaticamente ao clicar em um item
- Botão de menu no header

### Desktop (≥ 768px)
- Sidebar fixa na lateral
- Pode ser colapsada mantendo-se visível
- Largura mínima quando colapsada: 80px

## 🔧 Tecnologias Utilizadas

- **React** - Framework base
- **TypeScript** - Tipagem
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones

## 📝 Exemplo de Uso Completo

```typescript
import { useState } from 'react';
import { Sidebar, Header } from './sidebar-config-example';
import sidebarConfig from './sidebar-config.json';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = {
    name: 'João Silva',
    email: 'joao@example.com',
    role: 'admin'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={() => console.log('Logout')}
      />

      <div className={`
        flex-1 transition-all duration-300 w-full
        ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}
      `}>
        <Header
          activeTab={activeTab}
          userName={user.name}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 md:p-6">
          {/* Seu conteúdo aqui */}
        </main>
      </div>
    </div>
  );
}
```

## 🎯 Próximos Passos

1. Copie os arquivos para seu projeto
2. Ajuste as cores e estilos conforme necessário
3. Adicione seus próprios itens de menu
4. Configure as permissões conforme sua necessidade
5. Integre com seu sistema de autenticação

## 💡 Dicas

- Mantenha a estrutura do JSON para facilitar futuras modificações
- Use o sistema de permissões para controlar o acesso
- Personalize os ícones conforme sua necessidade
- Teste a responsividade em diferentes dispositivos

## 📄 Licença

Esta configuração pode ser livremente adaptada para seus projetos.

---

**Criado para facilitar a reutilização do design do sistema interno em outros projetos.**
