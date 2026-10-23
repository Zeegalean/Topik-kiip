import React from 'react';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';
import { 
  GraduationCap, 
  Award, 
  BookCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Globe, 
  FileCheck2, 
  ExternalLink,
  ChevronRight,
  Flame,
  Star,
  Check
} from 'lucide-react';

interface TopikKiipGuideProps {
  lang: Language;
  onStartApplication: () => void;
}

export const TopikKiipGuide: React.FC<TopikKiipGuideProps> = ({
  lang,
  onStartApplication,
}) => {
  const t = getTranslation(lang);

  const conversionTable = [
    {
      topikKm: 'TOPIK កម្រិត ១ (1급)',
      topikKo: 'TOPIK 1급',
      topikEn: 'TOPIK Level 1',
      scoreKm: '៨០ ~ ១៣៩ ពិន្ទុ',
      scoreKo: '80점 ~ 139점',
      scoreEn: '80 ~ 139 pts',
      typeKm: 'TOPIK I (ស្តាប់ + អាន)',
      typeKo: 'TOPIK I',
      typeEn: 'TOPIK I',
      kiipKm: 'KIIP កម្រិត ២ (បឋម ២ / 초급 2)',
      kiipKo: 'KIIP 2단계 (초급 2)',
      kiipEn: 'KIIP Stage 2 (Beginner 2)',
      hoursKm: '១០០ ម៉ោង',
      hoursKo: '100시간',
      hoursEn: '100 hours',
      benefitKm: 'រំលងកម្រិតទី១ (1단계 면제) និងការប្រឡងវាស់កម្រិត (사전평가)',
      benefitKo: '1단계(초급1) 및 사전평가 면제',
      benefitEn: 'Skip Level 1 and pre-evaluation exam',
      badge: 'bg-slate-100 text-slate-700',
    },
    {
      topikKm: 'TOPIK កម្រិត ២ (2급)',
      topikKo: 'TOPIK 2급',
      topikEn: 'TOPIK Level 2',
      scoreKm: '១៤០ ~ ២០០ ពិន្ទុ',
      scoreKo: '140점 ~ 200점',
      scoreEn: '140 ~ 200 pts',
      typeKm: 'TOPIK I (ស្តាប់ + អាន)',
      typeKo: 'TOPIK I',
      typeEn: 'TOPIK I',
      kiipKm: 'KIIP កម្រិត ៣ (មធ្យម ១ / 중급 1)',
      kiipKo: 'KIIP 3단계 (중급 1)',
      kiipEn: 'KIIP Stage 3 (Intermediate 1)',
      hoursKm: '១០០ ម៉ោង',
      hoursKo: '100시간',
      hoursEn: '100 hours',
      benefitKm: 'សន្សំពេល ២០០ម៉ោងសិក្សា! រៀនត្រឹម 중급 1 រំលងការប្រឡងវាស់កម្រិតទាំងស្រុង',
      benefitKo: '1·2단계 사전평가 완전 면제, 200시간 단축',
      benefitEn: 'Skip pre-test & Levels 1-2, save 200 study hours',
      badge: 'bg-emerald-100 text-emerald-800 font-bold',
      highlight: true,
    },
    {
      topikKm: 'TOPIK កម្រិត ៣ (3급)',
      topikKo: 'TOPIK 3급',
      topikEn: 'TOPIK Level 3',
      scoreKm: '១២០ ~ ១៤៩ ពិន្ទុ',
      scoreKo: '120점 ~ 149점',
      scoreEn: '120 ~ 149 pts',
      typeKm: 'TOPIK II (ស្តាប់ + អាន + សរសេរ)',
      typeKo: 'TOPIK II',
      typeEn: 'TOPIK II',
      kiipKm: 'KIIP កម្រិត ៤ (មធ្យម ២ / 중급 2)',
      kiipKo: 'KIIP 4단계 (중급 2)',
      kiipEn: 'KIIP Stage 4 (Intermediate 2)',
      hoursKm: '១០០ ម៉ោង',
      hoursKo: '100시간',
      hoursEn: '100 hours',
      benefitKm: 'មានសិទ្ធិចូលរៀនកម្រិត 4단계 ភ្លាមៗ (ត្រៀមចូល 5단계 ដើម្បីយកពិន្ទុវីសា E-7-4)',
      benefitKo: '사전평가 고득점(61~80점)과 동일 효력',
      benefitEn: 'Direct entry into KIIP Stage 4 (Intermediate 2)',
      badge: 'bg-blue-100 text-blue-800 font-bold',
    },
    {
      topikKm: 'TOPIK កម្រិត ៤ (4급)',
      topikKo: 'TOPIK 4급',
      topikEn: 'TOPIK Level 4',
      scoreKm: '១៥០ ~ ១៨៩ ពិន្ទុ',
      scoreKo: '150점 ~ 189점',
      scoreEn: '150 ~ 189 pts',
      typeKm: 'TOPIK II (ស្តាប់ + អាន + សរសេរ)',
      typeKo: 'TOPIK II',
      typeEn: 'TOPIK II',
      kiipKm: 'KIIP កម្រិត ៥ (វគ្គមូលដ្ឋាន / 기본과정)',
      kiipKo: 'KIIP 5단계 (기본과정)',
      kiipEn: 'KIIP Stage 5 (Basic Course)',
      hoursKm: '៥០ ម៉ោង',
      hoursKo: '50시간',
      hoursEn: '50 hours',
      benefitKm: 'ទទួលបានពិន្ទុអតិបរមាសម្រាប់ប្តូរវីសា E-7-4 (១៥ ដល់ ២០ ពិន្ទុបន្ថែម!)',
      benefitKo: 'E-7-4 비자 전환 가점 15~20점 최대 부여',
      benefitEn: 'Maximum bonus points (15~20 pts) for E-7-4 skilled visa',
      badge: 'bg-purple-100 text-purple-800 font-bold',
      superHighlight: true,
    },
    {
      topikKm: 'TOPIK កម្រិត ៥ · ៦ (5·6급)',
      topikKo: 'TOPIK 5급 · 6급',
      topikEn: 'TOPIK Level 5 · 6',
      scoreKm: '១៩០ ~ ៣០០ ពិន្ទុ',
      scoreKo: '190점 ~ 300점',
      scoreEn: '190 ~ 300 pts',
      typeKm: 'TOPIK II (ស្តាប់ + អាន + សរសេរ)',
      typeKo: 'TOPIK II',
      typeEn: 'TOPIK II',
      kiipKm: 'KIIP កម្រិត ៥ (វគ្គស៊ីជម្រៅ / 심화과정)',
      kiipKo: 'KIIP 5단계 (심화과정)',
      kiipEn: 'KIIP Stage 5 (Advanced Course)',
      hoursKm: '២០ ម៉ោង',
      hoursKo: '20시간',
      hoursEn: '20 hours',
      benefitKm: 'លក្ខខណ្ឌល្អបំផុតសម្រាប់សុំសញ្ជាតិ និងវីសាស្នាក់នៅអចិន្ត្រៃយ៍ F-5 (영주권) ឬ F-2',
      benefitKo: '영주(F-5) 및 국적취득 종합평가 면제 또는 최고 가점',
      benefitEn: 'Highest qualification for F-5 permanent residency or naturalization',
      badge: 'bg-amber-100 text-amber-900 font-bold',
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-indigo-800/40">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-4 right-6 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold text-amber-300">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>
            {lang === 'km' 
              ? 'E-9 → E-7-4 យុទ្ធសាស្ត្រចាំបាច់សម្រាប់ពលករជំនាញ' 
              : lang === 'ko' 
              ? 'E-9 → E-7-4 숙련기능인력 필수 전략' 
              : 'E-9 → E-7-4 Skilled Worker Strategy'}
          </span>
        </div>

        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-xs font-bold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>
              {lang === 'km'
                ? 'គាំទ្រពេញលេញតាមសេចក្តីណែនាំប្រតិបត្តិ KIIP [ទម្រង់បែបបទលេខ ១]'
                : lang === 'ko'
                ? '사회통합프로그램 운영지침 [서식 제1호] 완벽 지원'
                : 'KIIP Operational Guidelines [Form No. 1] Fully Supported'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {t.guideTitle}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {t.guideSubtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartApplication}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-teal-900/30 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>{lang === 'km' ? 'ចាប់ផ្តើមបំពេញពាក្យសុំ (1-Click)' : lang === 'ko' ? '원클릭 신청서 작성 시작' : 'Start 1-Click Application'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="https://www.socinet.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{lang === 'km' ? 'គេហទំព័រផ្លូវការ Socinet' : lang === 'ko' ? '공식 Socinet 바로가기' : 'Official Socinet'}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
            </a>
          </div>
        </div>
      </div>

      {/* Why TOPIK to KIIP matters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-2">
            {lang === 'km' 
              ? 'រំលងការប្រឡងវាស់កម្រិត (사전평가 면제)' 
              : lang === 'ko' 
              ? '사전평가 시험 면제' 
              : 'Pre-evaluation Exam Exemption'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {lang === 'km'
              ? 'ការប្រឡងវាស់កម្រិត (사전평가) នៅ Socinet ពិបាកដណ្តើមទីតាំង និងត្រូវចំណាយពេលរង់ចាំរាប់ខែ។ ប្រសិនបើអ្នកមាន TOPIK អ្នកអាចដាក់ពាក្យប្តូរកម្រិតចូល KIIP ភ្លាមៗដោយមិនបាច់ប្រឡងវាស់កម្រិតឡើយ!'
              : lang === 'ko'
              ? '사회통합정보망 사전평가는 접수 경쟁이 치열하고 수개월을 대기해야 합니다. TOPIK 성적증명서가 있다면 사전평가 없이 곧바로 해당 단계로 연계 등록됩니다.'
              : 'Socinet pre-evaluation tests are notoriously hard to book with long waits. Holding a valid TOPIK certificate lets you skip pre-evaluation and enter KIIP directly!'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-2">
            {lang === 'km' 
              ? 'បង្កើនពិន្ទុប្តូរវីសា E-7-4 (가점 취득)' 
              : lang === 'ko' 
              ? 'E-7-4 비자 전환 가점 취득' 
              : 'Maximum Points for E-7-4 Visa'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {lang === 'km'
              ? 'ពិន្ទុភាសាកូរ៉េគឺជាចំណុចកាត់សេចក្តីធំបំផុតក្នុងប្រព័ន្ធពិន្ទុ K-point E-7-4។ ការបញ្ចប់ KIIP កម្រិត ៤ ឬ ៥ ផ្តល់ពិន្ទុបន្ថែមពី ១៥ ដល់ ២៥ពិន្ទុ ជួយឱ្យអ្នកប្តូរវីសា E-7-4 បានយ៉ាងរលូន។'
              : lang === 'ko'
              ? '한국어 능력은 E-7-4 비자 심사 점수표(K-point)에서 가장 큰 비중을 차지합니다. KIIP 4단계 또는 5단계를 이수하면 15~25점의 높은 가점을 확보할 수 있습니다.'
              : 'Korean proficiency carries the heaviest weight in the E-7-4 points matrix. Completing KIIP Stage 4 or 5 grants 15 to 25 crucial bonus points!'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-2">
            {lang === 'km' 
              ? 'ផ្លូវឆ្ពោះទៅកាន់សញ្ជាតិ និងវីសា F-2 / F-5' 
              : lang === 'ko' 
              ? '영주(F-5) 및 국적 취득의 필수 코스' 
              : 'Pathway to F-2 / F-5 & Citizenship'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {lang === 'km'
              ? 'ការបញ្ចប់ KIIP កម្រិត ៥ គឺជាលក្ខខណ្ឌចាំបាច់ដើម្បីសុំវីសាស្នាក់នៅរយៈពេលវែង F-2-R, F-2-7 និងវីសាអចិន្ត្រៃយ៍ F-5 (영주권) ឬការចូលសញ្ជាតិកូរ៉េដោយរួចផុតពីការប្រឡងសំណេរ។'
              : lang === 'ko'
              ? 'KIIP 5단계 수료는 거주비자(F-2), 영주권(F-5) 신청 및 귀화(국적취득) 필기시험 면제를 위한 법정 필수 요건입니다.'
              : 'Completing KIIP Level 5 is mandatory for F-2 resident visa, F-5 permanent residency, and Korean citizenship written test exemption.'}
          </p>
        </div>
      </div>

      {/* Conversion Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              {lang === 'km' 
                ? 'គោលការណ៍ណែនាំផ្លូវការពីក្រសួងយុត្តិធម៌កូរ៉េ (법무부)' 
                : lang === 'ko' 
                ? '법무부 출입국·외국인정책본부 공식 기준' 
                : 'Official Ministry of Justice Guidelines'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {t.kiipTableTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {lang === 'km'
              ? 'យោងតាមសេចក្តីណែនាំប្រតិបត្តិកម្មវិធីសមាហរណកម្មសង្គម ឆ្នាំ២០១៩ [ទម្រង់បែបបទលេខ ១]'
              : lang === 'ko'
              ? '2019년 사회통합프로그램 운영지침 [서식 제1호] 기준'
              : 'According to 2019 KIIP Operational Guidelines [Form No. 1]'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-xs font-bold text-slate-700">
                <th className="py-4 px-6">{t.topikLevel}</th>
                <th className="py-4 px-4">{lang === 'km' ? 'ពិន្ទុប្រឡង (점수)' : lang === 'ko' ? '취득 점수' : 'Score'}</th>
                <th className="py-4 px-6">{t.kiipStage}</th>
                <th className="py-4 px-4">{t.classHours}</th>
                <th className="py-4 px-6">{t.benefits}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {conversionTable.map((row, idx) => (
                <tr 
                  key={idx}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    row.superHighlight 
                      ? 'bg-purple-50/40 font-medium' 
                      : row.highlight 
                      ? 'bg-emerald-50/30' 
                      : ''
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${row.badge}`}>
                        {lang === 'km' ? row.topikKm : lang === 'ko' ? row.topikKo : row.topikEn}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({lang === 'km' ? row.typeKm : lang === 'ko' ? row.typeKo : row.typeEn})
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs font-semibold text-slate-600">
                    {lang === 'km' ? row.scoreKm : lang === 'ko' ? row.scoreKo : row.scoreEn}
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-900">
                    {lang === 'km' ? row.kiipKm : lang === 'ko' ? row.kiipKo : row.kiipEn}
                  </td>
                  <td className="py-4 px-4 text-xs font-semibold text-slate-600">
                    {lang === 'km' ? row.hoursKm : lang === 'ko' ? row.hoursKo : row.hoursEn}
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-700">
                    {lang === 'km' ? row.benefitKm : (lang === 'ko' ? row.benefitKo : (row.benefitEn || row.benefitKo))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* How to study TOPIK effectively */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-lg">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3">
          <BookCheck className="w-6 h-6 text-amber-400" />
          <span>
            {lang === 'km' 
              ? 'គន្លឹះរៀនភាសាកូរ៉េ TOPIK ឱ្យជាប់កម្រិតខ្ពស់សម្រាប់បងប្អូនពលករ' 
              : lang === 'ko' 
              ? '외국인 근로자를 위한 TOPIK 고득점 합격 전략' 
              : 'Essential TOPIK High-Score Strategy for Workers'}
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </div>
              <div>
                <h4 className="font-bold text-sm text-blue-200">
                  {lang === 'km'
                    ? 'ផ្តោតលើ TOPIK I (ស្តាប់ + អាន) យកកម្រិត ២ (2급) ជាជំហានដំបូង'
                    : lang === 'ko'
                    ? '1단계 목표: TOPIK I (듣기+읽기) 2급 우선 공략'
                    : 'Target TOPIK I (Listening + Reading) Level 2 First'}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {lang === 'km'
                    ? 'TOPIK I មិនមានវិញ្ញាសាសរសេរ (쓰기) ទេ មានតែស្តាប់ (듣기) និងអាន (읽기) សរុប ២០០ពិន្ទុ។ យកត្រឹម ១៤០ពិន្ទុ អ្នកនឹងទទួលបានកម្រិត ២ (2급) ដែលអាចរំលងចូលរៀន KIIP កម្រិត ៣ (중급 1) បានភ្លាមៗ!'
                    : lang === 'ko'
                    ? 'TOPIK I은 쓰기 영역 없이 듣기·읽기 총 200점 만점입니다. 140점만 획득하면 2급을 취득하여 KIIP 3단계로 바로 진입할 수 있습니다.'
                    : 'TOPIK I has no writing exam—only listening and reading (200 pts total). Scoring 140+ gives Level 2, allowing direct entry into KIIP Stage 3!'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </div>
              <div>
                <h4 className="font-bold text-sm text-blue-200">
                  {lang === 'km'
                    ? 'ទាញយកវិញ្ញាសាចាស់ៗ (기출문제) មកអនុវត្តធ្វើតេស្ត'
                    : lang === 'ko'
                    ? '기출문제(과년도 시험지) 반복 풀이 및 오답 정리'
                    : 'Practice Real Past Exam Papers (기출문제)'}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {lang === 'km'
                    ? 'ទាញយកវិញ្ញាសា TOPIK ពីលើកទី ៦០ ដល់លើកចុងក្រោយមកធ្វើសាកល្បង និងកំណត់ម៉ោងពិតប្រាកដ។ ពាក្យគន្លឹះ និងវេយ្យាករណ៍តែងតែចេញដដែលៗរហូតដល់ ៧០%។'
                    : lang === 'ko'
                    ? '역대 기출문제를 실제 시험 시간과 동일하게 풀어보세요. 어휘와 문법 패턴의 약 70%가 반복 출제됩니다.'
                    : 'Solve past papers under real timed conditions. Core vocabulary and grammar patterns repeat in up to 70% of exams.'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </div>
              <div>
                <h4 className="font-bold text-sm text-amber-200">
                  {lang === 'km'
                    ? 'ទន្ទេញពាក្យក្នុងរោងចក្រ និងជីវភាពរស់នៅប្រចាំថ្ងៃ'
                    : lang === 'ko'
                    ? '직장 현장 실무 및 일상 생활 어휘 집중 암기'
                    : 'Memorize Workplace & Daily Practical Vocabulary'}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {lang === 'km'
                    ? 'រៀនពាក្យគន្លឹះទាក់ទងនឹងការងារ សុវត្ថិភាព ធានារ៉ាប់រង និងការរស់នៅកូរ៉េ។ ការយល់ពាក្យកម្រិតមធ្យមត្រឹម ១,៥០០ ទៅ ២,០០០ពាក្យ ធានាថានឹងប្រឡងជាប់ TOPIK កម្រិត ២ ឬ ៣ ដោយជោគជ័យ។'
                    : lang === 'ko'
                    ? '작업장 안전, 산업재해, 보험, 병원 등 실생활 어휘 1,500~2,000단어를 숙지하면 2급 및 3급 취득이 훨씬 수월해집니다.'
                    : 'Focus on safety, insurance, hospital, and daily living words. Mastering 1,500-2,000 words ensures passing TOPIK Level 2 or 3.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">
                4
              </div>
              <div>
                <h4 className="font-bold text-sm text-amber-200">
                  {lang === 'km'
                    ? 'ពិនិត្យសុពលភាពសញ្ញាបត្រ (សុពលភាព ២ឆ្នាំ / 유효기간 2년)'
                    : lang === 'ko'
                    ? '성적 유효기간(2년) 이내 신속한 KIIP 연계 신청'
                    : 'Verify 2-Year Validity Period for TOPIK'}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {lang === 'km'
                    ? 'សញ្ញាបត្រ TOPIK មានសុពលភាពត្រឹមតែ ២ឆ្នាំប៉ុណ្ណោះ។ ដូច្នេះពេលទទួលបានលទ្ធផលភ្លាម ត្រូវប្រើប្រព័ន្ធនេះដើម្បីដាក់ពាក្យតភ្ជាប់ចូល KIIP ភ្លាម ព្រោះកម្រិត KIIP គ្មានថ្ងៃផុតកំណត់ឡើយ!'
                    : lang === 'ko'
                    ? 'TOPIK 성적표는 발급일로부터 2년 동안만 유효합니다. 만료 전 본 포털을 통해 KIIP 단계로 연계 등록해 두면 KIIP 단계는 영구 인정됩니다.'
                    : 'TOPIK certificates expire after 2 years. Link it to KIIP immediately using this app so your KIIP qualification remains valid permanently!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Socinet registration steps */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Globe className="w-6 h-6 text-indigo-600" />
          <span>{t.socinetGuideTitle}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-700 uppercase">
                {lang === 'km' ? 'ជំហានទី ១' : lang === 'ko' ? '1단계' : 'Step 1'}
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-1">
                {lang === 'km' ? 'ចុះឈ្មោះគណនី Socinet' : lang === 'ko' ? '회원가입' : 'Register Account'}
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {lang === 'km'
                  ? 'ចូលទៅកាន់គេហទំព័រ www.socinet.go.kr ចុចលើពាក្យចុះឈ្មោះសមាជិក (회원가입) ហើយជ្រើសរើសប្រភេទគណនីជនបរទេស។'
                  : lang === 'ko'
                  ? '사회통합정보망 (www.socinet.go.kr)에 접속하여 외국인 회원으로 가입합니다.'
                  : 'Visit www.socinet.go.kr, click Sign Up (회원가입), and select Foreign Resident.'}
              </p>
            </div>
            <div className="mt-4 text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
              <span>{lang === 'km' ? 'គេហទំព័រ៖ www.socinet.go.kr' : 'www.socinet.go.kr'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase">
                {lang === 'km' ? 'ជំហានទី ២' : lang === 'ko' ? '2단계' : 'Step 2'}
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-1">
                {lang === 'km' ? 'ផ្ទៀងផ្ទាត់ឈ្មោះ និង ARC' : lang === 'ko' ? '실명인증' : 'Verify Name & ARC'}
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {lang === 'km'
                  ? 'វាយបញ្ចូលលេខកាត ARC ១៣ខ្ទង់ និងឈ្មោះពេញជាអក្សរឡាតាំងធំៗឱ្យដូចបេះបិទក្នុងកាត ១០០%។'
                  : lang === 'ko'
                  ? '외국인등록번호 13자리와 외국인등록증에 기재된 영문 성명을 대문자로 일치시켜 실명인증을 완료합니다.'
                  : 'Enter your 13-digit ARC number and uppercase English name exactly as shown on your card.'}
              </p>
            </div>
            <div className="mt-4 text-[11px] font-semibold text-blue-600 flex items-center gap-1">
              <span>{lang === 'km' ? 'ផ្ទៀងផ្ទាត់ឈ្មោះពិតប្រាកដ (실명인증)' : '실명인증 완료'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase">
                {lang === 'km' ? 'ជំហានទី ៣' : lang === 'ko' ? '3단계' : 'Step 3'}
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-1">
                {lang === 'km' ? 'ស្នើសុំតភ្ជាប់ពាក្យ KIIP' : lang === 'ko' ? '연계신청' : 'Apply for KIIP Link'}
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {lang === 'km'
                  ? 'ចូលទៅកាន់មឺនុយ "ស្នើសុំវគ្គសិក្សា" (과정신청) → "ស្នើសុំតភ្ជាប់" (연계신청 / 한국어능력시험 TOPIK 연계) ហើយកត់ចំណាំ ID និង Password ទុក។'
                  : lang === 'ko'
                  ? '과정신청 메뉴에서 [한국어능력시험(TOPIK) 연계신청]을 클릭하고 로그인 ID/비밀번호를 확인해 둡니다.'
                  : 'Go to Course Application → Select TOPIK Linkage (연계신청) and keep note of your Socinet ID & Password.'}
              </p>
            </div>
            <div className="mt-4 text-[11px] font-semibold text-teal-600 flex items-center gap-1">
              <span>{lang === 'km' ? 'ស្នើសុំតភ្ជាប់ TOPIK (TOPIK 연계)' : 'TOPIK 연계 신청'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase">
                {lang === 'km' ? 'ជំហានទី ៤' : lang === 'ko' ? '4단계' : 'Step 4'}
              </span>
              <h4 className="font-bold text-slate-900 text-sm mt-1">
                {lang === 'km' ? 'ផ្ញើ PDF តាម Email' : lang === 'ko' ? '전자메일 제출' : 'Submit Merged PDF'}
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {lang === 'km'
                  ? 'ប្រើប្រាស់កម្មវិធីនេះដើម្បីទាញយកកញ្ចប់ PDF Merge ផ្លូវការ រួចចុចផ្ញើ Email ទៅកាន់ការិយាល័យអន្តោប្រវេសន៍ដោយ 1-Click!'
                  : lang === 'ko'
                  ? '본 사이트에서 병합된 통합 PDF를 내려받고, 안내된 관할 출입국 이메일로 1-클릭 발송합니다.'
                  : 'Download the official merged PDF from this portal and send it directly to your immigration center.'}
              </p>
            </div>
            <div className="mt-4 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <span>{lang === 'km' ? 'ផ្ញើ Email ភ្លាមៗ (1-Click Email)' : '1-Click Email Send'}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onStartApplication}
            className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            {lang === 'km' 
              ? 'ចូលទៅកាន់ទម្រង់ស្នើសុំ ជំហានទី ១ ឥឡូវនេះ →' 
              : lang === 'ko' 
              ? '신청서 작성 1단계로 이동하기 →' 
              : 'Go to Step 1 Application Now →'}
          </button>
        </div>
      </div>
    </div>
  );
};
