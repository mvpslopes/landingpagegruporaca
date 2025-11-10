import { ChevronRight, TrendingUp, Users, Award, Shield } from 'lucide-react';

export default function Hero() {
  const stats = [
    { icon: TrendingUp, value: '500+', label: 'Leilões Realizados' },
    { icon: Users, value: '10k+', label: 'Clientes Atendidos' },
    { icon: Award, value: '15+', label: 'Anos de Experiência' },
    { icon: Shield, value: '100%', label: 'Transparência' }
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Background com overlay mais sutil para destacar a imagem */}
      <div className="absolute inset-0 bg-[url('/rebanho-de-cavalos-correndo-pela-agua.jpg')] bg-cover bg-center brightness-110 saturate-110"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/30 to-black/50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_60%)]"></div>
      
      {/* Overlay escuro apenas no lado esquerdo para legibilidade do texto */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>
      
      {/* Elementos decorativos mais sutis */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse opacity-50"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000 opacity-50"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Conteúdo principal */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-block">
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-semibold text-white/90">
                Referência Nacional em Leilões
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
              <span className="block">Excelência em</span>
              <span 
                className="block bg-clip-text text-transparent animate-gradient"
                style={{
                  backgroundImage: 'linear-gradient(to right, #c0c0c0, #e8e8e8, #ffffff, #e8e8e8, #c0c0c0)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundSize: '200% auto'
                }}
              >
                Leilões de Cavalos
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl">
              Conectando criadores e apaixonados pela raça com{' '}
              <span className="text-white font-semibold">transparência</span> e{' '}
              <span className="text-white font-semibold">profissionalismo</span> desde 2009.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <a
                href="#leiloes"
                className="group bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-white/20 hover:shadow-xl hover:shadow-white/30 hover:scale-105"
              >
                Ver Leilões em Destaque
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#site"
                className="group bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm hover:scale-105"
              >
                Site Oficial
              </a>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform border border-gray-400/40"
                    style={{
                      background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.4), rgba(255, 255, 255, 0.2), rgba(192, 192, 192, 0.4))',
                      boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <stat.icon size={28} className="text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
}
