import { ArrowRight, Calendar, Phone } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-50"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="bg-white/5 backdrop-blur-md border-2 border-white/10 rounded-3xl p-12 md:p-16 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="inline-block">
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-semibold text-white/90">
                Não Perca Esta Oportunidade
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">
              Pronto para participar?
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Inscreva-se agora e garante sua vaga nos maiores leilões de cavalos de elite do país
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <a
                href="#leiloes"
                className="group bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-white/20 hover:shadow-xl hover:shadow-white/30 hover:scale-105"
              >
                Ver Leilões Disponíveis
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="https://wa.me/5531999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-green-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-700 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40 hover:scale-105"
              >
                <Phone size={20} />
                Falar no WhatsApp
              </a>
            </div>
            
            <div className="pt-8 flex items-center justify-center gap-8 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>Inscrições abertas</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={18} />
                <span>Atendimento 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

