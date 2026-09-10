import React, { useState } from 'react';
import { MapPin, Navigation, Clock, ExternalLink, Copy, Check } from 'lucide-react';
import { useBarber } from '../context/BarberContext';
import { getMapEmbedUrl } from '../utils/mapUtils';

export default function LocationSection() {
  const { profile, scheduleConfig } = useBarber();
  const [copied, setCopied] = useState(false);

  const displayAddress = profile.address || 'Rua Principal, Povoado Cigana, Tuntum - MA';
  const displayCityState = profile.cityState || (profile.address ? profile.address.split(',').slice(-2).join(', ').trim() : 'Povoado Cigana, Tuntum - MA');
  
  const finalMapsUrl = (profile.lat && profile.lng)
    ? `https://www.google.com/maps?q=${profile.lat},${profile.lng}`
    : profile.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayAddress + ' ' + (profile.name || ''))}`;
  
  const embedUrl = getMapEmbedUrl(profile);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(displayAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section className="px-4 py-4" id="localizacao">
      <div className="rounded-2xl bg-card-gradient border border-dark-700/80 p-4 relative overflow-hidden">
        {/* Header da Seção */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl theme-bg-accent-subtle theme-text-accent">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Endereço & Localização
              </h3>
              <p className="text-xs text-neutral-400">Venha dar um trato no visual</p>
            </div>
          </div>

          <button
            onClick={handleCopyAddress}
            className="px-2.5 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-neutral-300 hover:text-white border border-dark-700 flex items-center gap-1.5 text-[11px] font-semibold transition-all cursor-pointer"
            title="Copiar endereço"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 opacity-70" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Card de Endereço */}
        <div className="p-3.5 rounded-xl bg-dark-850/90 border border-dark-700/60 mb-3.5 space-y-3">
          <div>
            <p className="text-sm font-bold text-neutral-100">
              {displayAddress}
            </p>
            {displayCityState && (
              <p className="text-xs theme-text-accent font-medium mt-0.5 flex items-center gap-1">
                <span>📍 {displayCityState}</span>
              </p>
            )}
          </div>

          {/* Mini Mapa Interativo Google Maps Embed */}
          <div className="w-full h-44 rounded-xl overflow-hidden border border-dark-700/80 relative bg-dark-900 shadow-inner group">
            <iframe
              title={`Mapa da ${profile.name || 'Barbearia'}`}
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              key={embedUrl}
              src={embedUrl}
              className="w-full h-full filter contrast-125 opacity-90 group-hover:opacity-100 transition-opacity"
              loading="lazy"
            />
            <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-dark-950/80 backdrop-blur-sm border border-dark-700/60 text-[10px] text-neutral-300 pointer-events-none flex items-center gap-1">
              <MapPin className="w-3 h-3 theme-text-accent" />
              <span>Google Maps</span>
            </div>
          </div>

          {/* Botão Traçar Rota no Google Maps */}
          <a
            href={finalMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 rounded-xl theme-gradient-accent text-dark-950 font-black flex items-center justify-center gap-2 text-xs transition-all shadow-sm hover:brightness-110 active:scale-[0.99]"
          >
            <Navigation className="w-4 h-4" />
            <span>Traçar Rota no Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-75" />
          </a>
        </div>

        {/* Horários de Funcionamento Dinâmicos */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-dark-800">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 theme-text-accent" />
              Segunda a Sexta
            </span>
            <span className="text-white font-semibold">
              {scheduleConfig.weekdaysStart} às {scheduleConfig.weekdaysEnd}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-dark-800">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 theme-text-accent" />
              Sábado
            </span>
            <span className="text-white font-semibold">
              {scheduleConfig.saturdayStart} às {scheduleConfig.saturdayEnd}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <span className="text-neutral-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              Domingo
            </span>
            <span className="text-rose-400/90 font-medium">Fechado</span>
          </div>
        </div>
      </div>
    </section>
  );
}
