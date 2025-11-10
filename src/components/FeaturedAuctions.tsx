import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';

const auctions = [
  {
    id: 1,
    title: 'Leilão Elite 2024',
    date: '15 de Dezembro, 2024',
    location: 'Belo Horizonte, MG',
    participants: '120+ animais',
    image: 'https://images.pexels.com/photos/1996333/pexels-photo-1996333.jpeg',
    status: 'Em breve'
  },
  {
    id: 2,
    title: 'Leilão Primavera',
    date: '20 de Novembro, 2024',
    location: 'São Paulo, SP',
    participants: '85+ animais',
    image: 'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg',
    status: 'Inscrições abertas'
  },
  {
    id: 3,
    title: 'Leilão Especial',
    date: '5 de Janeiro, 2025',
    location: 'Rio de Janeiro, RJ',
    participants: '95+ animais',
    image: 'https://images.pexels.com/photos/3791424/pexels-photo-3791424.jpeg',
    status: 'Em breve'
  }
];

export default function FeaturedAuctions() {
  return (
    <section id="leiloes" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-4">Leilões em Destaque</h2>
          <div className="h-1 w-24 bg-gradient-to-r from-gray-600 to-gray-900 mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map((auction) => (
            <div
              key={auction.id}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 group"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={auction.image}
                  alt={auction.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-black text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {auction.status}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-black mb-4">{auction.title}</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={18} className="mr-3" />
                    <span>{auction.date}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin size={18} className="mr-3" />
                    <span>{auction.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users size={18} className="mr-3" />
                    <span>{auction.participants}</span>
                  </div>
                </div>

                <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center gap-2 font-semibold">
                  Ver Detalhes
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="#site"
            className="inline-flex items-center gap-2 text-black font-semibold hover:text-gray-600 transition-colors duration-200"
          >
            Ver todos os leilões no site oficial
            <ArrowRight size={20} />
          </a>
        </div>
      </div>
    </section>
  );
}
