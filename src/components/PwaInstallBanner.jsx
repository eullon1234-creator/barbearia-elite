import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Check, Share, PlusSquare } from 'lucide-react';
import { useBarber } from '../context/BarberContext';

export default function PwaInstallBanner() {
  const { profile } = useBarber();

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem('barbearia_pwa_dismissed') === 'true';
  });

  useEffect(() => {
    // Detecta se já está rodando como app standalone (PWA instalado)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }

    // Detecta iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Escuta evento nativo de instalação do Chrome / Android
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      // Fallback para outros navegadores
      alert('Para instalar o app: abra o menu do seu navegador e selecione "Adicionar à tela inicial" ou "Instalar aplicativo".');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('barbearia_pwa_dismissed', 'true');
  };

  if (isInstalled || isDismissed) return null;

  return (
    <>
      {/* Banner Superior Discreto e Moderno */}
      <div className="mx-4 mt-3 p-3 rounded-2xl bg-card-gradient border border-dark-750 shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl p-0.5 theme-gradient-accent shadow-sm shrink-0">
            <img
              src={profile.image}
              alt={profile.name}
              className="w-full h-full rounded-[10px] object-cover"
            />
          </div>
          <div>
            <h4 className="text-xs font-black text-white leading-tight">
              Instalar App no Celular
            </h4>
            <p className="text-[10px] text-neutral-400">
              Acesso rápido com 1 toque na sua tela inicial
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="py-1.5 px-3 rounded-xl theme-gradient-accent text-dark-950 text-[11px] font-black flex items-center gap-1 shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Instalar</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-dark-800 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modal Guia para iPhone (iOS Safari) */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-dark-900 border border-dark-750 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 theme-text-accent" />
                <h3 className="text-sm font-black text-white">Instalar no iPhone</h3>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-xl text-neutral-400 hover:text-white hover:bg-dark-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-300">
              Siga os 2 passos rápidos para ter o ícone do aplicativo na tela inicial do seu iPhone:
            </p>

            <div className="space-y-2.5 text-xs bg-dark-850 p-3.5 rounded-2xl border border-dark-800">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full theme-gradient-accent text-dark-950 font-black flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <span className="text-neutral-200">
                  Toque no botão <strong className="text-white">Compartilhar</strong> (ícone de quadrado com seta para cima na barra inferior do Safari).
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full theme-gradient-accent text-dark-950 font-black flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <span className="text-neutral-200">
                  Role um pouco para baixo e toque em <strong className="text-white">"Adicionar à Tela de Início"</strong>.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl theme-gradient-accent text-dark-950 text-xs font-black shadow-md cursor-pointer"
            >
              Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
