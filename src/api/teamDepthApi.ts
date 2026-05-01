// src/api/teamDepthApi.ts

const BASE_URL = "/api";

// ── 팀 이름 매핑 (teamId → DB team_name) ──────────────────────
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

// ── 백엔드 TeamDepthDto 구조 ──────────────────────────────────
export interface DepthPlayerEntry {
  pid: number | null;
  playerName: string;
  position: string;
  isStarter: boolean;
}

export interface TeamDepthResponse {
  teamName: string;
  season: string;
  /** 주전만 (is_starter=1) 포지션맵 */
  starters: Record<string, DepthPlayerEntry[]>;
  /** 주전+백업 전체 (is_depth=1) 포지션맵 */
  depth: Record<string, DepthPlayerEntry[]>;
}

/**
 * GET /api/teams/{teamName}/depth?season=26
 */
export async function fetchTeamDepth(
  teamId: string,
  season = "26",
): Promise<TeamDepthResponse | null> {
  const dbName = TEAM_ID_TO_DB[teamId];
  if (!dbName) return null;
  try {
    const res = await fetch(
      `${BASE_URL}/teams/${encodeURIComponent(dbName)}/depth?season=${season}`,
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
