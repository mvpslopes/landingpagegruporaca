import { Phone, Mail, MessageCircle } from 'lucide-react';

const assessors = [
  {
    id: 1,
    name: 'Ariane Silva',
    specialty: 'Assessoria Técnica',
    phone: '(31) 98765-4321',
    email: 'ariane@gruporaca.com.br',
    whatsapp: '5531987654321',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face&auto=format'
  },
  {
    id: 2,
    name: 'Bruno Souza Lima',
    specialty: 'Assessoria Técnica',
    phone: '(31) 98765-4322',
    email: 'bruno@gruporaca.com.br',
    whatsapp: '5531987654322',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&auto=format'
  },
  {
    id: 3,
    name: 'Carlos Eduardo',
    specialty: 'Consultoria Comercial',
    phone: '(31) 98765-4323',
    email: 'carlos@gruporaca.com.br',
    whatsapp: '5531987654323',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face&auto=format'
  },
  {
    id: 4,
    name: 'Marina Rodrigues',
    specialty: 'Gestão de Leilões',
    phone: '(31) 98765-4324',
    email: 'marina@gruporaca.com.br',
    whatsapp: '5531987654324',
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
              Nossa Equipe
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
            Profissionais especializados prontos para atender você com excelência
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {assessors.map((assessor, index) => (
            <div
              key={assessor.id}
              className="group bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-black transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-2xl mx-auto overflow-hidden group-hover:scale-110 transition-transform duration-300 shadow-lg border-2 border-gray-200 group-hover:border-black">
                  <img 
                    src={assessor.photo} 
                    alt={assessor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              <h3 className="text-xl font-bold text-black text-center mb-2 group-hover:text-gray-800 transition-colors">
                {assessor.name}
              </h3>
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
                  href={`https://wa.me/${assessor.whatsapp}`}
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
