import React from 'react';
import { ShieldAlert, X, Lock } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';

interface RightClickProtectionToastProps {
  show: boolean;
  onClose: () => void;
  message?: string;
  onOpenPayment?: () => void;
  lang?: Language;
}

export const RightClickProtectionToast: React.FC<RightClickProtectionToastProps> = ({
  show,
  onClose,
  message,
  onOpenPayment,
  lang = 'km',
}) => {
  if (!show) return null;
  const t = getTranslation(lang);

  return (
    <div className="fixed bottom-6 right-6 z-[99999] max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 text-white backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-red-500/40 flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0 text-red-400 mt-0.5">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>{t.rightClickTitle}</span>
            </h4>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {message || t.rightClickMsg}
          </p>
          {onOpenPayment && (
            <div className="pt-1.5">
              <button
                onClick={() => {
                  onClose();
                  onOpenPayment();
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-[11px] font-bold rounded-lg shadow-md cursor-pointer flex items-center gap-1.5 transition-transform hover:scale-[1.02]"
              >
                <span>{t.rightClickUnlockBtn}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
