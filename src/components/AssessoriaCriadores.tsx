import { FileText, Calendar, ClipboardList, Users, Target, Zap, Award, Phone, MessageCircle, Database, FileCheck } from 'lucide-react';

export default function AssessoriaCriadores() {
  const services = [
    {
      icon: Users,
      title: 'Cadastros de novos associados',
      description: 'Facilitamos o processo de cadastro junto às associações.'
    },
    {
      icon: Calendar,
      title: 'Comunicados de prenhezes, embriões e nascimentos',
      description: 'Realizamos os comunicados dentro do prazo estipulado pelas associações, evitando multas.'
    },
    {
      icon: ClipboardList,
      title: 'Controle de plantel',
      description: 'Acompanhamento completo da gestação ao nascimento até o registro definitivo.'
    },
    {
      icon: FileText,
      title: 'Contratos e controle',
      description: 'Gestão de compra, venda e condomínios de animais.'
    },
    {
      icon: FileCheck,
      title: 'Abertura de serviços para o técnico',
      description: 'Acompanhamento completo da visita técnica.'
    },
    {
      icon: Database,
      title: 'Leitor de chip',
      description: 'Conferência e identificação dos animais.'
    },
    {
      icon: Award,
      title: 'Inscrições em copas e exposições',
      description: 'Facilitamos sua participação em eventos.'
    },
    {
      icon: Target,
      title: 'Sistema completo de gestão de plantel',
      description: 'Smart Criador - Solução completa para gestão do seu criatório.'
    },
    {
      icon: Zap,
      title: 'Toda demanda junto às associações',
      description: 'Atendemos todas as necessidades junto às associações das Raças.'
    },
    {
      icon: FileText,
      title: 'Transferências de propriedade',
      description: 'Gestão completa de transferências de propriedade de animais.'
    }
  ];

  return (
    <section id="assessoria-criadores" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-black/5 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/5 rounded-full blur-3xl opacity-50"></div>
      
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10 overflow-x-hidden">
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-black/5 rounded-full text-sm font-semibold text-gray-700">
              SERVIÇOS ESPECIALIZADOS
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-black mb-4 sm:mb-6 px-2 leading-tight">
            ASSESSORIA <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(to right, #000000, #808080, #000000)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >AOS CRIADORES</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-black mb-3 sm:mb-4 max-w-4xl mx-auto leading-snug sm:leading-tight px-2">
            Oferecemos aos criadores um atendimento de <span className="text-black">qualidade</span>,{' '}
            <span className="text-black">personalizado</span> de acordo com as{' '}
            <span className="text-black">demandas de cada cliente</span>!
          </p>
        </div>

        {/* Seção Ariane Andrade - Imagens */}
        <div className="mb-10 sm:mb-12 md:mb-16 lg:mb-20">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 overflow-hidden">
            {/* Imagem Mobile - Vertical */}
            <div className="md:hidden w-full flex justify-center">
              <img
                src="/arte-ariane-vertical.png"
                alt="Ariane Andrade - Assessoria aos Criadores"
                className="w-full h-auto object-contain"
              />
            </div>
            
            {/* Imagem Desktop - Horizontal */}
            <div className="hidden md:block w-full flex justify-center">
              <img
                src="/arte-ariane-horizontal.png"
                alt="Ariane Andrade - Assessoria aos Criadores"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>

        {/* Nossos Serviços */}
        <div className="mb-12 sm:mb-16 md:mb-20">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black mb-8 sm:mb-10 md:mb-12 text-center px-2">NOSSOS SERVIÇOS</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-black transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                >
                  <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center mb-4">
                    <IconComponent size={28} className="text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-black mb-3">{service.title}</h4>
                  <p className="text-gray-600 leading-relaxed text-sm">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Planejamento e Execução */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-12 sm:mb-16">
          <div className="bg-black rounded-3xl p-6 sm:p-8 md:p-10 text-white">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
              <Target size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
            </div>
            <h3 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">PLANEJAMENTO</h3>
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg">
              Analisar e definir os objetivos do criador e criatório, direcionando todas as pendências e demandas para o nosso setor operacional, cumprindo prazos das devidas necessidades estipulados pelas associações.
            </p>
          </div>

          <div className="bg-black rounded-3xl p-6 sm:p-8 md:p-10 text-white">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
              <Zap size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
            </div>
            <h3 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-white">EXECUÇÃO</h3>
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg">
              Oferecemos um atendimento humanizado, ágil e prático, para solucionar as necessidades dos clientes e do criatório conforme a demanda.
            </p>
          </div>
        </div>

        {/* Mensagem Final */}
        <div className="bg-gradient-to-r from-black to-gray-800 rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 text-white text-center mb-12 sm:mb-16">
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 px-2">
            Excelência e sucesso na sua criação!
          </h3>
        </div>

        {/* CTA */}
        <div className="text-center px-2">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-4">Pronto para transformar seu criatório?</h3>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Entre em contato e descubra como a Assessoria Ariane Andrade, pode ajudar você a alcançar seus objetivos.
          </p>
          
          {/* Contatos */}
          <div className="space-y-6 mb-8">
            {/* Central de Atendimento */}
            <div>
              <p className="text-base sm:text-lg font-semibold text-black mb-2">Central de Atendimento:</p>
              <a
                href="tel:2133289772"
                className="group bg-black text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl font-bold hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 inline-flex text-sm sm:text-base"
              >
                <Phone size={18} className="sm:w-5 sm:h-5" />
                (21) 3328-9772
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

