import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, Check, RotateCw, ZoomIn, ZoomOut, Move, Eye, 
  Sparkles, Loader2, Maximize2, Scissors, User, Image as ImageIcon,
  Square, RectangleHorizontal, RefreshCw
} from 'lucide-react';

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  title = 'Ajustar & Recortar Foto',
  cropType = 'service', // 'avatar' | 'service' | 'cover' | 'gallery' | 'logo'
  onClose,
  onCropConfirm,
  isUploading = false,
  themeColor = '#D4AF37'
}) {
  // Proporções padrão de acordo com o tipo
  const defaultAspect = cropType === 'avatar' || cropType === 'logo'
    ? '1:1'
    : cropType === 'cover'
    ? '16:9'
    : '4:3'; // service ou gallery

  const [aspectRatio, setAspectRatio] = useState(defaultAspect);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [previewDataUrl, setPreviewDataUrl] = useState('');
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'

  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Calcula proporção numérica
  const getNumericAspect = useCallback((ratio) => {
    switch (ratio) {
      case '1:1': return 1;
      case '4:3': return 4 / 3;
      case '16:9': return 16 / 9;
      case '3:4': return 3 / 4;
      default: return 4 / 3;
    }
  }, []);

  // Reseta transformações ao trocar de imagem ou proporção
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Suporte a Mouse Drag
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Suporte a Touch Drag no Celular
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Roda 90 graus
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Gera o corte em Canvas e retorna Blob
  const generateCroppedBlob = useCallback(async () => {
    if (!imageSrc) return null;
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (!imageSrc.startsWith('data:') && !imageSrc.startsWith('blob:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const targetAspect = getNumericAspect(aspectRatio);

        // Resoluções de saída de alta qualidade
        let outputWidth = 1000;
        let outputHeight = Math.round(1000 / targetAspect);

        if (aspectRatio === '1:1') {
          outputWidth = 800;
          outputHeight = 800;
        } else if (aspectRatio === '16:9') {
          outputWidth = 1280;
          outputHeight = 720;
        }

        canvas.width = outputWidth;
        canvas.height = outputHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Falha ao inicializar contexto Canvas.'));
          return;
        }

        // Fundo escuro limpo caso haja transparência
        ctx.fillStyle = '#080808';
        ctx.fillRect(0, 0, outputWidth, outputHeight);

        ctx.save();
        // Centraliza
        ctx.translate(outputWidth / 2, outputHeight / 2);
        ctx.rotate((rotation * Math.PI) / 180);

        // Fator de escala do editor para a resolução de saída
        const containerWidth = 280; // largura de referência do recorte no modal
        const scaleFactor = outputWidth / containerWidth;

        ctx.translate(position.x * scaleFactor, position.y * scaleFactor);
        ctx.scale(zoom, zoom);

        // Desenha imagem centralizada
        // Escala básica para preencher a janela
        const imgRatio = img.width / img.height;
        let drawWidth, drawHeight;
        if (imgRatio > targetAspect) {
          drawHeight = outputHeight;
          drawWidth = outputHeight * imgRatio;
        } else {
          drawWidth = outputWidth;
          drawHeight = outputWidth / imgRatio;
        }

        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        ctx.restore();

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Erro ao exportar imagem recortada.'));
            }
          },
          'image/jpeg',
          0.92
        );
      };
      img.onerror = () => reject(new Error('Erro ao carregar imagem para recorte.'));
      img.src = imageSrc;
    });
  }, [imageSrc, aspectRatio, rotation, zoom, position, getNumericAspect]);

  // Atualiza preview em tempo real
  useEffect(() => {
    if (!isOpen || !imageSrc) return;
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const blob = await generateCroppedBlob();
        if (active && blob) {
          const url = URL.createObjectURL(blob);
          setPreviewDataUrl(url);
        }
      } catch (e) {
        // Ignora erros temporários enquanto arrasta
      }
    }, 150);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isOpen, imageSrc, generateCroppedBlob]);

  // Reseta controles quando o modal abrir com nova foto
  useEffect(() => {
    if (isOpen) {
      setAspectRatio(defaultAspect);
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setActiveTab('editor');
    }
  }, [isOpen, defaultAspect, imageSrc]);

  // Confirma e envia cortado
  const handleConfirm = async () => {
    try {
      const croppedBlob = await generateCroppedBlob();
      const croppedFile = new File([croppedBlob], `crop_${Date.now()}.jpg`, { type: 'image/jpeg' });
      await onCropConfirm(croppedFile);
    } catch (err) {
      alert('Erro ao processar o recorte: ' + err.message);
    }
  };

  // Confirma e envia A IMAGEM INTEIRA ORIGINAL sem cortar
  const handleConfirmOriginal = async () => {
    try {
      let fullFile;
      if (imageSrc.startsWith('data:')) {
        const arr = imageSrc.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        fullFile = new File([blob], `full_${Date.now()}.jpg`, { type: mime });
      } else {
        const res = await fetch(imageSrc);
        const blob = await res.blob();
        fullFile = new File([blob], `full_${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' });
      }
      await onCropConfirm(fullFile);
    } catch (err) {
      alert('Erro ao processar a foto inteira: ' + err.message);
    }
  };

  const targetAspect = getNumericAspect(aspectRatio);

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-dark-900 border border-dark-750 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* Header do Modal */}
        <div className="p-3.5 px-4 border-b border-dark-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg theme-bg-accent-subtle theme-text-accent">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{title}</h3>
              <p className="text-[10px] text-neutral-400">Arraste para posicionar e use o zoom</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-xl hover:bg-dark-800 text-neutral-400 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Abas: Editor vs Como o Cliente Vê */}
        <div className="px-4 pt-3 flex gap-2 border-b border-dark-800">
          <button
            onClick={() => setActiveTab('editor')}
            className={`pb-2 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'editor'
                ? 'theme-text-accent border-current'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            <Move className="w-3.5 h-3.5" />
            <span>Recortar & Ajustar</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`pb-2 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'theme-text-accent border-current'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Como o Cliente Vê</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full theme-gradient-accent text-dark-950 font-black">
              Ao Vivo
            </span>
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'editor' ? (
            <>
              {/* Área de Visualização do Recorte */}
              <div 
                ref={containerRef}
                className="relative w-full aspect-square max-h-[300px] rounded-2xl bg-dark-950 border border-dark-800 overflow-hidden flex items-center justify-center select-none touch-none cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Imagem em Transformação */}
                <div 
                  className="absolute pointer-events-none transition-transform duration-75 ease-out"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  }}
                >
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt="Corte em edição"
                    className="max-w-none w-[280px] h-auto object-contain pointer-events-none"
                    draggable={false}
                  />
                </div>

                {/* Máscara de Recorte Visual */}
                <div 
                  className={`pointer-events-none absolute border-2 border-dashed shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] transition-all ${
                    cropType === 'avatar' && aspectRatio === '1:1'
                      ? 'rounded-full border-amber-400'
                      : 'rounded-xl border-amber-400'
                  }`}
                  style={{
                    width: '260px',
                    height: `${Math.round(260 / targetAspect)}px`,
                  }}
                >
                  {/* Grid de Terços Guia */}
                  <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-30">
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-r border-white" />
                    <div className="border-r border-white" />
                    <div />
                  </div>
                </div>

                {/* Dica de Toque */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-dark-950/80 backdrop-blur-sm border border-dark-800 text-[10px] text-neutral-400 pointer-events-none flex items-center gap-1">
                  <Move className="w-3 h-3 theme-text-accent" />
                  <span>Arraste para enquadrar</span>
                </div>
              </div>

              {/* Controles de Ajuste: Zoom, Rotação e Proporção */}
              <div className="space-y-3 bg-dark-850 p-3 rounded-2xl border border-dark-750">
                {/* Slider de Zoom */}
                <div className="flex items-center gap-2">
                  <ZoomOut className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 h-1.5 bg-dark-700 rounded-lg cursor-pointer"
                  />
                  <ZoomIn className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="text-[11px] font-mono text-neutral-300 w-10 text-right">
                    {zoom.toFixed(1)}x
                  </span>
                </div>

                {/* Botões de Ação de Edição */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-dark-750">
                  {/* Seletor de Formato */}
                  <div className="flex items-center gap-1 bg-dark-900 p-1 rounded-xl border border-dark-750 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setAspectRatio('1:1')}
                      className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                        aspectRatio === '1:1' ? 'theme-gradient-accent text-dark-950' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Square className="w-3 h-3" />
                      <span>1:1</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAspectRatio('4:3')}
                      className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                        aspectRatio === '4:3' ? 'theme-gradient-accent text-dark-950' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <RectangleHorizontal className="w-3 h-3" />
                      <span>4:3</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAspectRatio('16:9')}
                      className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                        aspectRatio === '16:9' ? 'theme-gradient-accent text-dark-950' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>16:9</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleRotate}
                      className="px-2.5 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-neutral-300 hover:text-white border border-dark-700 flex items-center gap-1 text-xs font-bold transition-all cursor-pointer"
                      title="Girar 90 graus"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Girar</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-2.5 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-neutral-400 hover:text-white border border-dark-700 flex items-center gap-1 text-xs font-bold transition-all cursor-pointer"
                      title="Resetar enquadramento"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Resetar</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* =========================================================================
               ABA 2: MOCKUP REAL - COMO VAI APARECER NO APP
            ========================================================================= */
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-dark-850 border border-dark-750 text-center">
                <span className="text-[10px] text-neutral-400 uppercase font-extrabold tracking-wider block mb-2">
                  Pré-visualização da Moldura no Aplicativo
                </span>

                {/* Mockup 1: Se for Perfil / Avatar */}
                {cropType === 'avatar' && (
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="w-24 h-24 rounded-full p-1 theme-gradient-accent theme-shadow-glow relative mb-2">
                      <img
                        src={previewDataUrl || imageSrc}
                        alt="Preview Perfil"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <h4 className="text-sm font-extrabold text-white">Saymon Andrade</h4>
                    <p className="text-[11px] theme-text-accent font-medium">Barbeiro Especialista</p>
                  </div>
                )}

                {/* Mockup 2: Se for Corte / Serviço */}
                {cropType === 'service' && (
                  <div className="max-w-[260px] mx-auto rounded-2xl bg-dark-900 border border-dark-700 overflow-hidden shadow-lg text-left">
                    <div className="w-full aspect-[4/3] relative bg-dark-950">
                      <img
                        src={previewDataUrl || imageSrc}
                        alt="Preview Corte"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full theme-gradient-accent text-dark-950 font-black text-[10px]">
                        Mais Pedido
                      </span>
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs font-extrabold text-white">Degradê Navalhado</h4>
                      <p className="text-[10px] text-neutral-400">30 min • Acabamento perfeito</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-dark-800">
                        <span className="text-xs font-black theme-text-accent">R$ 30,00</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-dark-800 text-neutral-300">
                          Agendar
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mockup 3: Se for Capa / Hero */}
                {cropType === 'cover' && (
                  <div className="w-full rounded-2xl overflow-hidden border border-dark-700 relative bg-dark-950 aspect-[16/9] shadow-lg">
                    <img
                      src={previewDataUrl || imageSrc}
                      alt="Preview Capa"
                      className="w-full h-full object-cover opacity-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent flex flex-col justify-end p-3 text-left">
                      <span className="text-[9px] theme-text-accent font-black uppercase">Barbearia Andrade</span>
                      <h4 className="text-xs font-black text-white">Tradição & Estilo</h4>
                    </div>
                  </div>
                )}

                {/* Mockup 4: Galeria do Salão */}
                {cropType === 'gallery' && (
                  <div className="w-full rounded-2xl overflow-hidden border border-dark-700 relative bg-dark-950 aspect-[4/3] shadow-lg">
                    <img
                      src={previewDataUrl || imageSrc}
                      alt="Preview Galeria"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Botões de Ação */}
        <div className="p-3.5 px-4 border-t border-dark-800 flex flex-wrap items-center justify-between gap-2 bg-dark-900">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-3.5 py-2 rounded-xl bg-dark-800 hover:bg-dark-750 text-neutral-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleConfirmOriginal}
              disabled={isUploading}
              className="px-3.5 py-2 rounded-xl bg-dark-850 hover:bg-dark-800 border border-dark-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
              title="Usar foto original inteira sem cortar"
            >
              <Maximize2 className="w-3.5 h-3.5 theme-text-accent" />
              <span>Usar Foto Inteira</span>
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl theme-gradient-accent text-dark-950 text-xs font-black flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin stroke-[3]" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Cortar Foto</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
