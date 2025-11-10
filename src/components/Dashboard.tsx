import { useState, useEffect } from 'react';
import { 
  LogOut, Calendar, Users, DollarSign, Package, 
  LayoutDashboard, FileText, Settings, BarChart3,
  Menu, X, Search, Filter, Download, Plus, Edit, Trash2
} from 'lucide-react';
import { getAuctions, getAnimals, getBidders } from '../lib/supabase';
import Modal from './Modal';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

type TabType = 'overview' | 'auctions' | 'animals' | 'bidders' | 'reports' | 'settings';

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [animals, setAnimals] = useState<any[]>([]);
  const [bidders, setBidders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewAuction, setShowNewAuction] = useState(false);
  const [showNewAnimal, setShowNewAnimal] = useState(false);
  const [showNewBidder, setShowNewBidder] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    // Simular delay de carregamento
    await new Promise(resolve => setTimeout(resolve, 800));
    try {
      const [auctionsData, animalsData, biddersData] = await Promise.all([
        getAuctions(),
        getAnimals(),
        getBidders()
      ]);

      setAuctions(auctionsData.data || []);
      setAnimals(animalsData.data || []);
      setBidders(biddersData.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'auctions', label: 'Leilões', icon: Calendar },
    { id: 'animals', label: 'Animais', icon: Package },
    { id: 'bidders', label: 'Lanceiros', icon: Users },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const stats = [
    {
      title: 'Leilões Ativos',
      value: auctions.filter(a => a.status !== 'finalizado').length,
      icon: Calendar,
      color: 'from-gray-600 to-gray-800',
      change: '+12%'
    },
    {
      title: 'Animais Cadastrados',
      value: animals.length,
      icon: Package,
      color: 'from-gray-700 to-gray-900',
      change: '+8%'
    },
    {
      title: 'Lanceiros',
      value: bidders.length,
      icon: Users,
      color: 'from-gray-600 to-gray-800',
      change: '+15%'
    },
    {
      title: 'Valor Total Estimado',
      value: `R$ ${animals.reduce((sum, a) => sum + (a.price || 0), 0).toLocaleString('pt-BR')}`,
      icon: DollarSign,
      color: 'from-gray-700 to-gray-900',
      change: '+23%'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredAnimals = animals.filter(animal => 
    animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAuctions = auctions.filter(auction =>
    auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    auction.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBidders = bidders.filter(bidder =>
    bidder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bidder.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewAuction = () => {
    setShowNewAuction(true);
  };

  const handleNewAnimal = () => {
    setShowNewAnimal(true);
  };

  const handleNewBidder = () => {
    setShowNewBidder(true);
  };

  const handleSaveAuction = (formData: any) => {
    const newAuction = {
      id: String(auctions.length + 1),
      ...formData,
      total_animals: 0,
      registered_bidders: 0,
      created_at: new Date().toISOString()
    };
    setAuctions([...auctions, newAuction]);
    setShowNewAuction(false);
  };

  const handleSaveAnimal = (formData: any) => {
    const newAnimal = {
      id: String(animals.length + 1),
      ...formData,
      created_at: new Date().toISOString()
    };
    setAnimals([...animals, newAnimal]);
    setShowNewAnimal(false);
  };

  const handleSaveBidder = (formData: any) => {
    const newBidder = {
      id: String(bidders.length + 1),
      ...formData,
      registered_auctions: [],
      total_bids: 0,
      created_at: new Date().toISOString()
    };
    setBidders([...bidders, newBidder]);
    setShowNewBidder(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-black text-white transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      } fixed h-screen z-40`}>
        <div className="p-4 border-b border-gray-800">
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

        <nav className="p-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
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

        <div className="absolute bottom-4 left-4 right-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            {sidebarOpen ? (
              <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
                <button
                  onClick={onLogout}
                  className="mt-3 w-full flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-black">
                  {menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-600">Bem-vindo de volta, {user.name}</p>
              </div>
              <div className="flex items-center gap-4">
                {(activeTab === 'animals' || activeTab === 'auctions') && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    />
                  </div>
                )}
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Filter size={20} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg`}>
                            <stat.icon size={24} className="text-white" />
                          </div>
                          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                            {stat.change}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm font-semibold mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold text-black">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-black">Leilões Recentes</h3>
                        <button className="text-sm text-gray-600 hover:text-black">Ver todos</button>
                      </div>
                      <div className="space-y-3">
                        {auctions.slice(0, 3).map(auction => (
                          <div key={auction.id} className="border-b border-gray-100 pb-3 last:border-0">
                            <p className="font-semibold text-black">{auction.title}</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(auction.date)} • {auction.location}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {auction.total_animals} animais • {auction.registered_bidders} lanceiros
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-black">Animais em Destaque</h3>
                        <button className="text-sm text-gray-600 hover:text-black">Ver todos</button>
                      </div>
                      <div className="space-y-3">
                        {animals.slice(0, 3).map(animal => (
                          <div key={animal.id} className="border-b border-gray-100 pb-3 last:border-0">
                            <p className="font-semibold text-black">{animal.name}</p>
                            <p className="text-sm text-gray-600">
                              {animal.breed} • {animal.age} anos • {animal.gender}
                            </p>
                            <p className="text-sm font-semibold text-green-600 mt-1">
                              {formatCurrency(animal.price)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'auctions' && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-black">Leilões</h2>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium">
                        <Download size={16} />
                        Exportar
                      </button>
                      <button 
                        onClick={handleNewAuction}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Plus size={16} />
                        Novo Leilão
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Título</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Data</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Local</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Animais</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Lanceiros</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredAuctions.map(auction => (
                          <tr key={auction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-semibold text-black">{auction.title}</td>
                            <td className="px-6 py-4 text-gray-600">{formatDate(auction.date)}</td>
                            <td className="px-6 py-4 text-gray-600">{auction.location}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                auction.status === 'inscricoes_abertas' 
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {auction.status === 'inscricoes_abertas' ? 'Inscrições Abertas' : 'Em Breve'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{auction.total_animals}</td>
                            <td className="px-6 py-4 text-gray-600">{auction.registered_bidders}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                                  <Edit size={16} />
                                </button>
                                <button className="p-2 hover:bg-red-100 rounded transition-colors text-red-600">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'animals' && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-black">Animais</h2>
                    <button 
                      onClick={handleNewAnimal}
                      className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Plus size={16} />
                      Novo Animal
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nome</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Raça</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Idade</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Gênero</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Proprietário</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Valor</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredAnimals.map(animal => (
                          <tr key={animal.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-semibold text-black">{animal.name}</td>
                            <td className="px-6 py-4 text-gray-600">{animal.breed}</td>
                            <td className="px-6 py-4 text-gray-600">{animal.age} anos</td>
                            <td className="px-6 py-4 text-gray-600">{animal.gender}</td>
                            <td className="px-6 py-4 text-gray-600">{animal.owner}</td>
                            <td className="px-6 py-4 font-semibold text-green-600">{formatCurrency(animal.price)}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                animal.status === 'disponivel' 
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {animal.status === 'disponivel' ? 'Disponível' : 'Reservado'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                                  <Edit size={16} />
                                </button>
                                <button className="p-2 hover:bg-red-100 rounded transition-colors text-red-600">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'bidders' && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-black">Lanceiros</h2>
                    <button 
                      onClick={handleNewBidder}
                      className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Plus size={16} />
                      Novo Lanceiro
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nome</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Telefone</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">CPF</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Leilões</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Lances</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {bidders.map(bidder => (
                          <tr key={bidder.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-semibold text-black">{bidder.name}</td>
                            <td className="px-6 py-4 text-gray-600">{bidder.email}</td>
                            <td className="px-6 py-4 text-gray-600">{bidder.phone}</td>
                            <td className="px-6 py-4 text-gray-600">{bidder.cpf}</td>
                            <td className="px-6 py-4 text-gray-600">{bidder.registered_auctions.length}</td>
                            <td className="px-6 py-4 text-gray-600">{bidder.total_bids}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                                  <Edit size={16} />
                                </button>
                                <button className="p-2 hover:bg-red-100 rounded transition-colors text-red-600">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h2 className="text-2xl font-bold text-black mb-6">Relatórios</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-black transition-colors text-left">
                        <BarChart3 size={32} className="mb-3 text-black" />
                        <h3 className="font-bold text-black mb-2">Relatório de Vendas</h3>
                        <p className="text-sm text-gray-600">Análise completa de vendas e receitas</p>
                      </button>
                      <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-black transition-colors text-left">
                        <Users size={32} className="mb-3 text-black" />
                        <h3 className="font-bold text-black mb-2">Relatório de Lanceiros</h3>
                        <p className="text-sm text-gray-600">Estatísticas e comportamento dos lanceiros</p>
                      </button>
                      <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-black transition-colors text-left">
                        <Package size={32} className="mb-3 text-black" />
                        <h3 className="font-bold text-black mb-2">Relatório de Animais</h3>
                        <p className="text-sm text-gray-600">Inventário e status dos animais</p>
                      </button>
                      <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-black transition-colors text-left">
                        <Calendar size={32} className="mb-3 text-black" />
                        <h3 className="font-bold text-black mb-2">Relatório de Leilões</h3>
                        <p className="text-sm text-gray-600">Performance e resultados dos leilões</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h2 className="text-2xl font-bold text-black mb-6">Configurações</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-black mb-4">Perfil do Usuário</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Nome</label>
                          <input type="text" defaultValue={user.name} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                          <input type="email" defaultValue={user.email} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-black mb-4">Preferências</h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="w-5 h-5" />
                          <span className="text-gray-700">Notificações por email</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="w-5 h-5" defaultChecked />
                          <span className="text-gray-700">Notificações push</span>
                        </label>
                      </div>
                    </div>
                    <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modais */}
      <Modal isOpen={showNewAuction} onClose={() => setShowNewAuction(false)} title="Novo Leilão">
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSaveAuction({
            title: formData.get('title'),
            date: formData.get('date'),
            location: formData.get('location'),
            status: formData.get('status')
          });
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Título</label>
            <input name="title" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Data</label>
            <input name="date" type="date" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Local</label>
            <input name="location" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select name="status" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none">
              <option value="em_breve">Em Breve</option>
              <option value="inscricoes_abertas">Inscrições Abertas</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setShowNewAuction(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Cancelar
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
              Salvar
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showNewAnimal} onClose={() => setShowNewAnimal(false)} title="Novo Animal">
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSaveAnimal({
            auction_id: formData.get('auction_id'),
            name: formData.get('name'),
            breed: formData.get('breed'),
            age: parseInt(formData.get('age') as string),
            gender: formData.get('gender'),
            price: parseFloat(formData.get('price') as string),
            owner: formData.get('owner'),
            status: formData.get('status')
          });
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nome</label>
            <input name="name" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Raça</label>
              <input name="breed" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Idade</label>
              <input name="age" type="number" required min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gênero</label>
              <select name="gender" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none">
                <option value="Macho">Macho</option>
                <option value="Fêmea">Fêmea</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select name="status" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none">
                <option value="disponivel">Disponível</option>
                <option value="reservado">Reservado</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Proprietário</label>
            <input name="owner" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Valor (R$)</label>
            <input name="price" type="number" required min="0" step="0.01" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Leilão</label>
            <select name="auction_id" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none">
              {auctions.map(auction => (
                <option key={auction.id} value={auction.id}>{auction.title}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setShowNewAnimal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Cancelar
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
              Salvar
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showNewBidder} onClose={() => setShowNewBidder(false)} title="Novo Lanceiro">
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSaveBidder({
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            cpf: formData.get('cpf')
          });
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nome</label>
            <input name="name" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input name="email" type="email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone</label>
            <input name="phone" type="tel" required placeholder="(00) 00000-0000" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">CPF</label>
            <input name="cpf" type="text" required placeholder="000.000.000-00" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setShowNewBidder(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Cancelar
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
              Salvar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
