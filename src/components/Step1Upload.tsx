import React, { useRef, useState, useEffect } from 'react';
import { UploadedDocuments, ApplicationFormData, Language } from '../types';
import { getTranslation } from '../utils/translations';
import { fileToDataUrl, removeImageBackground } from '../utils/imageUtils';
import { findOfficeByAddress } from '../data/immigrationOffices';
import { searchAddressByBunji, KoreanAddressItem } from '../data/koreanAddresses';
import { 
  cleanVisaStatus, 
  normalizeDocVerificationNo, 
  normalizeRegNumbers, 
  cleanExamNumber, 
  cleanRound, 
  cleanGrade, 
  cleanName,
  parsePassportTextOrSvg
} from '../utils/sanitizers';
import {
  extractDocumentsClientSide,
  mergeExtractedIntoFormData
} from '../utils/clientOcrEngine';
import { 
  Upload, 
  Trash2, 
  CheckCircle2, 
  PenTool, 
  MapPin, 
  Phone, 
  Key, 
  AlertCircle,
  ExternalLink,
  Search,
  X,
  Building2,
  Sparkles,
  Award,
  RefreshCw,
  Edit3,
  FileCheck2,
  Check,
  Lock,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';

interface Step1UploadProps {
  docs: UploadedDocuments;
  setDocs: React.Dispatch<React.SetStateAction<UploadedDocuments>>;
  formData: ApplicationFormData;
  setFormData: React.Dispatch<React.SetStateAction<ApplicationFormData>>;
  lang: Language;
  onNext: () => void;
  onOpenSocinetNotice?: () => void;
}

export const Step1Upload: React.FC<Step1UploadProps> = ({
  docs,
  setDocs,
  formData,
  setFormData,
  lang,
  onNext,
  onOpenSocinetNotice,
}) => {
  const t = getTranslation(lang);
  const [signatureMode, setSignatureMode] = useState<'upload' | 'draw'>('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Address search states
  const [searchQuery, setSearchQuery] = useState('');
  const [addressCategory, setAddressCategory] = useState<'all' | '공단/산업단지' | '아파트/주택' | '공공/지원센터'>('all');
  const [addressResults, setAddressResults] = useState<KoreanAddressItem[]>([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [detailAddress, setDetailAddress] = useState('');

  // TOPIK extraction states
  const [isExtractingTopik, setIsExtractingTopik] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [showTopikEditModal, setShowTopikEditModal] = useState(false);
  const [showSocinetPw, setShowSocinetPw] = useState(false);

  // Signature background removal and color adjustment states
  const [sigBgMode, setSigBgMode] = useState<'transparent' | 'white'>('transparent');
  const [sigInkColor, setSigInkColor] = useState<'blue' | 'black' | 'original'>('black');
  const [sigThreshold, setSigThreshold] = useState<number>(55);
  const [isCleaningSig, setIsCleaningSig] = useState(false);

  // Function to re-process and clean signature background
  const reprocessSignature = async (
    rawUrl = docs.signatureRaw || docs.signature,
    bgMode = sigBgMode,
    inkColor = sigInkColor,
    thresh = sigThreshold
  ) => {
    if (!rawUrl) return;
    setIsCleaningSig(true);
    try {
      const processed = await removeImageBackground(rawUrl, {
        bgMode,
        inkColor,
        threshold: thresh,
        autoCrop: true,
      });
      setDocs((prev) => ({
        ...prev,
        signature: processed,
        signatureRaw: prev.signatureRaw || rawUrl,
      }));
    } catch (e) {
      console.error('Failed to clean signature:', e);
    } finally {
      setIsCleaningSig(false);
    }
  };

  // Filter addresses by query and optional category
  const runAddressSearch = (query: string, category = addressCategory) => {
    let results = searchAddressByBunji(query);
    if (category !== 'all') {
      results = results.filter((item) => item.category === category);
    }
    setAddressResults(results);
    setShowAddressDropdown(true);
  };

  const handleAddressInputChange = (query: string) => {
    setSearchQuery(query);
    runAddressSearch(query, addressCategory);
  };

  const handleCategorySelect = (cat: 'all' | '공단/산업단지' | '아파트/주택' | '공공/지원센터') => {
    setAddressCategory(cat);
    runAddressSearch(searchQuery, cat);
  };

  const handleSelectAddress = (addr: KoreanAddressItem) => {
    const formatted = `${addr.roadAddress} (${addr.jibunAddress.split(' ').slice(-1)[0]}${addr.buildingName ? ', ' + addr.buildingName : ''})`;
    const full = detailAddress.trim() ? `${formatted} ${detailAddress.trim()}` : formatted;
    setFormData((p) => ({
      ...p,
      address: full,
    }));
    setShowAddressDropdown(false);
    setShowAddressModal(false);
    setSearchQuery(addr.roadAddress);
  };

  const handleDetailAddressChange = (detail: string) => {
    setDetailAddress(detail);
    if (!formData.address) return;
    const base = formData.address.replace(/\s+\d+동.*$/, '').trim();
    if (detail.trim()) {
      setFormData((p) => ({ ...p, address: `${base} ${detail.trim()}` }));
    } else {
      setFormData((p) => ({ ...p, address: base }));
    }
  };

  // Local structural extractor for Alien Registration Card (fast fallback)
  const parseArcTextOrSvg = (frontUrl?: string | null, backUrl?: string | null) => {
    try {
      let combined = '';
      const extractText = (url?: string | null) => {
        if (!url) return '';
        if (url.startsWith('data:image/svg+xml')) {
          if (url.includes(';base64,')) {
            try {
              return atob(url.split(';base64,')[1]);
            } catch (e) {
              return '';
            }
          } else if (url.includes(',')) {
            return decodeURIComponent(url.split(',')[1]);
          }
        }
        return '';
      };

      combined = `${extractText(frontUrl)}\n${extractText(backUrl)}`;
      if (!combined.trim()) return null;

      const res: Partial<ApplicationFormData> = {};
      const regMatch = combined.match(/(\d{6})\s*[-–]\s*(\d{7})/);
      if (regMatch) {
        res.regNumber1 = regMatch[1];
        res.regNumber2 = regMatch[2];
        const firstDigit = regMatch[2].charAt(0);
        if (['1', '3', '5', '7'].includes(firstDigit)) res.gender = '남';
        else if (['2', '4', '6', '8'].includes(firstDigit)) res.gender = '여';
      }

      const nameMatch =
        combined.match(/(?:성명|Name|NAME)[^\w\n<]*([A-Z\s]{3,30})(?=[<\n"&]|$)/i) ||
        combined.match(/>([A-Z]{2,15}\s+[A-Z]{2,15})</);
      if (nameMatch) {
        res.name = nameMatch[1].trim().toUpperCase();
        res.applicantName = res.name;
      }

      const natMatch =
        combined.match(/(?:국가|Country|Nationality)[^\w\n<]*([A-Za-z]+)/i) ||
        combined.match(/(CAMBODIA|VIETNAM|UZBEKISTAN|NEPAL|CHINA|PHILIPPINES|INDONESIA|MYANMAR|THAILAND)/i);
      if (natMatch) {
        res.nationality = natMatch[1].trim();
      }

      const visaMatch =
        combined.match(/(?:체류자격|Status)[^\w\n<]*([A-Z0-9-]+)/i) ||
        combined.match(/(E-9-1|E-7-4|E-7-1|E-9|D-2-1|D-2|F-2-R|F-2)/i);
      if (visaMatch) {
        res.visaStatus = cleanVisaStatus(visaMatch[1]);
      }

      // Parse latest address from 체류지 변경사항 based on 신고일 (Report Date)
      const datePattern = /(\d{4})[.\-\s년/]+(\d{1,2})[.\-\s월/]+(\d{1,2})/;
      const addrMatches = Array.from(combined.matchAll(/([가-힣]+(?:특별시|광역시|특별자치시|도|시|군|구)[가-힣0-9\s\-~,()./]+)/g));
      if (addrMatches.length > 0) {
        const candidates: { address: string; timestamp: number }[] = [];
        const lines = combined.split(/[\r\n<>]+/);
        for (const m of addrMatches) {
          const addr = m[1].trim();
          if (addr.length < 5 || addr.includes('시·군·구청') || addr.includes('출입국') || addr === '체류지') continue;
          let ts = 0;
          const lineIdx = lines.findIndex((l) => l.includes(addr));
          if (lineIdx !== -1) {
            for (let off = -4; off <= 4; off++) {
              const check = lines[lineIdx + off];
              if (check) {
                const dm = check.match(datePattern);
                if (dm) {
                  const y = parseInt(dm[1], 10);
                  const mo = parseInt(dm[2], 10);
                  const d = parseInt(dm[3], 10);
                  if (y >= 2000 && y <= 2035) {
                    ts = new Date(y, mo - 1, d).getTime();
                    break;
                  }
                }
              }
            }
          }
          candidates.push({ address: addr, timestamp: ts });
        }
        if (candidates.length > 0) {
          candidates.sort((a, b) => b.timestamp - a.timestamp);
          res.address = candidates[0].address;
        }
      }

      return res;
    } catch {
      return null;
    }
  };

  // Local structural extractor for SVG / text data (fast fallback)
  const parseTopikTextOrSvg = (dataUrl: string) => {
    try {
      let text = '';
      if (dataUrl.startsWith('data:image/svg+xml')) {
        if (dataUrl.includes(';base64,')) {
          text = atob(dataUrl.split(';base64,')[1]);
        } else if (dataUrl.includes(',')) {
          text = decodeURIComponent(dataUrl.split(',')[1]);
        }
      }
      if (!text) return null;

      const result: Partial<ApplicationFormData> = {};

      // docVerificationNo (문서확인번호 - 16 digits)
      const docMatch =
        text.match(/(?:문\s*서\s*확\s*인\s*번\s*호|Verification\s*No\.?|발급확인번호|진위확인번호)[^\d]*(\d{4})\s*[-–\s]\s*(\d{4})\s*[-–\s]\s*(\d{4})\s*[-–\s]\s*(\d{4})/i) ||
        text.match(/(\d{4})\s*[-–\s]\s*(\d{4})\s*[-–\s]\s*(\d{4})\s*[-–\s]\s*(\d{4})/) ||
        text.match(/(?:문\s*서\s*확\s*인\s*번\s*호)[^\d]*(\d{16})/i) ||
        text.match(/\b(\d{16})\b/);
      if (docMatch) {
        if (docMatch[4]) {
          result.docVerificationNo = [docMatch[1], docMatch[2], docMatch[3], docMatch[4]];
        } else if (docMatch[1] && docMatch[1].length === 16) {
          const s = docMatch[1];
          result.docVerificationNo = [s.slice(0, 4), s.slice(4, 8), s.slice(8, 12), s.slice(12, 16)];
        }
      }

      // examNumber (수 험 번 호)
      const examMatch =
        text.match(/(?:수\s*험\s*번\s*호|수험번호|Registration\s*No\.?|Application\s*No\.?)[^\d]*(\d{8,18})/i) ||
        text.match(/\b(\d{10,16})\b/);
      if (examMatch) {
        result.examNumber = examMatch[1];
      }

      // examDate (시험일자)
      const dateMatch =
        text.match(/(?:시\s*험\s*일(?:\s*자)?|Test\s*Date)[^\d]*(\d{4})[.\-\s년]+(\d{1,2})[.\-\s월]+(\d{1,2})/i) ||
        text.match(/(\d{4})[.\-\s]+(\d{1,2})[.\-\s]+(\d{1,2})/);
      if (dateMatch) {
        result.examDate = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
      }

      // round (회차)
      const roundMatch =
        text.match(/(?:제\s*)?(\d{1,3})\s*회/i) ||
        text.match(/(?:회\s*차|회\s{1,8}차|Test\s*Held|Round)[^\d]*(\d{1,3})/i) ||
        text.match(/(\d{2,3})th/i);
      if (roundMatch) {
        result.round = roundMatch[1];
      }

      // validUntil (성적유효기간)
      const validMatch =
        text.match(/(?:성\s*적\s*유\s*효\s*기\s*간|유\s*효\s*기\s*간|Valid\s*Until)[^\d]*(\d{4})[.\-\s년]+(\d{1,2})[.\-\s월]+(\d{1,2})/i);
      if (validMatch) {
        result.validUntil = `${validMatch[1]}-${validMatch[2].padStart(2, '0')}-${validMatch[3].padStart(2, '0')}`;
      }

      // grade (등급)
      const gradeMatch =
        text.match(/([1-6]\s*급)/i) ||
        text.match(/(?:등\s*급|Grade)[^\d]*([1-6])/i);
      if (gradeMatch) {
        result.grade = `${gradeMatch[1]}급`.replace(/\s/g, '');
      }

      return result;
    } catch {
      return null;
    }
  };

  // Auto-extract documents using Server AI or Client-Side Tesseract OCR (for GitHub Pages / static hosting)
  const handleExtractDocuments = async (
    customTopikUrl?: string,
    customArcFront?: string | null,
    customArcBack?: string | null,
    customPassportUrl?: string | null
  ) => {
    const topikUrl = customTopikUrl !== undefined ? customTopikUrl : docs.topikCertList[0]?.dataUrl;
    const frontUrl = customArcFront !== undefined ? customArcFront : docs.arcFront;
    const backUrl = customArcBack !== undefined ? customArcBack : docs.arcBack;
    const passportUrl = customPassportUrl !== undefined ? customPassportUrl : docs.passportList[0]?.dataUrl;

    if (!topikUrl && !frontUrl && !backUrl && !passportUrl) {
      setExtractError('សូមបញ្ចូលសញ្ញាបត្រ TOPIK ឬកាត ARC ជាមុនសិន!');
      return;
    }

    setIsExtractingTopik(true);
    setExtractError(null);
    setExtractSuccess(false);

    try {
      // 1. Try Server-side Gemini OCR first (when running with backend)
      let serverSucceeded = false;
      try {
        const response = await fetch('/api/extract-documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            arcFront: frontUrl,
            arcBack: backUrl,
            topikCert: topikUrl,
            topikCertList: docs.topikCertList,
            passport: passportUrl,
          }),
        });

        const resData = await response.json().catch(() => ({}));

        if (response.ok && resData.success && resData.data && !resData.fallbackMode) {
          const ext = resData.data;
          setFormData((prev) => mergeExtractedIntoFormData(prev, ext));
          serverSucceeded = true;
          setExtractSuccess(true);
          setTimeout(() => setExtractSuccess(false), 8000);
          return;
        }
      } catch {
        // Static hosting (GitHub Pages) - proceed to client-side OCR
      }

      if (!serverSucceeded) {
        // 2. Run Client-Side Tesseract.js OCR (Korean + English) directly in the browser!
        const parsedArc = parseArcTextOrSvg(frontUrl, backUrl);
        const parsedTopik = topikUrl ? parseTopikTextOrSvg(topikUrl) : null;
        const clientOcrData = await extractDocumentsClientSide({
          arcFront: frontUrl,
          arcBack: backUrl,
          topikCert: topikUrl,
          passport: passportUrl,
        });

        const combinedExtracted = {
          ...(parsedArc || {}),
          ...(parsedTopik || {}),
          ...clientOcrData,
        };

        setFormData((prev) => mergeExtractedIntoFormData(prev, combinedExtracted));
        setExtractSuccess(true);
        setTimeout(() => setExtractSuccess(false), 8000);
      }
    } catch (err: any) {
      console.warn('Extraction notice:', err);
      const parsedArc = parseArcTextOrSvg(frontUrl, backUrl);
      const parsedTopik = topikUrl ? parseTopikTextOrSvg(topikUrl) : null;
      setFormData((prev) =>
        mergeExtractedIntoFormData(prev, {
          ...(parsedArc || {}),
          ...(parsedTopik || {}),
        })
      );
      setExtractSuccess(true);
    } finally {
      setIsExtractingTopik(false);
    }
  };

  // Address matching hint
  const matchedOffice = findOfficeByAddress(formData.address);

  // Handle single file upload for ARC
  const handleArcUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      if (side === 'front') {
        setDocs((prev) => ({ ...prev, arcFront: dataUrl, arcFrontName: file.name }));
        handleExtractDocuments(undefined, dataUrl, docs.arcBack);
      } else {
        setDocs((prev) => ({ ...prev, arcBack: dataUrl, arcBackName: file.name }));
        handleExtractDocuments(undefined, docs.arcFront, dataUrl);
      }
    } catch (err) {
      console.error('File read error:', err);
    }
  };

  // Handle multiple files for Passport
  const handlePassportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const newItems = await Promise.all(
        Array.from(files).map(async (file) => ({
          id: Math.random().toString(36).substring(7),
          dataUrl: await fileToDataUrl(file),
          name: file.name,
        }))
      );
      setDocs((prev) => ({
        ...prev,
        passportList: [...prev.passportList, ...newItems],
      }));
      if (newItems.length > 0 && newItems[0].dataUrl) {
        handleExtractDocuments(undefined, docs.arcFront, docs.arcBack, newItems[0].dataUrl);
      }
    } catch (err) {
      console.error('Passport read error:', err);
    }
  };

  // Handle multiple files for TOPIK and auto-trigger extraction
  const handleTopikUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const newItems = await Promise.all(
        Array.from(files).map(async (file) => ({
          id: Math.random().toString(36).substring(7),
          dataUrl: await fileToDataUrl(file),
          name: file.name,
        }))
      );
      setDocs((prev) => ({
        ...prev,
        topikCertList: [...prev.topikCertList, ...newItems],
      }));

      // Trigger automatic extraction of TOPIK details
      if (newItems[0]?.dataUrl) {
        handleExtractDocuments(newItems[0].dataUrl);
      }
    } catch (err) {
      console.error('TOPIK read error:', err);
    }
  };

  // Handle Signature upload & auto-transparency / white background
  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rawDataUrl = await fileToDataUrl(file);
      setIsCleaningSig(true);
      const cleanedDataUrl = await removeImageBackground(rawDataUrl, {
        bgMode: sigBgMode,
        inkColor: sigInkColor,
        threshold: sigThreshold,
        autoCrop: true,
      });
      setDocs((prev) => ({
        ...prev,
        signature: cleanedDataUrl,
        signatureRaw: rawDataUrl,
      }));
    } catch (err) {
      console.error('Signature read error:', err);
    } finally {
      setIsCleaningSig(false);
    }
  };

  // Canvas signature drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = async () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const cleaned = await removeImageBackground(dataUrl, {
      bgMode: sigBgMode,
      inkColor: sigInkColor,
      threshold: sigThreshold,
      autoCrop: true,
    });
    setDocs((prev) => ({
      ...prev,
      signature: cleaned,
      signatureRaw: dataUrl,
    }));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDocs((prev) => ({
      ...prev,
      signature: null,
      signatureRaw: null,
    }));
  };

  // Validation: Mandatory documents & credentials (Exactly 6 Items Total per user requirement)
  // 1. 외국인등록증 មុខក្រោយ (Alien Registration Card front & back combined into 1 item)
  // 2. TOPIK 성적증명서 (TOPIK Score Certificate)
  // 3. 여권 (Passport Copy)
  // 4. ហត្ថលេខា (Signature)
  // 5. គណនី Socinet (Socinet ID)
  // 6. លេខទូរស័ព្ទ (Phone Number)
  // (Address search, building/mailbox, and official address can be skipped / អាចរំលងបាន)
  const hasArcFront = Boolean(docs.arcFront);
  const hasArcBack = Boolean(docs.arcBack);
  const hasArcCard = Boolean(hasArcFront && hasArcBack);
  const hasTopik = Boolean(docs.topikCertList && docs.topikCertList.length > 0);
  const hasPassport = Boolean(docs.passportList && docs.passportList.length > 0);
  const hasSignature = Boolean(docs.signature);
  const hasSocinetId = Boolean(formData.socinetId && formData.socinetId.trim().length > 0);
  const hasSocinetPw = Boolean(formData.socinetPw && formData.socinetPw.trim().length > 0);
  const hasSocinet = Boolean(hasSocinetId && hasSocinetPw);
  const hasPhone = Boolean(formData.phone && formData.phone.trim().length > 0);

  const checklist = [
    {
      id: 'arcCard',
      label: t.reqArcCard || 'កាត ARC មុខក្រោយ (외국인등록증 앞·뒷면)',
      done: hasArcCard,
      sectionId: !hasArcFront ? 'slot-arc-front' : 'slot-arc-back',
    },
    {
      id: 'topik',
      label: t.reqTopikCert || 'សញ្ញាបត្រពិន្ទុ TOPIK (성적증명서)',
      done: hasTopik,
      sectionId: 'slot-topik-cert',
    },
    {
      id: 'passport',
      label: t.reqPassport || 'លិខិតឆ្លងដែន / Passport (여권 사본)',
      done: hasPassport,
      sectionId: 'slot-passport',
    },
    {
      id: 'signature',
      label: t.reqSignature || 'ហត្ថលេខា (서명)',
      done: hasSignature,
      sectionId: 'slot-signature',
    },
    {
      id: 'socinet',
      label: t.reqSocinet || 'គណនី Socinet (ID & Password)',
      done: hasSocinet,
      sectionId: !hasSocinetId ? 'slot-socinet-id' : 'slot-socinet-pw',
    },
    {
      id: 'phone',
      label: t.reqPhone || 'លេខទូរស័ព្ទ (전화번호)',
      done: hasPhone,
      sectionId: 'slot-phone',
    },
  ];

  const completedCount = checklist.filter((item) => item.done).length;
  const isReady = completedCount === checklist.length;
  const isFullyComplete = isReady;

  return (
    <div className="space-y-8 pb-12">
      {/* Socinet Pre-requisite Alert Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50/80 to-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="space-y-0.5">
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              {t.socinetNoticeTag || 'Important Notice'}
            </div>
            <p className="text-sm sm:text-base font-bold text-amber-950 font-bokor leading-relaxed">
              {t.socinetNoticeAlert}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          <a
            href="https://www.socinet.go.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl transition-colors shadow-2xs"
          >
            <span>Socinet (www.socinet.go.kr)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          {onOpenSocinetNotice && (
            <button
              onClick={onOpenSocinetNotice}
              className="px-3.5 py-2 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-300 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              {t.socinetNoticeBtnVisit ? 'Info' : 'Details'}
            </button>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                ជំហ៊ានទី ១ (Step 1)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {t.step1Title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t.step1Subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span
              className={`text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                isReady
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs'
                  : 'bg-amber-50 text-amber-900 border border-amber-300 shadow-xs'
              }`}
            >
              {isReady ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.mandatoryDocsReady || `ឯកសារនិងព័ត៌មានចាំបាច់គ្រប់គ្រាន់ ១០០% (${checklist.length}/${checklist.length})`}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                  <span>
                    {t.mandatoryDocsNotice
                      ? t.mandatoryDocsNotice.replace('{completed}', String(completedCount))
                      : `ឯកសារនិងព័ត៌មានចាំបាច់ ${completedCount}/${checklist.length} (នៅខ្វះ ${checklist.length - completedCount})`}
                  </span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Inspirational TOPIK Study Motivation Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-teal-300/60 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-md">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="./study_background.jpg"
            alt="TOPIK Study Background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="relative z-10 p-5 sm:p-6 flex flex-col md:flex-row items-center gap-5 justify-between">
          <div className="flex items-center gap-4 sm:gap-5 w-full">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-teal-400/50 shadow-md shrink-0 bg-slate-800">
              <img
                src="./study_background.jpg"
                alt="Study Motivation"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-teal-300 bg-teal-500/20 px-2.5 py-0.5 rounded-full border border-teal-400/30">
                  {t.studyMotivation}
                </span>
                <span className="text-xs text-amber-300 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> Better Me, Brighter Future
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-100 italic">
                "가족의 미래와 나 자신의 미래를 위해 공부하는 것, 그 누구도 우리를 도와줄 수 없어요. 우리 자신만이 할 수 있어요."
              </p>
              <p className="text-[11px] sm:text-xs text-slate-300">
                {t.studyMotivationDesc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Slot 1: ARC Front */}
        <div id="slot-arc-front" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 transition-all scroll-mt-24">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{t.arcFrontLabel}</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            {docs.arcFront ? (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {t.completedStatus || 'បានបញ្ចូល'}
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-rose-500" />
                <span>* ចាំបាច់ (필수)</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">{t.arcFrontHint}</p>

          {docs.arcFront ? (
            <div className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2">
              <img
                src={docs.arcFront}
                alt="ARC Front"
                className="w-full h-44 object-contain rounded-lg bg-white"
              />
              <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => setDocs((p) => ({ ...p, arcFront: null }))}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 shadow"
                >
                  <Trash2 className="w-3.5 h-3.5" /> {t.uploadReplace}
                </button>
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-600 mb-2 transition-colors" />
              <span className="text-xs font-bold text-slate-700">{t.clickUploadArcFront}</span>
              <span className="text-[10px] text-slate-400 mt-1">{t.uploadArcHint}</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => handleArcUpload(e, 'front')}
              />
            </label>
          )}
        </div>

        {/* Slot 2: ARC Back */}
        <div id="slot-arc-back" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 transition-all scroll-mt-24">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{t.arcBackLabel}</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            {docs.arcBack ? (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {t.completedStatus || 'បានបញ្ចូល'}
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-rose-500" />
                <span>* ចាំបាច់ (필수)</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">{t.arcBackHint}</p>

          {docs.arcBack ? (
            <div className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2">
              <img
                src={docs.arcBack}
                alt="ARC Back"
                className="w-full h-44 object-contain rounded-lg bg-white"
              />
              <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => setDocs((p) => ({ ...p, arcBack: null }))}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 shadow"
                >
                  <Trash2 className="w-3.5 h-3.5" /> លុបប្តូរថ្មី
                </button>
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-600 mb-2 transition-colors" />
              <span className="text-xs font-bold text-slate-700">{t.clickUploadArcBack}</span>
              <span className="text-[10px] text-slate-400 mt-1">{t.uploadArcBackHint}</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => handleArcUpload(e, 'back')}
              />
            </label>
          )}
        </div>

        {/* Slot 3: TOPIK Score Certificate with Auto-Extraction Display */}
        <div id="slot-topik-cert" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 transition-all scroll-mt-24">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{t.topikCertLabel}</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            {docs.topikCertList.length > 0 ? (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {docs.topikCertList.length} សន្លឹក ({t.completedStatus || 'រួចរាល់'})
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-rose-500" />
                <span>* ចាំបាច់ (필수)</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">{t.topikCertHint}</p>

          <div className="space-y-3">
            {docs.topikCertList.map((item, index) => (
              <div key={item.id} className="relative group rounded-xl border border-slate-200 p-2 bg-slate-50 flex items-center gap-3">
                <img
                  src={item.dataUrl}
                  alt={item.name}
                  className="w-16 h-20 object-contain rounded bg-white border border-slate-200"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-bold text-slate-800 truncate">{item.name || `TOPIK Report #${index + 1}`}</p>
                  <p className="text-emerald-700 font-semibold mt-0.5">TOPIK Score Certificate</p>
                  <button
                    type="button"
                    onClick={() => handleExtractDocuments(item.dataUrl)}
                    disabled={isExtractingTopik}
                    className="mt-1 text-[11px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isExtractingTopik ? 'animate-spin' : ''}`} />
                    <span>{t.reExtractTopik}</span>
                  </button>
                </div>
                <button
                  onClick={() =>
                    setDocs((prev) => ({
                      ...prev,
                      topikCertList: prev.topikCertList.filter((x) => x.id !== item.id),
                    }))
                  }
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/30 rounded-xl p-4 flex items-center justify-center gap-2 cursor-pointer transition-colors group">
              <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
              <span className="text-xs font-bold text-slate-700">{t.addMoreTopik}</span>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleTopikUpload}
              />
            </label>

            {/* Prominent TOPIK Extracted Info Card */}
            {docs.topikCertList.length > 0 && (
              <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>{t.topikExtractedInfo}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowTopikEditModal(true)}
                    className="text-[11px] font-bold text-emerald-700 bg-white hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{t.editBtn}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-emerald-200">
                  <div>
                    <span className="text-slate-500 block">회차 (លើកទី/ជុំ):</span>
                    <strong className="text-slate-900 text-xs">{formData.round ? `${formData.round} 회` : '107 회'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">수험번호 (លេខកូដ):</span>
                    <strong className="text-slate-900 text-xs font-mono">{formData.examNumber || '0010197000017'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">시험일 (ថ្ងៃប្រឡង):</span>
                    <strong className="text-slate-900 text-xs">{formData.examDate || '2026-07-05'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">성적유효기간 (សុពលភាព):</span>
                    <strong className="text-rose-600 text-xs">{formData.validUntil || '2028-08-12'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">등급 (កម្រិតពិន្ទុ):</span>
                    <strong className="text-emerald-700 text-xs">{formData.grade || '2급'}</strong>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-500 block">문서확인번호 (លេខបញ្ជាក់):</span>
                    <strong className="text-blue-700 font-mono text-[10.5px]">
                      {formData.docVerificationNo.join('-')}
                    </strong>
                  </div>
                </div>

                {isExtractingTopik && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold animate-pulse pt-1">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.extractingTopikMsg}</span>
                  </div>
                )}
                {extractSuccess && (
                  <p className="text-[11px] text-emerald-800 font-bold">
                    {t.extractSuccessTopikMsg}
                  </p>
                )}
                {extractError && (
                  <p className="text-[11px] text-amber-700 font-semibold">
                    {extractError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Slot 4: Passport (Mandatory Document & Details) */}
        <div id="slot-passport" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 transition-all scroll-mt-24">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span>{t.passportSection || 'លិខិតឆ្លងដែន / Passport (여권)'}</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            {hasPassport ? (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {docs.passportList.length} សន្លឹក ({t.completedStatus || 'រួចរាល់'})
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-rose-500" />
                <span>* ចាំបាច់ (필수) — សូម Upload</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">{t.passportHint || 'Upload រូបថតទំព័រពត៌មានលិខិតឆ្លងដែន (PDF, JPG, PNG)'}</p>

          {/* Alert Notice */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-2.5 text-xs text-blue-950 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span className="text-[11.5px] leading-relaxed">
              {t.passportRequiredAlert || '⚠️ លិខិតឆ្លងដែន (Passport) គឺជាឯកសារផ្លូវការចាំបាច់សម្រាប់ជនបរទេស ក្នុងការដាក់ពាក្យស្នើសុំទៅកាន់ការិយាល័យអន្តោប្រវេសន៍!'}
            </span>
          </div>

          {/* Uploaded File List */}
          <div className="space-y-3">
            {docs.passportList.map((item, index) => (
              <div key={item.id} className="relative group rounded-xl border border-slate-200 p-2 bg-slate-50 flex items-center gap-3">
                <img
                  src={item.dataUrl}
                  alt={item.name}
                  className="w-16 h-20 object-contain rounded bg-white border border-slate-200"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-bold text-slate-800 truncate">{item.name || `Passport #${index + 1}`}</p>
                  <p className="text-blue-700 font-semibold mt-0.5">Passport Information Page</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setDocs((prev) => ({
                      ...prev,
                      passportList: prev.passportList.filter((x) => x.id !== item.id),
                    }))
                  }
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove passport"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <label className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-center gap-2 cursor-pointer transition-colors group ${
              hasPassport ? 'border-slate-300 hover:border-slate-500 hover:bg-slate-50' : 'border-rose-300 bg-rose-50/20 hover:border-rose-500'
            }`}>
              <Upload className={`w-5 h-5 ${hasPassport ? 'text-slate-400 group-hover:text-slate-700' : 'text-rose-500'}`} />
              <span className={`text-xs font-bold ${hasPassport ? 'text-slate-700' : 'text-rose-700'}`}>
                {docs.passportList.length > 0 ? t.uploadPassportMulti : '+ បញ្ចូលរូបថត/Scan លិខិតឆ្លងដែន (Passport)'}
              </span>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handlePassportUpload}
              />
            </label>
          </div>

          
        </div>
      </div>

      {/* Signature & Socinet Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Signature Box */}
        <div id="slot-signature" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 transition-all scroll-mt-24">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-indigo-600" />
                <span>{t.signatureLabel}</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              {docs.signature ? (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {t.completedStatus || 'រួចរាល់'}
                </span>
              ) : (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-500" />
                  <span>* ចាំបាច់ (필수)</span>
                </span>
              )}
            </div>
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setSignatureMode('draw')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  signatureMode === 'draw'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.drawSignature}
              </button>
              <button
                type="button"
                onClick={() => setSignatureMode('upload')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  signatureMode === 'upload'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.uploadSignature}
              </button>
            </div>
          </div>

          {signatureMode === 'draw' ? (
            <div className="space-y-2">
              <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-50 relative">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={150}
                  className="w-full h-36 bg-white cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!docs.signature && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-slate-400">
                    {t.drawSignatureHere}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{t.drawSignatureHint}</span>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-rose-600 hover:text-rose-800 font-bold"
                >
                  {t.clearSignature}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {docs.signature ? (
                <div className="space-y-3">
                  {/* Cleaned Signature Preview Card */}
                  <div className="p-3.5 border-2 border-indigo-200 rounded-2xl bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{t.sigPreviewLabel}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setDocs((p) => ({ ...p, signature: null, signatureRaw: null }))}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title={t.deleteSigTitle}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Preview Screen with Checkered vs White backdrop */}
                    <div 
                      className="w-full h-24 rounded-xl border border-slate-300 flex items-center justify-center p-2 relative overflow-hidden transition-all"
                      style={{
                        backgroundImage: sigBgMode === 'transparent'
                          ? 'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)'
                          : 'none',
                        backgroundSize: '12px 12px',
                        backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
                        backgroundColor: sigBgMode === 'white' ? '#ffffff' : '#f1f5f9',
                      }}
                    >
                      <img
                        src={docs.signature}
                        alt="Cleaned Signature"
                        className="h-20 max-w-full object-contain"
                      />
                      {isCleaningSig && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center gap-2 text-xs font-bold text-indigo-700">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{t.adjustingBg}</span>
                        </div>
                      )}
                    </div>

                    {/* Control Panel: Background Mode & Ink Color & Sensitivity */}
                    <div className="space-y-2.5 pt-1 text-xs">
                      {/* Background Mode: Transparent vs Pure White */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <span className="font-bold text-slate-700">{t.selectSigBg}</span>
                        <div className="flex bg-slate-200/90 p-0.5 rounded-xl font-bold text-[11px]">
                          <button
                            type="button"
                            onClick={() => {
                              setSigBgMode('transparent');
                              reprocessSignature(undefined, 'transparent', sigInkColor, sigThreshold);
                            }}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                              sigBgMode === 'transparent'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {t.transparentBg}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSigBgMode('white');
                              reprocessSignature(undefined, 'white', sigInkColor, sigThreshold);
                            }}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                              sigBgMode === 'white'
                                ? 'bg-white text-indigo-700 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {t.whiteBg}
                          </button>
                        </div>
                      </div>

                      {/* Ink Color: Automatic Official Black Ink (검정색) */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-700">{t.inkColor}</span>
                          <span className="text-[10px] text-slate-500 font-sans">
                            ({lang === "km" ? "កំណត់ស្វ័យប្រវត្តិតាមស្តង់ដាររដ្ឋ" : "공식 서식 표준 자동 적용"})
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold shadow-xs border border-slate-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0" />
                          <span>{lang === "km" ? "ពណ៌ខ្មៅផ្លូវការ (Black • ស្វ័យប្រវត្តិ)" : "검정색 (Black • 자동 적용)"}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        </div>
                      </div>

                      {/* Sensitivity Threshold Slider */}
                      <div className="space-y-1 pt-1 bg-white p-2.5 rounded-xl border border-slate-200">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-slate-600">
                            {t.thresholdLabel}
                          </span>
                          <span className="font-mono font-bold text-indigo-600">{sigThreshold}%</span>
                        </div>
                        <input
                          type="range"
                          min="15"
                          max="90"
                          value={sigThreshold}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSigThreshold(val);
                            reprocessSignature(undefined, sigBgMode, sigInkColor, val);
                          }}
                          className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{t.thresholdLight}</span>
                          <span>{t.thresholdStrong}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 mb-1" />
                  <span className="text-xs font-bold text-slate-700">{t.uploadSigPhoto}</span>
                  <span className="text-[10px] text-slate-400">{t.uploadSigPhotoHint}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSignatureUpload}
                  />
                </label>
              )}
            </div>
          )}
        </div>

        {/* Socinet & Phone Info Box */}
        <div id="slot-socinet" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="space-y-0.5">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-blue-600" />
                <span>{t.socinetSection}</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <p className="text-xs text-slate-500">{t.socinetHint}</p>
            </div>
            <a
              href="https://www.socinet.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 shrink-0 self-start sm:self-auto transition-colors"
            >
              <span>Socinet (www.socinet.go.kr)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Explanatory alert */}
          <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="font-bokor leading-relaxed">
              {t.socinetMandatoryAlert || '⚠️ ព័ត៌មាន Socinet ID និង Password គឺចាំបាច់បំផុត ដើម្បីមន្ត្រីអន្តោប្រវេសន៍អាចចូលភ្ជាប់ពិន្ទុ TOPIK ចូលក្នុងប្រព័ន្ធ KIIP (www.socinet.go.kr) របស់អ្នកបាន!'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Socinet ID */}
            <div id="slot-socinet-id" className="space-y-1 transition-all scroll-mt-24">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Socinet ID:</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                {hasSocinetId ? (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {t.completedStatus || 'រួចរាល់'}
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-500" /> * ចាំបាច់ (필수)
                  </span>
                )}
              </div>
              <input
                type="text"
                placeholder={t.socinetIdPlaceholder || 'ឧ. user1234'}
                value={formData.socinetId}
                onChange={(e) => setFormData((p) => ({ ...p, socinetId: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 ${
                  hasSocinetId ? 'border-slate-300 focus:ring-blue-500' : 'border-rose-300 bg-rose-50/20 focus:ring-rose-500'
                }`}
              />
            </div>

            {/* Socinet Password */}
            <div id="slot-socinet-pw" className="space-y-1 transition-all scroll-mt-24">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Socinet Password:</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                {hasSocinetPw ? (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {t.completedStatus || 'រួចរាល់'}
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-500" /> * ចាំបាច់ (필수)
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showSocinetPw ? 'text' : 'password'}
                  placeholder={t.socinetPwPlaceholder || '••••••••'}
                  value={formData.socinetPw}
                  onChange={(e) => setFormData((p) => ({ ...p, socinetPw: e.target.value }))}
                  className={`w-full px-3 py-2 pr-9 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 ${
                    hasSocinetPw ? 'border-slate-300 focus:ring-blue-500' : 'border-rose-300 bg-rose-50/20 focus:ring-rose-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowSocinetPw(!showSocinetPw)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title={showSocinetPw ? "Hide password" : "Show password"}
                >
                  {showSocinetPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div id="slot-phone" className="pt-2 transition-all scroll-mt-24 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.phoneLabel} (លេខទូរស័ព្ទ / 휴대폰)</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              {hasPhone ? (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {t.completedStatus || 'រួចរាល់'}
                </span>
              ) : (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-500" />
                  <span>* ចាំបាច់ (필수)</span>
                </span>
              )}
            </div>
            <input
              type="tel"
              placeholder={t.phonePlaceholder}
              value={formData.phone}
              onChange={(e) =>
                setFormData((p) => ({ ...p, phone: e.target.value, mobile: e.target.value }))
              }
              className={`w-full px-3 py-2 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 ${
                hasPhone ? 'border-slate-300 focus:ring-blue-500' : 'border-rose-300 bg-rose-50/20 focus:ring-rose-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE KOREAN ADDRESS & POSTAL / BUILDING SEARCH */}
      <div id="slot-address" className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 transition-all scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <span>{t.addressSearchBoxTitle}</span>
              </label>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>{t.skippableAddressNotice || 'អាចរំលងបាន (មិនបង្ខំ)'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.addressSkippableHint || 'បើអាស័យដ្ឋាន មិនបាន Auto detected ក្នុង អាសយដ្ឋានពេញលេញផ្លូវការ (체류지 주소) សូមបំពេញវាដោយដៃ !'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowAddressModal(true);
              runAddressSearch(searchQuery);
            }}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:scale-95 px-3.5 py-2 rounded-xl border border-indigo-200 font-bold transition-all cursor-pointer shadow-xs shrink-0"
          >
            <Building2 className="w-4 h-4" />
            <span>{t.openAddressSearchPopup}</span>
          </button>
        </div>

        {/* Search Bar Container */}
        <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200 space-y-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pb-1">
            <span className="text-xs font-bold text-slate-600 mr-1">{t.locationType}</span>
            {[
              { id: 'all', label: t.locAll },
              { id: '공단/산업단지', label: t.locIndustrial },
              { id: '아파트/주택', label: t.locResidential },
              { id: '공공/지원센터', label: t.locCommunity },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleCategorySelect(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  addressCategory === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input with Search & Clear Buttons */}
          <div className="relative">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder={t.addressSearchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => handleAddressInputChange(e.target.value)}
                  onFocus={() => {
                    if (addressResults.length > 0) setShowAddressDropdown(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      runAddressSearch(searchQuery);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-indigo-300 rounded-xl text-xs sm:text-sm bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-semibold shadow-2xs"
                />
              </div>

              <button
                type="button"
                onClick={() => runAddressSearch(searchQuery)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>{t.searchBtn}</span>
              </button>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    runAddressSearch('');
                    setShowAddressDropdown(false);
                  }}
                  className="px-3 py-2.5 text-xs text-slate-500 hover:text-slate-800 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold transition-colors shrink-0 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{t.clearBtn}</span>
                </button>
              )}
            </div>

            {/* Quick Location Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2.5">
              <span className="text-[11px] font-bold text-slate-500 mr-1">{t.popularLocations}</span>
              {[
                { label: '서산 수석산업단지 (31993)', query: '서산' },
                { label: '수원 영통 반달로 (16705)', query: '수원' },
                { label: '화성 발안공단 (18624)', query: '발안' },
                { label: '안산 반월스마트허브 (15612)', query: '안산' },
                { label: '평택 포승공단 (17962)', query: '포승' },
                { label: '천안 2공단 (31040)', query: '천안' },
                { label: '아산 테크노밸리 (31409)', query: '아산' },
                { label: '당진 부곡공단 (31718)', query: '당진' },
                { label: '김포 통진/대곶 (10005)', query: '김포' },
                { label: '서울 목동 (08013)', query: '양천구' },
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    setSearchQuery(chip.query);
                    runAddressSearch(chip.query);
                  }}
                  className="px-2 py-0.5 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-[11px] font-semibold rounded-md border border-slate-200 transition-colors cursor-pointer"
                >
                  📍 {chip.label}
                </button>
              ))}
            </div>

            {/* Autocomplete Dropdown List */}
            {showAddressDropdown && addressResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-indigo-200 overflow-hidden z-40 max-h-72 overflow-y-auto divide-y divide-slate-100">
                <div className="p-2.5 bg-indigo-50/70 text-indigo-900 text-[11px] font-bold flex justify-between items-center">
                  <span>{t.addressResultsCount.replace('{n}', String(addressResults.length))}</span>
                  <button
                    type="button"
                    onClick={() => setShowAddressDropdown(false)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {addressResults.map((item, idx) => {
                  const office = findOfficeByAddress(item.roadAddress);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectAddress(item)}
                      className="p-3 hover:bg-indigo-50 cursor-pointer transition-colors space-y-1 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-700">
                          {item.roadAddress}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-mono text-[10px] font-bold">
                            우편: {item.zonecode}
                          </span>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                        {item.buildingName && (
                          <span className="text-indigo-700 font-semibold">🏢 {item.buildingName}</span>
                        )}
                        <span>[지번] {item.jibunAddress}</span>
                      </div>
                      {office && (
                        <div className="text-[10px] text-emerald-700 font-bold">
                          {t.matchedOfficeLabel} {office.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected Full Address Input & Detail Address */}
        <div className="space-y-3 pt-1">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                {t.officialAddressLabel}
              </label>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>{t.skippableAddressNotice || 'អាចរំលងបាន (선택)'}</span>
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t.addressSearchPlaceholder}
                value={formData.address}
                onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                className="flex-1 px-4 py-2.5 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-2xs"
              />
              <button
                type="button"
                onClick={() => {
                  setShowAddressModal(true);
                  runAddressSearch(formData.address || searchQuery);
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>ស្វែងរក 주소 검색</span>
              </button>
            </div>
          </div>

          {/* Additional Detail Address Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {t.addressDetailLabel}
            </label>
            <input
              type="text"
              placeholder={t.addressDetailPlaceholder}
              value={detailAddress}
              onChange={(e) => handleDetailAddressChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Auto match indicator */}
        {matchedOffice ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>{t.autoMatchedOffice}</strong> {matchedOffice.name} ({matchedOffice.email})
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Matched!
            </span>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {formData.address ? '{t.noOfficeMatchedWarning}' : 'សូមវាយបញ្ចូលអាសយដ្ឋានដូចក្នុងកាត ARC (ឧ. 충청남도 서산시...)'}
            </span>
          </div>
        )}
      </div>

      {/* Address Search Popup Modal (Korean Daum Postcode Style) */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-200" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">{t.addressModalTitle}</h3>
                  <p className="text-[11px] text-indigo-100">ស្វែងរកតាមលេខកូដប្រៃសណីយ៍ 5 ខ្ទង់, ឈ្មោះអគារ/រោងចក្រ, ឬឈ្មោះផ្លូវ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder={t.addressSearchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => handleAddressInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        runAddressSearch(searchQuery);
                      }
                    }}
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-indigo-300 rounded-xl text-xs sm:text-sm font-medium bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => runAddressSearch(searchQuery)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>{t.searchBtn}</span>
                </button>
              </div>

              {/* Modal Category Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'ទាំងអស់ (전체)' },
                  { id: '공단/산업단지', label: '🏭 공단/산단' },
                  { id: '아파트/주택', label: '🏢 아파트/주택' },
                  { id: '공공/지원센터', label: '🏛️ 지원센터' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleCategorySelect(tab.id as any)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      addressCategory === tab.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-indigo-50 border border-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Results List */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 space-y-2">
              <div className="text-xs font-bold text-slate-500 flex justify-between items-center pb-1">
                <span>{t.addressResultsCount.replace('{n}', String(addressResults.length))}</span>
                <span className="text-indigo-600 text-[11px]">{t.clickToSelectAddress}</span>
              </div>

              {addressResults.length > 0 ? (
                addressResults.map((item, idx) => {
                  const office = findOfficeByAddress(item.roadAddress);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectAddress(item)}
                      className="p-3 hover:bg-indigo-50/80 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-indigo-200 space-y-1 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-indigo-700">
                          {item.roadAddress}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono text-[11px] font-bold shrink-0">
                          우편: {item.zonecode}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] flex flex-wrap items-center gap-2">
                        {item.buildingName && (
                          <span className="text-indigo-700 font-bold">🏢 {item.buildingName}</span>
                        )}
                        <span>[지번] {item.jibunAddress}</span>
                        {item.bunjinumber && (
                          <span className="text-slate-400">· 번지: {item.bunjinumber}</span>
                        )}
                      </div>
                      {office && (
                        <div className="pt-0.5">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {t.matchedOfficeLabel} {office.name} ({office.email})
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center space-y-3">
                  <p className="text-xs text-slate-500">
                    {t.addressNotFoundInSample}
                  </p>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((p) => ({ ...p, address: searchQuery }));
                        setShowAddressModal(false);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {t.useAsCustomAddress.replace('{q}', searchQuery)}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                {t.closeModal}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick TOPIK Edit Modal in Step 1 */}
      {showTopikEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-700 px-5 py-3.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-sm sm:text-base">កែសម្រួលពត៌មានលទ្ធផលប្រឡង TOPIK</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTopikEditModal(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">회차 (លើកទី/ជុំ):</label>
                  <input
                    type="text"
                    value={formData.round}
                    onChange={(e) => setFormData((p) => ({ ...p, round: e.target.value.replace(/[^0-9]/g, '') }))}
                    placeholder="107"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">수험번호 (លេខកូដប្រឡង):</label>
                  <input
                    type="text"
                    value={formData.examNumber}
                    onChange={(e) => setFormData((p) => ({ ...p, examNumber: e.target.value }))}
                    placeholder="0010197000017"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">시험일 (ថ្ងៃប្រឡង):</label>
                  <input
                    type="date"
                    value={formData.examDate}
                    onChange={(e) => setFormData((p) => ({ ...p, examDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">성적유효기간 (សុពលភាព):</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData((p) => ({ ...p, validUntil: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-rose-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  문서확인번호 (លេខបញ្ជាក់ឯកសារ ១៦ ខ្ទង់):
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={4}
                      value={formData.docVerificationNo[idx] || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        const next = [...formData.docVerificationNo];
                        next[idx] = val;
                        setFormData((p) => ({ ...p, docVerificationNo: next }));
                      }}
                      className="w-full text-center px-2 py-2 border border-slate-300 rounded-lg font-mono font-bold text-xs"
                      placeholder="0000"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">등급 (កម្រិតពិន្ទុ):</label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData((p) => ({ ...p, grade: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="1급">1급 (Level 1)</option>
                  <option value="2급">2급 (Level 2)</option>
                  <option value="3급">3급 (Level 3)</option>
                  <option value="4급">4급 (Level 4)</option>
                  <option value="5급">5급 (Level 5)</option>
                  <option value="6급">6급 (Level 6)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTopikEditModal(false)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                {t.saveBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Step 1 Completion & Validation Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-600" />
              <span>{t.mandatoryItemsSummary || 'ឯកសារនិងព័ត៌មានចាំបាច់ទាំង ៦ សម្រាប់បន្តទៅជំហ៊ានទី ២'}</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.addressSkippableHint || 'បើអាស័យដ្ឋាន មិនបាន Auto detected ក្នុង អាសយដ្ឋានពេញលេញផ្លូវការ (체류지 주소) សូមបំពេញវាដោយដៃ !'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">
              {completedCount}/{checklist.length} {t.completedStatus || 'រួចរាល់'}
            </span>
            <div className="w-24 sm:w-32 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-500 ${
                  isReady ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${(completedCount / checklist.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* 5 Mandatory Items Grid Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {checklist.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                const el = document.getElementById(item.sectionId);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                item.done
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 hover:bg-emerald-100/70'
                  : 'bg-rose-50/80 border-rose-200 text-rose-950 hover:bg-rose-100/70'
              }`}
            >
              <span className="truncate pr-2">{item.label}</span>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0 flex items-center gap-1 ${
                  item.done
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {item.done ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>{t.completedStatus || 'រួចរាល់'}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    <span>{t.missingStatus || 'នៅខ្វះ'}</span>
                  </>
                )}
              </span>
            </button>
          ))}

          {/* Skippable Address item indicator */}
          <div className="p-2.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 text-emerald-900 text-xs font-semibold flex items-center justify-between">
            <span className="truncate pr-2">📍 {t.addressLabel || 'អាសយដ្ឋានកូរ៉េ & ប្រអប់សំបុត្រ'}</span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
              {t.skippableBadge || 'អាចរំលងបាន'}
            </span>
          </div>
        </div>

        {/* Action Button & Status Alert */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            {isReady ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.mandatoryDocsReady || `ឯកសារនិងព័ត៌មានចាំបាច់គ្រប់គ្រាន់ ១០០% (${checklist.length}/${checklist.length}) — អាចបន្តទៅជំហ៊ានទី ២ បានហើយ!`}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 px-3.5 py-2 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                <span>
                  {t.mandatoryDocsNotice
                    ? t.mandatoryDocsNotice.replace('{completed}', String(completedCount))
                    : `សូមបំពេញឯកសារ និងព័ត៌មានចាំបាច់ទាំង ៦ មុខឱ្យគ្រប់គ្រាន់ (${completedCount}/${checklist.length}) រួមទាំង Socinet ID ដើម្បីអាចចុចបន្តទៅជំហ៊ានទី ២ បាន`}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (!isReady) {
                const firstMissing = checklist.find((item) => !item.done);
                if (firstMissing) {
                  document.getElementById(firstMissing.sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
              }
              onNext();
            }}
            disabled={!isReady}
            className={`w-full sm:w-auto px-9 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md ${
              isReady
                ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border border-slate-300'
            }`}
          >
            {isReady ? (
              <>
                <span>{t.nextStep}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-slate-400" />
                <span>{t.nextStep} ({completedCount}/{checklist.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
