import { Phone, Mail, MessageCircle } from 'lucide-react';

const assessors = [
  {
    id: 1,
    name: 'Ariane Silva',
    specialty: 'Assessoria Técnica',
    phone: '(31) 98765-4321',
    email: 'ariane@gruporaca.com.br',
    whatsapp: '5531987654321'
  },
  {
    id: 2,
    name: 'Bruno Souza Lima',
    specialty: 'Assessoria Técnica',
    phone: '(31) 98765-4322',
    email: 'bruno@gruporaca.com.br',
    whatsapp: '5531987654322'
  },
  {
    id: 3,
    name: 'Carlos Eduardo',
    specialty: 'Consultoria Comercial',
    phone: '(31) 98765-4323',
    email: 'carlos@gruporaca.com.br',
    whatsapp: '5531987654323'
  },
  {
    id: 4,
    name: 'Marina Rodrigues',
    specialty: 'Gestão de Leilões',
    phone: '(31) 98765-4324',
    email: 'marina@gruporaca.com.br',
    whatsapp: '5531987654324'
  }
];

export default function Assessors() {
  return (
    <section id="assessores" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-4">Nossos Assessores</h2>
          <div className="h-1 w-24 bg-gradient-to-r from-gray-600 to-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Profissionais especializados prontos para atender você com excelência
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {assessors.map((assessor) => (
            <div
              key={assessor.id}
              className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {assessor.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>

              <h3 className="text-xl font-bold text-black text-center mb-2">{assessor.name}</h3>
              <p className="text-gray-600 text-center mb-6 text-sm">{assessor.specialty}</p>

              <div className="space-y-3">
                <a
                  href={`tel:${assessor.phone}`}
                  className="flex items-center gap-3 text-gray-700 hover:text-black transition-colors duration-200"
                >
                  <Phone size={18} />
                  <span className="text-sm">{assessor.phone}</span>
                </a>

                <a
                  href={`mailto:${assessor.email}`}
                  className="flex items-center gap-3 text-gray-700 hover:text-black transition-colors duration-200"
                >
                  <Mail size={18} />
                  <span className="text-sm break-all">{assessor.email}</span>
                </a>

                <a
                  href={`https://wa.me/${assessor.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 justify-center mt-4"
                >
                  <MessageCircle size={18} />
                  <span className="text-sm font-semibold">WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
