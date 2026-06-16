import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eraser, Save, RotateCcw, Pen, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  disabled?: boolean;
  savedSignature?: string;
}

export function SignaturePad({ onSave, disabled = false, savedSignature }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showPreview, setShowPreview] = useState(!!savedSignature);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0F4C81';

    if (savedSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, rect.width, rect.height);
        const padding = 20;
        const maxW = rect.width - padding * 2;
        const maxH = rect.height - padding * 2;
        const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
        const w = img.width * ratio;
        const h = img.height * ratio;
        ctx.drawImage(img, (rect.width - w) / 2, (rect.height - h) / 2, w, h);
      };
      img.src = savedSignature;
    }
  }, [savedSignature]);

  useEffect(() => {
    initCanvas();
    const handleResize = () => initCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || showPreview) return;
    e.preventDefault();
    const point = getCoordinates(e);
    setIsDrawing(true);
    lastPointRef.current = point;

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 1.25, 0, Math.PI * 2);
      ctx.fillStyle = '#0F4C81';
      ctx.fill();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled || showPreview) return;
    e.preventDefault();
    const point = getCoordinates(e);
    const last = lastPointRef.current;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !last) return;

    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
    setShowPreview(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    const dataUrl = tempCanvas.toDataURL('image/png');
    onSave(dataUrl);
    setShowPreview(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center">
            <Pen className="w-5 h-5 text-accent-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-800">电子签名</h2>
            <p className="text-sm text-neutral-500">请在下方区域签署您的姓名</p>
          </div>
        </div>
        <AnimatePresence>
          {showPreview && savedSignature && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-50 text-accent-600 text-sm font-medium"
            >
              <CheckCircle2 className="w-4 h-4" />
              已签名
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        ref={containerRef}
        layout
        className={cn(
          'relative w-full h-56 md:h-64 rounded-xl border-2 border-dashed transition-colors overflow-hidden',
          disabled || showPreview
            ? 'border-neutral-200 bg-neutral-50'
            : isDrawing
              ? 'border-primary-400 bg-primary-50/30'
              : 'border-neutral-300 bg-white hover:border-primary-300 hover:bg-primary-50/20',
        )}
        style={{ touchAction: 'none' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" />

        {!hasDrawn && !showPreview && !disabled && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <Pen className="w-12 h-12 text-neutral-300 mb-3" />
            <p className="text-neutral-400 text-sm md:text-base">请在此区域书写签名</p>
            <p className="text-neutral-300 text-xs mt-1">支持鼠标或触摸屏书写</p>
          </div>
        )}

        {showPreview && savedSignature && (
          <div className="absolute bottom-3 right-3 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-accent-500/10 text-accent-600 text-xs font-medium">
              签名预览
            </span>
          </div>
        )}

        {disabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm pointer-events-none">
            <p className="text-neutral-500 font-medium">暂不可签署</p>
          </div>
        )}
      </motion.div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
        <div className="text-xs text-neutral-400 flex items-center gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" />
          提示：请使用黑色或蓝色笔锋风格书写
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: disabled || (!hasDrawn && !showPreview) ? 1 : 1.02 }}
            whileTap={{ scale: disabled || (!hasDrawn && !showPreview) ? 1 : 0.98 }}
            onClick={clearCanvas}
            disabled={disabled || (!hasDrawn && !showPreview)}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
              disabled || (!hasDrawn && !showPreview)
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
            )}
          >
            <Eraser className="w-4 h-4" />
            清除
          </motion.button>
          <motion.button
            whileHover={{ scale: disabled || !hasDrawn ? 1 : 1.02 }}
            whileTap={{ scale: disabled || !hasDrawn ? 1 : 0.98 }}
            onClick={saveSignature}
            disabled={disabled || !hasDrawn}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
              disabled || !hasDrawn
                ? 'bg-primary-200 text-white cursor-not-allowed'
                : 'bg-primary-500 text-white hover:bg-primary-600 shadow-glow-primary',
            )}
          >
            <Save className="w-4 h-4" />
            保存签名
          </motion.button>
        </div>
      </div>
    </div>
  );
}
