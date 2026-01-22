import { useState, useEffect } from 'react';
import { Calendar, MapPin, ArrowRight, Award } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

// Função auxiliar para criar datas
function createDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day); // month é 1-indexed, Date usa 0-indexed
}

interface Auction {
  id: number;
  title: string;
  date: string;
  startDate: string;
  endDate: string;
  breed: string;
  image: string;
  status?: string;
}


export default function FeaturedAuctions() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollReveal({ threshold: 0.2 });
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollReveal({ threshold: 0.1 });
  
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar leilões do banco de dados
    const fetchAuctions = async () => {
      try {
        const response = await fetch('/api/get-auctions-public.php');
        const data = await response.json();
        
        if (data.auctions && Array.isArray(data.auctions)) {
          // Converter para o formato esperado pelo componente
          const formattedAuctions = data.auctions.map((auction: any) => {
            const [startYear, startMonth, startDay] = auction.startDate.split('-').map(Number);
            const [endYear, endMonth, endDay] = auction.endDate.split('-').map(Number);
            
            return {
              id: auction.id,
              title: auction.title,
              date: auction.date,
              startDate: createDate(startYear, startMonth, startDay),
              endDate: createDate(endYear, endMonth, endDay),
              breed: auction.breed,
              image: auction.image || '/leiloes/L01.jpeg', // Fallback se não tiver imagem
              status: auction.status
            };
          });
          
          // Ordenar por data de início (mais antigo primeiro)
          formattedAuctions.sort((a: Auction, b: Auction) => {
            return a.startDate.getTime() - b.startDate.getTime();
          });
          
          setAuctions(formattedAuctions);
        }
      } catch (error) {
        console.error('Erro ao carregar leilões:', error);
        // Em caso de erro, usar array vazio (não quebra o site)
        setAuctions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  return (
    <section id="leiloes" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 overflow-x-hidden">
        <div 
          ref={titleRef}
          className={`text-center mb-12 sm:mb-16 md:mb-20 scroll-reveal scroll-reveal-up ${titleVisible ? 'revealed' : ''}`}
        >
          <div className="inline-block mb-4">
            <span className="px-3 sm:px-4 py-2 bg-black/5 rounded-full text-xs sm:text-sm font-semibold text-gray-700">
              CONFIRA NOSSA AGENDA
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-black mb-3 sm:mb-4 md:mb-6 px-2 leading-tight">
            LEILÕES EM <span className="gradient-text">DESTAQUE</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            Acompanhe aqui os principais leilões de cavalos de elite do Brasil.
          </p>
        </div>

        <div 
          ref={cardsRef}
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 scroll-reveal scroll-reveal-up ${cardsVisible ? 'revealed' : ''}`}
        >
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">Carregando leilões...</p>
            </div>
          ) : auctions.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">Nenhum leilão disponível no momento</p>
            </div>
          ) : (
            auctions.map((auction, index) => (
            <div
              key={auction.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200 card-hover"
              style={{ 
                animationDelay: `${index * 100}ms`,
                transitionDelay: `${index * 50}ms`
              }}
            >
              <div className="relative h-72 overflow-hidden bg-gray-100 group">
                <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <img
                  src={auction.image}
                  alt={auction.title}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                  style={{ objectFit: 'contain' }}
                />
                <div className="absolute top-6 right-6 z-20">
                  {(() => {
                    // Usar status do banco (vem da API)
                    const status = auction.status || 'ENCERRADO';
                    return (
                      <span className={`px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md ${
                        status === 'NO_AR' || status === 'NO AR'
                          ? 'bg-green-500/90 text-white border border-green-400/50' 
                          : status === 'ENCERRADO' || status === 'Encerrado'
                          ? 'bg-gray-500/90 text-white border border-gray-400/50'
                          : 'bg-black/70 text-white border border-white/20'
                      }`}>
                        {status === 'Encerrado' ? 'ENCERRADO' : status === 'ENCERRADO' ? 'ENCERRADO' : status}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-2xl font-bold text-black mb-2 uppercase">{auction.title}</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700 group-hover:text-black transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-black group-hover:text-white flex items-center justify-center mr-3 transition-all duration-300">
                      <Calendar size={18} />
                    </div>
                    <span className="font-medium uppercase">{auction.date}</span>
                  </div>
                  {auction.breed && (
                    <div className="flex items-center text-gray-700 group-hover:text-black transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-black group-hover:text-white flex items-center justify-center mr-3 transition-all duration-300">
                        <Award size={18} />
                      </div>
                      <span className="font-medium uppercase">{auction.breed}</span>
                    </div>
                  )}
                </div>

                <a
                  href="https://gruporaca.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-black text-white py-4 rounded-xl hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 font-bold group-hover:shadow-lg hover:scale-[1.02] button-shine ripple-effect"
                >
                  Ver Detalhes
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
            ))
          )}
        </div>

        <div className="text-center mt-16">
          <a
            href="#site"
            className="inline-flex items-center gap-3 text-black font-bold hover:text-gray-600 transition-all duration-300 group text-lg"
          >
            Acesse nosso site oficial e confira nossa agenda completa
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}
