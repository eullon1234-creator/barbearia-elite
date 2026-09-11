import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle2, ChevronRight, X, AlertTriangle, 
  MapPin, MessageCircle, QrCode, Copy, Check, Trash2, CalendarClock
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';
import { getGoogleCalendarUrl, downloadIcsFile } from '../utils/calendarUtils';
import { getWhatsAppUrl } from '../utils/phoneUtils';

export default function ClientActiveBookingBanner({ onOpenBookingModal }) {
  const { profile, updateAppointmentStatus } = useBarber();
  const [booking, setBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [countdownText, setCountdownText] = useState('');

  const loadBooking = () => {
    try {
      const saved = localStorage.getItem('elite_client_active_booking_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.status !== 'Cancelado') {
          setBooking(parsed);
          return;
        }
      }
      setBooking(null);
    } catch (e) {
      setBooking(null);
    }
  };

  useEffect(() => {
    loadBooking();
    const handleUpdate = () => loadBooking();
    window.addEventListener('elite_booking_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('elite_booking_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Atualização de contagem regressiva
  useEffect(() => {
    if (!booking || !booking.date || !booking.time) return;

    const updateCountdown = () => {
      const [year, month, day] = booking.date.split('-').map(Number);
      const [hour, min] = booking.time.split(':').map(Number);
      const targetDate = new Date(year, month - 1, day, hour, min);
      const now = new Date();

      const diffMs = targetDate.getTime() - now.getTime();

      if (diffMs < -2 * 60 * 60 * 1000) {
        // Passou de 2 horas do horário, encerra contagem
        setCountdownText('Concluído');
        return;
      }

      if (diffMs <= 0) {
        setCountdownText('É agora!');
        return;
      }

      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const days = Math.floor(hours / 24);

      if (days > 0) {
        setCountdownText(`Faltam ${days}d e ${hours % 24}h`);
      } else if (hours > 0) {
        setCountdownText(`Em ${hours}h ${minutes}min`);
      } else {
        setCountdownText(`Em ${minutes} min`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [booking]);

  const handleCopyPix = () => {
    const key = profile.pixKey || '99991220211';
    const notifySuccess = () => {
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(key).then(notifySuccess).catch(() => {
        fallbackCopy(key, notifySuccess);
      });
    } else {
      fallbackCopy(key, notifySuccess);
    }
  };

  const fallbackCopy = (text, callback) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      if (callback) callback();
    } catch (e) {}
    document.body.removeChild(textArea);
  };

  const handleCancelBooking = () => {
    if (!booking) return;
    const confirmCancel = window.confirm('Deseja realmente cancelar este agendamento?');
    if (!confirmCancel) return;

    if (booking.id) {
      updateAppointmentStatus(booking.id, 'Cancelado');
    }

    try {
      localStorage.removeItem('elite_client_active_booking_v1');
      window.dispatchEvent(new Event('elite_booking_updated'));
    } catch (e) {}

    // Mensagem de cancelamento opcional para o WhatsApp
    const message = `Olá! Precisei cancelar o agendamento na ${profile?.name || 'Barbearia Elite'} de *${booking.service}* marcado para *${booking.date.split('-').reverse().join('/')} às ${booking.time}*. Nome: ${booking.client}.`;
    window.open(getWhatsAppUrl(profile.whatsappNumber, message), '_blank');
    setShowDetails(false);
  };

  if (!booking) return null;

  const formattedDate = booking.date.split('-').reverse().join('/');

  return (
    <>
      {/* Banner Superior Discreto e Moderno */}
      <div className="bg-dark-900 border-b border-gold-500/30 px-4 py-2.5 shadow-lg relative z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gold-500/15 border border-gold-500/40 text-gold-400 flex items-center justify-center shrink-0">
                <CalendarClock className="w-5 h-5" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-dark-900 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-dark-900" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-gold-400">
                  Seu Próximo Corte
                </span>
                {countdownText && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-gold-500/20 text-gold-300 rounded border border-gold-500/30">
                    {countdownText}
                  </span>
                )}
              </div>
              <p className="text-xs text-white font-bold truncate">
                {booking.service} • <span className="text-neutral-300 font-normal">{formattedDate} às {booking.time}{booking.endTime ? ` às ${booking.endTime}` : ''}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => setShowDetails(true)}
              className="px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer transition-colors"
            >
              <span>Ver Detalhes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Agendamento Ativo */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-dark-900 border border-gold-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 border-b border-dark-800 bg-dark-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gold-500/15 border border-gold-500/40 text-gold-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gold-400 uppercase tracking-wider">Agendamento Ativo</span>
                  <h4 className="text-sm font-extrabold text-white">{profile.name || 'Barbearia Elite'}</h4>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white bg-dark-800 hover:bg-dark-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Ticket */}
              <div className="p-4 rounded-2xl bg-card-gradient border border-gold-500/30 space-y-2.5">
                <div className="flex justify-between items-start">
                  <span className="text-neutral-400">Serviço:</span>
                  <span className="font-bold text-white text-right">{booking.service}</span>
                </div>

                {booking.extras && booking.extras.length > 0 && (
                  <div className="flex justify-between items-start">
                    <span className="text-neutral-400">Adicionais:</span>
                    <div className="text-right">
                      {booking.extras.map((ex) => (
                        <p key={ex.id} className="text-gold-300 font-medium">
                          + {ex.name}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-neutral-400">Data:</span>
                  <span className="font-bold text-white">{formattedDate}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-400">Horário:</span>
                  <span className="font-bold text-gold-400">
                    {booking.time}{booking.endTime ? ` às ${booking.endTime}` : ''} ({booking.durationMinutes || 30} min)
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-400">Cliente:</span>
                  <span className="font-medium text-white">{booking.client}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-400">Contato:</span>
                  <span className="font-medium text-white">{booking.phone}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-400">Pagamento:</span>
                  <span className="font-medium text-neutral-300">{booking.payment || 'Pix'}</span>
                </div>

                {booking.observation && (
                  <div className="flex justify-between items-start pt-1">
                    <span className="text-neutral-400 shrink-0">Observação:</span>
                    <span className="font-medium text-neutral-300 text-right italic text-[11px] max-w-[200px]">
                      "{booking.observation}"
                    </span>
                  </div>
                )}

                <div className="border-t border-dashed border-dark-700 pt-2 flex justify-between items-center">
                  <span className="font-bold text-neutral-400 uppercase text-[11px]">Valor Total:</span>
                  <span className="text-base font-black text-gold-400">
                    R$ {parseFloat(booking.price || 30).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Localização & Rota */}
              <div className="p-3 rounded-2xl bg-dark-850 border border-dark-750 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <MapPin className="w-5 h-5 text-gold-400 shrink-0" />
                  <div className="min-w-0">
                    <h5 className="font-bold text-white truncate">{profile.address || 'Av. Petrônio Portela, Amarante - PI'}</h5>
                    <p className="text-[10px] text-neutral-400">{profile.name || 'Barbearia Elite'}</p>
                  </div>
                </div>
                {profile.googleMapsLink && (
                  <a
                    href={profile.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 border border-gold-500/30 text-[11px] font-bold shrink-0"
                  >
                    Ver Rota
                  </a>
                )}
              </div>

              {/* Card Pix Copia e Cola & QR Code */}
              <div className="rounded-2xl bg-dark-850 border border-gold-500/30 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-gold-400" />
                    <span className="font-bold text-white">Chave Pix da Barbearia</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {profile.pixKeyType || 'Celular'}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="bg-white p-1 rounded-lg shrink-0 shadow">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(profile.pixKey || '99991220211')}`}
                      alt="QR Code Pix"
                      className="w-14 h-14 object-contain rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-[10px] text-neutral-400 truncate">Favorecido: {profile.pixReceiver || profile.owner}</p>
                    <div className="bg-dark-950 px-2 py-1 rounded border border-dark-800 text-gold-400 font-mono font-bold text-xs truncate">
                      {profile.pixKey || '99991220211'}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className={`w-full py-1 rounded text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                        copiedPix ? 'bg-emerald-500 text-dark-950' : 'bg-gold-500/20 text-gold-300 hover:bg-gold-500/30'
                      }`}
                    >
                      {copiedPix ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPix ? 'Chave Copiada!' : 'Copiar Chave Pix'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Salvar na Agenda */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block text-center">
                  Adicionar ao Calendário
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={getGoogleCalendarUrl({
                      title: `Corte: ${booking.service}`,
                      description: `Agendamento com ${profile.owner} (${profile.name}). Pagamento: ${booking.payment}`,
                      location: profile.address,
                      date: booking.date,
                      time: booking.time,
                      durationMinutes: booking.durationMinutes || 35,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-dark-850 hover:bg-dark-800 text-neutral-200 border border-dark-700 flex items-center justify-center gap-1.5 font-bold text-[11px]"
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Google Agenda</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => downloadIcsFile({
                      title: `Corte: ${booking.service}`,
                      description: `Agendamento com ${profile.owner} (${profile.name}). Pagamento: ${booking.payment}`,
                      location: profile.address,
                      date: booking.date,
                      time: booking.time,
                      durationMinutes: booking.durationMinutes || 35,
                    })}
                    className="p-2 rounded-xl bg-dark-850 hover:bg-dark-800 text-neutral-200 border border-dark-700 flex items-center justify-center gap-1.5 font-bold text-[11px] cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Apple / Celular</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Ações Inferiores */}
            <div className="p-3 border-t border-dark-800 bg-dark-950 flex items-center gap-2">
              <button
                onClick={handleCancelBooking}
                className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Desmarcar</span>
              </button>

              <a
                href={getWhatsAppUrl(profile.whatsappNumber, `Olá! Tenho uma dúvida sobre meu agendamento de ${booking.service} no dia ${formattedDate} às ${booking.time}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
              >
                <MessageCircle className="w-4 h-4 fill-dark-950" />
                <span>Falar no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
