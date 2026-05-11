// src/api/teamStatsApi.ts
const BASE_URL = "/api";

// ── 팀 전체 스탯 (백엔드 TeamStatDto 구조와 일치) ────────────
export interface TeamStats {
  teamName: string;
  season: number;
  // 타격
  avg: number;
  g: number;
  pa: number;
  ab: number;
  r: number;
  h: number;
  b2: number;
  b3: number;
  hr: number;
  tb: number;
  rbi: number;
  sac: number;
  sf: number;
  bb: number;
  ibb: number;
  hbp: number;
  so: number;
  gdp: number;
  slg: number;
  obp: number;
  ops: number;
  mh: number;
  risp: number;
  phBa: number;
  sb: number;
  // 투수
  era: number;
  w: number;
  l: number;
  sv: number;
  hld: number;
  wpct: number;
  ip: number;
  pitchH: number;
  pitchHr: number;
  pitchBb: number;
  pitchHbp: number;
  pitchSo: number;
  pitchR: number;
  er: number;
  whip: number;
  cg: number;
  sho: number;
  qs: number;
  bsv: number;
  tbf: number;
  np: number;
  pitchAvg: number;
  wp: number;
  bk: number;
  e: number;
}

// ── 레이더 데이터 (백엔드 TeamRadarDto 구조) ──────────────────
export interface TeamRadarData {
  teamName: string;
  season: number;
  era: number; // 0~100 정규화
  whip: number;
  defense: number;
  stolenBase: number;
  ops: number;
  avg: number;
}

const TEAM_ID_TO_DB: Record<string, string> = {
  lg: "LG",
  samsung: "삼성",
  lotte: "롯데",
  hanwha: "한화",
  doosan: "두산",
  nc: "NC",
  kia: "기아",
  ssg: "SSG",
  kt: "KT",
  kiwoom: "키움",
};

// ── 팀 전체 스탯 조회 ─────────────────────────────────────────
export async function fetchTeamStats(
  teamId: string,
  season = 2025,
): Promise<TeamStats | null> {
  const dbName = TEAM_ID_TO_DB[teamId];
  if (!dbName) return null;
  const res = await fetch(
    `${BASE_URL}/teams/${encodeURIComponent(dbName)}/stats?season=${season}`,
  );
  if (!res.ok) return null;
  return res.json();
}

// ── 특정 팀 레이더 데이터 조회 ───────────────────────────────
export async function fetchTeamRadar(
  teamId: string,
  season = 2025,
): Promise<TeamRadarData | null> {
  const dbName = TEAM_ID_TO_DB[teamId];
  if (!dbName) return null;
  const res = await fetch(
    `${BASE_URL}/teams/${encodeURIComponent(dbName)}/radar?season=${season}`,
  );
  if (!res.ok) return null;
  return res.json();
}

// ── 리그 평균 레이더 데이터 조회 ─────────────────────────────
export async function fetchLeagueAverageRadar(
  season = 2025,
): Promise<TeamRadarData | null> {
  const res = await fetch(`${BASE_URL}/teams/radar/average?season=${season}`);
  if (!res.ok) return null;
  return res.json();
}
