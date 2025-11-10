import { ChevronRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/635499/pexels-photo-635499.jpeg')] bg-cover bg-center opacity-20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-3xl">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Excelência em
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-white">
              Leilões de Cavalos
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            O Grupo Raça é referência nacional em leilões de cavalos de elite,
            conectando criadores e apaixonados pela raça com transparência e profissionalismo.
          </p>
          <div className="flex gap-4">
            <a
              href="#leiloes"
              className="bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center gap-2"
            >
              Ver Leilões em Destaque
              <ChevronRight size={20} />
            </a>
            <a
              href="#site"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-all duration-200"
            >
              Site Oficial
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
