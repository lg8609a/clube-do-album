/**
 * Processa um arquivo de imagem enviado pelo usuário (PNG, JPG, WEBP),
 * recortando proporcionalmente em formato quadrado centralizado e redimensionando
 * para um tamanho otimizado (ex: 256x256) em base64.
 */
export function processImageFile(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('O arquivo selecionado não é uma imagem válida.'));
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      reject(new Error('A imagem deve ter no máximo 12MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const width = img.width;
          const height = img.height;

          // Recorte quadrado pelo centro
          const size = Math.min(width, height);
          const startX = (width - size) / 2;
          const startY = (height - size) / 2;

          const targetSize = Math.min(size, maxSize);
          canvas.width = targetSize;
          canvas.height = targetSize;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(img, startX, startY, size, size, 0, 0, targetSize, targetSize);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        } catch {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('Não foi possível ler a imagem selecionada.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Falha ao abrir arquivo do computador.'));
    reader.readAsDataURL(file);
  });
}
