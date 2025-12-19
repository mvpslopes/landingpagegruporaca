import { useState, useEffect } from 'react';
import { LogIn, Database, Menu, X } from 'lucide-react';
import Hero from './components/Hero';
import FeaturedAuctions from './components/FeaturedAuctions';
import Assessors from './components/Assessors';
import AssessoriaCriadores from './components/AssessoriaCriadores';
import SocialLinks from './components/SocialLinks';
import Footer from './components/Footer';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DatabasePage from './components/Database';
import Loading from './components/Loading';
import CTA from './components/CTA';
import WhatsAppButton from './components/WhatsAppButton';
import { useTracking } from './hooks/useTracking';

function App() {
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showDatabase, setShowDatabase] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Inicializar tracking
  useTracking();

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('gruporaca_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      // Verificar se o usuário tem permissão (apenas admin e root)
      if (userData.role === 'admin' || userData.role === 'root') {
        setUser(userData);
      } else {
        // Remover usuário sem permissão do localStorage
        localStorage.removeItem('gruporaca_user');
      }
    }

    // Animação de carregamento inicial com a logo
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  const handleLoginSuccess = async (userData: any) => {
    setIsLoading(true);
    // Simular delay de carregamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser(userData);
    localStorage.setItem('gruporaca_user', JSON.stringify(userData));
    setIsLoading(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Delay para feedback visual e logout na API
      await Promise.all([
        fetch('/api/auth.php?action=logout', { 
          method: 'POST',
          credentials: 'include'
        }).catch(() => {}), // Ignorar erros
        new Promise(resolve => setTimeout(resolve, 600))
      ]);
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    } finally {
      // Fade out antes de limpar
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setUser(null);
      localStorage.removeItem('gruporaca_user');
      setIsLoggingOut(false);
    }
  };

  // Tela de carregamento inicial do site com a logo ao centro
  if (initialLoading) {
    return <Loading variant="splash" />;
  }

  // Se mostrar banco de dados, exibir página separada
  if (showDatabase) {
    return <DatabasePage />;
  }

  // Se o usuário estiver logado, mostrar o dashboard
  if (user) {
    return (
      <>
        {isLoggingOut && <Loading message="Saindo do sistema..." />}
        <Dashboard user={user} onLogout={handleLogout} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18 md:h-20">
            <div className="flex items-center">
              <div className="logo-shine">
                <img 
                  src="/logo.png" 
                  alt="Grupo Raça" 
                  className="h-8 sm:h-10 md:h-12 w-auto"
                />
              </div>
            </div>
            
            {/* Menu Desktop - sempre visível */}
            <div className="hidden md:flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
              <a href="#leiloes" className="text-gray-300 hover:text-white transition-colors duration-200 whitespace-nowrap text-sm sm:text-base font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded hover:bg-gray-800/50">
                Leilões
              </a>
              <a href="#assessores" className="text-gray-300 hover:text-white transition-colors duration-200 whitespace-nowrap text-sm sm:text-base font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded hover:bg-gray-800/50">
                Assessores
              </a>
              <a href="#assessoria-criadores" className="text-gray-300 hover:text-white transition-colors duration-200 whitespace-nowrap text-sm sm:text-base font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded hover:bg-gray-800/50">
                Assessoria aos Criadores
              </a>
              <div className="flex items-center gap-4 ml-2">
                <button 
                  onClick={() => setShowDatabase(true)}
                  className="text-white px-4 xl:px-6 py-2 xl:py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 border border-gray-400/50 hover:scale-105 text-sm xl:text-base"
                  style={{
                    background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.2), rgba(160, 160, 160, 0.3), rgba(192, 192, 192, 0.2))',
                    boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(192, 192, 192, 0.3), rgba(200, 200, 200, 0.4), rgba(192, 192, 192, 0.3))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(192, 192, 192, 0.2), rgba(160, 160, 160, 0.3), rgba(192, 192, 192, 0.2))';
                  }}
                >
                  <Database size={18} />
                  Banco de Dados
                </button>
                <button 
                  onClick={() => setShowLogin(true)}
                  className="text-white px-4 xl:px-6 py-2 xl:py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 border border-gray-400/50 hover:scale-105 text-sm xl:text-base"
                  style={{
                    background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.3), rgba(160, 160, 160, 0.4), rgba(192, 192, 192, 0.3))',
                    boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.2), 0 2px 4px rgba(0, 0, 0, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(192, 192, 192, 0.4), rgba(200, 200, 200, 0.5), rgba(192, 192, 192, 0.4))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(192, 192, 192, 0.3), rgba(160, 160, 160, 0.4), rgba(192, 192, 192, 0.3))';
                  }}
                >
                  <LogIn size={18} />
                  Sistema Interno
                </button>
              </div>
            </div>

            {/* Botão Menu Hambúrguer - apenas mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu Mobile - Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-black">
            <div className="px-4 py-4 space-y-2">
              <a
                href="#leiloes"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-300 hover:text-white hover:bg-gray-800/50 px-4 py-3 rounded-lg transition-colors duration-200 font-medium"
              >
                Leilões
              </a>
              <a
                href="#assessores"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-300 hover:text-white hover:bg-gray-800/50 px-4 py-3 rounded-lg transition-colors duration-200 font-medium"
              >
                Assessores
              </a>
              <a
                href="#assessoria-criadores"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-300 hover:text-white hover:bg-gray-800/50 px-4 py-3 rounded-lg transition-colors duration-200 font-medium"
              >
                Assessoria aos Criadores
              </a>
              <div className="border-t border-gray-800 pt-2 mt-2">
                <button
                  onClick={() => {
                    setShowDatabase(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-gray-300 hover:text-white hover:bg-gray-800/50 px-4 py-3 rounded-lg transition-colors duration-200 font-medium flex items-center gap-3"
                >
                  <Database size={20} />
                  Banco de Dados
                </button>
                <button
                  onClick={() => {
                    setShowLogin(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-gray-300 hover:text-white hover:bg-gray-800/50 px-4 py-3 rounded-lg transition-colors duration-200 font-medium flex items-center gap-3"
                >
                  <LogIn size={20} />
                  Sistema Interno
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <Hero />
      <FeaturedAuctions />
      <CTA />
      <Assessors />
      <AssessoriaCriadores />
      <SocialLinks />
      <Footer />
      <WhatsAppButton />

      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}

export default App;
