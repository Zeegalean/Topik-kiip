import { ApplicationFormData } from '../types';

export const INITIAL_FORM_DATA: ApplicationFormData = {
  applyType: 'topik',
  name: '0000 0000',
  regNumber1: '000000',
  regNumber2: '0000000',
  gender: '남',
  nationality: 'Cambodia',
  visaStatus: 'E-9-1',
  passportNo: '',
  passportExpiry: '',
  address: '00000 0000 000',
  phone: '',
  mobile: '',
  socinetId: '',
  socinetPw: '',
  docVerificationNo: ['0000', '0000', '0000', '0000'],
  examNumber: '0000000000000',
  examDate: '0000-00-00',
  round: '000',
  validUntil: '0000-00-00',
  grade: '0급',
  instituteName: '',
  completionDate: '',
  consent: 'agree',
  applyYear: new Date().getFullYear().toString(),
  applyMonth: String(new Date().getMonth() + 1).padStart(2, '0'),
  applyDay: String(new Date().getDate()).padStart(2, '0'),
  applicantName: '0000 0000',
};

export const SAMPLE_FORM_DATA: ApplicationFormData = {
  ...INITIAL_FORM_DATA,
  name: 'SOK SRORNG',
  applicantName: 'SOK SRORNG',
  phone: '010-9876-5432',
  mobile: '010-9876-5432',
  socinetId: 'sok_srorng88',
  socinetPw: 'socinet2026*',
  passportNo: 'N01847291',
  passportExpiry: '2031-08-15',
  address: '서울특별시 종로구 세종대로 209',
};

// Generates an SVG data URL representing a realistic Alien Registration Card Front
export function generateSampleArcFront(): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <defs>
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f0f7f4"/>
        <stop offset="50%" stop-color="#e8f3ef"/>
        <stop offset="100%" stop-color="#d6ede3"/>
      </linearGradient>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="2" dy="3" stdDeviation="4" flood-opacity="0.25"/>
      </filter>
    </defs>
    
    <rect width="800" height="500" rx="20" fill="url(#cardGrad)" stroke="#2b6b55" stroke-width="4"/>
    
    <!-- Header -->
    <rect x="25" y="25" width="750" height="60" rx="8" fill="#1b4d3e"/>
    <text x="400" y="65" font-family="'Noto Serif KR', serif, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="4">외 국 인 등 록 증</text>
    <text x="400" y="80" font-family="sans-serif" font-size="12" fill="#cbe8de" text-anchor="middle" letter-spacing="2">ALIEN REGISTRATION CARD</text>
    
    <!-- Photo Area -->
    <rect x="50" y="115" width="180" height="240" rx="10" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
    <circle cx="140" cy="190" r="45" fill="#64748b"/>
    <path d="M75,320 C85,250 195,250 205,320 Z" fill="#64748b"/>
    <text x="140" y="345" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">PHOTO</text>
    
    <!-- Info Fields -->
    <!-- Registration No -->
    <text x="260" y="140" font-family="sans-serif" font-size="14" fill="#334155" font-weight="bold">등록번호 (Registration No.)</text>
    <text x="260" y="170" font-family="monospace, sans-serif" font-size="24" fill="#0f172a" font-weight="bold">000000-0000000</text>
    
    <!-- Name -->
    <text x="260" y="210" font-family="sans-serif" font-size="14" fill="#334155" font-weight="bold">성명 (Name)</text>
    <text x="260" y="240" font-family="sans-serif" font-size="22" fill="#0f172a" font-weight="bold">0000 0000</text>
    
    <!-- Country & Status -->
    <text x="260" y="280" font-family="sans-serif" font-size="13" fill="#334155">국가/지역 (Country):</text>
    <text x="420" y="280" font-family="sans-serif" font-size="15" fill="#0f172a" font-weight="bold">CAMBODIA (캄보디아)</text>
    
    <text x="260" y="315" font-family="sans-serif" font-size="13" fill="#334155">체류자격 (Status):</text>
    <text x="420" y="315" font-family="sans-serif" font-size="15" fill="#0f172a" font-weight="bold">E-9-1 (비전문취업)</text>
    
    <text x="260" y="350" font-family="sans-serif" font-size="13" fill="#334155">발급일자 (Issue Date):</text>
    <text x="420" y="350" font-family="sans-serif" font-size="15" fill="#0f172a" font-weight="bold">0000. 00. 00</text>

    <!-- Bottom seal -->
    <line x1="50" y1="400" x2="750" y2="400" stroke="#cbd5e1" stroke-width="2"/>
    <text x="400" y="445" font-family="'Noto Serif KR', serif" font-size="20" font-weight="bold" fill="#1e3a8a" text-anchor="middle" letter-spacing="3">법 무 부 장 관</text>
    <circle cx="560" cy="440" r="22" fill="none" stroke="#dc2626" stroke-width="2"/>
    <text x="560" y="446" font-family="serif" font-size="11" font-weight="bold" fill="#dc2626" text-anchor="middle">대한민국인</text>
  </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Generates an SVG data URL representing Alien Registration Card Back (with address change history)
export function generateSampleArcBack(): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <rect width="800" height="500" rx="20" fill="#f8fafc" stroke="#64748b" stroke-width="3"/>
    
    <text x="400" y="40" font-family="'Noto Serif KR', serif" font-size="18" font-weight="bold" fill="#1e293b" text-anchor="middle">체류지 변경사항 (CHANGE OF RESIDENCE)</text>
    
    <!-- Address table -->
    <rect x="40" y="60" width="720" height="240" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5"/>
    <line x1="40" y1="95" x2="760" y2="95" stroke="#94a3b8" stroke-width="1.5"/>
    <line x1="40" y1="145" x2="760" y2="145" stroke="#cbd5e1" stroke-width="1"/>
    <line x1="40" y1="195" x2="760" y2="195" stroke="#cbd5e1" stroke-width="1"/>
    <line x1="40" y1="245" x2="760" y2="245" stroke="#cbd5e1" stroke-width="1"/>

    <line x1="200" y1="60" x2="200" y2="300" stroke="#94a3b8" stroke-width="1.5"/>
    <line x1="620" y1="60" x2="620" y2="300" stroke="#94a3b8" stroke-width="1.5"/>
    
    <text x="120" y="83" font-family="sans-serif" font-size="12" font-weight="bold" fill="#334155" text-anchor="middle">신고일자 (Date)</text>
    <text x="410" y="83" font-family="sans-serif" font-size="12" font-weight="bold" fill="#334155" text-anchor="middle">체류지 (Address)</text>
    <text x="690" y="83" font-family="sans-serif" font-size="12" font-weight="bold" fill="#334155" text-anchor="middle">서명/확인 (Sign)</text>
    
    <!-- Row 1: Old Initial Address (이전 거주지 1) -->
    <text x="120" y="125" font-family="sans-serif" font-size="11" fill="#64748b" text-anchor="middle">2022. 04. 15</text>
    <text x="215" y="125" font-family="sans-serif" font-size="11" fill="#64748b">경기도 화성시 향남읍 발안공단로 123</text>
    <text x="690" y="125" font-family="serif" font-size="10" fill="#94a3b8" text-anchor="middle">[화성시장인]</text>

    <!-- Row 2: Old Previous Address (이전 거주지 2) -->
    <text x="120" y="175" font-family="sans-serif" font-size="11" fill="#64748b" text-anchor="middle">2024. 07. 10</text>
    <text x="215" y="175" font-family="sans-serif" font-size="11" fill="#64748b">경기도 평택시 포승읍 포승공단순환로 56</text>
    <text x="690" y="175" font-family="serif" font-size="10" fill="#94a3b8" text-anchor="middle">[평택시장인]</text>

    <!-- Row 3: LATEST ACTIVE ADDRESS (최신 유효 체류지 - 신고일: 2026.02.18) -->
    <rect x="42" y="196" width="716" height="48" fill="#f0fdf4" opacity="0.6"/>
    <text x="120" y="225" font-family="sans-serif" font-size="12" font-weight="bold" fill="#15803d" text-anchor="middle">2026. 02. 18</text>
    <text x="215" y="225" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a">충청남도 서산시 수석산업로 85-9 (수석동)</text>
    <text x="690" y="225" font-family="serif" font-size="11" font-weight="bold" fill="#dc2626" text-anchor="middle">[서산시장인]</text>
    
    <!-- Notice -->
    <rect x="40" y="320" width="720" height="140" rx="8" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
    <text x="60" y="350" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f172a">[유의사항 / NOTICE]</text>
    <text x="60" y="375" font-family="sans-serif" font-size="11" fill="#475569">1. 체류지가 변경된 때에는 15일 이내에 새로운 체류지의 시·군·구청 또는 관할 출입국·외국인관서에 신고하여야 합니다.</text>
    <text x="60" y="398" font-family="sans-serif" font-size="11" fill="#475569">2. Any change of residence must be reported within 15 days to the local immigration office or Si/Gun/Gu office.</text>
    <text x="60" y="420" font-family="sans-serif" font-size="11" fill="#475569">3. 서명 또는 인이 없는 것은 효력이 없습니다. Always keep this card with you in Korea.</text>
  </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}


// Generates an SVG data URL representing an official TOPIK Score Certificate
export function generateSampleTopikCert(): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="800" height="1100">
    <rect width="800" height="1100" fill="#ffffff" stroke="#334155" stroke-width="4"/>
    
    <!-- Ornamental border -->
    <rect x="15" y="15" width="770" height="1070" fill="none" stroke="#1e3a8a" stroke-width="2"/>
    <rect x="20" y="20" width="760" height="1060" fill="none" stroke="#93c5fd" stroke-width="1"/>
    
    <!-- Header -->
    <text x="400" y="70" font-family="'Noto Serif KR', serif" font-size="13" fill="#64748b" text-anchor="middle">제 000 회 한국어능력시험 성적증명서</text>
    <text x="400" y="110" font-family="'Noto Serif KR', serif" font-size="28" font-weight="bold" fill="#0f172a" text-anchor="middle" letter-spacing="4">한국어능력시험 성적증명서</text>
    <text x="400" y="135" font-family="sans-serif" font-size="13" fill="#475569" text-anchor="middle" letter-spacing="1">OFFICIAL TOPIK SCORE REPORT</text>
    
    <!-- Document verification box -->
    <rect x="50" y="160" width="700" height="40" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="70" y="185" font-family="sans-serif" font-size="12" font-weight="bold" fill="#334155">문서확인번호 (Verification No.) :</text>
    <text x="290" y="185" font-family="monospace, sans-serif" font-size="16" font-weight="bold" fill="#1e3a8a" letter-spacing="3">0000 - 0000 - 0000 - 0000</text>
    <text x="640" y="185" font-family="sans-serif" font-size="10" fill="#64748b">www.topik.go.kr</text>
    
    <!-- Personal Details Table -->
    <rect x="50" y="220" width="700" height="180" fill="#ffffff" stroke="#334155" stroke-width="1.5"/>
    <line x1="50" y1="280" x2="750" y2="280" stroke="#cbd5e1" stroke-width="1"/>
    <line x1="50" y1="340" x2="750" y2="340" stroke="#cbd5e1" stroke-width="1"/>
    <line x1="200" y1="220" x2="200" y2="400" stroke="#cbd5e1" stroke-width="1"/>
    <line x1="500" y1="220" x2="500" y2="400" stroke="#cbd5e1" stroke-width="1"/>
    
    <text x="125" y="255" font-family="sans-serif" font-size="13" font-weight="bold" fill="#334155" text-anchor="middle">성명 (Name)</text>
    <text x="230" y="255" font-family="sans-serif" font-size="16" font-weight="bold" fill="#0f172a">0000 0000</text>
    <text x="560" y="255" font-family="sans-serif" font-size="13" font-weight="bold" fill="#334155" text-anchor="middle">생년월일 (DOB)</text>
    <text x="630" y="255" font-family="sans-serif" font-size="14" fill="#0f172a">0000. 00. 00</text>
    
    <text x="125" y="315" font-family="sans-serif" font-size="13" font-weight="bold" fill="#334155" text-anchor="middle">수험번호 (Reg. No.)</text>
    <text x="230" y="315" font-family="monospace, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">0000000000000</text>
    <text x="560" y="315" font-family="sans-serif" font-size="13" font-weight="bold" fill="#334155" text-anchor="middle">국적 (Nationality)</text>
    <text x="630" y="315" font-family="sans-serif" font-size="14" fill="#0f172a">Cambodia</text>
    
    <text x="125" y="375" font-family="sans-serif" font-size="13" font-weight="bold" fill="#334155" text-anchor="middle">시험일 (Test Date)</text>
    <text x="230" y="375" font-family="sans-serif" font-size="14" fill="#0f172a">0000. 00. 00 (제000회)</text>
    <text x="560" y="375" font-family="sans-serif" font-size="13" font-weight="bold" fill="#334155" text-anchor="middle">유효기간 (Valid Until)</text>
    <text x="630" y="375" font-family="sans-serif" font-size="14" font-weight="bold" fill="#dc2626">0000. 00. 00</text>
    
    <!-- Score Breakdown Table -->
    <rect x="50" y="440" width="700" height="240" fill="#ffffff" stroke="#334155" stroke-width="1.5"/>
    <line x1="50" y1="490" x2="750" y2="490" stroke="#334155" stroke-width="1.5"/>
    <line x1="50" y1="580" x2="750" y2="580" stroke="#cbd5e1" stroke-width="1"/>
    
    <line x1="220" y1="440" x2="220" y2="680" stroke="#334155" stroke-width="1"/>
    <line x1="390" y1="440" x2="390" y2="680" stroke="#334155" stroke-width="1"/>
    <line x1="560" y1="440" x2="560" y2="680" stroke="#334155" stroke-width="1"/>
    
    <text x="135" y="470" font-family="sans-serif" font-size="13" font-weight="bold" fill="#334155" text-anchor="middle">듣기 (Listening)</text>
    <text x="305" y="470" font-family="sans-serif" font-size="13" font-weight="bold" fill="#334155" text-anchor="middle">읽기 (Reading)</text>
    <text x="475" y="470" font-family="sans-serif" font-size="13" font-weight="bold" fill="#334155" text-anchor="middle">총점 (Total Score)</text>
    <text x="655" y="470" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e3a8a" text-anchor="middle">등급 (Pass Grade)</text>
    
    <text x="135" y="545" font-family="sans-serif" font-size="28" font-weight="bold" fill="#0f172a" text-anchor="middle">00</text>
    <text x="135" y="565" font-family="sans-serif" font-size="11" fill="#64748b" text-anchor="middle">/ 100</text>
    
    <text x="305" y="545" font-family="sans-serif" font-size="28" font-weight="bold" fill="#0f172a" text-anchor="middle">00</text>
    <text x="305" y="565" font-family="sans-serif" font-size="11" fill="#64748b" text-anchor="middle">/ 100</text>
    
    <text x="475" y="545" font-family="sans-serif" font-size="30" font-weight="bold" fill="#0f172a" text-anchor="middle">000</text>
    <text x="475" y="565" font-family="sans-serif" font-size="11" fill="#64748b" text-anchor="middle">/ 200</text>
    
    <!-- BIG GRADE BADGE -->
    <rect x="580" y="510" width="150" height="60" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
    <text x="655" y="552" font-family="'Noto Serif KR', serif" font-size="32" font-weight="bold" fill="#15803d" text-anchor="middle">0 급</text>
    <text x="655" y="625" font-family="sans-serif" font-size="12" font-weight="bold" fill="#059669" text-anchor="middle">TOPIK I 合格 (Pass)</text>
    <text x="655" y="650" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">사회통합 연계 대상</text>

    <!-- Stamp & Signature Block -->
    <text x="400" y="780" font-family="'Noto Serif KR', serif" font-size="15" fill="#334155" text-anchor="middle">위 사람은 국립국제교육원이 시행한 한국어능력시험에서</text>
    <text x="400" y="805" font-family="'Noto Serif KR', serif" font-size="15" fill="#334155" text-anchor="middle">위와 같은 성적을 취득하였음을 증명합니다.</text>
    <text x="400" y="860" font-family="sans-serif" font-size="16" font-weight="bold" fill="#0f172a" text-anchor="middle">0000년 00월 00일</text>
    
    <text x="400" y="930" font-family="'Noto Serif KR', serif" font-size="24" font-weight="bold" fill="#1e3a8a" text-anchor="middle" letter-spacing="4">국 립 국 제 교 육 원 장</text>
    <circle cx="580" cy="925" r="35" fill="none" stroke="#dc2626" stroke-width="3"/>
    <text x="580" y="922" font-family="'Noto Serif KR', serif" font-size="11" font-weight="bold" fill="#dc2626" text-anchor="middle">국립국제</text>
    <text x="580" y="936" font-family="'Noto Serif KR', serif" font-size="11" font-weight="bold" fill="#dc2626" text-anchor="middle">교육원장인</text>
    
    <text x="400" y="1020" font-family="sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">본 증명서는 인터넷으로 발급되었으며, 상단의 문서확인번호로 원본 여부를 확인할 수 있습니다.</text>
  </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Generates an SVG data URL representing a realistic Passport Information Page
export function generateSamplePassport(): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="800" height="1100">
    <rect width="800" height="1100" fill="#fdfcf7" stroke="#475569" stroke-width="4"/>
    
    <!-- Top ornamental border -->
    <rect x="25" y="25" width="750" height="1050" fill="none" stroke="#0284c7" stroke-width="2"/>
    <rect x="30" y="30" width="740" height="1040" fill="none" stroke="#93c5fd" stroke-dasharray="8 4"/>
    
    <!-- Kingdom Header -->
    <text x="400" y="80" font-family="'Noto Serif KR', serif, sans-serif" font-size="20" font-weight="bold" fill="#0f172a" text-anchor="middle" letter-spacing="2">KINGDOM OF CAMBODIA</text>
    <text x="400" y="105" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0369a1" text-anchor="middle" letter-spacing="1">ព្រះរាជាណាចក្រកម្ពុជា · PASSPORT</text>
    <text x="400" y="130" font-family="sans-serif" font-size="12" fill="#64748b" text-anchor="middle">여권 사본 (PASSPORT INFORMATION PAGE)</text>
    
    <!-- Photo & Stamp Area -->
    <rect x="60" y="170" width="220" height="290" rx="6" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>
    <circle cx="170" cy="270" r="55" fill="#475569"/>
    <path d="M 85 430 C 95 330, 245 330, 255 430 Z" fill="#475569"/>
    <text x="170" y="445" font-family="sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">0000 0000</text>

    <!-- Details Grid -->
    <g transform="translate(320, 180)" font-family="sans-serif">
      <text x="0" y="20" font-size="11" fill="#64748b">Type / ប្រភេទ / 종류</text>
      <text x="0" y="40" font-size="16" font-weight="bold" fill="#0f172a">P</text>
      
      <text x="160" y="20" font-size="11" fill="#64748b">Country Code / ប្រទេស / 국가코드</text>
      <text x="160" y="40" font-size="16" font-weight="bold" fill="#0f172a">KHM</text>

      <text x="0" y="80" font-size="11" fill="#64748b">Passport No. / លេខលិខិតឆ្លងដែន / 여권번호</text>
      <text x="0" y="105" font-size="20" font-weight="bold" fill="#0284c7" font-family="monospace">N01847291</text>

      <text x="0" y="145" font-size="11" fill="#64748b">Surname / គោត្តនាម / 성</text>
      <text x="0" y="170" font-size="18" font-weight="bold" fill="#0f172a">SOK</text>

      <text x="0" y="210" font-size="11" fill="#64748b">Given Names / នាម / 이름</text>
      <text x="0" y="235" font-size="18" font-weight="bold" fill="#0f172a">SRORNG</text>
      
      <text x="0" y="275" font-size="11" fill="#64748b">Nationality / សញ្ជាតិ / 국적</text>
      <text x="0" y="295" font-size="15" font-weight="bold" fill="#0f172a">CAMBODIAN</text>

      <text x="200" y="275" font-size="11" fill="#64748b">Sex / ភេទ / 성별</text>
      <text x="200" y="295" font-size="15" font-weight="bold" fill="#0f172a">M</text>
    </g>

    <g transform="translate(60, 490)" font-family="sans-serif">
      <text x="0" y="20" font-size="11" fill="#64748b">Date of Birth / ថ្ងៃខែឆ្នាំកំណើត / 생년월일</text>
      <text x="0" y="45" font-size="16" font-weight="bold" fill="#0f172a">10 SEP 1995</text>

      <text x="260" y="20" font-size="11" fill="#64748b">Place of Birth / ទីកន្លែងកំណើត / 출생지</text>
      <text x="260" y="45" font-size="16" font-weight="bold" fill="#0f172a">KAMPONG CHAM</text>

      <text x="520" y="20" font-size="11" fill="#64748b">Authority / អាជ្ញាធរចេញ / 발급기관</text>
      <text x="520" y="45" font-size="16" font-weight="bold" fill="#0f172a">MINISTRY OF INTERIOR</text>

      <text x="0" y="90" font-size="11" fill="#64748b">Date of Issue / ថ្ងៃចេញ / 발급일자</text>
      <text x="0" y="115" font-size="16" font-weight="bold" fill="#0f172a">16 AUG 2021</text>

      <text x="260" y="90" font-size="11" fill="#64748b">Date of Expiry / ថ្ងៃផុតកំណត់ / 만료일자</text>
      <text x="260" y="115" font-size="16" font-weight="bold" fill="#dc2626">15 AUG 2031</text>
    </g>

    <!-- Official Stamp -->
    <circle cx="680" cy="400" r="45" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-dasharray="4 2"/>
    <text x="680" y="395" font-family="sans-serif" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="middle">OFFICIAL</text>
    <text x="680" y="408" font-family="sans-serif" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="middle">PASSPORT</text>
    <text x="680" y="421" font-family="sans-serif" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="middle">SEAL</text>

    <!-- MRZ Machine Readable Zone -->
    <rect x="50" y="900" width="700" height="140" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5" rx="4"/>
    <text x="70" y="945" font-family="monospace" font-size="20" font-weight="bold" fill="#1e293b" letter-spacing="4">P&lt;KHMSOK&lt;&lt;SRORNG&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
    <text x="70" y="995" font-family="monospace" font-size="20" font-weight="bold" fill="#1e293b" letter-spacing="4">N018472918KHM9509105M3108154&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02</text>
  </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Generates an SVG data URL representing a realistic handwriting signature (transparent)
export function generateSampleSignature(): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 120" width="320" height="120">
    <path d="M 20 80 Q 45 20, 70 50 T 110 80 Q 140 25, 170 60 Q 190 90, 220 40 T 260 65 Q 285 45, 305 70" 
          stroke="#0f172a" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 40 95 Q 120 75, 290 85" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <text x="65" y="108" font-family="sans-serif" font-size="12" font-style="italic" fill="#0f172a">Signature</text>
  </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
