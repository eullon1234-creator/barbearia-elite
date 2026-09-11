import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, DollarSign, Calendar, Award, 
  Download, Printer, Clock, CheckCircle2, 
  CreditCard, Banknote, QrCode, FileText,
  ChevronLeft, ChevronRight, MessageCircle, Copy, Check,
  ArrowRight, RotateCcw
} from 'lucide-react';
import { useBarber } from '../context/BarberContext';
import { getWhatsAppUrl } from '../utils/phoneUtils';

export default function BarberAnalytics() {
  const { appointments, profile, theme } = useBarber();

  // 'hoje' | 'ontem' | 'dia' | 'semana' | 'mes' | 'todos'
  const [periodFilter, setPeriodFilter] = useState('hoje');

  // Data atual de referência calculada dinamicamente com base no calendário real
  const getTodayStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getYesterdayStr = () => {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCurrentMonthStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const getWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Segunda...
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const pad = (n) => String(n).padStart(2, '0');
    const startStr = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
    const endStr = `${sunday.getFullYear()}-${pad(sunday.getMonth() + 1)}-${pad(sunday.getDate())}`;
    return { startStr, endStr };
  };

  const shiftDateStr = (dateStr, daysOffset) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      date.setDate(date.getDate() + daysOffset);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return getTodayStr();
    }
  };

  const formatLongDayName = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
      const dayMonth = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${dayMonth}`;
    } catch {
      return dateStr;
    }
  };

  const [selectedCustomDate, setSelectedCustomDate] = useState(getTodayStr());
  const [copiedClosure, setCopiedClosure] = useState(false);

  // Determina o dia ativo quando em modo diário
  const activeDayStr = useMemo(() => {
    if (periodFilter === 'hoje') return getTodayStr();
    if (periodFilter === 'ontem') return getYesterdayStr();
    if (periodFilter === 'dia') return selectedCustomDate;
    return null;
  }, [periodFilter, selectedCustomDate]);

  const isDayMode = activeDayStr !== null;

  // Navegação rápida de dias
  const handlePrevDay = () => {
    const current = activeDayStr || getTodayStr();
    const prev = shiftDateStr(current, -1);
    setSelectedCustomDate(prev);
    setPeriodFilter('dia');
  };

  const handleNextDay = () => {
    const current = activeDayStr || getTodayStr();
    const next = shiftDateStr(current, 1);
    setSelectedCustomDate(next);
    setPeriodFilter('dia');
  };

  const handleGoToday = () => {
    setSelectedCustomDate(getTodayStr());
    setPeriodFilter('hoje');
  };

  // Filtra agendamentos baseado no período selecionado dinamicamente
  const filteredAppointments = useMemo(() => {
    const todayStr = getTodayStr();
    const yesterdayStr = getYesterdayStr();
    const currentMonth = getCurrentMonthStr();
    const { startStr: weekStart, endStr: weekEnd } = getWeekRange();

    return (appointments || []).filter(apt => {
      const aptDate = apt.date || todayStr;
      if (periodFilter === 'hoje') {
        return aptDate === todayStr;
      }
      if (periodFilter === 'ontem') {
        return aptDate === yesterdayStr;
      }
      if (periodFilter === 'dia') {
        return aptDate === selectedCustomDate;
      }
      if (periodFilter === 'semana') {
        return aptDate >= weekStart && aptDate <= weekEnd;
      }
      if (periodFilter === 'mes') {
        return aptDate.startsWith(currentMonth);
      }
      return true; // todos
    }).sort((a, b) => {
      if (a.date && b.date && a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return (a.time || '').localeCompare(b.time || '');
    });
  }, [appointments, periodFilter, selectedCustomDate]);

  // Cálculos Financeiros
  const completedList = useMemo(() => {
    return filteredAppointments.filter(a => a.status === 'Concluído');
  }, [filteredAppointments]);

  const futureList = useMemo(() => {
    return filteredAppointments.filter(a => a.status === 'Confirmado' || a.status === 'Em Atendimento');
  }, [filteredAppointments]);

  // 1. Faturamento Realizado (cortes já feitos e pagos)
  const realizedRevenue = useMemo(() => {
    return completedList.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
  }, [completedList]);

  // 2. Previsão de Faturamento Futuro (clientes agendados)
  const forecastRevenue = useMemo(() => {
    return futureList.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
  }, [futureList]);

  // 3. Faturamento Total Projetado (Realizado + Previsto)
  const totalProjectedRevenue = realizedRevenue + forecastRevenue;

  // 4. Ticket Médio
  const averageTicket = completedList.length > 0 
    ? realizedRevenue / completedList.length 
    : 0;

  // 5. Ranking dos Cortes Mais Vendidos
  const serviceStats = useMemo(() => {
    const statsMap = {};

    filteredAppointments.forEach(apt => {
      const svcName = apt.service || 'Corte Padrão';
      const price = parseFloat(apt.price) || 0;

      if (!statsMap[svcName]) {
        statsMap[svcName] = { count: 0, revenue: 0, completedCount: 0 };
      }
      statsMap[svcName].count += 1;
      statsMap[svcName].revenue += price;
      if (apt.status === 'Concluído') {
        statsMap[svcName].completedCount += 1;
      }
    });

    const list = Object.entries(statsMap).map(([name, data]) => ({
      name,
      count: data.count,
      completedCount: data.completedCount,
      revenue: data.revenue,
    }));

    // Ordena do mais vendido para o menos vendido
    return list.sort((a, b) => b.count - a.count);
  }, [filteredAppointments]);

  const topService = serviceStats.length > 0 ? serviceStats[0] : null;

  // 6. Distribuição por Formas de Pagamento (baseado nos concluídos)
  const paymentStats = useMemo(() => {
    let pix = { total: 0, count: 0 };
    let card = { total: 0, count: 0 };
    let cash = { total: 0, count: 0 };

    completedList.forEach(apt => {
      const p = (apt.payment || '').toLowerCase();
      const val = parseFloat(apt.price) || 0;
      if (p.includes('pix')) {
        pix.total += val;
        pix.count += 1;
      } else if (p.includes('cart') || p.includes('crédito') || p.includes('credito') || p.includes('debito') || p.includes('débito')) {
        card.total += val;
        card.count += 1;
      } else {
        cash.total += val;
        cash.count += 1;
      }
    });

    const total = pix.total + card.total + cash.total;
    return {
      pix: { ...pix, percent: total > 0 ? Math.round((pix.total / total) * 100) : 0 },
      card: { ...card, percent: total > 0 ? Math.round((card.total / total) * 100) : 0 },
      cash: { ...cash, percent: total > 0 ? Math.round((cash.total / total) * 100) : 0 },
      total,
    };
  }, [completedList]);

  // 7. Extrato consolidado dia a dia (usado quando visualiza Semana, Mês ou Geral)
  const dailyBreakdown = useMemo(() => {
    if (isDayMode) return [];
    const dayMap = {};

    filteredAppointments.forEach(apt => {
      const d = apt.date || getTodayStr();
      if (!dayMap[d]) {
        dayMap[d] = {
          date: d,
          completedCount: 0,
          pendingCount: 0,
          revenue: 0,
          appointments: []
        };
      }
      dayMap[d].appointments.push(apt);
      if (apt.status === 'Concluído') {
        dayMap[d].completedCount += 1;
        dayMap[d].revenue += (parseFloat(apt.price) || 0);
      } else {
        dayMap[d].pendingCount += 1;
      }
    });

    return Object.values(dayMap).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredAppointments, isDayMode]);

  // 8. Geração do Texto de Fechamento de Caixa para WhatsApp
  const generateClosureText = () => {
    const displayDate = isDayMode 
      ? formatLongDayName(activeDayStr)
      : periodFilter === 'mes' ? 'Mês Atual' : periodFilter === 'semana' ? 'Esta Semana' : 'Histórico Geral';
    
    const rawDate = isDayMode ? activeDayStr.split('-').reverse().join('/') : '';

    let text = `💈 *FECHAMENTO DE CAIXA — ${profile?.name || 'BARBEARIA ELITE'}*\n`;
    text += `📅 *Período:* ${rawDate ? `${rawDate} (${displayDate})` : displayDate}\n`;
    text += `✂️ *Barbeiro:* ${profile?.owner || 'Equipe Elite'}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💰 *FATURAMENTO REALIZADO: R$ ${realizedRevenue.toFixed(2).replace('.', ',')}*\n`;
    text += `✂️ *Cortes Concluídos:* ${completedList.length}\n`;
    if (forecastRevenue > 0) {
      text += `⏳ *Previsão Pendente:* R$ ${forecastRevenue.toFixed(2).replace('.', ',')} (${futureList.length} agendados)\n`;
      text += `💵 *Total Previsto:* R$ ${totalProjectedRevenue.toFixed(2).replace('.', ',')}\n`;
    }
    if (completedList.length > 0) {
      text += `📊 *Ticket Médio:* R$ ${averageTicket.toFixed(2).replace('.', ',')}\n`;
    }
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💳 *FORMAS DE RECEBIMENTO:*\n`;
    text += `• ⚡ *Pix:* R$ ${paymentStats.pix.total.toFixed(2).replace('.', ',')} (${paymentStats.pix.count} cortes)\n`;
    text += `• 💳 *Cartão:* R$ ${paymentStats.card.total.toFixed(2).replace('.', ',')} (${paymentStats.card.count} cortes)\n`;
    text += `• 💵 *Dinheiro:* R$ ${paymentStats.cash.total.toFixed(2).replace('.', ',')} (${paymentStats.cash.count} cortes)\n`;

    if (filteredAppointments.length > 0) {
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `📋 *CLIENTES DO DIA (${filteredAppointments.length}):*\n`;
      filteredAppointments.forEach((apt, idx) => {
        const val = parseFloat(apt.price) || 0;
        text += `${idx + 1}. [${apt.time || '--:--'}] ${apt.client} — ${apt.service} (R$ ${val.toFixed(2).replace('.', ',')}) [${apt.payment || 'Dinheiro'}] - ${apt.status}\n`;
      });
    }

    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `_Relatório emitido via App ${profile?.name || 'Barbearia Elite'}_`;
    return text;
  };

  const handleCopyClosure = () => {
    const text = generateClosureText();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedClosure(true);
      setTimeout(() => setCopiedClosure(false), 2500);
    });
  };

  const handleShareWhatsAppClosure = () => {
    const text = generateClosureText();
    const url = getWhatsAppUrl(profile?.phone, text);
    window.open(url, '_blank');
  };

  // Exportar Relatório em CSV (Excel)
  const handleExportCSV = () => {
    let csv = 'Data,Horario,Cliente,Telefone,Servico,Valor,Pagamento,Status\n';
    filteredAppointments.forEach(a => {
      csv += `"${a.date || getTodayStr()}","${a.time}","${a.client}","${a.phone}","${a.service}","R$ ${parseFloat(a.price).toFixed(2)}","${a.payment}","${a.status}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileSuffix = isDayMode ? activeDayStr : periodFilter;
    link.download = `relatorio_${(profile?.name || 'barbearia').toLowerCase().replace(/\s+/g, '_')}_${fileSuffix}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Imprimir / Baixar Relatório em PDF
  const handlePrintReport = () => {
    const periodLabel = isDayMode 
      ? `Dia ${activeDayStr.split('-').reverse().join('/')} (${formatLongDayName(activeDayStr)})`
      : periodFilter === 'mes' ? 'Mês Atual' : periodFilter === 'semana' ? 'Esta Semana' : 'Histórico Geral';

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fechamento Financeiro - ${profile?.name || 'Barbearia'}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 35px; color: #111; }
            h1 { margin: 0 0 4px 0; color: #111; font-size: 22px; }
            p { margin: 2px 0; color: #555; font-size: 12px; }
            .header { border-bottom: 2px solid #ddd; padding-bottom: 12px; margin-bottom: 20px; }
            .kpis { display: flex; gap: 15px; margin-bottom: 20px; }
            .kpi-card { flex: 1; border: 1px solid #ddd; padding: 12px; border-radius: 8px; background: #fafafa; }
            .kpi-title { font-size: 10px; text-transform: uppercase; color: #666; font-weight: bold; }
            .kpi-value { font-size: 20px; font-weight: bold; color: #111; margin-top: 4px; }
            .payments-summary { background: #f3f4f6; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
            th { background: #111; color: #fff; text-align: left; padding: 7px; font-size: 10px; text-transform: uppercase; }
            td { border-bottom: 1px solid #eee; padding: 7px; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
            .concluido { background: #dcfce7; color: #15803d; }
            .confirmado { background: #fef9c3; color: #854d0e; }
            .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #777; border-top: 1px solid #ddd; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${profile?.name || 'Barbearia Elite'} — Fechamento Financeiro</h1>
            <p><strong>Barbeiros:</strong> ${profile?.owner || 'Edivan & Valdivan'} | <strong>Contato:</strong> ${profile?.phone || ''}</p>
            <p><strong>Período Selecionado:</strong> ${periodLabel} | <strong>Emitido em:</strong> ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          </div>

          <div class="kpis">
            <div class="kpi-card">
              <div class="kpi-title">Faturamento Realizado</div>
              <div class="kpi-value">R$ ${realizedRevenue.toFixed(2).replace('.', ',')}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Cortes Concluídos</div>
              <div class="kpi-value">${completedList.length} cortes</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Previsão Agendada</div>
              <div class="kpi-value">R$ ${forecastRevenue.toFixed(2).replace('.', ',')}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Ticket Médio</div>
              <div class="kpi-value">R$ ${averageTicket.toFixed(2).replace('.', ',')}</div>
            </div>
          </div>

          <div class="payments-summary">
            <strong>Resumo por Forma de Pagamento:</strong> 
            Pix: R$ ${paymentStats.pix.total.toFixed(2).replace('.', ',')} (${paymentStats.pix.count}) | 
            Cartão: R$ ${paymentStats.card.total.toFixed(2).replace('.', ',')} (${paymentStats.card.count}) | 
            Dinheiro: R$ ${paymentStats.cash.total.toFixed(2).replace('.', ',')} (${paymentStats.cash.count})
          </div>

          <h3>Detalhamento dos Clientes</h3>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Telefone</th>
                <th>Serviço</th>
                <th>Valor</th>
                <th>Pagamento</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAppointments.map(a => `
                <tr>
                  <td>${a.date ? a.date.split('-').reverse().join('/') : getTodayStr().split('-').reverse().join('/')}</td>
                  <td>${a.time}</td>
                  <td><strong>${a.client}</strong></td>
                  <td>${a.phone}</td>
                  <td>${a.service}</td>
                  <td>R$ ${parseFloat(a.price).toFixed(2).replace('.', ',')}</td>
                  <td>${a.payment}</td>
                  <td><span class="badge ${a.status === 'Concluído' ? 'concluido' : 'confirmado'}">${a.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Relatório emitido pela ${profile?.name || 'Barbearia Elite'} • Criado por Eullon</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Top Bar de Filtro & Exportações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-dark-800">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 theme-text-accent" />
            <span>Painel Financeiro & Fechamento</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-neutral-400">
            Filtre o faturamento por dia, veja cortes realizados e envie o fechamento no WhatsApp
          </p>
        </div>

        {/* Botões Rápidos PDF & Excel */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={handlePrintReport}
            className="px-2.5 py-1.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-neutral-200 border border-dark-700 flex items-center gap-1 text-[11px] font-bold transition-all cursor-pointer"
            title="Imprimir ou Salvar em PDF"
          >
            <Printer className="w-3.5 h-3.5 theme-text-accent" />
            <span>PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-neutral-200 border border-dark-700 flex items-center gap-1 text-[11px] font-bold transition-all cursor-pointer"
            title="Exportar Planilha Excel CSV"
          >
            <Download className="w-3.5 h-3.5 theme-text-accent" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Seletor de Períodos e Dias (Pills Horizontais) */}
      <div className="bg-dark-900/90 p-1.5 rounded-2xl border border-dark-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-neutral-400 font-semibold px-1">
          <span>Filtrar período:</span>
          {isDayMode && activeDayStr !== getTodayStr() && (
            <button
              onClick={handleGoToday}
              className="text-[10px] theme-text-accent hover:underline flex items-center gap-1 font-bold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Voltar para Hoje</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 text-center">
          {[
            { id: 'hoje', label: 'Hoje' },
            { id: 'ontem', label: 'Ontem' },
            { id: 'dia', label: 'Outro Dia 📅' },
            { id: 'semana', label: 'Esta Semana' },
            { id: 'mes', label: 'Este Mês' },
            { id: 'todos', label: 'Total' },
          ].map((p) => {
            const isActive = periodFilter === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPeriodFilter(p.id)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer truncate ${
                  isActive 
                    ? 'theme-gradient-accent text-dark-950 font-black shadow-md scale-[1.02]' 
                    : 'bg-dark-850 text-neutral-300 hover:text-white hover:bg-dark-800 border border-dark-750'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Barra de Navegação Rápida entre Dias */}
        <div className="pt-1.5 border-t border-dark-800/80 flex flex-wrap items-center justify-between gap-2">
          {/* Navegador < Dia Anterior | Próximo Dia > */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevDay}
              className="px-2.5 py-1.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-neutral-300 hover:text-white border border-dark-700 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Ir para o dia anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Dia Anterior</span>
            </button>

            <button
              onClick={handleNextDay}
              className="px-2.5 py-1.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-neutral-300 hover:text-white border border-dark-700 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Ir para o próximo dia"
            >
              <span className="hidden xs:inline">Próximo Dia</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Input de Data Personalizada */}
          <div className="flex items-center gap-2">
            <label className="text-[10px] uppercase font-bold text-neutral-400">
              Escolher data:
            </label>
            <input
              type="date"
              value={selectedCustomDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedCustomDate(e.target.value);
                  setPeriodFilter('dia');
                }
              }}
              className="px-2.5 py-1 rounded-xl bg-dark-850 text-white border border-dark-700 text-xs font-semibold focus:outline-none focus:border-gold-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Indicador de Data Ativa */}
        {isDayMode && (
          <div className="px-2 py-1.5 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-gold-400 font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>Visualizando: <strong>{formatLongDayName(activeDayStr)}</strong></span>
            </div>
            <span className="text-[10px] text-neutral-400">
              {filteredAppointments.length} agendamento(s)
            </span>
          </div>
        )}
      </div>

      {/* CARD PRINCIPAL: FECHAMENTO DE CAIXA & FATURAMENTO */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card-gradient border border-gold-500/30 relative overflow-hidden shadow-xl theme-shadow-glow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider theme-gradient-accent text-dark-950">
                {isDayMode ? 'Fechamento do Dia' : 'Resumo Financeiro'}
              </span>
              <span className="text-[11px] text-neutral-400">
                {isDayMode 
                  ? activeDayStr.split('-').reverse().join('/') 
                  : periodFilter === 'mes' ? 'Mês Vigente' : periodFilter === 'semana' ? 'Esta Semana' : 'Total'}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              R$ {realizedRevenue.toFixed(2).replace('.', ',')}
              <span className="text-xs sm:text-sm font-semibold text-emerald-400 ml-2">
                Faturamento Realizado
              </span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span><strong>{completedList.length} cortes</strong> concluídos e pagos com sucesso</span>
            </p>
          </div>

          {/* Botões de Ação do Fechamento */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleShareWhatsAppClosure}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-600/30 transition-all cursor-pointer"
              title="Compartilhar Fechamento no WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar no WhatsApp</span>
            </button>

            <button
              onClick={handleCopyClosure}
              className="px-3 py-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-neutral-200 border border-dark-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Copiar texto do fechamento"
            >
              {copiedClosure ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado!</span>
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

        {/* Detalhamento por Formas de Pagamento Recebidas */}
        <div className="pt-3">
          <span className="text-[11px] uppercase font-bold text-neutral-400 block mb-2">
            Valores Recebidos por Forma de Pagamento:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {/* Pix */}
            <div className="p-2.5 rounded-xl bg-dark-900/80 border border-dark-750 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs mb-0.5">
                <QrCode className="w-3.5 h-3.5" />
                <span>Pix</span>
              </div>
              <span className="text-sm sm:text-base font-black text-white">
                R$ {paymentStats.pix.total.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-[10px] text-neutral-400 mt-0.5">
                {paymentStats.pix.count} corte(s) ({paymentStats.pix.percent}%)
              </span>
            </div>

            {/* Cartão */}
            <div className="p-2.5 rounded-xl bg-dark-900/80 border border-dark-750 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 text-blue-400 font-bold text-xs mb-0.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Cartão</span>
              </div>
              <span className="text-sm sm:text-base font-black text-white">
                R$ {paymentStats.card.total.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-[10px] text-neutral-400 mt-0.5">
                {paymentStats.card.count} corte(s) ({paymentStats.card.percent}%)
              </span>
            </div>

            {/* Dinheiro */}
            <div className="p-2.5 rounded-xl bg-dark-900/80 border border-dark-750 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 text-amber-400 font-bold text-xs mb-0.5">
                <Banknote className="w-3.5 h-3.5" />
                <span>Dinheiro</span>
              </div>
              <span className="text-sm sm:text-base font-black text-white">
                R$ {paymentStats.cash.total.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-[10px] text-neutral-400 mt-0.5">
                {paymentStats.cash.count} corte(s) ({paymentStats.cash.percent}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Secundário de Indicadores */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* Previsão Futura */}
        <div className="p-3 rounded-xl bg-dark-900 border border-dark-800">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[10px] uppercase font-bold">Previsão Agendada</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-lg font-black theme-text-accent block">
            R$ {forecastRevenue.toFixed(2).replace('.', ',')}
          </span>
          <span className="text-[10px] text-neutral-500">
            {futureList.length} cortes agendados
          </span>
        </div>

        {/* Total Projetado */}
        <div className="p-3 rounded-xl bg-dark-900 border border-dark-800">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[10px] uppercase font-bold">Total Projetado</span>
            <DollarSign className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-lg font-black text-white block">
            R$ {totalProjectedRevenue.toFixed(2).replace('.', ',')}
          </span>
          <span className="text-[10px] text-neutral-500">
            Realizado + Previsto
          </span>
        </div>

        {/* Ticket Médio */}
        <div className="p-3 rounded-xl bg-dark-900 border border-dark-800 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[10px] uppercase font-bold">Ticket Médio</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-lg font-black text-white block">
            R$ {averageTicket.toFixed(2).replace('.', ',')}
          </span>
          <span className="text-[10px] text-neutral-500">
            Média por atendimento
          </span>
        </div>
      </div>

      {/* EXTRATO DIA A DIA (Aparece quando visualiza Semana, Mês ou Geral) */}
      {!isDayMode && dailyBreakdown.length > 0 && (
        <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 theme-text-accent" />
              <span>Extrato Dia a Dia no Período</span>
            </h3>
            <span className="text-[11px] text-neutral-400">
              {dailyBreakdown.length} dia(s) com movimento
            </span>
          </div>

          <div className="space-y-2">
            {dailyBreakdown.map((item) => {
              const [y, m, d] = item.date.split('-');
              const dayStrFormatted = `${d}/${m}/${y}`;
              const isTodayItem = item.date === getTodayStr();

              return (
                <div
                  key={item.date}
                  className="p-3 rounded-xl bg-dark-850 hover:bg-dark-800/80 border border-dark-750 flex items-center justify-between gap-2 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-dark-900 border border-dark-700 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-black text-white leading-none">{d}</span>
                      <span className="text-[9px] uppercase font-bold text-neutral-400">{m}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">
                          {dayStrFormatted}
                        </span>
                        {isTodayItem && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase theme-gradient-accent text-dark-950">
                            Hoje
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        {item.completedCount} corte(s) concluído(s) • {item.pendingCount} agendado(s)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-400 block">
                        R$ {item.revenue.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-[9px] text-neutral-400">faturado</span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCustomDate(item.date);
                        setPeriodFilter('dia');
                      }}
                      className="p-1.5 rounded-lg bg-dark-800 hover:bg-gold-500/20 text-neutral-300 hover:text-gold-400 border border-dark-700 hover:border-gold-500/30 transition-all cursor-pointer"
                      title="Ver fechamento deste dia"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LISTA DETALHADA DE CLIENTES DO PERÍODO/DIA */}
      <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 theme-text-accent" />
            <span>
              {isDayMode ? 'Clientes Atendidos neste Dia' : 'Lista de Atendimentos no Período'}
            </span>
          </h3>
          <span className="text-[11px] text-neutral-400">
            {filteredAppointments.length} registro(s)
          </span>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="py-8 text-center text-neutral-500 space-y-1">
            <Calendar className="w-8 h-8 mx-auto opacity-30" />
            <p className="text-xs font-semibold">Nenhum atendimento encontrado para este dia/período.</p>
            <p className="text-[10px] text-neutral-600">
              Use as setas acima para navegar entre os dias ou escolha outra data.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredAppointments.map((apt) => {
              const isDone = apt.status === 'Concluído';
              const priceVal = parseFloat(apt.price) || 0;
              const formattedDate = apt.date ? apt.date.split('-').reverse().join('/') : '';

              return (
                <div
                  key={apt.id}
                  className="p-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-dark-750 flex items-center justify-between gap-2 transition-all text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="px-2 py-1 rounded-md bg-dark-900 border border-dark-700 text-center flex-shrink-0">
                      <span className="text-[11px] font-mono font-bold theme-text-accent">
                        {apt.time || '--:--'}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-white truncate">
                          {apt.client}
                        </span>
                        {!isDayMode && formattedDate && (
                          <span className="text-[9px] text-neutral-400 hidden sm:inline">
                            • {formattedDate}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-400 truncate">
                        {apt.service} • <span className="text-neutral-300">{apt.payment || 'Dinheiro'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-extrabold text-white text-xs">
                      R$ {priceVal.toFixed(2).replace('.', ',')}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      isDone 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Destaque: Corte Campeão de Vendas */}
      {topService && (
        <div className="p-3.5 rounded-2xl bg-card-gradient border border-gold-500/30 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl theme-gradient-accent flex items-center justify-center text-dark-950 font-black flex-shrink-0">
              <Award className="w-5 h-5 stroke-[2.5]" />
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-black tracking-wider theme-text-accent block">
                Corte Mais Pedido no Período
              </span>
              <h4 className="text-xs sm:text-sm font-extrabold text-white truncate">
                {topService.name}
              </h4>
              <p className="text-[10px] text-neutral-400">
                Realizado <strong className="text-white">{topService.count} vezes</strong> • Gerou <strong className="theme-text-accent">R$ {topService.revenue.toFixed(2).replace('.', ',')}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ranking de Todos os Serviços */}
      {serviceStats.length > 0 && (
        <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800 space-y-3">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center justify-between">
            <span>Ranking dos Serviços</span>
            <span className="text-[10px] text-neutral-400">Volume e Faturamento</span>
          </h3>

          <div className="space-y-2">
            {serviceStats.map((svc, idx) => {
              const percentage = totalProjectedRevenue > 0 
                ? Math.round((svc.revenue / totalProjectedRevenue) * 100) 
                : 0;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="text-[10px] w-3 text-neutral-500">#{idx + 1}</span>
                      <span>{svc.name}</span>
                    </span>
                    <div className="text-right">
                      <span className="font-extrabold theme-text-accent">
                        R$ {svc.revenue.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-[10px] text-neutral-400 ml-1.5">
                        ({svc.count} cortes)
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-dark-800 overflow-hidden">
                    <div
                      className="h-full theme-gradient-accent rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Botões de Ação Final */}
      <div className="flex gap-2">
        <button
          onClick={handlePrintReport}
          className="flex-1 py-3 px-3 rounded-xl theme-gradient-accent text-dark-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 theme-shadow-glow cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Salvar Relatório</span>
        </button>

        <button
          onClick={handleExportCSV}
          className="py-3 px-4 rounded-xl bg-dark-800 hover:bg-dark-750 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-dark-700 cursor-pointer"
        >
          <FileText className="w-4 h-4 theme-text-accent" />
          <span>Baixar CSV</span>
        </button>
      </div>

    </div>
  );
}
