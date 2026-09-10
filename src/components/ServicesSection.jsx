import React, { useState } from 'react';
import { Clock, Scissors, Sparkles, ChevronRight } from 'lucide-react';
import { useBarber } from '../context/BarberContext';

export default function ServicesSection({ onOpenBooking }) {
  const { services } = useBarber();
  const [selectedCategory, setSelectedCategory] = useState('todos');

  const categories = [
    { id: 'todos', label: 'Todos os Serviços' },
    { id: 'cabelo', label: 'Cortes' },
    { id: 'barba', label: 'Barba' },
    { id: 'combo', label: 'Combos' },
    { id: 'acabamento', label: 'Acabamentos' },
  ];

  const filteredServices = selectedCategory === 'todos'
    ? services
    : services.filter(s => s.category === selectedCategory);

  return (
    <section className="px-4 py-4" id="servicos">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Catálogo de Serviços</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400"></span>
          </h2>
          <p className="text-xs text-neutral-400">
            Escolha o serviço desejado para iniciar seu agendamento
          </p>
        </div>
      </div>

      {/* Abas de Categorias */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-gold-500 text-dark-950 shadow-gold-glow-sm'
                : 'bg-dark-850 text-neutral-400 hover:text-white border border-dark-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Lista de Serviços */}
      <div className="space-y-3">
        {filteredServices.length === 0 ? (
          <div className="p-6 rounded-2xl bg-dark-900 border border-dark-800 text-center text-xs text-neutral-400">
            Nenhum serviço encontrado nesta categoria.
          </div>
        ) : (
          filteredServices.map((service) => (
            <div
              key={service.id}
              className="group relative rounded-2xl bg-card-gradient border border-dark-700/80 hover:border-gold-500/50 p-3.5 transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
            >
              {/* Tag Especial se for Combo / Mais Pedido */}
              {service.badge && (
                <div className="absolute -top-2.5 right-4 z-10 px-2.5 py-0.5 rounded-full bg-gold-gradient text-dark-950 text-[10px] font-extrabold uppercase tracking-wider shadow-gold-glow-sm flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{service.badge}</span>
                </div>
              )}

              <div className="flex gap-3.5">
                {/* Imagem do Serviço */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 border border-dark-700">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Informações */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-gold-300 transition-colors leading-snug">
                      {service.name}
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gold-400" />
                      {service.duration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rodapé do Card: Preço e Botão de Agendar */}
              <div className="mt-3 pt-3 border-t border-dark-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 block font-semibold">
                    Investimento
                  </span>
                  <span className="text-lg font-extrabold text-gold-400">
                    R$ {parseFloat(service.price).toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <button
                  onClick={() => onOpenBooking(service)}
                  className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-950 text-xs font-bold flex items-center gap-1.5 shadow-gold-glow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <span>Agendar</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
