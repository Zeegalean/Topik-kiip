import Tesseract from 'tesseract.js';
import { ApplicationFormData } from '../types';
import {
  cleanVisaStatus,
  normalizeDocVerificationNo,
  normalizeRegNumbers,
  cleanExamNumber,
  cleanRound,
  cleanGrade,
  cleanName,
} from './sanitizers';

export interface ExtractedDocumentData {
  name?: string | null;
  regNumber1?: string | null;
  regNumber2?: string | null;
  gender?: '남' | '여' | '' | null;
  nationality?: string | null;
  visaStatus?: string | null;
  passportNo?: string | null;
  passportExpiry?: string | null;
  address?: string | null;
  docVerificationNo?: string[] | string | null;
  examNumber?: string | null;
  examDate?: string | null;
  round?: string | null;
  validUntil?: string | null;
  grade?: string | null;
}

// Words commonly printed on ARC / Passport / TOPIK headers that are NOT applicant names
const NON_NAME_WORDS = new Set([
  'REPUBLIC', 'OF', 'KOREA', 'FOREIGN', 'NATIONAL', 'RESIDENCE', 'CARD',
  'ALIEN', 'REGISTRATION', 'CERTIFICATE', 'MINISTRY', 'JUSTICE', 'NAME',
  'SEX', 'COUNTRY', 'REGION', 'STATUS', 'ISSUE', 'DATE', 'ISSUED', 'BY',
  'EXPIRY', 'PASSPORT', 'TYPE', 'CODE', 'SURNAME', 'GIVEN', 'NAMES',
  'NATIONALITY', 'BIRTH', 'PLACE', 'AUTHORITY', 'HOLDER', 'SIGNATURE',
  'KINGDOM', 'CAMBODIA', 'VIETNAM', 'NEPAL', 'UZBEKISTAN', 'MYANMAR',
  'THAILAND', 'INDONESIA', 'PHILIPPINES', 'CHINA', 'MONGOLIA', 'LANKA',
  'BANGLADESH', 'PAKISTAN', 'TEST', 'PROFICIENCY', 'IN', 'KOREAN',
  'TOPIK', 'SCORE', 'REPORT', 'INSTITUTE', 'INTERNATIONAL',
  'EDUCATION', 'LEVEL', 'TOTAL', 'POINTS', 'GRADE', 'VALID', 'UNTIL',
  'APPLICATION', 'NUMBER', 'VERIFICATION', 'DOCUMENT', 'IMMIGRATION',
  'SERVICE', 'OFFICE', 'CHIEF', 'MALE', 'FEMALE', 'KHM', 'VNM', 'NPL',
  'UZB', 'MMR', 'THA', 'IDN', 'PHL', 'CHN', 'MNG', 'LKA', 'NO', 'REG'
]);

/**
 * Preprocess image on an HTML5 canvas to improve OCR speed and accuracy.
 * Converts colored security card backgrounds into clean white while sharpening dark text.
 */
async function preprocessImageForOcr(dataUrl: string): Promise<string> {
  if (!dataUrl || dataUrl.startsWith('data:image/svg+xml') || dataUrl.startsWith('data:application/pdf')) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const maxDim = 1600;
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Adaptive grayscale contrast boost to remove ARC card background security patterns
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          let val = (lum - 128) * 1.42 + 128;
          if (val > 218) val = 255;
          if (val < 48) val = 0;
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        }
        ctx.putImageData(imageData, 0, 0);

        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Run Tesseract.js OCR on a DataURL in the browser
 */
async function runBrowserOcrOnImage(
  dataUrl: string | null | undefined,
  langSpec: string = 'kor+eng'
): Promise<string> {
  if (!dataUrl) return '';

  // Check if SVG data URL
  if (dataUrl.startsWith('data:image/svg+xml')) {
    try {
      const commaIdx = dataUrl.indexOf(',');
      if (commaIdx !== -1) {
        const payload = dataUrl.slice(commaIdx + 1);
        if (dataUrl.includes(';base64,')) {
          return decodeURIComponent(escape(atob(payload)));
        }
        return decodeURIComponent(payload);
      }
    } catch {
      return '';
    }
  }

  // If PDF data URL, extract any embedded readable ASCII/text strings
  if (dataUrl.startsWith('data:application/pdf')) {
    try {
      const base64 = dataUrl.split(';base64,')[1];
      if (base64) {
        return atob(base64);
      }
    } catch {
      return '';
    }
    return '';
  }

  try {
    const processedUrl = await preprocessImageForOcr(dataUrl);
    const result = await Tesseract.recognize(processedUrl, langSpec);
    return result?.data?.text || '';
  } catch (err) {
    console.warn('[Client OCR] Tesseract error:', err);
    return '';
  }
}

/**
 * Normalize spaced Korean province/city names from OCR
 */
function normalizeKoreanAdminSpacing(text: string): string {
  return text
    .replace(/충\s*청\s*남\s*도/g, '충청남도')
    .replace(/충\s*청\s*북\s*도/g, '충청북도')
    .replace(/경\s*기\s*도/g, '경기도')
    .replace(/경\s*상\s*남\s*도/g, '경상남도')
    .replace(/경\s*상\s*북\s*도/g, '경상북도')
    .replace(/전\s*라\s*남\s*도/g, '전라남도')
    .replace(/전\s*라\s*북\s*도/g, '전라북도')
    .replace(/전\s*북\s*특\s*별\s*자\s*치\s*도/g, '전북특별자치도')
    .replace(/강\s*원\s*특\s*별\s*자\s*치\s*도/g, '강원특별자치도')
    .replace(/강\s*원\s*도/g, '강원도')
    .replace(/제\s*주\s*특\s*별\s*자\s*치\s*도/g, '제주특별자치도')
    .replace(/서\s*울\s*특\s*별\s*시/g, '서울특별시')
    .replace(/인\s*천\s*광\s*역\s*시/g, '인천광역시')
    .replace(/부\s*산\s*광\s*역\s*시/g, '부산광역시')
    .replace(/대\s*구\s*광\s*역\s*시/g, '대구광역시')
    .replace(/광\s*주\s*광\s*역\s*시/g, '광주광역시')
    .replace(/대\s*전\s*광\s*역\s*시/g, '대전광역시')
    .replace(/울\s*산\s*광\s*역\s*시/g, '울산광역시')
    .replace(/세\s*종\s*특\s*별\s*자\s*치\s*시/g, '세종특별자치시');
}

/**
 * Extract latest Korean residence address (체류지) from ARC back or front text,
 * including wrapped 2nd-line building/dong details.
 */
export function extractKoreanAddressFromText(rawCorpus: string): string | null {
  if (!rawCorpus) return null;

  const textCorpus = normalizeKoreanAdminSpacing(rawCorpus);
  const rawLines = textCorpus
    .split(/[\r\n<>]+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const datePattern = /(\d{4}|\d{2})[.\-\s년/]+(\d{1,2})[.\-\s월/]+(\d{1,2})/;

  // Matches Korean province/city start OR city/county/district + road/dong
  const addrStartRegex = /((?:서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|충청북도|충청남도|전북|전남|전라북도|전라남도|전북특별자치도|강원특별자치도|경북|경남|경상북도|경상남도|제주)[가-힣]*\s+[가-힣0-9\s\-~,().]+|[가-힣]{2,6}(?:시|군|구)\s+[가-힣]{1,12}(?:구|읍|면|동|로|길|가)\s*[가-힣0-9\s\-~,().]*)/;

  interface AddrCandidate {
    address: string;
    timestamp: number;
    lineIndex: number;
  }

  const candidates: AddrCandidate[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (line.length < 4) continue;

    // Skip administrative notice lines
    if (
      line.includes('시·군·구청') ||
      line.includes('출입국·외국인') ||
      line.includes('새로운 체류지') ||
      line.includes('신고하여야') ||
      line.includes('범칙금') ||
      line.includes('지방출입국')
    ) {
      continue;
    }

    const match = line.match(addrStartRegex);
    if (!match) continue;

    let cleanAddr = match[1]
      .replace(/^(?:체류지|국내거소|주소|변경사항|신고일|신고일자)\s*[:：]?\s*/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanAddr.length < 5) continue;
    if (cleanAddr.includes('출입국') || cleanAddr.includes('외국인청') || cleanAddr.includes('사무소')) continue;

    // Check if the next line is a wrapped continuation of this address (e.g. "85-9 (수석동)" or "101동 203호")
    if (i + 1 < rawLines.length) {
      const nextLine = rawLines[i + 1];
      const nextHasDate = datePattern.test(nextLine);
      const nextHasNewProvince = addrStartRegex.test(nextLine);
      const nextIsBoilerplate =
        nextLine.includes('시·군·구') ||
        nextLine.includes('출입국') ||
        nextLine.includes('체류지') ||
        nextLine.includes('변경사항') ||
        nextLine.includes('확인');

      if (
        !nextHasDate &&
        !nextHasNewProvince &&
        !nextIsBoilerplate &&
        nextLine.length >= 2 &&
        nextLine.length <= 35 &&
        /(?:\d+|번길|로|길|동|호|층|읍|면|리|\([가-힣0-9]+\))/.test(nextLine)
      ) {
        const cleanedCont = nextLine.replace(/[^가-힣0-9\s\-~,().]/g, '').trim();
        if (cleanedCont.length >= 2) {
          cleanAddr = `${cleanAddr} ${cleanedCont}`.replace(/\s+/g, ' ').trim();
        }
      }
    }

    // Check for report date (신고일) on same line or nearby lines
    let ts = 0;
    for (let offset = -1; offset <= 1; offset++) {
      const idx = i + offset;
      if (idx >= 0 && idx < rawLines.length) {
        const dMatch = rawLines[idx].match(datePattern);
        if (dMatch) {
          let y = parseInt(dMatch[1], 10);
          if (y < 100) y += 2000;
          const mo = parseInt(dMatch[2], 10);
          const da = parseInt(dMatch[3], 10);
          if (y >= 2010 && y <= 2035 && mo >= 1 && mo <= 12 && da >= 1 && da <= 31) {
            ts = new Date(y, mo - 1, da).getTime();
            break;
          }
        }
      }
    }

    candidates.push({
      address: cleanAddr,
      timestamp: ts,
      lineIndex: i,
    });
  }

  if (candidates.length === 0) return null;

  const withDates = candidates.filter((c) => c.timestamp > 0);
  if (withDates.length > 0) {
    withDates.sort((a, b) => b.timestamp - a.timestamp);
    return withDates[0].address;
  }

  return candidates[candidates.length - 1].address;
}

/**
 * Extract applicant's English uppercase name from OCR text (ARC / Passport MRZ / TOPIK)
 */
export function extractApplicantNameFromText(textCorpus: string): string | null {
  if (!textCorpus) return null;

  // 1. Check Passport MRZ line 1: P<KHMSURNAME<<GIVENNAME<<<<<<
  const mrzMatch = textCorpus.match(/P<[A-Z]{3}([A-Z]+)<<([A-Z<]+)/);
  if (mrzMatch) {
    const surname = mrzMatch[1].replace(/</g, ' ').trim();
    const given = mrzMatch[2].replace(/</g, ' ').trim();
    if (surname.length >= 2 && given.length >= 2) {
      return `${surname} ${given}`.replace(/\s+/g, ' ').trim();
    }
  }

  // 2. Check explicit label: 성명 / Name followed by English uppercase words
  const labelMatches = [
    ...textCorpus.matchAll(/(?:성\s*명|Name|NAME|영문성명)[^\nA-Za-z]{0,18}([A-Z]{2,20}(?:[\s,]+[A-Z]{2,20}){0,3})/g),
  ];
  for (const m of labelMatches) {
    const candidate = m[1].replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
    const words = candidate.split(' ').filter((w) => w.length >= 2 && !NON_NAME_WORDS.has(w));
    if (words.length >= 2) {
      return words.slice(0, 4).join(' ');
    }
  }

  // 3. Look right after the 13-digit Alien Registration Number on ARC Front
  const regIdxMatch = textCorpus.match(/\d{6}\s*[-–~.\s]\s*[1-8]\d{6}/);
  if (regIdxMatch && regIdxMatch.index !== undefined) {
    const afterReg = textCorpus.slice(regIdxMatch.index + regIdxMatch[0].length, regIdxMatch.index + 220);
    const upperMatches = afterReg.match(/\b([A-Z]{2,18}(?:\s+[A-Z]{2,18}){1,3})\b/g);
    if (upperMatches) {
      for (const raw of upperMatches) {
        const words = raw.trim().split(/\s+/).filter((w) => w.length >= 2 && !NON_NAME_WORDS.has(w));
        if (words.length >= 2 && words.length <= 4) {
          return words.join(' ');
        }
      }
    }
  }

  // 4. Scan all lines for 2-4 uppercase words (like "EANG VEASNA", "SOK SRORNG") that are not card headers
  const lines = textCorpus.split(/[\r\n<>]+/);
  for (const line of lines) {
    const upperMatches = line.match(/\b([A-Z]{2,18}(?:\s+[A-Z]{2,18}){1,3})\b/g);
    if (!upperMatches) continue;
    for (const raw of upperMatches) {
      const words = raw.trim().split(/\s+/).filter((w) => w.length >= 2 && !NON_NAME_WORDS.has(w));
      if (words.length >= 2 && words.length <= 4) {
        return words.join(' ');
      }
    }
  }

  return null;
}

/**
 * Parse combined OCR text from ARC Front, ARC Back, TOPIK Certificate, and Passport
 */
export function parseOcrCorpusToData(
  arcFrontText: string,
  arcBackText: string,
  topikText: string,
  passportText: string
): ExtractedDocumentData {
  const combined = `${arcFrontText}\n${arcBackText}\n${topikText}\n${passportText}`;
  const result: ExtractedDocumentData = {};

  // 1. Name (Prefer ARC Front -> Passport -> TOPIK -> Combined)
  const detectedName =
    extractApplicantNameFromText(arcFrontText) ||
    extractApplicantNameFromText(passportText) ||
    extractApplicantNameFromText(topikText) ||
    extractApplicantNameFromText(combined);
  if (detectedName) {
    result.name = detectedName;
  }

  // 2. Alien Registration Number (6 digits - 7 digits)
  const regMatch =
    arcFrontText.match(/(\d{6})\s*[-–~.\s]\s*([1-8]\d{6})/) ||
    combined.match(/(\d{6})\s*[-–~.\s]\s*([5-8]\d{6})/) ||
    combined.match(/(\d{6})\s*[-–]\s*(\d{7})/) ||
    arcFrontText.match(/\b(\d{6})([5-8]\d{6})\b/);
  if (regMatch) {
    result.regNumber1 = regMatch[1];
    result.regNumber2 = regMatch[2];
  }

  // 3. Gender
  if (result.regNumber2) {
    const firstDigit = result.regNumber2.charAt(0);
    if (['1', '3', '5', '7'].includes(firstDigit)) {
      result.gender = '남';
    } else if (['2', '4', '6', '8'].includes(firstDigit)) {
      result.gender = '여';
    }
  }
  if (!result.gender) {
    if (/\b(?:FEMALE|여\s*자|\/\s*여)\b/i.test(combined)) {
      result.gender = '여';
    } else if (/\b(?:MALE|남\s*자|\/\s*남)\b/i.test(combined)) {
      result.gender = '남';
    }
  }

  // 4. Nationality
  const natMatch = combined.match(
    /\b(CAMBODIA|VIETNAM|NEPAL|UZBEKISTAN|MYANMAR|THAILAND|INDONESIA|PHILIPPINES|CHINA|MONGOLIA|SRI\s*LANKA|BANGLADESH|PAKISTAN)\b/i
  );
  if (natMatch) {
    const rawNat = natMatch[1].toUpperCase();
    result.nationality = rawNat.charAt(0) + rawNat.slice(1).toLowerCase();
  } else if (/KHM|캄보디아/.test(combined)) {
    result.nationality = 'Cambodia';
  }

  // 5. Visa Status (체류자격)
  const visaMatch =
    arcFrontText.match(/\b(E-?9-?1|E-?7-?4|E-?7-?1|E-?9|E-?7|F-?2-?R|F-?2|F-?5|F-?6|D-?2|D-?4|D-?10|H-?2)\b/i) ||
    combined.match(/(?:체\s*류\s*자\s*격|Status)[^\nA-Za-z0-9]{0,12}([A-Z]\s*[-–]?\s*\d(?:\s*[-–]?\s*[A-Z0-9])?)/i);
  if (visaMatch) {
    let v = visaMatch[1].toUpperCase().replace(/\s+/g, '');
    if (/^E91$/.test(v)) v = 'E-9-1';
    else if (/^E74$/.test(v)) v = 'E-7-4';
    else if (/^E71$/.test(v)) v = 'E-7-1';
    else if (/^F2R$/.test(v)) v = 'F-2-R';
    result.visaStatus = v;
  }

  // 6. Korean Residence Address (Prefer ARC Back -> ARC Front -> Combined)
  const detectedAddress =
    extractKoreanAddressFromText(arcBackText) ||
    extractKoreanAddressFromText(arcFrontText) ||
    extractKoreanAddressFromText(combined);
  if (detectedAddress) {
    result.address = detectedAddress;
  }

  // 7. TOPIK Verification Number (문서확인번호: XXXX-XXXX-XXXX-XXXX)
  const docVerMatch =
    topikText.match(/(\d{4})\s*[-–.\s]\s*(\d{4})\s*[-–.\s]\s*(\d{4})\s*[-–.\s]\s*(\d{4})/) ||
    combined.match(/(?:문\s*서\s*확\s*인\s*번\s*호|Verification)[^\d]{0,15}(\d{4})\s*[-–.\s]\s*(\d{4})\s*[-–.\s]\s*(\d{4})\s*[-–.\s]\s*(\d{4})/i);
  if (docVerMatch) {
    result.docVerificationNo = [docVerMatch[1], docVerMatch[2], docVerMatch[3], docVerMatch[4]];
  }

  // 8. TOPIK Exam Number (수험번호: 10~16 digits, usually 13 digits starting with 00)
  const examNumMatch =
    topikText.match(/(?:수\s*험\s*번\s*호|Registration\s*No)[^\d]{0,15}(\d{10,16})/i) ||
    topikText.match(/\b(0\d{11,15})\b/) ||
    combined.match(/\b(00\d{11})\b/);
  if (examNumMatch) {
    result.examNumber = examNumMatch[1];
  }

  // 9. TOPIK Round (회차: e.g. 107회)
  const roundMatch =
    topikText.match(/(?:제\s*)?(\d{2,3})\s*회/) ||
    topikText.match(/(?:회\s*차|Test\s*Number|Round)[^\d]{0,12}(\d{2,3})/i) ||
    topikText.match(/(\d{2,3})\s*th/i) ||
    combined.match(/(?:제\s*)?(\d{2,3})\s*회/);
  if (roundMatch) {
    result.round = roundMatch[1];
  }

  // 10. TOPIK Grade (등급: 1급 ~ 6급)
  const gradeMatch =
    topikText.match(/([1-6])\s*급/) ||
    topikText.match(/(?:등\s*급|Grade)[^\d]{0,12}([1-6])/i) ||
    combined.match(/([1-6])\s*급/);
  if (gradeMatch) {
    result.grade = `${gradeMatch[1]}급`;
  }

  // 11. TOPIK Exam Date & Valid Until Date
  const examDateMatch =
    topikText.match(/(?:시\s*험\s*일\s*자|Test\s*Date)[^\d]{0,15}(\d{4})[.\-\s년/]+(\d{1,2})[.\-\s월/]+(\d{1,2})/i);
  if (examDateMatch) {
    result.examDate = `${examDateMatch[1]}-${examDateMatch[2].padStart(2, '0')}-${examDateMatch[3].padStart(2, '0')}`;
  }

  const validMatch =
    topikText.match(/(?:유\s*효\s*기\s*간|Valid\s*Until)[^\d]{0,15}(\d{4})[.\-\s년/]+(\d{1,2})[.\-\s월/]+(\d{1,2})/i);
  if (validMatch) {
    result.validUntil = `${validMatch[1]}-${validMatch[2].padStart(2, '0')}-${validMatch[3].padStart(2, '0')}`;
  }

  // 12. Passport Number & Expiry (including ICAO MRZ line 2)
  const mrzLine2 = combined.match(/([A-Z0-9<]{9})\d[A-Z]{3}(\d{6})\d([MF<])(\d{6})/);
  if (mrzLine2) {
    const rawPassNo = mrzLine2[1].replace(/</g, '').trim();
    if (rawPassNo.length >= 6) {
      result.passportNo = rawPassNo;
    }
    if (!result.regNumber1 && /^\d{6}$/.test(mrzLine2[2])) {
      result.regNumber1 = mrzLine2[2];
    }
    const expRaw = mrzLine2[4];
    if (/^\d{6}$/.test(expRaw)) {
      const yy = parseInt(expRaw.slice(0, 2), 10);
      const mm = expRaw.slice(2, 4);
      const dd = expRaw.slice(4, 6);
      result.passportExpiry = `${2000 + yy}-${mm}-${dd}`;
    }
  }

  if (!result.passportNo) {
    const passMatch =
      passportText.match(/\b([A-Z]{1,2}\d{7,8})\b/) ||
      combined.match(/(?:여\s*권\s*번\s*호|Passport\s*No)[^\nA-Z0-9]{0,12}([A-Z]{1,2}\d{7,8})/i);
    if (passMatch) {
      result.passportNo = passMatch[1].toUpperCase();
    }
  }

  return result;
}

/**
 * Full client-side OCR extraction across all uploaded documents.
 * Uses optimal language models per document type for maximum speed & accuracy:
 * - ARC Front: 'eng+kor' (English Name, Reg No, Country, Visa Status)
 * - ARC Back: 'kor' (Korean Residence Address & Report Dates)
 * - TOPIK Cert: 'kor+eng' (Scores, Verification No, Exam No, Name)
 * - Passport: 'eng' (MRZ lines, Passport No, Name, Expiry)
 */
export async function extractDocumentsClientSide(params: {
  arcFront?: string | null;
  arcBack?: string | null;
  topikCert?: string | null;
  passport?: string | null;
}): Promise<ExtractedDocumentData> {
  const [arcFrontText, arcBackText, topikText, passportText] = await Promise.all([
    runBrowserOcrOnImage(params.arcFront, 'eng+kor'),
    runBrowserOcrOnImage(params.arcBack, 'kor'),
    runBrowserOcrOnImage(params.topikCert, 'kor+eng'),
    runBrowserOcrOnImage(params.passport, 'eng'),
  ]);

  return parseOcrCorpusToData(arcFrontText, arcBackText, topikText, passportText);
}

/**
 * Smartly merges newly extracted OCR fields into existing ApplicationFormData,
 * replacing initial '0000' placeholders while preserving already-extracted real fields.
 */
export function mergeExtractedIntoFormData(
  prev: ApplicationFormData,
  ext: ExtractedDocumentData
): ApplicationFormData {
  const isPlaceholderName = (v?: string) => !v || v === '0000 0000' || v === '0000';
  const isPlaceholderReg1 = (v?: string) => !v || v === '000000';
  const isPlaceholderReg2 = (v?: string) => !v || v === '0000000';
  const isPlaceholderAddr = (v?: string) => !v || v === '00000 0000 000';
  const isPlaceholderExamNo = (v?: string) => !v || v === '0000000000000';
  const isPlaceholderDate = (v?: string) => !v || v === '0000-00-00';
  const isPlaceholderRound = (v?: string) => !v || v === '000';
  const isPlaceholderGrade = (v?: string) => !v || v === '0급';

  const rawName = ext.name && !isPlaceholderName(ext.name)
    ? ext.name
    : (!isPlaceholderName(prev.name) ? prev.name : '');
  const finalName = rawName ? cleanName(rawName) : prev.name;

  const rawReg1 = ext.regNumber1 && !isPlaceholderReg1(ext.regNumber1)
    ? ext.regNumber1
    : (!isPlaceholderReg1(prev.regNumber1) ? prev.regNumber1 : '000000');
  const rawReg2 = ext.regNumber2 && !isPlaceholderReg2(ext.regNumber2)
    ? ext.regNumber2
    : (!isPlaceholderReg2(prev.regNumber2) ? prev.regNumber2 : '0000000');
  const reg = normalizeRegNumbers(rawReg1, rawReg2);

  const finalAddress = ext.address && !isPlaceholderAddr(ext.address)
    ? ext.address
    : prev.address;

  const hasNewDocVer = Array.isArray(ext.docVerificationNo)
    ? ext.docVerificationNo.length === 4 && ext.docVerificationNo.some((p: string) => p && p !== '0000')
    : typeof ext.docVerificationNo === 'string' && ext.docVerificationNo.replace(/0|-|\s/g, '').length > 0;
  const docParts = hasNewDocVer
    ? normalizeDocVerificationNo(ext.docVerificationNo, prev.docVerificationNo)
    : prev.docVerificationNo;

  const finalExamNo = ext.examNumber && !isPlaceholderExamNo(ext.examNumber)
    ? cleanExamNumber(ext.examNumber)
    : prev.examNumber;

  const finalExamDate = ext.examDate && !isPlaceholderDate(ext.examDate)
    ? ext.examDate
    : prev.examDate;

  const finalRound = ext.round && !isPlaceholderRound(ext.round)
    ? cleanRound(ext.round)
    : prev.round;

  const finalValidUntil = ext.validUntil && !isPlaceholderDate(ext.validUntil)
    ? ext.validUntil
    : prev.validUntil;

  const finalGrade = ext.grade && !isPlaceholderGrade(ext.grade)
    ? cleanGrade(ext.grade)
    : prev.grade;

  return {
    ...prev,
    name: finalName,
    applicantName: finalName,
    regNumber1: reg.regNumber1,
    regNumber2: reg.regNumber2,
    gender: ext.gender === '여' ? '여' : ext.gender === '남' ? '남' : (!isPlaceholderReg2(reg.regNumber2) ? reg.gender : prev.gender),
    nationality: ext.nationality || prev.nationality || 'Cambodia',
    visaStatus: ext.visaStatus ? cleanVisaStatus(ext.visaStatus) : prev.visaStatus,
    passportNo: (ext.passportNo || prev.passportNo || '').toUpperCase().trim(),
    passportExpiry: ext.passportExpiry || prev.passportExpiry || '',
    address: finalAddress,
    docVerificationNo: docParts,
    examNumber: finalExamNo,
    examDate: finalExamDate,
    round: finalRound,
    validUntil: finalValidUntil,
    grade: finalGrade,
  };
}
