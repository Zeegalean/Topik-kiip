import { PWAInstallButton } from './PWAInstallButton';
import React from 'react';
import { Language, UserAccount } from '../types';
import { SUPPORTED_LANGUAGES, getLanguageInfo } from '../data/languages';
import { getTranslation } from '../utils/translations';
import { 
  AlertCircle,
  FileText, 
  Upload, 
  CheckSquare, 
  Download, 
  Mail, 
  Globe, 
  Sparkles, 
  BookOpen, 
  LogIn, 
  LogOut,
  UserCheck,
  Image as ImageIcon,
  Lock,
  CheckCircle
} from 'lucide-react';

interface NavbarProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  user: UserAccount;
  onOpenAuth: () => void;
  onLogout: () => void;
  onLoadSample: () => void;
  onTestDownload?: () => void;
  onOpenBgSettings?: () => void;
  activeTab: 'flow' | 'guide';
  setActiveTab: (tab: 'flow' | 'guide') => void;
  isPaid?: boolean;
  onOpenPayment?: () => void;
  onOpenSocinetNotice?: () => void;
  onOpenLangModal?: () => void;
  isStep1Ready?: boolean;
  isAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  setCurrentStep,
  lang,
  setLang,
  user,
  onOpenAuth,
  onLogout,
  onLoadSample,
  onTestDownload,
  onOpenBgSettings,
  activeTab,
  setActiveTab,
  isPaid = false,
  onOpenPayment,
  onOpenSocinetNotice,
  onOpenLangModal,
  isStep1Ready = false,
  isAdmin = false,
}) => {
  const t = getTranslation(lang);

  const steps = [
    { num: 1, label: t.step1Tab, icon: Upload },
    { num: 2, label: t.step2Tab, icon: CheckSquare },
    { num: 3, label: t.step3Tab, icon: Download },
    { num: 4, label: t.step4Tab, icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('flow')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  KIIP · TOPIK
                </span>
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  1-Click 연계
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                사회통합프로그램 연계 신청서 & 서류 PDF 통합 포털
              </p>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Guide Toggle */}
            <button
              onClick={() => setActiveTab(activeTab === 'guide' ? 'flow' : 'guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'guide'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">{t.topikKiipGuide}</span>
              <span className="sm:hidden">Guide</span>
            </button>

            {/* Load Sample Data Button */}
            <button
              onClick={onLoadSample}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs"
              title={t.loadSampleTooltip}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="hidden md:inline">{t.loadSampleBtn}</span>
              <span className="md:hidden">Sample</span>
            </button>

            {/* Socinet Notice Button */}
            {onOpenSocinetNotice && (
              <button
                onClick={onOpenSocinetNotice}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors shadow-2xs cursor-pointer"
                title={t.socinetNoticeAlert}
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">{t.socinetNavbarBtn || 'Socinet'}</span>
                <span className="sm:hidden">Socinet</span>
              </button>
            )}

            {/* Background Settings Button */}
            {onOpenBgSettings && (
              <button
                onClick={onOpenBgSettings}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors shadow-2xs cursor-pointer"
                title={t.bgSettingsTooltip}
              >
                <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden sm:inline">Background</span>
              </button>
            )}

            {/* Unlock Clean PDF / Paid status */}
            {!isPaid && onOpenPayment ? (
              <button
                onClick={onOpenPayment}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors shadow-2xs cursor-pointer animate-pulse"
                title={t.unlockCleanPdf}
              >
                <Lock className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden md:inline">{t.unlockCleanPdf}</span>
                <span className="md:hidden">₩15,000</span>
              </button>
            ) : isPaid ? (
              <span className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 shadow-2xs">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.unlockedBadge}</span>
              </span>
            ) : null}

            {/* PC Desktop App Install Button */}
            <PWAInstallButton lang={lang} isAdmin={isAdmin} />

            {/* Test Download Button */}
            {onTestDownload && (
              <button
                onClick={onTestDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 transition-all shadow-xs hover:scale-[1.02] cursor-pointer"
                title={t.testDownloadTooltip}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.testDownloadBtn}</span>
                <span className="sm:hidden">Download</span>
              </button>
            )}

            {/* 50 Languages Selector & Modal Button */}
            <div className="flex items-center gap-1">
              <div className="relative flex items-center bg-slate-100 hover:bg-slate-200/70 rounded-xl p-0.5 border border-slate-200 shadow-2xs transition-colors">
                {onOpenLangModal ? (
                  <button
                    onClick={onOpenLangModal}
                    className="p-1 text-slate-500 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                    title="បើកផ្ទាំងជ្រើសរើស ៥០ ភាសា (Open 50 Languages Picker)"
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                ) : (
                  <Globe className="w-3.5 h-3.5 text-slate-500 ml-2 shrink-0" />
                )}
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as Language)}
                  aria-label="Language (50 languages supported)"
                  className="bg-transparent text-xs font-semibold text-slate-800 py-1 pl-1 pr-2 rounded focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[170px]"
                >
                  <optgroup label="អាស៊ីអាគ្នេយ៍ / Southeast Asia">
                    {SUPPORTED_LANGUAGES.filter(l => l.region === 'Southeast Asia').map(l => (
                      <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="អាស៊ីបូព៌ា / East Asia">
                    {SUPPORTED_LANGUAGES.filter(l => l.region === 'East Asia').map(l => (
                      <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="អាស៊ីខាងត្បូង / South Asia">
                    {SUPPORTED_LANGUAGES.filter(l => l.region === 'South Asia').map(l => (
                      <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="អាស៊ីកណ្តាល & CIS / Central Asia">
                    {SUPPORTED_LANGUAGES.filter(l => l.region === 'Central Asia & CIS').map(l => (
                      <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="មជ្ឈិមបូព៌ា / Middle East">
                    {SUPPORTED_LANGUAGES.filter(l => l.region === 'Middle East').map(l => (
                      <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="អឺរ៉ុប & អាមេរិក / Europe & Americas">
                    {SUPPORTED_LANGUAGES.filter(l => l.region === 'Europe & Americas').map(l => (
                      <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="អាហ្វ្រិក / Africa">
                    {SUPPORTED_LANGUAGES.filter(l => l.region === 'Africa').map(l => (
                      <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {onOpenLangModal && (
                <button
                  onClick={onOpenLangModal}
                  className="hidden md:inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                  title="ស្វែងរកក្នុងចំណោម ៥០ ភាសា (Search 50 languages)"
                >
                  <span>50</span>
                  <span className="text-[10px] text-blue-500 uppercase">langs</span>
                </button>
              )}
            </div>

            {/* Auth Button */}
            {user.isLoggedIn ? (
              <div className="flex items-center gap-2 pl-1">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-indigo-400 bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-700">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <button
                  onClick={onLogout}
                  title={t.logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.login}</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Step Progress Nav (Only in Flow Mode) */}
      {activeTab === 'flow' && (
        <div className="bg-slate-50 border-t border-slate-200/80 py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-4 gap-1 sm:gap-3">
              {steps.map((s) => {
                const Icon = s.icon;
                const isActive = currentStep === s.num;
                const isCompleted = currentStep > s.num;
                const isLocked = s.num > 1 && !isStep1Ready;

                return (
                  <button
                    key={s.num}
                    disabled={isLocked}
                    onClick={() => {
                      if (isLocked) return;
                      setCurrentStep(s.num);
                    }}
                    title={isLocked ? (t.stepLockedAlert || 'សូមបំពេញឯកសាចាំបាច់ទាំងអស់ក្នុងជំហ៊ានទី ១ ជាមុនសិន') : undefined}
                    className={`flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isCompleted
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        : isLocked
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-70'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isActive
                          ? 'bg-white text-blue-600'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isLocked
                          ? 'bg-slate-200 text-slate-400'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isCompleted ? '✓' : isLocked ? <Lock className="w-2.5 h-2.5" /> : s.num}
                    </div>
                    <span className="truncate hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden font-bold">Step {s.num}</span>
                    {isLocked && <Lock className="w-3 h-3 text-slate-400 hidden sm:inline shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
