import { Language } from '../types';
import { getTranslation } from '../utils/translations';
import React, { useRef } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Sliders, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  X, 
  Sparkles,
  Check
} from 'lucide-react';

interface BackgroundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bgImage: string | null;
  setBgImage: (url: string | null) => void;
  bgOpacity: number;
  setBgOpacity: (opacity: number) => void;
  defaultBgUrl: string;
  isPaid?: boolean;
  setIsPaid?: (val: boolean) => void;
  lang?: Language;
}

export const BackgroundSettingsModal: React.FC<BackgroundSettingsModalProps> = ({
  isOpen,
  onClose,
  bgImage,
  setBgImage,
  bgOpacity,
  setBgOpacity,
  defaultBgUrl,
  isPaid,
  setIsPaid,
  lang = 'km',
}) => {
  const t = getTranslation(lang);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setBgImage(dataUrl);
        try {
          localStorage.setItem('app_custom_bg', dataUrl);
        } catch (err) {
          console.warn('Storage quota exceeded for custom background:', err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetDefault = () => {
    setBgImage(defaultBgUrl);
    setBgOpacity(0.2);
    try {
      localStorage.setItem('app_custom_bg', defaultBgUrl);
      localStorage.setItem('app_bg_opacity', '0.2');
    } catch {
      // ignore
    }
  };

  const handleToggleBackground = () => {
    if (bgImage) {
      setBgImage(null);
      localStorage.removeItem('app_custom_bg');
    } else {
      handleResetDefault();
    }
  };

  const handleOpacityChange = (newVal: number) => {
    setBgOpacity(newVal);
    try {
      localStorage.setItem('app_bg_opacity', newVal.toString());
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {t.bgModalTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {t.bgModalDesc}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Preview Image Card */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 h-44 shadow-inner group">
            {bgImage ? (
              <>
                <img
                  src={bgImage}
                  alt="Background Preview"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                />
                <div 
                  className="absolute inset-0 bg-slate-900 pointer-events-none"
                  style={{ opacity: 1 - bgOpacity }}
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                  <p className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {t.bgActive}
                  </p>
                  <p className="text-[10px] text-slate-300 line-clamp-1 italic">
                    "가족의 미래와 나 자신의 미래를 위해 공부하는 것..."
                  </p>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <EyeOff className="w-8 h-8 opacity-60" />
                <span className="text-xs">{t.bgDisabled}</span>
              </div>
            )}
          </div>

          {/* Opacity Slider */}
          {bgImage && (
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-teal-600" />
                  <span>{t.bgOpacity}</span>
                </span>
                <span className="font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  {Math.round(bgOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={bgOpacity}
                onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>{t.bgOpacityLight}</span>
                <span>{t.bgOpacityMed}</span>
                <span>{t.bgOpacityStrong}</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.jfif"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{t.bgUploadBtn}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetDefault}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-300 transition-colors cursor-pointer"
                title="ប្រើរូបភាពគំរូសិស្សរៀន TOPIK"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.bgDefaultBtn}</span>
              </button>

              <button
                onClick={handleToggleBackground}
                className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                  bgImage
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}
              >
                {bgImage ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>{t.bgTurnOff}</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t.bgTurnOn}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Document Watermark & Payment Status Switch (For Testing) */}
          {setIsPaid && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    {t.bgWatermarkStatus}
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    {isPaid ? '✓ ឯកសារស្អាត Clean 100% (គ្មាន Watermark)' : '🔒 មាន Watermark &quot;REJECTION&quot;'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !isPaid;
                    setIsPaid(nextVal);
                    try {
                      localStorage.setItem('kiip_doc_paid', String(nextVal));
                    } catch {}
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isPaid
                      ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300'
                      : 'bg-red-100 hover:bg-red-200 text-red-800 border-red-300'
                  }`}
                >
                  {isPaid ? '✓ PAID (Clean)' : '🔒 UNPAID (Rejection)'}
                </button>
              </div>
            </div>
          )}

          {/* Motivational Quote Note */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">{t.studyMotivation}:</p>
              <p className="italic text-slate-700">
                "가족의 미래와 나 자신의 미래를 위해 공부하는 것, 그 누구도 우리를 도와줄 수 없어요. 우리 자신만이 할 수 있어요."
              </p>
              <p className="text-[10px] text-amber-800">
                {t.studyMotivationDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
          >
            {t.bgDoneBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
