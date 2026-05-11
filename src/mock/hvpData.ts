// src/mock/hvpData.ts
// 네이버 스포츠 크롤링 기준 Mock 데이터
// 최대 3시즌 행 구조 (시즌별 상대전적)
// 실제 크롤링 URL 패턴:
//   https://sports.naver.com/kbo/record/batter_vs_pitcher.nhn
//   ?pitcherName=원태인&hitterName=김도영 (또는 playerCode 파라미터)
// 셀렉터: #_vs_player_table table tbody tr

export interface HvPSeasonRecord {
  season: number;
  pa: number; // 타석수
  ab: number; // 타수
  h: number; // 안타
  b2: number; // 2루타
  b3: number; // 3루타
  hr: number; // 홈런
  rbi: number; // 타점
  bb4: number; // 4사구 (볼넷+사구 합산)
  so: number; // 삼진
  gdp: number; // 병살
  avg: string; // 타율
  obp: string; // 출루율
  slg: string; // 장타율
  ops: string; // OPS
}

export interface HvPInsight {
  type: "danger" | "advantage" | "neutral" | "trend";
  text: string;
}

// ── 네이버 스포츠 구조 기준 Mock (최대 3시즌) ─────────────────
// 스크린샷 예시: 2025/2024/2023 시즌 행
export const MOCK_HVP_SEASON_RECORDS: HvPSeasonRecord[] = [
  {
    season: 2025,
    pa: 3,
    ab: 3,
    h: 1,
    b2: 0,
    b3: 0,
    hr: 1,
    rbi: 1,
    bb4: 0,
    so: 1,
    gdp: 0,
    avg: ".333",
    obp: ".333",
    slg: "1.333",
    ops: "1.666",
  },
  {
    season: 2024,
    pa: 6,
    ab: 4,
    h: 2,
    b2: 0,
    b3: 1,
    hr: 0,
    rbi: 0,
    bb4: 2,
    so: 0,
    gdp: 0,
    avg: ".500",
    obp: ".667",
    slg: "1.000",
    ops: "1.667",
  },
  {
    season: 2023,
    pa: 7,
    ab: 6,
    h: 3,
    b2: 1,
    b3: 0,
    hr: 0,
    rbi: 1,
    bb4: 1,
    so: 1,
    gdp: 0,
    avg: ".500",
    obp: ".571",
    slg: ".667",
    ops: "1.238",
  },
];

// 통산 합산 (UI 요약용)
export const MOCK_HVP_CAREER_SUMMARY = {
  pa: 16,
  ab: 13,
  h: 6,
  hr: 1,
  rbi: 2,
  so: 2,
  bb4: 3,
  gdp: 0,
  avg: ".462",
  obp: ".563",
  slg: ".923",
  ops: "1.486",
  lastUpdated: "2026년 04월 06일",
};

// ── 존 데이터 ─────────────────────────────────────────────────
export const MOCK_HVP_HITTER_HOTCOLD = {
  outer: [
    { val: ".448", step: 5 },
    { val: ".195", step: 2 },
    { val: ".215", step: 3 },
    { val: ".120", step: 1 },
  ],
  inner: [
    { val: ".303", step: 4 },
    { val: ".180", step: 2 },
    { val: ".290", step: 3 },
    { val: ".463", step: 5 },
    { val: ".286", step: 3 },
    { val: ".150", step: 1 },
    { val: ".349", step: 4 },
    { val: ".512", step: 5 },
    { val: ".259", step: 3 },
  ],
};

export const MOCK_HVP_HITTER_STRIKEOUT = {
  outer: [
    { val: "6.3%", step: 3 },
    { val: "6.3%", step: 3 },
    { val: "25.4%", step: 5 },
    { val: "14.3%", step: 5 },
  ],
  inner: [
    { val: "4.8%", step: 2 },
    { val: "1.6%", step: 1 },
    { val: "7.9%", step: 4 },
    { val: "3.2%", step: 2 },
    { val: "3.2%", step: 2 },
    { val: "1.6%", step: 1 },
    { val: "7.9%", step: 4 },
    { val: "4.8%", step: 2 },
    { val: "12.7%", step: 5 },
  ],
};

export const MOCK_HVP_PITCHER_PITCHZONE = {
  outer: [
    { val: "9.5%", step: 5 },
    { val: "12.1%", step: 5 },
    { val: "22.7%", step: 5 },
    { val: "6.8%", step: 4 },
  ],
  inner: [
    { val: "5.8%", step: 3 },
    { val: "5.6%", step: 3 },
    { val: "5.6%", step: 3 },
    { val: "5.9%", step: 3 },
    { val: "4.5%", step: 3 },
    { val: "4.6%", step: 3 },
    { val: "7.3%", step: 4 },
    { val: "4.7%", step: 3 },
    { val: "4.9%", step: 3 },
  ],
};

export const MOCK_HVP_PITCHER_STRIKEOUT = {
  outer: [
    { val: "4.2%", step: 2 },
    { val: "18.5%", step: 5 },
    { val: "3.1%", step: 2 },
    { val: "7.8%", step: 4 },
  ],
  inner: [
    { val: "3.5%", step: 2 },
    { val: "8.2%", step: 4 },
    { val: "6.1%", step: 3 },
    { val: "4.4%", step: 2 },
    { val: "5.9%", step: 3 },
    { val: "9.7%", step: 5 },
    { val: "3.2%", step: 2 },
    { val: "7.1%", step: 4 },
    { val: "11.3%", step: 5 },
  ],
};

// ── 인사이트 ─────────────────────────────────────────────────
export const MOCK_HVP_INSIGHTS: HvPInsight[] = [
  {
    type: "danger",
    text: "이 타자는 바깥쪽 낮은 코스에서 타율이 낮아, 해당 구역은 투수의 핵심 공략 포인트입니다.",
  },
  {
    type: "advantage",
    text: "타자의 몸쪽 높은 코스 타율(.448)이 리그 상위 5%에 해당합니다. 투수는 회피 필요.",
  },
  {
    type: "trend",
    text: "최근 3시즌 OPS 1.238~1.667 — 전반적으로 타자 우세 상성. 볼넷 유도 비율이 높음.",
  },
  {
    type: "neutral",
    text: "통산 16타석에서 .462 — 표본이 적어 단정 짓기 어려우나 현재 타자가 우위.",
  },
];
