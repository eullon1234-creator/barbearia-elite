import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Check, Clock, AlertTriangle, UserCheck, 
  DollarSign, Calendar, MessageCircle, RefreshCw, Power, Plus,
  ChevronRight, ArrowLeft, Key, Sparkles, AlertCircle, ExternalLink,
  Tag, Megaphone, Edit3, Save, Info, BellRing, CheckCircle2, Gift,
  Eye, MousePointerClick, TrendingUp, Users, Activity, RotateCcw, MapPin
} from 'lucide-react';
import { useLicense } from '../context/LicenseContext';

export default function EullonMasterAdmin({ onExit }) {
  const { 
    license, 
    allBarbershops, 
    developerConfig, 
    getLicenseMetrics, 
    startFreeTrial,
    renewLicense, 
    toggleBlockBarbershop,
    updateBarbershopPrice,
    updatePromotion,
    updateSystemNotice,
    getReminderWhatsAppUrl,
    trafficData,
    simulateVisit,
    resetTrafficStats
  } = useLicense();

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('eullon_master_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);
  
  // Abas: 'barbearias' | 'precos' | 'promocoes' | 'mensagens'
  const [selectedTab, setSelectedTab] = useState('barbearias');
  const [filterStatus, setFilterStatus] = useState('todos'); // 'todos' | 'vencendo' | 'bloqueados'
  const [toastMessage, setToastMessage] = useState('');

  // Formulário: Alteração de Preço
  const metrics = getLicenseMetrics();
  const [elitePriceInput, setElitePriceInput] = useState(
    license.customPrice !== undefined ? String(license.customPrice) : '10.00'
  );

  // Formulário: Promoções
  const [promoActive, setPromoActive] = useState(license.promotion?.active || false);
  const [promoPriceInput, setPromoPriceInput] = useState(
    license.promotion?.price !== undefined ? String(license.promotion.price) : '10.00'
  );
  const [promoTitleInput, setPromoTitleInput] = useState(
    license.promotion?.title || 'Super Promoção de Lançamento'
  );
  const [promoDescInput, setPromoDescInput] = useState(
    license.promotion?.description || 'Aproveite a renovação com valor promocional por tempo limitado!'
  );

  // Formulário: Mensagens / Comunicados
  const [noticeEnabled, setNoticeEnabled] = useState(license.systemNotice?.enabled || false);
  const [noticeText, setNoticeText] = useState(license.systemNotice?.text || '');
  const [noticeType, setNoticeType] = useState(license.systemNotice?.type || 'info');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === developerConfig.masterPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('eullon_master_auth', 'true');
      setAuthError(false);
      showToast('Acesso master autorizado!');
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('eullon_master_auth');
    setPasswordInput('');
  };

  // Salvar Novo Preço da Barbearia Elite
  const handleSavePrice = (e) => {
    e.preventDefault();
    const val = parseFloat(elitePriceInput.replace(',', '.'));
    if (isNaN(val) || val < 0) {
      showToast('Digite um valor numérico válido.');
      return;
    }
    updateBarbershopPrice('barbearia-elite', val);
    showToast(`Preço da Barbearia Elite alterado para R$ ${val.toFixed(2).replace('.', ',')}!`);
  };

  // Salvar Configurações de Promoção
  const handleSavePromotion = (e) => {
    e.preventDefault();
    const priceVal = parseFloat(promoPriceInput.replace(',', '.'));
    if (isNaN(priceVal) || priceVal < 0) {
      showToast('Digite um valor promocional válido.');
      return;
    }
    updatePromotion({
      active: promoActive,
      price: priceVal,
      title: promoTitleInput.trim() || 'Promoção Especial',
      description: promoDescInput.trim(),
    });
    showToast(
      promoActive 
        ? `Promoção ativada por R$ ${priceVal.toFixed(2).replace('.', ',')}!`
        : 'Promoção desativada. Preço normal reestabelecido.'
    );
  };

  // Salvar Comunicado / Mensagem
  const handleSaveNotice = (e) => {
    e.preventDefault();
    if (noticeEnabled && !noticeText.trim()) {
      showToast('Digite o texto do comunicado antes de publicar.');
      return;
    }
    updateSystemNotice({
      enabled: noticeEnabled,
      text: noticeText.trim(),
      type: noticeType,
    });
    showToast(
      noticeEnabled 
        ? 'Comunicado publicado no painel do barbeiro!' 
        : 'Comunicado desativado.'
    );
  };

  // Se não estiver logado, exibe tela de login protegida por senha
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm p-6 rounded-3xl bg-dark-900 border border-gold-500/40 shadow-2xl space-y-5 text-center relative overflow-hidden">
          
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gold-500 to-amber-300 flex items-center justify-center text-dark-950 mx-auto shadow-gold-glow-sm">
            <Key className="w-7 h-7" />
          </div>

          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-gold-400 block mb-1">
              Painel Secreto do Desenvolvedor
            </span>
            <h2 className="text-xl font-black text-white">Central Master do Eullon</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Digite sua senha master para gerenciar preços, promoções e assinaturas dos seus clientes.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div className="relative">
              <input
                type="password"
                placeholder="Senha master..."
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError(false);
                }}
                className="w-full p-3 rounded-xl bg-dark-850 border border-dark-700 focus:border-gold-500 text-white text-sm text-center tracking-widest font-mono outline-none transition-all"
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-400 font-semibold flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Senha incorreta. Tente novamente.</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-dark-950 font-extrabold text-xs tracking-wider uppercase transition-all shadow-gold-glow-sm cursor-pointer"
            >
              Entrar na Central
            </button>
          </form>

          {onExit && (
            <button
              onClick={onExit}
              className="text-xs text-neutral-400 hover:text-white flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para o Aplicativo</span>
            </button>
          )}

        </div>
      </div>
    );
  }

  // Métricas gerais das barbearias
  const now = new Date();
  const totalBarbershops = allBarbershops.length;
  
  const expiringSoonList = allBarbershops.filter(b => {
    const diffDays = Math.ceil((new Date(b.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 5 && b.status !== 'blocked';
  });

  const blockedList = allBarbershops.filter(b => {
    const diffDays = Math.ceil((new Date(b.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return b.status === 'blocked' || diffDays <= 0;
  });

  const totalMrr = allBarbershops.reduce((acc, b) => acc + (parseFloat(b.price) || 0), 0);

  // Filtro da lista de barbearias
  const displayedBarbershops = allBarbershops.filter(b => {
    const diffDays = Math.ceil((new Date(b.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (filterStatus === 'vencendo') return diffDays > 0 && diffDays <= 5 && b.status !== 'blocked';
    if (filterStatus === 'bloqueados') return b.status === 'blocked' || diffDays <= 0;
    return true;
  });

  return (
    <div className="min-h-screen bg-dark-950 text-neutral-100 flex flex-col items-center">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 z-50 px-4 py-2 rounded-xl bg-gold-500 text-dark-950 font-extrabold text-xs shadow-2xl animate-in slide-in-from-top-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Topo do Painel Master */}
      <header className="w-full max-w-5xl px-4 py-4 border-b border-dark-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold-500 to-amber-300 flex items-center justify-center text-dark-950 font-black shadow-gold-glow-sm">
            E
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white">Central SaaS do Eullon</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30 font-bold">
                Admin Master
              </span>
            </div>
            <p className="text-xs text-neutral-400">Controle total de mensalidades, preços, promoções e comunicados</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onExit && (
            <button
              onClick={onExit}
              className="px-3 py-1.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-dark-700 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver Barbearia Elite</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-dark-850 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-dark-700 transition-all cursor-pointer"
            title="Sair do modo master"
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Navegação entre Abas do Painel */}
      <div className="w-full max-w-5xl px-4 pt-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-dark-800">
          <button
            onClick={() => setSelectedTab('barbearias')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              selectedTab === 'barbearias'
                ? 'bg-gold-500 text-dark-950 shadow-gold-glow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-dark-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Barbearias & Vencimentos ({totalBarbershops})</span>
          </button>

          <button
            onClick={() => setSelectedTab('precos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              selectedTab === 'precos'
                ? 'bg-gold-500 text-dark-950 shadow-gold-glow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-dark-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Alterar Preço do Barbeiro</span>
          </button>

          <button
            onClick={() => setSelectedTab('promocoes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              selectedTab === 'promocoes'
                ? 'bg-gold-500 text-dark-950 shadow-gold-glow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-dark-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Promoções & Descontos</span>
            {license.promotion?.active && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setSelectedTab('mensagens')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              selectedTab === 'mensagens'
                ? 'bg-gold-500 text-dark-950 shadow-gold-glow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-dark-900'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Deixar Mensagem / Comunicado</span>
            {license.systemNotice?.enabled && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setSelectedTab('trafego')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              selectedTab === 'trafego'
                ? 'bg-gold-500 text-dark-950 shadow-gold-glow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-dark-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Pessoas Entraram ({trafficData?.totalVisits || 0})</span>
            {trafficData?.todayVisits > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black">
                +{trafficData.todayVisits} hoje
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Conteúdo Principal de Cada Aba */}
      <main className="w-full max-w-5xl px-4 py-6 space-y-6">

        {/* ================================================================ */}
        {/* ABA 1: BARBEARIAS & VENCIMENTOS                                  */}
        {/* ================================================================ */}
        {selectedTab === 'barbearias' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 5 Cards de Métricas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-2xl bg-dark-900 border border-dark-800 space-y-1">
                <span className="text-[11px] text-neutral-400 uppercase font-semibold flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-gold-400" />
                  <span>Barbearias Ativas</span>
                </span>
                <div className="text-2xl font-black text-white">{totalBarbershops}</div>
                <span className="text-[10px] text-neutral-400">Aplicativos no ar</span>
              </div>

              {/* CARD DESTAQUE: CONTADOR DE PESSOAS QUE ENTRARAM */}
              <div 
                onClick={() => setSelectedTab('trafego')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-950/30 via-dark-900 to-indigo-950/30 border border-blue-500/40 hover:border-blue-400 cursor-pointer transition-all space-y-1 shadow-lg shadow-blue-950/20 group"
                title="Clique para ver o relatório completo de pessoas que entraram na barbearia"
              >
                <span className="text-[11px] text-blue-300 uppercase font-semibold flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span>Pessoas Entraram</span>
                </span>
                <div className="text-2xl font-black text-white flex items-baseline gap-1.5">
                  <span>{trafficData?.totalVisits || 0}</span>
                  <span className="text-xs font-bold text-emerald-400">+{trafficData?.todayVisits || 0} hoje</span>
                </div>
                <span className="text-[10px] text-neutral-400 flex items-center justify-between">
                  <span>{trafficData?.clicks?.bookingStarted || 0} agendaram</span>
                  <span className="text-blue-400 font-bold group-hover:underline">Ver &gt;</span>
                </span>
              </div>

              <div 
                onClick={() => setFilterStatus(filterStatus === 'vencendo' ? 'todos' : 'vencendo')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  filterStatus === 'vencendo'
                    ? 'bg-yellow-500/15 border-yellow-500 shadow-lg'
                    : 'bg-dark-900 border-dark-800 hover:border-dark-700'
                }`}
              >
                <span className="text-[11px] text-yellow-300 uppercase font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Perto de Vencer</span>
                </span>
                <div className="text-2xl font-black text-yellow-400">{expiringSoonList.length}</div>
                <span className="text-[10px] text-neutral-400">Próximos 5 dias</span>
              </div>

              <div 
                onClick={() => setFilterStatus(filterStatus === 'bloqueados' ? 'todos' : 'bloqueados')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  filterStatus === 'bloqueados'
                    ? 'bg-rose-500/15 border-rose-500 shadow-lg'
                    : 'bg-dark-900 border-dark-800 hover:border-dark-700'
                }`}
              >
                <span className="text-[11px] text-rose-300 uppercase font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Inadimplentes</span>
                </span>
                <div className="text-2xl font-black text-rose-400">{blockedList.length}</div>
                <span className="text-[10px] text-neutral-400">Precisam renovar</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-dark-900 border border-dark-800 space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-emerald-400 uppercase font-semibold flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>MRR Mensal</span>
                </span>
                <div className="text-2xl font-black text-white">
                  R$ {totalMrr.toFixed(2).replace('.', ',')}
                </div>
                <span className="text-[10px] text-neutral-400">Receita recorrente</span>
              </div>
            </div>

            {/* Dados do Eullon para Recebimento */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-gold-500/10 via-dark-900 to-dark-900 border border-gold-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-gold-400 uppercase tracking-wider block">
                  Seus Dados para Recebimento Pix:
                </span>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-white font-semibold">
                  <span>👤 {developerConfig.name}</span>
                  <span>•</span>
                  <span>🔑 Chave Pix: <strong className="text-amber-300 font-mono">{developerConfig.pixKey}</strong></span>
                  <span>•</span>
                  <span>📱 Zap: <strong className="text-emerald-400 font-mono">{developerConfig.displayPhone}</strong></span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-dark-800 text-[11px] text-neutral-300 border border-dark-700">
                  Preço Pós-Teste: <strong className="text-emerald-400">R$ 35,00/mês</strong>
                </span>
              </div>
            </div>

            {/* Banner de Envio com 7 Dias Grátis de Teste */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-950/40 via-dark-900 to-indigo-950/40 border border-purple-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-lg shadow-purple-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span>Enviar Aplicativo para o Barbeiro (7 Dias Grátis)</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                      Cortesia
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-300 mt-0.5">
                    Clique aqui para ativar o período de teste de 7 dias na Barbearia Elite. Após os 7 dias, a mensalidade será de R$ 35,00/mês.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  startFreeTrial('barbearia-elite', 7);
                  showToast('🎁 7 Dias de teste grátis ativados para a Barbearia Elite! Após o teste: R$ 35,00/mês.');
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 shrink-0 transition-all cursor-pointer"
              >
                <Gift className="w-4 h-4" />
                <span>Ativar 7 Dias Grátis Agora</span>
              </button>
            </div>

            {/* Lista de Barbearias */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-white">Barbearias Cadastradas</h2>
                  <p className="text-[11px] text-neutral-400">Renove com 1 clique, bloqueie ou envie lembretes no WhatsApp</p>
                </div>

                <div className="flex items-center gap-1.5 bg-dark-900 p-1 rounded-xl border border-dark-800 text-[11px]">
                  <button
                    onClick={() => setFilterStatus('todos')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      filterStatus === 'todos' ? 'bg-gold-500 text-dark-950' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Todas ({allBarbershops.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('vencendo')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      filterStatus === 'vencendo' ? 'bg-yellow-500 text-dark-950' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Vencendo ({expiringSoonList.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('bloqueados')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      filterStatus === 'bloqueados' ? 'bg-rose-500 text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Inadimplentes ({blockedList.length})
                  </button>
                </div>
              </div>

              {/* Cards de cada barbearia */}
              <div className="space-y-3">
                {displayedBarbershops.map((shop) => {
                  const expiresDate = new Date(shop.expiresAt);
                  const diffMs = expiresDate.getTime() - now.getTime();
                  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                  const isBlocked = shop.status === 'blocked' || daysRemaining <= 0;
                  const isWarning = daysRemaining > 0 && daysRemaining <= 5 && !isBlocked;

                  return (
                    <div
                      key={shop.id}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        isBlocked
                          ? 'bg-rose-950/20 border-rose-500/40'
                          : isWarning
                          ? 'bg-yellow-950/20 border-yellow-500/40'
                          : 'bg-dark-900 border-dark-800 hover:border-dark-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-extrabold text-white">{shop.name}</h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                isBlocked
                                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                  : isWarning
                                  ? `bg-yellow-500/20 text-yellow-300 border-yellow-500/30`
                                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              }`}
                            >
                              {isBlocked
                                ? '● Inadimplente / Bloqueada'
                                : isWarning
                                ? `⚠️ Vence em ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'}`
                                : `● Ativa (${daysRemaining} dias restantes)`}
                            </span>

                            {shop.id === 'barbearia-elite' && (
                              <button
                                type="button"
                                onClick={() => setSelectedTab('trafego')}
                                className="px-2 py-0.5 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                                title="Ver relatório de acessos e cliques"
                              >
                                <Eye className="w-3 h-3 text-blue-400" />
                                <span>{trafficData?.totalVisits || 0} pessoas entraram ({trafficData?.todayVisits || 0} hoje)</span>
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-neutral-400">
                            <span>👤 Barbeiro: <strong className="text-white">{shop.owner}</strong></span>
                            <span>•</span>
                            <span>📱 {shop.displayPhone}</span>
                            <span>•</span>
                            <span>📍 {shop.city}</span>
                            <span>•</span>
                            <span className="px-2 py-0.5 rounded-md bg-dark-800 border border-dark-700 text-gold-400 font-mono font-bold text-[11px] flex items-center gap-1">
                              <span>🔑 PIN:</span>
                              <strong className="text-white tracking-wider">{shop.barberPin || '0192'}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Preço & Vencimento */}
                        <div className="sm:text-right">
                          <div className="text-sm font-black text-gold-400">
                            R$ {parseFloat(shop.price).toFixed(2).replace('.', ',')} / mês
                          </div>
                          <span className="text-[11px] text-neutral-400 block">
                            Vencimento: <strong className="text-neutral-200">{expiresDate.toLocaleDateString('pt-BR')}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Barra de Ações com 1 Clique */}
                      <div className="pt-3 border-t border-dark-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                        
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              startFreeTrial(shop.id, 7);
                              showToast(`🎁 7 Dias de teste grátis liberados para ${shop.name}! Após o teste: R$ 35,00/mês.`);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                            title="Liberar 7 dias de cortesia para o barbeiro testar o app gratuitamente"
                          >
                            <Gift className="w-3.5 h-3.5" />
                            <span>Dar 7 Dias Grátis</span>
                          </button>

                          <button
                            onClick={() => {
                              renewLicense(shop.id, 30);
                              showToast(`+30 dias liberados para ${shop.name}!`);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                            title="Confirmar Pix e adicionar 30 dias de acesso"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Confirmar Pix (+30 Dias)</span>
                          </button>

                          <button
                            onClick={() => {
                              renewLicense(shop.id, 60);
                              showToast(`+60 dias adicionados para ${shop.name}!`);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-neutral-300 hover:text-white border border-dark-700 font-semibold transition-all cursor-pointer"
                          >
                            <span>+60 Dias</span>
                          </button>

                          <button
                            onClick={() => {
                              renewLicense(shop.id, 365);
                              showToast(`1 Ano de licença ativado para ${shop.name}!`);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-neutral-300 hover:text-white border border-dark-700 font-semibold transition-all cursor-pointer"
                          >
                            <span>+1 Ano</span>
                          </button>

                          <button
                            onClick={() => {
                              toggleBlockBarbershop(shop.id);
                              showToast(isBlocked ? `Acesso desbloqueado!` : `Barbearia pausada/bloqueada!`);
                            }}
                            className={`px-2.5 py-1.5 rounded-xl border font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                              isBlocked
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
                            }`}
                          >
                            <Lock className="w-3 h-3" />
                            <span>{isBlocked ? 'Desbloquear' : 'Pausar / Bloquear'}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={getReminderWhatsAppUrl(shop)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all"
                            title="Enviar lembrete de renovação com sua chave Pix no WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600" />
                            <span>Cobrar no WhatsApp</span>
                          </a>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* ABA 2: ALTERAR PREÇO DO BARBEIRO                                */}
        {/* ================================================================ */}
        {selectedTab === 'precos' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-5 rounded-3xl bg-dark-900 border border-gold-500/30 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white">Alterar Valor da Assinatura (Barbearia Elite)</h2>
                  <p className="text-xs text-neutral-400">
                    Defina quanto você deseja cobrar mensalmente dos barbeiros Edivan & Valdivan
                  </p>
                </div>
              </div>

              <form onSubmit={handleSavePrice} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Valor Mensal da Assinatura (R$):
                  </label>
                  <div className="flex items-center gap-2 max-w-xs">
                    <span className="text-base font-bold text-gold-400">R$</span>
                    <input
                      type="text"
                      value={elitePriceInput}
                      onChange={(e) => setElitePriceInput(e.target.value)}
                      placeholder="Ex: 10.00 ou 49.90"
                      className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 focus:border-gold-500 text-white font-bold text-base outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Atalhos rápidos de valores */}
                <div>
                  <span className="text-[11px] text-neutral-400 block mb-1.5 font-medium">
                    Ou selecione um valor rápido:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'R$ 10,00 (1º Mês / Entrada)', val: '10.00' },
                      { label: 'R$ 35,00 (Mensalidade Regular)', val: '35.00' },
                      { label: 'R$ 29,90 (Promocional)', val: '29.90' },
                      { label: 'R$ 49,90 (Pacote VIP)', val: '49.90' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setElitePriceInput(item.val)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          elitePriceInput === item.val
                            ? 'bg-gold-500/20 text-gold-300 border-gold-500/40'
                            : 'bg-dark-850 text-neutral-400 border-dark-700 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-dark-950 font-extrabold text-xs flex items-center gap-2 shadow-gold-glow-sm transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Novo Preço para Barbearia Elite</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Resumo de Preços de Todas as Barbearias */}
            <div className="p-5 rounded-3xl bg-dark-900 border border-dark-800 space-y-3">
              <h3 className="text-sm font-extrabold text-white">Preço Cobrado por Cada Barbearia</h3>
              <div className="space-y-2">
                {allBarbershops.map((b) => (
                  <div key={b.id} className="p-3 rounded-2xl bg-dark-850 border border-dark-750 flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-white block">{b.name}</strong>
                      <span className="text-neutral-400">{b.owner} • {b.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-gold-400">
                        R$ {parseFloat(b.price).toFixed(2).replace('.', ',')} / mês
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* ABA 3: PROMOÇÕES & DESCONTOS                                    */}
        {/* ================================================================ */}
        {selectedTab === 'promocoes' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-5 rounded-3xl bg-dark-900 border border-gold-500/30 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white">Configurar Promoção Especial</h2>
                  <p className="text-xs text-neutral-400">
                    Ative um valor com desconto para incentivar a renovação ou parabenizar o barbeiro
                  </p>
                </div>
              </div>

              <form onSubmit={handleSavePromotion} className="space-y-4 pt-2">
                {/* Interruptor Liga/Desliga */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-dark-850 border border-dark-700">
                  <div>
                    <span className="text-xs font-bold text-white block">Status da Promoção:</span>
                    <span className="text-[11px] text-neutral-400">
                      {promoActive ? 'Ativa — O barbeiro verá o valor promocional no app' : 'Inativa — O app cobrará o valor regular'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPromoActive(!promoActive)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      promoActive
                        ? 'bg-emerald-500 text-dark-950 shadow-emerald-500/30'
                        : 'bg-dark-750 text-neutral-400'
                    }`}
                  >
                    {promoActive ? 'PROMOÇÃO ATIVADA' : 'DESATIVADA'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      Valor com Desconto (R$):
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-gold-400">R$</span>
                      <input
                        type="text"
                        value={promoPriceInput}
                        onChange={(e) => setPromoPriceInput(e.target.value)}
                        placeholder="10.00"
                        className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 focus:border-gold-500 text-white font-bold text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      Título de Destaque da Promoção:
                    </label>
                    <input
                      type="text"
                      value={promoTitleInput}
                      onChange={(e) => setPromoTitleInput(e.target.value)}
                      placeholder="Ex: Oferta Especial de Inauguração"
                      className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 focus:border-gold-500 text-white text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Mensagem explicativa da promoção:
                  </label>
                  <input
                    type="text"
                    value={promoDescInput}
                    onChange={(e) => setPromoDescInput(e.target.value)}
                    placeholder="Ex: Aproveite o 1º mês por apenas R$ 10,00 e renove com desconto!"
                    className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 focus:border-gold-500 text-white text-sm outline-none transition-all"
                  />
                </div>

                {/* Pré-visualização da Promoção */}
                <div className="p-3.5 rounded-2xl bg-dark-850 border border-dark-750 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-gold-400 tracking-wider block">
                    Pré-visualização do Card que o Barbeiro verá:
                  </span>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/15 via-dark-900 to-dark-900 border border-emerald-500/30 flex items-center justify-between text-xs">
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500 text-dark-950 text-[10px] font-extrabold uppercase mb-1">
                        {promoTitleInput || 'Promoção'}
                      </span>
                      <p className="text-neutral-300 text-[11px]">{promoDescInput || 'Valor promocional ativo'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-neutral-400 block line-through">
                        R$ {developerConfig.regularPrice.toFixed(2).replace('.', ',')}
                      </span>
                      <strong className="text-lg font-black text-emerald-400">
                        R$ {(parseFloat(promoPriceInput) || 10).toFixed(2).replace('.', ',')}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-dark-950 font-extrabold text-xs flex items-center gap-2 shadow-gold-glow-sm transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Configuração de Promoção</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* ABA 4: MENSAGEM / COMUNICADO AO BARBEIRO                         */}
        {/* ================================================================ */}
        {selectedTab === 'mensagens' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-5 rounded-3xl bg-dark-900 border border-gold-500/30 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white">Deixar Mensagem / Comunicado ao Barbeiro</h2>
                  <p className="text-xs text-neutral-400">
                    Escreva avisos que aparecerão em destaque no topo do painel administrativo do barbeiro
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveNotice} className="space-y-4 pt-2">
                {/* Interruptor de Exibição */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-dark-850 border border-dark-700">
                  <div>
                    <span className="text-xs font-bold text-white block">Exibir Comunicado no Painel:</span>
                    <span className="text-[11px] text-neutral-400">
                      {noticeEnabled ? 'Ativo — O barbeiro verá esse aviso assim que abrir o app' : 'Oculto — Nenhum comunicado está sendo exibido'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNoticeEnabled(!noticeEnabled)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      noticeEnabled
                        ? 'bg-amber-500 text-dark-950 shadow-amber-500/30'
                        : 'bg-dark-750 text-neutral-400'
                    }`}
                  >
                    {noticeEnabled ? 'COMUNICADO ATIVO' : 'DESATIVADO'}
                  </button>
                </div>

                {/* Tipo de Comunicado */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Estilo do Aviso:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'info', label: '💡 Informativo / Suporte', border: 'border-blue-500/40 text-blue-300' },
                      { id: 'promo', label: '🎁 Novidade / Promoção', border: 'border-emerald-500/40 text-emerald-300' },
                      { id: 'warning', label: '⚠️ Lembrete de Pagamento', border: 'border-amber-500/40 text-amber-300' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setNoticeType(t.id)}
                        className={`p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                          noticeType === t.id
                            ? `bg-dark-800 ${t.border} font-bold ring-2 ring-gold-500/50`
                            : 'bg-dark-850 border-dark-750 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Texto da Mensagem */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Texto do Comunicado:
                  </label>
                  <textarea
                    rows={3}
                    value={noticeText}
                    onChange={(e) => setNoticeText(e.target.value)}
                    placeholder="Ex: Fala Edivan! Passando para lembrar que sua mensalidade vence em breve. Qualquer dúvida sobre o app, me chame no WhatsApp!"
                    className="w-full p-3 rounded-xl bg-dark-850 border border-dark-700 focus:border-gold-500 text-white text-xs outline-none transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Pré-visualização do Banner em tempo real */}
                <div className="p-3.5 rounded-2xl bg-dark-850 border border-dark-750 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-gold-400 tracking-wider block">
                    Pré-visualização do Banner no Painel do Barbeiro:
                  </span>
                  
                  <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                    noticeType === 'warning'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : noticeType === 'promo'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                      : 'bg-blue-500/15 border-blue-500/40 text-blue-200'
                  }`}>
                    <BellRing className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <strong className="block text-xs font-extrabold text-white mb-0.5">
                        Mensagem do Desenvolvedor (Eullon):
                      </strong>
                      <p className="text-[11px] leading-relaxed">
                        {noticeText || 'Sua mensagem aparecerá aqui em tempo real...'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-dark-950 font-extrabold text-xs flex items-center gap-2 shadow-gold-glow-sm transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Publicar Comunicado no App</span>
                  </button>

                  {noticeEnabled && (
                    <button
                      type="button"
                      onClick={() => {
                        setNoticeEnabled(false);
                        updateSystemNotice({ enabled: false, text: '', type: 'info' });
                        showToast('Comunicado removido do app do barbeiro.');
                      }}
                      className="px-3.5 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-neutral-400 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      Remover Mensagem
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* ABA 5: CONTADOR DE CLIQUES & ACESSOS NA BARBEARIA               */}
        {/* ================================================================ */}
        {selectedTab === 'trafego' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Header da Aba */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-950/40 via-dark-900 to-indigo-950/40 border border-blue-500/30 space-y-2 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                      <span>Contador de Acessos & Visitas da Barbearia Elite</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                        Ao Vivo
                      </span>
                    </h2>
                    <p className="text-xs text-neutral-400">
                      Veja em tempo real quantas pessoas entraram na barbearia e onde clicaram
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      simulateVisit();
                      showToast('✅ +1 Acesso computado no contador de cliques!');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                    title="Simula a entrada de uma pessoa no app para testar o contador"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Testar +1 Visita</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Deseja realmente zerar o contador de visitas e cliques da barbearia?')) {
                        resetTrafficStats();
                        showToast('Contador zerado com sucesso.');
                      }
                    }}
                    className="p-2 rounded-xl bg-dark-850 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-dark-700 transition-all cursor-pointer"
                    title="Zerar contador"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Cards de Estatísticas Principais */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800 space-y-1">
                <span className="text-[11px] text-blue-300 uppercase font-bold flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>Total de Visitas</span>
                </span>
                <div className="text-3xl font-black text-white">
                  {trafficData?.totalVisits || 0}
                </div>
                <p className="text-[10px] text-neutral-400">Pessoas que abriram o aplicativo</p>
              </div>

              <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800 space-y-1">
                <span className="text-[11px] text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Visitas de Hoje</span>
                </span>
                <div className="text-3xl font-black text-emerald-400">
                  {trafficData?.todayVisits || 0}
                </div>
                <p className="text-[10px] text-neutral-400">Pessoas que entraram hoje</p>
              </div>

              <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800 space-y-1">
                <span className="text-[11px] text-gold-400 uppercase font-bold flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gold-400" />
                  <span>Iniciaram Agendamento</span>
                </span>
                <div className="text-3xl font-black text-gold-400">
                  {trafficData?.clicks?.bookingStarted || 0}
                </div>
                <p className="text-[10px] text-neutral-400">Cliques no botão Agendar</p>
              </div>

              <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800 space-y-1">
                <span className="text-[11px] text-purple-400 uppercase font-bold flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Visitantes Únicos</span>
                </span>
                <div className="text-3xl font-black text-purple-300">
                  {trafficData?.uniqueVisitors || 0}
                </div>
                <p className="text-[10px] text-neutral-400">Dispositivos diferentes</p>
              </div>
            </div>

            {/* Detalhamento de Cliques por Ação */}
            <div className="p-5 rounded-3xl bg-dark-900 border border-dark-800 space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-gold-400" />
                <span>Detalhamento dos Cliques dos Clientes</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-dark-850 border border-dark-750 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 flex items-center justify-center text-sm font-bold">
                      ✂️
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-200 font-bold block">Abriram Agendamento</span>
                      <span className="text-[10px] text-neutral-400">Cliques em "Agendar"</span>
                    </div>
                  </div>
                  <span className="text-lg font-black text-white">{trafficData?.clicks?.bookingStarted || 0}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-dark-850 border border-dark-750 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-sm font-bold">
                      ✓
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-200 font-bold block">Confirmaram Corte</span>
                      <span className="text-[10px] text-neutral-400">Enviaram para WhatsApp</span>
                    </div>
                  </div>
                  <span className="text-lg font-black text-emerald-400">{trafficData?.clicks?.bookingCompleted || 0}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-dark-850 border border-dark-750 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 flex items-center justify-center text-sm font-bold">
                      📱
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-200 font-bold block">Chamar no WhatsApp</span>
                      <span className="text-[10px] text-neutral-400">Dúvidas diretas</span>
                    </div>
                  </div>
                  <span className="text-lg font-black text-white">{trafficData?.clicks?.whatsappClicked || 0}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-dark-850 border border-dark-750 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-sm font-bold">
                      📍
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-200 font-bold block">Ver Localização</span>
                      <span className="text-[10px] text-neutral-400">Rota do Google Maps</span>
                    </div>
                  </div>
                  <span className="text-lg font-black text-white">{trafficData?.clicks?.locationClicked || 0}</span>
                </div>
              </div>
            </div>

            {/* Feed em Tempo Real dos Últimos Acessos */}
            <div className="p-5 rounded-3xl bg-dark-900 border border-dark-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Histórico Recente de Entradas & Cliques</span>
                </h3>
                <span className="text-[10px] text-neutral-500">Últimas atividades registradas</span>
              </div>

              {(!trafficData?.recentLog || trafficData.recentLog.length === 0) ? (
                <p className="text-xs text-neutral-500 text-center py-6">Nenhum acesso registrado ainda.</p>
              ) : (
                <div className="divide-y divide-dark-800">
                  {trafficData.recentLog.slice(0, 15).map((log) => (
                    <div key={log.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <span className="text-neutral-200">{log.label}</span>
                      </div>
                      <span className="text-[11px] text-neutral-500 font-mono shrink-0">{log.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
