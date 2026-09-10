// Serviço de Upload direto para o Cloudinary (Barbearia Elite)
export const CLOUDINARY_CONFIG = {
  cloudName: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME) || 'eizvqbb2',
  apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDINARY_API_KEY) || '653796158235247',
  apiSecret: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDINARY_API_SECRET) || 't70u_v0uNUuTG2NoYJDzVAtrz2g',
  uploadPreset: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDINARY_UPLOAD_PRESET) || '',
};

/**
 * Implementação pura de SHA-1 em JavaScript que funciona em 100% dos navegadores,
 * celulares (Android/iOS) e ambientes sem crypto.subtle ou sem HTTPS local.
 */
function computeSha1(str) {
  function utf8Encode(string) {
    string = string.replace(/\r\n/g, '\n');
    let utftext = '';
    for (let n = 0; n < string.length; n++) {
      const c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  }

  function rotateLeft(n, s) {
    return (n << s) | (n >>> (32 - s));
  }

  function cvtHex(val) {
    let str = '';
    for (let i = 7; i >= 0; i--) {
      const v = (val >>> (i * 4)) & 0x0f;
      str += v.toString(16);
    }
    return str;
  }

  str = utf8Encode(str);
  const nblk = ((str.length + 8) >> 6) + 1;
  const blks = new Array(nblk * 16).fill(0);

  for (let i = 0; i < str.length; i++) {
    blks[i >> 2] |= str.charCodeAt(i) << (24 - (i % 4) * 8);
  }
  blks[str.length >> 2] |= 0x80 << (24 - (str.length % 4) * 8);
  blks[nblk * 16 - 1] = str.length * 8;

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  for (let i = 0; i < blks.length; i += 16) {
    const w = new Array(80);
    for (let t = 0; t < 16; t++) w[t] = blks[i + t];
    for (let t = 16; t < 80; t++) {
      w[t] = rotateLeft(w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16], 1);
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4;

    for (let t = 0; t < 80; t++) {
      let f, k;
      if (t < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (t < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (t < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }

      const temp = (rotateLeft(a, 5) + f + e + k + w[t]) | 0;
      e = d;
      d = c;
      c = rotateLeft(b, 30);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
  }

  return (cvtHex(h0) + cvtHex(h1) + cvtHex(h2) + cvtHex(h3) + cvtHex(h4)).toLowerCase();
}

/**
 * Converte qualquer arquivo ou Blob para DataURL (Base64) para garantir que o Cloudinary
 * receba a imagem sem erros de mime-type ou de cabeçalhos de arquivo.
 */
async function toDataUrl(file) {
  if (typeof file === 'string') return file;
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(new Error('Erro ao ler arquivo da imagem: ' + err));
      reader.readAsDataURL(file);
    });
  }
  if (file && typeof file.arrayBuffer === 'function') {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    const mime = file.type || 'image/jpeg';
    return `data:${mime};base64,${base64}`;
  }
  return file;
}

/**
 * Faz o upload de um arquivo de imagem diretamente para o Cloudinary
 * @param {File|Blob|string} file - Arquivo, Blob ou Base64 vindo do input file ou câmera
 * @returns {Promise<string>} - URL segura (HTTPS) da imagem gerada pelo Cloudinary
 */
export async function uploadImageToCloudinary(file) {
  if (!file) {
    throw new Error('Nenhum arquivo fornecido para upload.');
  }

  // Converte sempre para DataURL seguro (Base64)
  const fileData = await toDataUrl(file);

  const formData = new FormData();
  formData.append('file', fileData);

  // Assinatura de autenticação Cloudinary
  if (CLOUDINARY_CONFIG.apiKey && CLOUDINARY_CONFIG.apiSecret) {
    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `timestamp=${timestamp}${CLOUDINARY_CONFIG.apiSecret}`;
    const signature = computeSha1(toSign);

    formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);
  } else if (CLOUDINARY_CONFIG.uploadPreset) {
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  } else {
    throw new Error('Credenciais do Cloudinary ausentes.');
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[Cloudinary] Falha na resposta:', data);
      throw new Error(data.error?.message || `Erro ${response.status} ao enviar imagem para o Cloudinary.`);
    }

    if (!data.secure_url) {
      throw new Error('Nenhuma URL retornada pelo Cloudinary.');
    }

    console.log('[Cloudinary] Upload concluído com sucesso:', data.secure_url);
    return data.secure_url;
  } catch (err) {
    console.error('[Cloudinary] Erro no upload:', err);
    throw err;
  }
}
