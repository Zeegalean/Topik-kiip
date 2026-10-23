import { ImmigrationOffice } from '../types';

export const IMMIGRATION_OFFICES: ImmigrationOffice[] = [
  {
    id: 'seoul',
    name: '서울출입국·외국인청',
    phone: '02-2650-6217',
    email: 'choi1994@korea.kr',
    address: '(08013) 서울특별시 양천구 목동동로 151, 3층',
    regionKeywords: [
      '양천구', '종로구', '중구', '용산구', '성동구', '광진구', '동대문구',
      '중랑구', '성북구', '강북구', '도봉구', '노원구', '은평구', '서대문구', '마포구'
    ],
  },
  {
    id: 'seoul-south',
    name: '서울남부출입국·외국인사무소',
    phone: '02-6980-4802',
    email: 'kiipseoulsouth@korea.kr',
    address: '(07799) 서울특별시 강서구 마곡서1로 48, 3층',
    regionKeywords: [
      '강서구', '구로구', '금천구', '영등포구', '동작구', '관악구', '서초구', '강남구', '송파구', '강동구'
    ],
  },
  {
    id: 'busan',
    name: '부산출입국·외국인청',
    phone: '051-461-3084',
    email: 'kiipbusan@korea.kr',
    address: '(48940) 부산광역시 중구 충장대로 22-1',
    regionKeywords: ['부산', '부산광역시', '해운대', '사하구', '사상구', '강서구(부산)'],
  },
  {
    id: 'incheon',
    name: '인천출입국·외국인청',
    phone: '032-890-6411',
    email: 'kiipincheon@korea.kr',
    address: '(22306) 인천광역시 중구 서해대로 393',
    regionKeywords: ['인천', '인천광역시', '부평', '계양', '남동구', '연수구', '미추홀', '서구(인천)', '부천'],
  },
  {
    id: 'suwon',
    name: '수원출입국·외국인청',
    phone: '031-695-3821',
    email: 'suwonimmigration@korea.kr',
    address: '(16705) 경기도 수원시 영통구 반달로 39',
    regionKeywords: [
      '수원', '화성', '용인', '평택', '오산', '안성', '이천', '여주', '광주(경기)', '성남', '안산', '시흥', '안양', '군포', '의왕', '과천'
    ],
  },
  {
    id: 'jeju',
    name: '제주출입국·외국인청',
    phone: '064-741-5446',
    email: 'jejuimmigration@korea.kr',
    address: '(63150) 제주특별자치도 제주시 용담로 3',
    regionKeywords: ['제주', '제주특별자치도', '제주시', '서귀포시'],
  },
  {
    id: 'daegu',
    name: '대구출입국·외국인사무소',
    phone: '053-980-3558',
    email: 'withappy@korea.kr',
    address: '(41143) 대구광역시 동구 동촌로 71 / (41069) 대구광역시 동구 이노밸리로 345',
    regionKeywords: ['대구', '대구광역시', '경북', '경상북도', '구미', '경산', '포항', '경주', '김천', '안동', '영주', '칠곡'],
  },
  {
    id: 'daejeon',
    name: '대전출입국·외국인사무소',
    phone: '042-220-2190',
    email: 'kiipdaejeon@korea.kr',
    address: '(34812) 대전광역시 중구 목중로 26번길 7',
    regionKeywords: [
      '대전', '대전광역시', '세종', '세종특별자치시', '충남', '충청남도',
      '서산', '천안', '아산', '당진', '공주', '보령', '논산', '계룡', '금산', '부여', '서천', '청양', '홍성', '예산', '태안'
    ],
  },
  {
    id: 'yeosu',
    name: '여수출입국·외국인사무소',
    phone: '061-689-5516',
    email: 'khj7645@korea.kr',
    address: '(59638) 전남 여수시 무선로 265',
    regionKeywords: ['여수', '순천', '광양', '고흥', '보성'],
  },
  {
    id: 'yangju',
    name: '양주출입국·외국인사무소',
    phone: '031-828-9487',
    email: 'kiipyangju@korea.kr',
    address: '(11443) 경기도 양주시 평화로1475번길 23, 3층',
    regionKeywords: [
      '양주', '고양', '파주', '의정부', '동두천', '포천', '연천', '남양주', '구리', '가평'
    ],
  },
  {
    id: 'ulsan',
    name: '울산출입국·외국인사무소',
    phone: '052-279-8026',
    email: 'ulsankiip@korea.kr',
    address: '(44691) 울산광역시 남구 돋질로 86(달동), 2층',
    regionKeywords: ['울산', '울산광역시', '울주군'],
  },
  {
    id: 'gwangju',
    name: '광주출입국·외국인사무소',
    phone: '062-605-5210',
    email: 'kiipgwangju@korea.kr',
    address: '(61969) 광주광역시 서구 상무대로 911번길 22',
    regionKeywords: [
      '광주', '광주광역시', '전남', '전라남도', '나주', '목포', '담양', '곡성', '구례', '화순', '장흥', '강진', '해남', '영암', '무안', '함평', '영광', '장성', '완도', '진도', '신안'
    ],
  },
  {
    id: 'changwon',
    name: '창원출입국·외국인사무소',
    phone: '055-981-6021',
    email: 'kiipchangwon@korea.kr',
    address: '(51716) 경남 창원시 마산합포구 제2부두로 30',
    regionKeywords: [
      '창원', '경남', '경상남도', '김해', '양산', '진주', '통영', '사천', '밀양', '거제', '의령', '함안', '창녕', '고성', '남해', '하동', '산청', '함양', '거창', '합천'
    ],
  },
  {
    id: 'chuncheon',
    name: '춘천출입국·외국인사무소',
    phone: '033-269-3215',
    email: 'kiipchuncheon@korea.kr',
    address: '(24408) 강원도 춘천시 동내면 사암길 12',
    regionKeywords: [
      '춘천', '강원', '강원도', '강원특별자치도', '원주', '강릉', '동해', '태백', '속초', '삼척', '홍천', '횡성', '영월', '평창', '정선', '철원', '화천', '양구', '인제', '고성', '양양'
    ],
  },
  {
    id: 'cheongju',
    name: '청주출입국·외국인사무소',
    phone: '043-235-4905',
    email: 'kiipcheongju@korea.kr',
    address: '(28365) 충북 청주시 흥덕구 비하로 12번길 52',
    regionKeywords: [
      '청주', '충북', '충청북도', '충주', '제천', '보은', '옥천', '영동', '증평', '진천', '괴산', '음성', '단양'
    ],
  },
  {
    id: 'jeonju',
    name: '전주출입국·외국인사무소',
    phone: '063-249-8603',
    email: 'kiipjeonju@korea.kr',
    address: '(54903) 전북 전주시 덕진구 동부대로 857',
    regionKeywords: [
      '전주', '전북', '전북특별자치도', '전라북도', '익산', '군산', '정읍', '남원', '김제', '완주', '진안', '무주', '장수', '임실', '순창', '고창', '부안'
    ],
  },
];

/**
 * Automatically determine the corresponding Immigration Office based on the Korean address string.
 */
export function findOfficeByAddress(address: string): ImmigrationOffice | null {
  if (!address || typeof address !== 'string') return null;
  const clean = address.trim().toLowerCase();

  // Specific high-priority matches first (e.g., Yeosu cities vs Gwangju)
  if (clean.includes('여수') || clean.includes('순천') || clean.includes('광양')) {
    return IMMIGRATION_OFFICES.find((o) => o.id === 'yeosu') || null;
  }

  // Northern Gyeonggi vs Southern Gyeonggi
  if (['양주', '고양', '파주', '의정부', '동두천', '포천', '연천', '남양주', '구리'].some(k => clean.includes(k))) {
    return IMMIGRATION_OFFICES.find((o) => o.id === 'yangju') || null;
  }

  // Seoul South vs Seoul Main
  if (['강서', '마곡', '구로', '금천', '영등포', '동작', '관악', '서초', '강남', '송파', '강동'].some(k => clean.includes(k))) {
    return IMMIGRATION_OFFICES.find((o) => o.id === 'seoul-south') || null;
  }

  // General keyword scan across all offices
  for (const office of IMMIGRATION_OFFICES) {
    for (const kw of office.regionKeywords) {
      if (clean.includes(kw.toLowerCase())) {
        return office;
      }
    }
  }

  return null;
}
