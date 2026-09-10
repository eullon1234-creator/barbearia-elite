import React, { useState, useEffect } from 'react';
import { 
  Star, MessageSquare, ThumbsUp, CheckCircle, Plus, 
  ShieldCheck, Sparkles, X, Send, Heart, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBarber } from '../context/BarberContext';

export default function ReviewsSection() {
  const { profile } = useBarber();

  const STORAGE_KEY_REVIEWS = 'barbearia_reviews_v1';

  const defaultReviews = [
    {
      id: 'rev-1',
      name: 'Marcos Vinícius',
      city: 'Tuntum - MA',
      service: 'Combo Andrade (Corte + Barba)',
      rating: 5,
      date: 'Há 2 dias',
      text: 'O melhor degradê de toda a região sem sombra de dúvidas! O Saymon é pontual demais, a toalha quente na barba é diferenciada. Recomendo de olhos fechados!',
      verified: true
    },
    {
      id: 'rev-2',
      name: 'Lucas Ribeiro',
      city: 'Povoado Cigana',
      service: 'Degradê Navalhado',
      rating: 5,
      date: 'Há 4 dias',
      text: 'Atendimento de primeira qualidade. Salão limpo, ar-condicionado gelando e café na recepção. O corte ficou exatamente como pedi na referência.',
      verified: true
    },
    {
      id: 'rev-3',
      name: 'Gabriel Souza',
      city: 'Tuntum - MA',
      service: 'Barboterapia & Toalha Quente',
      rating: 5,
      date: 'Há 1 semana',
      text: 'A terapia de barba é outro nível! Sensação de relaxamento total e a barba ficou alinhada na régua. Já sou cliente fiel.',
      verified: true
    },
    {
      id: 'rev-4',
      name: 'Eduardo Costa',
      city: 'Povoado Cigana',
      service: 'Platinado / Nevou',
      rating: 5,
      date: 'Há 2 semanas',
      text: 'Lancei o nevou com o Saymon e não ressecou nada o cabelo. Profissional que entende de química e visagismo. Nota 10!',
      verified: true
    }
  ];

  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REVIEWS);
      return saved ? JSON.parse(saved) : defaultReviews;
    } catch (e) {
      return defaultReviews;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({
    name: '',
    service: 'Corte Masculino',
    rating: 5,
    text: ''
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
    } catch (e) {}
  }, [reviews]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!newReviewForm.name.trim() || !newReviewForm.text.trim()) {
      alert('Por favor, preencha seu nome e seu comentário.');
      return;
    }

    const created = {
      id: 'rev-' + Date.now(),
      name: newReviewForm.name.trim(),
      city: 'Cliente Verificado',
      service: newReviewForm.service,
      rating: newReviewForm.rating,
      date: 'Hoje',
      text: newReviewForm.text.trim(),
      verified: true
    };

    setReviews(prev => [created, ...prev]);
    setIsModalOpen(false);
    setNewReviewForm({ name: '', service: 'Corte Masculino', rating: 5, text: '' });

    // Confetes comemorativos
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  return (
    <section className="px-4 py-6" id="avaliacoes">
      <div className="space-y-4">
        
        {/* Cabeçalho da Seção */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="p-1 rounded-md theme-bg-accent-subtle theme-text-accent">
                <Award className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider theme-text-accent">
                Experiência Comprovada
              </span>
            </div>
            <h2 className="text-lg font-black text-white">
              O que dizem os clientes
            </h2>
            <p className="text-xs text-neutral-400">
              Mais de 140 clientes atendidos com nota máxima
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="py-2 px-3 rounded-xl theme-gradient-accent text-dark-950 text-xs font-black flex items-center gap-1 shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Avaliar</span>
          </button>
        </div>

        {/* Card Placar de Avaliação Média */}
        <div className="p-4 rounded-2xl bg-card-gradient border border-dark-750 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <span className="text-3xl font-black text-white block">4.9</span>
              <div className="flex items-center justify-center gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                ))}
              </div>
            </div>

            <div className="border-l border-dark-750 pl-3">
              <span className="text-xs font-bold text-white block">Excepcional</span>
              <span className="text-[11px] text-neutral-400">Baseado em {reviews.length + 138} avaliações</span>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>100% Verificado</span>
            </span>
          </div>
        </div>

        {/* Lista de Depoimentos em Carrossel / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-3.5 rounded-2xl bg-dark-900 border border-dark-800 space-y-2.5 flex flex-col justify-between shadow-sm hover:border-dark-700 transition-all"
            >
              <div>
                {/* Estrelas & Data */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-neutral-500">{rev.date}</span>
                </div>

                {/* Texto do Depoimento */}
                <p className="text-xs text-neutral-200 leading-relaxed italic">
                  "{rev.text}"
                </p>
              </div>

              {/* Autor & Serviço */}
              <div className="pt-2 border-t border-dark-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white">{rev.name}</span>
                    {rev.verified && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <span className="text-[10px] text-neutral-400 block">{rev.city}</span>
                </div>

                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-dark-800 text-neutral-300">
                  {rev.service}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Modal Deixar Avaliação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-dark-900 border border-dark-700 p-5 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">Deixar Avaliação</h3>
                <p className="text-[11px] text-neutral-400">Conte sua experiência na Barbearia</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-neutral-400 hover:text-white hover:bg-dark-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-3">
              {/* Seletor de Estrelas */}
              <div className="text-center py-2 bg-dark-850 rounded-2xl border border-dark-750">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">
                  Sua Nota:
                </span>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewForm(prev => ({ ...prev, rating: star }))}
                      className="cursor-pointer transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newReviewForm.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-neutral-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  Seu Nome:
                </label>
                <input
                  type="text"
                  placeholder="Ex: João Pedro"
                  value={newReviewForm.name}
                  onChange={(e) => setNewReviewForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  Serviço Realizado:
                </label>
                <select
                  value={newReviewForm.service}
                  onChange={(e) => setNewReviewForm(prev => ({ ...prev, service: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-white text-xs focus:outline-none"
                >
                  <option value="Corte Masculino / Degradê">Corte Masculino / Degradê</option>
                  <option value="Combo Andrade (Corte + Barba)">Combo Andrade (Corte + Barba)</option>
                  <option value="Barba Alinhada / Toalha Quente">Barba Alinhada / Toalha Quente</option>
                  <option value="Platinado / Nevou">Platinado / Nevou</option>
                  <option value="Sobrancelha / Acabamento">Sobrancelha / Acabamento</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  Seu Comentário:
                </label>
                <textarea
                  rows={3}
                  placeholder="Conte como foi seu corte, o atendimento do Saymon e o ambiente..."
                  value={newReviewForm.text}
                  onChange={(e) => setNewReviewForm(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-dark-800 text-neutral-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl theme-gradient-accent text-dark-950 text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Publicar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
