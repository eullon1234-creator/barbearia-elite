/**
 * Utilitários para formatação e links seguros de WhatsApp
 */

export function getCleanWhatsAppNumber(rawPhone) {
  if (!rawPhone) return '5599991220211';
  let clean = String(rawPhone).replace(/\D/g, '');
  if (clean.length === 10 || clean.length === 11) {
    clean = '55' + clean;
  }
  return clean || '5599991220211';
}

export function getWhatsAppUrl(rawPhone, message = '') {
  const cleanNumber = getCleanWhatsAppNumber(rawPhone);
  const encoded = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${cleanNumber}${encoded}`;
}
