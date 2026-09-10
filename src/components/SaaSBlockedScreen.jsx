import React, { useState } from 'react';
import { Lock, AlertOctagon, Check, Copy, MessageCircle, ShieldAlert, Sparkles, Key } from 'lucide-react';
import { useLicense } from '../context/LicenseContext';

export default function SaaSBlockedScreen({ onOpenMaster }) {
  const { license, developerConfig, getLicenseMetrics, getProofWhatsAppUrl } = useLicense();
  const [copiedPix, setCopiedPix] = useState(false);
  const [lockClicks, setLockClicks] = useState(0);

  const metrics = getLicenseMetrics();
  const amount = metrics.currentPrice;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(developerConfig.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleOpenWhatsApp = () => {
    const url = getProofWhatsAppUrl(amount);
    window.open(url, '_blank');
  };

  const handleSecretLockClick = () => {
    const next = lockClicks + 1;
    setLockClicks(next);
    if (next >= 5) {
      setLockClicks(0);
      if (onOpenMaster) onOpenMaster();
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-dark-900 border border-rose-500/40 rounded-3xl shadow-2xl p-6 text-center space-y-5 relative overflow-hidden">
        
        {/* Glow de aviso */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Ícone de Cadeado (Com atalho secreto de 5 cliques para o Eullon) */}
        <div 
          onClick={handleSecretLockClick}
          className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-rose-500/30 select-none cursor-pointer"
          title="Renovação Necessária"
        >
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-rose-400 block mb-1">
            Acesso Temporariamente Pausado
          </span>
          <h2 className="text-xl font-black text-white">Renove sua Assinatura</h2>
          <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
            A mensalidade do seu aplicativo da <strong>{license.name}</strong> está pendente. Efetue o pagamento via Pix para reativar seu painel e a agenda de clientes.
          </p>
        </div>

        {/* Card do Preço do Pix */}
        <div className="p-4 rounded-2xl bg-dark-850 border border-dark-750 text-left relative">
          {license.isFirstMonth && (
            <span className="inline-block px-2 py-0.5 rounded-full bg-gold-500 text-dark-950 font-extrabold text-[9px] mb-1.5 uppercase">
              1º Mês Promocional
            </span>
          )}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[11px] text-neutral-400 font-semibold block">Valor para Reativação:</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm text-gold-400 font-bold">R$</span>
                <span className="text-3xl font-black text-white">{amount.toFixed(2).replace('.', ',')}</span>
                <span className="text-[11px] text-neutral-400 font-medium">/ 30 dias</span>
              </div>
            </div>

            <div className="text-right text-[11px] text-neutral-400">
              <span>Favorecido:</span>
              <strong className="block text-white text-xs">{developerConfig.name}</strong>
            </div>
          </div>

          {/* QR Code Pix */}
          <div className="mt-3 flex justify-center">
            <div className="bg-white p-2 rounded-xl border border-neutral-300 shadow">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(developerConfig.pixKey)}`}
                alt="QR Code Pix"
                className="w-28 h-28 object-contain"
              />
            </div>
          </div>

          {/* Copiar Chave */}
          <div className="mt-3 flex items-center gap-1.5 p-2 rounded-xl bg-dark-900 border border-dark-700">
            <span className="flex-1 font-mono text-center font-bold text-xs text-amber-300 select-all">
              {developerConfig.pixKey}
            </span>
            <button
              type="button"
              onClick={handleCopyPix}
              className="px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
            >
              {copiedPix ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Botão de Envio de Comprovante */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
            <span>Já paguei o Pix / Enviar Comprovante para o Eullon</span>
          </button>
          <p className="text-[10px] text-neutral-400">
            Assim que você enviar o comprovante, seu acesso é restabelecido imediatamente.
          </p>
        </div>

      </div>
    </div>
  );
}
