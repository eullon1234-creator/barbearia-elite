import React from 'react';
import { CheckCircle, Flame, Star, ShieldCheck } from 'lucide-react';
import { useBarber } from '../context/BarberContext';

export default function BarberCard() {
  const { profile, scheduleConfig } = useBarber();

  const isAvailable = !scheduleConfig.vacationMode && !scheduleConfig.status.includes('Pausa');

  return (
    <section className="px-4 py-3">
      <div className="p-4 rounded-2xl bg-card-gradient border border-dark-700/80 shadow-lg relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3.5 mb-3.5">
          {/* Foto do Barbeiro */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-gold-400 via-gold-600 to-amber-200 shadow-gold-glow-sm">
              <img
                src={profile.image}
                alt={profile.owner}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div 
              className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-dark-900 ${
                isAvailable ? 'bg-emerald-500 text-dark-950' : 'bg-amber-500 text-dark-950'
              }`} 
              title={isAvailable ? "Disponível para agendamento" : "Em intervalo / pausa"}
            >
              <CheckCircle className="w-3 h-3 text-dark-950 stroke-[3]" />
            </div>
          </div>

          {/* Dados do Barbeiro */}
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-extrabold text-white">
                {profile.owner}
              </h3>
              <ShieldCheck className="w-4 h-4 text-gold-400" />
            </div>
            <p className="text-xs text-gold-400 font-medium">{profile.role}</p>
            
            <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
              <span className="flex items-center gap-0.5 text-amber-300 font-semibold">
                <Star className="w-3 h-3 fill-amber-300" /> 4.9
              </span>
              <span>•</span>
              <span>100% Pontualidade</span>
              <span>•</span>
              <span>{profile.cityState || 'Av. Petrônio Portela'}</span>
            </div>
          </div>
        </div>

        {/* Especialidades Dinâmicas em Tags */}
        <div className="pt-2 border-t border-dark-700/60">
          <p className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1">
            <Flame className="w-3 h-3 text-gold-400" />
            <span>Especialidades & Técnicas</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {profile.specialties.map((item, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2.5 py-1 rounded-md bg-dark-800 text-neutral-300 border border-dark-700/70"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
