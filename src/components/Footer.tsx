import { Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

const contacts: Array<{
  department: string;
  name: string;
  phone: string;
  whatsapp?: string;
  whatsappMessage?: string;
  email?: string;
}> = [
  {
    department: 'Marketing',
    name: 'Toda Arte',
    phone: '(31) 98237-1886',
    whatsapp: '5531982371886',
    whatsappMessage: 'Olá, gostaria de falar sobre o Marketing Grupo Raça.'
  }
];

const juridicoContacts = [
  {
    name: 'Sheyla',
    phone: '(31) 97196-3100',
    whatsapp: '5531971963100'
  },
  {
    name: 'Isabela',
    phone: '(31) 9907-3212',
    whatsapp: '553199073212'
  }
];

export default function Footer() {
  return (
    <footer id="site" className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div>
            <div className="mb-6">
              <img 
                src="/logo.png" 
                alt="Grupo Raça" 
                className="h-10 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Especialistas em leilões de elite, unindo tradição, inovação e excelência para impulsionar o mercado de criação.
            </p>
            <a
              href="https://gruporaca.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold"
            >
              Visitar Site Oficial
              <ExternalLink size={18} />
            </a>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Contato Rápido</h4>
            <div className="space-y-4">
              <a
                href="tel:2133289772"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Phone size={20} className="flex-shrink-0" />
                <span className="text-lg font-semibold">(21) 3328-9772</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Sede</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin size={20} className="mt-1 flex-shrink-0" />
                <span>
                  R. Viçosa, 191 - São Pedro<br />
                  Belo Horizonte - MG, 30330-160
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
                  {contact.name && (
                    <p className="text-white text-sm font-medium">{contact.name}</p>
                  )}
                  <a
                    href={`tel:${contact.phone.replace(/\D/g, '')}`}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    <Phone size={16} />
                    {contact.phone}
                  </a>
                  {contact.whatsapp && (
                    <a
                      href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(contact.whatsappMessage || 'Olá!')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      <Phone size={16} />
                      WhatsApp
                    </a>
                  )}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 text-sm break-all"
                    >
                      <Mail size={16} />
                      {contact.email}
                    </a>
                  )}
                </div>
              ))}
              <div className="space-y-3">
                <h5 className="font-semibold text-white">Jurídico</h5>
                {juridicoContacts.map((contact, index) => (
                  <div key={index} className="space-y-2">
                    <p className="text-white text-sm font-medium">{contact.name}</p>
                    <a
                      href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent('Olá, gostaria de falar sobre assuntos jurídicos relacionados ao Grupo Raça.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      <Phone size={16} />
                      {contact.phone}
                    </a>
                  </div>
                ))}
              </div>
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
          <div className="flex flex-col md:flex-row justify-center items-center gap-2 mt-6 pt-6 border-t border-gray-800">
            <span className="text-gray-500 text-xs">Desenvolvido por</span>
            <a
              href="https://todaarte.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-100 transition-opacity"
            >
              <img 
                src="/logo-todaarte.png" 
                alt="Toda Arte" 
                className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
