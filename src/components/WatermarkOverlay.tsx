import React from 'react';
import { ShieldAlert, AlertTriangle, Stamp, Unlock } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';

interface WatermarkOverlayProps {
  show?: boolean;
  text?: string;
  subText?: string;
  showRepeatedBackground?: boolean;
  variant?: 'form' | 'card';
  lang?: Language;
  onSealUnlock?: () => void;
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({
  show = true,
  text = 'REJECTION',
  subText,
  showRepeatedBackground = true,
  variant = 'form',
  lang = 'km',
  onSealUnlock,
}) => {
  if (!show) return null;
  const t = getTranslation(lang);
  const displaySubText = subText || (lang === 'km' 
    ? '반려본 / 심사용 미결제본 • គំរូមិនទាន់ទូទាត់ប្រាក់ (UNPAID COPY)' 
    : lang === 'ko' 
    ? '반려본 / 심사용 미결제본 (UNPAID COPY)' 
    : 'OFFICIAL REJECTION SAMPLE • UNPAID COPY');

  if (variant === 'card') {
    return (
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center overflow-hidden bg-rose-950/15 backdrop-blur-[0.5px]">
        {/* Diagonal Warning Ribbon */}
        <div className="transform -rotate-25 bg-red-600/90 text-white font-black text-[11px] sm:text-[13px] px-8 py-1 shadow-lg border-y-2 border-white/80 uppercase tracking-widest text-center whitespace-nowrap">
          {text} • UNPAID
        </div>
        <div className="mt-1 transform -rotate-25 text-[8px] sm:text-[9px] font-bold text-red-700 bg-white/95 px-2 py-0.5 rounded shadow-xs">
          {t.watermarkRibbonText}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="absolute inset-0 z-30 pointer-events-none overflow-hidden select-none"
      style={{ userSelect: 'none' }}
    >
      {/* 1. Subtle Repeated Diagonal Watermark Background Grid */}
      {showRepeatedBackground && (
        <div className="absolute inset-0 flex flex-col justify-between py-8 opacity-15 overflow-hidden">
          {Array.from({ length: 8 }).map((_, rowIdx) => (
            <div 
              key={rowIdx} 
              className="flex justify-around items-center whitespace-nowrap transform -rotate-30 scale-110"
            >
              {Array.from({ length: 4 }).map((_, colIdx) => (
                <span 
                  key={colIdx} 
                  className="text-red-700 font-extrabold text-[15px] tracking-[4px] mx-6 uppercase font-mono"
                >
                  {t.watermarkUnpaidGrid}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* 2. Top-Right Official Seal / Watermark Badge */}
      <div className="absolute top-6 right-6 transform rotate-6 border-3 border-dashed border-red-600/80 rounded-xl p-2.5 bg-red-50/75 backdrop-blur-2xs shadow-md max-w-[210px] text-center">
        <div className="flex items-center justify-center gap-1 text-red-700 font-black text-[12px] tracking-wider">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>REJECTION COPY</span>
        </div>
        <p className="text-[9px] font-bold text-red-800 font-serif mt-0.5 leading-tight">
          출입국 제출불가 (심사용 미결제본)
        </p>
        <p className="text-[8.5px] font-medium text-slate-700 mt-0.5">
          {t.watermarkBadgeSub}
        </p>
      </div>

      {/* 3. Center Huge Diagonal Official REJECTION Stamp */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="transform -rotate-28 -translate-y-4 flex flex-col items-center justify-center">
          <div className="border-[6px] border-red-600/85 rounded-3xl px-8 sm:px-14 py-4 sm:py-6 bg-red-500/10 backdrop-blur-[0.5px] shadow-2xl flex flex-col items-center text-center">
            {/* Header Stamp text */}
            <div className="flex items-center gap-2 text-red-700 text-xs sm:text-sm font-extrabold tracking-[4px] uppercase mb-1">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 animate-pulse" />
              <span>OFFICIAL SAMPLE DOCUMENT</span>
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 animate-pulse" />
            </div>

            {/* Giant Rejection Title */}
            <h1 className="text-red-600 font-black text-5xl sm:text-7xl tracking-[8px] sm:tracking-[14px] uppercase leading-none drop-shadow-xs font-sans">
              {text}
            </h1>

            {/* Subtitle Description */}
            <div className="mt-2 text-center">
              <p className="text-red-800 font-extrabold text-xs sm:text-sm tracking-wide font-serif">
                {displaySubText}
              </p>
              <p className="text-[10px] sm:text-[11px] font-bold text-red-700 mt-1 uppercase tracking-wider font-mono">
                NOT VALID FOR SUBMISSION • UNLOCK CLEAN COPY VIA PAYMENT
              </p>
            </div>

            {/* Security Code Line */}
            <div className="mt-2 pt-1.5 border-t border-red-500/40 w-full flex items-center justify-between text-[9px] text-red-700/90 font-mono">
              <span>SECURITY ID: REJ-7492-UNPAID</span>
              <span>{t.watermarkCleanPriceText}</span>
            </div>

            {/* Interactive Seal Unlock Button */}
            {onSealUnlock && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSealUnlock();
                }}
                className="mt-3.5 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl flex items-center gap-2 transform hover:scale-105 transition-all cursor-pointer border-2 border-amber-300 pointer-events-auto animate-bounce"
                title="ដោះសោការបិទបាំងលើ Form ភ្លាមៗ"
              >
                <Unlock className="w-4 h-4 text-amber-200" />
                <span>
                  {lang === "km" 
                    ? "🔓 ចុចត្រង់នេះដើម្បីដោះសោត្រាផ្លូវការ (Seal Unlock Form)" 
                    : lang === "ko"
                    ? "🔓 직인 날인 및 반려본 잠금 해제 (Seal Unlock)"
                    : "🔓 Click to Apply Official Seal Unlock"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Bottom Prominent Security Warning Strip */}
      <div className="absolute bottom-4 left-4 right-4 bg-red-600/90 text-white px-4 py-2 rounded-lg text-center shadow-lg border border-red-700">
        <p className="text-[11px] font-bold tracking-wide">
          {t.watermarkBanner}
        </p>
      </div>
    </div>
  );
};
