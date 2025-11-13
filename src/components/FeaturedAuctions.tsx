import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';

const auctions = [
  {
    id: 1,
    title: 'Leilão Elite 2024',
    date: '15 de Dezembro, 2024',
    location: 'Belo Horizonte, MG',
    participants: '120+ animais',
    image: '/Leilão 01.jpg',
    status: 'Em breve'
  },
  {
    id: 2,
    title: 'Leilão Primavera',
    date: '20 de Novembro, 2024',
    location: 'São Paulo, SP',
    participants: '85+ animais',
    image: '/Leilão 02.jpg',
    status: 'No ar'
  },
  {
    id: 3,
    title: 'Leilão Especial',
    date: '5 de Janeiro, 2025',
    location: 'Rio de Janeiro, RJ',
    participants: '95+ animais',
    image: '/Leilão 03.jpg',
    status: 'Encerrado'
  }
];

export default function FeaturedAuctions() {
  return (
    <section id="leiloes" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-black/5 rounded-full text-sm font-semibold text-gray-700">
              Confira nossa agenda
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold text-black mb-6">
            Leilões em <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(to right, #000000, #808080, #000000)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >Destaque</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Acompanhe aqui os principais leilões de cavalos de elite do Brasil.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map((auction, index) => (
            <div
              key={auction.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-72 overflow-hidden bg-gray-100">
                <img
                  src={auction.image}
                  alt={auction.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                  style={{ objectFit: 'contain' }}
                />
                <div className="absolute top-6 right-6 z-20">
                  <span className={`px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md ${
                    auction.status === 'No ar' 
                      ? 'bg-green-500/90 text-white border border-green-400/50' 
                      : auction.status === 'Encerrado'
                      ? 'bg-gray-500/90 text-white border border-gray-400/50'
                      : 'bg-black/70 text-white border border-white/20'
                  }`}>
                    {auction.status}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-2xl font-bold text-black mb-2">{auction.title}</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700 group-hover:text-black transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-black group-hover:text-white flex items-center justify-center mr-3 transition-all duration-300">
                      <Calendar size={18} />
                    </div>
                    <span className="font-medium">{auction.date}</span>
                  </div>
                  <div className="flex items-center text-gray-700 group-hover:text-black transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-black group-hover:text-white flex items-center justify-center mr-3 transition-all duration-300">
                      <MapPin size={18} />
                    </div>
                    <span className="font-medium">{auction.location}</span>
                  </div>
                  <div className="flex items-center text-gray-700 group-hover:text-black transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-black group-hover:text-white flex items-center justify-center mr-3 transition-all duration-300">
                      <Users size={18} />
                    </div>
                    <span className="font-medium">{auction.participants}</span>
                  </div>
                </div>

                <button className="w-full bg-black text-white py-4 rounded-xl hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 font-bold group-hover:shadow-lg hover:scale-[1.02]">
                  Ver Detalhes
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
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
