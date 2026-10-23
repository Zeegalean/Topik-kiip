import React, { useState, useEffect, useRef } from 'react';
import { ApplicationFormData, UploadedDocuments, Language, SignatureSettings } from '../types';
import { getTranslation } from '../utils/translations';
import { 
  generateMergedPdf, 
  downloadPdfFile 
} from '../utils/pdfGenerator';
import { mergeArcFrontAndBack, fileToDataUrl } from '../utils/imageUtils';
import { 
  generateSampleTopikCert, 
  generateSampleArcFront, 
  generateSampleArcBack, 
  generateSamplePassport 
} from '../data/sampleData';
import { OfficialFormView } from './OfficialFormView';
import { cleanVisaStatus } from '../utils/sanitizers';
import confetti from 'canvas-confetti';
import { 
  Download, 
  Layers, 
  CheckCircle, 
  RefreshCw, 
  Eye, 
  FileText, 
  FileCheck2, 
  Award, 
  Sparkles, 
  AlertCircle,
  ZoomIn,
  Upload,
  X,
  Lock,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { WatermarkOverlay } from './WatermarkOverlay';
import { RightClickProtectionToast } from './RightClickProtectionToast';

interface Step3PdfPreviewProps {
  formData: ApplicationFormData;
  docs: UploadedDocuments;
  setDocs?: React.Dispatch<React.SetStateAction<UploadedDocuments>>;
  sigSettings?: SignatureSettings;
  setSigSettings?: React.Dispatch<React.SetStateAction<SignatureSettings>>;
  lang: Language;
  onNext: () => void;
  onPrev: () => void;
  formRef: React.RefObject<HTMLDivElement | null>;
  isPaid?: boolean;
  onOpenPayment?: () => void;
  onSkipPayment?: () => void;
}

export const Step3PdfPreview: React.FC<Step3PdfPreviewProps> = ({
  formData,
  docs,
  setDocs,
  sigSettings,
  setSigSettings,
  lang,
  onNext,
  onPrev,
  formRef,
  isPaid = false,
  onOpenPayment,
  onSkipPayment,
}) => {
  const [showRightClickNotice, setShowRightClickNotice] = useState(false);
  const t = getTranslation(lang);
  const [isGeneratingMerged, setIsGeneratingMerged] = useState(false);
  const [mergedArcPreview, setMergedArcPreview] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'form' | 'pages'>('form');
  const [selectedZoomImg, setSelectedZoomImg] = useState<{
    title: string;
    url: string;
    isPdf?: boolean;
  } | null>(null);
  const [statusNotice, setStatusNotice] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Local fallback ref in case external ref was not attached
  const localFormRef = useRef<HTMLDivElement | null>(null);
  const dedicatedCaptureRef = useRef<HTMLDivElement | null>(null);
  const activeFormRef = formRef.current ? formRef : localFormRef;



  // Pre-generate merged ARC front & back preview on mount
  useEffect(() => {
    let isMounted = true;
    if (docs.arcFront && docs.arcBack) {
      mergeArcFrontAndBack(docs.arcFront, docs.arcBack, formData.name)
        .then((url) => {
          if (isMounted) setMergedArcPreview(url);
        })
        .catch((err) => console.error('Merged ARC error:', err));
    }
    return () => {
      isMounted = false;
    };
  }, [docs.arcFront, docs.arcBack, formData.name]);

  // Download Full Merged Packet (Form + TOPIK + ARC + Passport)
  const handleDownloadMerged = async () => {
    setIsGeneratingMerged(true);
    setStatusNotice(null);
    // Allow state update & repaint of the capture container
    await new Promise((r) => setTimeout(r, 200));

    const el = dedicatedCaptureRef.current || formRef.current || localFormRef.current;
    if (!el) {
      setStatusNotice({
        type: 'error',
        text: t.pdfFormNotReady,
      });
      setIsGeneratingMerged(false);
      return;
    }

    try {
      const pdf = await generateMergedPdf({
        formElement: el,
        docs,
        formData,
      });

      downloadPdfFile(pdf, formData.name);

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });

      setStatusNotice({
        type: 'success',
        text: `✓ បានទាញយកកញ្ចប់ PDF ពេញលេញ (${totalPages} ទំព័រ) ដោយជោគជ័យ! សូមពិនិត្យមើល Folder Downloads នៅលើឧបករណ៍របស់អ្នក។`,
      });
    } catch (err) {
      console.error('PDF Generation failed:', err);
      setStatusNotice({
        type: 'error',
        text: t.pdfDownloadFail,
      });
    } finally {
      setIsGeneratingMerged(false);
    }
  };

  const totalPages =
    1 + // Form
    (docs.topikCertList.length || 1) + // TOPIK
    (docs.arcFront ? 1 : 0) + // Merged ARC
    (docs.passportList.length || 0); // Passports

  const sampleTopik = generateSampleTopikCert();
  const topikItem = docs.topikCertList[0];
  const topikUrl = topikItem?.dataUrl || sampleTopik;
  const isTopikPdf = Boolean(
    topikUrl.startsWith('data:application/pdf') ||
    topikItem?.name?.toLowerCase().endsWith('.pdf')
  );

  const sampleArcFront = generateSampleArcFront();
  const sampleArcBack = generateSampleArcBack();
  const samplePassport = generateSamplePassport();
  const passportItem = docs.passportList[0];
  const passportUrl = passportItem?.dataUrl || samplePassport;
  const isPassportPdf = Boolean(
    passportUrl.startsWith('data:application/pdf') ||
    passportItem?.name?.toLowerCase().endsWith('.pdf')
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Download Result Status Notice */}
      {statusNotice && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-medium border shadow-xs animate-in fade-in slide-in-from-top-2 ${
            statusNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : statusNotice.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-300'
              : 'bg-blue-50 text-blue-900 border-blue-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusNotice.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : statusNotice.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
            )}
            <span>{statusNotice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusNotice(null)}
            className="text-xs font-bold underline opacity-80 hover:opacity-100 cursor-pointer"
          >
            {t.closeBtn}
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                {t.step3Badge}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ⚡ អាចចុច Download សាកល្បងបានភ្លាមៗ
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {t.step3Title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t.step3Subtitle}
            </p>
          </div>

          {/* Action Download Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Download Clean Merged Packet or Unlock Button */}
            {!isPaid ? (
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={onOpenPayment}
                  className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs sm:text-sm shadow-xl shadow-red-900/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                  title="បង់ប្រាក់តាម Play Store, App Store, Redeem Code ដើម្បីដោះសោឯកសារស្អាតគ្មាន Watermark"
                >
                  <Lock className="w-4 h-4" />
                  <span>{t.payToUnlockCleanBtn}</span>
                </button>

                {onSkipPayment && (
                  <button
                    onClick={onSkipPayment}
                    className="px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
                    title="Skip ដំណាក់កាលនេះសិន (ដោះសោសាកល្បង)"
                  >
                    <span>{lang === 'km' ? 'Skip ដំណាក់កាលនេះសិន' : lang === 'ko' ? '지금 건너뛰기' : 'Skip for now'}</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleDownloadMerged}
                disabled={isGeneratingMerged}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                title="ទាញយកកញ្ចប់ PDF ពេញលេញគ្រប់ទំព័រទាំងអស់"
              >
                {isGeneratingMerged ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t.generatingPdf}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{t.downloadCleanPdfBtn.replace('{n}', String(totalPages))}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Payment & Watermark Status Card */}
        {!isPaid ? (
          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-50 via-red-50 to-amber-50 border-2 border-red-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-300 flex items-center justify-center shrink-0 text-red-600 mt-0.5">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-300">
                    Watermark Active
                  </span>
                  <span className="text-xs font-bold text-red-900">
                    {t.watermarkNoticeTitle}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{t.watermarkNoticeDesc}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {onOpenPayment && (
                <button
                  type="button"
                  onClick={onOpenPayment}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{t.payToUnlockCleanBtn}</span>
                </button>
              )}
              {onSkipPayment && (
                <button
                  type="button"
                  onClick={onSkipPayment}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
                  title="Skip ដំណាក់កាលនេះសិន"
                >
                  <span>{lang === 'km' ? 'Skip ដំណាក់កាលនេះ' : '건너뛰기'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-3 text-emerald-900">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs font-bold block">
                  {t.watermarkSuccessClean}
                </span>
                <span className="text-[11px] text-emerald-700">
                  អ្នកអាចចុចទាញយកកញ្ចប់ PDF ផ្លូវការដោយសេរីគ្រប់ពេលវេលា។
                </span>
              </div>
            </div>
            <span className="text-[11px] font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300">
              CLEAN PDF UNLOCKED
            </span>
          </div>
        )}

        {/* File summary bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            <span className="flex items-center gap-1.5 font-bold text-slate-900">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>សរុប {totalPages} ទំព័រ (Pages) ក្នុងកញ្ចប់ឯកសារ</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-slate-700 text-[11px]">
              사회통합프로그램_연계신청서_{formData.name || '신청인'}.pdf
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>ពត៌មានលទ្ធផល TOPIK & ពាក្យសុំបានបញ្ចូលពេញលេញ 100%</span>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewTab('form')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              previewTab === 'form'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>មើលពាក្យសុំទម្រង់ផ្លូវការពេញលេញ (Full Form Template)</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewTab('pages')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              previewTab === 'pages'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>ទិដ្ឋភាពទំព័រឯកសារទាំងអស់ ({totalPages} ទំព័រ)</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline">
          🔎 ផ្ទៀងផ្ទាត់ពត៌មានទាំងអស់មុននឹងទាញយក ឬផ្ញើ Email
        </span>
      </div>

      {/* Dedicated clean DOM container for pixel-perfect html2canvas PDF capture */}
      <div
        id="pdf-capture-container"
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: isGeneratingMerged ? '0px' : '-9999px',
          top: '0px',
          width: '210mm',
          minHeight: '297mm',
          backgroundColor: '#ffffff',
          zIndex: isGeneratingMerged ? 99999 : -1,
          pointerEvents: 'none',
          visibility: isGeneratingMerged ? 'visible' : 'hidden',
          opacity: 1,
        }}
      >
        <OfficialFormView
          containerRef={dedicatedCaptureRef}
          formData={formData}
          signatureUrl={docs.signature}
          sigSettings={sigSettings}
          editable={false}
          lang={lang}
          showWatermark={!isPaid}
        />
      </div>

      {/* Full-screen Loading Overlay during PDF Generation */}
      {isGeneratingMerged && (
        <div className="fixed inset-0 z-[100000] bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto text-teal-600">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900">
                កំពុងបង្កើតកញ្ចប់ឯកសារ PDF គុណភាពខ្ពស់...
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                សន្លឹកទី១ (ពាក្យសុំទម្រង់ផ្លូវការមានហត្ថលេខា) + TOPIK + កាត ARC + Passport កំពុងត្រូវបានបញ្ចូលគ្នាជាឯកសារ PDF តែមួយ (Merged PDF)។
              </p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full w-full animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: FULL OFFICIAL TEMPLATE FORM VIEW */}
      <div className={previewTab === 'form' ? 'block' : 'hidden'}>
        <div 
          onContextMenu={(e) => {
            e.preventDefault();
            setShowRightClickNotice(true);
          }}
          className="flex justify-center overflow-x-auto p-4 sm:p-8 bg-slate-300/80 rounded-3xl border border-slate-300 shadow-inner select-none relative"
        >
          <div className="transform scale-[0.9] sm:scale-100 origin-top">
            <OfficialFormView
              containerRef={(el) => {
                if (formRef) (formRef as any).current = el;
                localFormRef.current = el;
              }}
              formData={formData}
              signatureUrl={docs.signature}
              sigSettings={sigSettings}
              onSigSettingsChange={setSigSettings}
              editable={false}
              lang={lang}
              showWatermark={!isPaid}
              onRightClickBlock={() => setShowRightClickNotice(true)}
            />
          </div>
        </div>
      </div>

      {/* TAB 2: MULTI-PAGE SEQUENCE CARDS */}
      <div className={previewTab === 'pages' ? 'block' : 'hidden'}>
        <div 
          onContextMenu={(e) => {
            e.preventDefault();
            setShowRightClickNotice(true);
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none"
        >
          {/* Page 1: Official Form Template Authentic Miniature */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col relative">
            <div className="bg-slate-50 p-3.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>សន្លឹកទី ១ (ទំព័រដើម): ពាក្យសុំផ្លូវការ</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isPaid ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
              }`}>
                {isPaid ? 'ស្អាត គ្មាន Watermark' : 'REJECTION'}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col items-center justify-center bg-slate-100/50 relative">
              <div 
                onClick={() => setPreviewTab('form')}
                title="ចុចដើម្បីមើលពាក្យសុំទំហំធំពេញលេញ"
                className="w-[195px] h-[276px] bg-white shadow-md border border-slate-300 rounded overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all select-none"
              >
                <div style={{ width: '210mm', minHeight: '297mm', transform: 'scale(0.245)', transformOrigin: 'top left', pointerEvents: 'none' }}>
                  <OfficialFormView
                    formData={formData}
                    signatureUrl={docs.signature}
                    sigSettings={sigSettings}
                    editable={false}
                    lang={lang}
                    showWatermark={!isPaid}
                  />
                </div>
                {/* Watermark Card Stamp if not paid */}
                <WatermarkOverlay variant="card" show={!isPaid} />
              </div>
              <p className="text-[11px] font-semibold text-blue-700 mt-2.5 text-center flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>សន្លឹកទី១ ជាទម្រង់ពាក្យសុំផ្លូវការ 100%</span>
              </p>
              <button
                type="button"
                onClick={() => setPreviewTab('form')}
                className="text-[10px] text-slate-500 hover:text-blue-600 underline mt-0.5 cursor-pointer"
              >
                ចុចទីនេះដើម្បីពង្រីកមើលទំហំធំពេញ
              </button>
            </div>
          </div>

          {/* Page 2: TOPIK Certificate */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col relative">
            <div className="bg-slate-50 p-3.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>សន្លឹកទី ២: TOPIK 성적증명서</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isPaid ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
              }`}>
                {isPaid ? 'Clean Copy' : 'Sample Copy'}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col items-center justify-center bg-slate-100/50">
              {isTopikPdf ? (
                <div 
                  onClick={() => setSelectedZoomImg({ title: `សន្លឹកទី ២: ${topikItem?.name || 'TOPIK_Score.pdf'}`, url: topikUrl, isPdf: true })}
                  className="w-full max-w-[195px] aspect-[1/1.41] bg-white shadow-md border border-slate-300 rounded flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all group relative overflow-hidden"
                  title="ចុចដើម្បីពិនិត្យមើលឯកសារ PDF"
                >
                  <FileText className="w-12 h-12 text-rose-500 mb-2 group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-bold text-slate-800 line-clamp-2 break-all">{topikItem?.name || 'TOPIK_Score.pdf'}</span>
                  <span className="text-[10px] text-slate-500 mt-1">ឯកសារ PDF ផ្លូវការ</span>
                  <span className="text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-2">ភ្ជាប់ក្នុងទំព័រទី ២</span>
                  <WatermarkOverlay variant="card" show={!isPaid} />
                </div>
              ) : (
                <div
                  onClick={() => setSelectedZoomImg({ title: 'សន្លឹកទី ២: TOPIK 성적증명서 (Official TOPIK Score Report)', url: topikUrl })}
                  className="w-full max-w-[195px] aspect-[1/1.41] bg-white shadow-md border border-slate-300 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all group relative"
                  title="ចុចដើម្បីពង្រីកមើលសន្លឹកពិន្ទុ TOPIK ទំហំធំ"
                >
                  <img
                    src={topikUrl}
                    alt="TOPIK Score Report"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = sampleTopik;
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1 z-10">
                    <ZoomIn className="w-4 h-4" />
                    <span>ពង្រីកមើល</span>
                  </div>
                  <WatermarkOverlay variant="card" show={!isPaid} />
                </div>
              )}

              {/* Action buttons under Page 2 */}
              <div className="mt-2.5 flex flex-col items-center gap-1 w-full">
                <button
                  type="button"
                  onClick={() => setSelectedZoomImg({ title: 'សន្លឹកទី ២: TOPIK 성적증명서 (Official TOPIK Score Report)', url: topikUrl, isPdf: isTopikPdf })}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>ពង្រីកមើលទំហំធំពេញ</span>
                </button>
                {setDocs && (
                  <label className="text-[10px] font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 inline-flex items-center gap-1 cursor-pointer transition-all shadow-2xs mt-0.5">
                    <Upload className="w-3 h-3 text-emerald-600" />
                    <span>ប្តូរ ឬ ផ្ទុកឡើង TOPIK</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await fileToDataUrl(file);
                          setDocs((prev) => ({
                            ...prev,
                            topikCertList: [{ id: Math.random().toString(36).substring(7), dataUrl: url, name: file.name }],
                          }));
                          setStatusNotice({
                            type: 'success',
                            text: `✓ បានផ្លាស់ប្តូរសន្លឹកពិន្ទុ TOPIK (${file.name}) ដោយជោគជ័យ!`,
                          });
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Page 3: Merged ARC */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col relative">
            <div className="bg-slate-50 p-3.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>សន្លឹកទី ៣: 외국인등록증 (앞+뒤)</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isPaid ? 'text-emerald-700 bg-emerald-50' : 'text-indigo-700 bg-indigo-50'
              }`}>
                {isPaid ? 'Clean ARC' : '1장 통합'}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col items-center justify-center bg-slate-100/50">
              <div
                onClick={() => setSelectedZoomImg({ title: 'សន្លឹកទី ៣: 외국인등록증 사본 (앞면 / 뒷면)', url: mergedArcPreview || docs.arcFront || sampleArcFront })}
                className="w-full max-w-[195px] aspect-[1/1.41] bg-white shadow-md border border-slate-300 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all group relative"
                title="ចុចដើម្បីពង្រីកមើលកាត ARC"
              >
                <img
                  src={mergedArcPreview || docs.arcFront || sampleArcFront}
                  alt="Merged ARC"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = sampleArcFront;
                  }}
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1 z-10">
                  <ZoomIn className="w-4 h-4" />
                  <span>ពង្រីកមើល</span>
                </div>
                <WatermarkOverlay variant="card" show={!isPaid} />
              </div>
              <button
                type="button"
                onClick={() => setSelectedZoomImg({ title: 'សន្លឹកទី ៣: 외국인등록증 사본 (앞면 / 뒷면)', url: mergedArcPreview || docs.arcFront || sampleArcFront })}
                className="text-[11px] font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 mt-2.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>ពង្រីកមើលទំហំធំពេញ</span>
              </button>
            </div>
          </div>

          {/* Page 4: Passport */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col relative">
            <div className="bg-slate-50 p-3.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">
                  4
                </span>
                <span>សន្លឹកទី ៤: 여권 (Passport)</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isPaid ? 'text-emerald-700 bg-emerald-50' : 'text-sky-700 bg-sky-50'
              }`}>
                {isPaid ? 'Clean Passport' : '여권 사본'}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col items-center justify-center bg-slate-100/50">
              {isPassportPdf ? (
                <div 
                  onClick={() => setSelectedZoomImg({ title: `សន្លឹកទី ៤: ${passportItem?.name || 'Passport.pdf'}`, url: passportUrl, isPdf: true })}
                  className="w-full max-w-[195px] aspect-[1/1.41] bg-white shadow-md border border-slate-300 rounded flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:ring-2 hover:ring-sky-500 transition-all group relative overflow-hidden"
                >
                  <FileText className="w-12 h-12 text-sky-600 mb-2 group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-bold text-slate-800 line-clamp-2 break-all">{passportItem?.name || 'Passport.pdf'}</span>
                  <span className="text-[10px] text-slate-500 mt-1">ឯកសារ 여권 PDF</span>
                  <WatermarkOverlay variant="card" show={!isPaid} />
                </div>
              ) : (
                <div
                  onClick={() => setSelectedZoomImg({ title: 'សន្លឹកទី ៤: 여권 사본 (Passport Copy)', url: passportUrl })}
                  className="w-full max-w-[195px] aspect-[1/1.41] bg-white shadow-md border border-slate-300 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-sky-500 transition-all group relative"
                  title="ចុចដើម្បីពង្រីកមើលលិខិតឆ្លងដែន"
                >
                  <img
                    src={passportUrl}
                    alt="Passport"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = samplePassport;
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1 z-10">
                    <ZoomIn className="w-4 h-4" />
                    <span>ពង្រីកមើល</span>
                  </div>
                  <WatermarkOverlay variant="card" show={!isPaid} />
                </div>
              )}
              <button
                type="button"
                onClick={() => setSelectedZoomImg({ title: 'សន្លឹកទី ៤: 여권 사본 (Passport Copy)', url: passportUrl, isPdf: isPassportPdf })}
                className="text-[11px] font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1 mt-2.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>ពង្រីកមើលទំហំធំពេញ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Zoom Modal */}
      {selectedZoomImg && (
        <div 
          className="fixed inset-0 z-[100001] bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedZoomImg(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800">{selectedZoomImg.title}</h3>
              <button
                type="button"
                onClick={() => setSelectedZoomImg(null)}
                className="w-8 h-8 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-slate-100/60">
              {selectedZoomImg.isPdf ? (
                <div className="p-8 text-center space-y-3">
                  <FileText className="w-16 h-16 text-rose-500 mx-auto" />
                  <p className="font-bold text-slate-800 text-sm">ឯកសារ PDF ត្រូវបានភ្ជាប់រួចរាល់</p>
                  <p className="text-xs text-slate-500">ឯកសារនេះនឹងត្រូវបានបញ្ចូលក្នុងកញ្ចប់ PDF ពេញលេញពេលទាញយក</p>
                </div>
              ) : (
                <img
                  src={selectedZoomImg.url}
                  alt={selectedZoomImg.title}
                  className="max-w-full max-h-[75vh] object-contain shadow-md rounded-lg bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nav footer */}
      <div className="flex items-center justify-between gap-4 pt-4">
        <button
          onClick={onPrev}
          className="px-6 py-3 rounded-xl border border-slate-300 font-bold text-slate-700 text-sm hover:bg-slate-100 transition-colors cursor-pointer"
        >
          {t.prevStep}
        </button>

        <button
          onClick={onNext}
          className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer"
        >
          <span>{t.nextStep}</span>
        </button>
      </div>

      {/* Right-click blocked toast alert */}
      <RightClickProtectionToast
        show={showRightClickNotice}
        onClose={() => setShowRightClickNotice(false)}
        onOpenPayment={onOpenPayment}
        lang={lang}
      />
    </div>
  );
};
