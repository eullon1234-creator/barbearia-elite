import React from 'react';
import { Snowflake, Wifi, Coffee, Music, Car, Sparkles, Gamepad2, Check } from 'lucide-react';
import { useBarber } from '../context/BarberContext';

export default function AmenitiesSection() {
  const { amenities } = useBarber();

  const activeAmenities = amenities.filter(a => a.enabled);

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Snowflake': return <Snowflake className="w-4 h-4 text-gold-400" />;
      case 'Wifi': return <Wifi className="w-4 h-4 text-gold-400" />;
      case 'Coffee': return <Coffee className="w-4 h-4 text-gold-400" />;
      case 'Music': return <Music className="w-4 h-4 text-gold-400" />;
      case 'Car': return <Car className="w-4 h-4 text-gold-400" />;
      case 'Gamepad2': return <Gamepad2 className="w-4 h-4 text-gold-400" />;
      default: return <Sparkles className="w-4 h-4 text-gold-400" />;
    }
  };

  if (activeAmenities.length === 0) return null;

  return (
    <section className="px-4 py-3">
      <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800">
        <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-bold mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span>Comodidades da Barbearia</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {activeAmenities.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 p-2 rounded-xl bg-dark-850/80 border border-dark-750/60"
            >
              <div className="p-1.5 rounded-lg bg-gold-500/10 flex-shrink-0">
                {getIcon(item.icon)}
              </div>
              <span className="text-xs text-neutral-200 font-medium">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
