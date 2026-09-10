import React, { useState } from 'react';
import { Camera, X, ZoomIn } from 'lucide-react';
import { useBarber } from '../context/BarberContext';

export default function GallerySection() {
  const { galleryImages, profile } = useBarber();
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  if (!galleryImages || galleryImages.length === 0) return null;

  return (
    <section className="px-4 py-3" id="galeria">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
            <Camera className="w-4 h-4 theme-text-accent" />
            <span>Conheça Nosso Espaço</span>
          </h2>
          <p className="text-[11px] text-neutral-400">
            Ambiente moderno e climatizado para o seu conforto
          </p>
        </div>
      </div>

      {/* Grid de Fotos */}
      <div className="grid grid-cols-3 gap-2">
        {galleryImages.map((img, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedPhoto(img)}
            className="group relative aspect-square rounded-xl overflow-hidden border border-dark-750 cursor-pointer hover:border-gold-500/50 transition-all shadow-md"
          >
            <img
              src={img}
              alt={`Ambiente ${profile.name} ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <ZoomIn className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Zoom da Foto */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in"
        >
          <div className="relative max-w-lg w-full max-h-[85vh] rounded-2xl overflow-hidden border border-dark-700">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPhoto}
              alt="Visualização do Espaço"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}
