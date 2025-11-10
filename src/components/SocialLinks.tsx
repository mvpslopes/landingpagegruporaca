import { Instagram, Facebook, Youtube, ExternalLink } from 'lucide-react';

const socialLinks = [
  {
    name: 'Instagram Principal',
    icon: Instagram,
    url: 'https://instagram.com/gruporaca',
    followers: '50k+'
  },
  {
    name: 'Instagram Vendas',
    icon: Instagram,
    url: 'https://instagram.com/gruporacavendas',
    followers: '25k+'
  },
  {
    name: 'Facebook',
    icon: Facebook,
    url: 'https://facebook.com/gruporaca',
    followers: '40k+'
  },
  {
    name: 'YouTube',
    icon: Youtube,
    url: 'https://youtube.com/@gruporaca',
    followers: '15k+'
  }
];

export default function SocialLinks() {
  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Elementos decorativos prateados */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle, rgba(192, 192, 192, 0.1), transparent)' }}></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle, rgba(192, 192, 192, 0.1), transparent)' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-semibold text-white/90">
              Conecte-se Conosco
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
            Nossas <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(to right, #ffffff, #c0c0c0, #ffffff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >Redes Sociais</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Acompanhe as novidades e fique por dentro de tudo que acontece no mundo dos leilões
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {socialLinks.map((social, index) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(192, 192, 192, 0.2)',
                animationDelay: `${index * 100}ms`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(192, 192, 192, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(192, 192, 192, 0.2)';
              }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <social.icon size={36} className="text-black" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm"></div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gray-100 transition-colors">
                    {social.name}
                  </h3>
                  <p className="text-gray-400 mb-4 font-medium">{social.followers} seguidores</p>
                </div>
                <div className="flex items-center gap-2 text-gray-300 group-hover:text-white transition-all duration-200 font-semibold">
                  <span className="text-sm">Visitar</span>
                  <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
