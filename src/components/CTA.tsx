import { ArrowRight, Calendar, Phone } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-50"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="bg-white/5 backdrop-blur-md border-2 border-white/10 rounded-3xl p-12 md:p-16 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">
              Prepare seu lance!
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed whitespace-nowrap">
              Conectamos você as melhores oportunidades do mercado equestre
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <a
                href="#leiloes"
                className="group bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-white/20 hover:shadow-xl hover:shadow-white/30 hover:scale-105"
              >
                Leilões no Ar
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#assessores"
                className="group bg-green-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-700 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40 hover:scale-105"
              >
                <Phone size={20} />
                Contatos
              </a>
            </div>
            
            <div className="pt-8 text-gray-400 text-sm text-center">
              <span>Estamos sempre prontos para encontrar o melhor para a sua criação!</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

