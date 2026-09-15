import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppWidget: React.FC = () => {
  const whatsappUrl = "https://wa.me/258864813115?text=Olá,%20preciso%20de%20ajuda%20com%20o%20Candidate-se.";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar suporte via WhatsApp"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-600/40 font-bold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 group cursor-pointer border border-emerald-500/50"
    >
      <div className="w-7 h-7 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform">
        <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600" />
      </div>
      <div className="hidden sm:block text-left pr-1">
        <div className="text-[10px] text-emerald-100 font-medium leading-tight">Suporte 24/7</div>
        <div className="text-xs font-bold leading-tight">Fale no WhatsApp</div>
      </div>
      <span className="sm:hidden text-xs font-bold">Ajuda</span>
    </a>
  );
};
