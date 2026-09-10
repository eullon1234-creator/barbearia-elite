import React, { useState, useEffect, useRef } from 'react';
import { Lock, KeyRound, ArrowLeft, AlertCircle, CheckCircle2, ShieldCheck, MessageCircle, Delete } from 'lucide-react';
import { DEVELOPER_CONFIG } from '../context/LicenseContext';

export default function BarberPinLock({ expectedPin = '0192', onSuccess, onBackToClient }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef(null);

  // Foco automático ao carregar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Monitora digitação do PIN
  const handleDigit = (digit) => {
    if (pin.length >= 4 || isSuccess) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);
    setErrorMessage('');

    if (newPin.length === 4) {
      verifyPin(newPin);
    }
  };

  const handleDelete = () => {
    if (isSuccess) return;
    setPin((prev) => prev.slice(0, -1));
    setError(false);
    setErrorMessage('');
  };

  const handleClear = () => {
    if (isSuccess) return;
    setPin('');
    setError(false);
    setErrorMessage('');
  };

  const verifyPin = (enteredPin) => {
    const targetPin = String(expectedPin).trim() || '0192';
    if (enteredPin === targetPin) {
      setIsSuccess(true);
      setError(false);
      try {
        sessionStorage.setItem('elite_barber_auth', 'true');
      } catch (e) {
        console.error(e);
      }
      setTimeout(() => {
        onSuccess?.();
      }, 400);
    } else {
      setError(true);
      setErrorMessage('PIN incorreto. Tente novamente.');
      // Vibração leve em celulares se suportado
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80, 50, 80]);
      }
      setTimeout(() => {
        setPin('');
      }, 600);
    }
  };

  // Suporte a teclado físico de computador e celular
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSuccess) return;

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Escape') {
        if (onBackToClient) onBackToClient();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, isSuccess, expectedPin]);

  const supportWhatsAppUrl = `https://wa.me/${DEVELOPER_CONFIG.supportWhatsapp}?text=${encodeURIComponent(
    'Olá Eullon, sou o barbeiro da Barbearia Elite e preciso de suporte com meu PIN de acesso ao painel.'
  )}`;

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Luz ambiente de fundo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 flex flex-col items-center">
        
        {/* Ícone de Escudo com Chave */}
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-gold-600 via-amber-400 to-gold-300 flex items-center justify-center shadow-gold-glow text-dark-950">
            {isSuccess ? (
              <CheckCircle2 className="w-9 h-9 stroke-[2.5] text-dark-950 animate-bounce" />
            ) : (
              <Lock className="w-8 h-8 stroke-[2.5] text-dark-950" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-dark-900 border border-gold-500/40 flex items-center justify-center text-gold-400 shadow-md">
            <KeyRound className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Títulos */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 text-[11px] font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Área Restrita do Barbeiro</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Digite seu PIN
          </h1>
          <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
            Painel de controle exclusivo dos barbeiros Edivan & Valdivan da Barbearia Elite.
          </p>
        </div>

        {/* Círculos / Slots dos 4 dígitos */}
        <div className={`flex items-center justify-center gap-3.5 my-3 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const hasDigit = pin.length > index;
            return (
              <div
                key={index}
                className={`w-13 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-200 ${
                  isSuccess
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                    : error
                    ? 'border-rose-500 bg-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    : hasDigit
                    ? 'border-gold-400 bg-gold-500/20 text-gold-400 shadow-gold-glow-sm scale-105'
                    : 'border-dark-750 bg-dark-900/80 text-neutral-600'
                }`}
              >
                {hasDigit ? (
                  <span className="w-4 h-4 rounded-full bg-gold-400 shadow-sm animate-in zoom-in duration-150" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-dark-700" />
                )}
              </div>
            );
          })}
        </div>

        {/* Mensagem de Feedback (Erro ou Sucesso) */}
        <div className="h-6 flex items-center justify-center mb-4">
          {error ? (
            <p className="text-xs text-rose-400 font-bold flex items-center gap-1.5 animate-in fade-in duration-150">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </p>
          ) : isSuccess ? (
            <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 animate-in fade-in duration-150">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>PIN Correto! Abrindo painel...</span>
            </p>
          ) : (
            <p className="text-[11px] text-neutral-500">
              Digite o código de 4 números
            </p>
          )}
        </div>

        {/* Teclado Numérico Virtual Elegante */}
        <div className="w-full max-w-[280px] grid grid-cols-3 gap-2.5 mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              disabled={isSuccess}
              className="h-14 rounded-2xl bg-dark-900/90 hover:bg-dark-800 active:bg-gold-500/20 border border-dark-750 hover:border-gold-500/40 text-xl font-bold text-white hover:text-gold-300 transition-all active:scale-95 shadow-sm flex items-center justify-center cursor-pointer select-none"
            >
              {digit}
            </button>
          ))}

          {/* Botão Limpar (C) */}
          <button
            type="button"
            onClick={handleClear}
            disabled={isSuccess || pin.length === 0}
            className="h-14 rounded-2xl bg-dark-900/60 hover:bg-dark-800 border border-dark-800 text-xs font-bold text-neutral-400 hover:text-white transition-all active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none"
          >
            Limpar
          </button>

          {/* Dígito 0 */}
          <button
            type="button"
            onClick={() => handleDigit('0')}
            disabled={isSuccess}
            className="h-14 rounded-2xl bg-dark-900/90 hover:bg-dark-800 active:bg-gold-500/20 border border-dark-750 hover:border-gold-500/40 text-xl font-bold text-white hover:text-gold-300 transition-all active:scale-95 shadow-sm flex items-center justify-center cursor-pointer select-none"
          >
            0
          </button>

          {/* Botão Apagar (⌫) */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSuccess || pin.length === 0}
            className="h-14 rounded-2xl bg-dark-900/60 hover:bg-dark-800 active:bg-rose-500/20 border border-dark-800 hover:border-rose-500/40 text-neutral-400 hover:text-rose-300 transition-all active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none"
            title="Apagar último dígito"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Ações Inferiores */}
        <div className="w-full flex flex-col items-center gap-3 pt-2 border-t border-dark-800/80">
          {onBackToClient && (
            <button
              type="button"
              onClick={onBackToClient}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para a Visão do Cliente</span>
            </button>
          )}

          {/* Contato de Suporte / Recuperação de PIN com Eullon */}
          <a
            href={supportWhatsAppUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-neutral-500 hover:text-gold-400 flex items-center gap-1 transition-all"
            title="Falar com o desenvolvedor Eullon no WhatsApp"
          >
            <MessageCircle className="w-3 h-3 text-emerald-400" />
            <span>Esqueceu o PIN? Falar com Eullon</span>
          </a>
        </div>

      </div>
    </div>
  );
}
