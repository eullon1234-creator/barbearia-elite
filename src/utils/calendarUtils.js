/**
 * Utilitários para geração de lembretes em calendários (Google Agenda e Apple/Samsung .ics)
 */

function getDefaultDateStr() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formata data e hora para o padrão ISO básico exigido por calendários (YYYYMMDDTHHmmSS)
 */
function formatCalendarDateTime(dateStr, timeStr) {
  const cleanDate = (dateStr || getDefaultDateStr()).replace(/-/g, '');
  const cleanTime = (timeStr || '14:00').replace(/:/g, '') + '00';
  return `${cleanDate}T${cleanTime}`;
}

function calculateEndDateTime(dateStr, timeStr, durationMinutes = 35) {
  const [year, month, day] = (dateStr || getDefaultDateStr()).split('-').map(Number);
  const [hours, minutes] = (timeStr || '14:00').split(':').map(Number);

  const startDate = new Date(year, month - 1, day, hours, minutes);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  const pad = (n) => String(n).padStart(2, '0');
  const endYear = endDate.getFullYear();
  const endMonth = pad(endDate.getMonth() + 1);
  const endDay = pad(endDate.getDate());
  const endHours = pad(endDate.getHours());
  const endMins = pad(endDate.getMinutes());

  return `${endYear}${endMonth}${endDay}T${endHours}${endMins}00`;
}

/**
 * Gera URL oficial do Google Agenda com lembrete
 */
export function getGoogleCalendarUrl({
  title = 'Corte na Barbearia Elite',
  description = 'Agendamento confirmado na Barbearia Elite.',
  location = 'Av. Petrônio Portela, Amarante - PI',
  date = getDefaultDateStr(),
  time = '14:00',
  durationMinutes = 35
}) {
  const startStr = formatCalendarDateTime(date, time);
  const endStr = calculateEndDateTime(date, time, durationMinutes);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startStr}/${endStr}`,
    details: description,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Faz o download do arquivo iCalendar (.ics) compatível com Apple Calendar, iPhone e Outlook
 */
export function downloadIcsFile({
  title = 'Corte na Barbearia Elite',
  description = 'Agendamento confirmado na Barbearia Elite.',
  location = 'Av. Petrônio Portela, Amarante - PI',
  date = getDefaultDateStr(),
  time = '14:00',
  durationMinutes = 35
}) {
  const startStr = formatCalendarDateTime(date, time);
  const endStr = calculateEndDateTime(date, time, durationMinutes);
  const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Barbearia Elite//Agendamentos//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:apt-${Date.now()}@barbeariaelite.com`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT60M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Lembrete de agendamento na Barbearia Elite',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `agendamento_barbearia_${date}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
