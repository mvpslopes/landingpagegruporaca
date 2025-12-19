import { MessageCircle } from 'lucide-react';
import { trackClick } from '../hooks/useTracking';
import { trackWhatsAppClick } from '../utils/analytics';

export default function WhatsAppButton() {
  const whatsappNumber = '5521981972847'; // Ariane Andrade
  const message = encodeURIComponent('Olá, gostaria de saber mais sobre o Grupo Raça.');

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        trackClick('button', 'whatsapp', 'Fale conosco no WhatsApp', Math.floor(e.clientX - rect.left), Math.floor(e.clientY - rect.top));
        trackWhatsAppClick('5521981972847');
      }}
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Fale conosco no WhatsApp"
    >
      <div className="relative">
        {/* Efeito de pulso */}
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
        <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse opacity-50"></div>
        
        {/* Botão principal */}
        <div className="relative w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl hover:bg-green-600 transition-all duration-300 hover:scale-110 group-hover:shadow-green-500/50">
          <MessageCircle size={28} className="text-white" />
        </div>
        
        {/* Tooltip */}
        <div className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Fale conosco
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-black"></div>
        </div>
      </div>
    </a>
  );
}

