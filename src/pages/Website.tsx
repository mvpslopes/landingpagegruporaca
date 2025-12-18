import { useState, useEffect } from 'react';
import { 
  Home, Info, Briefcase, Phone, Mail, MapPin, ArrowLeft, Calendar, 
  ShoppingBag, DollarSign, Users, FileText, Cloud, Instagram, 
  Building, Scale, TrendingUp, Image as ImageIcon, MessageCircle
} from 'lucide-react';
import Footer from '../components/Footer';

interface WebsiteProps {
  onBack?: () => void;
}

export default function Website({ onBack }: WebsiteProps) {
  const [activeSection, setActiveSection] = useState('home');
  const [weather, setWeather] = useState<any>(null);

  // Dados mockados
  const animalsForBreeding = [
    { id: '1', name: 'Thunder', breed: 'Mangalarga', age: 8, price: 'R$ 45.000', status: 'Disponível' },
    { id: '2', name: 'Spirit', breed: 'Quarto de Milha', age: 6, price: 'R$ 38.000', status: 'Disponível' },
    { id: '3', name: 'Apollo', breed: 'Árabe', age: 7, price: 'R$ 52.000', status: 'Disponível' },
  ];

  const animalsForDirectSale = [
    { id: '1', name: 'Bella', breed: 'Mangalarga', age: 5, price: 'R$ 35.000', status: 'Disponível' },
    { id: '2', name: 'Luna', breed: 'Quarto de Milha', age: 4, price: 'R$ 28.000', status: 'Disponível' },
    { id: '3', name: 'Stella', breed: 'Árabe', age: 6, price: 'R$ 42.000', status: 'Disponível' },
  ];

  const assessors = [
    { name: 'Ariane', phone: '(31) 9995-2074', email: 'ariane@gruporaca.com.br', whatsapp: '553199952074' },
    { name: 'Bruno Souza Lima', phone: '(31) 7153-7765', email: 'bruno@gruporaca.com.br', whatsapp: '553171537765' },
  ];

  const allAssessors = [
    { name: 'Erick', phone: '(31) 9995-2074', email: 'erick@gruporaca.com.br', whatsapp: '553199952074' },
    { name: 'Lagartixa', phone: '(31) 7153-7765', email: 'lagartixa@gruporaca.com.br', whatsapp: '553171537765' },
    { name: 'Gregório', phone: '(21) 98166-1949', email: 'gregorio@gruporaca.com.br', whatsapp: '5521981661949' },
    { name: 'Carlos Eduardo', phone: '(32) 9804-0180', email: 'carlos@gruporaca.com.br', whatsapp: '553298040180' },
  ];

  const departments = [
    { name: 'Administrativo', phone: '(31) 3333-3333', email: 'administrativo@gruporaca.com.br' },
    { name: 'Sede', phone: '(31) 3333-3334', email: 'sede@gruporaca.com.br' },
    { name: 'Jurídico', phone: '(31) 3333-3335', email: 'juridico@gruporaca.com.br' },
    { name: 'Financeiro', phone: '(31) 3333-3336', email: 'financeiro@gruporaca.com.br' },
    { name: 'Marketing', phone: '(31) 3333-3337', email: 'marketing@gruporaca.com.br' },
  ];

  const sponsors = [
    { name: 'Patrocinador 1', logo: '/logo.png' },
    { name: 'Patrocinador 2', logo: '/logo.png' },
    { name: 'Patrocinador 3', logo: '/logo.png' },
  ];

  // Buscar clima de Belo Horizonte
  useEffect(() => {
    // Mock de dados do clima (em produção usaria uma API real)
    setWeather({
      city: 'Belo Horizonte',
      temp: 28,
      condition: 'Ensolarado',
      humidity: 65,
      wind: 15
    });
  }, []);

  // Calendário do mês
  const getMonthCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const events = [
      { date: 5, title: 'Leilão Elite 2024', status: 'finalizado' },
      { date: 12, title: 'Leilão Primavera', status: 'finalizado' },
      { date: 20, title: 'Leilão Especial', status: 'agendado' },
      { date: 28, title: 'Leilão Verão', status: 'agendado' },
    ];

    const calendar = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendar.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvent = events.find(e => e.date === day);
      calendar.push({ day, event: dayEvent });
    }
    return calendar;
  };

  const sections = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'about', label: 'Sobre Nós', icon: Info },
    { id: 'services', label: 'Serviços', icon: Briefcase },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'breeding', label: 'Shopping de Coberturas', icon: ShoppingBag },
    { id: 'direct-sale', label: 'Venda Direta', icon: DollarSign },
    { id: 'assessors', label: 'Assessorias', icon: Users },
    { id: 'contact', label: 'Contato', icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => {
                  if (onBack) {
                    onBack();
                  } else {
                    window.location.href = '/';
                  }
                }}
                className="flex items-center gap-1 sm:gap-2 text-white hover:text-gray-300 transition-colors"
              >
                <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm hidden sm:inline">Voltar</span>
              </button>
              <div className="logo-shine">
                <img 
                  src="/logo.png" 
                  alt="Grupo Raça" 
                  className="h-8 sm:h-10 md:h-12 w-auto"
                />
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide -mr-2 sm:-mr-0">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg transition-all duration-200 whitespace-nowrap text-xs sm:text-sm ${
                    activeSection === section.id
                      ? 'bg-white text-black'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <section.icon size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" />
                  <span className="hidden xs:inline">{section.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>
        {activeSection === 'home' && (
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h1 className="text-5xl md:text-6xl font-extrabold text-black mb-6">
                  Bem-vindo ao <span className="text-gray-700">Grupo Raça</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Especialistas em leilões de elite, unindo tradição, inovação e excelência para impulsionar o mercado de criação. Conectando criadores e apaixonados pela raça desde 2009.
                </p>
              </div>

              {/* Clima */}
              {weather && (
                <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-md mx-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Clima em {weather.city}</p>
                      <p className="text-3xl font-bold text-black">{weather.temp}°C</p>
                      <p className="text-sm text-gray-600">{weather.condition}</p>
                    </div>
                    <Cloud size={48} className="text-gray-400" />
                  </div>
                </div>
              )}

              {/* Patrocinadores */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-black text-center mb-6">Nossos Patrocinadores</h3>
                <div className="flex justify-center items-center gap-8 flex-wrap">
                  {sponsors.map((sponsor, idx) => (
                    <div key={idx} className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-black transition-colors">
                      <img src={sponsor.logo} alt={sponsor.name} className="h-16 w-auto object-contain" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mb-6">
                    <Info size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-4">Nossa História</h3>
                  <p className="text-gray-600">
                    Mais de 15 anos de experiência no mercado de leilões equestres, realizando eventos de alto padrão.
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mb-6">
                    <Briefcase size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-4">Nossos Serviços</h3>
                  <p className="text-gray-600">
                    Leilões, assessoria comercial, consultoria e muito mais para o mercado equestre.
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mb-6">
                    <Phone size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-4">Contato</h3>
                  <p className="text-gray-600">
                    Entre em contato conosco e descubra como podemos ajudar você.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'about' && (
          <section className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-6">Sobre Nós</h2>
              </div>

              <div className="space-y-8 text-lg text-gray-700 leading-relaxed">
                <div>
                  <h3 className="text-2xl font-bold text-black mb-4">Nossa História</h3>
                  <p className="mb-4">
                    O Grupo Raça foi fundado em 2009 com a missão de revolucionar o mercado de leilões de cavalos no Brasil. 
                    Desde o início, nossa empresa se dedicou a promover eventos de alto padrão, conectando criadores, 
                    compradores e apaixonados pela raça equestre.
                  </p>
                  <p className="mb-4">
                    Ao longo de mais de 15 anos de atuação, consolidamos nossa posição como referência nacional no setor, 
                    realizando centenas de leilões que movimentaram milhares de animais e conectaram dezenas de milhares de pessoas.
                  </p>
                  <p>
                    Nossa trajetória é marcada pela busca constante da excelência, transparência nas transações e compromisso 
                    com o bem-estar animal. Hoje, somos reconhecidos como uma das principais empresas do segmento, sempre 
                    inovando e oferecendo os melhores serviços para o mercado equestre brasileiro.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-black mb-4">Nossa Missão</h3>
                  <p>
                    Promover a excelência no mercado de leilões de cavalos, conectando criadores, compradores e apaixonados 
                    pela raça através de eventos de alto padrão e serviços especializados, sempre com transparência, 
                    profissionalismo e respeito aos animais.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-black mb-4">Nossos Valores</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Transparência em todas as transações</li>
                    <li>Excelência no atendimento</li>
                    <li>Compromisso com a qualidade</li>
                    <li>Respeito aos animais e criadores</li>
                    <li>Inovação constante</li>
                    <li>Ética e responsabilidade</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-8 mt-12">
                  <h3 className="text-2xl font-bold text-black mb-4">Números que Falam</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-black mb-2">500+</p>
                      <p className="text-gray-600">Leilões Realizados</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-black mb-2">10k+</p>
                      <p className="text-gray-600">Clientes Atendidos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-black mb-2">15+</p>
                      <p className="text-gray-600">Anos de Experiência</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'services' && (
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-6">Nossos Serviços</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Oferecemos soluções completas para o mercado equestre
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                  <h3 className="text-2xl font-bold text-black mb-4">Leilões de Cavalos</h3>
                  <p className="text-gray-600 mb-4">
                    Realizamos leilões de alto padrão com animais de elite, garantindo transparência 
                    e segurança em todas as transações.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Leilões presenciais e online</li>
                    <li>Catalogamento profissional</li>
                    <li>Assessoria completa</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                  <h3 className="text-2xl font-bold text-black mb-4">Assessoria Comercial</h3>
                  <p className="text-gray-600 mb-4">
                    Nossa equipe de especialistas oferece consultoria completa para criadores e compradores.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Avaliação de animais</li>
                    <li>Orientação para compradores</li>
                    <li>Consultoria em lances</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                  <h3 className="text-2xl font-bold text-black mb-4">Gestão de Eventos</h3>
                  <p className="text-gray-600 mb-4">
                    Organizamos eventos equestres completos, desde a concepção até a execução.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Planejamento e logística</li>
                    <li>Estrutura completa</li>
                    <li>Suporte durante o evento</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                  <h3 className="text-2xl font-bold text-black mb-4">Consultoria Comercial</h3>
                  <p className="text-gray-600 mb-4">
                    Ajudamos criadores e investidores a tomar as melhores decisões no mercado equestre.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Análise de mercado</li>
                    <li>Estratégias de investimento</li>
                    <li>Acompanhamento personalizado</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'calendar' && (
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-6">Calendário de Eventos</h2>
                <p className="text-xl text-gray-600">
                  Acompanhe todos os nossos eventos do mês
                </p>
              </div>

              {/* Calendário do Mês */}
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-12">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-black mb-2">
                    {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </h3>
                </div>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {getMonthCalendar().map((dayData, idx) => {
                    if (!dayData) {
                      return <div key={idx} className="min-h-20"></div>;
                    }
                    const isToday = dayData.day === new Date().getDate();
                    return (
                      <div
                        key={idx}
                        className={`min-h-20 p-2 border border-gray-200 rounded-lg ${
                          isToday ? 'bg-black text-white' : 'bg-white'
                        }`}
                      >
                        <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-white' : 'text-gray-700'}`}>
                          {dayData.day}
                        </div>
                        {dayData.event && (
                          <div className={`text-xs p-1 rounded ${
                            isToday 
                              ? 'bg-white text-black' 
                              : dayData.event.status === 'finalizado'
                              ? 'bg-gray-300 text-gray-700'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {dayData.event.title}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Eventos Finalizados */}
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-black mb-6">Eventos Finalizados</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Leilão Elite 2024', date: '15 de Dezembro, 2024', location: 'Belo Horizonte, MG', total: 'R$ 2.5 milhões' },
                    { title: 'Leilão Primavera', date: '20 de Novembro, 2024', location: 'São Paulo, SP', total: 'R$ 1.8 milhões' },
                    { title: 'Leilão Especial', date: '5 de Janeiro, 2025', location: 'Rio de Janeiro, RJ', total: 'R$ 2.1 milhões' },
                  ].map((event, idx) => (
                    <div key={idx} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xl font-bold text-black mb-1">{event.title}</h4>
                          <p className="text-gray-600">{event.date} • {event.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total Arrecadado</p>
                          <p className="text-lg font-bold text-black">{event.total}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'breeding' && (
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-6">Shopping de Coberturas</h2>
                <p className="text-xl text-gray-600">
                  Animais disponíveis para cobertura em venda permanente
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {animalsForBreeding.map(animal => (
                  <div key={animal.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <ImageIcon size={48} className="text-gray-400" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-black mb-2">{animal.name}</h3>
                      <div className="space-y-2 mb-4">
                        <p className="text-gray-600"><span className="font-semibold">Raça:</span> {animal.breed}</p>
                        <p className="text-gray-600"><span className="font-semibold">Idade:</span> {animal.age} anos</p>
                        <p className="text-gray-600"><span className="font-semibold">Valor:</span> {animal.price}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          {animal.status}
                        </span>
                        <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                          Contatar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeSection === 'direct-sale' && (
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-6">Venda Direta</h2>
                <p className="text-xl text-gray-600">
                  Animais disponíveis para venda direta
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {animalsForDirectSale.map(animal => (
                  <div key={animal.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <ImageIcon size={48} className="text-gray-400" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-black mb-2">{animal.name}</h3>
                      <div className="space-y-2 mb-4">
                        <p className="text-gray-600"><span className="font-semibold">Raça:</span> {animal.breed}</p>
                        <p className="text-gray-600"><span className="font-semibold">Idade:</span> {animal.age} anos</p>
                        <p className="text-gray-600"><span className="font-semibold">Valor:</span> {animal.price}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          {animal.status}
                        </span>
                        <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                          Contatar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeSection === 'assessors' && (
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-6">Assessorias Técnicas</h2>
                <p className="text-xl text-gray-600">
                  Nossos especialistas estão prontos para atender você
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {assessors.map((assessor, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-2xl font-bold text-black mb-4">{assessor.name}</h3>
                    <div className="space-y-3">
                      <a
                        href={`tel:${assessor.phone}`}
                        className="flex items-center gap-3 text-gray-700 hover:text-black transition-colors"
                      >
                        <Phone size={18} />
                        <span>{assessor.phone}</span>
                      </a>
                      <a
                        href={`mailto:${assessor.email}`}
                        className="flex items-center gap-3 text-gray-700 hover:text-black transition-colors"
                      >
                        <Mail size={18} />
                        <span>{assessor.email}</span>
                      </a>
                      <a
                        href={`https://wa.me/${assessor.whatsapp}?text=${encodeURIComponent(`Olá, ${assessor.name}! Gostaria de mais informações sobre assessoria comercial.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <MessageCircle size={18} />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-black mb-6">Todos os Assessores</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {allAssessors.map((assessor, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-black transition-colors">
                      <h4 className="font-bold text-black mb-3">{assessor.name}</h4>
                      <div className="space-y-2">
                        <a
                          href={`tel:${assessor.phone}`}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
                        >
                          <Phone size={14} />
                          <span>{assessor.phone}</span>
                        </a>
                        <a
                          href={`https://wa.me/${assessor.whatsapp}?text=${encodeURIComponent(`Olá, ${assessor.name}!`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm bg-black text-white px-3 py-2 rounded hover:bg-gray-800 transition-colors"
                        >
                          <MessageCircle size={14} />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'contact' && (
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-6">Entre em Contato</h2>
                <p className="text-xl text-gray-600">
                  Estamos prontos para atender você
                </p>
              </div>

              {/* Contatos por Área */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-black mb-6">Contatos por Área</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map((dept, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <Building size={24} className="text-black" />
                        <h4 className="text-lg font-bold text-black">{dept.name}</h4>
                      </div>
                      <div className="space-y-2">
                        <a
                          href={`tel:${dept.phone}`}
                          className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
                        >
                          <Phone size={16} />
                          <span className="text-sm">{dept.phone}</span>
                        </a>
                        <a
                          href={`mailto:${dept.email}`}
                          className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
                        >
                          <Mail size={16} />
                          <span className="text-sm">{dept.email}</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulário de Cadastro */}
              <div className="bg-gray-50 rounded-xl p-8 mb-8">
                <h3 className="text-2xl font-bold text-black mb-4">Cadastre-se</h3>
                <p className="text-gray-600 mb-6">
                  Cadastre-se para ficar por dentro do que há de melhor na raça - receba atualizações diárias sobre eventos, leilões, notícias e muito mais através do nosso grupo no WhatsApp.
                </p>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nome</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" 
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone/WhatsApp</label>
                    <input 
                      type="tel" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" 
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" 
                      placeholder="seu@email.com"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Cadastrar e Entrar no Grupo WhatsApp
                  </button>
                </form>
              </div>

              {/* Formulário de Contato */}
              <div className="bg-gray-50 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-black mb-6">Envie uma Mensagem</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nome</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" 
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" 
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mensagem</label>
                    <textarea 
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none" 
                      placeholder="Sua mensagem..."
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Enviar Mensagem
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
