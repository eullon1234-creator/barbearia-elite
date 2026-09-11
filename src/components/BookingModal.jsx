import React, { useState, useEffect } from 'react';
import { 
  X, Check, Clock, User, Phone, CreditCard, 
  ChevronRight, ChevronLeft, Scissors, AlertCircle, Palmtree, MessageCircle,
  Calendar, Download, Copy, Flame, Sparkles, QrCode, FileText,
  Zap, ChevronDown, ChevronUp, Sun, CalendarDays
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBarber } from '../context/BarberContext';
import { useLicense } from '../context/LicenseContext';
import { getGoogleCalendarUrl, downloadIcsFile } from '../utils/calendarUtils';
import { getWhatsAppUrl } from '../utils/phoneUtils';

export default function BookingModal({ isOpen, onClose, initialService }) {
  const { services, profile, scheduleConfig, appointments, addAppointment, extras, barbers, currentClient, clientLogin } = useBarber();
  const { recordClick } = useLicense();

  const activeBarbers = (barbers && barbers.length > 0)
    ? barbers.filter(b => b.active !== false)
    : [
        { id: 'edivan', name: 'Edivan', role: 'Degradê & Barba', icon: '✂️' },
        { id: 'valdivan', name: 'Valdivan', role: 'Degradê & Tesoura', icon: '💈' }
      ];

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(initialService || (services.length > 0 ? services[0] : null));
  const [isChangingService, setIsChangingService] = useState(false);
  const [isTurbinarOpen, setIsTurbinarOpen] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedWeekTab, setSelectedWeekTab] = useState(0); // 0 = Esta Semana, 1 = Próxima Semana
  const [week1Days, setWeek1Days] = useState([]);
  const [week2Days, setWeek2Days] = useState([]);
  const [todayDay, setTodayDay] = useState(null);
  const [tomorrowDay, setTomorrowDay] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [observation, setObservation] = useState('');
  const [selectedBarber, setSelectedBarber] = useState(() => activeBarbers[0]?.name || 'Edivan');
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [copiedPix, setCopiedPix] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (activeBarbers.length > 0 && !activeBarbers.some(b => b.name === selectedBarber)) {
      setSelectedBarber(activeBarbers[0].name);
    }
  }, [activeBarbers, selectedBarber]);

  // Auto-preenchimento dos dados do cliente logado ou já cadastrado
  useEffect(() => {
    if (currentClient) {
      if (currentClient.name) setClientName(currentClient.name);
      if (currentClient.phone) setClientPhone(currentClient.phone);
    } else {
      try {
        const savedInfo = localStorage.getItem('elite_client_info_v1');
        if (savedInfo) {
          const parsed = JSON.parse(savedInfo);
          if (parsed.name && !clientName) setClientName(parsed.name);
          if (parsed.phone && !clientPhone) setClientPhone(parsed.phone);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [currentClient]);

  useEffect(() => {
    if (initialService) {
      setSelectedService(initialService);
    } else if (services.length > 0 && !selectedService) {
      setSelectedService(services[0]);
    }
  }, [initialService, services]);

  useEffect(() => {
    const today = new Date();
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const weekNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const pad = (n) => String(n).padStart(2, '0');
    const formatDayObj = (d, index) => {
      const dayOfWeek = d.getDay(); // 0 = Dom, 6 = Sáb
      const isSunday = dayOfWeek === 0;
      const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const dayNumber = d.getDate().toString().padStart(2, '0');
      const monthName = monthNames[d.getMonth()];
      const weekName = weekNames[dayOfWeek];

      return {
        dateStr,
        label: index === 0 ? 'Hoje' : index === 1 ? 'Amanhã' : `${weekName}, ${dayNumber}/${monthName}`,
        weekName,
        dayNumber,
        monthName,
        isSunday,
        dayOfWeek,
      };
    };

    const d0 = new Date(today);
    const todayFormatted = formatDayObj(d0, 0);
    setTodayDay(todayFormatted);

    const d1 = new Date(today);
    d1.setDate(today.getDate() + 1);
    const tomorrowFormatted = formatDayObj(d1, 1);
    setTomorrowDay(tomorrowFormatted);

    // Próximos 6 dias para Semana 1 (Grade 3x2)
    const w1 = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      w1.push(formatDayObj(d, i));
    }
    setWeek1Days(w1);

    // Próximos 6 dias para Semana 2 (Grade 3x2)
    const w2 = [];
    for (let i = 6; i < 12; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      w2.push(formatDayObj(d, i));
    }
    setWeek2Days(w2);

    // Seleciona o primeiro dia válido por padrão
    if (!selectedDate) {
      if (!todayFormatted.isSunday) {
        setSelectedDate(todayFormatted.dateStr);
      } else if (!tomorrowFormatted.isSunday) {
        setSelectedDate(tomorrowFormatted.dateStr);
      } else {
        const firstValid = w1.find(d => !d.isSunday);
        if (firstValid) setSelectedDate(firstValid.dateStr);
      }
    }
  }, []);

  // Geração dinâmica de slots de horários baseados no scheduleConfig do barbeiro
  const generateTimeSlots = (dateString) => {
    if (!dateString) return [];
    const parts = dateString.split('-');
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const dayOfWeek = dateObj.getDay();

    if (dayOfWeek === 0) return []; // Domingo fechado

    const isSat = dayOfWeek === 6;
    const startStr = isSat ? (scheduleConfig.saturdayStart || '08:00') : (scheduleConfig.weekdaysStart || '13:00');
    const endStr = isSat ? (scheduleConfig.saturdayEnd || '13:00') : (scheduleConfig.weekdaysEnd || '18:00');
    const interval = scheduleConfig.slotInterval || 30;

    const [startH, startM] = startStr.split(':').map(Number);
    const [endH, endM] = endStr.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const slots = [];
    for (let m = startMinutes; m < endMinutes; m += interval) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const timeFormatted = `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      
      // Verifica se já está agendado na lista de agendamentos para a data selecionada
      const isBooked = appointments.some(a => {
        if (a.status === 'Cancelado') return false;
        const aptDate = a.date;
        return aptDate === selectedDate && a.time === timeFormatted;
      });

      slots.push({
        time: timeFormatted,
        available: !isBooked,
      });
    }

    return slots;
  };

  const timeSlots = generateTimeSlots(selectedDate);
  const availableSlotsCount = timeSlots.filter(s => s.available).length;
  const isUrgent = availableSlotsCount > 0 && availableSlotsCount <= 5;

  // Cálculo de duração e preço com Adicionais (Upsell)
  const baseDurationMinutes = parseInt(selectedService?.duration) || 30;
  const extrasDurationMinutes = selectedExtras.reduce((acc, e) => acc + (e.durationMinutes || 0), 0);
  const totalDurationMinutes = baseDurationMinutes + extrasDurationMinutes;

  const basePrice = selectedService ? parseFloat(selectedService.price) : 0;
  const extrasPrice = selectedExtras.reduce((acc, e) => acc + (parseFloat(e.price) || 0), 0);
  const totalPrice = basePrice + extrasPrice;

  // Cálculo do horário de término estimado
  const getEndTime = (startTime, durationMins) => {
    if (!startTime) return '';
    const [h, m] = startTime.split(':').map(Number);
    const totalM = h * 60 + m + durationMins;
    const endH = Math.floor(totalM / 60) % 24;
    const endM = totalM % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
  };

  const toggleExtra = (extra) => {
    setSelectedExtras(prev => {
      const exists = prev.some(e => e.id === extra.id);
      if (exists) {
        return prev.filter(e => e.id !== extra.id);
      } else {
        return [...prev, extra];
      }
    });
  };

  const handleCopyPix = () => {
    const key = profile.pixKey || '99991220211';
    const notifySuccess = () => {
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(key).then(notifySuccess).catch(() => {
        fallbackCopyText(key, notifySuccess);
      });
    } else {
      fallbackCopyText(key, notifySuccess);
    }
  };

  const fallbackCopyText = (text, callback) => {
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
    } catch (e) {
      console.error('Falha ao copiar:', e);
    }
    document.body.removeChild(textArea);
  };

  // Máscara automática de telefone (99) 99999-9999
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
    setClientPhone(val);
  };

  const handleNextToSummary = () => {
    const errs = {};
    if (!clientName.trim()) {
      errs.clientName = 'Por favor, informe seu nome completo.';
    }
    const cleanPhone = clientPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      errs.clientPhone = 'Informe um WhatsApp válido com DDD.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setStep(4);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#F5E396', '#ffffff']
      });
    } catch (e) {
      // ignore
    }
  };

  const handleConfirmWhatsApp = () => {
    const formattedDate = selectedDate.split('-').reverse().join('/');
    const endTime = getEndTime(selectedTime, totalDurationMinutes);
    const extrasNames = selectedExtras.map(e => e.name).join(', ');
    const fullServiceName = selectedService 
      ? (selectedExtras.length > 0 ? `${selectedService.name} + ${extrasNames}` : selectedService.name)
      : 'Corte Masculino';

    const newAppointment = {
      id: 'apt-' + Date.now(),
      client: clientName,
      phone: clientPhone,
      service: fullServiceName,
      baseService: selectedService ? selectedService.name : 'Corte Masculino',
      barber: selectedBarber,
      extras: selectedExtras,
      observation: observation.trim(),
      date: selectedDate,
      time: selectedTime,
      endTime: endTime,
      durationMinutes: totalDurationMinutes,
      price: totalPrice,
      payment: paymentMethod,
      status: 'Confirmado',
      createdAt: new Date().toISOString(),
    };
    
    // Registra no banco de agendamentos para alimentar o painel e faturamento
    addAppointment(newAppointment);

    // Registra métrica de conversão para o painel master do Eullon
    try {
      recordClick('bookingCompleted', `Agendamento: ${fullServiceName} (${selectedBarber})`);
    } catch (e) {}

    // Salva sessão do cliente automaticamente se ainda não estiver logado
    if (!currentClient && clientName && clientPhone) {
      clientLogin({ name: clientName, phone: clientPhone });
    }

    // Salva agendamento ativo e dados do cliente para persistência local
    try {
      localStorage.setItem('elite_client_active_booking_v1', JSON.stringify(newAppointment));
      localStorage.setItem('elite_client_info_v1', JSON.stringify({ name: clientName, phone: clientPhone }));
      window.dispatchEvent(new Event('elite_booking_updated'));
    } catch (e) {
      console.error(e);
    }

    let message = `Olá! Gostaria de confirmar meu agendamento na ${profile?.name || 'Barbearia Elite'}:\n\n` +
      `💈 *Serviço:* ${selectedService ? selectedService.name : 'Corte'}\n`;

    if (selectedExtras.length > 0) {
      message += `✨ *Adicionais:* ${selectedExtras.map(e => `${e.name} (+R$ ${parseFloat(e.price).toFixed(2).replace('.', ',')})`).join(', ')}\n`;
    }

    message += `👤 *Profissional:* ${selectedBarber}\n` +
      `📅 *Data:* ${formattedDate}\n` +
      `⏰ *Horário:* ${selectedTime} às ${endTime} (${totalDurationMinutes} min)\n` +
      `💰 *Valor Total:* R$ ${totalPrice.toFixed(2).replace('.', ',')}\n` +
      `💳 *Pagamento:* ${paymentMethod}\n\n` +
      `👤 *Cliente:* ${clientName}\n` +
      `📱 *Contato:* ${clientPhone}\n`;

    if (observation.trim()) {
      message += `📝 *Observações:* ${observation.trim()}\n`;
    }

    message += `📍 *Local:* ${profile.address}\n\n` +
      `Pode confirmar este horário para mim?`;

    const waUrl = getWhatsAppUrl(profile.whatsappNumber, message);
    window.open(waUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 transition-all">
      <div className="w-full sm:max-w-md bg-dark-900 border border-dark-700 sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
        
        {/* Cabeçalho do Modal */}
        <div className="p-4 border-b border-dark-800 flex items-center justify-between bg-dark-950/80">
          <div>
            <span className="text-[11px] font-bold text-gold-400 uppercase tracking-wider">
              Passo {step} de 4
            </span>
            <h3 className="text-base font-extrabold text-white">
              {step === 1 && 'Confirmar Serviço'}
              {step === 2 && 'Escolher Data & Horário'}
              {step === 3 && 'Seus Dados'}
              {step === 4 && 'Agendamento Pronto!'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-white bg-dark-800 hover:bg-dark-700 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alerta se o barbeiro ativou Modo Férias */}
        {scheduleConfig.vacationMode && (
          <div className="p-3 bg-rose-500/20 border-b border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <Palmtree className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{scheduleConfig.vacationMessage}</span>
          </div>
        )}

        {/* Barra de Progresso */}
        <div className="grid grid-cols-4 gap-1 px-4 pt-2 pb-1 bg-dark-950">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-gradient-to-r from-gold-500 to-amber-300' : 'bg-dark-800'
              }`}
            />
          ))}
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-neutral-200">

          {/* ================= PASSO 1: SERVIÇO & ADICIONAIS ================= */}
          {step === 1 && (
            <div className="space-y-3.5">
              {/* Seleção do Barbeiro */}
              <div className="p-3 rounded-2xl bg-dark-850 border border-dark-750 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider">
                    Escolha o Barbeiro de Preferência:
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Equipe Online
                  </span>
                </div>
                <div className={`grid gap-2 ${activeBarbers.length > 2 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'}`}>
                  {activeBarbers.map((barber) => {
                    const isSelected = selectedBarber === barber.name;
                    return (
                      <button
                        key={barber.id || barber.name}
                        type="button"
                        onClick={() => setSelectedBarber(barber.name)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-gold-500/15 border-gold-500 text-white shadow-gold-glow-sm ring-1 ring-gold-500/50'
                            : 'bg-dark-900/90 border-dark-700 text-neutral-300 hover:border-dark-600'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {barber.photo ? (
                            <img src={barber.photo} alt={barber.name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-gold-500/50 shadow-sm" />
                          ) : (
                            <span className="text-base shrink-0">{barber.icon || '✂️'}</span>
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">{barber.name}</div>
                            <span className="text-[10px] text-neutral-400 block truncate">{barber.role}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-gold-500 flex items-center justify-center flex-shrink-0 ml-1">
                            <Check className="w-2.5 h-2.5 text-dark-950 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Serviço Selecionado com Opção de Alterar */}
              <div className="p-3 rounded-2xl bg-dark-850 border border-gold-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">
                    Serviço Selecionado:
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsChangingService(!isChangingService)}
                    className="text-[11px] font-bold text-gold-400 hover:text-gold-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isChangingService ? 'Fechar Lista' : 'Trocar Serviço'}</span>
                    {isChangingService ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {selectedService && !isChangingService && (
                  <div className="p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full border-2 border-gold-500 bg-gold-500 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-dark-950 stroke-[3]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">{selectedService.name}</h4>
                        <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-gold-400" /> {selectedService.duration}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-gold-400">
                      R$ {parseFloat(selectedService.price).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}

                {/* Lista Completa de Serviços quando clica em Trocar */}
                {isChangingService && (
                  <div className="space-y-1.5 pt-1 animate-in fade-in duration-150">
                    {services.map((svc) => (
                      <div
                        key={svc.id}
                        onClick={() => {
                          setSelectedService(svc);
                          setIsChangingService(false);
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          selectedService && selectedService.id === svc.id
                            ? 'bg-gold-500/15 border-gold-500 text-white shadow-gold-glow-sm'
                            : 'bg-dark-900 border-dark-750 text-neutral-300 hover:border-neutral-600'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selectedService && selectedService.id === svc.id ? 'border-gold-500 bg-gold-500' : 'border-neutral-500'
                          }`}>
                            {selectedService && selectedService.id === svc.id && <Check className="w-2.5 h-2.5 text-dark-950 stroke-[3]" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{svc.name}</p>
                            <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 text-gold-400" /> {svc.duration}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-gold-400">
                          R$ {parseFloat(svc.price).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Adicionais / Turbinar (Expansível / Dobrável sob demanda com botãozinho) */}
              {extras && extras.length > 0 && (
                <div className="p-3 rounded-2xl bg-dark-850 border border-dark-750 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gold-500/15 border border-gold-500/30 text-gold-400 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Turbinar meu Corte</h4>
                        <p className="text-[10px] text-neutral-400">
                          {selectedExtras.length > 0 
                            ? `${selectedExtras.length} adicional(is) adicionado(s)` 
                            : 'Sobrancelha, barba, toalha quente...'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsTurbinarOpen(!isTurbinarOpen)}
                      className="px-2.5 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-gold-400 border border-dark-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>{isTurbinarOpen ? 'Fechar' : selectedExtras.length > 0 ? 'Editar Extras' : '+ Turbinar Corte'}</span>
                      {isTurbinarOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Badges dos adicionais ativos quando recolhido */}
                  {!isTurbinarOpen && selectedExtras.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedExtras.map(ex => (
                        <span key={ex.id} className="text-[10px] font-semibold bg-gold-500/20 text-gold-300 px-2 py-0.5 rounded-full border border-gold-500/30">
                          ✓ {ex.name} (+R$ {parseFloat(ex.price).toFixed(2).replace('.', ',')})
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Opções de Adicionais quando clica no botãozinho */}
                  {isTurbinarOpen && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 animate-in fade-in duration-150">
                      {extras.map((extra) => {
                        const isSelected = selectedExtras.some(e => e.id === extra.id);
                        return (
                          <div
                            key={extra.id}
                            onClick={() => toggleExtra(extra)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-gold-500/15 border-gold-500/80 text-white shadow-gold-glow-sm'
                                : 'bg-dark-900 border-dark-750 text-neutral-300 hover:border-neutral-600'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'border-gold-500 bg-gold-500' : 'border-neutral-500'
                              }`}>
                                {isSelected && <Check className="w-2.5 h-2.5 text-dark-950 stroke-[3]" />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white leading-tight truncate">{extra.name}</p>
                                <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5 text-gold-400" /> +{extra.durationMinutes} min
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-black text-gold-400 shrink-0 ml-2">
                              + R$ {parseFloat(extra.price).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Prévia do Total no Passo 1 */}
              <div className="p-3 rounded-xl bg-dark-950 border border-gold-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gold-400" />
                  <span className="text-xs text-neutral-300">
                    Duração prevista: <strong className="text-white">{totalDurationMinutes} min</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 uppercase block font-bold">Total previsto</span>
                  <span className="text-sm font-black text-gold-400">
                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================= PASSO 2: DATA & HORÁRIO (GRADE SEMANAL DIRETA) ================= */}
          {step === 2 && (
            <div className="space-y-4">
              {/* 1. Seleção de Dias com Grade Semanal Direta (Zero Arrastar) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gold-400" />
                    <span>1. Escolha a Data:</span>
                  </label>
                  
                  {/* Seletor de Semana */}
                  <div className="flex items-center bg-dark-950 p-0.5 rounded-lg border border-dark-800 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setSelectedWeekTab(0)}
                      className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                        selectedWeekTab === 0 ? 'bg-gold-500 text-dark-950' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Esta Semana
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedWeekTab(1)}
                      className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                        selectedWeekTab === 1 ? 'bg-gold-500 text-dark-950' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Próxima Semana
                    </button>
                  </div>
                </div>

                {/* Atalhos Rápidos: Hoje e Amanhã */}
                {todayDay && tomorrowDay && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={todayDay.isSunday}
                      onClick={() => {
                        setSelectedDate(todayDay.dateStr);
                        setSelectedTime('');
                      }}
                      className={`p-2 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        todayDay.isSunday
                          ? 'opacity-40 bg-dark-900 border-dark-800 cursor-not-allowed text-neutral-500'
                          : selectedDate === todayDay.dateStr
                          ? 'bg-gold-500 text-dark-950 border-gold-400 font-black shadow-gold-glow-sm'
                          : 'bg-dark-850 border-dark-750 text-neutral-200 hover:border-gold-500/40'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                      <div className="text-left leading-tight">
                        <span className="text-[9px] uppercase font-bold block opacity-80">Rápido</span>
                        <span className="text-xs font-black">Hoje ({todayDay.dayNumber}/{todayDay.monthName})</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      disabled={tomorrowDay.isSunday}
                      onClick={() => {
                        setSelectedDate(tomorrowDay.dateStr);
                        setSelectedTime('');
                      }}
                      className={`p-2 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        tomorrowDay.isSunday
                          ? 'opacity-40 bg-dark-900 border-dark-800 cursor-not-allowed text-neutral-500'
                          : selectedDate === tomorrowDay.dateStr
                          ? 'bg-gold-500 text-dark-950 border-gold-400 font-black shadow-gold-glow-sm'
                          : 'bg-dark-850 border-dark-750 text-neutral-200 hover:border-gold-500/40'
                      }`}
                    >
                      <CalendarDays className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                      <div className="text-left leading-tight">
                        <span className="text-[9px] uppercase font-bold block opacity-80">Próximo</span>
                        <span className="text-xs font-black">Amanhã ({tomorrowDay.dayNumber}/{tomorrowDay.monthName})</span>
                      </div>
                    </button>
                  </div>
                )}

                {/* Grade Semanal de 6 Dias (3 colunas x 2 linhas) - SEM ARRASTAR */}
                <div className="grid grid-cols-3 gap-2">
                  {(selectedWeekTab === 0 ? week1Days : week2Days).map((day) => {
                    const isSelected = selectedDate === day.dateStr;
                    return (
                      <button
                        key={day.dateStr}
                        type="button"
                        disabled={day.isSunday}
                        onClick={() => {
                          setSelectedDate(day.dateStr);
                          setSelectedTime('');
                        }}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          day.isSunday
                            ? 'opacity-35 bg-dark-950 border-dark-855 cursor-not-allowed text-neutral-500'
                            : isSelected
                            ? 'bg-gold-500 text-dark-950 border-gold-400 shadow-gold-glow-sm font-black ring-1 ring-gold-400'
                            : 'bg-dark-850 border-dark-750 text-neutral-200 hover:border-neutral-600 hover:bg-dark-800'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-extrabold tracking-wider">{day.weekName}</span>
                        <span className="text-sm font-black my-0.5">{day.dayNumber}/{day.monthName}</span>
                        <span className="text-[9px] opacity-80 font-medium">
                          {day.isSunday ? 'Fechado' : isSelected ? 'Selecionado' : 'Disponível'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Seleção de Horários por Turno */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                      2. Horários ({selectedDate ? (new Date(selectedDate.split('-')[0], selectedDate.split('-')[1] - 1, selectedDate.split('-')[2]).getDay() === 6 ? 'Sábado' : 'Tarde') : 'Dia'}):
                    </label>
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    {timeSlots.filter(s => s.available).length} horários livres
                  </span>
                </div>

                {/* Gatilho de Urgência: Vagas Restantes */}
                {isUrgent && (
                  <div className="px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-2 text-amber-300 text-xs font-bold animate-pulse">
                    <Flame className="w-4 h-4 text-amber-400 shrink-0 fill-amber-400" />
                    <span>Atenção: Restam apenas {availableSlotsCount} {availableSlotsCount === 1 ? 'vaga' : 'vagas'} para este dia!</span>
                  </div>
                )}

                {timeSlots.length === 0 ? (
                  <div className="p-4 rounded-xl bg-dark-850 border border-dark-750 text-center">
                    <AlertCircle className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
                    <p className="text-xs text-neutral-300">Barbearia fechada neste dia.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          !slot.available
                            ? 'bg-dark-950 text-neutral-600 border-dark-850 line-through cursor-not-allowed opacity-50'
                            : selectedTime === slot.time
                            ? 'bg-gold-500 text-dark-950 border-gold-400 shadow-gold-glow-sm font-black'
                            : 'bg-dark-850 text-neutral-200 border-dark-750 hover:border-gold-500/40 hover:bg-dark-800'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}

                {/* Horário com Término Estimado */}
                {selectedTime && (
                  <div className="p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-between text-xs animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-neutral-200">
                      <Clock className="w-4 h-4 text-gold-400 shrink-0" />
                      <span>
                        Previsão: <strong className="text-white">{selectedTime}</strong> às <strong className="text-gold-400">{getEndTime(selectedTime, totalDurationMinutes)}</strong>
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/20">
                      {totalDurationMinutes} min
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= PASSO 3: DADOS DO CLIENTE & PREFERÊNCIAS ================= */}
          {step === 3 && (
            <div className="space-y-4">
              {currentClient && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-semibold">Conectado como Cliente VIP</span>
                  </div>
                  <span className="text-xs font-bold text-white">
                    {currentClient.name}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gold-400" />
                  <span>Seu Nome Completo:</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: João da Silva"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className={`w-full p-3 rounded-xl bg-dark-850 border ${
                    errors.clientName ? 'border-rose-500' : 'border-dark-700'
                  } text-white text-sm focus:outline-none focus:border-gold-500 transition-colors`}
                />
                {errors.clientName && (
                  <p className="text-rose-400 text-[11px] mt-1">{errors.clientName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gold-400" />
                  <span>WhatsApp para Confirmação:</span>
                </label>
                <input
                  type="tel"
                  placeholder="(99) 99999-9999"
                  value={clientPhone}
                  onChange={handlePhoneChange}
                  maxLength={15}
                  className={`w-full p-3 rounded-xl bg-dark-850 border ${
                    errors.clientPhone ? 'border-rose-500' : 'border-dark-700'
                  } text-white text-sm focus:outline-none focus:border-gold-500 transition-colors`}
                />
                {errors.clientPhone && (
                  <p className="text-rose-400 text-[11px] mt-1">{errors.clientPhone}</p>
                )}
              </div>

              {/* Campo de Observações / Preferências do Corte */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-gold-400" />
                    <span>Preferências ou Observações:</span>
                  </span>
                  <span className="text-[10px] text-neutral-400 font-normal">Opcional</span>
                </label>
                <textarea
                  rows={2}
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Ex: Degradê bem disfarçado na zero, não tirar muito em cima, tenho cicatriz..."
                  className="w-full p-2.5 rounded-xl bg-dark-850 border border-dark-700 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-gold-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-gold-400" />
                  <span>Forma de Pagamento Preferida:</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Pix', label: 'Pix', badge: 'Rápido' },
                    { id: 'Cartão', label: 'Cartão', badge: 'Débito/Crédito' },
                    { id: 'Dinheiro', label: 'Dinheiro', badge: 'Espécie' },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        paymentMethod === pm.id
                          ? 'bg-gold-500 text-dark-950 border-gold-400 font-bold shadow-gold-glow-sm'
                          : 'bg-dark-850 border-dark-750 text-neutral-300 hover:border-neutral-600'
                      }`}
                    >
                      <span className="text-xs">{pm.label}</span>
                      <span className="text-[9px] opacity-75">{pm.badge}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= PASSO 4: RESUMO VIP & PIX ================= */}
          {step === 4 && selectedService && (
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="relative rounded-2xl bg-card-gradient border border-gold-500/50 p-4 shadow-gold-glow overflow-hidden">
                <div className="absolute top-0 right-0 px-3 py-1 bg-gold-gradient text-dark-950 text-[10px] font-black uppercase tracking-wider rounded-bl-xl shadow">
                  Resumo VIP
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">{profile.name}</h4>
                    <p className="text-[10px] text-neutral-400">{profile.owner} • {profile.cityState || 'Amarante - PI'}</p>
                  </div>
                </div>

                <div className="border-t border-dashed border-dark-700 my-3" />

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Serviço:</span>
                    <span className="font-bold text-white text-right">{selectedService.name}</span>
                  </div>

                  {selectedExtras.length > 0 && (
                    <div className="flex justify-between items-start">
                      <span className="text-neutral-400">Adicionais:</span>
                      <div className="text-right">
                        {selectedExtras.map((ex) => (
                          <p key={ex.id} className="text-gold-300 font-semibold text-[11px]">
                            + {ex.name} (R$ {parseFloat(ex.price).toFixed(2).replace('.', ',')})
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-neutral-400">Data:</span>
                    <span className="font-bold text-white">
                      {selectedDate.split('-').reverse().join('/')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Horário Previsto:</span>
                    <span className="font-bold text-gold-400 text-sm">
                      {selectedTime} às {getEndTime(selectedTime, totalDurationMinutes)} ({totalDurationMinutes} min)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Cliente:</span>
                    <span className="font-medium text-white">{clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Contato:</span>
                    <span className="font-medium text-white">{clientPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Pagamento:</span>
                    <span className="font-medium text-neutral-300">{paymentMethod}</span>
                  </div>
                  {observation.trim() && (
                    <div className="flex justify-between items-start pt-1">
                      <span className="text-neutral-400 shrink-0">Observações:</span>
                      <span className="font-medium text-neutral-300 text-right italic text-[11px] max-w-[200px]">
                        "{observation.trim()}"
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-dashed border-dark-700 my-3" />

                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase font-bold text-neutral-400">Total a pagar:</span>
                  <span className="text-lg font-black text-gold-400">
                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Card Pix Copia e Cola & QR Code */}
              <div className="rounded-2xl bg-dark-850 border border-gold-500/30 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">Chave Pix da Barbearia</h5>
                      <p className="text-[10px] text-neutral-400">Pague com facilidade na hora ou antes</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {profile.pixKeyType || 'Celular'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-white p-1 rounded-xl shrink-0 shadow">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(profile.pixKey || '99991220211')}`}
                      alt="QR Code Pix"
                      className="w-16 h-16 object-contain rounded"
                    />
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div>
                      <span className="text-[9px] text-neutral-400 block">Favorecido:</span>
                      <p className="text-xs font-bold text-white truncate">{profile.pixReceiver || profile.owner}</p>
                    </div>
                    <div className="bg-dark-950 px-2 py-1 rounded-lg border border-dark-800 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-gold-400 truncate select-all">
                        {profile.pixKey || '99991220211'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        copiedPix
                          ? 'bg-emerald-500 text-dark-950'
                          : 'bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/40'
                      }`}
                    >
                      {copiedPix ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Chave Pix Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Chave Pix</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-center text-xs text-neutral-400">
                Toque no botão abaixo para enviar o comprovante com a mensagem pronta no WhatsApp da Barbearia!
              </p>
            </div>
          )}
        </div>

        {/* Rodapé de Ações do Modal */}
        <div className="p-4 border-t border-dark-800 bg-dark-950 flex items-center justify-between gap-3">
          {step > 1 && step < 4 && (
            <button
              onClick={() => setStep(step - 1)}
              className="py-3 px-4 rounded-xl bg-dark-850 hover:bg-dark-800 text-neutral-300 text-xs font-bold flex items-center gap-1 border border-dark-750 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          )}

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              className="w-full py-3 px-5 rounded-xl bg-gold-gradient hover:bg-gold-gradient-hover text-dark-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-gold-glow cursor-pointer"
            >
              <span>Continuar (Data e Horário)</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}

          {step === 2 && (
            <button
              disabled={!selectedTime}
              onClick={() => setStep(3)}
              className={`flex-1 py-3 px-5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                !selectedTime
                  ? 'bg-dark-800 text-neutral-500 border border-dark-700 cursor-not-allowed'
                  : 'bg-gold-gradient hover:bg-gold-gradient-hover text-dark-950 shadow-gold-glow'
              }`}
            >
              <span>Prosseguir para Meus Dados</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleNextToSummary}
              className="flex-1 py-3 px-5 rounded-xl bg-gold-gradient hover:bg-gold-gradient-hover text-dark-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-gold-glow cursor-pointer"
            >
              <span>Ver Resumo do Agendamento</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}

          {step === 4 && (
            <div className="w-full space-y-2.5">
              <button
                onClick={handleConfirmWhatsApp}
                className="w-full py-3.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer animate-bounce"
              >
                <MessageCircle className="w-5 h-5 fill-dark-950" />
                <span>Confirmar via WhatsApp</span>
              </button>

              {/* Botões de Lembrete no Calendário */}
              <div className="pt-1 border-t border-dark-800">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block text-center mb-1.5">
                  Salvar na Sua Agenda:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={getGoogleCalendarUrl({
                      title: `Corte: ${selectedService ? selectedService.name : (profile.name || 'Barbearia Elite')}`,
                      description: `Agendamento com ${profile.owner || 'Barbearia Elite'} (${profile.name || 'Barbearia Elite'}). Pagamento: ${paymentMethod}${observation.trim() ? `\nObservação: ${observation.trim()}` : ''}`,
                      location: profile.address || 'Av. Petrônio Portela, Amarante - PI',
                      date: selectedDate,
                      time: selectedTime,
                      durationMinutes: totalDurationMinutes,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-dark-850 hover:bg-dark-800 text-neutral-200 border border-dark-700 flex items-center justify-center gap-1.5 text-xs font-bold transition-all text-center"
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Google Agenda</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => downloadIcsFile({
                      title: `Corte: ${selectedService ? selectedService.name : (profile.name || 'Barbearia Elite')}`,
                      description: `Agendamento com ${profile.owner || 'Barbearia Elite'} (${profile.name || 'Barbearia Elite'}). Pagamento: ${paymentMethod}${observation.trim() ? `\nObservação: ${observation.trim()}` : ''}`,
                      location: profile.address || 'Av. Petrônio Portela, Amarante - PI',
                      date: selectedDate,
                      time: selectedTime,
                      durationMinutes: totalDurationMinutes,
                    })}
                    className="py-2.5 px-3 rounded-xl bg-dark-850 hover:bg-dark-800 text-neutral-200 border border-dark-700 flex items-center justify-center gap-1.5 text-xs font-bold transition-all text-center cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Apple / Celular</span>
                  </button>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-full py-1.5 text-center text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Concluir e Fechar
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
