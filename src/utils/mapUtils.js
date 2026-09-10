/**
 * Retorna a URL segura de incorporação (embed) do Google Maps
 * Prioriza latitude e longitude exatas capturadas pelo GPS
 */
export function getMapEmbedUrl(profile) {
  if (!profile) return 'https://maps.google.com/maps?q=Barbearia&t=&z=15&ie=UTF8&iwloc=&output=embed';

  // 1. Se possuir coordenadas numéricas salvas de GPS
  if (profile.lat && profile.lng) {
    return `https://maps.google.com/maps?q=${profile.lat},${profile.lng}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }

  // 2. Se a mapsUrl contiver coordenadas explícitas ?q=lat,lng
  if (profile.mapsUrl) {
    const qMatch = profile.mapsUrl.match(/[?&]q=([-0-9.,]+)/);
    if (qMatch && qMatch[1] && /^-?\d+(\.\d+)?[, ]+-?\d+(\.\d+)?$/.test(qMatch[1].trim())) {
      return `https://maps.google.com/maps?q=${qMatch[1].trim()}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    }

    const atMatch = profile.mapsUrl.match(/@([-0-9.]+),([-0-9.]+)/);
    if (atMatch && atMatch[1] && atMatch[2]) {
      return `https://maps.google.com/maps?q=${atMatch[1]},${atMatch[2]}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    }
  }

  // 3. Consulta por endereço textual
  const query = [profile.address, profile.cityState].filter(Boolean).join(', ') || 'Barbearia';
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}
