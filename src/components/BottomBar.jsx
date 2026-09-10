import React from 'react';
import { Home, Calendar, MessageCircle, User } from 'lucide-react';
import { useBarber } from '../context/BarberContext';
import { getWhatsAppUrl } from '../utils/phoneUtils';

export default function BottomBar({ onOpenBooking, clientTab = 'home', onSelectTab, onOpenClientAuth, onOpenClientProfile }) {
  const { profile, currentClient } = useBarber();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-2 bg-dark-950/95 backdrop-blur-xl border-t border-dark-800 shadow-[0_-10px_25px_rgba(0,0,0,0.8)]">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1 items-center">
        
        {/* Aba Início */}
        <button
          onClick={() => onSelectTab && onSelectTab('home')}
          className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            clientTab === 'home'
              ? 'bg-dark-850 text-white font-bold border border-dark-700 theme-shadow-glow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-dark-900'
          }`}
        >
          <Home className={`w-4 h-4 ${clientTab === 'home' ? 'theme-text-accent' : ''}`} />
          <span className="text-[9px] tracking-tight">Início</span>
        </button>

        {/* Aba Minha Conta / Perfil VIP */}
        <button
          onClick={() => {
            if (currentClient) {
              onOpenClientProfile && onOpenClientProfile();
            } else {
              onOpenClientAuth && onOpenClientAuth();
            }
          }}
          className="py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-neutral-400 hover:text-white hover:bg-dark-900"
          title={currentClient ? 'Ver Minha Conta' : 'Fazer Login'}
        >
          {currentClient ? (
            <div className="w-4 h-4 rounded-full bg-gold-500 text-dark-950 font-black text-[9px] flex items-center justify-center shadow-gold-glow-sm">
              {currentClient.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <User className="w-4 h-4 text-gold-400" />
          )}
          <span className="text-[9px] tracking-tight truncate max-w-[50px] font-medium">
            {currentClient ? currentClient.name.split(' ')[0] : 'Conta'}
          </span>
        </button>

        {/* Botão de WhatsApp */}
        <a
          href={getWhatsAppUrl(profile.whatsappNumber, `Olá ${profile.owner}! Gostaria de tirar uma dúvida.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 text-emerald-400 hover:text-emerald-300 hover:bg-dark-900 transition-all"
          title="Falar no WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-[9px] tracking-tight text-neutral-300">Whats</span>
        </a>

        {/* Botão de Agendamento Rápido */}
        <button
          onClick={() => onOpenBooking(null)}
          className="py-2 px-1 rounded-xl theme-gradient-accent text-dark-950 font-black flex flex-col items-center justify-center gap-0.5 theme-shadow-glow active:scale-[0.96] transition-all cursor-pointer shadow-lg"
          title="Agendar horário online"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-tighter">Agendar</span>
        </button>

      </div>
    </div>
  );
}
