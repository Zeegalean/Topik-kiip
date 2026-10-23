import { Language } from '../types';

export interface LanguageItem {
  code: Language;
  name: string;
  englishName: string;
  flag: string;
  region: string;
}

export const SUPPORTED_LANGUAGES: LanguageItem[] = [
  // Southeast Asia (អាស៊ីអាគ្នេយ៍ / 동남아시아 - Major E-9 & Foreign Resident Countries)
  { code: 'km', name: 'ភាសាខ្មែរ', englishName: 'Khmer (Cambodia)', flag: '🇰🇭', region: 'Southeast Asia' },
  { code: 'vi', name: 'Tiếng Việt', englishName: 'Vietnamese (Vietnam)', flag: '🇻🇳', region: 'Southeast Asia' },
  { code: 'id', name: 'Bahasa Indonesia', englishName: 'Indonesian (Indonesia)', flag: '🇮🇩', region: 'Southeast Asia' },
  { code: 'th', name: 'ภาษาไทย', englishName: 'Thai (Thailand)', flag: '🇹🇭', region: 'Southeast Asia' },
  { code: 'my', name: 'မြန်မာဘာသာ', englishName: 'Burmese (Myanmar)', flag: '🇲🇲', region: 'Southeast Asia' },
  { code: 'tl', name: 'Tagalog (Filipino)', englishName: 'Filipino (Philippines)', flag: '🇵🇭', region: 'Southeast Asia' },
  { code: 'lo', name: 'ພາສາລາວ', englishName: 'Lao (Laos)', flag: '🇱🇦', region: 'Southeast Asia' },
  { code: 'ms', name: 'Bahasa Melayu', englishName: 'Malay (Malaysia)', flag: '🇲🇾', region: 'Southeast Asia' },

  // East Asia (អាស៊ីបូព៌ា / 동아시아)
  { code: 'ko', name: '한국어', englishName: 'Korean (South Korea)', flag: '🇰🇷', region: 'East Asia' },
  { code: 'zh', name: '简体中文', englishName: 'Chinese (China)', flag: '🇨🇳', region: 'East Asia' },
  { code: 'ja', name: '日本語', englishName: 'Japanese (Japan)', flag: '🇯🇵', region: 'East Asia' },
  { code: 'mn', name: 'Монгол хэл', englishName: 'Mongolian (Mongolia)', flag: '🇲🇳', region: 'East Asia' },

  // South Asia (អាស៊ីខាងត្បូង / 서남아시아)
  { code: 'ne', name: 'नेपाली', englishName: 'Nepali (Nepal)', flag: '🇳🇵', region: 'South Asia' },
  { code: 'si', name: 'සිංහල', englishName: 'Sinhala (Sri Lanka)', flag: '🇱🇰', region: 'South Asia' },
  { code: 'bn', name: 'বাংলা', englishName: 'Bengali (Bangladesh)', flag: '🇧🇩', region: 'South Asia' },
  { code: 'hi', name: 'हिन्दी', englishName: 'Hindi (India)', flag: '🇮🇳', region: 'South Asia' },
  { code: 'ur', name: 'اردو', englishName: 'Urdu (Pakistan)', flag: '🇵🇰', region: 'South Asia' },
  { code: 'ta', name: 'தமிழ்', englishName: 'Tamil (India/Sri Lanka)', flag: '🇮🇳', region: 'South Asia' },
  { code: 'te', name: 'తెలుగు', englishName: 'Telugu (India)', flag: '🇮🇳', region: 'South Asia' },
  { code: 'mr', name: 'मराठी', englishName: 'Marathi (India)', flag: '🇮🇳', region: 'South Asia' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', englishName: 'Punjabi (India/Pakistan)', flag: '🇮🇳', region: 'South Asia' },

  // Central Asia & CIS (អាស៊ីកណ្តាល & CIS / 중앙아시아·독립국가연합)
  { code: 'uz', name: 'Oʻzbekcha', englishName: 'Uzbek (Uzbekistan)', flag: '🇺🇿', region: 'Central Asia & CIS' },
  { code: 'ru', name: 'Русский', englishName: 'Russian (Russia/CIS)', flag: '🇷🇺', region: 'Central Asia & CIS' },
  { code: 'kk', name: 'Қазақша', englishName: 'Kazakh (Kazakhstan)', flag: '🇰🇿', region: 'Central Asia & CIS' },
  { code: 'tg', name: 'Тоҷикӣ', englishName: 'Tajik (Tajikistan)', flag: '🇹🇯', region: 'Central Asia & CIS' },
  { code: 'ky', name: 'Кыргызча', englishName: 'Kyrgyz (Kyrgyzstan)', flag: '🇰🇬', region: 'Central Asia & CIS' },
  { code: 'az', name: 'Azərbaycan', englishName: 'Azerbaijani (Azerbaijan)', flag: '🇦🇿', region: 'Central Asia & CIS' },
  { code: 'ka', name: 'ქართული', englishName: 'Georgian (Georgia)', flag: '🇬🇪', region: 'Central Asia & CIS' },

  // Middle East (មជ្ឈិមបូព៌ា / 중동)
  { code: 'ar', name: 'العربية', englishName: 'Arabic (Arab Countries)', flag: '🇸🇦', region: 'Middle East' },
  { code: 'fa', name: 'فارسی', englishName: 'Persian / Farsi (Iran)', flag: '🇮🇷', region: 'Middle East' },
  { code: 'tr', name: 'Türkçe', englishName: 'Turkish (Turkey)', flag: '🇹🇷', region: 'Middle East' },
  { code: 'ps', name: 'پښتو', englishName: 'Pashto (Afghanistan)', flag: '🇦🇫', region: 'Middle East' },
  { code: 'he', name: 'עברית', englishName: 'Hebrew (Israel)', flag: '🇮🇱', region: 'Middle East' },

  // Europe & Americas (អឺរ៉ុប & អាមេរិក / 유럽·아메리카)
  { code: 'en', name: 'English', englishName: 'English (International)', flag: '🇺🇸', region: 'Europe & Americas' },
  { code: 'es', name: 'Español', englishName: 'Spanish (Spain/Latin America)', flag: '🇪🇸', region: 'Europe & Americas' },
  { code: 'fr', name: 'Français', englishName: 'French (France)', flag: '🇫🇷', region: 'Europe & Americas' },
  { code: 'de', name: 'Deutsch', englishName: 'German (Germany)', flag: '🇩🇪', region: 'Europe & Americas' },
  { code: 'pt', name: 'Português', englishName: 'Portuguese (Brazil/Portugal)', flag: '🇧🇷', region: 'Europe & Americas' },
  { code: 'it', name: 'Italiano', englishName: 'Italian (Italy)', flag: '🇮🇹', region: 'Europe & Americas' },
  { code: 'nl', name: 'Nederlands', englishName: 'Dutch (Netherlands)', flag: '🇳🇱', region: 'Europe & Americas' },
  { code: 'uk', name: 'Українська', englishName: 'Ukrainian (Ukraine)', flag: '🇺🇦', region: 'Europe & Americas' },
  { code: 'pl', name: 'Polski', englishName: 'Polish (Poland)', flag: '🇵🇱', region: 'Europe & Americas' },
  { code: 'ro', name: 'Română', englishName: 'Romanian (Romania)', flag: '🇷🇴', region: 'Europe & Americas' },
  { code: 'cs', name: 'Čeština', englishName: 'Czech (Czechia)', flag: '🇨🇿', region: 'Europe & Americas' },
  { code: 'hu', name: 'Magyar', englishName: 'Hungarian (Hungary)', flag: '🇭🇺', region: 'Europe & Americas' },
  { code: 'sv', name: 'Svenska', englishName: 'Swedish (Sweden)', flag: '🇸🇪', region: 'Europe & Americas' },
  { code: 'el', name: 'Ελληνικά', englishName: 'Greek (Greece)', flag: '🇬🇷', region: 'Europe & Americas' },

  // Africa (ទ្វីបអាហ្វ្រិក / 아프리카)
  { code: 'sw', name: 'Kiswahili', englishName: 'Swahili (Kenya/Tanzania)', flag: '🇰🇪', region: 'Africa' },
  { code: 'am', name: 'አማርኛ', englishName: 'Amharic (Ethiopia)', flag: '🇪🇹', region: 'Africa' },
  { code: 'ha', name: 'Hausa', englishName: 'Hausa (Nigeria)', flag: '🇳🇬', region: 'Africa' },
];

export const LANGUAGE_REGIONS = [
  'All',
  'Southeast Asia',
  'East Asia',
  'South Asia',
  'Central Asia & CIS',
  'Middle East',
  'Europe & Americas',
  'Africa',
];

export function getLanguageInfo(lang: Language): LanguageItem {
  const found = SUPPORTED_LANGUAGES.find((item) => item.code === lang);
  return (
    found || {
      code: 'km',
      name: 'ភាសាខ្មែរ',
      englishName: 'Khmer (Cambodia)',
      flag: '🇰🇭',
      region: 'Southeast Asia',
    }
  );
}
