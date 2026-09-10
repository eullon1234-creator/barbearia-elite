import React from 'react';
import { Calendar, MessageCircle, MapPin, Star, Award, Sparkles, Clock, AlertTriangle } from 'lucide-react';
import { InstagramIcon } from './Icons';
import { useBarber } from '../context/BarberContext';
import { getWhatsAppUrl } from '../utils/phoneUtils';

export default function Hero({ onOpenBooking }) {
  const { profile, scheduleConfig } = useBarber();

  const coverImg = profile.coverImage || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80";

  return (
    <section className="relative overflow-hidden pt-2 pb-6 px-4">
      {/* Alerta de Modo Férias */}
      {scheduleConfig.vacationMode && (
        <div className="mb-3 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2.5 shadow-lg animate-pulse">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <div>
            <p className="font-bold">Aviso de Recesso / Férias</p>
            <p className="text-[11px] text-rose-300">{scheduleConfig.vacationMessage}</p>
          </div>
        </div>
      )}

      {/* Card Principal com Imagem de Fundo Premium */}
      <div className="relative rounded-2xl overflow-hidden border border-dark-750 shadow-2xl bg-dark-900">
        {/* Imagem de Fundo com Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={coverImg}
            alt={profile.name}
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.45] contrast-125 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-900/75 to-transparent" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-dark-950/40 to-dark-950/90" />
        </div>

        {/* Conteúdo do Hero */}
        <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-end min-h-[360px]">
          {/* Badge de Destaque */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-900/80 border border-dark-700 text-white text-xs font-semibold backdrop-blur-md self-start mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 theme-text-accent" />
            <span className="theme-text-accent font-bold">Padrão Premium</span>
          </div>

          {/* Título & Slogan */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-2">
            Corte Alinhado & <br />
            <span className="theme-text-gradient font-black">Barba Impecável</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 mb-4 max-w-[90%] leading-relaxed">
            Atendimento exclusivo com <strong className="theme-text-accent font-semibold">{profile.owner}</strong>. {profile.bio}
          </p>

          {/* Mini-Badges de Confiança */}
          <div className="flex items-center gap-3 mb-5 text-[11px] text-neutral-300 flex-wrap">
            <div className="flex items-center gap-1 bg-dark-800/80 px-2.5 py-1 rounded-md border border-neutral-700/50 backdrop-blur-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-white">5.0</span>
              <span className="text-neutral-400">({profile.reviewsCount || '140+'})</span>
            </div>
            <div className="flex items-center gap-1 bg-dark-800/80 px-2.5 py-1 rounded-md border border-neutral-700/50 backdrop-blur-sm">
              <Award className="w-3.5 h-3.5 theme-text-accent" />
              <span>{profile.experienceYears || '5+ Anos Exp.'}</span>
            </div>
            <div className="flex items-center gap-1 bg-dark-800/80 px-2.5 py-1 rounded-md border border-neutral-700/50 backdrop-blur-sm">
              <Clock className="w-3.5 h-3.5 theme-text-accent" />
              <span>Horário Marcado</span>
            </div>
          </div>

          {/* Botão de Ação Principal (CTA) */}
          <button
            onClick={() => onOpenBooking(null)}
            className="w-full py-3.5 px-6 rounded-xl theme-gradient-accent hover:opacity-95 text-dark-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 theme-shadow-glow active:scale-[0.98] transition-all duration-200 uppercase tracking-wide cursor-pointer"
          >
            <Calendar className="w-5 h-5 font-bold" />
            <span>Agendar Meu Horário</span>
          </button>
        </div>
      </div>

      {/* Atalhos Rápidos */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <a
          href={getWhatsAppUrl(profile.whatsappNumber, `Olá ${profile.owner}! Gostaria de tirar uma dúvida.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-dark-700/80 hover:border-emerald-500/40 text-neutral-300 hover:text-emerald-400 transition-all text-xs font-medium"
        >
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          <span>WhatsApp</span>
        </a>

        <a
          href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-dark-700/80 hover:border-pink-500/40 text-neutral-300 hover:text-pink-400 transition-all text-xs font-medium"
        >
          <InstagramIcon className="w-4 h-4 text-pink-400" />
          <span>Instagram</span>
        </a>

        <a
          href={profile.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((profile.address || '') + ' ' + (profile.cityState || ''))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-dark-700/80 hover:border-amber-500/40 text-neutral-300 hover:text-amber-400 transition-all text-xs font-medium"
        >
          <MapPin className="w-4 h-4 theme-text-accent" />
          <span>Como Chegar</span>
        </a>
      </div>
    </section>
  );
}
