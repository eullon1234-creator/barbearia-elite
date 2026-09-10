import React from 'react';
import { Scissors, MessageCircle, User } from 'lucide-react';
import { useBarber } from '../context/BarberContext';
import { InstagramIcon } from './Icons';
import { getWhatsAppUrl } from '../utils/phoneUtils';

export default function Navbar({ onOpenBooking, clientTab = 'home', onSelectTab, onOpenClientAuth, onOpenClientProfile }) {
  const { profile, scheduleConfig, currentClient } = useBarber();

  const isOpenNow = () => {
    if (scheduleConfig.vacationMode) return false;
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    
    if (day === 0) return false;
    if (day === 6) return hours >= 8 && hours < 13;
    return hours >= 13 && hours < 18;
  };

  const open = isOpenNow();

  // Divide o nome da barbearia se houver duas palavras (ex: BARBEARIA ELITE)
  const nameParts = (profile.name || 'Barbearia Elite').split(' ');
  const firstName = nameParts[0] || 'BARBEARIA';
  const restName = nameParts.slice(1).join(' ') || '';

  return (
    <header className="sticky top-0 z-40 bg-dark-950/90 backdrop-blur-md border-b border-dark-800 transition-all">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo & Nome */}
        <div className="flex items-center gap-2.5">
          {profile.logoImage ? (
            <img
              src={profile.logoImage}
              alt={profile.name}
              className="w-10 h-10 rounded-xl object-contain bg-dark-900 border border-dark-750 p-1"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl theme-gradient-accent flex items-center justify-center text-dark-950 theme-shadow-glow-sm">
              <Scissors className="w-5 h-5 -rotate-45 font-bold" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-wide text-white font-heading">
                {firstName}
              </span>
              {restName && (
                <span className="font-extrabold text-base tracking-wide theme-text-accent font-heading">
                  {restName}
                </span>
              )}
            </div>
            
            {/* Tag de Status */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className={`w-2 h-2 rounded-full ${
                scheduleConfig.vacationMode 
                  ? 'bg-rose-500' 
                  : open 
                  ? 'bg-emerald-500 animate-pulse' 
                  : 'bg-amber-500'
              }`} />
              <span className="text-neutral-300 font-medium">
                {scheduleConfig.vacationMode 
                  ? 'Em Férias' 
                  : open 
                  ? 'Aberto Agora' 
                  : `Abre às ${scheduleConfig.weekdaysStart || '13:00'}`}
              </span>
              <span className="text-neutral-500">•</span>
              <span className="text-neutral-400 text-[10px] truncate max-w-[120px]">
                {profile.address ? profile.address.split(',')[0] : 'Av. Petrônio Portela'}
              </span>
            </div>
          </div>
        </div>

        {/* Botões de Ação do Topo */}
        <div className="flex items-center gap-1.5">

          {/* Botão de Conta do Cliente (Entrar ou Perfil VIP) */}
          {currentClient ? (
            <button
              type="button"
              onClick={onOpenClientProfile}
              className="px-2.5 py-1.5 rounded-xl bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/40 text-gold-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Minha Conta VIP (Ver cortes e fidelidade)"
            >
              <div className="w-4 h-4 rounded-full bg-gold-500 text-dark-950 font-black text-[9px] flex items-center justify-center shrink-0">
                {currentClient.name.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[70px] truncate">{currentClient.name.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenClientAuth}
              className="px-2.5 py-1.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-dark-700 hover:border-gold-500/40 text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Entrar para salvar cortes"
            >
              <User className="w-3.5 h-3.5 text-gold-400" />
              <span>Entrar</span>
            </button>
          )}

          <a
            href={getWhatsAppUrl(profile.whatsappNumber, `Olá ${profile.owner}! Gostaria de tirar uma dúvida.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm"
            title="Falar no WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-emerald-400/20" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </div>
    </header>
  );
}
