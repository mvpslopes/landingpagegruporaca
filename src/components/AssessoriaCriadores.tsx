import { FileText, Calendar, ClipboardList, Users, Target, Zap, Award, Phone, Database, FileCheck } from 'lucide-react';

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
                className="group bg-black text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl font-bold hover:bg-gray-800 transition-all duration-300 flex flex-col items-center justify-center gap-1 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base w-full max-w-[320px] min-h-[84px] mx-auto"
              >
                <span className="flex items-center gap-2">
                  <Phone size={18} className="sm:w-5 sm:h-5" />
                  Ligar agora
                </span>
                <span className="font-semibold">(21) 3328-9772</span>
              </a>
            </div>

            {/* WhatsApp */}
            <div>
              <a
                href={`https://wa.me/5531990790604?text=${encodeURIComponent('Olá, gostaria de saber mais sobre a Assessoria Ariane Andrade.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-green-500 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl font-bold hover:bg-green-600 transition-all duration-300 flex flex-col items-center justify-center gap-1 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105 text-sm sm:text-base w-full max-w-[320px] min-h-[84px] mx-auto"
              >
                <span className="flex items-center gap-2">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    className="sm:w-5 sm:h-5"
                  >
                    <path d="M20.52 3.48A11.91 11.91 0 0 0 12.01 0C5.38 0 .02 5.36.02 11.99c0 2.11.55 4.17 1.6 5.99L0 24l6.18-1.62a11.96 11.96 0 0 0 5.82 1.48h.01c6.63 0 11.99-5.36 11.99-11.99 0-3.2-1.25-6.21-3.48-8.39Zm-8.51 18.35h-.01a9.98 9.98 0 0 1-5.09-1.39l-.36-.21-3.67.96.98-3.58-.23-.37A9.96 9.96 0 0 1 2.02 12C2.02 6.47 6.48 2.01 12.01 2.01c2.66 0 5.16 1.04 7.04 2.92a9.9 9.9 0 0 1 2.93 7.06c0 5.52-4.46 9.84-9.97 9.84Zm5.47-7.49c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.68-1.64-.93-2.25-.24-.58-.49-.5-.68-.5h-.58c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.9 1.22 3.1.15.2 2.11 3.22 5.11 4.51.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.08-.13-.27-.2-.57-.35Z" />
                  </svg>
                  Falar no WhatsApp
                </span>
                <span className="font-semibold">(31) 99079-0604</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

