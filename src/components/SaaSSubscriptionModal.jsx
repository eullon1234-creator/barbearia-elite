import React, { useState } from 'react';
import { X, Check, Copy, MessageCircle, ShieldCheck, Zap, Sparkles, Clock, AlertTriangle, Lock } from 'lucide-react';
import { useLicense } from '../context/LicenseContext';

export default function SaaSSubscriptionModal({ isOpen, onClose }) {
  const { license, developerConfig, getLicenseMetrics, getProofWhatsAppUrl } = useLicense();
  const [copiedPix, setCopiedPix] = useState(false);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-dark-900 border border-gold-500/40 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden relative">
        
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cabeçalho */}
        <div className="p-4 border-b border-dark-800 flex items-center justify-between bg-dark-950/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Assinatura do Aplicativo</h3>
              <p className="text-[11px] text-neutral-400">Manutenção & Licença Online</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-white bg-dark-800 hover:bg-dark-700 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-4 overflow-y-auto space-y-4 text-neutral-200 text-xs">
          
          {/* Card do Preço Promocional */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-gold-500/15 via-dark-850 to-dark-900 border border-gold-500/40 relative overflow-hidden">
            {license.isTrial ? (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500 text-white font-extrabold text-[10px] mb-2 uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3 h-3" />
                <span>Período de Teste Grátis (7 Dias)</span>
              </div>
            ) : license.promotion?.active ? (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-dark-950 font-extrabold text-[10px] mb-2 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>{license.promotion.title || 'Promoção Especial Ativa'}</span>
              </div>
            ) : license.isFirstMonth ? (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold-500 text-dark-950 font-extrabold text-[10px] mb-2 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>Oferta Especial de 1º Mês</span>
              </div>
            ) : null}

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-neutral-400 block font-semibold">
                  {license.isTrial
                    ? 'Mensalidade Pós-Teste (a partir do 8º dia):'
                    : license.promotion?.active 
                    ? 'Valor com Desconto Promocional:' 
                    : license.isFirstMonth 
                    ? 'Valor Promocional de Entrada:' 
                    : 'Mensalidade Regular:'}
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-sm text-gold-400 font-bold">R$</span>
                  <span className="text-3xl font-black text-white tracking-tight">
                    {amount.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-medium">/ mês</span>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${metrics.badgeColor}`}>
                  {metrics.label}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-1">
                  Vencimento: {metrics.expiresDateFormatted}
                </span>
                {metrics.countdownDetailed && (
                  <span className="text-[10px] text-amber-300/90 block mt-0.5 font-semibold">
                    ⏳ Restam: {metrics.countdownDetailed}
                  </span>
                )}
              </div>
            </div>

            {/* O que está incluso */}
            <div className="mt-3 pt-3 border-t border-dark-750 grid grid-cols-2 gap-1.5 text-[11px] text-neutral-300">
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" /> Agendamento 24h
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" /> Painel Financeiro
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" /> WhatsApp Integrado
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" /> Suporte com Eullon
              </span>
            </div>
          </div>

          {/* Aviso sobre Período de Teste ou Assinatura */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-dark-850 to-dark-850 border border-purple-500/30 text-xs text-neutral-200 space-y-1">
            <div className="flex items-center gap-1.5 font-extrabold text-purple-300 text-xs">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{license.isTrial ? 'Período de Cortesia Liberado:' : 'Condição Especial de Assinatura:'}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-neutral-300">
              {license.isTrial ? (
                <>
                  Você tem <strong className="text-white">7 dias grátis</strong> para testar e cadastrar sua barbearia à vontade! Após esse período de teste, a mensalidade para manter seus agendamentos online e painel ativo será de apenas <strong className="text-emerald-400 font-bold">R$ 35,00/mês</strong>.
                </>
              ) : (
                <>
                  O valor inicial de adesão é de <strong className="text-white">R$ 10,00</strong>. A partir do próximo mês, a mensalidade regular para manter o aplicativo ativo será de <strong className="text-emerald-400 font-bold">R$ 35,00/mês</strong>.
                </>
              )}
            </p>
          </div>

          {/* QR Code Pix e Chave Copia e Cola */}
          <div className="p-3.5 rounded-2xl bg-dark-850 border border-dark-750 text-center space-y-2.5">
            <div className="flex items-center justify-between text-left">
              <div>
                <span className="text-[10px] uppercase font-bold text-gold-400 tracking-wider block">
                  Pague com Pix Instantâneo
                </span>
                <span className="text-[11px] text-white font-semibold">
                  Favorecido: {developerConfig.name}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-dark-900 text-neutral-400 border border-dark-700">
                Chave Celular
              </span>
            </div>

            {/* Imagem do QR Code */}
            <div className="flex justify-center py-1">
              <div className="bg-white p-2.5 rounded-2xl shadow-lg shadow-black/50 border-2 border-gold-500/40 inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(developerConfig.pixKey)}`}
                  alt="QR Code Pix Eullon"
                  className="w-32 h-32 object-contain"
                />
              </div>
            </div>

            <p className="text-[10px] text-neutral-400">
              Aponte a câmera do aplicativo do seu banco ou copie a chave abaixo:
            </p>

            {/* Chave Pix para Copiar */}
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-dark-900 border border-dark-700">
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

          {/* Botão de Envio de Comprovante no WhatsApp */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              <span>Já fiz o Pix / Enviar Comprovante para o Eullon</span>
            </button>
            <p className="text-[10px] text-center text-neutral-400">
              Ao enviar o comprovante, o Eullon libera mais 30 dias na hora para a Barbearia Elite!
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
