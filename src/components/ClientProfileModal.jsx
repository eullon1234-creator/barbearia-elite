import React from 'react';
import { 
  X, User, Phone, Scissors, Calendar, Clock, Sparkles, 
  Award, LogOut, ChevronRight, CheckCircle2, RotateCcw,
  TrendingUp, Star, ShieldCheck
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';

export default function ClientProfileModal({ isOpen, onClose, onOpenBooking }) {
  const { currentClient, clientLogout, getClientStats, services, profile } = useBarber();

  if (!isOpen || !currentClient) return null;

  const stats = getClientStats(currentClient.phone);

  // Iniciais do nome do cliente (Ex: João Silva -> JS)
  const getInitials = (name) => {
    if (!name) return 'VIP';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleRepeatCut = (apt) => {
    onClose();
    if (onOpenBooking) {
      // Tenta achar o serviço correspondente para abrir o agendamento já selecionado
      const svc = services?.find(s => s.name === apt.service || s.name === apt.baseService);
      onOpenBooking(svc || null);
    }
  };

  const handleLogout = () => {
    if (confirm('Deseja realmente sair da sua conta?')) {
      clientLogout();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full sm:max-w-md bg-dark-900 border border-gold-500/40 sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-5 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-dark-800 bg-dark-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gold-500/15 border border-gold-500/40 text-gold-400 flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-gold-400 uppercase tracking-wider block">
                Conta do Cliente
              </span>
              <h3 className="text-sm font-extrabold text-white">
                Minha Conta VIP
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white bg-dark-800 hover:bg-dark-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-4 space-y-4 overflow-y-auto text-neutral-200 text-xs">
          
          {/* Card Principal de Perfil */}
          <div className="p-4 rounded-2xl bg-card-gradient border border-gold-500/40 flex items-center gap-3.5 relative overflow-hidden shadow-gold-glow-sm">
            <div className="w-14 h-14 rounded-2xl bg-gold-gradient text-dark-950 flex items-center justify-center font-black text-lg shadow shrink-0">
              {getInitials(currentClient.name)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] uppercase font-black bg-gold-500/20 text-gold-300 px-2 py-0.5 rounded-full border border-gold-500/30 inline-flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-gold-400 text-gold-400" />
                  <span>Cliente VIP</span>
                </span>
              </div>
              <h4 className="text-base font-black text-white truncate leading-tight">
                {currentClient.name}
              </h4>
              <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                {currentClient.phone}
              </p>
            </div>
          </div>

          {/* Cartão Fidelidade Digital */}
          <div className="p-3.5 rounded-2xl bg-dark-850 border border-gold-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-gold-400" />
                <span className="font-extrabold text-white text-xs uppercase tracking-wider">
                  Cartão Fidelidade
                </span>
              </div>
              <span className="text-[10px] font-bold text-gold-400">
                {stats.cutsTowardsReward} de 10 cortes
              </span>
            </div>

            {/* Barra de Progresso */}
            <div className="w-full bg-dark-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-dark-750">
              <div
                className="h-full bg-gold-gradient rounded-full transition-all duration-500 shadow-gold-glow-sm"
                style={{ width: `${Math.min(100, (stats.cutsTowardsReward / 10) * 100)}%` }}
              />
            </div>

            <p className="text-[10px] text-neutral-400">
              {stats.cutsRemaining === 10 ? (
                <span>Faça seu primeiro corte para começar a acumular pontos de fidelidade! 💈</span>
              ) : (
                <span>
                  Faltam apenas <strong className="text-gold-400">{stats.cutsRemaining} {stats.cutsRemaining === 1 ? 'corte' : 'cortes'}</strong> para você resgatar uma recompensa especial! 🎁
                </span>
              )}
            </p>
          </div>

          {/* Estatísticas Rápidas em Grade */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-dark-850 border border-dark-750 text-center">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
                Cortes Realizados
              </span>
              <span className="text-xl font-black text-gold-400">
                {stats.totalCuts}
              </span>
              <span className="text-[9px] text-neutral-500 block mt-0.5">na {profile?.name || 'Barbearia Elite'}</span>
            </div>

            <div className="p-3 rounded-xl bg-dark-850 border border-dark-750 text-center">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
                Corte Favorito
              </span>
              <span className="text-xs font-black text-white truncate block mt-1">
                {stats.favoriteService}
              </span>
              <span className="text-[9px] text-neutral-500 block mt-0.5">Mais pedido</span>
            </div>
          </div>

          {/* Histórico Completo de Cortes do Cliente */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h5 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gold-400" />
                <span>Histórico dos Seus Cortes</span>
              </h5>
              <span className="text-[10px] text-neutral-400">
                {stats.appointments.length} registros
              </span>
            </div>

            {stats.appointments.length === 0 ? (
              <div className="p-6 rounded-2xl bg-dark-850 border border-dark-750 text-center space-y-2">
                <Scissors className="w-6 h-6 text-gold-400/60 mx-auto" />
                <p className="text-xs text-neutral-300 font-bold">Nenhum corte registrado ainda.</p>
                <p className="text-[10px] text-neutral-400">
                  Agende seu próximo horário para que seu histórico comece a ser contabilizado automaticamente!
                </p>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenBooking) onOpenBooking(null);
                  }}
                  className="mt-2 px-4 py-2 rounded-xl bg-gold-gradient text-dark-950 font-extrabold text-xs shadow-gold-glow cursor-pointer"
                >
                  Agendar Primeiro Corte
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {stats.appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3 rounded-xl bg-dark-850 border border-dark-750 flex items-center justify-between hover:border-gold-500/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-black text-white truncate">
                          {apt.service}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          apt.status === 'Confirmado'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : apt.status === 'Concluído'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {apt.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                        <span>{apt.date ? apt.date.split('-').reverse().join('/') : ''}</span>
                        <span>•</span>
                        <span>{apt.time}</span>
                        {apt.price && (
                          <>
                            <span>•</span>
                            <span className="text-gold-400 font-bold">R$ {parseFloat(apt.price).toFixed(2).replace('.', ',')}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRepeatCut(apt)}
                      className="ml-2 px-2.5 py-1.5 rounded-lg bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 border border-gold-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                      title="Agendar novamente este mesmo corte"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Repetir</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botão de Agendamento Rápido */}
          <button
            onClick={() => {
              onClose();
              if (onOpenBooking) onOpenBooking(null);
            }}
            className="w-full py-3 px-4 rounded-xl bg-gold-gradient hover:bg-gold-gradient-hover text-dark-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-gold-glow cursor-pointer transition-transform active:scale-[0.98]"
          >
            <span>Agendar Novo Horário</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Botão Desconectar / Sair */}
          <div className="pt-2 border-t border-dark-800 text-center">
            <button
              type="button"
              onClick={handleLogout}
              className="text-neutral-400 hover:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair desta Conta ({currentClient.name.split(' ')[0]})</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
