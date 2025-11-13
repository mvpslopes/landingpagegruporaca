import { Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

const contacts = [
  {
    department: 'Administrativo',
    phone: '(31) 3333-1111',
    email: 'admin@gruporaca.com.br'
  },
  {
    department: 'Financeiro',
    phone: '(31) 3333-2222',
    email: 'financeiro@gruporaca.com.br'
  },
  {
    department: 'Marketing',
    phone: '(31) 3333-3333',
    email: 'marketing@gruporaca.com.br'
  },
  {
    department: 'Jurídico',
    phone: '(31) 3333-4444',
    email: 'juridico@gruporaca.com.br'
  }
];

export default function Footer() {
  return (
    <footer id="site" className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="mb-6">
              <img 
                src="/logo.png" 
                alt="Grupo Raça" 
                className="h-10 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Excelência em leilões de cavalos de elite.
            </p>
            <a
              href="https://gruporaca-site.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold"
            >
              Visitar Site Oficial
              <ExternalLink size={18} />
            </a>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Sede</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin size={20} className="mt-1 flex-shrink-0" />
                <span>
                  Av. Principal, 1000<br />
                  Belo Horizonte, MG<br />
                  CEP: 30000-000
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-lg font-bold mb-6">Contatos por Departamento</h4>
            <div className="grid sm:grid-cols-2 gap-6">
              {contacts.map((contact) => (
                <div key={contact.department} className="space-y-2">
                  <h5 className="font-semibold text-white">{contact.department}</h5>
                  <a
                    href={`tel:${contact.phone.replace(/\D/g, '')}`}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    <Phone size={16} />
                    {contact.phone}
                  </a>
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 text-sm break-all"
                  >
                    <Mail size={16} />
                    {contact.email}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Grupo Raça. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors duration-200">
                Política de Privacidade
              </a>
              <a href="#" className="hover:text-white transition-colors duration-200">
                Termos de Uso
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
