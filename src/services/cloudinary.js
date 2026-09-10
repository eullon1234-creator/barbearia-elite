// Serviço de Upload direto para o Cloudinary (Unsigned)
export const CLOUDINARY_CONFIG = {
  cloudName: 'dbgxrowf',
  uploadPreset: 'barbearia andrade',
};

/**
 * Faz o upload de um arquivo de imagem diretamente para o Cloudinary
 * @param {File} file - Arquivo de imagem vindo do input file ou câmera
 * @returns {Promise<string>} - URL segura da imagem gerada pelo Cloudinary
 */
export async function uploadImageToCloudinary(file) {
  if (!file) {
    throw new Error('Nenhum arquivo fornecido para upload.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

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
