// Serviço de Upload direto para o Cloudinary (Barbearia Elite)
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'eizvqbb2',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '653796158235247',
  apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET || 't70u_v0uNUuTG2NoYJDzVAtrz2g',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
};

/**
 * Gera a assinatura SHA-1 exigida pela API do Cloudinary
 */
async function generateSha1Signature(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Faz o upload de um arquivo de imagem diretamente para o Cloudinary
 * @param {File|Blob|string} file - Arquivo ou base64 de imagem vindo do input file ou câmera
 * @returns {Promise<string>} - URL segura (HTTPS) da imagem gerada pelo Cloudinary
 */
export async function uploadImageToCloudinary(file) {
  if (!file) {
    throw new Error('Nenhum arquivo fornecido para upload.');
  }

  const formData = new FormData();
  formData.append('file', file);

  // Se tiver a chave secreta e API Key configuradas, realiza o upload assinado instantâneo
  if (CLOUDINARY_CONFIG.apiKey && CLOUDINARY_CONFIG.apiSecret) {
    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `timestamp=${timestamp}${CLOUDINARY_CONFIG.apiSecret}`;
    const signature = await generateSha1Signature(toSign);

    formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);
  } else if (CLOUDINARY_CONFIG.uploadPreset) {
    // Fallback caso use preset unsigned
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  } else {
    throw new Error('Configuração do Cloudinary incompleta.');
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Falha ao enviar imagem para o Cloudinary.');
  }

  const data = await response.json();
  return data.secure_url;
}
