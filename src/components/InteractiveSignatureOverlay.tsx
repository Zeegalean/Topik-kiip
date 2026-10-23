import { Language } from '../types';
import { getTranslation } from '../utils/translations';
import React, { useState, useRef, useEffect } from 'react';
import { SignatureSettings } from '../types';
import { Move, ZoomIn, ZoomOut, RotateCcw, Maximize2, Check, Sparkles } from 'lucide-react';

interface InteractiveSignatureOverlayProps {
  signatureUrl: string | null;
  sigSettings: SignatureSettings;
  setSigSettings: React.Dispatch<React.SetStateAction<SignatureSettings>>;
  readOnly?: boolean;
  lang?: Language;
}

type ResizeCorner = 'se' | 'sw' | 'ne' | 'nw';

export const InteractiveSignatureOverlay: React.FC<InteractiveSignatureOverlayProps> = ({
  signatureUrl,
  sigSettings,
  setSigSettings,
  readOnly = false,
  lang = 'km',
}) => {
  const t = getTranslation(lang);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const resizeCornerRef = useRef<ResizeCorner>('se');
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Drag tracking refs
  const dragStartPos = useRef<{
    clientX: number;
    clientY: number;
    startX: number;
    startY: number;
  }>({
    clientX: 0,
    clientY: 0,
    startX: 0,
    startY: 0,
  });

  // Resize tracking refs
  const resizeStartPos = useRef<{
    clientX: number;
    clientY: number;
    startScale: number;
  }>({
    clientX: 0,
    clientY: 0,
    startScale: 1.0,
  });

  // Handle Drag Start (Move with Mouse or Finger)
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (readOnly) return;
    e.stopPropagation();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setIsDragging(true);
    setIsSelected(true);
    setActiveTooltip(t.sigDragTooltip);

    dragStartPos.current = {
      clientX,
      clientY,
      startX: sigSettings.x || 0,
      startY: sigSettings.y || 0,
    };
  };

  // Handle Resize Start (Corner Drag)
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, corner: ResizeCorner) => {
    if (readOnly) return;
    e.stopPropagation();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    resizeCornerRef.current = corner;
    setIsResizing(true);
    setIsSelected(true);
    const scaleLbl = lang === 'km' ? 'ទំហំ' : lang === 'ko' ? '크기' : 'Scale'; setActiveTooltip(`${scaleLbl}: ${Math.round((sigSettings.scale || 1.0) * 100)}%`);

    resizeStartPos.current = {
      clientX,
      clientY,
      startScale: sigSettings.scale || 1.0,
    };
  };

  // Click outside to deselect
  useEffect(() => {
    if (readOnly) return;
    const handleDocumentClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('touchstart', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('touchstart', handleDocumentClick);
    };
  }, [readOnly]);

  // Global Pointer Listeners for ultra-smooth drag & resize
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      // Prevent screen scrolling during touch drag on mobile
      if ('touches' in e && e.cancelable) {
        e.preventDefault();
      }

      const clientX = 'touches' in e ? e.touches[0]?.clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY : (e as MouseEvent).clientY;
      if (clientX === undefined || clientY === undefined) return;

      if (isDragging) {
        const deltaX = clientX - dragStartPos.current.clientX;
        const deltaY = clientY - dragStartPos.current.clientY;

        // Wide bounds: -320px to +180px in X, -120px to +100px in Y
        const nextX = Math.max(-320, Math.min(180, Math.round(dragStartPos.current.startX + deltaX)));
        const nextY = Math.max(-120, Math.min(100, Math.round(dragStartPos.current.startY + deltaY)));

        setSigSettings((prev) => ({
          ...prev,
          x: nextX,
          y: nextY,
        }));
        setActiveTooltip(`X: ${nextX > 0 ? '+' : ''}${nextX}px, Y: ${nextY > 0 ? '+' : ''}${nextY}px`);
      } else if (isResizing) {
        const deltaX = clientX - resizeStartPos.current.clientX;
        const deltaY = clientY - resizeStartPos.current.clientY;
        const corner = resizeCornerRef.current;

        // Direction multiplier based on corner
        let factor = 0;
        if (corner === 'se') {
          factor = (deltaX + deltaY) / 130;
        } else if (corner === 'sw') {
          factor = (-deltaX + deltaY) / 130;
        } else if (corner === 'ne') {
          factor = (deltaX - deltaY) / 130;
        } else if (corner === 'nw') {
          factor = (-deltaX - deltaY) / 130;
        }

        const nextScale = Math.max(
          0.3,
          Math.min(2.5, Number((resizeStartPos.current.startScale + factor).toFixed(2)))
        );

        setSigSettings((prev) => ({
          ...prev,
          scale: nextScale,
        }));
        const scaleLbl2 = lang === 'km' ? 'ទំហំ' : lang === 'ko' ? '크기' : 'Scale'; setActiveTooltip(`${scaleLbl2}: ${Math.round(nextScale * 100)}%`);
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setTimeout(() => setActiveTooltip(null), 1400);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, isResizing, setSigSettings]);

  if (!signatureUrl) return null;

  const currentScale = sigSettings.scale || 1.0;
  const currentX = sigSettings.x || 0;
  const currentY = sigSettings.y || 0;
  const showControls = !readOnly && (isHovered || isSelected || isDragging || isResizing);

  return (
    <div
      ref={containerRef}
      className="absolute select-none group touch-none"
      style={{
        right: '12px',
        top: '-16px',
        transform: `translate(${currentX}px, ${currentY}px) scale(${currentScale})`,
        transformOrigin: 'center center',
        zIndex: isDragging || isResizing ? 50 : 25,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isDragging && !isResizing && setIsHovered(false)}
      onClick={(e) => {
        if (!readOnly) {
          e.stopPropagation();
          setIsSelected(true);
        }
      }}
    >
      {/* Floating Action Tools (Ignored during PDF Export) */}
      {showControls && (
        <div
          data-html2canvas-ignore="true"
          className="absolute -top-11 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-sans font-bold flex items-center gap-1.5 shadow-xl shadow-black/25 pointer-events-auto border border-blue-400/40 whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Live Scale Badge */}
          <span className="text-amber-300 font-mono text-[10px] px-1 bg-amber-400/10 rounded border border-amber-400/30">
            {Math.round(currentScale * 100)}%
          </span>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-0.5 border-l border-white/20 pl-1">
            <button
              type="button"
              title={lang === 'km' ? 'កំណត់ទំហំ 80%' : lang === 'ko' ? '80% 크기 설정' : 'Set 80% scale'}
              onClick={(e) => {
                e.stopPropagation();
                setSigSettings((p) => ({ ...p, scale: 0.8 }));
              }}
              className={`px-1.5 py-0.5 rounded text-[9px] cursor-pointer transition-colors ${
                Math.round(currentScale * 100) === 80
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-300 hover:bg-white/20'
              }`}
            >
              80%
            </button>
            <button
              type="button"
              title={lang === 'km' ? 'កំណត់ទំហំដើម 100%' : lang === 'ko' ? '기본 100% 크기 설정' : 'Reset 100% scale'}
              onClick={(e) => {
                e.stopPropagation();
                setSigSettings((p) => ({ ...p, scale: 1.0 }));
              }}
              className={`px-1.5 py-0.5 rounded text-[9px] cursor-pointer transition-colors ${
                Math.round(currentScale * 100) === 100
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-300 hover:bg-white/20'
              }`}
            >
              100%
            </button>
            <button
              type="button"
              title={lang === 'km' ? 'កំណត់ទំហំ 125%' : lang === 'ko' ? '125% 크기 설정' : 'Set 125% scale'}
              onClick={(e) => {
                e.stopPropagation();
                setSigSettings((p) => ({ ...p, scale: 1.25 }));
              }}
              className={`px-1.5 py-0.5 rounded text-[9px] cursor-pointer transition-colors ${
                Math.round(currentScale * 100) === 125
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-300 hover:bg-white/20'
              }`}
            >
              125%
            </button>
          </div>

          {/* Step Zoom In / Out Buttons */}
          <div className="flex items-center gap-0.5 border-l border-white/20 pl-1">
            <button
              type="button"
              title={t.sigZoomIn}
              onClick={(e) => {
                e.stopPropagation();
                setSigSettings((p) => ({
                  ...p,
                  scale: Math.min(2.5, Number(((p.scale || 1.0) + 0.1).toFixed(2))),
                }));
              }}
              className="p-1 hover:bg-blue-600 rounded cursor-pointer transition-colors"
            >
              <ZoomIn className="w-3 h-3 text-white" />
            </button>
            <button
              type="button"
              title={t.sigZoomOut}
              onClick={(e) => {
                e.stopPropagation();
                setSigSettings((p) => ({
                  ...p,
                  scale: Math.max(0.3, Number(((p.scale || 1.0) - 0.1).toFixed(2))),
                }));
              }}
              className="p-1 hover:bg-blue-600 rounded cursor-pointer transition-colors"
            >
              <ZoomOut className="w-3 h-3 text-white" />
            </button>
          </div>

          {/* Reset Position & Scale */}
          <div className="border-l border-white/20 pl-1">
            <button
              type="button"
              title={t.sigReset}
              onClick={(e) => {
                e.stopPropagation();
                setSigSettings((p) => ({ ...p, x: 0, y: 0, scale: 1.0 }));
                setActiveTooltip(t.sigResetTooltip);
              }}
              className="p-1 hover:bg-white/20 rounded cursor-pointer transition-colors text-slate-300 hover:text-white"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive Signature Frame */}
      <div
        className={`relative transition-all rounded-lg p-1.5 touch-none ${
          readOnly
            ? 'pointer-events-none'
            : isDragging
            ? 'cursor-grabbing border-2 border-dashed border-blue-500 bg-blue-500/10 shadow-lg ring-4 ring-blue-500/20'
            : isResizing
            ? 'cursor-nwse-resize border-2 border-dashed border-indigo-500 bg-indigo-500/10 shadow-lg ring-4 ring-indigo-500/20'
            : isHovered || isSelected
            ? 'cursor-grab border-2 border-dashed border-blue-500/80 bg-blue-50/20 shadow-md ring-2 ring-blue-400/20'
            : 'border border-blue-400/40 hover:border-blue-500 cursor-grab bg-blue-50/5'
        }`}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        title={readOnly ? undefined : t.sigDragTooltip}
      >
        {/* Actual Signature Stamp Image */}
        <img
          src={signatureUrl}
          alt="Signature Stamp"
          draggable={false}
          className="h-14 max-w-[165px] object-contain select-none pointer-events-none drop-shadow-xs"
        />

        {/* Real-time Tooltip Indicator */}
        {!readOnly && activeTooltip && (
          <div
            data-html2canvas-ignore="true"
            className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9.5px] font-sans font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap pointer-events-none z-50 animate-in fade-in flex items-center gap-1"
          >
            <span>{activeTooltip}</span>
          </div>
        )}

        {/* Drag Hint Tag (When resting/hovered) */}
        {!readOnly && !isDragging && !isResizing && (isHovered || isSelected) && (
          <div
            data-html2canvas-ignore="true"
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[9px] font-sans font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md whitespace-nowrap pointer-events-none opacity-95 border border-white/10"
          >
            <Move className="w-2.5 h-2.5 text-blue-300" />
            <span>{t.sigDragTooltip}</span>
          </div>
        )}

        {/* Subtle Resting Tag when not hovered */}
        {!readOnly && !isHovered && !isSelected && !isDragging && !isResizing && (
          <div
            data-html2canvas-ignore="true"
            className="absolute -bottom-5 right-0 bg-blue-600/80 text-white text-[8px] font-sans font-bold px-1.5 py-0.2 rounded-full pointer-events-none shadow-xs flex items-center gap-0.5 opacity-80"
          >
            <span>{t.sigResizeTooltip}</span>
          </div>
        )}

        {/* 4 CORNER RESIZE HANDLES (Interactive) */}
        {!readOnly && (isHovered || isSelected || isDragging || isResizing) && (
          <>
            {/* Bottom-Right Handle (SE) */}
            <div
              data-html2canvas-ignore="true"
              title={t.sigResizeTooltip}
              className="absolute -bottom-2.5 -right-2.5 w-6 h-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center cursor-nwse-resize shadow-md shadow-blue-500/50 border-2 border-white hover:scale-125 transition-transform z-40 pointer-events-auto active:scale-110"
              onMouseDown={(e) => handleResizeStart(e, 'se')}
              onTouchStart={(e) => handleResizeStart(e, 'se')}
            >
              <Maximize2 className="w-3 h-3" />
            </div>

            {/* Bottom-Left Handle (SW) */}
            <div
              data-html2canvas-ignore="true"
              title={t.sigResizeTooltip}
              className="absolute -bottom-2.5 -left-2.5 w-5 h-5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center cursor-nesw-resize shadow-md shadow-indigo-500/40 border-2 border-white hover:scale-125 transition-transform z-40 pointer-events-auto"
              onMouseDown={(e) => handleResizeStart(e, 'sw')}
              onTouchStart={(e) => handleResizeStart(e, 'sw')}
            >
              <span className="text-[10px] font-black leading-none">⤢</span>
            </div>

            {/* Top-Right Handle (NE) */}
            <div
              data-html2canvas-ignore="true"
              title={t.sigResizeTooltip}
              className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center cursor-nesw-resize shadow-md shadow-indigo-500/40 border-2 border-white hover:scale-125 transition-transform z-40 pointer-events-auto"
              onMouseDown={(e) => handleResizeStart(e, 'ne')}
              onTouchStart={(e) => handleResizeStart(e, 'ne')}
            >
              <span className="text-[10px] font-black leading-none">⤡</span>
            </div>

            {/* Top-Left Handle (NW) */}
            <div
              data-html2canvas-ignore="true"
              title={t.sigResizeTooltip}
              className="absolute -top-2.5 -left-2.5 w-5 h-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center cursor-nwse-resize shadow-md shadow-blue-500/40 border-2 border-white hover:scale-125 transition-transform z-40 pointer-events-auto"
              onMouseDown={(e) => handleResizeStart(e, 'nw')}
              onTouchStart={(e) => handleResizeStart(e, 'nw')}
            >
              <span className="text-[10px] font-black leading-none">⤢</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
