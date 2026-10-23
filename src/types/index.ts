export type Language =
  // Southeast Asia
  | 'km' | 'vi' | 'id' | 'th' | 'my' | 'tl' | 'lo' | 'ms'
  // East Asia
  | 'ko' | 'zh' | 'ja' | 'mn'
  // South Asia
  | 'ne' | 'si' | 'bn' | 'hi' | 'ur' | 'ta' | 'te' | 'mr' | 'pa'
  // Central Asia & CIS
  | 'uz' | 'ru' | 'kk' | 'tg' | 'ky' | 'az' | 'ka'
  // Middle East
  | 'ar' | 'fa' | 'tr' | 'ps' | 'he'
  // Europe & Americas
  | 'en' | 'es' | 'fr' | 'de' | 'pt' | 'it' | 'nl' | 'uk' | 'pl' | 'ro' | 'cs' | 'hu' | 'sv' | 'el'
  // Africa
  | 'sw' | 'am' | 'ha';

export interface ImmigrationOffice {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  regionKeywords: string[];
}

export interface ApplicationFormData {
  // Target
  applyType: 'topik' | 'marriage';
  
  // Applicant details
  name: string;
  regNumber1: string; // 6 digits (YYMMDD)
  regNumber2: string; // 7 digits
  gender: '남' | '여' | '';
  nationality: string;
  visaStatus: string;
  passportNo: string; // Passport Number (여권번호 / លេខលិខិតឆ្លងដែន)
  passportExpiry: string; // Passport Expiry Date (여권 유효기간 / កាលបរិច្ឆេទផុតកំណត់)
  address: string;
  phone: string;
  mobile: string;

  // Socinet Info
  socinetId: string;
  socinetPw: string;

  // TOPIK Details
  docVerificationNo: string[]; // 4 parts of 4 digits
  examNumber: string;
  examDate: string; // YYYY-MM-DD
  round: string; // 회차 e.g. 107
  validUntil: string; // YYYY-MM-DD
  grade: string; // 1급 ~ 6급

  // Marriage Immigrant 2nd stage institution details (optional)
  instituteName: string;
  completionDate: string;

  // Consent & Date
  consent: 'agree' | 'disagree';
  applyYear: string;
  applyMonth: string;
  applyDay: string;
  applicantName: string;
}

export interface UploadedDocuments {
  arcFront: string | null; // dataUrl
  arcFrontName?: string;
  arcBack: string | null;  // dataUrl
  arcBackName?: string;
  passportList: { id: string; dataUrl: string; name: string }[];
  topikCertList: { id: string; dataUrl: string; name: string }[];
  signature: string | null; // transparent dataUrl
  signatureRaw: string | null; // original before bg removal
}

export interface SignatureSettings {
  x: number; // offset X in px
  y: number; // offset Y in px
  scale: number; // zoom percentage (0.5 to 2.0)
  removeBg: boolean;
  bgMode?: 'transparent' | 'white';
  inkColor?: 'blue' | 'black' | 'original';
  threshold?: number;
}

export interface UserAccount {
  isLoggedIn: boolean;
  name: string;
  email: string;
  avatar: string;
  provider: 'google' | 'apple' | 'gmail' | 'guest';
}
