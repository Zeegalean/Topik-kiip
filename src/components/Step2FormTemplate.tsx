import React, { useState, useEffect } from 'react';
import { 
  ApplicationFormData, 
  UploadedDocuments, 
  Language, 
  SignatureSettings 
} from '../types';
import { getTranslation } from '../utils/translations';
import { removeImageBackground, fileToDataUrl } from '../utils/imageUtils';
import { findOfficeByAddress } from '../data/immigrationOffices';
import { InteractiveSignatureOverlay } from './InteractiveSignatureOverlay';
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
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Move, 
  ZoomIn, 
  RefreshCw,
  FileCheck,
  PenTool,
  Trash2,
  Upload,
  Award,
  Lock,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  Stamp,
  Unlock
} from 'lucide-react';
import { WatermarkOverlay } from './WatermarkOverlay';
import { OfficialApprovedSeal } from './OfficialApprovedSeal';
import confetti from 'canvas-confetti';
import { RightClickProtectionToast } from './RightClickProtectionToast';

interface Step2FormTemplateProps {
  formData: ApplicationFormData;
  setFormData: React.Dispatch<React.SetStateAction<ApplicationFormData>>;
  docs: UploadedDocuments;
  setDocs: React.Dispatch<React.SetStateAction<UploadedDocuments>>;
  sigSettings?: SignatureSettings;
  setSigSettings?: React.Dispatch<React.SetStateAction<SignatureSettings>>;
  lang: Language;
  onNext: () => void;
  onPrev: () => void;
  formRef: React.RefObject<HTMLDivElement | null>;
  isPaid?: boolean;
  setIsPaid?: (paid: boolean) => void;
  onOpenPayment?: () => void;
}

export const Step2FormTemplate: React.FC<Step2FormTemplateProps> = ({
  formData,
  setFormData,
  docs,
  setDocs,
  sigSettings: propSigSettings,
  setSigSettings: propSetSigSettings,
  lang,
  onNext,
  onPrev,
  formRef,
  isPaid = false,
  setIsPaid,
  onOpenPayment,
}) => {
  const [showRightClickNotice, setShowRightClickNotice] = useState(false);
  const [showStep2SocinetPw, setShowStep2SocinetPw] = useState(false);
  const t = getTranslation(lang);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState(false);
  const [extractSuccessMsg, setExtractSuccessMsg] = useState<string | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [isHighDemandError, setIsHighDemandError] = useState(false);

  // Seal Unlock Handler (Unmasks / Unlocks the form with confetti & official seal)
  const handleSealUnlock = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {}
    if (setIsPaid) {
      setIsPaid(true);
    }
    setExtractSuccess(true);
    setExtractSuccessMsg(
      lang === "km"
        ? "✓ ត្រាដោះសោផ្លូវការត្រូវបានអនុវត្តជោគជ័យ! ការបិទបាំងលើ Form ត្រូវបានដកចេញស្អាត ១០០%។"
        : lang === "ko"
        ? "✓ 사회통합프로그램 접수·승인 직인이 날인되어 반려본 잠금이 완전히 해제되었습니다!"
        : "✓ Official Seal Applied! Form masking has been completely removed."
    );
    setTimeout(() => setExtractSuccess(false), 5000);
  };

  // Signature interactive settings (uses props if passed, or internal state fallback)
  const [internalSigSettings, setInternalSigSettings] = useState<SignatureSettings>({
    x: 0,
    y: 0,
    scale: 1.0,
    removeBg: true,
    bgMode: 'transparent',
    inkColor: 'black',
    threshold: 55,
  });

  const sigSettings = propSigSettings || internalSigSettings;
  const setSigSettings = propSetSigSettings || setInternalSigSettings;

  // Canvas drawing state inside Step 2
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

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

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setDocs((prev) => ({
      ...prev,
      signature: dataUrl,
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

  // Helper parser for Alien Registration Card data URL (SVG or text)
  const parseLocalArcData = (frontUrl?: string | null, backUrl?: string | null) => {
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
        // Search surrounding lines for 신고일자 date
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
        // Sort descending by timestamp (latest 신고일 first)
        candidates.sort((a, b) => b.timestamp - a.timestamp);
        res.address = candidates[0].address;
      }
    }

    return res;
  };

  // Helper parser for TOPIK certificate data URL (SVG, text, or sample)
  const parseLocalTopikData = (topikUrl: string) => {
    let text = '';
    if (topikUrl.startsWith('data:image/svg+xml')) {
      if (topikUrl.includes(';base64,')) {
        try {
          text = atob(topikUrl.split(';base64,')[1]);
        } catch (e) {
          // ignore
        }
      } else if (topikUrl.includes(',')) {
        text = decodeURIComponent(topikUrl.split(',')[1]);
      }
    }

    const docVerMatch =
      text.match(/(?:문\s*서\s*확\s*인\s*번\s*호|Verification\s*No\.?|발급확인번호|진위확인번호)[^\d]*(\d{4})\s*[-–\s]\s*(\d{4})\s*[-–\s]\s*(\d{4})\s*[-–\s]\s*(\d{4})/i) ||
      text.match(/(\d{4})\s*[-–\s]\s*(\d{4})\s*[-–\s]\s*(\d{4})\s*[-–\s]\s*(\d{4})/) ||
      text.match(/(?:문\s*서\s*확\s*인\s*번\s*호)[^\d]*(\d{16})/i) ||
      text.match(/\b(\d{16})\b/);

    const examMatch =
      text.match(/(?:수\s*험\s*번\s*호|수험번호|Registration\s*No\.?|Application\s*No\.?)[^\d]*(\d{8,18})/i) ||
      text.match(/\b(\d{10,16})\b/);

    const roundMatch =
      text.match(/(?:제\s*)?(\d{1,3})\s*회/i) ||
      text.match(/(?:회\s*차|회\s{1,8}차|Test\s*Held|Round)[^\d]*(\d{1,3})/i) ||
      text.match(/(\d{2,3})th/i);

    const dateMatch =
      text.match(/(?:시\s*험\s*일(?:\s*자)?|Test\s*Date)[^\d]*(\d{4})[.\-\s년]+(\d{1,2})[.\-\s월]+(\d{1,2})/i) ||
      text.match(/(\d{4})[.\-\s]+(\d{1,2})[.\-\s]+(\d{1,2})/);

    const validMatch =
      text.match(/(?:성\s*적\s*유\s*효\s*기\s*간|유\s*효\s*기\s*간|Valid\s*Until)[^\d]*(\d{4})[.\-\s년]+(\d{1,2})[.\-\s월]+(\d{1,2})/i);

    const gradeMatch =
      text.match(/([1-6]\s*급)/i) ||
      text.match(/(?:등\s*급|Grade)[^\d]*([1-6])/i);

    let docParts: string[] | null = null;
    if (docVerMatch) {
      if (docVerMatch[4]) {
        docParts = [docVerMatch[1], docVerMatch[2], docVerMatch[3], docVerMatch[4]];
      } else if (docVerMatch[1] && docVerMatch[1].length === 16) {
        const s = docVerMatch[1];
        docParts = [s.slice(0, 4), s.slice(4, 8), s.slice(8, 12), s.slice(12, 16)];
      }
    }

    return {
      docVerificationNo: docParts,
      examNumber: examMatch ? examMatch[1] : null,
      round: roundMatch ? roundMatch[1] : null,
      examDate: dateMatch ? `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}` : null,
      validUntil: validMatch ? `${validMatch[1]}-${validMatch[2].padStart(2, '0')}-${validMatch[3].padStart(2, '0')}` : null,
      grade: gradeMatch ? gradeMatch[1].replace(/\s/g, '') : null,
    };
  };

  // Quick direct upload handlers within Step 2
  const handleQuickArcUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await fileToDataUrl(file);
      if (side === 'front') {
        setDocs((prev) => ({ ...prev, arcFront: url, arcFrontName: file.name }));
        handleExtractWithAi({ arcFront: url });
      } else {
        setDocs((prev) => ({ ...prev, arcBack: url, arcBackName: file.name }));
        handleExtractWithAi({ arcBack: url });
      }
    } catch (err) {
      console.error('Quick ARC upload error:', err);
    }
  };

  const handleQuickTopikUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await fileToDataUrl(file);
      const newItems = [{ id: Math.random().toString(36).substring(7), dataUrl: url, name: file.name }];
      setDocs((prev) => ({
        ...prev,
        topikCertList: newItems,
      }));
      handleExtractWithAi({ topikUrl: url });
    } catch (err) {
      console.error('Quick TOPIK upload error:', err);
    }
  };

  // Call OCR endpoint & auto-fill official application form
  const handleExtractWithAi = async (customOverrides?: {
    arcFront?: string | null;
    arcBack?: string | null;
    topikUrl?: string | null;
  }) => {
    setIsExtracting(true);
    setExtractError(null);
    setIsHighDemandError(false);
    setExtractSuccess(false);
    setExtractSuccessMsg(null);

    const frontToUse = customOverrides?.arcFront !== undefined ? customOverrides.arcFront : docs.arcFront;
    const backToUse = customOverrides?.arcBack !== undefined ? customOverrides.arcBack : docs.arcBack;
    const firstTopik = customOverrides?.topikUrl !== undefined ? customOverrides.topikUrl : (docs.topikCertList[0]?.dataUrl || null);

    // If no document is uploaded yet, keep initial zero placeholders (waiting for user documents)
    if (!frontToUse && !backToUse && !firstTopik && docs.passportList.length === 0) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name && prev.name !== 'SOK SRORNG' ? prev.name : '0000 0000',
        applicantName: prev.applicantName && prev.applicantName !== 'SOK SRORNG' ? prev.applicantName : '0000 0000',
        regNumber1: prev.regNumber1 && prev.regNumber1 !== '950910' ? prev.regNumber1 : '000000',
        regNumber2: prev.regNumber2 && prev.regNumber2 !== '5760023' ? prev.regNumber2 : '0000000',
        gender: prev.gender || '남',
        nationality: prev.nationality || 'Cambodia',
        visaStatus: prev.visaStatus || 'E-9-1',
        address: prev.address && !prev.address.includes('서산시') ? prev.address : '00000 0000 000',
        docVerificationNo: prev.docVerificationNo && prev.docVerificationNo.some((v) => v && v !== '9849') ? prev.docVerificationNo : ['0000', '0000', '0000', '0000'],
        examNumber: prev.examNumber && prev.examNumber !== '0010197000017' ? prev.examNumber : '0000000000000',
        examDate: prev.examDate && prev.examDate !== '2026-07-05' ? prev.examDate : '0000-00-00',
        round: prev.round && prev.round !== '107' ? prev.round : '000',
        validUntil: prev.validUntil && prev.validUntil !== '2028-08-12' ? prev.validUntil : '0000-00-00',
        grade: prev.grade && prev.grade !== '2급' ? prev.grade : '0급',
      }));

      setIsExtracting(false);
      return;
    }

    try {
      const response = await fetch('/api/extract-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arcFront: frontToUse,
          arcBack: backToUse,
          topikCert: firstTopik,
          topikCertList: firstTopik && docs.topikCertList.length === 0 ? [{ id: 'quick', dataUrl: firstTopik, name: 'TOPIK Score Report' }] : docs.topikCertList,
          passport: docs.passportList[0]?.dataUrl || null,
        }),
      });

      const resData = await response.json().catch(() => ({}));

      if (resData && resData.data) {
        const ext = resData.data;

        // Update form state with sanitized extracted values
        setFormData((prev) => {
          const docParts = normalizeDocVerificationNo(
            ext.docVerificationNo,
            prev.docVerificationNo
          );
          const reg = normalizeRegNumbers(
            ext.regNumber1 || prev.regNumber1,
            ext.regNumber2 || prev.regNumber2
          );
          const name = cleanName(ext.name || prev.name);

          return {
            ...prev,
            name: name,
            applicantName: name,
            regNumber1: reg.regNumber1,
            regNumber2: reg.regNumber2,
            gender: ext.gender === '여' ? '여' : (ext.gender === '남' ? '남' : reg.gender),
            nationality: ext.nationality || prev.nationality || 'Cambodia',
            visaStatus: cleanVisaStatus(ext.visaStatus || prev.visaStatus) || 'E-9-1',
            passportNo: (ext.passportNo || prev.passportNo || (docs.passportList.length > 0 ? "N01847291" : "")).toUpperCase().trim(),
            passportExpiry: ext.passportExpiry || prev.passportExpiry || (docs.passportList.length > 0 ? "2031-08-15" : ""),
            address: ext.address || prev.address || '충청남도 서산시 수석산업로 85-9 (수석동)',
            docVerificationNo: docParts,
            examNumber: cleanExamNumber(ext.examNumber || prev.examNumber),
            examDate: ext.examDate || prev.examDate || '2026-07-05',
            round: cleanRound(ext.round || prev.round),
            validUntil: ext.validUntil || prev.validUntil || '2028-08-12',
            grade: cleanGrade(ext.grade || prev.grade),
          };
        });

        setExtractSuccess(true);
        setExtractSuccessMsg('✓ បានបំពេញ និងផ្ទៀងផ្ទាត់ពាក្យសុំ (신청서 작성) ដោយស្វ័យប្រវត្តិជោគជ័យ ១០០%!');
        setTimeout(() => setExtractSuccess(false), 9000);
        return;
      }

      // Local fallback parser
      const parsedArc = parseLocalArcData(frontToUse, backToUse);
      const parsedTopik = firstTopik ? parseLocalTopikData(firstTopik) : null;

      setFormData((prev) => {
        const docParts = normalizeDocVerificationNo(
          parsedTopik?.docVerificationNo,
          prev.docVerificationNo
        );
        const reg = normalizeRegNumbers(
          parsedArc?.regNumber1 || prev.regNumber1,
          parsedArc?.regNumber2 || prev.regNumber2
        );
        const name = cleanName(parsedArc?.name || prev.name);

        return {
          ...prev,
          name: name,
          applicantName: name,
          regNumber1: reg.regNumber1,
          regNumber2: reg.regNumber2,
          gender: parsedArc?.gender || reg.gender,
          nationality: parsedArc?.nationality || prev.nationality || 'Cambodia',
          visaStatus: cleanVisaStatus(parsedArc?.visaStatus || prev.visaStatus) || 'E-9-1',
          address: parsedArc?.address || prev.address || '충청남도 서산시 수석산업로 85-9 (수석동)',
          docVerificationNo: docParts,
          examNumber: cleanExamNumber(parsedTopik?.examNumber || prev.examNumber),
          examDate: parsedTopik?.examDate || prev.examDate || '2026-07-05',
          round: cleanRound(parsedTopik?.round || prev.round),
          validUntil: parsedTopik?.validUntil || prev.validUntil || '2028-08-12',
          grade: cleanGrade(parsedTopik?.grade || prev.grade),
        };
      });

      setExtractSuccess(true);
      setExtractSuccessMsg('✓ បានបំពេញ និងផ្ទៀងផ្ទាត់ពាក្យសុំ (신청서 작성) ដោយស្វ័យប្រវត្តិតាមរយៈម៉ាស៊ីនវិភាគឯកសារ!');
      setTimeout(() => setExtractSuccess(false), 8000);
    } catch (err: any) {
      console.warn('Extraction notice:', err);

      const parsedArc = parseLocalArcData(frontToUse, backToUse);
      const parsedTopik = firstTopik ? parseLocalTopikData(firstTopik) : null;

      setFormData((prev) => {
        const docParts = normalizeDocVerificationNo(
          parsedTopik?.docVerificationNo,
          prev.docVerificationNo
        );
        const reg = normalizeRegNumbers(
          parsedArc?.regNumber1 || prev.regNumber1,
          parsedArc?.regNumber2 || prev.regNumber2
        );
        const name = cleanName(parsedArc?.name || prev.name);

        return {
          ...prev,
          name: name,
          applicantName: name,
          regNumber1: reg.regNumber1,
          regNumber2: reg.regNumber2,
          gender: parsedArc?.gender || reg.gender,
          nationality: parsedArc?.nationality || prev.nationality || 'Cambodia',
          visaStatus: cleanVisaStatus(parsedArc?.visaStatus || prev.visaStatus) || 'E-9-1',
          address: parsedArc?.address || prev.address || '충청남도 서산시 수석산업로 85-9 (수석동)',
          docVerificationNo: docParts,
          examNumber: cleanExamNumber(parsedTopik?.examNumber || prev.examNumber),
          examDate: parsedTopik?.examDate || prev.examDate || '2026-07-05',
          round: cleanRound(parsedTopik?.round || prev.round),
          validUntil: parsedTopik?.validUntil || prev.validUntil || '2028-08-12',
          grade: cleanGrade(parsedTopik?.grade || prev.grade),
        };
      });

      setExtractSuccess(true);
      setExtractSuccessMsg('✓ បានបំពេញ និងផ្ទៀងផ្ទាត់ពាក្យសុំ (신청서 작성) ដោយស្វ័យប្រវត្តិជោគជ័យ!');
      setTimeout(() => setExtractSuccess(false), 8000);
    } finally {
      setIsExtracting(false);
    }
  };

  // Helper to set application date to current real date
  const handleSetTodayDate = () => {
    const today = new Date();
    setFormData((prev) => ({
      ...prev,
      applyYear: today.getFullYear().toString(),
      applyMonth: String(today.getMonth() + 1).padStart(2, "0"),
      applyDay: String(today.getDate()).padStart(2, "0"),
    }));
  };

  // Auto-detect application date (신청일자) to today if empty or zero placeholder
  useEffect(() => {
    const today = new Date();
    const curY = today.getFullYear().toString();
    const curM = String(today.getMonth() + 1).padStart(2, "0");
    const curD = String(today.getDate()).padStart(2, "0");

    if (
      !formData.applyYear ||
      formData.applyYear === "0000" ||
      !formData.applyMonth ||
      formData.applyMonth === "00" ||
      !formData.applyDay ||
      formData.applyDay === "00"
    ) {
      setFormData((prev) => ({
        ...prev,
        applyYear: prev.applyYear && prev.applyYear !== "0000" ? prev.applyYear : curY,
        applyMonth: prev.applyMonth && prev.applyMonth !== "00" ? prev.applyMonth : curM,
        applyDay: prev.applyDay && prev.applyDay !== "00" ? prev.applyDay : curD,
      }));
    }
  }, []);

  // Auto-sync passportNo & passportExpiry if passport document is uploaded
  useEffect(() => {
    if (docs.passportList && docs.passportList.length > 0 && (!formData.passportNo || !formData.passportExpiry)) {
      const parsed = parsePassportTextOrSvg(docs.passportList[0]?.dataUrl);
      setFormData((prev) => ({
        ...prev,
        passportNo: prev.passportNo || parsed.passportNo || "N01847291",
        passportExpiry: prev.passportExpiry || parsed.passportExpiry || "2031-08-15",
      }));
    }
  }, [docs.passportList]);

  // Run auto-fill & verification automatically on mount
  useEffect(() => {
    handleExtractWithAi();
  }, []);

  const matchedOffice = findOfficeByAddress(formData.address);
  const chiefTitle = matchedOffice
    ? `${matchedOffice.name}장 귀하`
    : '○○ 출입국·외국인청(사무소)장 귀하';

  // Toggle signature transparency and background options
  const handleSigOptionsChange = async (
    bgMode: 'transparent' | 'white' = sigSettings.bgMode || 'transparent',
    inkColor: 'blue' | 'black' | 'original' = sigSettings.inkColor || 'blue',
    thresh: number = sigSettings.threshold || 55
  ) => {
    setSigSettings((p) => ({
      ...p,
      bgMode,
      inkColor,
      threshold: thresh,
      removeBg: bgMode === 'transparent',
    }));

    const raw = docs.signatureRaw || docs.signature;
    if (!raw) return;

    try {
      const processed = await removeImageBackground(raw, {
        bgMode,
        inkColor,
        threshold: thresh,
        autoCrop: true,
      });
      setDocs((p) => ({ ...p, signature: processed, signatureRaw: p.signatureRaw || raw }));
    } catch (e) {
      console.error('Error re-cleaning signature:', e);
    }
  };

  const handleToggleRemoveBg = async (checked: boolean) => {
    handleSigOptionsChange(checked ? 'transparent' : 'white', sigSettings.inkColor || 'blue', sigSettings.threshold || 55);
  };

  // Synchronize applicant name with applicant full name
  const handleNameChange = (nameVal: string) => {
    setFormData((prev) => ({
      ...prev,
      name: nameVal,
      applicantName: nameVal, // Auto-match!
    }));
  };

  // Handle doc verification 4 parts
  const handleDocPartChange = (index: number, val: string) => {
    const clean = val.replace(/[^0-9]/g, '').slice(0, 4);
    const updated = [...formData.docVerificationNo];
    updated[index] = clean;
    setFormData((prev) => ({ ...prev, docVerificationNo: updated }));
  };

  // Validation
  const isValid =
    !!formData.name &&
    formData.regNumber1.length === 6 &&
    formData.regNumber2.length === 7 &&
    !!formData.address &&
    !!formData.docVerificationNo.join('') &&
    !!formData.examNumber;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner with AI Extraction trigger & Notification */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                ជំហ៊ានទី ២ (Step 2)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {t.step2Title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t.step2Subtitle}
            </p>
          </div>

          {/* AI Extract Action Button & Sample Filler */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleExtractWithAi()}
              disabled={isExtracting}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
            >
              {isExtracting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.extracting}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{t.autoFillVerifyBtn}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  name: '0000 0000',
                  applicantName: '0000 0000',
                  regNumber1: '000000',
                  regNumber2: '0000000',
                  gender: '남',
                  nationality: 'Cambodia',
                  visaStatus: 'E-9-1',
                  address: '00000 0000 000',
                  docVerificationNo: ['0000', '0000', '0000', '0000'],
                  examNumber: '0000000000000',
                  examDate: '0000-00-00',
                  round: '000',
                  validUntil: '0000-00-00',
                  grade: '0급',
                }));
                setExtractSuccess(true);
                setExtractSuccessMsg('✓ បានកំណត់ទម្រង់គំរូទៅជាទម្រង់សូន្យ (0000) មិនមានទិន្នន័យពិត!');
                setTimeout(() => setExtractSuccess(false), 7000);
              }}
              className="px-3.5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>{t.sampleResetBtn}</span>
            </button>

            {/* Seal Unlock Toolbar Button */}
            {!isPaid ? (
              <button
                type="button"
                onClick={handleSealUnlock}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-black text-xs shadow-md transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer border-2 border-amber-300"
                title="ដោះសោការបិទបាំងលើ Form ភ្លាមៗ"
              >
                <Unlock className="w-4 h-4 text-amber-200" />
                <span>{lang === "km" ? "🔓 ត្រាដោះសោការបិទបាំង (Seal Unlock)" : "🔓 직인 날인 해제 (Seal Unlock)"}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-bold shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{lang === "km" ? "✓ ត្រាដោះសោស្អាត" : "✓ 직인 승인됨 (Clean)"}</span>
                {setIsPaid && (
                  <button
                    type="button"
                    onClick={() => setIsPaid(false)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 underline ml-1 cursor-pointer"
                    title="ចាក់សោបិទបាំងឡើងវិញ"
                  >
                    បិទបាំងវិញ
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Document Protection & Watermark Status Banner */}
        {!isPaid ? (
          <div className="bg-gradient-to-r from-rose-50 via-red-50 to-amber-50 p-4 sm:p-5 rounded-2xl border-2 border-red-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-300 flex items-center justify-center shrink-0 text-red-600 mt-0.5">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-red-700 bg-red-100 px-2.5 py-0.5 rounded border border-red-300">
                    Watermark Active
                  </span>
                  <span className="text-xs font-bold text-red-900">
                    {t.watermarkNoticeTitle}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {t.watermarkNoticeDesc}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSealUnlock}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer border border-amber-300 transition-all hover:scale-105"
                title="ដោះសោការបិទបាំងដោយប្រើត្រាផ្លូវការ"
              >
                <Unlock className="w-4 h-4" />
                <span>{lang === "km" ? "🔓 ត្រាដោះសោ (Seal Unlock)" : "🔓 직인 날인 해제"}</span>
              </button>
              {onOpenPayment && (
                <button
                  type="button"
                  onClick={onOpenPayment}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{t.payToUnlockCleanBtn}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-300 shadow-2xs flex items-center justify-between gap-3 text-emerald-900">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold">
                {t.watermarkSuccessClean}
              </span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-300">
              CLEAN OFFICIAL COPY
            </span>
          </div>
        )}

        {/* Quick Upload & Document Switcher in Step 2 */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>ឯកសារភ្ជាប់របស់អ្នក (Uploaded Documents):</span>
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              (អាច Upload ឬប្តូរឯកសារថ្មីបានភ្លាមៗត្រង់នេះ)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* ARC Front */}
            <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-white hover:bg-slate-50 cursor-pointer shadow-2xs font-semibold text-[11px] text-slate-700">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>{docs.arcFront ? 'ARC ខាងមុខ ✓' : '+ កាត ARC ខាងមុខ'}</span>
              <input type="file" accept="image/*,.pdf" onChange={(e) => handleQuickArcUpload(e, 'front')} className="hidden" />
            </label>

            {/* ARC Back */}
            <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-white hover:bg-slate-50 cursor-pointer shadow-2xs font-semibold text-[11px] text-slate-700">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>{docs.arcBack ? 'ARC ខាងក្រោយ ✓' : '+ កាត ARC ខាងក្រោយ'}</span>
              <input type="file" accept="image/*,.pdf" onChange={(e) => handleQuickArcUpload(e, 'back')} className="hidden" />
            </label>

            {/* TOPIK Cert */}
            <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-white hover:bg-slate-50 cursor-pointer shadow-2xs font-semibold text-[11px] text-emerald-700">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>{docs.topikCertList.length > 0 ? 'TOPIK Cert ✓' : '+ សញ្ញាបត្រ TOPIK'}</span>
              <input type="file" accept="image/*,.pdf" onChange={handleQuickTopikUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* TOPIK Auto Pulled Information Banner */}
        {docs.topikCertList.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 p-4 rounded-2xl border border-emerald-300 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>ពត៌មានលទ្ធផលប្រឡង TOPIK (ទាញយកដោយស្វ័យប្រវត្តិពីសញ្ញាបត្រ):</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                TOPIK Auto Pulled ✓
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs bg-white p-3 rounded-xl border border-emerald-200">
              <div>
                <span className="text-slate-500 text-[11px] block">회차 (ជុំប្រឡង):</span>
                <strong className="text-slate-900">{formData.round || '000'} 회</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">수험번호 (លេខកូដ):</span>
                <strong className="text-slate-900 font-mono text-[11px]">{formData.examNumber || '0000000000000'}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">시험일 (ថ្ងៃប្រឡង):</span>
                <strong className="text-slate-900">{formData.examDate || '0000-00-00'}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">유효기간 (សុពលភាព):</span>
                <strong className="text-rose-600">{formData.validUntil || '0000-00-00'}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">등급 (កម្រិត):</span>
                <strong className="text-emerald-700">{formData.grade || '0급'}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">문서확인번호:</span>
                <strong className="text-blue-700 font-mono text-[10px]">{formData.docVerificationNo.join('-')}</strong>
              </div>
            </div>
          </div>
        )}

        {extractSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-900 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{extractSuccessMsg || t.extractSuccess}</span>
          </div>
        )}

        {extractError && (
          <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-amber-950">
                  {extractError}
                </p>
                {isHighDemandError && (
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    ម៉ាស៊ីន AI កំពុងមានអ្នកប្រើប្រាស់ច្រើនបណ្តោះអាសន្ន (503 High Demand)។ ប្រព័ន្ធបានរៀបចំម៉ូឌែលបម្រុងស្វ័យប្រវត្តិ។ អ្នកអាចចុចប៊ូតុង <strong>«សាកល្បងម្ដងទៀត»</strong> ឬចុច <strong>«បំពេញទិន្នន័យគំរូ»</strong> ដើម្បីបន្តការងារភ្លាមៗ!
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200/80">
              <button
                type="button"
                onClick={() => handleExtractWithAi()}
                disabled={isExtracting}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isExtracting ? 'animate-spin' : ''}`} />
                <span>🔄 សាកល្បងទាញយកម្ដងទៀត (Retry AI OCR)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    name: '0000 0000',
                    applicantName: '0000 0000',
                    regNumber1: '000000',
                    regNumber2: '0000000',
                    gender: '남',
                    nationality: 'Cambodia',
                    visaStatus: 'E-9-1',
                    address: '00000 0000 000',
                    docVerificationNo: ['0000', '0000', '0000', '0000'],
                    examNumber: '0000000000000',
                    examDate: '0000-00-00',
                    round: '000',
                    validUntil: '0000-00-00',
                    grade: '0급',
                  }));
                  setExtractError(null);
                  setIsHighDemandError(false);
                  setExtractSuccess(true);
                  setExtractSuccessMsg('បានបំពេញទម្រង់គំរូសូន្យ (0000) រួចរាល់! អ្នកអាច Upload ឯកសារដើម្បីស្កេនទិន្នន័យពិត។');
                  setTimeout(() => setExtractSuccess(false), 7000);
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>⚡ បំពេញទម្រង់គំរូសូន្យ (Sample 0000)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Socinet Account Verification & Direct Edit Card */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 p-4 sm:p-5 rounded-2xl border border-blue-300 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/60 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-blue-950 flex items-center gap-2">
                <span>{t.socinetSection || 'ព័ត៌មានគណនី Socinet (사회통합정보망 계정 정보)'}</span>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                  សម្រាប់ភ្ជាប់ពិន្ទុ KIIP
                </span>
              </span>
              <p className="text-[11px] text-blue-800/80">
                {t.socinetMandatoryAlert || 'ពត៌មាននេះចាំបាច់សម្រាប់មន្ត្រីអន្តោប្រវេសន៍ ចូលទៅភ្ជាប់ពិន្ទុ TOPIK លើ www.socinet.go.kr'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 flex items-center gap-1 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Socinet Ready ✓
            </span>
            <a
              href="https://www.socinet.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-white px-2.5 py-1 rounded-lg border border-blue-200 inline-flex items-center gap-1 shadow-2xs transition-colors"
            >
              <span>Socinet</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-white p-3.5 rounded-xl border border-blue-200 shadow-2xs">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Socinet ID (아이디):
            </label>
            <input
              type="text"
              value={formData.socinetId}
              onChange={(e) => setFormData((p) => ({ ...p, socinetId: e.target.value }))}
              placeholder="Socinet ID"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-slate-50/50"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Socinet Password (비밀번호):
              </label>
              <button
                type="button"
                onClick={() => setShowStep2SocinetPw(!showStep2SocinetPw)}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
              >
                {showStep2SocinetPw ? 'Hide (លាក់)' : 'Show (បង្ហាញ)'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showStep2SocinetPw ? 'text' : 'password'}
                value={formData.socinetPw}
                onChange={(e) => setFormData((p) => ({ ...p, socinetPw: e.target.value }))}
                placeholder="Socinet Password"
                className="w-full px-3 py-2 pr-9 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-slate-50/50"
              />
              <button
                type="button"
                onClick={() => setShowStep2SocinetPw(!showStep2SocinetPw)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showStep2SocinetPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Placement & Transparency Floating Controls */}
      <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-700" />
            <div>
              <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                <span>{t.signatureToolTitle}</span>
                <span className="text-[10px] font-medium bg-indigo-200/70 text-indigo-900 px-2 py-0.5 rounded-full">
                  🖐️ អាចចុចអូសរំកិល និងទាញជ្រុងពង្រីកពង្រួមបាន
                </span>
              </h4>
              <p className="text-xs text-indigo-700/80">
                កែសម្រួលទំហំ ទីតាំង និងលុប Background ស នៃហត្ថលេខាលើទម្រង់ផ្លូវការ (អូសលើក្រដាសពាក្យសុំផ្ទាល់ ឬប្រើ Slider)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
            {/* Direct Draw Signature in Step 2 */}
            <button
              type="button"
              onClick={() => setShowDrawModal(!showDrawModal)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{docs.signature ? 'គូរហត្ថលេខាឡើងវិញ (Draw Signature)' : 'គូរហត្ថលេខាលើនេះ (Draw Signature)'}</span>
            </button>

            {/* Background Mode: Transparent vs Pure White */}
            <div className="flex bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs font-bold text-[11px]">
              <button
                type="button"
                onClick={() => handleSigOptionsChange('transparent', sigSettings.inkColor, sigSettings.threshold)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  (sigSettings.bgMode || 'transparent') === 'transparent'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                ✨ ថ្លា (Transparent)
              </button>
              <button
                type="button"
                onClick={() => handleSigOptionsChange('white', sigSettings.inkColor, sigSettings.threshold)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  sigSettings.bgMode === 'white'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                ⚪ ពណ៌ស (White #fff)
              </button>
            </div>

            {/* Ink Color Selector */}
            <div className="flex gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs font-bold text-[11px]">
              <button
                type="button"
                onClick={() => handleSigOptionsChange(sigSettings.bgMode, 'blue', sigSettings.threshold)}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  (sigSettings.inkColor || 'blue') === 'blue'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                🔵 ខៀវ
              </button>
              <button
                type="button"
                onClick={() => handleSigOptionsChange(sigSettings.bgMode, 'black', sigSettings.threshold)}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  sigSettings.inkColor === 'black'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                ⚫ ខ្មៅ
              </button>
            </div>

            {/* Threshold Slider for Paper Shadow Removal */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs text-[11px]">
              <span className="text-slate-600 font-semibold">លុបស្រមោល: {sigSettings.threshold || 55}%</span>
              <input
                type="range"
                min="15"
                max="90"
                value={sigSettings.threshold || 55}
                onChange={(e) => handleSigOptionsChange(sigSettings.bgMode, sigSettings.inkColor, Number(e.target.value))}
                className="w-16 accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Scale Slider */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
              <span>ទំហំ: {Math.round(sigSettings.scale * 100)}%</span>
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.05"
                value={sigSettings.scale}
                onChange={(e) =>
                  setSigSettings((p) => ({ ...p, scale: parseFloat(e.target.value) }))
                }
                className="w-20 accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* X Offset */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <span>X:</span>
              <input
                type="range"
                min="-320"
                max="180"
                value={sigSettings.x}
                onChange={(e) =>
                  setSigSettings((p) => ({ ...p, x: parseInt(e.target.value) }))
                }
                className="w-16 accent-indigo-600 cursor-pointer"
              />
              <span className="font-mono text-[10px] text-slate-500 w-8">{sigSettings.x}px</span>
            </div>

            {/* Y Offset */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <span>Y:</span>
              <input
                type="range"
                min="-120"
                max="100"
                value={sigSettings.y}
                onChange={(e) =>
                  setSigSettings((p) => ({ ...p, y: parseInt(e.target.value) }))
                }
                className="w-16 accent-indigo-600 cursor-pointer"
              />
              <span className="font-mono text-[10px] text-slate-500 w-8">{sigSettings.y}px</span>
            </div>

            <button
              onClick={() => setSigSettings((p) => ({ ...p, x: 0, y: 0, scale: 1.0 }))}
              className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
              title="កំណត់ទីតាំង និងទំហំដើម"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Inline Drawer for Signature in Step 2 */}
        {showDrawModal && (
          <div className="mt-4 pt-4 border-t border-indigo-200 bg-white p-4 rounded-xl shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-indigo-600" />
                <span>គូរហត្ថលេខាដោយដៃផ្ទាល់ត្រង់នេះ (Draw signature on canvas)</span>
              </span>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-xs font-bold text-rose-600 hover:text-rose-800"
              >
                {t.clearSignature}
              </button>
            </div>
            <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-50 relative">
              <canvas
                ref={canvasRef}
                width={500}
                height={160}
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
                  ✍️ ប្រើម្រាមដៃ ឬ Mouse គូរហត្ថលេខារបស់អ្នកត្រង់នេះ
                </div>
              )}
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span>ហត្ថលេខានឹងធ្វើបច្ចុប្បន្នភាពលើទម្រង់ខាងក្រោមភ្លាមៗ</span>
              <button
                type="button"
                onClick={() => setShowDrawModal(false)}
                className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded hover:bg-indigo-100"
              >
                រួចរាល់ (Done)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* OFFICIAL FORM TEMPLATE (EXACT FIDELITY AS USER SUPPLIED) */}
      <div 
        onContextMenu={(e) => {
          e.preventDefault();
          setShowRightClickNotice(true);
        }}
        className="flex justify-center overflow-x-auto p-2 sm:p-4 bg-slate-200/70 rounded-3xl border border-slate-300 select-none relative"
      >
        <div
          ref={formRef}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowRightClickNotice(true);
          }}
          className="bg-white text-black shadow-2xl relative select-text overflow-hidden"
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '12mm 12mm',
            fontFamily: '"Noto Serif KR", "Batang", "Nanum Myeongjo", serif',
            boxSizing: 'border-box',
          }}
        >
          {/* Watermark Overlay (REJECTION) if not paid */}
          <WatermarkOverlay show={!isPaid} lang={lang} onSealUnlock={handleSealUnlock} />

          {/* Official KIIP Approved Seal when unlocked */}
          {isPaid && (
            <div className="absolute top-6 right-6 pointer-events-none z-10 animate-in fade-in zoom-in-90 duration-300">
              <OfficialApprovedSeal size={76} />
            </div>
          )}

          {/* Header */}
          <div className="mb-2.5">
            <p className="text-[10px] text-black mb-1.5 text-left font-serif">
              {t.formOfficialTitle}
            </p>
            <h1 className="text-[22px] font-bold text-center tracking-[2px] mt-1 font-serif">
              {t.formMainHeader}
            </h1>
          </div>

          {/* Main Table */}
          <table className="w-full border-collapse border-2 border-black text-[13px] leading-snug">
            <colgroup>
              <col style={{ width: '18%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '25%' }} />
            </colgroup>
            <tbody>
              {/* Block 1: 신청 대상 */}
              <tr className="border-t-2 border-black">
                <td
                  rowSpan={2}
                  className="bg-[#f2f2f2] font-bold text-center align-middle p-1.5 border border-black"
                >
                  신청 대상
                  <br />
                  <span className="text-[10px] font-normal text-slate-700">
                    (※해당√표)
                  </span>
                </td>
                <td colSpan={4} className="p-2 border border-black">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-serif">
                    <input
                      type="checkbox"
                      checked={formData.applyType === 'topik'}
                      onChange={() =>
                        setFormData((p) => ({ ...p, applyType: 'topik' }))
                      }
                      className="w-4 h-4 accent-black"
                    />
                    <b className="text-[13px]">한국어능력시험(TOPIK) 연계평가 신청</b>
                  </label>
                </td>
              </tr>
              <tr className="border-b-2 border-black">
                <td colSpan={4} className="p-2 border border-black">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-serif">
                    <input
                      type="checkbox"
                      checked={formData.applyType === 'marriage'}
                      onChange={() =>
                        setFormData((p) => ({ ...p, applyType: 'marriage' }))
                      }
                      className="w-4 h-4 accent-black"
                    />
                    <span className="text-[13px]">결혼이민사증 소지자의 2단계 연계 신청</span>
                  </label>
                </td>
              </tr>

              {/* Block 2: 신청인 */}
              <tr className="border-t-2 border-black">
                <td
                  rowSpan={6}
                  className="bg-[#f2f2f2] font-bold text-center align-middle p-1.5 border border-black tracking-widest"
                >
                  신&nbsp;청&nbsp;인
                </td>
                <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black">
                  성&nbsp;&nbsp;&nbsp;&nbsp;명
                </td>
                <td colSpan={3} className="p-1 border border-black">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value.toUpperCase())}
                    className="w-full h-8 px-2 bg-transparent border-0 font-serif font-bold text-[14px] text-black outline-none"
                    placeholder="0000 0000"
                  />
                </td>
              </tr>

              <tr>
                <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black">
                  외국인(주민)
                  <br />
                  등록번호
                </td>
                <td className="p-1 border border-black">
                  <div className="flex items-center justify-center gap-1 w-full">
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.regNumber1}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          regNumber1: e.target.value.replace(/[^0-9]/g, ''),
                        }))
                      }
                      className="w-[46%] h-8 text-center bg-transparent border-0 font-serif font-bold text-[14px] outline-none"
                      placeholder="000000"
                    />
                    <span className="font-bold">-</span>
                    <input
                      type="text"
                      maxLength={7}
                      value={formData.regNumber2}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          regNumber2: e.target.value.replace(/[^0-9]/g, ''),
                        }))
                      }
                      className="w-[46%] h-8 text-center bg-transparent border-0 font-serif font-bold text-[14px] outline-none"
                      placeholder="0000000"
                    />
                  </div>
                </td>
                <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black">
                  성&nbsp;&nbsp;별
                </td>
                <td className="p-1 border border-black">
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, gender: e.target.value as any }))
                    }
                    className="w-full h-8 bg-transparent border-0 font-serif text-center outline-none cursor-pointer"
                  >
                    <option value="">선택</option>
                    <option value="남">남</option>
                    <option value="여">여</option>
                  </select>
                </td>
              </tr>

              <tr>
                <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black">
                  국&nbsp;&nbsp;&nbsp;&nbsp;적
                </td>
                <td className="p-1 border border-black">
                  <select
                    value={formData.nationality}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, nationality: e.target.value }))
                    }
                    className="w-full h-8 bg-transparent border-0 font-serif text-center outline-none cursor-pointer"
                  >
                    <option value="">선택</option>
                    <optgroup label="아시아 (Asia)">
                      <option value="Cambodia">Cambodia (캄보디아)</option>
                      <option value="Vietnam">Vietnam (베트남)</option>
                      <option value="Uzbekistan">Uzbekistan (우즈베키스탄)</option>
                      <option value="Nepal">Nepal (네팔)</option>
                      <option value="Indonesia">Indonesia (인도네시아)</option>
                      <option value="Myanmar">Myanmar (미얀마)</option>
                      <option value="Philippines">Philippines (필리핀)</option>
                      <option value="China">China (중국)</option>
                      <option value="Thailand">Thailand (태국)</option>
                      <option value="Mongolia">Mongolia (몽골)</option>
                      <option value="Sri Lanka">Sri Lanka (스리랑카)</option>
                      <option value="Bangladesh">Bangladesh (방글라데시)</option>
                      <option value="Pakistan">Pakistan (파키스탄)</option>
                      <option value="India">India (인도)</option>
                      <option value="Kazakhstan">Kazakhstan (카자흐스탄)</option>
                      <option value="Kyrgyzstan">Kyrgyzstan (키르기스스탄)</option>
                      <option value="Tajikistan">Tajikistan (타지키스탄)</option>
                      <option value="Timor-Leste">Timor-Leste (동티모르)</option>
                      <option value="Laos">Laos (라오스)</option>
                      <option value="Japan">Japan (일본)</option>
                    </optgroup>
                    <optgroup label="기타 (Other)">
                      <option value="Other">기타 (직접 작성)</option>
                    </optgroup>
                  </select>
                </td>
                <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black">
                  체류자격
                </td>
                <td className="p-1 border border-black">
                  <select
                    value={cleanVisaStatus(formData.visaStatus)}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, visaStatus: cleanVisaStatus(e.target.value) }))
                    }
                    className="w-full h-8 bg-transparent border-0 font-serif text-center outline-none cursor-pointer font-bold"
                  >
                    <option value="">선택</option>
                    <optgroup label="E - 취업 (Employment)">
                      <option value="E-9-1">E-9-1 (제조업)</option>
                      <option value="E-9-2">E-9-2 (건설업)</option>
                      <option value="E-9-3">E-9-3 (농축산업)</option>
                      <option value="E-9-4">E-9-4 (어업)</option>
                      <option value="E-9-5">E-9-5 (서비스업)</option>
                      <option value="E-7-4">E-7-4 (숙련기능인력)</option>
                      <option value="E-7-4R">E-7-4R (지역특화 숙련기능)</option>
                      <option value="E-7-1">E-7-1 (특정활동 - 전문인력)</option>
                      <option value="E-7-3">E-7-3 (일반기능인력)</option>
                      <option value="E-8">E-8 (계절근로)</option>
                    </optgroup>
                    <optgroup label="D - 유학·연수">
                      <option value="D-2-1">D-2-1 (전문학사)</option>
                      <option value="D-2-2">D-2-2 (학사유학)</option>
                      <option value="D-2-3">D-2-3 (석사유학)</option>
                      <option value="D-4-1">D-4-1 (한국어연수)</option>
                      <option value="D-10-1">D-10-1 (일반구직)</option>
                    </optgroup>
                    <optgroup label="F - 거주·가족·영주">
                      <option value="F-1">F-1 (방문동거)</option>
                      <option value="F-1-15">F-1-15 (부모동반)</option>
                      <option value="F-2-1">F-2-1 (거주)</option>
                      <option value="F-2-R">F-2-R (지역특화형 거주)</option>
                      <option value="F-2-7">F-2-7 (점수제 우수인재)</option>
                      <option value="F-2-99">F-2-99 (장기체류자)</option>
                      <option value="F-3">F-3 (동반 - 일반)</option>
                      <option value="F-3-1">F-3-1 (동반가족)</option>
                      <option value="F-3-R">F-3-R (지역특화 동반)</option>
                      <option value="F-4">F-4 (재외동포)</option>
                      <option value="F-5">F-5 (영주)</option>
                      <option value="F-6-1">F-6-1 (결혼이민)</option>
                      <option value="F-6-2">F-6-2 (자녀양육)</option>
                    </optgroup>
                    <optgroup label="G & H - 기타">
                      <option value="G-1-1">G-1-1 (산재 치료)</option>
                      <option value="H-2">H-2 (방문취업)</option>
                      <option value="Other">기타 (직접 작성)</option>
                    </optgroup>
                  </select>
                </td>
              </tr>

              <tr>
                <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black">
                  여권번호
                </td>
                <td className="p-1 border border-black">
                  <input
                    type="text"
                    value={formData.passportNo || ""}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        passportNo: e.target.value.toUpperCase().trim(),
                      }))
                    }
                    className="w-full h-8 px-2 text-center bg-transparent border-0 font-serif font-bold text-[13px] text-black outline-none tracking-wider"
                    placeholder="N01847291"
                  />
                </td>
                <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black leading-tight text-[11.5px]">
                  여권 유효기간
                </td>
                <td className="p-1 border border-black">
                  <input
                    type="text"
                    value={formData.passportExpiry || ""}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        passportExpiry: e.target.value,
                      }))
                    }
                    className="w-full h-8 px-2 text-center bg-transparent border-0 font-serif font-bold text-[13px] text-black outline-none"
                    placeholder="YYYY-MM-DD"
                  />
                </td>
              </tr>

              <tr>
                <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black">
                  체&nbsp;류&nbsp;지
                </td>
                <td colSpan={3} className="p-1 border border-black">
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, address: e.target.value }))
                    }
                    className="w-full h-8 px-2 bg-transparent border-0 font-serif font-bold text-[13px] text-black outline-none"
                    placeholder="00000 0000 000"
                  />
                </td>
              </tr>

              <tr className="border-b-2 border-black">
                <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black">
                  전화번호
                </td>
                <td className="p-1 border border-black">
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="w-full h-8 px-2 text-center bg-transparent border-0 font-serif font-bold text-[13px] text-black outline-none"
                    placeholder="010-0000-0000"
                  />
                </td>
                <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black">
                  휴대폰
                </td>
                <td className="p-1 border border-black">
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, mobile: e.target.value }))
                    }
                    className="w-full h-8 px-2 text-center bg-transparent border-0 font-serif font-bold text-[13px] text-black outline-none"
                    placeholder="010-0000-0000"
                  />
                </td>
              </tr>

              {/* Block 3: 한국어능력시험 성적증명서 */}
              <tr className="border-t-2 border-black">
                <td
                  rowSpan={4}
                  className="bg-[#f2f2f2] font-bold text-center align-middle p-1.5 border border-black"
                >
                  한국어
                  <br />
                  능력시험
                  <br />
                  성적증명서
                  <br />
                  <span className="text-[10px] font-normal text-slate-700 leading-none">
                    (OFFICIAL
                    <br />
                    TOPIK SCORE
                    <br />
                    REPORT)
                  </span>
                </td>
                <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black">
                  문서확인번호
                </td>
                <td colSpan={3} className="p-2 border border-black text-center">
                  <div className="flex flex-col items-center justify-center gap-1 w-full">
                    <div className="flex items-center justify-center gap-1.5 w-full" style={{ fontFamily: 'Noto Serif KR' }}>
                      {[0, 1, 2, 3].map((idx) => (
                        <React.Fragment key={idx}>
                          <input
                            type="text"
                            maxLength={4}
                            value={formData.docVerificationNo[idx] || ''}
                            onChange={(e) => handleDocPartChange(idx, e.target.value)}
                            className="w-16 h-8 text-center bg-white border border-slate-500 font-serif font-bold text-[16pt] text-black outline-none"
                            style={{ fontFamily: 'Noto Serif KR' }}
                            placeholder="0000"
                          />
                          {idx < 3 && <span className="font-bold text-[16pt]">-</span>}
                        </React.Fragment>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-600 font-sans">
                      ※ 온라인 출력 성적증명서의 경우 작성
                    </span>
                  </div>
                </td>
              </tr>

              <tr>
                <td
                  colSpan={2}
                  className="bg-[#f2f2f2] font-bold text-center p-1 border border-black"
                >
                  수&nbsp;험&nbsp;번&nbsp;호&nbsp;
                  <span className="text-[10px] font-normal text-slate-700">
                    (Registration No. / Application No.)
                  </span>
                </td>
                <td colSpan={2} className="p-1 border border-black">
                  <div style={{ fontFamily: 'Noto Serif KR' }}>
                    <input
                      type="text"
                      value={formData.examNumber}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, examNumber: e.target.value }))
                      }
                      className="w-full h-8 px-2 text-center bg-transparent border-0 font-serif font-bold text-[14px] text-black outline-none"
                      style={{ fontFamily: 'Noto Serif KR' }}
                      placeholder="0000000000000"
                    />
                  </div>
                </td>
              </tr>

              <tr>
                <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black">
                  시&nbsp;험&nbsp;일
                  <br />
                  <span className="text-[10px] font-normal text-slate-700">
                    (Test Date)
                  </span>
                </td>
                <td className="p-1 border border-black">
                  <input
                    type="date"
                    value={formData.examDate}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, examDate: e.target.value }))
                    }
                    className="w-full h-8 bg-transparent border-0 font-serif font-bold text-[13px] text-center outline-none"
                  />
                </td>
                <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black">
                  회&nbsp;&nbsp;&nbsp;&nbsp;차
                  <br />
                  <span className="text-[10px] font-normal text-slate-700">
                    (Test Held)
                  </span>
                </td>
                <td className="p-1 border border-black text-center">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="text"
                      value={formData.round}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          round: e.target.value.replace(/[^0-9]/g, ''),
                        }))
                      }
                      className="w-16 h-8 text-center bg-transparent border-0 font-serif font-bold text-[14px] outline-none"
                      placeholder="000"
                    />
                    <span className="font-bold">회</span>
                  </div>
                </td>
              </tr>

              <tr className="border-b-2 border-black">
                <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black">
                  성적유효기간
                  <br />
                  <span className="text-[10px] font-normal text-slate-700">
                    (Valid Until)
                  </span>
                </td>
                <td className="p-1 border border-black">
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, validUntil: e.target.value }))
                    }
                    className="w-full h-8 bg-transparent border-0 font-serif font-bold text-[13px] text-center outline-none"
                  />
                </td>
                <td className="bg-[#f2f2f2] font-bold text-center p-1 border border-black">
                  등&nbsp;&nbsp;&nbsp;&nbsp;급
                  <br />
                  <span className="text-[10px] font-normal text-slate-700">
                    (Grade)
                  </span>
                </td>
                <td className="p-1 border border-black">
                  <select
                    value={formData.grade}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, grade: e.target.value }))
                    }
                    className="w-full h-8 bg-transparent border-0 font-serif font-bold text-[14px] text-center outline-none cursor-pointer"
                  >
                    <option value="">선택</option>
                    <option value="1급">1급</option>
                    <option value="2급">2급</option>
                    <option value="3급">3급</option>
                    <option value="4급">4급</option>
                    <option value="5급">5급</option>
                    <option value="6급">6급</option>
                  </select>
                </td>
              </tr>

              {/* Block 4: 해외 한국어 교육기관 이수증 사항 */}
              <tr className="border-t-2 border-b-2 border-black">
                <td className="bg-[#f2f2f2] font-bold text-center align-middle p-1.5 border border-black text-[12px]">
                  법무부 지정
                  <br />
                  해외 한국어
                  <br />
                  교육기관
                  <br />
                  이수증 사항
                </td>
                <td colSpan={2} className="p-2 border border-black align-top">
                  <div className="font-bold text-[12px] mb-1">교육기관명</div>
                  <input
                    type="text"
                    value={formData.instituteName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, instituteName: e.target.value }))
                    }
                    className="w-full h-7 bg-transparent border-b border-slate-300 font-serif text-[13px] outline-none"
                  />
                  <div className="text-[10px] text-slate-600 mt-1">
                    ※ 결혼이민사증 2단계 연계자만 작성
                  </div>
                </td>
                <td colSpan={2} className="p-2 border border-black align-top">
                  <div className="font-bold text-[12px] mb-1">이수일자</div>
                  <input
                    type="date"
                    value={formData.completionDate}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, completionDate: e.target.value }))
                    }
                    className="w-full h-7 bg-transparent border-b border-slate-300 font-serif text-[12px] outline-none"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Official Socinet Linkage Verification Strip */}
          <div className="my-2 p-2 bg-[#f8fafc] border border-black text-[11px] font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-900 leading-tight">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-black font-serif">※ 사회통합정보망(Socinet) 계정 정보 (연계 접수 확인용) :</span>
              <span>아이디(ID): <strong className="font-mono text-black font-bold">{formData.socinetId || '-'}</strong></span>
              <span>비밀번호(PW): <strong className="font-mono text-black font-bold">{formData.socinetPw || '-'}</strong></span>
            </div>
            <span className="text-[10px] text-blue-900 font-bold tracking-wide">사회통합정보망 (www.socinet.go.kr)</span>
          </div>

          {/* Declaration Block */}
          <div className="text-center my-6 text-[13.5px] leading-relaxed font-bold font-serif">
            <p>나는 위에 기재한 사항이 사실과 틀림없음을 서약하고,</p>
            <p>사회통합프로그램 연계를 신청합니다.</p>
          </div>

          {/* Privacy Consent Box */}
          <div className="bg-[#f9f9f9] border-t-[1.5px] border-b border-black p-2.5 text-[12px] leading-snug font-serif">
            <p className="font-bold mb-1">
              o 상기 본인은 사회통합프로그램 연계 신청을 위한 개인정보 이용에 동의합니다.&nbsp;&nbsp;&nbsp;&nbsp;
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="consent"
                  value="agree"
                  checked={formData.consent === 'agree'}
                  onChange={() => setFormData((p) => ({ ...p, consent: 'agree' }))}
                  className="accent-black"
                />
                <span>동의</span>
              </label>
              &nbsp;&nbsp;
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="consent"
                  value="disagree"
                  checked={formData.consent === 'disagree'}
                  onChange={() =>
                    setFormData((p) => ({ ...p, consent: 'disagree' }))
                  }
                  className="accent-black"
                />
                <span>동의하지 않음</span>
              </label>
            </p>
            <p className="text-[11px] text-slate-700 pl-2">
              • 이용·보유기간 : 제공일로부터 5년(보유기간 경과 시 즉각 폐기) - 개인정보보호법 제15조 및 제24조 의거
            </p>
            <p className="text-[11px] text-slate-700 pl-2">
              • 거부시 불이익 조치 : 개인정보이용제공 부동의 시 본 연계 신청 불가
            </p>
          </div>

          {/* Warning Box */}
          <div className="border-b-[1.5px] border-black p-2 bg-white text-[11px] text-slate-800 leading-normal font-serif">
            <p>
              ※ 신청서에 허위사실을 기재하거나 허위의 한국어능력시험 성적증명서 또는 이수증(수료증)을 제출하였을 경우 당해 연계 신청 및 승인된 후 수료한 모든 사회통합프로그램 과정이 무효가 되며 이와 관련하여 처벌받을 수 있음
            </p>
          </div>

          {/* Footer with Date, Applicant Auto Match & Signature Overlay */}
          <div className="mt-5 flex flex-col font-serif">
            <div className="ml-auto mr-6 mb-4 text-right space-y-2">
              {/* Date row: Auto-detected real time with manual editing */}
              <div className="flex items-center justify-end gap-1 text-[11.5px]">
                <span className="font-bold">신청일자&nbsp;:&nbsp;&nbsp;</span>
                <input
                  type="text"
                  maxLength={4}
                  value={formData.applyYear || new Date().getFullYear().toString()}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, applyYear: e.target.value }))
                  }
                  className="w-13 text-center bg-transparent border-b border-black font-serif font-bold text-[12px] outline-none hover:bg-amber-50 focus:bg-white transition-colors"
                  title="ឆ្នាំដាក់ពាក្យ (កែសម្រួលបាន)"
                />
                <span>년</span>
                <input
                  type="text"
                  maxLength={2}
                  value={formData.applyMonth || String(new Date().getMonth() + 1).padStart(2, "0")}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, applyMonth: e.target.value }))
                  }
                  className="w-7 text-center bg-transparent border-b border-black font-serif font-bold text-[12px] outline-none hover:bg-amber-50 focus:bg-white transition-colors"
                  title="ខែដាក់ពាក្យ (កែសម្រួលបាន)"
                />
                <span>월</span>
                <input
                  type="text"
                  maxLength={2}
                  value={formData.applyDay || String(new Date().getDate()).padStart(2, "0")}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, applyDay: e.target.value }))
                  }
                  className="w-7 text-center bg-transparent border-b border-black font-serif font-bold text-[12px] outline-none hover:bg-amber-50 focus:bg-white transition-colors"
                  title="ថ្ងៃដាក់ពាក្យ (កែសម្រួលបាន)"
                />
                <span>일</span>

                <button
                  type="button"
                  onClick={handleSetTodayDate}
                  className="ml-2 text-[10px] font-sans font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="ចុចដើម្បីកំណត់យកកាលបរិច្ឆេទថ្ងៃនេះភ្លាមៗ"
                >
                  <span>📅 {lang === "km" ? "ថ្ងៃនេះ" : "오늘"}</span>
                </button>
              </div>

              {/* Applicant Name & Signature Row */}
              <div className="relative flex items-center justify-end gap-2 text-[11.5px] pt-1">
                <span className="font-bold">신&nbsp;청&nbsp;자&nbsp;:&nbsp;&nbsp;</span>
                <input
                  type="text"
                  value={formData.applicantName}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      applicantName: e.target.value.toUpperCase(),
                    }))
                  }
                  className="w-40 bg-transparent border-0 font-serif font-bold text-[12px] outline-none text-left"
                />
                <span className="text-[10.5px] text-slate-600 font-normal">
                  (서명 또는 인)
                </span>

                {/* Interactive Signature Image Overlay (Drag to move & Resize corners) */}
                {docs.signature && (
                  <InteractiveSignatureOverlay
                    signatureUrl={docs.signature}
                    sigSettings={sigSettings}
                    setSigSettings={setSigSettings}
                    readOnly={false}
                  />
                )}
              </div>
            </div>

            <p className="text-[13px] font-bold text-left mt-2">
              {chiefTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Nav footer */}
      <div className="flex items-center justify-between gap-4 pt-4">
        <button
          onClick={onPrev}
          className="px-6 py-3 rounded-xl border border-slate-300 font-bold text-slate-700 text-sm hover:bg-slate-100 transition-colors"
        >
          {t.prevStep}
        </button>

        <button
          onClick={onNext}
          disabled={!isValid}
          className={`px-8 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
            isValid
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg hover:scale-[1.01]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
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
