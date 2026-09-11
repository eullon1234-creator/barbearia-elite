import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db as firestoreDb } from '../services/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const LicenseContext = createContext(null);

const STORAGE_KEYS = {
  LICENSE: 'eullon_saas_license_elite_v3',
  ALL_LICENSES: 'eullon_saas_all_barbershops_v3',
  TRAFFIC: 'eullon_saas_traffic_elite_v1',
};

// Dados Iniciais de Tráfego / Cliques / Acessos de Clientes na Barbearia
const createInitialTraffic = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  return {
    totalVisits: 32,
    uniqueVisitors: 21,
    todayVisits: 7,
    lastVisitDate: todayStr,
    clicks: {
      bookingStarted: 16,
      bookingCompleted: 9,
      whatsappClicked: 8,
      locationClicked: 6,
    },
    dailyHistory: {
      [todayStr]: { visits: 7, bookingClicks: 4, whatsappClicks: 2 },
    },
    recentLog: [
      {
        id: 'log-1',
        time: 'Hoje às 15:42',
        type: 'visit',
        label: 'Cliente acessou o app da barbearia',
        icon: 'Eye',
      },
      {
        id: 'log-2',
        time: 'Hoje às 15:20',
        type: 'bookingStarted',
        label: 'Cliente abriu a tela de agendamento',
        icon: 'Calendar',
      },
      {
        id: 'log-3',
        time: 'Hoje às 14:48',
        type: 'bookingCompleted',
        label: 'Corte agendado com sucesso via WhatsApp',
        icon: 'CheckCircle2',
      },
      {
        id: 'log-4',
        time: 'Hoje às 14:15',
        type: 'whatsappClicked',
        label: 'Cliente clicou no WhatsApp da barbearia',
        icon: 'MessageCircle',
      }
    ]
  };
};

// Configurações do Desenvolvedor (Eullon)
export const DEVELOPER_CONFIG = {
  name: 'Eullon Silva',
  phone: '5586994471909',
  displayPhone: '(86) 99447-1909',
  pixKey: '89994471909',
  pixKeyType: 'Celular',
  masterPassword: 'Euana0192*',
  firstMonthPrice: 10.00,
  regularPrice: 35.00,
};

// Data inicial: Barbearia Elite com 7 Dias Grátis de Cortesia Liberados
const createInitialLicense = () => {
  const now = new Date();
  const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias de teste grátis

  return {
    id: 'barbearia-elite',
    name: 'Barbearia Elite',
    owner: 'Edivan & Valdivan',
    phone: '5586994727396',
    displayPhone: '(86) 99472-7396',
    status: 'active', // 'active' | 'warning' | 'grace_period' | 'blocked'
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    isTrial: true,
    trialDays: 7,
    isFirstMonth: true,
    firstMonthPrice: 35.00,
    regularPrice: 35.00,
    customPrice: 35.00,
    graceDays: 2, // 2 dias de tolerância
    manualBlock: false,
    promotion: {
      active: true,
      price: 35.00,
      title: '7 Dias Grátis de Cortesia Ativos',
      description: 'Aproveite o aplicativo 100% liberado por 7 dias grátis!',
    },
    systemNotice: {
      enabled: true,
      text: '🎁 Período de Cortesia: Seus 7 dias grátis estão ativos com contagem regressiva ao vivo! Após o término, a mensalidade de manutenção é de apenas R$ 35,00/mês.',
      type: 'promo', // 'info' | 'promo' | 'warning'
      updatedAt: now.toISOString(),
    },
    history: [
      {
        id: 'pay-trial',
        date: now.toISOString(),
        amount: 0.00,
        type: 'Período de Teste Grátis (7 Dias)',
        status: 'Aprovado',
      }
    ]
  };
};

// Lista de todas as barbearias gerenciadas pelo Eullon na Central
const INITIAL_ALL_BARBERSHOPS = [
  {
    id: 'barbearia-elite',
    name: 'Barbearia Elite',
    owner: 'Edivan & Valdivan',
    city: 'Av. Petrônio Portela',
    phone: '5586994727396',
    displayPhone: '(86) 99472-7396',
    status: 'active',
    isFirstMonth: true,
    price: 10.00,
    barberPin: '0192',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    url: 'https://eullon1234-creator.github.io/barbearia-elite/',
    notes: 'Cliente novo. 1º mês por R$ 10,00. Próximos meses R$ 35,00/mês.',
  }
];

export function LicenseProvider({ children }) {
  const [license, setLicense] = useState(() => {
    try {
      const initial = createInitialLicense();
      const saved = localStorage.getItem(STORAGE_KEYS.LICENSE);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = {
          ...initial,
          ...parsed,
          isTrial: true, // Sempre ativo para a Barbearia Elite
          trialDays: parsed.trialDays || 7,
          promotion: {
            ...initial.promotion,
            ...(parsed.promotion || {}),
            active: true,
          },
          systemNotice: {
            ...initial.systemNotice,
            ...(parsed.systemNotice || {}),
            enabled: true,
          }
        };

        const nowMs = Date.now();
        const expiresMs = new Date(merged.expiresAt).getTime();
        // Apenas se a data de expiração for completamente inválida (NaN), inicializa com 7 dias
        if (isNaN(expiresMs)) {
          merged.expiresAt = new Date(nowMs + 7 * 24 * 60 * 60 * 1000).toISOString();
        }
        return merged;
      }
      return initial;
    } catch (e) {
      return createInitialLicense();
    }
  });

  const [allBarbershops, setAllBarbershops] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALL_LICENSES);
      return saved ? JSON.parse(saved) : INITIAL_ALL_BARBERSHOPS;
    } catch (e) {
      return INITIAL_ALL_BARBERSHOPS;
    }
  });

  // Contador de Cliques & Pessoas que entraram no aplicativo da barbearia
  const [trafficData, setTrafficData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRAFFIC);
      return saved ? JSON.parse(saved) : createInitialTraffic();
    } catch (e) {
      return createInitialTraffic();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRAFFIC, JSON.stringify(trafficData));
    } catch (e) {
      console.error(e);
    }
  }, [trafficData]);

  // Ticker reativo a cada 1 segundo para atualizar dias, horas, minutos e segundos ao vivo
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Referência para evitar loop infinito entre onSnapshot e saveLicenseToFirestore
  const isRemoteUpdateRef = useRef(false);

  // Salva alterações localmente e sincroniza com Firestore
  const saveLicenseToFirestore = async (targetLicense) => {
    if (!firestoreDb) return;
    try {
      const safeData = JSON.parse(JSON.stringify(targetLicense, (k, v) => (v === undefined ? null : v)));
      await setDoc(doc(firestoreDb, 'licenses', 'barbearia-elite'), {
        ...safeData,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      if (err?.code !== 'resource-exhausted') {
        console.warn('[Firestore] Erro ao salvar licença:', err.message);
      }
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LICENSE, JSON.stringify(license));
      if (isRemoteUpdateRef.current) {
        // Atualização recebida do Firestore remoto: não salva de volta para evitar loop infinito
        isRemoteUpdateRef.current = false;
        return;
      }
      saveLicenseToFirestore(license);
    } catch (e) {
      console.error(e);
    }
  }, [license]);

  // Listener em tempo real da licença pelo Firestore
  useEffect(() => {
    if (!firestoreDb) return;
    let isMounted = true;
    try {
      const unsub = onSnapshot(doc(firestoreDb, 'licenses', 'barbearia-elite'), (snap) => {
        if (!isMounted) return;
        if (snap.exists()) {
          const cloudData = snap.data();
          isRemoteUpdateRef.current = true;
          setLicense(prev => ({
            ...prev,
            ...cloudData,
            isTrial: true,
            trialDays: cloudData.trialDays || 7,
            promotion: { ...(prev.promotion || {}), ...(cloudData.promotion || {}), active: true },
            systemNotice: { ...(prev.systemNotice || {}), ...(cloudData.systemNotice || {}), enabled: true },
          }));
        }
      }, (err) => {
        if (err?.code !== 'resource-exhausted') {
          console.warn('[Firestore] Licença:', err.message);
        }
      });

      return () => {
        isMounted = false;
        if (typeof unsub === 'function') unsub();
      };
    } catch (e) {
      console.warn(e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ALL_LICENSES, JSON.stringify(allBarbershops));
    } catch (e) {
      console.error(e);
    }
  }, [allBarbershops]);

  // Cálculo dinâmico do status da licença e valor vigente com Dias e Horas
  const getLicenseMetrics = (targetLicense = license) => {
    const now = new Date(currentTime);
    const expiresDate = new Date(targetLicense.expiresAt);
    const diffMs = expiresDate.getTime() - now.getTime();
    
    // Contagem regressiva precisa de dias, horas, minutos e segundos ao vivo
    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const daysRemaining = Math.floor(totalHours / 24);
    const hoursRemaining = totalHours % 24;
    const minutesRemaining = totalMinutes % 60;
    const secondsRemaining = totalSeconds % 60;

    const pad = (n) => String(n).padStart(2, '0');
    const liveTimeStr = `${daysRemaining}d ${pad(hoursRemaining)}h ${pad(minutesRemaining)}m ${pad(secondsRemaining)}s`;

    let status = 'active';
    let label = `Ativa: ${liveTimeStr}`;
    let badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

    if (targetLicense.manualBlock) {
      status = 'blocked';
      label = 'Acesso Bloqueado';
      badgeColor = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    } else if (diffMs <= 0) {
      const daysOverdue = Math.abs(daysRemaining);
      if (daysOverdue <= (targetLicense.graceDays || 2)) {
        status = 'grace_period';
        label = `Vencida (${daysOverdue === 0 ? 'hoje' : daysOverdue + 'd de tolerância'})`;
        badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      } else {
        status = 'blocked';
        label = targetLicense.isTrial ? 'Teste Grátis Finalizado' : 'Bloqueado por Vencimento';
        badgeColor = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      }
    } else if (targetLicense.isTrial) {
      status = daysRemaining <= 2 ? 'warning' : 'active';
      label = `🎁 Teste: ${liveTimeStr}`;
      badgeColor = daysRemaining <= 2 
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
        : 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    } else if (daysRemaining <= 5) {
      status = 'warning';
      label = `⚠️ Vence: ${liveTimeStr}`;
      badgeColor = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    } else {
      label = `Ativa: ${liveTimeStr}`;
    }

    // Determina o valor a ser cobrado do barbeiro após o teste ou mensal
    let currentPrice = DEVELOPER_CONFIG.regularPrice;
    let isPromoApplied = false;

    if (targetLicense.promotion && targetLicense.promotion.active) {
      currentPrice = parseFloat(targetLicense.promotion.price) || 10.00;
      isPromoApplied = true;
    } else if (targetLicense.customPrice !== undefined && targetLicense.customPrice !== null) {
      currentPrice = parseFloat(targetLicense.customPrice);
    } else if (targetLicense.isFirstMonth) {
      currentPrice = targetLicense.firstMonthPrice || DEVELOPER_CONFIG.firstMonthPrice;
    } else {
      currentPrice = targetLicense.regularPrice || DEVELOPER_CONFIG.regularPrice;
    }

    return {
      status,
      label,
      badgeColor,
      daysRemaining,
      hoursRemaining,
      minutesRemaining,
      secondsRemaining,
      totalSecondsRemaining: totalSeconds,
      totalHoursRemaining: totalHours,
      liveTimeStr,
      countdownDetailed: `${daysRemaining} dias, ${pad(hoursRemaining)}h ${pad(minutesRemaining)}m ${pad(secondsRemaining)}s`,
      expiresDateFormatted: expiresDate.toLocaleDateString('pt-BR'),
      currentPrice,
      regularPrice: targetLicense.regularPrice || DEVELOPER_CONFIG.regularPrice,
      isTrial: Boolean(targetLicense.isTrial),
      trialDays: targetLicense.trialDays || 7,
      isFirstMonth: Boolean(targetLicense.isFirstMonth),
      isPromoApplied,
      isBlocked: status === 'blocked',
      isWarning: status === 'warning',
      isGracePeriod: status === 'grace_period',
    };
  };

  // Alterar valor cobrado do barbeiro (específico ou geral)
  const updateBarbershopPrice = (barbershopId, newPrice) => {
    const val = parseFloat(newPrice);
    if (isNaN(val) || val < 0) return false;

    if (barbershopId === 'barbearia-elite' || barbershopId === license.id) {
      setLicense(prev => ({
        ...prev,
        customPrice: val,
      }));
    }

    setAllBarbershops(prev => prev.map(b => {
      if (b.id === barbershopId) {
        return { ...b, price: val };
      }
      return b;
    }));

    return true;
  };

  // Alterar configurações de promoção
  const updatePromotion = ({ active, price, title, description }) => {
    setLicense(prev => {
      const updatedPromo = {
        ...prev.promotion,
        active: active !== undefined ? Boolean(active) : prev.promotion?.active || false,
        price: price !== undefined ? parseFloat(price) : prev.promotion?.price || 10.00,
        title: title !== undefined ? title : prev.promotion?.title || '',
        description: description !== undefined ? description : prev.promotion?.description || '',
      };

      return {
        ...prev,
        promotion: updatedPromo,
      };
    });

    if (active) {
      setAllBarbershops(prev => prev.map(b => {
        if (b.id === 'barbearia-elite') {
          return { ...b, price: parseFloat(price) || b.price };
        }
        return b;
      }));
    }
  };

  // Atualizar mensagem/comunicado do Eullon para o barbeiro
  const updateSystemNotice = ({ enabled, text, type }) => {
    setLicense(prev => ({
      ...prev,
      systemNotice: {
        enabled: enabled !== undefined ? Boolean(enabled) : prev.systemNotice?.enabled || false,
        text: text !== undefined ? text : prev.systemNotice?.text || '',
        type: type || prev.systemNotice?.type || 'info',
        updatedAt: new Date().toISOString(),
      }
    }));
  };

  // Liberar período de teste grátis (ex: 7 dias) com valor posterior de R$ 35,00/mês
  const startFreeTrial = (barbershopId = 'barbearia-elite', days = 7) => {
    const now = new Date();
    const newExpires = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    if (barbershopId === 'barbearia-elite' || barbershopId === license.id) {
      setLicense(prev => ({
        ...prev,
        isTrial: true,
        trialDays: days,
        isFirstMonth: false,
        expiresAt: newExpires.toISOString(),
        manualBlock: false,
        status: 'active',
        regularPrice: 35.00,
        customPrice: 35.00,
        systemNotice: {
          enabled: true,
          type: 'promo',
          text: `🎁 Teste Grátis de ${days} Dias Ativo! Aproveite para cadastrar seus serviços, fotos e horários. Após os ${days} dias de teste, a mensalidade para manter seu app online será de R$ 35,00/mês.`,
          updatedAt: now.toISOString(),
        },
        history: [
          {
            id: 'trial-' + Date.now(),
            date: now.toISOString(),
            amount: 0.00,
            type: `Ativação de Teste Grátis (${days} Dias)`,
            status: 'Cortesia',
          },
          ...(prev.history || [])
        ]
      }));
    }

    setAllBarbershops(prev => prev.map(b => {
      if (b.id === barbershopId) {
        return {
          ...b,
          isTrial: true,
          price: 35.00,
          expiresAt: newExpires.toISOString(),
          status: 'active',
          notes: `Teste Grátis de ${days} dias ativo. Próxima fatura: R$ 35,00.`,
        };
      }
      return b;
    }));
  };

  // Renova a licença com X dias (ex: +30 dias)
  const renewLicense = (barbershopId = 'barbearia-elite', daysToAdd = 30, amount = null) => {
    const now = new Date();
    
    // Atualiza licença local do app
    if (barbershopId === 'barbearia-elite' || barbershopId === license.id) {
      setLicense(prev => {
        const baseDate = new Date(prev.expiresAt) > now ? new Date(prev.expiresAt) : now;
        const newExpires = new Date(baseDate);
        newExpires.setDate(baseDate.getDate() + daysToAdd);

        const currentMetrics = getLicenseMetrics(prev);
        const paidAmount = amount !== null ? amount : currentMetrics.currentPrice;

        return {
          ...prev,
          expiresAt: newExpires.toISOString(),
          isTrial: false,
          isFirstMonth: false,
          manualBlock: false,
          status: 'active',
          history: [
            {
              id: 'pay-' + Date.now(),
              date: now.toISOString(),
              amount: paidAmount,
              type: `Renovação (+${daysToAdd} dias)`,
              status: 'Aprovado',
            },
            ...(prev.history || [])
          ]
        };
      });
    }

    // Atualiza na lista de todas as barbearias
    setAllBarbershops(prev => prev.map(b => {
      if (b.id === barbershopId) {
        const baseDate = new Date(b.expiresAt) > now ? new Date(b.expiresAt) : now;
        const newExpires = new Date(baseDate);
        newExpires.setDate(baseDate.getDate() + daysToAdd);
        return {
          ...b,
          expiresAt: newExpires.toISOString(),
          status: 'active',
          isTrial: false,
          isFirstMonth: false,
        };
      }
      return b;
    }));
  };

  // Bloquear ou Desbloquear manualmente uma barbearia
  const toggleBlockBarbershop = (barbershopId) => {
    if (barbershopId === 'barbearia-elite' || barbershopId === license.id) {
      setLicense(prev => ({
        ...prev,
        manualBlock: !prev.manualBlock
      }));
    }

    setAllBarbershops(prev => prev.map(b => {
      if (b.id === barbershopId) {
        const nextStatus = b.status === 'blocked' ? 'active' : 'blocked';
        return { ...b, status: nextStatus };
      }
      return b;
    }));
  };

  // Mensagem pré-formatada para enviar comprovante via WhatsApp para o Eullon
  const getProofWhatsAppUrl = (customAmount = null) => {
    const metrics = getLicenseMetrics();
    const amount = customAmount || metrics.currentPrice;
    let planType = 'Mensalidade do Aplicativo';
    if (license.isTrial) {
      planType = 'Assinatura após Teste Grátis';
    } else if (license.promotion?.active) {
      planType = `Promoção Especial (${license.promotion.title})`;
    } else if (license.isFirstMonth) {
      planType = '1º Mês Promocional';
    }

    const text = `💈 *COMPROVANTE DE PAGAMENTO — APP ${license.name.toUpperCase()}*\n\n` +
      `Olá Eullon! Acabei de fazer o Pix da assinatura do meu aplicativo:\n` +
      `• *Barbearia:* ${license.name}\n` +
      `• *Responsável:* ${license.owner}\n` +
      `• *Plano:* ${planType} (R$ ${amount.toFixed(2).replace('.', ',')})\n` +
      `• *Data:* ${new Date().toLocaleDateString('pt-BR')}\n\n` +
      `Estou enviando o print do comprovante em anexo. Pode liberar meus +30 dias de acesso? Obrigado!`;

    const encoded = encodeURIComponent(text);
    return `https://wa.me/${DEVELOPER_CONFIG.phone}?text=${encoded}`;
  };

  // Cobrança amigável que o Eullon envia para o barbeiro quando estiver perto de vencer
  const getReminderWhatsAppUrl = (barbershop) => {
    const text = `Fala ${barbershop.owner}! Tudo bem?\n\n` +
      `Passando para avisar que a mensalidade do seu aplicativo da *${barbershop.name}* está próxima do vencimento (${new Date(barbershop.expiresAt).toLocaleDateString('pt-BR')}).\n\n` +
      `Para renovar e manter o aplicativo e os agendamentos online dos seus clientes 100% ativos:\n` +
      `🔑 *Chave Pix (Celular):* ${DEVELOPER_CONFIG.pixKey}\n` +
      `👤 *Favorecido:* ${DEVELOPER_CONFIG.name}\n` +
      `💰 *Valor:* R$ ${parseFloat(barbershop.price).toFixed(2).replace('.', ',')}\n\n` +
      `Assim que fizer o Pix é só me mandar o comprovante aqui que já renovo seu acesso imediatamente! 💈🚀`;

    const cleanPhone = barbershop.phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
  };

  // Registro de Visitas e Pessoas que entraram no aplicativo da barbearia
  const recordVisit = () => {
    try {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

      const isNewSession = !sessionStorage.getItem('elite_visited_session');
      if (isNewSession) {
        sessionStorage.setItem('elite_visited_session', 'true');
      }

      setTrafficData(prev => {
        const isSameDay = prev.lastVisitDate === todayStr;
        const currentTodayVisits = isSameDay ? (prev.todayVisits || 0) : 0;
        const prevDayHistory = prev.dailyHistory?.[todayStr] || { visits: 0, bookingClicks: 0, whatsappClicks: 0 };

        const newLog = {
          id: 'log-' + Date.now(),
          time: `Hoje às ${timeStr}`,
          type: 'visit',
          label: isNewSession ? 'Novo visitante entrou no app' : 'Visitante retornou ao app',
          icon: 'Eye',
        };

        return {
          ...prev,
          totalVisits: (prev.totalVisits || 0) + 1,
          uniqueVisitors: isNewSession ? (prev.uniqueVisitors || 0) + 1 : (prev.uniqueVisitors || 0),
          todayVisits: currentTodayVisits + 1,
          lastVisitDate: todayStr,
          dailyHistory: {
            ...prev.dailyHistory,
            [todayStr]: {
              ...prevDayHistory,
              visits: (prevDayHistory.visits || 0) + 1,
            }
          },
          recentLog: [newLog, ...(prev.recentLog || [])].slice(0, 50),
        };
      });
    } catch (e) {
      console.error('Erro ao registrar visita:', e);
    }
  };

  // Registro de Cliques e Ações Importantes (Agendamento, WhatsApp, etc.)
  const recordClick = (actionType, label = '') => {
    try {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

      setTrafficData(prev => {
        const prevClicks = prev.clicks || {};
        const prevDayHistory = prev.dailyHistory?.[todayStr] || { visits: 0, bookingClicks: 0, whatsappClicks: 0 };

        let updatedDayHistory = { ...prevDayHistory };
        if (actionType === 'bookingStarted' || actionType === 'bookingCompleted') {
          updatedDayHistory.bookingClicks = (updatedDayHistory.bookingClicks || 0) + 1;
        } else if (actionType === 'whatsappClicked') {
          updatedDayHistory.whatsappClicks = (updatedDayHistory.whatsappClicks || 0) + 1;
        }

        const newLog = {
          id: 'log-' + Date.now(),
          time: `Hoje às ${timeStr}`,
          type: actionType,
          label: label || `Ação: ${actionType}`,
          icon: actionType.includes('booking') ? 'Calendar' : actionType.includes('whatsapp') ? 'MessageCircle' : 'MousePointerClick',
        };

        return {
          ...prev,
          clicks: {
            ...prevClicks,
            [actionType]: (prevClicks[actionType] || 0) + 1,
          },
          dailyHistory: {
            ...prev.dailyHistory,
            [todayStr]: updatedDayHistory,
          },
          recentLog: [newLog, ...(prev.recentLog || [])].slice(0, 50),
        };
      });
    } catch (e) {
      console.error('Erro ao registrar clique:', e);
    }
  };

  const simulateVisit = () => {
    recordVisit();
  };

  const resetTrafficStats = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const cleared = {
      totalVisits: 0,
      uniqueVisitors: 0,
      todayVisits: 0,
      lastVisitDate: todayStr,
      clicks: {
        bookingStarted: 0,
        bookingCompleted: 0,
        whatsappClicked: 0,
        locationClicked: 0,
      },
      dailyHistory: {
        [todayStr]: { visits: 0, bookingClicks: 0, whatsappClicks: 0 },
      },
      recentLog: [],
    };
    setTrafficData(cleared);
    try {
      localStorage.setItem(STORAGE_KEYS.TRAFFIC, JSON.stringify(cleared));
    } catch (e) {}
  };

  return (
    <LicenseContext.Provider
      value={{
        license,
        allBarbershops,
        developerConfig: DEVELOPER_CONFIG,
        getLicenseMetrics,
        updateBarbershopPrice,
        updatePromotion,
        updateSystemNotice,
        startFreeTrial,
        renewLicense,
        toggleBlockBarbershop,
        getProofWhatsAppUrl,
        getReminderWhatsAppUrl,
        trafficData,
        recordVisit,
        recordClick,
        simulateVisit,
        resetTrafficStats,
      }}
    >
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense deve ser usado dentro de um LicenseProvider');
  }
  return context;
}
