import { useState, useEffect } from 'react';
import { 
  LogOut, Users, 
  LayoutDashboard, Settings, BarChart3,
  Menu, X, User as UserIcon, Shield
} from 'lucide-react';
import * as api from '../lib/api';
import Analytics from './Analytics';
import InternalUsersStats from './InternalUsersStats';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

type TabType = 'overview' | 'analytics' | 'users' | 'internal_stats' | 'settings';

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'users' && (user.role === 'admin' || user.role === 'root')) {
      loadUsers();
    }
  }, [activeTab, user]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.getUsers();
      if (response.users) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'analytics', label: 'Estatísticas', icon: BarChart3 },
    ...(user.role === 'admin' || user.role === 'root' 
      ? [{ id: 'users', label: 'Usuários', icon: UserIcon }]
      : []),
    ...(user.role === 'root' 
      ? [{ id: 'internal_stats', label: 'Estatísticas Internas', icon: Shield }]
      : []),
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-black text-white transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      } fixed h-screen z-40 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            {sidebarOpen && (
              <div className="flex-1 flex justify-center">
                <img 
                  src="/logo.png" 
                  alt="Grupo Raça" 
                  className="h-12 w-auto object-contain"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          {sidebarOpen && (
            <p className="text-xs text-gray-400 font-medium text-center">Sistema Interno</p>
          )}
        </div>

        <nav className="p-4 space-y-2 flex-1 pb-32 overflow-y-auto scrollbar-hide">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as TabType);
                // Fechar sidebar no mobile após clicar em um item
                if (window.innerWidth < 768) {
                  setSidebarOpen(false);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-white text-black'
                  : 'hover:bg-gray-800 text-gray-300'
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800 flex-shrink-0 bg-black">
          <div className="p-4 bg-gray-800 rounded-lg">
            {sidebarOpen ? (
              <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
                <button
                  onClick={onLogout}
                  className="mt-3 w-full flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay para mobile quando sidebar está aberta */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 w-full ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu size={24} />
                </button>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-black">
                    {menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600 hidden md:block">Bem-vindo de volta, {user.name}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-black/30 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Carregando dados...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                    <h2 className="text-2xl font-bold text-black mb-4">Bem-vindo ao Sistema Interno</h2>
                    <p className="text-gray-600 mb-6">
                      Gerencie estatísticas do site, usuários e configurações do sistema.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <BarChart3 size={24} className="text-black mb-2" />
                        <h3 className="font-semibold text-black mb-1">Estatísticas</h3>
                        <p className="text-sm text-gray-600">Visualize dados do Google Analytics</p>
                      </div>
                      {(user.role === 'admin' || user.role === 'root') && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <Users size={24} className="text-black mb-2" />
                          <h3 className="font-semibold text-black mb-1">Usuários</h3>
                          <p className="text-sm text-gray-600">Gerencie usuários do sistema</p>
                        </div>
                      )}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Settings size={24} className="text-black mb-2" />
                        <h3 className="font-semibold text-black mb-1">Configurações</h3>
                        <p className="text-sm text-gray-600">Ajuste as preferências do sistema</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="animate-fadeIn">
                  <Analytics user={user} />
                </div>
              )}

              {activeTab === 'internal_stats' && user.role === 'root' && (
                <div className="animate-fadeIn">
                  <InternalUsersStats user={user} />
                </div>
              )}

              {activeTab === 'users' && (user.role === 'admin' || user.role === 'root') && (
                <div className="animate-fadeIn">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 md:p-6 border-b border-gray-200">
                    <h2 className="text-xl md:text-2xl font-bold text-black">Usuários do Sistema</h2>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">Lista de todos os usuários cadastrados no banco de dados</p>
                  </div>
                  {/* Desktop: Tabela */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nome</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Perfil</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pasta</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.length > 0 ? (
                          users.map((u: any) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-gray-600">{u.id}</td>
                              <td className="px-6 py-4 font-semibold text-black">{u.name || 'N/A'}</td>
                              <td className="px-6 py-4 text-gray-600">{u.email}</td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  u.role === 'root'
                                    ? 'bg-red-100 text-red-700'
                                    : u.role === 'admin'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {u.role === 'root' ? 'Root' : u.role === 'admin' ? 'Admin' : 'Usuário'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-600">{u.folder || '*'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                              Nenhum usuário encontrado
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile: Cards */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {users.length > 0 ? (
                      users.map((u: any) => (
                        <div key={u.id} className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-black text-base">{u.name || 'N/A'}</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              u.role === 'root'
                                ? 'bg-red-100 text-red-700'
                                : u.role === 'admin'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {u.role === 'root' ? 'Root' : u.role === 'admin' ? 'Admin' : 'Usuário'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 break-all">{u.email}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>ID: {u.id}</span>
                            <span>•</span>
                            <span>Pasta: {u.folder || '*'}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        Nenhum usuário encontrado
                      </div>
                    )}
                  </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="animate-fadeIn">
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h2 className="text-2xl font-bold text-black mb-6">Configurações</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-black mb-4">Perfil do Usuário</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Nome</label>
                          <input 
                            type="text" 
                            defaultValue={user.name} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" 
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                          <input 
                            type="email" 
                            defaultValue={user.email} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" 
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Perfil</label>
                          <input 
                            type="text" 
                            defaultValue={user.role === 'root' ? 'Root' : user.role === 'admin' ? 'Administrador' : 'Usuário'} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-gray-50" 
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
