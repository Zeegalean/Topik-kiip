import React, { useState } from 'react';
import { AlertCircle, ExternalLink, X, ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';

interface SocinetNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const SocinetNoticeModal: React.FC<SocinetNoticeModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const t = getTranslation(lang);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('socinet_notice_dismissed', 'true');
      } catch {}
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={handleConfirm}
      />

      {/* Small Compact Modal Dialog */}
      <div 
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-2xl shadow-2xl border-2 border-amber-300 max-w-md w-full overflow-hidden z-10 transition-all transform animate-in zoom-in-95 duration-200"
      >
        {/* Accent Top Bar */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-5 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-white/20 rounded-lg backdrop-blur-xs flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">
              {t.socinetNoticeTag || 'Notice'}
            </span>
          </div>
          <button
            onClick={handleConfirm}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Header Title */}
          <div className="flex items-center gap-2 text-slate-800">
            <KeyRound className="w-5 h-5 text-amber-600 shrink-0" />
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              {t.socinetNoticeTitle}
            </h3>
          </div>

          {/* Highlighted Warning Callout Box (Exact User Quote) */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 border-2 border-amber-300 rounded-xl p-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-amber-500 text-white rounded-lg shrink-0 mt-0.5 shadow-2xs">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-amber-950 font-bold text-base sm:text-lg leading-relaxed font-bokor">
                {t.socinetNoticeAlert}
              </p>
            </div>
          </div>

          {/* Explanatory Context */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t.socinetNoticeDesc}
          </p>

          {/* Socinet Portal Link Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                Official Portal
              </div>
              <div className="text-xs sm:text-sm font-bold text-blue-700 truncate">
                사회통합정보망 (Socinet)
              </div>
              <div className="text-[11px] text-slate-500">
                www.socinet.go.kr
              </div>
            </div>
            <a
              href="https://www.socinet.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shrink-0 shadow-2xs"
            >
              <span>{t.socinetNoticeBtnVisit}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Checkbox Don't Show Again */}
          <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
            />
            <span className="text-xs text-slate-600">
              {t.socinetNoticeDontShow}
            </span>
          </label>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleConfirm}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>{t.socinetNoticeBtnConfirm}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
