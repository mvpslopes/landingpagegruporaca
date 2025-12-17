import { Phone, MessageCircle } from 'lucide-react';

// Mapeamento de nomes existentes com seus dados
const existingAssessors: Record<string, { phone: string; whatsapp: string; email: string }> = {
  'HUGO': { phone: '(21) 98122-5464', whatsapp: '5521981225464', email: 'hugo.ferrari@gruporaca.com.br' },
  'HUGO FERRARI': { phone: '(21) 98122-5464', whatsapp: '5521981225464', email: 'hugo.ferrari@gruporaca.com.br' },
  'GABRIELA': { phone: '(31) 99881-6001', whatsapp: '5531998816001', email: 'gabriela.barcelos@gruporaca.com.br' },
  'GABRIEL': { phone: '(31) 9642-7108', whatsapp: '553196427108', email: 'gabriel.araujo@gruporaca.com.br' },
  'DUDU ÁGUIA': { phone: '(32) 99909-8350', whatsapp: '5532999098350', email: 'dudu.aguia@gruporaca.com.br' },
  'ERICK': { phone: '(31) 99995-2074', whatsapp: '5531999952074', email: 'erick@gruporaca.com.br' },
  'CARLOS EDUARDO': { phone: '(32) 99804-0180', whatsapp: '5532998040180', email: 'carlos.eduardo@gruporaca.com.br' },
  'DUDU GUIDUCCI': { phone: '(32) 99804-0180', whatsapp: '5532998040180', email: 'dudu.guiducci@gruporaca.com.br' },
  'JM': { phone: '(37) 99963-6962', whatsapp: '5537999636962', email: 'jm.assessoria@gruporaca.com.br' },
  'JOÃO PAULO': { phone: '(12) 99715-5058', whatsapp: '5512997155058', email: 'joao.paulo@gruporaca.com.br' },
  'JUNINHO': { phone: '(31) 98531-4468', whatsapp: '5531985314468', email: 'juninho@gruporaca.com.br' },
  'KAUAN': { phone: '(37) 99669-0014', whatsapp: '5537996690014', email: 'kauan@gruporaca.com.br' },
  'QUEIXADA': { phone: '(32) 98873-7345', whatsapp: '5532988737345', email: 'gabriel.queixada@gruporaca.com.br' },
  'GABRIEL QUEIXADA': { phone: '(32) 98873-7345', whatsapp: '5532988737345', email: 'gabriel.queixada@gruporaca.com.br' },
  'GREGÓRIO': { phone: '(21) 98166-1949', whatsapp: '5521981661949', email: 'gregorio.neves@gruporaca.com.br' },
  'BRUNO LAGARTIXA': { phone: '(31) 97153-7765', whatsapp: '5531971537765', email: 'bruno.lagartixa@gruporaca.com.br' },
  'DUDU': { phone: '(34) 98406-2220', whatsapp: '5534984062220', email: 'dudu.idualte@gruporaca.com.br' },
  'DUDU IDUALTE': { phone: '(34) 98406-2220', whatsapp: '5534984062220', email: 'dudu.idualte@gruporaca.com.br' },
  'MARCELO': { phone: '(32) 99905-4175', whatsapp: '5532999054175', email: 'marcelo.tranca@gruporaca.com.br' },
  'MARCELO BERNARDO': { phone: '(32) 99905-4175', whatsapp: '5532999054175', email: 'marcelo.bernardo@gruporaca.com.br' },
  'JOAN': { phone: '(71) 99957-5796', whatsapp: '5571999575796', email: 'joann.alves@gruporaca.com.br' },
  'JOANN ALVES': { phone: '(71) 99957-5796', whatsapp: '5571999575796', email: 'joann.alves@gruporaca.com.br' },
  'PEDRO': { phone: '(32) 98813-7113', whatsapp: '5532988137113', email: 'pedro@gruporaca.com.br' },
  'JEFERSON': { phone: '(48) 99191-1474', whatsapp: '5548991911474', email: 'jefferson.mattos@gruporaca.com.br' },
  'GREKO': { phone: '(22) 99966-1061', whatsapp: '5522999661061', email: 'greko.lima@gruporaca.com.br' },
  'TRANCA': { phone: '(32) 99905-4175', whatsapp: '5532999054175', email: 'marcelo.tranca@gruporaca.com.br' },
  'ANDRE': { phone: '(75) 9888-9377', whatsapp: '557598889377', email: 'andre@gruporaca.com.br' },
  'ANDRÉ': { phone: '(75) 9888-9377', whatsapp: '557598889377', email: 'andre@gruporaca.com.br' },
  'JOÃO CATIREIRO': { phone: '(31) 9893-3338', whatsapp: '553198933338', email: 'joao.catireiro@gruporaca.com.br' },
  'JOÃO CATIREIROS': { phone: '(31) 9893-3338', whatsapp: '553198933338', email: 'joao.catireiros@gruporaca.com.br' },
  'PIQUITO': { phone: '(32) 9120-7075', whatsapp: '553291207075', email: 'piquito@gruporaca.com.br' },
  'MARCOS PIQUITO': { phone: '(32) 9120-7075', whatsapp: '553291207075', email: 'marcos.piquito@gruporaca.com.br' },
  'RAFAEL R.A': { phone: '(32) 8825-0180', whatsapp: '553288250180', email: 'rafael.ra@gruporaca.com.br' },
  'TEOFOLO ALMEIDA': { phone: '(31) 9691-5876', whatsapp: '553196915876', email: 'teofolo.almeida@gruporaca.com.br' },
  'TEÓFILO ALMEIDA': { phone: '(31) 9691-5876', whatsapp: '553196915876', email: 'teofilo.almeida@gruporaca.com.br' },
  'RAMIRO': { phone: '(35) 9907-7171', whatsapp: '553599077171', email: 'ramiro@gruporaca.com.br' },
  'RUY GOMES': { phone: '(24) 99934-6827', whatsapp: '5524999346827', email: 'ruy.gomes@gruporaca.com.br' },
  'JÚNIOR': { phone: '(31) 9721-5761', whatsapp: '553197215761', email: 'junior@gruporaca.com.br' },
  'JÚNIOR MARTINS': { phone: '(31) 9721-5761', whatsapp: '553197215761', email: 'junior.martins@gruporaca.com.br' },
  'STEVAN': { phone: '(31) 99675-4188', whatsapp: '5531996754188', email: 'stevan.dominici@gruporaca.com.br' },
  'TILAO': { phone: '(32) 99983-4354', whatsapp: '5532999834354', email: 'tilao@gruporaca.com.br' },
  'TILÃO': { phone: '(32) 99983-4354', whatsapp: '5532999834354', email: 'tilao@gruporaca.com.br' },
  'VINÍCIOS': { phone: '(32) 99824-0647', whatsapp: '5532998240647', email: 'vinicios.rodrigues@gruporaca.com.br' },
  'VINÍCIUS RODRIGUES': { phone: '(38) 99892-1576', whatsapp: '5538998921576', email: 'vinicius.rodrigues@gruporaca.com.br' },
  'JOEL': { phone: '(33) 99870-8447', whatsapp: '5533998708447', email: 'joel@gruporaca.com.br' },
  'KAIKE': { phone: '(32) 9946-8519', whatsapp: '553299468519', email: 'kaike@gruporaca.com.br' },
  'LEONE': { phone: '(21) 97969-6063', whatsapp: '5521979696063', email: 'leone@gruporaca.com.br' },
  'MARCELO ZEFERINO': { phone: '(31) 8649-7175', whatsapp: '553186497175', email: 'marcelo.zeferino@gruporaca.com.br' },
  'WALLACE JÚNIOR': { phone: '(24) 99854-4235', whatsapp: '5524998544235', email: 'wallace.junior@gruporaca.com.br' },
  'WALLACE': { phone: '(24) 99854-4235', whatsapp: '5524998544235', email: 'wallace@gruporaca.com.br' },
  'MICHEL GODOI': { phone: '(35) 99248-7070', whatsapp: '5535992487070', email: 'michel.godoi@gruporaca.com.br' },
  'TICO': { phone: '(31) 99539-1747', whatsapp: '5531995391747', email: 'tico.expresso@gruporaca.com.br' },
  'FELIPE NOGUEIRA': { phone: '(22) 99913-6263', whatsapp: '5522999136263', email: 'felipe.nogueira@gruporaca.com.br' },
  'FELIPE SÁ': { phone: '(22) 99913-6263', whatsapp: '5522999136263', email: 'felipe.sa@gruporaca.com.br' },
  'VERONESE': { phone: '(32) 98825-0180', whatsapp: '5532988250180', email: 'veronese@gruporaca.com.br' },
  'DINHO': { phone: '(21) 99322-3340', whatsapp: '5521993223340', email: 'dinho@gruporaca.com.br' },
  'MARTINS': { phone: '(24) 99229-7942', whatsapp: '5524992297942', email: 'martins@gruporaca.com.br' },
  'ZIRDA': { phone: '(35) 8413-4770', whatsapp: '553584134770', email: 'zirda@gruporaca.com.br' },
  'BRUNO': { phone: '(32) 9198-0744', whatsapp: '553291980744', email: 'bruno@gruporaca.com.br' },
  'BRUNO SOUZA LIMA': { phone: '(32) 9198-0744', whatsapp: '553291980744', email: 'bruno.souza.lima@gruporaca.com.br' },
  'DAVID CHARLES': { phone: '(31) 9194-4423', whatsapp: '553191944423', email: 'david.charles@gruporaca.com.br' },
  'EVOLUÇÃO DA MARCHA': { phone: '(21) 96015-9538', whatsapp: '5521960159538', email: 'evolucao.marcha@gruporaca.com.br' },
  'MELQUIADES LEANDRO': { phone: '(31) 9843-7379', whatsapp: '553198437379', email: 'melquiades.leandro@gruporaca.com.br' },
  'ROGÉRIO FÁVERO': { phone: '(27) 99961-6321', whatsapp: '5527999616321', email: 'rogerio.favero@gruporaca.com.br' },
  'RAÇA E MARCHA': { phone: '(31) 9826-7101', whatsapp: '553198267101', email: '' },
};

// Função auxiliar para formatar nome - FORÇA MAIÚSCULAS
function formatName(name: string): string {
  // Garantir que o nome esteja em maiúsculas - TRIPLA PROTEÇÃO
  if (!name) return '';
  return String(name).toUpperCase().trim();
}

// Função auxiliar para criar assessor
function createAssessor(name: string, id: number) {
  const nameUpper = String(name).toUpperCase().trim();
  const existing = existingAssessors[nameUpper];
  if (existing) {
    return {
      id,
      name: formatName(name), // Já retorna em maiúsculas
      specialty: 'Assessoria Comercial',
      phone: existing.phone,
      email: existing.email,
      whatsapp: existing.whatsapp
    };
  }
  // Se não existe, criar sem dados de contato
  return {
    id,
    name: formatName(name), // Já retorna em maiúsculas
    specialty: 'Assessoria Comercial',
    phone: '',
    email: '',
    whatsapp: ''
  };
}

// Assessoria Grupo Raça (David Charles primeiro, demais em ordem alfabética)
const assessoriaGrupoRacaList = [
  'BRUNO SOUZA LIMA',
  'BRUNO LAGARTIXA',
  'DUDU GUIDUCCI',
  'DUDU ÁGUIA',
  'ERICK',
  'FELIPE SÁ',
  'GABRIEL',
  'GABRIEL QUEIXADA',
  'GABRIELA',
  'GREGÓRIO',
  'HUGO FERRARI',
  'JM',
  'JOÃO CATIREIROS',
  'JOÃO PAULO',
  'JOEL',
  'JUNINHO',
  'KAIKE',
  'KAUAN',
  'LEONE',
  'MELQUIADES LEANDRO',
  'MARCOS PIQUITO',
  'MARTINS',
  'MICHEL GODOI',
  'RAFAEL R.A',
  'WALLACE',
  'STEVAN',
  'TILÃO',
  'VERONESE',
  'VINÍCIUS RODRIGUES',
  'EVOLUÇÃO DA MARCHA'
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

const assessoriaGrupoRaca = [
  'DAVID CHARLES',
  ...assessoriaGrupoRacaList
].map((name, index) => createAssessor(name, index + 1));

// Assessoria Campolina (em ordem alfabética)
const assessoria = [
  'ANDRÉ',
  'DINHO',
  'DUDU IDUALTE',
  'JÚNIOR MARTINS',
  'JOANN ALVES',
  'MARCELO BERNARDO',
  'TEÓFILO ALMEIDA'
].sort((a, b) => a.localeCompare(b, 'pt-BR')).map((name, index) => createAssessor(name, assessoriaGrupoRaca.length + index + 1));

// Assessorias Parceiras (em ordem alfabética)
const assessoriasParceiras = [
  'GREKO',
  'JEFERSON',
  'MARCELO ZEFERINO',
  'MICHEL GODOI',
  'PEDRO',
  'RAMIRO',
  'RAÇA E MARCHA',
  'ROGÉRIO FÁVERO',
  'RUY GOMES',
  'TICO',
  'TRANCA',
  'ZIRDA'
].sort((a, b) => a.localeCompare(b, 'pt-BR')).map((name, index) => createAssessor(name, assessoriaGrupoRaca.length + assessoria.length + index + 1));

export default function Assessors() {
  return (
    <section id="assessores" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gray-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-100 rounded-full blur-3xl opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10 overflow-x-hidden">
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <div className="inline-block mb-4">
            <span className="px-3 sm:px-4 py-2 bg-black/5 rounded-full text-xs sm:text-sm font-semibold text-gray-700">
              CONHEÇA NOSSA EQUIPE
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-black mb-3 sm:mb-4 md:mb-6 px-2 leading-tight">
            NOSSOS <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(to right, #000000, #808080, #000000)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >ASSESSORES</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            Profissionais especializados prontos para atender você com excelência.
          </p>
        </div>

        <div className="space-y-12 sm:space-y-14 md:space-y-16">
          {/* Assessoria Grupo Raça */}
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-center mb-6 sm:mb-8 px-2">Assessoria Grupo Raça</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {assessoriaGrupoRaca.map((assessor, index) => (
                <div
                  key={`gruporaca-${assessor.id}`}
                  className="group bg-white rounded-2xl p-4 sm:p-5 md:p-6 border-2 border-gray-100 hover:border-black transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="mb-4 sm:mb-6">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-xl p-4 sm:p-5 md:p-6 text-center group-hover:border-black group-hover:bg-gradient-to-br group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-300">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 break-words uppercase" style={{ textTransform: 'uppercase' }}>
                        {assessor.name.toUpperCase()}
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-600 text-center mb-6 text-sm font-medium">{assessor.specialty}</p>

                  {assessor.phone && (
                  <div className="space-y-3">
                    <a
                        href={`tel:${assessor.phone.replace(/\D/g, '')}`}
                      className="flex items-center gap-3 text-gray-700 hover:text-black transition-all duration-200 group/link p-2 rounded-lg hover:bg-gray-50"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover/link:bg-black flex items-center justify-center transition-colors">
                        <Phone size={16} className="text-gray-700 group-hover/link:text-white" />
                      </div>
                      <span className="text-sm font-medium">{assessor.phone}</span>
                    </a>

                      {assessor.whatsapp && (
                        <a
                          href={`https://wa.me/${assessor.whatsapp}?text=${encodeURIComponent(`Olá, ${assessor.name}! Gostaria de mais informações sobre os leilões.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 bg-black text-white px-4 py-3 rounded-xl hover:bg-gray-800 transition-all duration-300 justify-center mt-4 font-semibold group-hover:shadow-lg hover:scale-[1.02]"
                        >
                          <MessageCircle size={18} />
                          <span className="text-sm">WhatsApp</span>
                        </a>
                      )}
                    </div>
                  )}
                  {!assessor.phone && (
                    <p className="text-gray-400 text-center text-sm">Contato em breve</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Assessoria Campolina */}
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-center mb-6 sm:mb-8 px-2">Assessoria Campolina</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {assessoria.map((assessor, index) => (
                <div
                  key={`assessoria-${assessor.id}`}
                  className="group bg-white rounded-2xl p-4 sm:p-5 md:p-6 border-2 border-gray-100 hover:border-black transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="mb-4 sm:mb-6">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-xl p-4 sm:p-5 md:p-6 text-center group-hover:border-black group-hover:bg-gradient-to-br group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-300">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 break-words uppercase" style={{ textTransform: 'uppercase' }}>
                        {assessor.name.toUpperCase()}
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-600 text-center mb-6 text-sm font-medium">{assessor.specialty}</p>

                  {assessor.phone && (
                    <div className="space-y-3">
                      <a
                        href={`tel:${assessor.phone.replace(/\D/g, '')}`}
                      className="flex items-center gap-3 text-gray-700 hover:text-black transition-all duration-200 group/link p-2 rounded-lg hover:bg-gray-50"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover/link:bg-black flex items-center justify-center transition-colors">
                          <Phone size={16} className="text-gray-700 group-hover/link:text-white" />
                      </div>
                        <span className="text-sm font-medium">{assessor.phone}</span>
                    </a>

                      {assessor.whatsapp && (
                    <a
                      href={`https://wa.me/${assessor.whatsapp}?text=${encodeURIComponent(`Olá, ${assessor.name}! Gostaria de mais informações sobre os leilões.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-black text-white px-4 py-3 rounded-xl hover:bg-gray-800 transition-all duration-300 justify-center mt-4 font-semibold group-hover:shadow-lg hover:scale-[1.02]"
                    >
                      <MessageCircle size={18} />
                      <span className="text-sm">WhatsApp</span>
                    </a>
                      )}
                  </div>
                  )}
                  {!assessor.phone && (
                    <p className="text-gray-400 text-center text-sm">Contato em breve</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Assessorias Parceiras */}
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-center mb-6 sm:mb-8 px-2">Assessorias Parceiras</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {assessoriasParceiras.map((assessor, index) => (
                <div
                  key={`parceiras-${assessor.id}`}
                  className="group bg-white rounded-2xl p-4 sm:p-5 md:p-6 border-2 border-gray-100 hover:border-black transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="mb-4 sm:mb-6">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-xl p-4 sm:p-5 md:p-6 text-center group-hover:border-black group-hover:bg-gradient-to-br group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-300">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 break-words uppercase" style={{ textTransform: 'uppercase' }}>
                        {assessor.name.toUpperCase()}
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-600 text-center mb-6 text-sm font-medium">{assessor.specialty}</p>

                  {assessor.phone && (
                  <div className="space-y-3">
                    <a
                        href={`tel:${assessor.phone.replace(/\D/g, '')}`}
                      className="flex items-center gap-3 text-gray-700 hover:text-black transition-all duration-200 group/link p-2 rounded-lg hover:bg-gray-50"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover/link:bg-black flex items-center justify-center transition-colors">
                        <Phone size={16} className="text-gray-700 group-hover/link:text-white" />
                      </div>
                      <span className="text-sm font-medium">{assessor.phone}</span>
                    </a>

                      {assessor.whatsapp && (
                    <a
                      href={`https://wa.me/${assessor.whatsapp}?text=${encodeURIComponent(`Olá, ${assessor.name}! Gostaria de mais informações sobre os leilões.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-black text-white px-4 py-3 rounded-xl hover:bg-gray-800 transition-all duration-300 justify-center mt-4 font-semibold group-hover:shadow-lg hover:scale-[1.02]"
                    >
                      <MessageCircle size={18} />
                      <span className="text-sm">WhatsApp</span>
                    </a>
                      )}
                  </div>
                  )}
                  {!assessor.phone && (
                    <p className="text-gray-400 text-center text-sm">Contato em breve</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
