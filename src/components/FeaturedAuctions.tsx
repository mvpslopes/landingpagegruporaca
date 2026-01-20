import { Calendar, MapPin, ArrowRight, Award } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

// Função auxiliar para criar datas
function createDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day); // month é 1-indexed, Date usa 0-indexed
}

// LEILÕES - Ordem cronológica (por data de início)
const auctions = [
  {
    id: 1,
    title: 'Leilão Haras Santos & Convidados',
    date: '11 de janeiro a 07 de março',
    startDate: createDate(2026, 1, 11),
    endDate: createDate(2026, 3, 7),
    breed: 'Mangalarga Marchador',
    image: '/leiloes/L05.jpeg'
  },
  {
    id: 2,
    title: 'Leilão Edição Especial Marchadores de Pista',
    date: '12 de janeiro a 12 de fevereiro',
    startDate: createDate(2026, 1, 12),
    endDate: createDate(2026, 2, 12),
    breed: 'Mangalarga Marchador',
    image: '/leiloes/L02.jpeg'
  },
  {
    id: 9,
    title: '1º Leilão Matrizes Haras 2ª Geração',
    date: '14 de janeiro a 14 de fevereiro',
    startDate: createDate(2026, 1, 14),
    endDate: createDate(2026, 2, 14),
    breed: 'Mangalarga Marchador',
    image: '/leiloes/L09.jpeg'
  },
  {
    id: 3,
    title: 'Leilão Genética Campeã Haras Pardal',
    date: '26 a 31 de janeiro',
    startDate: createDate(2026, 1, 26),
    endDate: createDate(2026, 1, 31),
    breed: 'Mangalarga Marchador',
    image: '/leiloes/L03.jpeg'
  },
  {
    id: 4,
    title: 'Leilão Riacho das Pedras e Amigos Mar de Minas',
    date: '19 a 24 de janeiro',
    startDate: createDate(2026, 1, 19),
    endDate: createDate(2026, 1, 24),
    breed: 'Mangalarga Marchador',
    image: '/leiloes/L07.jpeg'
  },
  {
    id: 5,
    title: 'Semana de Negócios Haras Q-Conforto',
    date: '07 a 12 de fevereiro',
    startDate: createDate(2026, 2, 7),
    endDate: createDate(2026, 2, 12),
    breed: 'Mangalarga Marchador',
    image: '/leiloes/L01.jpeg'
  },
  {
    id: 6,
    title: 'V Leilão Amigos do Triângulo',
    date: '12 de fevereiro',
    startDate: createDate(2026, 2, 12),
    endDate: createDate(2026, 2, 12),
    breed: 'Campolina Marchador',
    image: '/leiloes/L04.jpeg'
  },
  {
    id: 7,
    title: 'Select Week Limeira da Flor',
    date: '15 a 21 de março',
    startDate: createDate(2026, 3, 15),
    endDate: createDate(2026, 3, 21),
    breed: 'Mangalarga Marchador',
    image: '/leiloes/L06.jpeg'
  },
  {
    id: 8,
    title: 'XV Leilão J.H.R.',
    date: '04 de julho',
    startDate: createDate(2026, 7, 4),
    endDate: createDate(2026, 7, 4),
    breed: 'Campolina Marchador',
    image: '/leiloes/L08.jpeg'
  }
];

function getAuctionStatus(startDate: Date, endDate: Date): string {
  const now = new Date();
  // Resetar horas para comparar apenas as datas (meia-noite)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  
  // Comparar timestamps para evitar problemas de timezone
  const todayTime = today.getTime();
  const startTime = start.getTime();
  const endTime = end.getTime();
  
  if (todayTime < startTime) {
    return 'EM BREVE';
  } else if (todayTime >= startTime && todayTime <= endTime) {
    return 'NO AR';
  } else {
    return 'Encerrado';
  }
}

export default function FeaturedAuctions() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollReveal({ threshold: 0.2 });
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollReveal({ threshold: 0.1 });

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
          {auctions.map((auction, index) => (
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
                    const status = getAuctionStatus(auction.startDate, auction.endDate);
                    return (
                      <span className={`px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md ${
                        status === 'NO AR' 
                          ? 'bg-green-500/90 text-white border border-green-400/50' 
                          : status === 'Encerrado'
                          ? 'bg-gray-500/90 text-white border border-gray-400/50'
                          : 'bg-black/70 text-white border border-white/20'
                      }`}>
                        {status === 'Encerrado' ? 'ENCERRADO' : status}
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
          ))}
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
