import React, { useState } from 'react';
import { UserAccount, Language } from '../types';
import { getTranslation } from '../utils/translations';
import { X, CheckCircle, Mail, User, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  lang: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  lang,
}) => {
  const t = getTranslation(lang);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [activeTab, setActiveTab] = useState<'social' | 'email'>('social');

  if (!isOpen) return null;

  const handleProviderLogin = (provider: 'google' | 'apple' | 'gmail' | 'guest') => {
    let name = 'SOK SRORNG';
    let email = 'soksrorng.cambodia@gmail.com';
    let avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    if (provider === 'apple') {
      name = 'Apple User';
      email = 'user@privaterelay.appleid.com';
    } else if (provider === 'gmail' && emailInput) {
      email = emailInput;
      name = nameInput || emailInput.split('@')[0];
    } else if (provider === 'guest') {
      name = 'Guest Worker';
      email = 'guest@kiip-topik.kr';
    }

    onLoginSuccess({
      isLoggedIn: true,
      name,
      email,
      avatar,
      provider,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-teal-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">
              KIIP · TOPIK Auth
            </span>
          </div>
          <h2 className="text-xl font-bold">{t.login}</h2>
          <p className="text-xs text-blue-100 mt-1">
            {lang === 'km' ? 'រក្សាទុកទិន្នន័យឯកសាររបស់អ្នក និងទាញយកឡើងវិញនៅពេលក្រោយបានយ៉ាងងាយស្រួល' : lang === 'ko' ? '신청서 데이터를 안전하게 보관하고 언제든 다시 다운로드하세요' : 'Safely store your application documents and easily redownload anytime'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('social')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors ${
              activeTab === 'social'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Google / Apple / Play Store
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors ${
              activeTab === 'email'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Gmail / Direct Email
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {activeTab === 'social' ? (
            <div className="space-y-3">
              {/* Google Account */}
              <button
                onClick={() => handleProviderLogin('google')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 font-semibold text-slate-700 text-sm transition-all shadow-2xs group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google Account</span>
              </button>

              {/* Apple ID */}
              <button
                onClick={() => handleProviderLogin('apple')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black hover:bg-slate-900 text-white rounded-xl font-semibold text-sm transition-all shadow-2xs"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.07 1.72-.94 2.74 1 .08 2.03-.5 2.65-1.24z" />
                </svg>
                <span>Sign in with Apple ID</span>
              </button>

              {/* Google Play Store / Android Quick Login */}
              <button
                onClick={() => handleProviderLogin('google')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 rounded-xl font-semibold text-emerald-900 text-sm transition-all shadow-2xs"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4CAF50" d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5Z" />
                  <path fill="#FFC107" d="M16.81,15.12L6.05,21.34L13.69,12L16.81,15.12Z" />
                  <path fill="#FF3D00" d="M20.16,10.83C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.17L17.89,14.5L14.73,12L17.89,9.5L20.16,10.83Z" />
                  <path fill="#1976D2" d="M6.05,2.66L16.81,8.88L13.69,12L6.05,2.66Z" />
                </svg>
                <span>Google Play Store Account</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gmail / Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'km' ? 'ឈ្មោះអ្នកប្រើ (Full Name)' : lang === 'ko' ? '신청자 성명 (Full Name)' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="SOK SRORNG"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                onClick={() => handleProviderLogin('gmail')}
                disabled={!emailInput}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-colors shadow-xs"
              >
                {lang === 'km' ? 'ចូលប្រើដោយ Gmail' : lang === 'ko' ? 'Gmail 계정으로 계속하기' : 'Continue with Gmail'}
              </button>
            </div>
          )}

          {/* Quick guest bypass */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{lang === 'km' ? 'មិនចង់ចូលគណនី?' : lang === 'ko' ? '로그인 없이 계속할까요?' : 'Continue without login?'}</span>
            <button
              onClick={() => handleProviderLogin('guest')}
              className="font-bold text-blue-600 hover:text-blue-800 underline"
            >
              {lang === 'km' ? 'បន្តប្រើប្រាស់ជាភ្ញៀវ (Guest)' : lang === 'ko' ? '게스트(Guest)로 계속하기' : 'Continue as Guest'}
            </button>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex items-start gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              {lang === 'km' ? 'ព័ត៌មានរបស់អ្នកត្រូវបានរក្សាទុកដោយសុវត្ថិភាពសម្រាប់តែការបំពេញពាក្យសុំ KIIP & TOPIK ប៉ុណ្ណោះ។' : lang === 'ko' ? '입력하신 정보는 KIIP & TOPIK 서류 작성 목적으로만 안전하게 처리됩니다.' : 'Your data is securely processed strictly for KIIP & TOPIK application purposes.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
