import React, { useState } from 'react';
import { 
  X, User, Phone, ShieldCheck, Sparkles, CheckCircle2, 
  ArrowRight, Scissors, LockKeyhole
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBarber } from '../context/BarberContext';

export default function ClientAuthModal({ isOpen, onClose, onSuccess }) {
  const { clientLogin, profile } = useBarber();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);

    if (val.length > 6) {
      val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    } else if (val.length > 2) {
      val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    } else if (val.length > 0) {
      val = `(${val}`;
    }
    setPhone(val);
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const cleanPhone = phone.replace(/\D/g, '');

    if (!trimmedName || trimmedName.length < 3) {
      setError('Por favor, informe seu nome e sobrenome.');
      return;
    }

    if (cleanPhone.length < 10) {
      setError('Informe um WhatsApp válido com DDD.');
      return;
    }

    setIsLoading(true);

    try {
      clientLogin({ name: trimmedName, phone });

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#F5E396', '#ffffff']
        });
      } catch (err) {}

      setIsLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setIsLoading(false);
      setError('Ocorreu um erro ao entrar. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full sm:max-w-md bg-dark-900 border border-gold-500/40 sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-5 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-dark-800 bg-dark-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gold-500/15 border border-gold-500/40 text-gold-400 flex items-center justify-center shadow-gold-glow-sm">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-gold-400 uppercase tracking-wider block">
                Barbearia Andrade
              </span>
              <h3 className="text-sm font-extrabold text-white">
                Área Exclusiva do Cliente
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

        {/* Corpo do Modal */}
        <div className="p-5 space-y-4 overflow-y-auto text-neutral-200">
          
          {/* Card VIP de Apresentação */}
          <div className="p-3.5 rounded-2xl bg-card-gradient border border-gold-500/30 space-y-1.5 text-center relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-300 text-[10px] font-bold border border-gold-500/30">
              <Sparkles className="w-3 h-3 text-gold-400" />
              <span>Acesso Rápido Sem Senha</span>
            </div>
            <h4 className="text-sm font-extrabold text-white">
              Entre para Salvar Seus Cortes
            </h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Digite seu <strong>Nome Completo</strong> e seu <strong>WhatsApp</strong>. O sistema guarda seu histórico de cortes e agiliza seus agendamentos automaticamente!
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gold-400" />
                <span>Nome e Sobrenome:</span>
              </label>
              <input
                type="text"
                placeholder="Ex: João da Silva"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                className="w-full p-3 rounded-xl bg-dark-850 border border-dark-700 focus:border-gold-500 text-white text-xs font-bold placeholder:text-neutral-500 focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gold-400" />
                <span>WhatsApp com DDD:</span>
              </label>
              <input
                type="tel"
                placeholder="(99) 99999-9999"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={15}
                className="w-full p-3 rounded-xl bg-dark-850 border border-dark-700 focus:border-gold-500 text-white text-xs font-bold placeholder:text-neutral-500 focus:outline-none transition-colors"
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-bold text-center animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gold-gradient hover:bg-gold-gradient-hover text-dark-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow cursor-pointer transition-transform active:scale-[0.98]"
            >
              <span>Acessar Minha Conta</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Benefícios */}
          <div className="pt-2 border-t border-dark-800 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-dark-850 border border-dark-800">
              <span className="text-xs block font-bold text-gold-400">✂️ Cortes</span>
              <span className="text-[9px] text-neutral-400">Histórico salvo</span>
            </div>
            <div className="p-2 rounded-xl bg-dark-850 border border-dark-800">
              <span className="text-xs block font-bold text-gold-400">⭐ Fidelidade</span>
              <span className="text-[9px] text-neutral-400">Ganhe cortes</span>
            </div>
            <div className="p-2 rounded-xl bg-dark-850 border border-dark-800">
              <span className="text-xs block font-bold text-gold-400">⚡ 1 Toque</span>
              <span className="text-[9px] text-neutral-400">Agende rápido</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
