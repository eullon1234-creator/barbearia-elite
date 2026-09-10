import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BarberCard from './components/BarberCard';
import ServicesSection from './components/ServicesSection';
import AmenitiesSection from './components/AmenitiesSection';
import GallerySection from './components/GallerySection';
import LocationSection from './components/LocationSection';
import Footer from './components/Footer';
import BottomBar from './components/BottomBar';
import BookingModal from './components/BookingModal';
import BarberDashboard from './components/BarberDashboard';
import PwaInstallBanner from './components/PwaInstallBanner';
import ReviewsSection from './components/ReviewsSection';
import ClientActiveBookingBanner from './components/ClientActiveBookingBanner';
import ClientAuthModal from './components/ClientAuthModal';
import ClientProfileModal from './components/ClientProfileModal';
import EullonMasterAdmin from './components/EullonMasterAdmin';
import BarberPinLock from './components/BarberPinLock';
import { Smartphone, Monitor, Key } from 'lucide-react';

import { useLicense } from './context/LicenseContext';
import { useBarber } from './context/BarberContext';

export default function App() {
  const { recordVisit, recordClick } = useLicense();
  const { profile } = useBarber();

  const isMasterUrl = () => {
    if (typeof window === 'undefined') return false;
    const hash = (window.location.hash || '').toLowerCase();
    const search = (window.location.search || '').toLowerCase();
    return hash.includes('master') || search.includes('master') || hash.includes('saas') || search.includes('saas');
  };

  // Verifica se a rota é do barbeiro via hash (#/barbeiro) ou query (?barbeiro=1)
  const isBarberUrl = () => {
    if (typeof window === 'undefined') return false;
    const hash = (window.location.hash || '').toLowerCase();
    const search = (window.location.search || '').toLowerCase();
    return hash.includes('barbeiro') || search.includes('barbeiro');
  };

  const [isMasterRoute, setIsMasterRoute] = useState(isMasterUrl());
  const [isBarberRoute, setIsBarberRoute] = useState(isBarberUrl());
  const [isBarberAuthenticated, setIsBarberAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('elite_barber_auth') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingService, setBookingService] = useState(null);
  const [isClientAuthOpen, setIsClientAuthOpen] = useState(false);
  const [isClientProfileOpen, setIsClientProfileOpen] = useState(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  // Registra automaticamente a visita de clientes que entraram na barbearia
  useEffect(() => {
    if (!isMasterUrl()) {
      recordVisit();
    }
  }, []);

  useEffect(() => {
    const handleUrlChange = () => {
      setIsMasterRoute(isMasterUrl());
      setIsBarberRoute(isBarberUrl());
    };

    // Atalho secreto do Eullon: Ctrl + Shift + M ou Alt + M
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'm') || (e.altKey && e.key.toLowerCase() === 'm')) {
        e.preventDefault();
        window.location.hash = '#master';
        setIsMasterRoute(true);
      }
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleOpenBooking = (service = null) => {
    recordClick('bookingStarted', 'Cliente clicou em Agendar Horário');
    setBookingService(service);
    setIsBookingOpen(true);
  };

  const handleGoToClient = () => {
    window.location.hash = '';
    // Se havia query param, limpa também
    if (window.location.search.includes('barbeiro') || window.location.search.includes('master')) {
      const url = new URL(window.location);
      url.searchParams.delete('barbeiro');
      url.searchParams.delete('master');
      window.history.pushState({}, '', url.pathname);
    }
    setIsBarberRoute(false);
    setIsMasterRoute(false);
  };

  // Se a rota for a Central Master do Eullon (#master)
  if (isMasterRoute) {
    return <EullonMasterAdmin onExit={handleGoToClient} />;
  }

  return (
    <div className="min-h-screen bg-dark-950 text-neutral-100 flex flex-col items-center justify-start selection:bg-gold-500 selection:text-black">
      
      {/* Barra de Demonstração Superior para Computadores */}
      <div className="w-full bg-dark-900 border-b border-dark-800 py-2 px-4 hidden lg:flex items-center justify-between text-xs z-50">
        <div className="flex items-center gap-2 text-neutral-300">
          <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
          <span className="font-semibold text-white">Barbearia Elite</span>
          <span className="text-neutral-500">•</span>
          <span className="text-gold-400 font-medium">
            {isBarberRoute ? 'Painel de Gestão do Barbeiro' : 'Área do Cliente (Agendamento Online)'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Alternar Moldura de Celular vs Tela Cheia */}
          <div className="flex items-center bg-dark-950 p-0.5 rounded-lg border border-dark-750">
            <button
              onClick={() => setIsPhoneFrame(true)}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                isPhoneFrame ? 'bg-gold-500 text-dark-950 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
              title="Visualizar em moldura de celular (Mobile View)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Modo Celular</span>
            </button>
            <button
              onClick={() => setIsPhoneFrame(false)}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                !isPhoneFrame ? 'bg-gold-500 text-dark-950 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
              title="Visualizar expandido em tela cheia"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Tela Cheia</span>
            </button>
          </div>
        </div>
      </div>

      {/* Container Principal do App */}
      <div
        className={`w-full transition-all duration-300 ${
          isPhoneFrame
            ? 'max-w-[440px] my-0 lg:my-6 rounded-none lg:rounded-[40px] border-0 lg:border-[8px] lg:border-dark-800 lg:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden bg-dark-950 relative min-h-screen lg:min-h-[860px]'
            : 'max-w-2xl bg-dark-950 min-h-screen'
        }`}
      >
        {/* Notch / Speaker simulado no modo celular em desktop */}
        {isPhoneFrame && (
          <div className="hidden lg:flex justify-center pt-2 pb-1 bg-dark-950">
            <div className="w-24 h-4 bg-dark-900 rounded-full flex items-center justify-center gap-2">
              <div className="w-8 h-1 bg-dark-750 rounded-full"></div>
              <div className="w-2 h-2 rounded-full bg-dark-800"></div>
            </div>
          </div>
        )}

        {/* Renderização Condicional por Link */}
        {isBarberRoute ? (
          /* ================= LINK EXCLUSIVO DO BARBEIRO (PROTEGIDO POR PIN) ================= */
          !isBarberAuthenticated ? (
            <BarberPinLock
              expectedPin={profile?.barberPin || '0192'}
              onSuccess={() => setIsBarberAuthenticated(true)}
              onBackToClient={handleGoToClient}
            />
          ) : (
            <main className="pb-8">
              <BarberDashboard
                onBackToClientView={handleGoToClient}
                onLockDashboard={() => {
                  try {
                    sessionStorage.removeItem('elite_barber_auth');
                  } catch (e) {}
                  setIsBarberAuthenticated(false);
                }}
              />
            </main>
          )
        ) : (
          /* ================= LINK PÚBLICO DO CLIENTE (HOME / AGENDAMENTO) ================= */
          <>
            <Navbar
              onOpenBooking={() => handleOpenBooking(null)}
              onOpenClientAuth={() => setIsClientAuthOpen(true)}
              onOpenClientProfile={() => setIsClientProfileOpen(true)}
            />

            {/* Banner de Agendamento Ativo do Cliente */}
            <ClientActiveBookingBanner onOpenBookingModal={handleOpenBooking} />

            {/* Banner de Instalação PWA */}
            <PwaInstallBanner />

            {/* Conteúdo Principal do Cliente */}
            <main className="pb-16">
              {/* Hero Banner */}
              <Hero onOpenBooking={handleOpenBooking} />

              {/* Card dos Barbeiros Edivan & Valdivan */}
              <BarberCard />

              {/* Catálogo de Serviços */}
              <ServicesSection onOpenBooking={handleOpenBooking} />

              {/* Avaliações & Depoimentos Reais */}
              <ReviewsSection />

              {/* Comodidades da Barbearia */}
              <AmenitiesSection />

              {/* Galeria de Fotos do Espaço */}
              <GallerySection />

              {/* Endereço & Mapa */}
              <LocationSection />

              {/* Rodapé */}
              <Footer onOpenBooking={handleOpenBooking} />

              {/* Barra Flutuante de Agendamento e Navegação */}
              <BottomBar
                onOpenBooking={handleOpenBooking}
                onOpenClientAuth={() => setIsClientAuthOpen(true)}
                onOpenClientProfile={() => setIsClientProfileOpen(true)}
              />
            </main>
          </>
        )}
      </div>

      {/* Modal Interativo de Agendamento em 4 Passos */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialService={bookingService}
      />

      {/* Modal de Autenticação / Login VIP do Cliente */}
      <ClientAuthModal
        isOpen={isClientAuthOpen}
        onClose={() => setIsClientAuthOpen(false)}
        onSuccess={() => setIsClientProfileOpen(true)}
      />

      {/* Modal de Perfil / Histórico / Cartão Fidelidade VIP */}
      <ClientProfileModal
        isOpen={isClientProfileOpen}
        onClose={() => setIsClientProfileOpen(false)}
        onOpenBooking={handleOpenBooking}
      />
    </div>
  );
}
