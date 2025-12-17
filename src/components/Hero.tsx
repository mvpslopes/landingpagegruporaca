import { ChevronRight } from 'lucide-react';

export default function Hero() {

  return (
    <section className="relative min-h-[85vh] sm:min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Background com overlay mais sutil para destacar a imagem */}
      <div className="absolute inset-0 bg-cover bg-center brightness-110 saturate-110" style={{ backgroundImage: "url('/Fundo Cavalo preto.jpg')", transform: 'scaleX(-1)' }}></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/30 to-black/50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_60%)]"></div>
      
      {/* Overlay escuro apenas no lado esquerdo para legibilidade do texto */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>
      
      {/* Elementos decorativos mais sutis */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse opacity-50"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000 opacity-50"></div>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20 w-full overflow-x-hidden">
        <div className="flex items-center min-h-[70vh] sm:min-h-[80vh]">
          {/* Conteúdo principal */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in w-full">
            <div className="inline-block">
              <span className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm sm:text-xs md:text-sm font-semibold text-white/90" style={{ fontSize: '1rem' }}>
                Referência Nacional em Leilões
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold leading-[1.1] sm:leading-tight text-white">
              {/* Versão Mobile */}
              <div className="sm:hidden" style={{ fontSize: '3rem', lineHeight: '1.1' }}>
                <div>Estamos</div>
                <div>prontos para</div>
                <div>elevar o</div>
                <div>nível da sua</div>
                <div>criação</div>
              </div>
              {/* Versão Desktop */}
              <div className="hidden sm:block">
                <div>Estamos</div>
                <div>prontos para</div>
                <div>elevar o nível</div>
                <div>da sua criação</div>
              </div>
            </h1>
            
            <div className="text-lg sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-300 leading-snug sm:leading-relaxed max-w-2xl">
              {/* Versão Mobile */}
              <div className="sm:hidden" style={{ fontSize: '1.25rem', lineHeight: '1.5' }}>
                <div>Conectando criadores</div>
                <div>e apaixonados</div>
                <div>
                  pela raça com{' '}
                  <span className="text-white font-semibold">transparência</span>,
                </div>
                <div>
                  <span className="text-white font-semibold">profissionalismo</span>
                </div>
                <div>
                  e{' '}
                  <span className="text-white font-semibold">compromisso</span>
                </div>
                <div>
                  <span className="text-white font-semibold">com a excelência</span>.
                </div>
              </div>
              {/* Versão Desktop */}
              <div className="hidden sm:block">
                <div>Conectando criadores e apaixonados</div>
                <div>
                  pela raça com{' '}
                  <span className="text-white font-semibold">transparência</span>,{' '}
                  <span className="text-white font-semibold">profissionalismo</span>
                </div>
                <div>
                  e{' '}
                  <span className="text-white font-semibold">compromisso com a excelência</span>.
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 md:gap-4 pt-2">
              <a
                href="#leiloes"
                className="group bg-white text-black px-4 sm:px-5 md:px-6 lg:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-white/20 hover:shadow-xl hover:shadow-white/30 hover:scale-105 text-xs sm:text-sm md:text-base w-full sm:w-auto"
              >
                Agenda de Leilões
                <ChevronRight size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="https://gruporaca.app.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-transparent border-2 border-white/30 text-white px-4 sm:px-5 md:px-6 lg:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-bold hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm hover:scale-105 text-xs sm:text-sm md:text-base text-center w-full sm:w-auto"
              >
                Site Oficial
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator - apenas desktop */}
      <div className="hidden sm:block absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
}
