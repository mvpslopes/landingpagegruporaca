import { Phone, Mail, MessageCircle } from 'lucide-react';

const concentrados = [
  {
    id: 1,
    name: 'Carlos Eduardo',
    specialty: 'Assessoria Técnica',
    phone: '(32) 99804-0180',
    email: 'carlos.eduardo@gruporaca.com.br',
    whatsapp: '5532998040180'
  },
  {
    id: 2,
    name: 'Cláudio Delfraro',
    specialty: 'Assessoria Técnica',
    phone: '(35) 98413-4770',
    email: 'claudio.delfraro@gruporaca.com.br',
    whatsapp: '5535984134770'
  },
  {
    id: 3,
    name: 'David Charles',
    specialty: 'Assessoria Técnica',
    phone: '(31) 99194-4423',
    email: 'david.charles@gruporaca.com.br',
    whatsapp: '5531991944423'
  },
  {
    id: 4,
    name: 'Deghson Elias',
    specialty: 'Assessoria Técnica',
    phone: '(32) 99996-4208',
    email: 'deghson.elias@gruporaca.com.br',
    whatsapp: '5532999964208'
  },
  {
    id: 5,
    name: 'Dudu Águia',
    specialty: 'Assessoria Técnica',
    phone: '(32) 99909-8350',
    email: 'dudu.aguia@gruporaca.com.br',
    whatsapp: '5532999098350'
  },
  {
    id: 6,
    name: 'Edimar Galena',
    specialty: 'Assessoria Técnica',
    phone: '(22) 99838-9839',
    email: 'edimar.galena@gruporaca.com.br',
    whatsapp: '5522998389839'
  },
  {
    id: 7,
    name: 'Erick',
    specialty: 'Assessoria Técnica',
    phone: '(31) 99995-2074',
    email: 'erick@gruporaca.com.br',
    whatsapp: '5531999952074'
  },
  {
    id: 8,
    name: 'Felipe Sá',
    specialty: 'Assessoria Técnica',
    phone: '(22) 99913-6263',
    email: 'felipe.sa@gruporaca.com.br',
    whatsapp: '5522999136263'
  },
  {
    id: 9,
    name: 'Gabriel Araujo',
    specialty: 'Assessoria Técnica',
    phone: '(31) 9642-7108',
    email: 'gabriel.araujo@gruporaca.com.br',
    whatsapp: '553196427108'
  },
  {
    id: 10,
    name: 'Gabriel Queixada',
    specialty: 'Assessoria Técnica',
    phone: '(32) 98873-7345',
    email: 'gabriel.queixada@gruporaca.com.br',
    whatsapp: '5532988737345'
  },
  {
    id: 11,
    name: 'Gabriela Barcelos',
    specialty: 'Assessoria Técnica',
    phone: '(31) 99881-6001',
    email: 'gabriela.barcelos@gruporaca.com.br',
    whatsapp: '5531998816001'
  },
  {
    id: 12,
    name: 'Gregório Neves',
    specialty: 'Assessoria Técnica',
    phone: '(21) 98166-1949',
    email: 'gregorio.neves@gruporaca.com.br',
    whatsapp: '5521981661949'
  },
  {
    id: 13,
    name: 'Greko Lima',
    specialty: 'Assessoria Técnica',
    phone: '(22) 99966-1061',
    email: 'greko.lima@gruporaca.com.br',
    whatsapp: '5522999661061'
  },
  {
    id: 14,
    name: 'Hugo Ferrari',
    specialty: 'Assessoria Técnica',
    phone: '(21) 98122-5464',
    email: 'hugo.ferrari@gruporaca.com.br',
    whatsapp: '5521981225464'
  },
  {
    id: 15,
    name: 'J.G Assessoria',
    specialty: 'Assessoria Técnica',
    phone: '(33) 99870-8447',
    email: 'jg.assessoria@gruporaca.com.br',
    whatsapp: '5533998708447'
  },
  {
    id: 16,
    name: 'Jefferson Mattos',
    specialty: 'Assessoria Técnica',
    phone: '(48) 99191-1474',
    email: 'jefferson.mattos@gruporaca.com.br',
    whatsapp: '5548991911474'
  },
  {
    id: 17,
    name: 'JM Assessoria',
    specialty: 'Assessoria Técnica',
    phone: '(37) 99963-6962',
    email: 'jm.assessoria@gruporaca.com.br',
    whatsapp: '5537999636962'
  },
  {
    id: 18,
    name: 'João Paulo',
    specialty: 'Assessoria Técnica',
    phone: '(12) 99715-5058',
    email: 'joao.paulo@gruporaca.com.br',
    whatsapp: '5512997155058'
  },
  {
    id: 19,
    name: 'Juninho',
    specialty: 'Assessoria Técnica',
    phone: '(31) 98531-4468',
    email: 'juninho@gruporaca.com.br',
    whatsapp: '5531985314468'
  },
  {
    id: 20,
    name: 'Kauan',
    specialty: 'Assessoria Técnica',
    phone: '(37) 99669-001',
    email: 'kauan@gruporaca.com.br',
    whatsapp: '553799669001'
  }
];

const assessors = [
  {
    id: 1,
    name: 'Breno Alves',
    specialty: 'Assessoria Técnica',
    phone: '(38) 99932-7994',
    email: 'breno.alves@gruporaca.com.br',
    whatsapp: '5538999327994'
  },
  {
    id: 2,
    name: 'Bruno Lagartixa',
    specialty: 'Assessoria Técnica',
    phone: '(31) 97153-7765',
    email: 'bruno.lagartixa@gruporaca.com.br',
    whatsapp: '5531971537765'
  },
  {
    id: 3,
    name: 'Dirceu',
    specialty: 'Assessoria Técnica',
    phone: '(32) 99823-8936',
    email: 'dirceu@gruporaca.com.br',
    whatsapp: '5532998238936'
  },
  {
    id: 4,
    name: 'Dudu Idualte',
    specialty: 'Assessoria Técnica',
    phone: '(34) 98406-2220',
    email: 'dudu.idualte@gruporaca.com.br',
    whatsapp: '5534984062220'
  },
  {
    id: 5,
    name: 'Fred',
    specialty: 'Assessoria Técnica',
    phone: '(24) 99845-9111',
    email: 'fred@gruporaca.com.br',
    whatsapp: '5524998459111'
  },
  {
    id: 6,
    name: 'Iago Frois',
    specialty: 'Assessoria Técnica',
    phone: '(24) 99961-7577',
    email: 'iago.frois@gruporaca.com.br',
    whatsapp: '5524999617577'
  },
  {
    id: 7,
    name: 'Joann Alves',
    specialty: 'Assessoria Técnica',
    phone: '(71) 99957-5796',
    email: 'joann.alves@gruporaca.com.br',
    whatsapp: '5571999575796'
  },
  {
    id: 8,
    name: 'João Henrique',
    specialty: 'Assessoria Técnica',
    phone: '(38) 99724-9250',
    email: 'joao.henrique@gruporaca.com.br',
    whatsapp: '5538997249250'
  },
  {
    id: 9,
    name: 'Juninho',
    specialty: 'Assessoria Técnica',
    phone: '(31) 99638-6091',
    email: 'juninho.2@gruporaca.com.br',
    whatsapp: '5531996386091'
  },
  {
    id: 10,
    name: 'Lucas Minutos no Campo',
    specialty: 'Assessoria Técnica',
    phone: '(35) 98451-1638',
    email: 'lucas.minutosnocampo@gruporaca.com.br',
    whatsapp: '5535984511638'
  },
  {
    id: 11,
    name: 'Marcelo Tranca',
    specialty: 'Assessoria Técnica',
    phone: '(32) 99905-4175',
    email: 'marcelo.tranca@gruporaca.com.br',
    whatsapp: '5532999054175'
  },
  {
    id: 12,
    name: 'Pedro',
    specialty: 'Assessoria Técnica',
    phone: '(32) 98813-7113',
    email: 'pedro@gruporaca.com.br',
    whatsapp: '5532988137113'
  },
  {
    id: 13,
    name: 'Ramon',
    specialty: 'Assessoria Técnica',
    phone: '(32) 99970-3568',
    email: 'ramon@gruporaca.com.br',
    whatsapp: '5532999703568'
  },
  {
    id: 14,
    name: 'Rogério Favero',
    specialty: 'Assessoria Técnica',
    phone: '(27) 99961-6321',
    email: 'rogerio.favero@gruporaca.com.br',
    whatsapp: '5527999616321'
  },
  {
    id: 15,
    name: 'Sérgio Alencar',
    specialty: 'Assessoria Técnica',
    phone: '(24) 99999-2992',
    email: 'sergio.alencar@gruporaca.com.br',
    whatsapp: '5524999992992'
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

        <div className="space-y-16">
          <div>
            <h3 className="text-2xl font-semibold text-center mb-8">Concentrados</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {concentrados.map((assessor, index) => (
                <div
                  key={`concentrado-${assessor.id}`}
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

          <div>
            <h3 className="text-2xl font-semibold text-center mb-8">Assessores</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {assessors.map((assessor, index) => (
                <div
                  key={`assessor-${assessor.id}`}
                  className="group bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-black transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                  style={{ animationDelay: `${index * 80}ms` }}
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
        </div>
      </div>
    </section>
  );
}
