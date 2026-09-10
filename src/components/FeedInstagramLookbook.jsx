import React, { useState, useEffect } from 'react';
import { 
  Heart, MessageCircle, Share2, Bookmark, Scissors, 
  Sparkles, CheckCircle2, ShieldCheck, Send, ExternalLink,
  ChevronRight, User
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';
import { InstagramIcon } from './Icons';

export default function FeedInstagramLookbook({ onOpenBooking, onOpenFeedView }) {
  const { profile, services, theme, feedPosts, toggleLikeFeedPost, addCommentToFeedPost } = useBarber();

  // Post com comentários abertos (accordion)
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [heartAnimPostId, setHeartAnimPostId] = useState(null);

  // Duplo clique na foto (Double-tap heart)
  const handleDoubleTap = (postId) => {
    const post = (feedPosts || []).find(p => p.id === postId);
    if (post && !post.isLiked) {
      toggleLikeFeedPost(postId);
    }
    setHeartAnimPostId(postId);
    setTimeout(() => setHeartAnimPostId(null), 850);
  };

  // Enviar novo comentário
  const handleAddComment = (postId, e) => {
    e.preventDefault();
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;

    addCommentToFeedPost(postId, {
      user: 'Cliente VIP',
      text
    });

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  // Agendar este corte
  const handleBookCut = (serviceName) => {
    const foundSvc = services.find(s => s.name.toLowerCase().includes(serviceName.toLowerCase().slice(0, 10)));
    onOpenBooking(foundSvc || services[0]);
  };

  return (
    <section className="px-4 py-6" id="feed-cortes">
      <div className="space-y-4">
        
        {/* Cabeçalho Estilo Instagram */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-md">
                <img
                  src={profile.image}
                  alt={profile.owner}
                  className="w-full h-full rounded-full object-cover border-2 border-dark-950"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-dark-950" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-white">{profile.owner}</h3>
                <ShieldCheck className="w-4 h-4 theme-text-accent" />
              </div>
              <p className="text-[11px] text-neutral-400">@{profile.instagram || 'saymon_andradeee'}</p>
            </div>
          </div>

          <a
            href={`https://instagram.com/${profile.instagram || 'saymon_andradeee'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-all"
          >
            <InstagramIcon className="w-3.5 h-3.5" />
            <span>Seguir</span>
          </a>
        </div>

        {/* Título da Seção & Acesso ao Feed */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
              <span>Feed de Cortes & Inspirações</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full theme-gradient-accent text-dark-950 font-black">
                FEED
              </span>
            </h2>
            <p className="text-xs text-neutral-400">Veja os trabalhos recentes e escolha o seu</p>
          </div>

          {onOpenFeedView && (
            <button
              onClick={onOpenFeedView}
              className="py-1 px-2.5 rounded-xl bg-gradient-to-r from-rose-500/15 via-pink-500/15 to-purple-500/15 border border-pink-500/30 text-pink-300 hover:text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
              <span>Ver no Insta</span>
            </button>
          )}
        </div>

        {/* Banner para abrir a aba exclusiva estilo Instagram */}
        {onOpenFeedView && (
          <button
            onClick={onOpenFeedView}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/30 via-pink-900/25 to-amber-900/30 border border-pink-500/30 hover:border-pink-500/60 flex items-center justify-between transition-all group cursor-pointer shadow-lg text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                <InstagramIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">
                    Abrir Aba Exclusiva do Instagram
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                </div>
                <span className="text-[11px] text-pink-200 block mt-0.5">
                  Stories, fotos em grade 3x3 e @ dos clientes marcados!
                </span>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-pink-500/20 text-pink-300 group-hover:bg-pink-500 group-hover:text-dark-950 transition-all">
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        )}

        {/* Lista de Posts do Feed */}
        <div className="space-y-4">
          {(feedPosts || []).map((post) => {
            const isLiked = !!post.isLiked;
            const currentLikes = post.likes || 0;
            const comments = post.comments || [];
            const isCommentsOpen = openCommentsPostId === post.id;

            return (
              <div 
                key={post.id}
                className="rounded-3xl bg-dark-900 border border-dark-750 overflow-hidden shadow-xl"
              >
                {/* Header do Post */}
                <div className="p-3 px-3.5 flex items-center justify-between border-b border-dark-800/80 bg-dark-950/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full p-0.5 theme-gradient-accent">
                      <img
                        src={profile.image}
                        alt={profile.owner}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white">{profile.owner}</span>
                        <CheckCircle2 className="w-3 h-3 theme-text-accent" />
                      </div>
                      <span className="text-[10px] text-neutral-400">{profile.address ? profile.address.split(',')[0] : 'Tuntum - MA'}</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-neutral-500 font-medium">
                    {post.timeAgo || 'Hoje'}
                  </span>
                </div>

                {/* Imagem do Post com Double-Tap Heart */}
                <div 
                  className="relative aspect-square w-full bg-dark-950 select-none cursor-pointer overflow-hidden group"
                  onDoubleClick={() => handleDoubleTap(post.id)}
                >
                  <img
                    src={post.image}
                    alt={post.serviceName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Coração Animado ao Dar Dois Toques */}
                  {heartAnimPostId === post.id && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 animate-in zoom-in-50 fade-in duration-200">
                      <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl animate-bounce" />
                    </div>
                  )}

                  {/* Tag do Serviço na foto */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-dark-950/80 backdrop-blur-md border border-dark-700 text-[10px] font-bold text-white flex items-center gap-1 shadow-md">
                    <Scissors className="w-3 h-3 theme-text-accent" />
                    <span>{post.serviceName}</span>
                  </div>

                  {/* Tag com @ do Cliente Marcado no Instagram */}
                  {post.clientInstagram && (
                    <a
                      href={`https://instagram.com/${post.clientInstagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-md border border-pink-500/50 text-pink-300 hover:text-white hover:border-pink-400 text-[10px] font-bold flex items-center gap-1.5 shadow-lg transition-all"
                      title={`Ver perfil de ${post.clientInstagram} no Instagram`}
                    >
                      <InstagramIcon className="w-3 h-3 text-pink-400" />
                      <span>{post.clientInstagram}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  )}
                </div>

                {/* Barra de Ações (Curtir, Comentar, Agendar) */}
                <div className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Botão Curtir */}
                      <button
                        onClick={() => toggleLikeFeedPost(post.id)}
                        className={`flex items-center gap-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                          isLiked ? 'text-rose-500' : 'text-neutral-300 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-5 h-5 transition-transform active:scale-125 ${isLiked ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                        <span>{currentLikes}</span>
                      </button>

                      {/* Botão Comentários */}
                      <button
                        onClick={() => setOpenCommentsPostId(isCommentsOpen ? null : post.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>{comments.length}</span>
                      </button>
                    </div>

                    {/* Botão "Quero Esse Corte" */}
                    <button
                      onClick={() => handleBookCut(post.serviceName)}
                      className="py-1.5 px-3 rounded-xl theme-gradient-accent text-dark-950 text-[11px] font-black flex items-center gap-1 shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                      <Scissors className="w-3 h-3 stroke-[3]" />
                      <span>Quero Esse Corte</span>
                    </button>
                  </div>

                  {/* Legenda do Post */}
                  <div className="text-xs text-neutral-200">
                    <span className="font-bold text-white mr-1.5">{profile.owner}</span>
                    <span className="leading-relaxed">{post.caption}</span>
                  </div>

                  {/* Comentários Expandíveis */}
                  <div className="pt-2 border-t border-dark-800 space-y-2">
                    {comments.length > 0 && (
                      <button
                        onClick={() => setOpenCommentsPostId(isCommentsOpen ? null : post.id)}
                        className="text-[11px] text-neutral-400 hover:text-white block cursor-pointer"
                      >
                        {isCommentsOpen 
                          ? 'Ocultar comentários' 
                          : `Ver todos os ${comments.length} comentários...`}
                      </button>
                    )}

                    {isCommentsOpen && (
                      <div className="space-y-1.5 pt-1 pl-1">
                        {comments.map((c) => (
                          <div key={c.id} className="text-xs flex items-start gap-1.5">
                            <span className="font-bold text-neutral-300 text-[11px]">{c.user}:</span>
                            <span className="text-neutral-300 text-[11px]">{c.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Input para Adicionar Comentário */}
                    <form 
                      onSubmit={(e) => handleAddComment(post.id, e)}
                      className="flex items-center gap-2 pt-1"
                    >
                      <input
                        type="text"
                        placeholder="Deixe seu elogio ou comentário..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        className="flex-1 p-2 rounded-xl bg-dark-850 border border-dark-700/80 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400/60"
                      />
                      <button
                        type="submit"
                        disabled={!(commentInputs[post.id] || '').trim()}
                        className="p-2 rounded-xl theme-gradient-accent text-dark-950 font-black disabled:opacity-40 transition-all cursor-pointer"
                        title="Enviar comentário"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
