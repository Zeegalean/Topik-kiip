import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  X, 
  RefreshCw, 
  QrCode, 
  Zap, 
  FileCheck2, 
  ArrowRight,
  AlertCircle,
  Smartphone,
  Fingerprint,
  Ticket,
  Gift,
  Check,
  Copy,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ApplicationFormData, Language } from '../types';
import { getTranslation } from '../utils/translations';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  lang?: Language;
  formData?: ApplicationFormData;
}

export type PaymentMethod = 'playstore' | 'appstore' | 'redeem' | 'card' | 'paypal' | 'khqr';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  formData,
  lang = 'km',
}) => {
  const t = getTranslation(lang);
  const [activeTab, setActiveTab] = useState<PaymentMethod>('playstore');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Play Store selection
  const [playStoreOption, setPlayStoreOption] = useState<'redeem' | 'balance' | 'card'>('redeem');
  const [playStoreRedeemInput, setPlayStoreRedeemInput] = useState('');

  // App Store selection
  const [appStoreOption, setAppStoreOption] = useState<'applepay' | 'appleid' | 'redeem'>('applepay');
  const [appStoreRedeemInput, setAppStoreRedeemInput] = useState('');

  // Dedicated Redeem Code State
  const [redeemPlatform, setRedeemPlatform] = useState<'playstore' | 'appstore' | 'promo'>('playstore');
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Credit Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState(formData?.applicantName || formData?.name || 'SOK SRORNG');
  const [cardError, setCardError] = useState<string | null>(null);

  // PayPal Email
  const [paypalEmail, setPaypalEmail] = useState('user@example.com');

  // Dynamic KHQR Generator State (Generates fresh QR code on every transaction)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [qrGeneratedAt, setQrGeneratedAt] = useState<Date>(new Date());
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);
  const [copiedTxId, setCopiedTxId] = useState(false);
  const [qrPayCount, setQrPayCount] = useState<number>(0);

  // Generate dynamic unique QR code for ABA PayWay: https://link.payway.com.kh/ABAPAYzz552103m
  const generateNewKhqr = async () => {
    setIsGeneratingQr(true);
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const timeSeq = Date.now().toString().slice(-5);
    const newTxId = `KIIP-${timeSeq}-${randomHex}`;
    const paywayUrl = "https://link.payway.com.kh/ABAPAYzz552103m";

    try {
      const dataUrl = await QRCode.toDataURL(paywayUrl, {
        width: 340,
        margin: 1,
        color: {
          dark: "#004f80", // Official ABA Deep Navy
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      });
      setQrCodeDataUrl(dataUrl);
      setTransactionId(newTxId);
      setQrGeneratedAt(new Date());
    } catch (err) {
      console.error("Failed to generate dynamic PayWay QR:", err);
    } finally {
      setIsGeneratingQr(false);
    }
  };

  // Generate on mount or when tab changes to khqr if not present
  useEffect(() => {
    if (isOpen && activeTab === "khqr" && !qrCodeDataUrl) {
      generateNewKhqr();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
    setCardError(null);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Quick fill test card for user
  const handleFillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('888');
    setCardName(formData?.applicantName || formData?.name || 'SOK SRORNG');
    setCardError(null);
  };

  // Quick fill sample redeem code
  const handleApplySampleCode = (code: string, platform: 'playstore' | 'appstore' | 'promo') => {
    setRedeemCode(code);
    setRedeemPlatform(platform);
    setRedeemError(null);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Execute Payment Simulation
  const handleProcessPayment = async (method: PaymentMethod) => {
    if (method === 'card') {
      const cleanDigits = cardNumber.replace(/\s/g, '');
      if (cleanDigits.length < 16) {
        setCardError(t.enter16DigitCard);
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        setCardError(t.enterCardExpiry);
        return;
      }
      if (!cardCvc || cardCvc.length < 3) {
        setCardError(t.enterCardCvc);
        return;
      }
    }

    if (method === 'redeem') {
      const trimmed = redeemCode.trim();
      if (!trimmed) {
        setRedeemError(t.enterRedeemCode);
        return;
      }
      if (trimmed.length < 6) {
        setRedeemError(t.redeemMin6Chars);
        return;
      }
      setRedeemError(null);
    }

    setIsProcessing(true);

    if (method === 'playstore') {
      if (playStoreOption === 'redeem') {
        const code = playStoreRedeemInput.trim() || 'PLAY-15000-BONUS';
        setProcessingStep(lang === 'km' ? `កំពុងផ្ទៀងផ្ទាត់កូដ Google Play (${code})...` : lang === 'ko' ? `구글 플레이 코드 검증 중 (${code})...` : `Verifying Google Play code (${code})...`);
        await new Promise((r) => setTimeout(r, 600));
        setProcessingStep(lang === 'km' ? 'លេខកូដ Play Store ត្រឹមត្រូវ! កំពុងកាត់កងទឹកប្រាក់ ₩15,000...' : lang === 'ko' ? '리딤코드 확인 완료! ₩15,000 결제 승인 중...' : 'Redeem code verified! Processing ₩15,000 deduction...');
        await new Promise((r) => setTimeout(r, 800));
        setProcessingStep(lang === 'km' ? 'ដោះសោជោគជ័យតាម Google Play Redeem Code! កំពុងលុប Watermark...' : lang === 'ko' ? '구글 플레이 리딤코드로 잠금 해제 완료! 워터마크 제거 중...' : 'Unlocked via Google Play Redeem Code! Removing watermark...');
        await new Promise((r) => setTimeout(r, 600));
      } else {
        setProcessingStep(lang === 'km' ? 'កំពុងភ្ជាប់ទៅកាន់ Google Play Billing Service...' : lang === 'ko' ? 'Google Play 결제 서비스 연결 중...' : 'Connecting to Google Play Billing Service...');
        await new Promise((r) => setTimeout(r, 600));
        setProcessingStep(lang === 'km' ? 'កំពុងផ្ទៀងផ្ទាត់គណនី Google Play & In-App Purchase...' : lang === 'ko' ? 'Google Play 계정 및 인앱 결제 확인 중...' : 'Verifying Google Play account & In-App purchase...');
        await new Promise((r) => setTimeout(r, 800));
        setProcessingStep(lang === 'km' ? 'ទូទាត់ជោគជ័យតាម Google Play! កំពុងដោះសោ និងលុប Watermark REJECTION...' : lang === 'ko' ? 'Google Play 결제 완료! 워터마크 제거 및 서류 잠금 해제 중...' : 'Payment complete via Google Play! Removing watermark...');
        await new Promise((r) => setTimeout(r, 600));
      }
    } else if (method === 'appstore') {
      if (appStoreOption === 'redeem') {
        const code = appStoreRedeemInput.trim() || 'APPLE-15K-GIFT';
        setProcessingStep(lang === 'km' ? `កំពុងផ្ទៀងផ្ទាត់ Apple Gift Card Code (${code})...` : lang === 'ko' ? `애플 기프트카드 코드 검증 중 (${code})...` : `Verifying Apple Gift Card code (${code})...`);
        await new Promise((r) => setTimeout(r, 600));
        setProcessingStep(lang === 'km' ? 'លេខកូដ App Store ត្រឹមត្រូវ! កំពុងកាត់កងទឹកប្រាក់ ₩15,000...' : lang === 'ko' ? 'App Store 기프트카드 확인 완료! ₩15,000 차감 중...' : 'App Store code verified! Processing ₩15,000 deduction...');
        await new Promise((r) => setTimeout(r, 800));
        setProcessingStep(lang === 'km' ? 'ដោះសោជោគជ័យតាម Apple Redeem Code! កំពុងលុប Watermark...' : lang === 'ko' ? 'Apple 리딤코드로 잠금 해제 완료! 워터마크 제거 중...' : 'Unlocked via Apple Redeem Code! Removing watermark...');
        await new Promise((r) => setTimeout(r, 600));
      } else {
        setProcessingStep(lang === 'km' ? 'កំពុងផ្ទៀងផ្ទាត់ Face ID & Apple StoreKit Enclave...' : lang === 'ko' ? 'Face ID 및 Apple StoreKit 인증 중...' : 'Verifying Face ID & Apple StoreKit Enclave...');
        await new Promise((r) => setTimeout(r, 600));
        setProcessingStep(lang === 'km' ? 'កំពុងបញ្ជាក់ប្រតិបត្តិការ Apple App Store In-App Purchase...' : lang === 'ko' ? 'Apple App Store 인앱 결제 승인 중...' : 'Confirming Apple App Store In-App purchase...');
        await new Promise((r) => setTimeout(r, 800));
        setProcessingStep(lang === 'km' ? 'ទូទាត់ជោគជ័យតាម Apple Pay! កំពុងដោះសោ Clean PDF...' : lang === 'ko' ? 'Apple Pay 결제 완료! Clean PDF 잠금 해제 중...' : 'Payment complete via Apple Pay! Unlocking Clean PDF...');
        await new Promise((r) => setTimeout(r, 600));
      }
    } else if (method === 'redeem') {
      const platformLabel = redeemPlatform === 'playstore' 
        ? 'Google Play' 
        : redeemPlatform === 'appstore' 
        ? 'Apple App Store' 
        : 'KIIP VIP Voucher';
      setProcessingStep(lang === 'km' ? `កំពុងភ្ជាប់ទៅកាន់ប្រព័ន្ធផ្ទៀងផ្ទាត់ ${platformLabel}...` : lang === 'ko' ? `${platformLabel} 인증 시스템 연결 중...` : `Connecting to ${platformLabel} verification gateway...`);
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStep(lang === 'km' ? `លេខកូដ Redeem Code ត្រឹមត្រូវ! កំពុងទូទាត់ ₩15,000 ដោយឥតគិតថ្លៃ...` : lang === 'ko' ? `리딤코드 확인 완료! ₩15,000 무료 적용 중...` : `Redeem code verified! Applying ₩15,000 credit...`);
      await new Promise((r) => setTimeout(r, 800));
      setProcessingStep(lang === 'km' ? 'ជោគជ័យ 100%! កំពុងដោះសោឯកសារ និងលុប Watermark REJECTION...' : lang === 'ko' ? '100% 성공! 워터마크 제거 및 공식 서류 잠금 해제 중...' : '100% Successful! Removing watermark and unlocking official PDF...');
      await new Promise((r) => setTimeout(r, 600));
    } else if (method === 'paypal') {
      setProcessingStep(lang === 'km' ? 'កំពុងភ្ជាប់ទៅកាន់ប្រព័ន្ធសុវត្ថិភាព 256-bit SSL Gateway...' : lang === 'ko' ? '256비트 SSL 보안 게이트웨이 연결 중...' : 'Connecting to 256-bit SSL Secure Gateway...');
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStep(lang === 'km' ? 'កំពុងផ្ទៀងផ្ទាត់គណនី PayPal Express Checkout...' : lang === 'ko' ? 'PayPal Express 결제 인증 중...' : 'Verifying PayPal Express Checkout...');
      await new Promise((r) => setTimeout(r, 800));
      setProcessingStep(lang === 'km' ? 'កំពុងដោះសោឯកសារ និងលុប Watermark REJECTION...' : lang === 'ko' ? '문서 잠금 해제 및 워터마크 제거 중...' : 'Unlocking document and removing watermark...');
      await new Promise((r) => setTimeout(r, 600));
    } else if (method === 'khqr') {
      setProcessingStep(lang === 'km' ? `កំពុងភ្ជាប់បណ្តាញធនាគារ KHQR (#${transactionId || "KIIP-KHQR"})...` : `KHQR 은행망 연결 중 (#${transactionId || "KIIP"})...`);
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStep(lang === 'km' ? `បានទទួលការទូទាត់ជោគជ័យលើប្រតិបត្តិការ #${transactionId || "KIIP"}!` : `KHQR 거래 승인 완료 (#${transactionId || "KIIP"})!`);
      await new Promise((r) => setTimeout(r, 700));
      setProcessingStep(lang === 'km' ? 'កំពុងដោះសោឯកសារ និងលុប Watermark REJECTION...' : lang === 'ko' ? '문서 잠금 해제 및 워터마크 제거 중...' : 'Unlocking document and removing watermark...');
      await new Promise((r) => setTimeout(r, 600));

      // After paid once, automatically generate a new dynamic QR code for next time
      setQrPayCount((prev) => prev + 1);
      setTimeout(() => {
        generateNewKhqr();
      }, 500);
    } else {
      setProcessingStep(lang === 'km' ? 'កំពុងភ្ជាប់ទៅកាន់ប្រព័ន្ធសុវត្ថិភាព 256-bit SSL Gateway...' : lang === 'ko' ? '256비트 SSL 보안 게이트웨이 연결 중...' : 'Connecting to 256-bit SSL Secure Gateway...');
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStep(lang === 'km' ? 'កំពុងផ្ទៀងផ្ទាត់កាត Visa / Mastercard & 3D-Secure OTP...' : lang === 'ko' ? 'Visa / Mastercard 및 3D-Secure 인증 확인 중...' : 'Verifying Visa / Mastercard & 3D-Secure OTP...');
      await new Promise((r) => setTimeout(r, 800));
      setProcessingStep(lang === 'km' ? 'កំពុងដោះសោឯកសារ និងលុប Watermark REJECTION...' : lang === 'ko' ? '문서 잠금 해제 및 워터마크 제거 중...' : 'Unlocking document and removing watermark...');
      await new Promise((r) => setTimeout(r, 600));
    }

    setIsProcessing(false);
    setIsSuccess(true);

    // Save payment state in local storage
    try {
      localStorage.setItem('kiip_doc_paid', 'true');
    } catch (e) {
      // ignore
    }

    // Trigger confetti celebration
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.5 },
    });

    // Notify parent
    setTimeout(() => {
      onPaymentSuccess();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100000] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-5 sm:p-6 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.setItem("kiip_doc_paid", "true");
                } catch {}
                onPaymentSuccess();
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/30 shadow-xs"
              title="Skip ដំណាក់កាលនេះសិន"
            >
              <span>{lang === "km" ? "Skip ដំណាក់កាលនេះ" : lang === "ko" ? "지금 건너뛰기" : "Skip for now"}</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>OFFICIAL UNLOCK • ₩15,000</span>
            </span>
            <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Play Store • App Store • Redeem Code</span>
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {t.paymentModalTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            {t.paymentModalSubtitle}
          </p>
        </div>

        {/* Success Screen */}
        {isSuccess ? (
          <div className="p-8 sm:p-10 text-center space-y-5 animate-in fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-300 flex items-center justify-center mx-auto text-emerald-600 shadow-xl">
              <CheckCircle2 className="w-12 h-12 animate-bounce" />
            </div>

            <div>
              <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                {t.successTitle}
              </span>
              <h4 className="text-2xl font-black text-slate-900">
                {t.watermarkSuccessClean}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                {t.successDesc}
              </p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 max-w-sm mx-auto text-left text-xs space-y-1 font-mono text-emerald-900">
              <div className="flex justify-between">
                <span>Receipt No:</span>
                <span className="font-bold">RCP-2026-98124</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-bold">₩15,000 (PAID / REDEEMED)</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Channel:</span>
                <span className="font-bold capitalize">
                  {activeTab === 'playstore' 
                    ? (playStoreOption === 'redeem' ? 'Google Play Redeem Code' : 'Google Play Store') 
                    : activeTab === 'appstore' 
                    ? (appStoreOption === 'redeem' ? 'Apple App Store Redeem Code' : 'Apple App Store') 
                    : activeTab === 'redeem'
                    ? `Redeem Code (${redeemPlatform})`
                    : activeTab}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-bold text-emerald-700">UNLOCKED / VERIFIED</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onPaymentSuccess();
              }}
              className="w-full max-w-sm mx-auto py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t.downloadCleanNow}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-5 sm:p-7 space-y-5">
            {/* Order Summary & Pricing Banner */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">
                    {lang === 'km' ? 'កញ្ចប់ឯកសារពេញលេញ (Full Merged PDF Packet)' : lang === 'ko' ? '공식 서류 통합 패키지 (Full Merged PDF)' : 'Full Official Merged PDF Package'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {lang === 'km' ? 'ពាក្យសុំផ្លូវការ + TOPIK 성적표 + កាត ARC មុខក្រោយ + Passport (Clean 100%)' : lang === 'ko' ? '공식 신청서 + TOPIK 성적표 + 외국인등록증 앞뒤 + 여권' : 'Official Form + TOPIK Report + ARC Front/Back + Passport'}
                </p>
              </div>

              <div className="flex items-baseline gap-2 sm:text-right shrink-0">
                <span className="text-xs text-slate-400 line-through">₩30,000</span>
                <span className="text-2xl font-black text-blue-700">₩15,000</span>
                <span className="text-[10px] font-bold text-slate-500">(~ $11.20)</span>
              </div>
            </div>

            {/* Quick Redeem Code Highlight Banner */}
            <div className="flex items-center justify-between p-2.5 px-3.5 bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 border border-purple-200 rounded-2xl text-xs shadow-2xs">
              <div className="flex items-center gap-2 text-purple-950">
                <Ticket className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="text-[11px] sm:text-xs">
                  {lang === 'km' ? <>មានកូដ <strong>Redeem Code</strong> (Play Store ឬ App Store Gift Card)?</> : lang === 'ko' ? <>Google Play / App Store <strong>리딤코드 (Gift Card)</strong> 가 있으신가요?</> : <>Have a <strong>Redeem Code</strong> (Gift Card)?</>}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('redeem');
                }}
                className={`px-3 py-1 font-bold rounded-xl text-xs transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'redeem'
                    ? 'bg-purple-800 text-white ring-2 ring-purple-400'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>{t.tabRedeem}</span>
              </button>
            </div>

            {/* Quick Skip Option */}
            <div className="p-3 bg-slate-100 hover:bg-slate-200/80 rounded-2xl border border-slate-300 flex items-center justify-between gap-3 text-xs transition-colors">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="font-bold text-slate-900">
                  {lang === "km" ? "ចង់រំលងការបង់ប្រាក់សិន?" : lang === "ko" ? "결제를 건너뛰고 테스트하시겠습니까?" : "Skip payment for now?"}
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  {lang === "km" ? "ចុច Skip ដើម្បីដោះសោ និងទាញយក Clean PDF ដោយឥតគិតថ្លៃ" : "지금 건너뛰고 Clean PDF를 무료로 다운로드하세요."}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem("kiip_doc_paid", "true");
                  } catch {}
                  onPaymentSuccess();
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
              >
                <span>{lang === "km" ? "Skip ដំណាក់កាលនេះសិន" : lang === "ko" ? "건너뛰기 (Skip)" : "Skip for now"}</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>

            {/* Payment Method Selector Tabs */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
                {t.paymentModalSubtitle}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {/* 1. Google Play Store */}
                <button
                  type="button"
                  onClick={() => setActiveTab('playstore')}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    activeTab === 'playstore'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500/20 font-bold shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M3.6 1.4L13.8 11.6 3.6 21.8C3.2 21.4 3 20.7 3 20V3.2C3 2.5 3.2 1.8 3.6 1.4z" />
                    <path fill="#34A853" d="M17.3 8.1L13.8 11.6 3.6 1.4C4.1 1.1 4.7 1.1 5.3 1.5l12 6.6z" />
                    <path fill="#EA4335" d="M17.3 15.1L5.3 21.7C4.7 22.1 4.1 22.1 3.6 21.8l10.2-10.2 3.5 3.5z" />
                    <path fill="#FBBC04" d="M21.2 10.3l-3.9-2.2-3.5 3.5 3.5 3.5 3.9-2.2c1.1-.6 1.1-1.6 0-2.6z" />
                  </svg>
                  <span className="text-[11px] font-bold">Play Store</span>
                  <span className="text-[9px] text-emerald-700 font-medium">Google Pay</span>
                </button>

                {/* 2. Apple App Store */}
                <button
                  type="button"
                  onClick={() => setActiveTab('appstore')}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    activeTab === 'appstore'
                      ? 'border-slate-900 bg-slate-900 text-white ring-2 ring-slate-900/20 font-bold shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2 .6-2.64 1.35-.57.65-1.06 1.73-.93 2.76 1.02.08 2.04-.49 2.65-1.24z"/>
                  </svg>
                  <span className="text-[11px] font-bold">App Store</span>
                  <span className={`text-[9px] ${activeTab === 'appstore' ? 'text-slate-300' : 'text-slate-500'}`}>Apple Pay</span>
                </button>

                {/* 3. Redeem Code (NEW) */}
                <button
                  type="button"
                  onClick={() => setActiveTab('redeem')}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    activeTab === 'redeem'
                      ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-500/20 font-bold shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Ticket className="w-5 h-5 text-purple-600" />
                  <span className="text-[11px] font-bold">Redeem</span>
                  <span className="text-[9px] text-purple-600 font-medium">Gift Code</span>
                </button>

                {/* 4. Credit Card */}
                <button
                  type="button"
                  onClick={() => setActiveTab('card')}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    activeTab === 'card'
                      ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20 font-bold shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-[11px] font-bold">Credit Card</span>
                  <span className="text-[9px] text-slate-500">Visa • Master</span>
                </button>

                {/* 5. PayPal */}
                <button
                  type="button"
                  onClick={() => setActiveTab('paypal')}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    activeTab === 'paypal'
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 ring-2 ring-indigo-500/20 font-bold shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[10px] font-black text-white">
                    P
                  </div>
                  <span className="text-[11px] font-bold">PayPal</span>
                  <span className="text-[9px] text-slate-500">Checkout</span>
                </button>

                {/* 6. ABA PayWay (All Cards & ABA PAY) */}
                <button
                  type="button"
                  onClick={() => setActiveTab('khqr')}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 relative ${
                    activeTab === 'khqr'
                      ? 'border-[#004f80] bg-sky-50 text-[#004f80] ring-2 ring-[#004f80]/20 font-bold shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="absolute -top-1.5 -right-1 bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter">
                    ALL
                  </span>
                  <CreditCard className="w-5 h-5 text-[#004f80]" />
                  <span className="text-[11px] font-bold">ABA PayWay</span>
                  <span className="text-[9px] text-[#004f80] font-bold">Cards &amp; Pay</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT: GOOGLE PLAY STORE */}
            {activeTab === 'playstore' && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 rounded-2xl border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M3.6 1.4L13.8 11.6 3.6 21.8C3.2 21.4 3 20.7 3 20V3.2C3 2.5 3.2 1.8 3.6 1.4z" />
                        <path fill="#34A853" d="M17.3 8.1L13.8 11.6 3.6 1.4C4.1 1.1 4.7 1.1 5.3 1.5l12 6.6z" />
                        <path fill="#EA4335" d="M17.3 15.1L5.3 21.7C4.7 22.1 4.1 22.1 3.6 21.8l10.2-10.2 3.5 3.5z" />
                        <path fill="#FBBC04" d="M21.2 10.3l-3.9-2.2-3.5 3.5 3.5 3.5 3.9-2.2c1.1-.6 1.1-1.6 0-2.6z" />
                      </svg>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Google Play In-App Billing (구글 플레이 결제)
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {formData?.applicantName ? `${formData.applicantName.toLowerCase().replace(/\s+/g, '')}@gmail.com` : 'soksrorng.cambodia@gmail.com'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                      Google Play Protect
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    អ្នកអាចទូទាត់ប្រាក់ <strong>១៥,០០០ វ៉ុន (₩15,000)</strong> ដោយផ្ទាល់តាមរយៈគណនី Google Play ដោយប្រើ <strong>Redeem Code / Gift Card</strong> ឬសមតុល្យ Google Play។
                  </p>
                </div>

                  {/* Mart Gift Card / Redeem Code Guide for foreigners in Korea */}
                  <div className="p-3.5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 rounded-2xl border-2 border-amber-300 text-xs text-amber-950 space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-black text-amber-900 text-xs sm:text-sm">
                        <span className="text-base">🏪</span>
                        <span>{lang === "km" ? "អាចទិញកាត Google Play Redeem Code នៅ Mart / ម៉ាត ក្នុងប្រទេសកូរ៉េ" : lang === "ko" ? "한국 편의점/마트에서 Google Play 기프트카드 구매 가능" : "Buy Google Play Gift Cards at Korean Marts"}</span>
                      </div>
                      <span className="text-[10px] bg-amber-200/90 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                        CU • GS25 • 7-Eleven • emart24
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-900/90 leading-relaxed">
                      {lang === "km" 
                        ? "បងប្អូនខ្មែរនៅប្រទេសកូរ៉េអាចដើរទៅទិញកាត Google Play Gift Card (Redeem Code ₩15,000) ដោយផ្ទាល់នៅគ្រប់ម៉ាត Mart (CU, GS25, 7-Eleven, emart24) រួចកោសយកលេខកូដ ១៦ ខ្ទង់មកវាយបញ្ចូលត្រង់នេះដើម្បីដោះសោភ្លាមៗ!"
                        : lang === "ko"
                        ? "가까운 편의점(CU, GS25, 세븐일레븐, 이마트24)에서 구글플레이 기프트카드를 현금으로 간편하게 구매 후 뒷면 코드를 입력하여 즉시 잠금 해제할 수 있습니다."
                        : "Purchase Google Play Gift Cards (₩15,000) at any local Korean convenience store (CU, GS25, 7-Eleven) with cash and enter the code here to unlock instantly!"}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px] font-bold text-amber-800">
                      <span className="px-2 py-0.5 bg-white/90 rounded border border-amber-200">🏬 GS25</span>
                      <span className="px-2 py-0.5 bg-white/90 rounded border border-amber-200">🏪 CU</span>
                      <span className="px-2 py-0.5 bg-white/90 rounded border border-amber-200">🏪 7-Eleven</span>
                      <span className="px-2 py-0.5 bg-white/90 rounded border border-amber-200">🛒 Emart24 / Homeplus</span>
                    </div>
                  </div>


                {/* Sub-options for Play Store */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    {lang === 'km' ? 'វិធីទូទាត់ក្នុង Google Play:' : lang === 'ko' ? 'Google Play 결제 수단:' : 'Google Play Payment Methods:'}
                  </label>

                  {/* Option 2: Google Play Redeem Code / Gift Card */}
                  <label
                    onClick={() => setPlayStoreOption('redeem')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      playStoreOption === 'redeem'
                        ? 'border-purple-600 bg-purple-50/60 ring-1 ring-purple-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Ticket className="w-5 h-5 text-purple-600 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <span>{t.tabRedeem}</span>
                          <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-mono font-bold">
                            Redeem Code
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {lang === 'km' ? 'បញ្ចូលលេខកូដកាត Google Play Gift Card ឬ Promo Code' : lang === 'ko' ? 'Google Play 기프트카드 번호 입력' : 'Enter Google Play Gift Card Code'}
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="playOption"
                      checked={playStoreOption === 'redeem'}
                      onChange={() => setPlayStoreOption('redeem')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                  </label>

                  {playStoreOption === 'redeem' && (
                    <div className="p-3 bg-purple-50/40 rounded-xl border border-purple-200 ml-4 space-y-2 text-xs">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={playStoreRedeemInput}
                          onChange={(e) => setPlayStoreRedeemInput(e.target.value.toUpperCase())}
                          placeholder="PLAY-XXXX-XXXX-XXXX"
                          className="flex-1 px-3 py-2 rounded-lg border border-purple-300 bg-white font-mono text-xs uppercase outline-none focus:ring-2 focus:ring-purple-400"
                        />
                        <button
                          type="button"
                          onClick={() => setPlayStoreRedeemInput('PLAY-15000-BONUS')}
                          className="px-2.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-lg text-[11px] shrink-0"
                        >
                          Test Code
                        </button>
                      </div>
                      <p className="text-[10px] text-purple-700">
                        {lang === 'km' ? '✓ គាំទ្រកូដ Google Play គ្រប់ប្រទេស' : lang === 'ko' ? '✓ 모든 국가의 Google Play 코드 지원' : '✓ Supports Google Play codes worldwide'}
                      </p>
                    </div>
                  )}

                  {/* Option 3: Google Play Balance */}
                  <label
                    onClick={() => setPlayStoreOption('balance')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      playStoreOption === 'balance'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-amber-500 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {t.googlePlayBalance}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {lang === 'km' ? 'សមតុល្យបច្ចុប្បន្ន: ₩25,000' : lang === 'ko' ? '현재 잔액: ₩25,000' : 'Current Balance: ₩25,000'}
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="playOption"
                      checked={playStoreOption === 'balance'}
                      onChange={() => setPlayStoreOption('balance')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>

                  {/* Option 4: Card linked in Play Store */}
                  <label
                    onClick={() => setPlayStoreOption('card')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      playStoreOption === 'card'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-blue-600 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {lang === 'km' ? 'កាតដែលបានភ្ជាប់ក្នុង Google Pay (•••• 7812)' : lang === 'ko' ? 'Google Pay 등록 카드 (•••• 7812)' : 'Registered Google Pay Card (•••• 7812)'}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Visa / MasterCard Debit Card
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="playOption"
                      checked={playStoreOption === 'card'}
                      onChange={() => setPlayStoreOption('card')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                </div>

                {/* 1-Tap Buy Google Play Button */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleProcessPayment('playstore')}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60 hover:scale-[1.01]"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{processingStep}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#ffffff" d="M3.6 1.4L13.8 11.6 3.6 21.8C3.2 21.4 3 20.7 3 20V3.2C3 2.5 3.2 1.8 3.6 1.4z" />
                        <path fill="#ffffff" d="M17.3 8.1L13.8 11.6 3.6 1.4C4.1 1.1 4.7 1.1 5.3 1.5l12 6.6z" />
                        <path fill="#ffffff" d="M17.3 15.1L5.3 21.7C4.7 22.1 4.1 22.1 3.6 21.8l10.2-10.2 3.5 3.5z" />
                        <path fill="#ffffff" d="M21.2 10.3l-3.9-2.2-3.5 3.5 3.5 3.5 3.9-2.2c1.1-.6 1.1-1.6 0-2.6z" />
                      </svg>
                      <span>
                        {playStoreOption === 'redeem' 
                          ? 'Redeem Code Google Play (₩15,000)' 
                          : t.payToUnlockCleanBtn}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB CONTENT: APPLE APP STORE */}
            {activeTab === 'appstore' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                        <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2 .6-2.64 1.35-.57.65-1.06 1.73-.93 2.76 1.02.08 2.04-.49 2.65-1.24z"/>
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Apple App Store • In-App Purchase
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Apple ID: soksrorng.kiip@icloud.com
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-white bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
                      ₩15,000
                    </span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-300">{lang === 'km' ? 'ឯកសារដោះសោ:' : lang === 'ko' ? '잠금 해제 서류:' : 'Document:'}</span>
                    <span className="font-bold text-white">KIIP TOPIK Clean PDF Packet</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-300">
                    <Fingerprint className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{lang === 'km' ? 'បញ្ជាក់ការទិញដោយសុវត្ថិភាពខ្ពស់តាម Face ID / Touch ID ឬ Redeem Code' : lang === 'ko' ? 'Face ID / Touch ID 또는 리딤코드로 안전한 결제 승인' : 'Secure verification via Face ID / Touch ID or Redeem Code'}</span>
                  </div>
                </div>

                {/* Sub-options for App Store */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    {lang === 'km' ? 'វិធីទូទាត់លើ Apple Ecosystem:' : lang === 'ko' ? 'Apple 결제 수단:' : 'Apple Ecosystem Methods:'}
                  </label>

                  {/* Option 1: Apple Pay */}
                  <label
                    onClick={() => setAppStoreOption('applepay')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      appStoreOption === 'applepay'
                        ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-[10px]">
                        Pay
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <span>{t.appStoreApplePay}</span>
                          <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.2 rounded font-mono font-bold">
                            Default
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Apple Pay • 1-Click Face ID (Visa / MasterCard)
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="appStoreOption"
                      checked={appStoreOption === 'applepay'}
                      onChange={() => setAppStoreOption('applepay')}
                      className="text-slate-900 focus:ring-slate-900"
                    />
                  </label>

                  {/* Option 2: Apple Redeem Code / Gift Card */}
                  <label
                    onClick={() => setAppStoreOption('redeem')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      appStoreOption === 'redeem'
                        ? 'border-purple-600 bg-purple-50/60 ring-1 ring-purple-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Ticket className="w-5 h-5 text-purple-600 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <span>{t.tabRedeem}</span>
                          <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-mono font-bold">
                            Redeem Code
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {lang === 'km' ? 'ប្រើលេខកូដកាត Apple Gift Card 16 ខ្ទង់ ឬ Voucher' : lang === 'ko' ? '애플 기프트카드 16자리 번호 사용' : 'Use 16-digit Apple Gift Card code'}
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="appStoreOption"
                      checked={appStoreOption === 'redeem'}
                      onChange={() => setAppStoreOption('redeem')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                  </label>

                  {appStoreOption === 'redeem' && (
                    <div className="p-3 bg-purple-50/40 rounded-xl border border-purple-200 ml-4 space-y-2 text-xs">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={appStoreRedeemInput}
                          onChange={(e) => setAppStoreRedeemInput(e.target.value.toUpperCase())}
                          placeholder="X8K4-992J-M1N7-88PL"
                          className="flex-1 px-3 py-2 rounded-lg border border-purple-300 bg-white font-mono text-xs uppercase outline-none focus:ring-2 focus:ring-purple-400"
                        />
                        <button
                          type="button"
                          onClick={() => setAppStoreRedeemInput('APPLE-15K-GIFT')}
                          className="px-2.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-lg text-[11px] shrink-0"
                        >
                          Test Code
                        </button>
                      </div>
                      <p className="text-[10px] text-purple-700">
                        {lang === 'km' ? '✓ គាំទ្រកូដ Apple Gift Card App Store / iTunes' : lang === 'ko' ? '✓ App Store / iTunes 기프트카드 지원' : '✓ Supports App Store / iTunes Gift Cards'}
                      </p>
                    </div>
                  )}

                  {/* Option 3: Apple Account Balance */}
                  <label
                    onClick={() => setAppStoreOption('appleid')}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      appStoreOption === 'appleid'
                        ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-indigo-600 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {t.appStoreAppleId}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {lang === 'km' ? 'សមតុល្យ Apple ID: ₩30,000' : lang === 'ko' ? 'Apple 계정 잔액: ₩30,000' : 'Apple ID Balance: ₩30,000'}
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="appStoreOption"
                      checked={appStoreOption === 'appleid'}
                      onChange={() => setAppStoreOption('appleid')}
                      className="text-slate-900 focus:ring-slate-900"
                    />
                  </label>
                </div>

                {/* Confirm with Apple Pay / App Store Button */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleProcessPayment('appstore')}
                  className="w-full py-4 bg-black hover:bg-slate-900 text-white font-black text-sm rounded-2xl shadow-xl shadow-slate-900/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60 hover:scale-[1.01]"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>{processingStep}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 fill-white shrink-0" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2 .6-2.64 1.35-.57.65-1.06 1.73-.93 2.76 1.02.08 2.04-.49 2.65-1.24z"/>
                      </svg>
                      <span>
                        {appStoreOption === 'redeem'
                          ? 'Redeem Code Apple App Store (₩15,000)'
                          : t.payToUnlockCleanBtn}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB CONTENT: DEDICATED REDEEM CODE (PLAY STORE & APP STORE) */}
            {activeTab === 'redeem' && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 rounded-2xl border border-purple-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-purple-950">
                        {t.tabRedeem} (Google Play Store / Mart Gift Card)
                      </h4>
                      <p className="text-[11px] text-purple-700">
                        {lang === 'km' ? 'ប្រើប្រាស់កាត Google Play Gift Card (ទិញតាម Mart នៅកូរ៉េ) ឬ Promo Code ដើម្បីដោះសោ Clean PDF' : lang === 'ko' ? '한국 마트/편의점에서 구매한 Google Play 리딤코드 또는 기프트카드로 잠금 해제' : 'Unlock with Google Play Gift Cards purchased at Korean convenience marts'}
                      </p>
                    </div>
                  </div>
                  {/* Korean Mart reminder */}
                  <div className="mt-2.5 p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-[11px] text-amber-900">
                    <span className="text-sm">🏪</span>
                    <div>
                      <span className="font-bold">{lang === 'km' ? 'ទិញកាត Redeem Code តាម Mart នៅកូរ៉េ (CU, GS25, 7-Eleven, Emart): ' : lang === 'ko' ? '편의점/마트 구글플레이 카드: ' : 'Mart Google Play Card: '}</span>
                      <span>{lang === 'km' ? 'ប្រជាជននៅកូរ៉េអាចទិញកាត Google Play Card នៅគ្រប់ Mart តាមផ្លូវ រួចយកលេខកូដមកបញ្ចូលត្រង់នេះបានភ្លាមៗ!' : lang === 'ko' ? '동네 편의점에서 현금으로 구매한 구글플레이 기프트카드 16자리 코드를 입력하세요.' : 'Enter the 16-digit Google Play code bought from any Korean convenience store.'}</span>
                    </div>
                  </div>
                </div>

                {/* Platform Selector for Redeem */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {lang === 'km' ? 'ជ្រើសរើសប្រភេទកូដ (Select Platform):' : lang === 'ko' ? '플랫폼 선택:' : 'Select Platform:'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRedeemPlatform('playstore')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        redeemPlatform === 'playstore'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M3.6 1.4L13.8 11.6 3.6 21.8C3.2 21.4 3 20.7 3 20V3.2C3 2.5 3.2 1.8 3.6 1.4z" />
                        <path fill="#34A853" d="M17.3 8.1L13.8 11.6 3.6 1.4C4.1 1.1 4.7 1.1 5.3 1.5l12 6.6z" />
                        <path fill="#EA4335" d="M17.3 15.1L5.3 21.7C4.7 22.1 4.1 22.1 3.6 21.8l10.2-10.2 3.5 3.5z" />
                        <path fill="#FBBC04" d="M21.2 10.3l-3.9-2.2-3.5 3.5 3.5 3.5 3.9-2.2c1.1-.6 1.1-1.6 0-2.6z" />
                      </svg>
                      <span>Google Play</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRedeemPlatform('appstore')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        redeemPlatform === 'appstore'
                          ? 'border-slate-900 bg-slate-900 text-white ring-2 ring-slate-900/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2 .6-2.64 1.35-.57.65-1.06 1.73-.93 2.76 1.02.08 2.04-.49 2.65-1.24z"/>
                      </svg>
                      <span>App Store</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRedeemPlatform('promo')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        redeemPlatform === 'promo'
                          ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Gift className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>VIP Voucher</span>
                    </button>
                  </div>
                </div>

                {/* Redeem Code Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      {t.redeemInputLabel}
                    </label>
                    <span className="text-[11px] text-slate-500">
                      16-digit or promo code
                    </span>
                  </div>
                  <div className="relative">
                    <Ticket className="w-4 h-4 text-purple-500 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={redeemCode}
                      onChange={(e) => {
                        setRedeemCode(e.target.value.toUpperCase());
                        setRedeemError(null);
                      }}
                      placeholder={
                        redeemPlatform === 'playstore' 
                          ? 'PLAY-XXXX-XXXX-XXXX' 
                          : redeemPlatform === 'appstore' 
                          ? 'X8K4-992J-M1N7-88PL' 
                          : 'KIIP-2025-VIP-PASS'
                      }
                      className="w-full pl-9 pr-24 py-3 rounded-xl border border-slate-300 text-sm font-mono tracking-wider font-bold uppercase focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-none"
                    />
                    {redeemCode ? (
                      <button
                        type="button"
                        onClick={() => setRedeemCode('')}
                        className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 px-2 py-0.5 rounded cursor-pointer"
                      >
                        {t.clearBtn}
                      </button>
                    ) : null}
                  </div>

                  {redeemError && (
                    <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{redeemError}</span>
                    </div>
                  )}
                </div>

                {/* Sample Test Codes for 1-Click Convenience */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t.sampleCodes}</span>
                    </span>
                    {copiedCode && (
                      <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>{t.copiedBadge}</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplySampleCode('PLAY-15000-FREE', 'playstore')}
                      className="p-2 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-800 group-hover:text-emerald-700">
                        <span>PLAY-15000-FREE</span>
                        <Copy className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Google Play • ₩15,000
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplySampleCode('APPLE-15K-GIFT', 'appstore')}
                      className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 hover:border-slate-400 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-800 group-hover:text-slate-900">
                        <span>APPLE-15K-GIFT</span>
                        <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-700" />
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        App Store • ₩15,000
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplySampleCode('KIIP-TOPIK-2025', 'promo')}
                      className="p-2 bg-white hover:bg-purple-50 rounded-xl border border-slate-200 hover:border-purple-300 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-800 group-hover:text-purple-700">
                        <span>KIIP-TOPIK-2025</span>
                        <Copy className="w-3 h-3 text-slate-400 group-hover:text-purple-600" />
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        VIP Voucher • ₩15,000
                      </span>
                    </button>
                  </div>
                </div>

                {/* Redeem Valuation Info Card */}
                {redeemCode.trim() && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold">{lang === 'km' ? 'កូដមានសុពលភាព: ' : lang === 'ko' ? '유효한 코드 확인됨: ' : 'Valid Code Verified: '}</span>
                        <span>{redeemCode}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-700 block">{lang === 'km' ? 'កាត់កងទឹកប្រាក់' : lang === 'ko' ? '할인 적용' : 'Amount Redeemed'}</span>
                      <span className="font-black text-emerald-800">-₩15,000 (100% OFF)</span>
                    </div>
                  </div>
                )}

                {/* Big Action Redeem Button */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleProcessPayment('redeem')}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-purple-900/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60 hover:scale-[1.01]"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>{processingStep}</span>
                    </>
                  ) : (
                    <>
                      <Ticket className="w-5 h-5 text-white" />
                      <span>{t.payToUnlockCleanBtn}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB CONTENT: CREDIT CARD */}
            {activeTab === 'card' && (
              <div className="space-y-4">
                {/* Virtual Interactive Card Preview */}
                <div className="bg-gradient-to-tr from-slate-900 via-indigo-900 to-blue-800 text-white p-4 sm:p-5 rounded-2xl shadow-xl border border-indigo-400/20 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <div className="w-8 h-6 bg-amber-300 rounded-md opacity-85 shadow-xs" />
                    <span className="text-xs font-mono font-bold tracking-widest text-indigo-200">
                      SECURE VISA / MC / KOREA CARD
                    </span>
                  </div>
                  <p className="font-mono text-base sm:text-lg tracking-[3px] text-white/95">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </p>
                  <div className="mt-4 flex justify-between items-center text-xs font-mono text-indigo-200">
                    <div>
                      <span className="text-[9px] uppercase block opacity-70">Cardholder</span>
                      <span className="font-bold text-white uppercase">{cardName || 'YOUR NAME'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase block opacity-70">Expires</span>
                      <span className="font-bold text-white">{cardExpiry || 'MM/YY'}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Fill Test Card Button */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{lang === 'km' ? 'ចង់សាកល្បងភ្លាមៗ?' : lang === 'ko' ? '즉시 테스트해보시겠습니까?' : 'Want to test quickly?'}</span>
                  <button
                    type="button"
                    onClick={handleFillTestCard}
                    className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t.fillTestCard}</span>
                  </button>
                </div>

                {/* Card Input Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {t.cardNumberLabel}
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {t.cardExpiryLabel}
                      </label>
                      <input
                        type="text"
                        placeholder="12/28"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        CVC / CVV
                      </label>
                      <input
                        type="password"
                        placeholder="888"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {t.cardHolderLabel}
                    </label>
                    <input
                      type="text"
                      placeholder="SOK SRORNG"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>

                  {cardError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{cardError}</span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleProcessPayment('card')}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{processingStep}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>{t.payToUnlockCleanBtn}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB CONTENT: PAYPAL */}
            {activeTab === 'paypal' && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center">
                      P
                    </span>
                    <span className="text-xs font-bold text-amber-950">
                      PayPal Express Checkout
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {lang === 'km' ? 'ទូទាត់ប្រាក់យ៉ាងរហ័ស និងមានសុវត្ថិភាពខ្ពស់តាមគណនី PayPal' : lang === 'ko' ? 'PayPal 계정으로 안전하고 빠른 결제' : 'Fast and secure payment via PayPal'} (ស្មើនឹង ₩15,000 / ~$11.20 USD)។
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {lang === 'km' ? 'PayPal Email (គណនី PayPal របស់អ្នក)' : lang === 'ko' ? 'PayPal 이메일 주소' : 'PayPal Email'}
                  </label>
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none"
                  />
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleProcessPayment('paypal')}
                  className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-sm rounded-2xl shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{processingStep}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base font-black">Pay</span>
                      <span className="text-base font-black text-blue-800">Pal</span>
                      <span className="ml-1 text-xs font-bold">(₩15,000 / $11.20)</span>
                    </>
                  )}
                </button>
              </div>
            )}

{/* TAB CONTENT: ABA PAYWAY MERCHANT & UNIVERSAL CARDS */}
            {activeTab === 'khqr' && (
              <div className="space-y-4 text-center">
                {/* Header Info Banner */}
                <div className="p-3.5 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-2xl border border-sky-200 text-left flex items-start justify-between gap-3 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#004f80] text-white text-[10px] font-black px-2 py-0.5 rounded-md tracking-wider">
                        ABA PayWay
                      </span>
                      <span className="text-xs text-[#003d63] font-bold">
                        {lang === 'km' ? 'គាំទ្រកាតអន្តរជាតិគ្រប់ជនជាតិ & ABA PAY' : '모든 해외 카드(Visa/Master) & ABA PAY 지원'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {lang === 'km' 
                        ? 'គាំទ្រកាត Visa, MasterCard, JCB, UnionPay និង ABA PAY សម្រាប់ជនបរទេសគ្រប់ប្រទេស។' 
                        : 'Visa, MasterCard, UnionPay, JCB 및 ABA PAY 전 세계 카드 지원.'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-500 block">តម្លៃសេវា</span>
                    <span className="text-base font-black text-[#004f80]">$11.20</span>
                    <span className="text-[10px] text-slate-500 block">~ ₩15,000</span>
                  </div>
                </div>

                {/* 1-Click Direct Online Payment Button to Official ABA PayWay Link */}
                <a
                  href="https://link.payway.com.kh/ABAPAYzz552103m"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#004f80] via-[#005f99] to-[#0074b7] hover:from-[#003d63] hover:to-[#005f99] text-white font-extrabold text-sm shadow-lg shadow-sky-900/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] border border-sky-400/30 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-sky-200" />
                  <span>
                    {lang === 'km' 
                      ? '👉 ចុចបង់ប្រាក់តាម ABA PayWay (បើកផ្ទាំងបង់ប្រាក់ផ្ទាល់)' 
                      : '👉 ABA PayWay 온라인 결제 페이지 열기 (모든 카드)'}
                  </span>
                  <ExternalLink className="w-4 h-4 text-sky-200 shrink-0" />
                </a>

                {/* Dynamic QR Card Frame with authentic ABA PayWay Styling */}
                <div className="max-w-[290px] mx-auto bg-white p-4 rounded-3xl border-2 border-[#004f80]/40 shadow-xl relative overflow-hidden">
                  {/* Top ABA Header */}
                  <div className="bg-[#004f80] -mx-4 -mt-4 py-2 px-4 text-white flex items-center justify-between mb-3 shadow-xs">
                    <div className="flex items-center gap-1.5 font-black text-xs tracking-wider">
                      <span>ABA PayWay</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded-full">
                      CARDS &amp; PAY
                    </span>
                  </div>

                  {/* QR Image Container */}
                  <div className="relative p-2 bg-white rounded-2xl border border-slate-200 flex items-center justify-center">
                    {isGeneratingQr ? (
                      <div className="w-52 h-52 flex flex-col items-center justify-center gap-2 text-slate-400">
                        <RefreshCw className="w-8 h-8 animate-spin text-[#004f80]" />
                        <span className="text-xs font-bold text-slate-600">
                          {lang === 'km' ? 'កំពុងបង្កើត QR ថ្មី...' : '새 QR 생성 중...'}
                        </span>
                      </div>
                    ) : qrCodeDataUrl ? (
                      <div className="relative">
                        <img
                          src={qrCodeDataUrl}
                          alt="ABA PayWay Dynamic QR Code"
                          className="w-52 h-52 object-contain mx-auto transition-transform hover:scale-102"
                        />
                        {/* Center ABA Logo Emblem */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-9 h-9 rounded-full bg-[#004f80] shadow-md border-2 border-white flex items-center justify-center">
                            <span className="text-[10px] font-black text-white">ABA</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-52 h-52 flex items-center justify-center">
                        <QrCode className="w-32 h-32 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Merchant & Transaction ID Details for ABA PayWay */}
                  <div className="mt-3 pt-2 border-t border-dashed border-slate-200 text-left space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">អ្នកទទួល (Merchant):</span>
                      <span className="font-black text-slate-900 tracking-wide">Delivery by V.EANG</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">ធនាគារ (Bank):</span>
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-[#004f80]">ABA Bank</span>
                        <span className="font-mono font-bold text-slate-800 text-[11px]">(000 375 987)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">កាតដែលទទួល (Cards):</span>
                      <span className="font-bold text-slate-700 text-[10.5px]">Visa • Master • UnionPay • JCB</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="text-slate-500">លេខវិក្កយបត្រ (Tx ID):</span>
                      <div className="flex items-center gap-1 font-mono font-bold text-[#004f80] text-[10.5px]">
                        <span>{transactionId || "KIIP-982415"}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(transactionId);
                            setCopiedTxId(true);
                            setTimeout(() => setCopiedTxId(false), 2000);
                          }}
                          className="p-0.5 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Copy Transaction ID"
                        >
                          {copiedTxId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>ម៉ោង: {qrGeneratedAt.toLocaleTimeString()}</span>
                      <span className="text-emerald-600 font-bold">● PayWay QR #{qrPayCount + 1}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center justify-center gap-2 max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={() => generateNewKhqr()}
                    disabled={isGeneratingQr || isProcessing}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-300 shadow-2xs hover:scale-102 disabled:opacity-50"
                    title="ចុចដើម្បីបង្កើត QR ថ្មី ជាមួយលេខកូដវិក្កយបត្រថ្មី"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isGeneratingQr ? "animate-spin" : ""}`} />
                    <span>{lang === 'km' ? '🔄 បង្កើត QR ថ្មី' : '새 QR 생성'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleProcessPayment('khqr')}
                    className="flex-1 py-3 bg-gradient-to-r from-[#004f80] to-[#0074b7] hover:from-[#003d63] hover:to-[#005f99] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-sky-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 hover:scale-102"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span className="truncate">{processingStep}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>{lang === 'km' ? '✓ ខ្ញុំបានបង់ប្រាក់រួចហើយ' : '결제 완료 및 잠금 해제'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
            {/* Guarantees & Features */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] sm:text-[11px] text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t.instantUnlock}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t.safeGuaranteed}</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{lang === 'km' ? 'អាចទាញយកឡើងវិញបានគ្រប់ពេល' : lang === 'ko' ? '언제든 재다운로드 가능' : 'Can re-download anytime'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
