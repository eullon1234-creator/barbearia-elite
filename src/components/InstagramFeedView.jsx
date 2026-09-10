import React, { useState } from 'react';
import { 
  Heart, MessageCircle, Share2, Bookmark, Scissors, 
  ShieldCheck, CheckCircle2, Send, ExternalLink, Grid, 
  Square, User, MoreHorizontal, Sparkles, ChevronLeft,
  Camera, MessageSquare, ArrowLeft, Tag
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';
import { InstagramIcon } from './Icons';
import { getWhatsAppUrl } from '../utils/phoneUtils';

export default function InstagramFeedView({ onBackToHome, onOpenBooking }) {
  const { profile, services, feedPosts, toggleLikeFeedPost, addCommentToFeedPost } = useBarber();

  const [viewMode, setViewMode] = useState('feed'); // 'feed' | 'grid'
  const [selectedGridPost, setSelectedGridPost] = useState(null);
  const [showTagsPostId, setShowTagsPostId] = useState(null);
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [heartAnimPostId, setHeartAnimPostId] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Duplo clique na foto (Double-Tap Heart)
  const handleDoubleTap = (postId) => {
    const post = feedPosts.find(p => p.id === postId);
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
    const foundSvc = services.find(s => s.name.toLowerCase().includes((serviceName || '').toLowerCase().slice(0, 10)));
    onOpenBooking(foundSvc || services[0]);
  };

  // Compartilhar
  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({
        title: `Corte de Cabelo na Barbearia Andrade`,
        text: `${post.serviceName}: ${post.caption}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 pb-24 animate-in fade-in duration-300">
      
      {/* 1. Barra Superior Estilo Instagram */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-dark-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToHome}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-dark-800 text-neutral-300 hover:text-white transition-all cursor-pointer"
            title="Voltar para a página inicial"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-white font-serif italic">
              Instagram
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">/ @{profile.instagram || 'saymon_andradeee'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={getWhatsAppUrl(profile.whatsappNumber, 'Olá Saymon! Vi as fotos no feed e gostaria de tirar uma dúvida.')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-300 hover:text-white transition-colors"
            title="Mandar Mensagem Direct (WhatsApp)"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
        </div>
      </header>

      {/* 2. Cabeçalho de Perfil do Saymon */}
      <div className="px-4 py-4 border-b border-dark-800/80 bg-dark-950/40 space-y-3">
        <div className="flex items-center justify-between">
          {/* Foto de Perfil com Story Ring */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-md">
              <img
                src={profile.image}
                alt={profile.owner}
                className="w-full h-full rounded-full object-cover border-2 border-black"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center text-[9px] font-bold text-black">
              ✓
            </span>
          </div>

          {/* Estatísticas Sociais */}
          <div className="flex items-center gap-6 text-center pr-2">
            <div>
              <span className="text-sm font-extrabold text-white block">{feedPosts.length}</span>
              <span className="text-[10px] text-neutral-400">publicações</span>
            </div>
            <div>
              <span className="text-sm font-extrabold text-white block">2.4k</span>
              <span className="text-[10px] text-neutral-400">seguidores</span>
            </div>
            <div>
              <span className="text-sm font-extrabold text-white block">318</span>
              <span className="text-[10px] text-neutral-400">seguindo</span>
            </div>
          </div>
        </div>

        {/* Nome, Bio e Selo */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-extrabold text-white">{profile.owner}</h1>
            <ShieldCheck className="w-4 h-4 text-sky-400 fill-sky-400/20" />
            <span className="text-[10px] text-neutral-400">• Barbearia</span>
          </div>
          <p className="text-xs text-neutral-200 leading-relaxed">
            ✂️ Visagismo Masculino & Terapia de Barba<br />
            📍 {profile.address ? profile.address.split(',')[0] : 'Povoado Cigana'}, {profile.cityState || 'Tuntum - MA'}<br />
            ⚡ Cortes na régua e toalha quente
          </p>
        </div>

        {/* Botões de Ação do Perfil */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onOpenBooking(null)}
            className="flex-1 py-2 px-3 rounded-xl theme-gradient-accent text-dark-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer"
          >
            <Scissors className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Agendar Horário</span>
          </button>

          <a
            href={`https://instagram.com/${profile.instagram || 'saymon_andradeee'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 rounded-xl bg-dark-850 hover:bg-dark-800 border border-dark-750 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <InstagramIcon className="w-3.5 h-3.5" />
            <span>Seguir</span>
          </a>
        </div>
      </div>

      {/* 4. Alternador de Visualização: Feed (1x1) vs Grade (3x3) */}
      <div className="grid grid-cols-2 border-b border-dark-800 bg-black">
        <button
          onClick={() => setViewMode('feed')}
          className={`py-3 flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer border-b-2 ${
            viewMode === 'feed'
              ? 'theme-text-accent border-current'
              : 'text-neutral-500 border-transparent hover:text-neutral-300'
          }`}
        >
          <Square className="w-4 h-4" />
          <span>Feed Completo</span>
        </button>

        <button
          onClick={() => setViewMode('grid')}
          className={`py-3 flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer border-b-2 ${
            viewMode === 'grid'
              ? 'theme-text-accent border-current'
              : 'text-neutral-500 border-transparent hover:text-neutral-300'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Grade ({feedPosts.length})</span>
        </button>
      </div>

      {/* Toast de Link Copiado */}
      {copiedLink && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl theme-gradient-accent text-dark-950 text-xs font-black shadow-lg animate-in fade-in">
          Link do corte copiado!
        </div>
      )}

      {/* 5. MODO 1: GRADE 3x3 */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-3 gap-1 p-1">
          {feedPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => {
                setViewMode('feed');
                // Scroll até o post
                const el = document.getElementById(post.id);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="aspect-square relative bg-dark-900 cursor-pointer overflow-hidden group"
            >
              <img
                src={post.image}
                alt={post.serviceName}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold">
                <Heart className="w-4 h-4 fill-white" />
                <span>{post.likes || 0}</span>
              </div>

              {/* Tag de Cliente se houver */}
              {post.clientInstagram && (
                <div className="absolute bottom-1 left-1 p-0.5 rounded-full bg-black/80 text-white">
                  <User className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 6. MODO 2: FEED COMPLETO VERTICAL */}
      {viewMode === 'feed' && (
        <div className="divide-y divide-dark-800/80">
          {feedPosts.map((post) => {
            const isLiked = !!post.isLiked;
            const comments = post.comments || [];
            const isCommentsOpen = openCommentsPostId === post.id;
            const isShowingTags = showTagsPostId === post.id;

            return (
              <article key={post.id} id={post.id} className="pt-3 pb-5">
                
                {/* Header do Post */}
                <div className="px-3.5 pb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
                      <img
                        src={profile.image}
                        alt={profile.owner}
                        className="w-full h-full rounded-full object-cover border border-black"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white">{profile.owner}</span>
                        <CheckCircle2 className="w-3 h-3 theme-text-accent" />
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        {profile.address ? profile.address.split(',')[0] : 'Povoado Cigana, Tuntum - MA'}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-neutral-500 font-medium">
                    {post.timeAgo || 'Hoje'}
                  </span>
                </div>

                {/* Imagem do Corte com Double-Tap Heart & Tag de Cliente */}
                <div 
                  className="relative aspect-square w-full bg-dark-950 select-none cursor-pointer overflow-hidden"
                  onDoubleClick={() => handleDoubleTap(post.id)}
                  onClick={() => {
                    // Ao tocar, alterna a exibição da tag do cliente
                    if (post.clientInstagram) {
                      setShowTagsPostId(isShowingTags ? null : post.id);
                    }
                  }}
                >
                  <img
                    src={post.image}
                    alt={post.serviceName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Coração Animado com Duplo Toque */}
                  {heartAnimPostId === post.id && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-in zoom-in-50 duration-200">
                      <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl animate-bounce" />
                    </div>
                  )}

                  {/* Tag do Serviço no Topo */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-dark-750 text-[10px] font-bold text-white flex items-center gap-1 shadow-md">
                    <Scissors className="w-3 h-3 theme-text-accent" />
                    <span>{post.serviceName}</span>
                  </div>

                  {/* Botão de Pessoas Marcadas (Canto Inferior Esquerdo) */}
                  {post.clientInstagram && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTagsPostId(isShowingTags ? null : post.id);
                      }}
                      className={`absolute bottom-3 left-3 p-1.5 rounded-full border shadow-lg transition-all cursor-pointer ${
                        isShowingTags 
                          ? 'theme-gradient-accent text-dark-950 border-amber-400' 
                          : 'bg-black/75 backdrop-blur-md text-white border-dark-700 hover:bg-black'
                      }`}
                      title="Ver pessoa marcada"
                    >
                      <User className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Balão Flutuante de Marcação Oficial do Instagram (@cliente) */}
                  {post.clientInstagram && isShowingTags && (
                    <div className="absolute bottom-11 left-3 z-10 animate-in fade-in zoom-in-90 duration-200">
                      <a
                        href={`https://instagram.com/${post.clientInstagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 rounded-xl bg-black/90 backdrop-blur-md border border-dark-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xl hover:border-amber-400/80 transition-all group"
                      >
                        <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                        <span>{post.clientInstagram.startsWith('@') ? post.clientInstagram : `@${post.clientInstagram}`}</span>
                        {post.clientName && (
                          <span className="text-[10px] text-neutral-400 font-normal">({post.clientName})</span>
                        )}
                        <ExternalLink className="w-3 h-3 text-neutral-400 group-hover:text-white" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Barra de Ações (Curtir, Comentar, Compartilhar, Agendar) */}
                <div className="px-3.5 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Botão Curtir */}
                      <button
                        onClick={() => toggleLikeFeedPost(post.id)}
                        className={`flex items-center gap-1 text-xs font-extrabold transition-all cursor-pointer ${
                          isLiked ? 'text-rose-500' : 'text-neutral-200 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-5 h-5 transition-transform active:scale-125 ${isLiked ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                        <span>{post.likes || 0}</span>
                      </button>

                      {/* Botão Comentários */}
                      <button
                        onClick={() => setOpenCommentsPostId(isCommentsOpen ? null : post.id)}
                        className="flex items-center gap-1 text-xs font-bold text-neutral-200 hover:text-white transition-all cursor-pointer"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>{comments.length}</span>
                      </button>

                      {/* Botão Compartilhar */}
                      <button
                        onClick={() => handleShare(post)}
                        className="text-neutral-200 hover:text-white transition-all cursor-pointer"
                        title="Compartilhar corte"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Botão VIP "Quero Esse Corte" */}
                    <button
                      onClick={() => handleBookCut(post.serviceName)}
                      className="py-1.5 px-3 rounded-xl theme-gradient-accent text-dark-950 text-xs font-black flex items-center gap-1.5 shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                      <Scissors className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Quero Esse Corte</span>
                    </button>
                  </div>

                  {/* Legenda com o @ do Cliente e Hashtags */}
                  <div className="text-xs text-neutral-200 leading-relaxed">
                    <span className="font-bold text-white mr-1.5">{profile.owner}</span>
                    <span>{post.caption}</span>
                    {post.clientInstagram && (
                      <span className="ml-1 text-sky-400 font-semibold">
                        com {post.clientInstagram}
                      </span>
                    )}
                  </div>

                  {/* Comentários Expandíveis */}
                  <div className="pt-2 border-t border-dark-800/80 space-y-2">
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
                            <span className="font-bold text-neutral-200 text-[11px]">{c.user}:</span>
                            <span className="text-neutral-300 text-[11px]">{c.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formulário para Inserir Comentário */}
                    <form 
                      onSubmit={(e) => handleAddComment(post.id, e)}
                      className="flex items-center gap-2 pt-1"
                    >
                      <input
                        type="text"
                        placeholder="Deixe seu elogio ou comente..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        className="flex-1 p-2 rounded-xl bg-dark-900 border border-dark-750 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400/60"
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

              </article>
            );
          })}
        </div>
      )}

    </div>
  );
}
