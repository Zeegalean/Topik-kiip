import React, { useState, useRef, useEffect } from 'react';
import { 
  Language, 
  ApplicationFormData, 
  UploadedDocuments, 
  UserAccount,
  SignatureSettings
} from './types';
import { INITIAL_FORM_DATA, SAMPLE_FORM_DATA, generateSampleArcFront, generateSampleArcBack, generateSampleTopikCert, generateSampleSignature, generateSamplePassport } from './data/sampleData';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { TopikKiipGuide } from './components/TopikKiipGuide';
import { Step1Upload } from './components/Step1Upload';
import { Step2FormTemplate } from './components/Step2FormTemplate';
import { Step3PdfPreview } from './components/Step3PdfPreview';
import { Step4EmailSender } from './components/Step4EmailSender';
import { BackgroundSettingsModal } from './components/BackgroundSettingsModal';
import { PaymentModal } from './components/PaymentModal';
import { SocinetNoticeModal } from './components/SocinetNoticeModal';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { getTranslation } from './utils/translations';
import { cleanVisaStatus, normalizeDocVerificationNo } from './utils/sanitizers';
import { 
  BookOpen, 
  FileCheck2, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Award,
  Lock,
  Shield
} from 'lucide-react';

const DEFAULT_BG_URL = './study_background.jpg';

export default function App() {
  // Language detection with persistence
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('app_user_lang') as Language;
      if (saved) return saved;
    } catch {}
    const navLang = navigator.language.toLowerCase();
    if (navLang.includes('km')) return 'km';
    if (navLang.includes('ko')) return 'ko';
    return 'km'; // Default to Khmer
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('app_user_lang', newLang);
    } catch {}
  };

  const t = getTranslation(lang);

  // Sync html lang and Khmer font styling
  useEffect(() => {
    document.documentElement.lang = lang;
    document.body.dataset.lang = lang;
    if (lang === 'km') {
      document.body.classList.add('lang-khmer');
    } else {
      document.body.classList.remove('lang-khmer');
    }
  }, [lang]);

  // 50 Languages Selector Modal
  const [isLangModalOpen, setIsLangModalOpen] = useState<boolean>(false);

  // Socinet ID & Password Requirement Notice Popup
  const [isSocinetNoticeOpen, setIsSocinetNoticeOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('socinet_notice_dismissed') !== 'true';
    } catch {
      return true;
    }
  });

  // Admin Mode (Protects PC App install and source code packaging from public users)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      if (typeof window !== "undefined") {
        const query = window.location.search.toLowerCase();
        if (query.includes("admin=true") || query.includes("admin=1") || query.includes("admin=zeekhmerads")) {
          localStorage.setItem("kiip_admin_mode", "true");
          return true;
        }
        return localStorage.getItem("kiip_admin_mode") === "true";
      }
    } catch {}
    return false;
  });
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState<boolean>(false);

  // Workflow navigation
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'flow' | 'guide'>('flow');

  // Background Wallpaper State
  const [bgImage, setBgImage] = useState<string | null>(() => {
    const saved = localStorage.getItem('app_custom_bg');
    return saved !== null ? saved : DEFAULT_BG_URL;
  });
  const [bgOpacity, setBgOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('app_bg_opacity');
    return saved ? parseFloat(saved) : 0.22;
  });
  const [isBgModalOpen, setIsBgModalOpen] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<ApplicationFormData>(INITIAL_FORM_DATA);

  // Document Uploads State
  const [docs, setDocs] = useState<UploadedDocuments>({
    arcFront: null,
    arcBack: null,
    passportList: [],
    topikCertList: [],
    signature: null,
    signatureRaw: null,
  });

  // Global Signature Settings State (Move & Resize by hand)
  const [sigSettings, setSigSettings] = useState<SignatureSettings>({
    x: 0,
    y: 0,
    scale: 1.0,
    removeBg: true,
    bgMode: 'transparent',
    inkColor: 'black',
    threshold: 55,
  });

  // User Auth State
  const [user, setUser] = useState<UserAccount>({
    isLoggedIn: false,
    name: '0000 0000',
    email: 'user0000@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    provider: 'guest',
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Payment & Watermark Unlock State (Persisted in localStorage)
  const [isPaid, setIsPaid] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kiip_doc_paid') === 'true';
    } catch {
      return false;
    }
  });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleSkipPayment = () => {
    try {
      localStorage.setItem('kiip_doc_paid', 'true');
    } catch {}
    setIsPaid(true);
    setIsPaymentModalOpen(false);
  };

  // Form element ref for high-resolution canvas snapshot
  const formRef = useRef<HTMLDivElement | null>(null);

  // Keep visaStatus strictly sanitized from corrupted long OCR strings
  useEffect(() => {
    if (formData.visaStatus && (formData.visaStatus.length > 8 || !/^[A-Z0-9-]+$/i.test(formData.visaStatus))) {
      setFormData((prev) => ({
        ...prev,
        visaStatus: cleanVisaStatus(prev.visaStatus),
      }));
    }
  }, [formData.visaStatus]);

  // Keep docVerificationNo strictly formatted as 4 groups of 4 digits
  useEffect(() => {
    if (
      !Array.isArray(formData.docVerificationNo) ||
      formData.docVerificationNo.length !== 4 ||
      formData.docVerificationNo.some((p) => String(p).length !== 4 || /[^0-9]/.test(String(p)))
    ) {
      setFormData((prev) => ({
        ...prev,
        docVerificationNo: normalizeDocVerificationNo(prev.docVerificationNo),
      }));
    }
  }, [formData.docVerificationNo]);

  // Load sample documents in 1-click
  const handleLoadSample = () => {
    const sampleArcFront = generateSampleArcFront();
    const sampleArcBack = generateSampleArcBack();
    const sampleTopik = generateSampleTopikCert();
    const samplePassport = generateSamplePassport();
    const sampleSig = generateSampleSignature();

    setDocs({
      arcFront: sampleArcFront,
      arcFrontName: 'sample_arc_front.png',
      arcBack: sampleArcBack,
      arcBackName: 'sample_arc_back.png',
      passportList: [
        {
          id: 'sample-passport-1',
          dataUrl: samplePassport,
          name: '여권_SOK_SRORNG.png',
        },
      ],
      topikCertList: [
        {
          id: 'sample-topik-1',
          dataUrl: sampleTopik,
          name: '107회_한국어능력시험_성적증명서.png',
        },
      ],
      signature: sampleSig,
      signatureRaw: sampleSig,
    });

    setFormData(SAMPLE_FORM_DATA);
    setActiveTab('flow');
  };

  // Immediate 1-click Test Download handler
  const handleTestDownload = () => {
    // If user has not loaded any documents yet, load sample zeroed documents automatically
    if (!docs.arcFront && !docs.topikCertList.length) {
      handleLoadSample();
    }
    setActiveTab('flow');
    setCurrentStep(3);
  };

  const handleReset = () => {
    if (confirm(t.resetConfirm)) {
      setDocs({
        arcFront: null,
        arcBack: null,
        passportList: [],
        topikCertList: [],
        signature: null,
        signatureRaw: null,
      });
      setSigSettings({
        x: 0,
        y: 0,
        scale: 1.0,
        removeBg: true,
        bgMode: 'transparent',
        inkColor: 'black',
        threshold: 55,
      });
      setFormData(INITIAL_FORM_DATA);
      setCurrentStep(1);
    }
  };

  // Check if all 6 mandatory items in Step 1 are ready:
  // 1. ARC front & back (외국인등록증 앞·뒷면)
  // 2. TOPIK cert (성적증명서)
  // 3. Passport copy (여권 사본)
  // 4. Signature (서명)
  // 5. Socinet Account (ID & Password)
  // 6. Phone (전화번호)
  // (Korean address search, building/mailbox, and official address can be skipped per user requirement)
  const isStep1Ready = Boolean(
    docs.arcFront &&
    docs.arcBack &&
    docs.topikCertList &&
    docs.topikCertList.length > 0 &&
    docs.passportList &&
    docs.passportList.length > 0 &&
    docs.signature &&
    formData.phone &&
    formData.phone.trim().length > 0 &&
    formData.socinetId &&
    formData.socinetId.trim().length > 0 &&
    formData.socinetPw &&
    formData.socinetPw.trim().length > 0
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
      {/* Background Wallpaper Container */}
      {bgImage && (
        <div 
          className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500 ease-out"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            opacity: bgOpacity,
          }}
        />
      )}

      {/* Navigation Bar */}
      <div className="relative z-20">
        <Navbar
          currentStep={currentStep}
          setCurrentStep={(s) => {
            if (s > 1 && !isStep1Ready) {
              return;
            }
            setActiveTab('flow');
            setCurrentStep(s);
          }}
          isStep1Ready={isStep1Ready}
          isAdmin={isAdmin}
          lang={lang}
          setLang={setLang}
          user={user}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={() =>
            setUser({
              isLoggedIn: false,
              name: '',
              email: '',
              avatar: '',
              provider: 'guest',
            })
          }
          onLoadSample={handleLoadSample}
          onTestDownload={handleTestDownload}
          onOpenBgSettings={() => setIsBgModalOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isPaid={isPaid}
          onOpenPayment={() => setIsPaymentModalOpen(true)}
          onOpenSocinetNotice={() => setIsSocinetNoticeOpen(true)}
          onOpenLangModal={() => setIsLangModalOpen(true)}
        />
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        {activeTab === 'guide' ? (
          <TopikKiipGuide
            lang={lang}
            onStartApplication={() => {
              setActiveTab('flow');
              setCurrentStep(1);
            }}
          />
        ) : (
          <div>
            {currentStep === 1 && (
              <Step1Upload
                docs={docs}
                setDocs={setDocs}
                formData={formData}
                setFormData={setFormData}
                lang={lang}
                onNext={() => setCurrentStep(2)}
                onOpenSocinetNotice={() => setIsSocinetNoticeOpen(true)}
              />
            )}

            {currentStep === 2 && (
              <Step2FormTemplate
                formData={formData}
                setFormData={setFormData}
                docs={docs}
                setDocs={setDocs}
                sigSettings={sigSettings}
                setSigSettings={setSigSettings}
                lang={lang}
                onNext={() => setCurrentStep(3)}
                onPrev={() => setCurrentStep(1)}
                formRef={formRef}
                isPaid={isPaid}
                setIsPaid={setIsPaid}
                onOpenPayment={() => setIsPaymentModalOpen(true)}
              />
            )}

            {currentStep === 3 && (
              <Step3PdfPreview
                formData={formData}
                docs={docs}
                setDocs={setDocs}
                sigSettings={sigSettings}
                setSigSettings={setSigSettings}
                lang={lang}
                onNext={() => setCurrentStep(4)}
                onPrev={() => setCurrentStep(2)}
                formRef={formRef}
                isPaid={isPaid}
                onOpenPayment={() => setIsPaymentModalOpen(true)}
                onSkipPayment={handleSkipPayment}
              />
            )}

            {currentStep === 4 && (
              <Step4EmailSender
                formData={formData}
                lang={lang}
                onPrev={() => setCurrentStep(3)}
                onRestart={() => {
                  setCurrentStep(1);
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Payment Checkout Modal (Credit Card & PayPal) */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={() => {
          setIsPaid(true);
          setIsPaymentModalOpen(false);
        }}
        lang={lang}
        formData={formData}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
        lang={lang}
      />

      {/* Background Settings Modal */}
      <BackgroundSettingsModal
        isOpen={isBgModalOpen}
        onClose={() => setIsBgModalOpen(false)}
        bgImage={bgImage}
        setBgImage={setBgImage}
        bgOpacity={bgOpacity}
        setBgOpacity={setBgOpacity}
        defaultBgUrl={DEFAULT_BG_URL}
        isPaid={isPaid}
        setIsPaid={setIsPaid}
        lang={lang}
      />

      {/* Socinet ID & Password Requirement Notice Modal */}
      <SocinetNoticeModal
        isOpen={isSocinetNoticeOpen}
        onClose={() => setIsSocinetNoticeOpen(false)}
        lang={lang}
      />

      {/* 50 Languages Search & Selector Modal */}
      <LanguageSelectorModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        currentLang={lang}
        onSelectLang={(newLang) => setLang(newLang)}
      />

      {/* Admin Auth Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={() => setIsAdmin(true)}
        lang={lang}
      />

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-xs border-t border-slate-200 py-6 text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">
              {t.footerTitle}
            </span>
            <span>·</span>
            <span>
              {t.footerSubtitle}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>{t.footerIntegration}</span>
            <span>·</span>
            <span>{t.footerSupport}</span>
            <span>·</span>
            {isAdmin ? (
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-2xs">
                <Shield className="w-3 h-3 text-emerald-600" />
                <span>Admin Mode ON (PC App បើក)</span>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("kiip_admin_mode");
                    setIsAdmin(false);
                  }}
                  className="text-red-600 hover:text-red-800 underline ml-1 cursor-pointer font-bold"
                  title="បិទ Admin Mode"
                >
                  បិទ/Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAdminAuthOpen(true)}
                className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
                title="Admin Access"
              >
                <Lock className="w-3 h-3" />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
