/**
 * Exemplo de implementação do Sidebar baseado na configuração sidebar-config.json
 * 
 * Este é um exemplo de como você pode adaptar a configuração do sidebar
 * em outro projeto React/TypeScript
 */

import { useState } from 'react';
import { 
  LayoutDashboard, BarChart3, User, Shield, Settings,
  Menu, X, LogOut
} from 'lucide-react';
import sidebarConfig from './sidebar-config.json';

// Mapeamento de ícones
const iconMap: Record<string, any> = {
  LayoutDashboard,
  BarChart3,
  User,
  Shield,
  Settings,
  LogOut,
  Menu,
  X
};

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: 'root' | 'admin' | 'user';
  };
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onLogout: () => void;
}

export function Sidebar({ user, activeTab, onTabChange, onLogout }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(sidebarConfig.sidebar.layout.defaultOpen);

  // Filtrar itens do menu baseado em permissões
  const getMenuItems = () => {
    return sidebarConfig.sidebar.navigation.items
      .filter(item => {
        const permissions = item.permissions.roles;
        // Se tem wildcard, todos podem acessar
        if (permissions.includes('*')) return true;
        // Caso contrário, verifica se o role do usuário está na lista
        return permissions.includes(user.role);
      })
      .sort((a, b) => a.order - b.order);
  };

  const menuItems = getMenuItems();
  const config = sidebarConfig.sidebar;

  return (
    <>
      {/* Sidebar */}
      <aside 
        className={`
          ${config.styling.classes.container}
          ${sidebarOpen ? config.styling.classes.expanded : config.styling.classes.collapsed}
          ${config.styling.classes.mobileHidden}
        `}
      >
        {/* Header */}
        {config.header.enabled && (
          <div className={`${config.header.padding} ${config.header.border.className} flex-shrink-0`}>
            <div className="flex items-center justify-between mb-3">
              {sidebarOpen && config.header.showLogo && (
                <div className="flex-1 flex justify-center">
                  <img 
                    src={config.header.logo.path}
                    alt={config.header.logo.alt}
                    className={config.header.logo.className}
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              )}
              {config.header.toggleButton.enabled && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={config.header.toggleButton.className}
                >
                  {sidebarOpen 
                    ? <iconMap[config.header.toggleButton.icon.open] size={config.header.toggleButton.size} />
                    : <iconMap[config.header.toggleButton.icon.closed] size={config.header.toggleButton.size} />
                  }
                </button>
              )}
            </div>
            {sidebarOpen && config.header.showTitle && (
              <p className={config.header.titleStyle.className}>
                {config.header.title}
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className={config.navigation.styling.container}>
          {menuItems.map(item => {
            const IconComponent = iconMap[item.icon];
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  // Fechar sidebar no mobile após clicar
                  if (config.navigation.behavior.closeOnMobileClick && 
                      window.innerWidth < sidebarConfig.breakpoints.mobile.max) {
                    setSidebarOpen(false);
                  }
                }}
                className={`
                  ${config.navigation.styling.item.base}
                  ${isActive 
                    ? config.navigation.styling.item.active 
                    : config.navigation.styling.item.inactive
                  }
                `}
              >
                {IconComponent && <IconComponent size={config.navigation.styling.icon.size} />}
                {sidebarOpen && (
                  <span className={config.navigation.styling.label.className}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {config.footer.enabled && (
          <div className={config.footer.styling.container}>
            <div className={config.footer.styling.userCard}>
              {sidebarOpen ? (
                <div>
                  {config.footer.userInfo.showName && (
                    <p className={config.footer.userInfo.nameStyle.className}>
                      {user.name}
                    </p>
                  )}
                  {config.footer.userInfo.showEmail && (
                    <p className={config.footer.userInfo.emailStyle.className}>
                      {user.email}
                    </p>
                  )}
                  {config.footer.logoutButton.enabled && (
                    <button
                      onClick={onLogout}
                      className={config.footer.logoutButton.expanded.className}
                    >
                      {iconMap[config.footer.logoutButton.icon] && (
                        <iconMap[config.footer.logoutButton.icon] 
                          size={config.footer.logoutButton.iconSize} 
                        />
                      )}
                      {config.footer.logoutButton.label}
                    </button>
                  )}
                </div>
              ) : (
                config.footer.logoutButton.enabled && (
                  <button
                    onClick={onLogout}
                    className={config.footer.logoutButton.collapsed.className}
                  >
                    {iconMap[config.footer.logoutButton.icon] && (
                      <iconMap[config.footer.logoutButton.icon] size={20} />
                    )}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

/**
 * Exemplo de uso do componente Header
 */
export function Header({ 
  activeTab, 
  userName, 
  onMenuClick 
}: { 
  activeTab: string; 
  userName: string;
  onMenuClick: () => void;
}) {
  const config = sidebarConfig.mainContent.header;
  const menuItem = sidebarConfig.sidebar.navigation.items.find(item => item.id === activeTab);

  return (
    <header className={config.styling.container}>
      <div className={config.styling.padding}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {config.mobileMenuButton.enabled && (
              <button
                onClick={onMenuClick}
                className={config.mobileMenuButton.className}
              >
                <iconMap[config.mobileMenuButton.icon] size={config.mobileMenuButton.iconSize} />
              </button>
            )}
            <div>
              <h1 className={config.title.className}>
                {menuItem?.label || 'Dashboard'}
              </h1>
              {config.subtitle.enabled && (
                <p className={config.subtitle.className}>
                  {config.subtitle.template.replace('{userName}', userName)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Exemplo de componente de Loading
 */
export function LoadingSpinner() {
  const config = sidebarConfig.loading;

  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="relative inline-block">
          <div 
            className={`w-16 h-16 border-4 border-${config.spinner.colors.secondary} border-t-${config.spinner.colors.primary} rounded-full animate-spin`}
          />
          <div 
            className={`absolute inset-0 w-16 h-16 border-4 border-transparent border-r-${config.spinner.colors.accent} rounded-full animate-spin`}
            style={{ 
              animationDirection: 'reverse', 
              animationDuration: config.spinner.animation.reverseDuration 
            }}
          />
        </div>
        <p className={config.message.className}>
          {config.message.text}
        </p>
      </div>
    </div>
  );
}

/**
 * Exemplo de uso completo
 */
export function DashboardExample() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = {
    name: 'João Silva',
    email: 'joao@example.com',
    role: 'admin' as const
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
        ${sidebarConfig.mainContent.content.transition.className}
        ${sidebarOpen 
          ? sidebarConfig.mainContent.content.spacing.marginLeft.expanded 
          : sidebarConfig.mainContent.content.spacing.marginLeft.collapsed
        }
      `}>
        <Header
          activeTab={activeTab}
          userName={user.name}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className={sidebarConfig.mainContent.content.styling.container}>
          {/* Seu conteúdo aqui */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-black mb-4">
              Conteúdo da aba: {activeTab}
            </h2>
          </div>
        </main>
      </div>
    </div>
  );
}
