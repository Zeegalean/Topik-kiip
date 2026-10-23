import React, { useState } from 'react';
import { 
  Monitor, 
  Download, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Layers, 
  WifiOff, 
  ExternalLink, 
  Laptop, 
  Smartphone,
  ArrowRight,
  ShieldCheck,
  Check,
  RefreshCw
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types';

interface PCAppInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const PCAppInstallModal: React.FC<PCAppInstallModalProps> = ({
  isOpen,
  onClose,
  lang = 'km',
}) => {
  const { isInstallable, isInstalled, isDesktop, install } = usePWAInstall();
  const [installSuccess, setInstallSuccess] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const handleDownloadZip = () => {
    setIsDownloadingZip(true);
    // Direct stream download with cache-buster timestamp
    const downloadUrl = `/api/download-pc-package?t=${Date.now()}`;
    
    // Create an explicit invisible link
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'kiip-topik-pc-package.zip';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      try {
        document.body.removeChild(a);
      } catch {}
      setIsDownloadingZip(false);
    }, 2000);
  };

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) {
        setInstallSuccess(true);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100002] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Monitor className="w-4 h-4 text-white" />
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
                Desktop Application (PC / Laptop)
              </span>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs border border-amber-300">
                ADMIN EXCLUSIVE
              </span>
            </div>
          </div>

          <h3 className="text-lg sm:text-xl font-black">
            {lang === 'km' 
              ? 'បង្កើត & ដំឡើងជា App លើ PC (Windows / Mac)' 
              : lang === 'ko' 
              ? 'PC 데스크톱 앱으로 설치 및 실행 (Windows / Mac)' 
              : 'Install & Run as a Desktop App on PC'}
          </h3>
          <p className="text-xs text-sky-100 mt-1 leading-relaxed">
            {lang === 'km'
              ? 'អ្នកអាចដំឡើងកម្មវិធីនេះផ្ទាល់លើកុំព្យូទ័រ PC ឬ Laptop របស់អ្នក ដោយបើកក្នុងផ្ទាំង Window ដាច់ដោយឡែក ដំណើរការលឿន និងមាន Icon លើ Desktop!'
              : lang === 'ko'
              ? '컴퓨터(PC) 화면에 전용 아이콘을 생성하고 브라우저 주소창 없이 독립된 창으로 빠르고 편리하게 실행하세요.'
              : 'Install directly on your Windows or Mac PC to launch from your desktop in a clean, standalone window.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 space-y-5">
          {/* Status banner */}
          {isInstalled ? (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3 text-emerald-900 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-sm block">
                  {lang === 'km' ? 'កម្មវិធីត្រូវបានដំឡើងលើឧបករណ៍នេះរួចរាល់ហើយ!' : '앱이 이미 설치되어 실행 중입니다!'}
                </span>
                <span className="text-emerald-700">
                  {lang === 'km' ? 'អ្នកអាចបើកវាដោយផ្ទាល់ពី Start Menu ឬ Desktop លើ PC របស់អ្នក។' : 'PC 바탕화면이나 시작 메뉴에서 바로 실행할 수 있습니다.'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  {lang === 'km' ? 'ដំឡើងភ្លាមៗត្រឹមតែ ១-Click (1-Click PWA Install)' : '1초 만에 PC 앱 설치'}
                </span>
                <p className="text-[11px] text-blue-800">
                  {lang === 'km' 
                    ? 'គាំទ្រកម្មវិធីរុករក Google Chrome, Microsoft Edge, Brave លើ Windows 10/11 & Mac'
                    : 'Windows 10/11 및 Mac의 Chrome, Edge 브라우저 지원'}
                </p>
              </div>

              {isInstallable ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-105 shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{lang === 'km' ? 'ដំឡើង App លើ PC ឥឡូវនេះ' : '지금 PC 앱 설치'}</span>
                </button>
              ) : (
                <span className="text-[11px] font-bold text-blue-700 bg-blue-100/70 px-3 py-1.5 rounded-xl border border-blue-200 shrink-0 text-center">
                  {lang === 'km' ? 'វិធីដំឡើងតាម Browser ខាងក្រោម' : '브라우저 메뉴에서 설치 가능'}
                </span>
              )}
            </div>
          )}

          {/* Key Advantages of PC App */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
                <Laptop className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-xs text-slate-900">
                {lang === 'km' ? 'ផ្ទាំង Window ផ្ទាល់ខ្លួន' : '독립 창 모드'}
              </h5>
              <p className="text-[10px] text-slate-500 leading-tight">
                {lang === 'km' ? 'គ្មានរបារ URL bar ឬ Tabs ដំណើរការដូចកម្មវិធី Windows សុទ្ធ' : '주소창 없는 깔끔한 독립 소프트웨어 화면'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <WifiOff className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-xs text-slate-900">
                {lang === 'km' ? 'ដំណើរការ Offline' : '오프라인 캐싱'}
              </h5>
              <p className="text-[10px] text-slate-500 leading-tight">
                {lang === 'km' ? 'ផ្ទុកឯកសារ និងទិន្នន័យក្នុងម៉ាស៊ីន PC ប្រើប្រាស់បានលឿនរហ័ស' : '서비스 워커로 리소스 캐시, 초고속 로딩'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto">
                <Layers className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-xs text-slate-900">
                {lang === 'km' ? 'Icon លើ Desktop PC' : '바탕화면 아이콘'}
              </h5>
              <p className="text-[10px] text-slate-500 leading-tight">
                {lang === 'km' ? 'មាន Icon លើ Desktop & Taskbar ចុចបើកភ្លាមៗ' : '작업표시줄 및 시작메뉴에 고정 가능'}
              </p>
            </div>
          </div>

          {/* DOWNLOAD FULL SOURCE & PC PACKAGING FILES (.ZIP) */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 rounded-2xl border-2 border-emerald-400 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-emerald-950">
                    {lang === "km" ? "ទាញយកកញ្ចប់ឯកសារគម្រោង (.ZIP) សម្រាប់វេចខ្ចប់លើ PC" : "PC 앱 패키징 전체 파일 (.ZIP) 다운로드"}
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    {lang === "km"
                      ? "មានផ្ទុក File កូដទាំងអស់ + Electron Launcher + BUILD_EXE.bat + សៀវភៅណែនាំជាភាសាខ្មែរ"
                      : "전체 소스코드 + Electron 패키징 설정 + BUILD_EXE.bat 포함"}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-900 bg-emerald-200/90 px-2.5 py-0.5 rounded-full border border-emerald-400 shrink-0">
                2.4 MB • Clean ZIP
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={isDownloadingZip}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:scale-105 cursor-pointer text-center disabled:opacity-60"
              >
                {isDownloadingZip ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{lang === "km" ? "កំពុងទាញយក..." : "다운로드 중..."}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{lang === "km" ? "ទាញយក File .ZIP ពេញលេញ (2.44 MB)" : "전체 .ZIP 다운로드 (2.44 MB)"}</span>
                  </>
                )}
              </button>

              <a
                href={`/api/download-pc-package?t=${Date.now()}`}
                target="_blank"
                rel="noopener noreferrer"
                download="kiip-topik-pc-package.zip"
                className="px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-emerald-900 border border-emerald-300 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                <span>{lang === "km" ? "បើក Link ទាញយកផ្ទាល់ (Direct Link)" : "직접 다운로드 링크"}</span>
              </a>
            </div>

            <p className="text-[11px] text-slate-600 leading-tight">
              {lang === "km"
                ? '💡 ធានាថាពន្លា (Extract) បាន ១០០% ដោយគ្មានកំហុស! បន្ទាប់ពីពន្លារួច គ្រាន់តែ Double-click លើ BUILD_EXE.bat ដើម្បីបង្កើតជា App លើ PC ភ្លាមៗ។'
                : '압축 해제 후 BUILD_EXE.bat을 실행하면 Windows용 .exe 파일이 자동으로 생성됩니다.'}
            </p>
          </div>

          {/* Simple Step-by-Step Guide for PC */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>{lang === 'km' ? 'របៀបដំឡើងលើកុំព្យូទ័រ PC តាម Browser:' : 'PC 브라우저에서 설치하는 방법:'}</span>
            </h4>

            {/* Method 1: Google Chrome */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>{lang === 'km' ? 'នៅលើ Google Chrome (PC):' : '구글 크롬(Chrome) 브라우저:'}</span>
              </div>
              <p className="text-slate-600 text-[11px] pl-7 leading-relaxed">
                {lang === 'km' 
                  ? 'ក្រឡេកមើលទៅខាងស្ដាំនៃរបារ Address Bar (កន្លែងវាយ Link ខាងលើ) អ្នកនឹងឃើញរូបតំណាង Icon ⊕ (Install App) -> ចុចលើវា រួចជ្រើសរើស "Install"។'
                  : '주소창 오른쪽 끝에 있는 [설치 (컴퓨터 화면 모양 또는 ⊕ 아이콘)]을 클릭한 뒤 [설치]를 누르면 즉시 바탕화면에 앱이 생성됩니다.'}
              </p>
            </div>

            {/* Method 2: Microsoft Edge */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>{lang === 'km' ? 'នៅលើ Microsoft Edge (Windows):' : '마이크로소프트 엣지(Edge) 브라우저:'}</span>
              </div>
              <p className="text-slate-600 text-[11px] pl-7 leading-relaxed">
                {lang === 'km'
                  ? 'ចុចលើសញ្ញាចុចបី (...) នៅជ្រុងខាងស្តាំខាងលើ -> ជ្រើសយក "Apps" -> ចុច "Install this site as an app" (ដំឡើងគេហទំព័រនេះជា App)។'
                  : '브라우저 우측 상단 메뉴(...) > [앱(Apps)] > [이 사이트를 앱으로 설치]를 클릭하면 Windows 시작메뉴 및 작업표시줄에 등록됩니다.'}
              </p>
            </div>
          </div>

          {/* Footer Close / Action */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400">
              PWA Desktop Certified • Standalone Mode
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
            >
              {lang === 'km' ? 'យល់ព្រម (Close)' : '확인'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
