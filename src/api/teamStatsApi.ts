// src/api/teamStatsApi.ts
const BASE_URL = "/api";

// ── 팀 전체 스탯 (기존) ───────────────────────────────────────
export interface TeamStats {
  season: number;
  teamName: string;
  ops: number;
  avg: number;
  sb: number;
  r: number;
  hr: number;
  obp: number;
  era: number;
  whip: number;
  e: number;
  pitchSo: number;
  qs: number;
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
