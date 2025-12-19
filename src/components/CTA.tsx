import { ArrowRight, Calendar } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { trackClick } from '../hooks/useTracking';
import { trackButtonClick } from '../utils/analytics';

export default function CTA() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <section className="py-20 bg-black relative overflow-hidden bg-gradient-animated">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-50 float-animation"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-50 float-animation" style={{ animationDelay: '1.5s' }}></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div 
          ref={ref}
          className={`bg-white/5 backdrop-blur-md border-2 border-white/10 rounded-3xl p-12 md:p-16 text-center glass-effect scroll-reveal scroll-reveal-scale ${isVisible ? 'revealed' : ''}`}
        >
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">
              Prepare seu lance!
            </h2>
            
            <div className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {/* Versão Mobile */}
              <div className="md:hidden">
                <div>Conectamos você às melhores</div>
                <div>oportunidades do mercado equestre.</div>
              </div>
              {/* Versão Desktop */}
              <div className="hidden md:block">
                <div>Conectamos você às melhores</div>
                <div>oportunidades do mercado equestre.</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <a
                href="#leiloes"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  trackClick('button', 'leiloes-no-ar', 'Leilões NO AR', Math.floor(e.clientX - rect.left), Math.floor(e.clientY - rect.top));
                  trackButtonClick('Leilões NO AR', 'cta');
                }}
                className="group bg-green-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-700 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40 hover:scale-105 button-shine ripple-effect"
              >
                Leilões NO AR
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="https://gruporaca.com/cadastro"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  trackClick('button', 'cadastre-se', 'Cadastre-se', Math.floor(e.clientX - rect.left), Math.floor(e.clientY - rect.top));
                  trackButtonClick('Cadastre-se', 'cta');
                  trackConversion('cadastro_cta_click');
                }}
                className="group bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-white/20 hover:shadow-xl hover:shadow-white/30 hover:scale-105 button-shine ripple-effect"
              >
                Cadastre-se
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
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

