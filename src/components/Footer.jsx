import React, { useState } from 'react';
import { Scissors, MessageCircle, MapPin } from 'lucide-react';
import { InstagramIcon } from './Icons';
import { useBarber } from '../context/BarberContext';
import { getWhatsAppUrl } from '../utils/phoneUtils';

export default function Footer({ onOpenBooking }) {
  const { profile } = useBarber();
  const [clickCount, setClickCount] = useState(0);

  const handleSecretMasterClick = () => {
    const next = clickCount + 1;
    setClickCount(next);
    if (next >= 5) {
      setClickCount(0);
      window.location.hash = '#master';
    }
  };

  const nameParts = (profile.name || 'Barbearia Andrade').split(' ');
  const firstName = nameParts[0] || 'BARBEARIA';
  const restName = nameParts.slice(1).join(' ') || '';

  return (
    <footer className="mt-8 border-t border-dark-800 bg-dark-950 pb-24 pt-8 px-4 text-center">
      <div className="max-w-md mx-auto space-y-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          {profile.logoImage ? (
            <img
              src={profile.logoImage}
              alt={profile.name}
              className="w-8 h-8 rounded-lg object-contain bg-dark-900 border border-dark-750 p-1"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg theme-gradient-accent flex items-center justify-center text-dark-950">
              <Scissors className="w-4 h-4 -rotate-45 font-bold" />
            </div>
          )}

          <span className="font-heading font-black text-lg text-white tracking-wider">
            {firstName} {restName && <span className="theme-text-accent">{restName}</span>}
          </span>
        </div>

        <p className="text-xs text-neutral-400 max-w-xs mx-auto">
          {profile.tagline || 'Estilo, tradição e precisão'}. Atendimento exclusivo por agendamento.
        </p>

        {/* Links de Redes e Contato */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <a
            href={getWhatsAppUrl(profile.whatsappNumber, `Olá ${profile.owner}!`)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-dark-850 hover:bg-dark-800 border border-dark-750 flex items-center justify-center text-emerald-400 hover:scale-110 transition-all"
            title="WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>

          <a
            href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-dark-850 hover:bg-dark-800 border border-dark-750 flex items-center justify-center text-pink-400 hover:scale-110 transition-all"
            title="Instagram"
          >
            <InstagramIcon className="w-4 h-4" />
          </a>

          <a
            href={profile.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((profile.address || '') + ' ' + (profile.cityState || ''))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-dark-850 hover:bg-dark-800 border border-dark-750 flex items-center justify-center theme-text-accent hover:scale-110 transition-all"
            title="Localização Google Maps"
          >
            <MapPin className="w-4 h-4" />
          </a>
        </div>

        <div className="pt-4 border-t border-dark-850 text-xs text-neutral-400">
          <p 
            onClick={handleSecretMasterClick} 
            className="font-semibold tracking-wide text-neutral-400 hover:text-neutral-300 transition-colors select-none cursor-default"
            title="Barbearia Elite"
          >
            Criado por Eullon
          </p>
        </div>
      </div>
    </footer>
  );
}
