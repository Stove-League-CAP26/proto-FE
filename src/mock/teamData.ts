/**
 * src/mock/teamData.ts
 * ⚠️ 백엔드 연동 전 임시 Mock
 */

// ── 타입 정의 ──────────────────────────────────────────────────────

export interface HistoryEvent {
  year: number;
  type:
    | "founded"
    | "rename"
    | "championship"
    | "retired"
    | "stadium"
    | "relocation";
  title: string;
  description: string;
  playerName?: string;
  number?: number;
}

export interface CheeringSong {
  title: string;
  type: string;
  youtubeId: string;
}

export interface Team {
  id: string;
  name: string;
  logoUrl: string;
  shortName: string;
  city: string;
  founded: number;
  mascotName: string;
  championships: number;
  championshipYears: number[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    text: string;
  };
  mapCoords: { x: number; y: number };
  stadium: {
    name: string;
    capacity: number;
    openYear: number;
    surface: string;
    roofType: string;
    imageUrl: string;
  };
  stats2024: {
    era: number;
    whip: number;
    qs: number;
    avg: number;
    sb: number;
    ops: number;
  };
  history: HistoryEvent[];
  songs: CheeringSong[];
}

// ── 팀 데이터 ──────────────────────────────────────────────────────

export const KBO_TEAMS: Team[] = [
  {
    id: "kia",
    logoUrl: "/images/teams/kia.png",
    name: "KIA 타이거즈",
    shortName: "KIA",
    city: "광주",
    founded: 1982,
    mascotName: "호랑이",
    championships: 11,
    championshipYears: [
      1983, 1986, 1987, 1988, 1989, 1991, 1993, 1996, 1997, 2009, 2017,
    ],
    colors: {
      primary: "#EA0029",
      secondary: "#000000",
      accent: "#c8102e",
      bg: "#1a0005",
      text: "#ffffff",
    },
    mapCoords: { x: 112, y: 220 },
    stadium: {
      name: "광주-기아 챔피언스 필드",
      capacity: 20000,
      openYear: 2014,
      surface: "천연잔디",
      roofType: "개방형",
      imageUrl: "",
    },
    stats2024: {
      era: 3.72,
      whip: 1.21,
      qs: 62,
      avg: 0.281,
      sb: 98,
      ops: 0.782,
    },
    history: [
      {
        year: 1982,
        type: "founded",
        title: "해태 타이거즈 창단",
        description: "광주를 연고로 해태 타이거즈 창단.",
      },
      {
        year: 1996,
        type: "rename",
        title: "KIA 타이거즈로 개명",
        description: "해태 그룹 부도로 기아자동차가 인수, KIA 타이거즈로 개명.",
      },
      {
        year: 2017,
        type: "championship",
        title: "한국시리즈 우승",
        description: "두산 베어스를 꺾고 통산 11번째 우승.",
      },
    ],
    // teamData.ts — KIA 타이거즈 songs 배열
    songs: [
      // ── 대표 팀가 ──────────────────────────────
      { title: "KIA 없이는 못 살아", type: "팀가", youtubeId: "6RiMyqT3_t0" },
      { title: "라인업송", type: "팀가", youtubeId: "gGQatgXq2Ww" },
      {
        title: "사랑한다 KIA (KIA 열광송)",
        type: "팀가",
        youtubeId: "cGs5swSDvJ8",
      },
      {
        title: "영원하리라 KIA 타이거즈",
        type: "팀가",
        youtubeId: "d9ulphHCWSs",
      },
      // ── 응원가 ────────────────────────────────
      {
        title: "광주의 함성 (승리의 이름)",
        type: "응원가",
        youtubeId: "iTPWsq1msBU",
      },
      { title: "최강 KIA를 위해", type: "응원가", youtubeId: "aSoo8TlAxnU" },
      { title: "KIA를 응원하라", type: "응원가", youtubeId: "zFLZh4TWqW8" },
      { title: "우리는 하나", type: "응원가", youtubeId: "SowLIvc9lAM" },
      { title: "WANTED", type: "응원가", youtubeId: "8XXY7-_Qci4" },
      { title: "열광하라 타이거즈", type: "응원가", youtubeId: "pSSk6apWIbo" },
      {
        title: "외쳐라 최강 KIA (ver.1)",
        type: "응원가",
        youtubeId: "yirww4738cs",
      },
      {
        title: "외쳐라 최강 KIA (ver.2)",
        type: "응원가",
        youtubeId: "TlEX31itfas",
      },
      {
        title: "외쳐라 최강 KIA (ver.3)",
        type: "응원가",
        youtubeId: "2DGxNSrPEkk",
      },
      {
        title: "외쳐라 최강 KIA (ver.4)",
        type: "응원가",
        youtubeId: "SHKhXjNkD90",
      },
      { title: "붉은 노을", type: "응원가", youtubeId: "LVIXH2g5RY8" },
      {
        title: "최강 KIA 승리하리라",
        type: "응원가",
        youtubeId: "IRRg6vsnedw",
      },
      {
        title: "승리를 위해 함께 부르자",
        type: "응원가",
        youtubeId: "S-WV0dUw01w",
      },
      // ── 2025 신곡 ─────────────────────────────
      {
        title: "승리를 위해 (2025)",
        type: "2025 신곡",
        youtubeId: "MtKPgo85Bq8",
      },
      { title: "오! 최강기아!", type: "2025 신곡", youtubeId: "Hw0xWjbMLxo" },
      // ── 미사용/레거시 ──────────────────────────
      { title: "Winner's Tigers", type: "레거시", youtubeId: "pxrL1iKuWPA" },
      { title: "Run & Win", type: "레거시", youtubeId: "KmubZRxwMGA" },
      { title: "With Us TIGERS", type: "레거시", youtubeId: "TbCRd3RziuI" },
      { title: "김치송 (만약에 송)", type: "레거시", youtubeId: "-73k3QA8kpk" },
      { title: "맘마미아", type: "레거시", youtubeId: "4m2nVt0JwOg" },
      { title: "리얼리티", type: "레거시", youtubeId: "1KrgHJu_VCY" },
      { title: "팡팡", type: "레거시", youtubeId: "FxNz0OMvc_c" },
      // ── 연고지가 ──────────────────────────────
      { title: "남행열차", type: "연고지가", youtubeId: "ssWocIQL51c" },
      // ── 기타 ──────────────────────────────────
      {
        title: "KIA 없이는 못 살아 (alt.)",
        type: "기타",
        youtubeId: "b8_zEaS2QW0",
      },
      { title: "알 수 없음", type: "기타", youtubeId: "ZEPS5Bm3iqc" },
    ],
  },
  {
    id: "samsung",
    logoUrl: "/images/teams/samsung.png",
    name: "삼성 라이온즈",
    shortName: "삼성",
    city: "대구",
    founded: 1982,
    mascotName: "라이온",
    championships: 8,
    championshipYears: [1985, 2002, 2005, 2006, 2011, 2012, 2013, 2014],
    colors: {
      primary: "#074CA1",
      secondary: "#C0C0C0",
      accent: "#1a3a6b",
      bg: "#000d1a",
      text: "#ffffff",
    },
    mapCoords: { x: 158, y: 185 },
    stadium: {
      name: "대구 삼성 라이온즈 파크",
      capacity: 24000,
      openYear: 2016,
      surface: "천연잔디",
      roofType: "개방형",
      imageUrl: "",
    },
    stats2024: {
      era: 4.21,
      whip: 1.35,
      qs: 48,
      avg: 0.267,
      sb: 55,
      ops: 0.741,
    },
    history: [
      {
        year: 1982,
        type: "founded",
        title: "삼성 라이온즈 창단",
        description: "대구를 연고로 삼성 라이온즈 창단.",
      },
      {
        year: 2014,
        type: "championship",
        title: "4연패 달성",
        description: "2011~2014 한국시리즈 4연패 달성.",
      },
    ],
    songs: [
      {
        title: "삼성 라이온즈 응원가",
        type: "팀가",
        youtubeId: "TO_BE_REPLACED",
      },
    ],
  },
  {
    id: "lg",
    logoUrl: "/images/teams/lg.png",
    name: "LG 트윈스",
    shortName: "LG",
    city: "서울",
    founded: 1990,
    mascotName: "트윈베어",
    championships: 3,
    championshipYears: [1990, 1994, 2023],
    colors: {
      primary: "#C30452",
      secondary: "#000000",
      accent: "#8b0035",
      bg: "#1a0010",
      text: "#ffffff",
    },
    mapCoords: { x: 148, y: 118 },
    stadium: {
      name: "잠실야구장",
      capacity: 25000,
      openYear: 1982,
      surface: "천연잔디",
      roofType: "개방형",
      imageUrl: "",
    },
    stats2024: {
      era: 3.95,
      whip: 1.28,
      qs: 55,
      avg: 0.275,
      sb: 72,
      ops: 0.762,
    },
    history: [
      {
        year: 1990,
        type: "founded",
        title: "LG 트윈스 출범",
        description: "MBC 청룡을 인수하여 LG 트윈스 출범.",
      },
      {
        year: 2023,
        type: "championship",
        title: "29년 만의 우승",
        description: "KT 위즈를 꺾고 29년 만에 한국시리즈 우승.",
      },
    ],
    songs: [
      { title: "LG 트윈스 응원가", type: "팀가", youtubeId: "TO_BE_REPLACED" },
    ],
  },
  {
    id: "doosan",
    logoUrl: "/images/teams/doosan.png",
    name: "두산 베어스",
    shortName: "두산",
    city: "서울",
    founded: 1982,
    mascotName: "베어",
    championships: 6,
    championshipYears: [1982, 1995, 2001, 2015, 2016, 2019],
    colors: {
      primary: "#131230",
      secondary: "#C0C0C0",
      accent: "#2a2860",
      bg: "#0a0a1a",
      text: "#ffffff",
    },
    mapCoords: { x: 152, y: 123 },
    stadium: {
      name: "잠실야구장",
      capacity: 25000,
      openYear: 1982,
      surface: "천연잔디",
      roofType: "개방형",
      imageUrl: "",
    },
    stats2024: { era: 4.1, whip: 1.31, qs: 51, avg: 0.271, sb: 48, ops: 0.748 },
    history: [
      {
        year: 1982,
        type: "founded",
        title: "OB 베어스 창단",
        description: "서울을 연고로 OB 베어스 창단.",
      },
      {
        year: 1999,
        type: "rename",
        title: "두산 베어스로 개명",
        description: "두산그룹이 인수하여 두산 베어스로 개명.",
      },
    ],
    songs: [
      {
        title: "두산 베어스 응원가",
        type: "팀가",
        youtubeId: "TO_BE_REPLACED",
      },
    ],
  },
  {
    id: "lotte",
    logoUrl: "/images/teams/lotte.png",
    name: "롯데 자이언츠",
    shortName: "롯데",
    city: "부산",
    founded: 1975,
    mascotName: "자이언트",
    championships: 2,
    championshipYears: [1984, 1992],
    colors: {
      primary: "#002B5B",
      secondary: "#E31837",
      accent: "#001a38",
      bg: "#000d1a",
      text: "#ffffff",
    },
    mapCoords: { x: 185, y: 222 },
    stadium: {
      name: "사직야구장",
      capacity: 24000,
      openYear: 1985,
      surface: "천연잔디",
      roofType: "개방형",
      imageUrl: "",
    },
    stats2024: {
      era: 4.45,
      whip: 1.38,
      qs: 44,
      avg: 0.263,
      sb: 61,
      ops: 0.732,
    },
    history: [
      {
        year: 1975,
        type: "founded",
        title: "롯데 자이언츠 창단",
        description: "부산을 연고로 롯데 자이언츠 창단.",
      },
      {
        year: 1984,
        type: "championship",
        title: "첫 한국시리즈 우승",
        description: "삼성 라이온즈를 꺾고 첫 우승.",
      },
    ],
    songs: [
      { title: "부산 갈매기", type: "팀가", youtubeId: "TO_BE_REPLACED" },
    ],
  },
  {
    id: "hanwha",
    logoUrl: "/images/teams/hanwha.png",
    name: "한화 이글스",
    shortName: "한화",
    city: "대전",
    founded: 1986,
    mascotName: "이글",
    championships: 1,
    championshipYears: [1999],
    colors: {
      primary: "#FF6600",
      secondary: "#000000",
      accent: "#cc5200",
      bg: "#1a0d00",
      text: "#ffffff",
    },
    mapCoords: { x: 128, y: 155 },
    stadium: {
      name: "한화생명 이글스파크",
      capacity: 13000,
      openYear: 1964,
      surface: "천연잔디",
      roofType: "개방형",
      imageUrl: "",
    },
    stats2024: {
      era: 4.68,
      whip: 1.42,
      qs: 40,
      avg: 0.258,
      sb: 44,
      ops: 0.721,
    },
    history: [
      {
        year: 1986,
        type: "founded",
        title: "빙그레 이글스 창단",
        description: "대전을 연고로 빙그레 이글스 창단.",
      },
      {
        year: 1994,
        type: "rename",
        title: "한화 이글스로 개명",
        description: "한화그룹 인수 후 한화 이글스로 개명.",
      },
      {
        year: 1999,
        type: "championship",
        title: "한국시리즈 우승",
        description: "롯데 자이언츠를 꺾고 창단 첫 우승.",
      },
    ],
    songs: [
      {
        title: "한화 이글스 응원가",
        type: "팀가",
        youtubeId: "TO_BE_REPLACED",
      },
    ],
  },
  {
    id: "ssg",
    logoUrl: "/images/teams/ssg.png",
    name: "SSG 랜더스",
    shortName: "SSG",
    city: "인천",
    founded: 2000,
    mascotName: "랜더",
    championships: 2,
    championshipYears: [2007, 2010],
    colors: {
      primary: "#CE0E2D",
      secondary: "#FFD700",
      accent: "#a00b24",
      bg: "#1a0005",
      text: "#ffffff",
    },
    mapCoords: { x: 130, y: 108 },
    stadium: {
      name: "SSG 랜더스필드",
      capacity: 23000,
      openYear: 2002,
      surface: "천연잔디",
      roofType: "개방형",
      imageUrl: "",
    },
    stats2024: { era: 4.05, whip: 1.3, qs: 53, avg: 0.269, sb: 58, ops: 0.751 },
    history: [
      {
        year: 2000,
        type: "founded",
        title: "SK 와이번스 창단",
        description: "인천을 연고로 SK 와이번스 창단.",
      },
      {
        year: 2021,
        type: "rename",
        title: "SSG 랜더스로 개명",
        description: "SSG가 인수하여 SSG 랜더스로 출범.",
      },
    ],
    songs: [
      { title: "SSG 랜더스 응원가", type: "팀가", youtubeId: "TO_BE_REPLACED" },
    ],
  },
  {
    id: "kt",
    logoUrl: "/images/teams/kt.png",
    name: "KT 위즈",
    shortName: "KT",
    city: "수원",
    founded: 2013,
    mascotName: "위즈",
    championships: 1,
    championshipYears: [2021],
    colors: {
      primary: "#000000",
      secondary: "#E31837",
      accent: "#222222",
      bg: "#0d0d0d",
      text: "#ffffff",
    },
    mapCoords: { x: 140, y: 132 },
    stadium: {
      name: "수원 KT 위즈파크",
      capacity: 20000,
      openYear: 2015,
      surface: "천연잔디",
      roofType: "개방형",
      imageUrl: "",
    },
    stats2024: { era: 4.3, whip: 1.33, qs: 47, avg: 0.265, sb: 52, ops: 0.738 },
    history: [
      {
        year: 2013,
        type: "founded",
        title: "KT 위즈 창단",
        description: "수원을 연고로 KT 위즈 창단.",
      },
      {
        year: 2021,
        type: "championship",
        title: "창단 첫 우승",
        description: "두산 베어스를 꺾고 창단 첫 한국시리즈 우승.",
      },
    ],
    songs: [
      { title: "KT 위즈 응원가", type: "팀가", youtubeId: "TO_BE_REPLACED" },
    ],
  },
  {
    id: "nc",
    logoUrl: "/images/teams/nc.png",
    name: "NC 다이노스",
    shortName: "NC",
    city: "창원",
    founded: 2011,
    mascotName: "다이노",
    championships: 1,
    championshipYears: [2020],
    colors: {
      primary: "#071D49",
      secondary: "#BFA253",
      accent: "#0a2a6e",
      bg: "#050e24",
      text: "#ffffff",
    },
    mapCoords: { x: 170, y: 210 },
    stadium: {
      name: "창원 NC 파크",
      capacity: 22000,
      openYear: 2019,
      surface: "천연잔디",
      roofType: "개방형",
      imageUrl: "",
    },
    stats2024: { era: 4.55, whip: 1.4, qs: 42, avg: 0.261, sb: 67, ops: 0.728 },
    history: [
      {
        year: 2011,
        type: "founded",
        title: "NC 다이노스 창단",
        description: "창원을 연고로 NC 다이노스 창단.",
      },
      {
        year: 2020,
        type: "championship",
        title: "창단 첫 우승",
        description: "두산 베어스를 꺾고 창단 첫 한국시리즈 우승.",
      },
    ],
    songs: [
      {
        title: "NC 다이노스 응원가",
        type: "팀가",
        youtubeId: "TO_BE_REPLACED",
      },
    ],
  },
  {
    id: "kiwoom",
    logoUrl: "/images/teams/kiwoom.png",
    name: "키움 히어로즈",
    shortName: "키움",
    city: "서울",
    founded: 2008,
    mascotName: "히어로",
    championships: 0,
    championshipYears: [],
    colors: {
      primary: "#820024",
      secondary: "#FFD700",
      accent: "#5c0019",
      bg: "#150006",
      text: "#ffffff",
    },
    mapCoords: { x: 140, y: 114 },
    stadium: {
      name: "고척 스카이돔",
      capacity: 16000,
      openYear: 2015,
      surface: "인조잔디",
      roofType: "돔구장",
      imageUrl: "",
    },
    stats2024: { era: 4.8, whip: 1.45, qs: 38, avg: 0.255, sb: 89, ops: 0.715 },
    history: [
      {
        year: 2008,
        type: "founded",
        title: "우리 히어로즈 창단",
        description: "현대 유니콘스 선수단을 인수하여 창단.",
      },
      {
        year: 2019,
        type: "rename",
        title: "키움 히어로즈로 개명",
        description: "키움증권 스폰서십으로 현재 이름 사용.",
      },
    ],
    songs: [
      {
        title: "키움 히어로즈 응원가",
        type: "팀가",
        youtubeId: "TO_BE_REPLACED",
      },
    ],
  },
];

// ── 지도 좌우 패널 분리 ────────────────────────────────────────────

export const LEFT_TEAMS: Team[] = KBO_TEAMS.filter((t) =>
  ["hanwha", "lotte", "nc", "kia", "kt"].includes(t.id),
);

export const RIGHT_TEAMS: Team[] = KBO_TEAMS.filter((t) =>
  ["samsung", "doosan", "lg", "ssg", "kiwoom"].includes(t.id),
);

// ── 스탯 정규화 (레이더 차트용, 0~100) ───────────────────────────────

export function normalizeStats(
  stats: Team["stats2024"],
): Record<string, number> {
  // ERA: 낮을수록 좋음 (2.5~6.0 범위 가정)
  const era = Math.max(0, Math.min(100, ((6.0 - stats.era) / 3.5) * 100));
  // WHIP: 낮을수록 좋음 (1.0~1.8 범위)
  const whip = Math.max(0, Math.min(100, ((1.8 - stats.whip) / 0.8) * 100));
  // QS: 높을수록 좋음 (30~70 범위)
  const qs = Math.max(0, Math.min(100, ((stats.qs - 30) / 40) * 100));
  // AVG: 높을수록 좋음 (0.240~0.300 범위)
  const avg = Math.max(0, Math.min(100, ((stats.avg - 0.24) / 0.06) * 100));
  // SB: 높을수록 좋음 (30~110 범위)
  const sb = Math.max(0, Math.min(100, ((stats.sb - 30) / 80) * 100));
  // OPS: 높을수록 좋음 (0.680~0.820 범위)
  const ops = Math.max(0, Math.min(100, ((stats.ops - 0.68) / 0.14) * 100));

  return { ERA: era, WHIP: whip, QS: qs, AVG: avg, SB: sb, OPS: ops };
}
