/**
 * Utility functions to sanitize and clean extracted or typed form fields
 */

/**
 * Normalizes TOPIK document verification number (문서확인번호) into exactly 4 parts of 4 digits
 * e.g. ["9849", "2820", "3579", "7920"]
 */
export function normalizeDocVerificationNo(
  raw: any,
  fallback?: string[]
): [string, string, string, string] {
  const defaultVal: [string, string, string, string] =
    fallback && fallback.length === 4
      ? [
          fallback[0] || '0000',
          fallback[1] || '0000',
          fallback[2] || '0000',
          fallback[3] || '0000',
        ]
      : ['0000', '0000', '0000', '0000'];

  if (!raw) return defaultVal;

  if (Array.isArray(raw)) {
    // If it's already an array of 4 groups of digits
    if (
      raw.length === 4 &&
      raw.every((part) => /^\d{1,4}$/.test(String(part).trim()))
    ) {
      return [
        String(raw[0]).trim().padStart(4, '0'),
        String(raw[1]).trim().padStart(4, '0'),
        String(raw[2]).trim().padStart(4, '0'),
        String(raw[3]).trim().padStart(4, '0'),
      ];
    }
    // Flatten array of strings (e.g. ["9849-2820-3579-7920"] or ["9849", "282035797920"])
    const joined = raw.map(String).join('').replace(/[^0-9]/g, '');
    if (joined.length >= 16) {
      return [
        joined.slice(0, 4),
        joined.slice(4, 8),
        joined.slice(8, 12),
        joined.slice(12, 16),
      ];
    }
    if (joined.length > 0) {
      const p = joined.padEnd(16, '0');
      return [
        p.slice(0, 4),
        p.slice(4, 8),
        p.slice(8, 12),
        p.slice(12, 16),
      ];
    }
  }

  if (typeof raw === 'string') {
    const digits = raw.replace(/[^0-9]/g, '');
    if (digits.length >= 16) {
      return [
        digits.slice(0, 4),
        digits.slice(4, 8),
        digits.slice(8, 12),
        digits.slice(12, 16),
      ];
    }
    if (digits.length > 0) {
      const p = digits.padEnd(16, '0');
      return [
        p.slice(0, 4),
        p.slice(4, 8),
        p.slice(8, 12),
        p.slice(12, 16),
      ];
    }
  }

  return defaultVal;
}

/**
 * Normalizes Alien Registration Numbers (외국인등록번호) into front 6 digits & back 7 digits
 */
export function normalizeRegNumbers(
  raw1?: string,
  raw2?: string
): { regNumber1: string; regNumber2: string; gender: '남' | '여' } {
  let r1 = (raw1 || '').replace(/[^0-9]/g, '');
  let r2 = (raw2 || '').replace(/[^0-9]/g, '');

  // If full 13 digits passed in raw1 (e.g. "9509105760023")
  if (r1.length >= 13 && !r2) {
    r2 = r1.slice(6, 13);
    r1 = r1.slice(0, 6);
  } else if (r1.length > 6) {
    if (!r2) r2 = r1.slice(6);
    r1 = r1.slice(0, 6);
  }

  if (r2.length > 7) {
    r2 = r2.slice(0, 7);
  }

  r1 = r1 || '000000';
  r2 = r2 || '0000000';

  const firstChar = r2.charAt(0);
  const gender: '남' | '여' = ['2', '4', '6', '8', '0'].includes(firstChar)
    ? '여'
    : '남';

  return { regNumber1: r1, regNumber2: r2, gender };
}

/**
 * Sanitizes and extracts valid Korean immigration visa status code
 * (e.g. E-7-1, E-9-1, E-7-4, D-2, F-2-R, etc.)
 * Prevents long regex-spillover or concatenated strings from corrupting the official template.
 */
export function cleanVisaStatus(raw: string | null | undefined): string {
  if (!raw || typeof raw !== 'string') return 'E-9-1';
  const trimmed = raw.trim();

  // Match standard Korean immigration visa category (e.g., E-7-1, E-7-4, E-9-1, D-2-1, F-2-R, E-7, E-9, F-2, H-2)
  const match =
    trimmed.match(/\b([A-Z]-\d{1,2}(?:-[0-9A-Z]{1,3})?)\b/i) ||
    trimmed.match(/([A-Z]-\d{1,2}(?:-[0-9A-Z]{1,3})?)/i) ||
    trimmed.match(/([A-Z]\d{1,2}(?:-[0-9A-Z]{1,3})?)/i);

  if (match) {
    return match[1].toUpperCase();
  }

  // If short clean string (e.g. "E-7", "F-2")
  if (trimmed.length <= 8 && /^[A-Z0-9-]+$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  return 'E-9-1';
}

/**
 * Cleans TOPIK exam registration number (수험번호)
 */
export function cleanExamNumber(raw?: string): string {
  if (!raw) return '0000000000000';
  const digits = String(raw).replace(/[^0-9]/g, '');
  return digits.length >= 6 ? digits : '0000000000000';
}

/**
 * Cleans TOPIK round number (회차)
 */
export function cleanRound(raw?: string): string {
  if (!raw) return '000';
  const digits = String(raw).replace(/[^0-9]/g, '');
  return digits || '000';
}

/**
 * Cleans TOPIK grade (등급)
 */
export function cleanGrade(raw?: string): string {
  if (!raw) return '0급';
  const match = String(raw).match(/([0-6])\s*급?/);
  if (match) {
    return `${match[1]}급`;
  }
  return '0급';
}

/**
 * Cleans applicant name
 */
export function cleanName(raw?: string): string {
  if (!raw) return '0000 0000';
  const cleaned = String(raw)
    .replace(/(?:성명|Name|NAME)\s*[:：]?\s*/gi, '')
    .replace(/[^a-zA-Z\s가-힣]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.toUpperCase() || '0000 0000';
}


/**
 * Extracts and sanitizes Passport Number and Expiry Date from SVG or text representations
 */
export function parsePassportTextOrSvg(passportUrl?: string | null): {
  passportNo: string;
  passportExpiry: string;
} {
  const defaultVal = {
    passportNo: "N01847291",
    passportExpiry: "2031-08-15",
  };
  if (!passportUrl) return defaultVal;

  let text = "";
  if (passportUrl.startsWith("data:image/svg+xml")) {
    if (passportUrl.includes(";base64,")) {
      try {
        text = atob(passportUrl.split(";base64,")[1]);
      } catch {
        text = "";
      }
    } else if (passportUrl.includes(",")) {
      text = decodeURIComponent(passportUrl.split(",")[1]);
    }
  }

  let passNo = "";
  let passExp = "";

  if (text) {
    // 1. Passport number: e.g. N01847291 or M12345678
    const passMatch =
      text.match(/(?:Passport\s*No\.?|여\s*권\s*번\s*호|លេខលិខិតឆ្លងដែន)[^\w]*([A-Z][0-9]{7,9})/i) ||
      text.match(/\b([A-Z]\d{8})\b/) ||
      text.match(/(N01847291|M\d{8}|C\d{8})/i);
    if (passMatch) {
      passNo = passMatch[1].toUpperCase().trim();
    }

    // 2. Passport expiry date
    const expMatch =
      text.match(/(?:Date\s*of\s*Expiry|Expiry\s*Date|만\s*료\s*일(?:\s*자)?|유\s*효\s*기\s*간|ថ្ងៃផុតកំណត់)[^\d]*(\d{4})[.\-\s년/]+(\d{1,2})[.\-\s월/]+(\d{1,2})/i) ||
      text.match(/(?:Date\s*of\s*Expiry|Expiry)[^\d]*(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/i);
    if (expMatch) {
      if (expMatch[3] && expMatch[3].length === 4) {
        const monthMap: Record<string, string> = {
          jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
          jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
        };
        const mKey = expMatch[2].toLowerCase().slice(0, 3);
        const mm = monthMap[mKey] || "08";
        passExp = `${expMatch[3]}-${mm}-${expMatch[1].padStart(2, "0")}`;
      } else if (expMatch[1] && expMatch[1].length === 4) {
        passExp = `${expMatch[1]}-${expMatch[2].padStart(2, "0")}-${expMatch[3].padStart(2, "0")}`;
      }
    }
  }

  return {
    passportNo: passNo || defaultVal.passportNo,
    passportExpiry: passExp || defaultVal.passportExpiry,
  };
}
