import { Phone, Mail, MessageCircle } from 'lucide-react';

const assessors = [
  {
    id: 1,
    name: 'Erick',
    specialty: 'Assessoria Técnica',
    phone: '(31) 9995-2074',
    email: 'erick@gruporaca.com.br',
    whatsapp: '553199952074',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&auto=format'
  },
  {
    id: 2,
    name: 'Lagartixa',
    specialty: 'Assessoria Técnica',
    phone: '(31) 7153-7765',
    email: 'lagartixa@gruporaca.com.br',
    whatsapp: '553171537765',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face&auto=format'
  },
  {
    id: 3,
    name: 'Gregório',
    specialty: 'Assessoria Técnica',
    phone: '(21) 98166-1949',
    email: 'gregorio@gruporaca.com.br',
    whatsapp: '5521981661949',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face&auto=format'
  },
  {
    id: 4,
    name: 'Carlos Eduardo',
    specialty: 'Assessoria Técnica',
    phone: '(32) 9804-0180',
    email: 'carlos@gruporaca.com.br',
    whatsapp: '553298040180',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face&auto=format'
  }
];

export default function Assessors() {
  return (
    <section id="assessores" className="py-24 bg-white relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gray-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-100 rounded-full blur-3xl opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-black/5 rounded-full text-sm font-semibold text-gray-700">
              Conheça nossa equipe
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold text-black mb-6">
            Nossos <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(to right, #000000, #808080, #000000)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >Assessores</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Profissionais especializados prontos para atender você com excelência.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {assessors.map((assessor, index) => (
            <div
              key={assessor.id}
              className="group bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-black transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-6">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-xl p-6 text-center group-hover:border-black group-hover:bg-gradient-to-br group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-300">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {assessor.name}
                  </h3>
                </div>
              </div>

              <p className="text-gray-600 text-center mb-6 text-sm font-medium">{assessor.specialty}</p>

              <div className="space-y-3">
                <a
                  href={`tel:${assessor.phone}`}
                  className="flex items-center gap-3 text-gray-700 hover:text-black transition-all duration-200 group/link p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover/link:bg-black flex items-center justify-center transition-colors">
                    <Phone size={16} className="text-gray-700 group-hover/link:text-white" />
                  </div>
                  <span className="text-sm font-medium">{assessor.phone}</span>
                </a>

                <a
                  href={`mailto:${assessor.email}`}
                  className="flex items-center gap-3 text-gray-700 hover:text-black transition-all duration-200 group/link p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover/link:bg-black flex items-center justify-center transition-colors">
                    <Mail size={16} className="text-gray-700 group-hover/link:text-white" />
                  </div>
                  <span className="text-sm break-all font-medium">{assessor.email}</span>
                </a>

                <a
                  href={`https://wa.me/${assessor.whatsapp}?text=${encodeURIComponent(`Olá, ${assessor.name}! Gostaria de mais informações sobre os leilões.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-black text-white px-4 py-3 rounded-xl hover:bg-gray-800 transition-all duration-300 justify-center mt-4 font-semibold group-hover:shadow-lg hover:scale-[1.02]"
                >
                  <MessageCircle size={18} />
                  <span className="text-sm">WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
