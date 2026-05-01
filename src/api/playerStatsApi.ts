// src/api/playerStatsApi.ts

const BASE_URL = "http://localhost:8080/api/player";

// ── 타입 정의 ─────────────────────────────────────────────────────────────────
export interface SeasonStatRow {
  season: string;
  isTotal: boolean;
  isLatest?: boolean;
  [key: string]: string | boolean; // 타율, ERA, 경기수 등 동적 컬럼
}

export interface VsTeam {
  code: string;
  name: string;
}

export interface VsPlayer {
  playerId: string;
  name: string;
}

export interface PlayerStatsResult {
  seasons: string[];
  headers: string[];
  stats: SeasonStatRow[];
  vsTeams: VsTeam[];
  vsPlayers: VsPlayer[];
  selectedTeam: string;
  selectedPlayer: string;
}

export interface VsStatResult {
  seasons: string[];
  headers: string[];
  stats: SeasonStatRow[];
  note: string;
}

// ── API 함수 ──────────────────────────────────────────────────────────────────

/**
 * 선수 시즌별 스탯 + VS 가능한 팀/선수 목록
 * @param playerId  네이버 선수 ID
 * @param playerType "hitter" | "pitcher"
 */
export async function fetchPlayerStats(
  playerId: string | number,
  playerType: "hitter" | "pitcher",
): Promise<PlayerStatsResult> {
  const res = await fetch(
    `${BASE_URL}/${playerId}/stats?playerType=${playerType}`,
  );
  if (!res.ok) throw new Error("선수 스탯 조회 실패");
  return res.json();
}

/**
 * 특정 선수 대결 전적 (최근 3시즌)
 * @param playerId    투수/타자 ID
 * @param vsPlayerId  상대 선수 ID
 * @param playerType  "hitter" | "pitcher"
 */
export async function fetchVsStats(
  playerId: string | number,
  vsPlayerId: string | number,
  playerType: "hitter" | "pitcher",
): Promise<VsStatResult> {
  const res = await fetch(
    `${BASE_URL}/${playerId}/vs?vsPlayerId=${vsPlayerId}&playerType=${playerType}`,
  );
  if (!res.ok) throw new Error("VS 전적 조회 실패");
  return res.json();
}

/**
 * 특정 팀 선택 시 해당 팀 선수 목록 조회
 */
export async function fetchVsTeamPlayers(
  playerId: string | number,
  teamCode: string,
  playerType: "hitter" | "pitcher",
): Promise<{ teamCode: string; players: VsPlayer[] }> {
  const res = await fetch(
    `${BASE_URL}/${playerId}/vs/teams?teamCode=${teamCode}&playerType=${playerType}`,
  );
  if (!res.ok) throw new Error("팀 선수 목록 조회 실패");
  return res.json();
}
