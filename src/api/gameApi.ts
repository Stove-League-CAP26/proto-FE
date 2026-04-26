// ==================== 타입 정의 ====================

export interface GameInfo {
  gameId: string;
  gameDate: string;
  gameDateTime: string;
  stadium: string;

  homeTeamCode: string;
  homeTeamName: string;
  homeTeamScore: number;
  homeTeamEmblemUrl: string;

  awayTeamCode: string;
  awayTeamName: string;
  awayTeamScore: number;
  awayTeamEmblemUrl: string;

  winner: "HOME" | "AWAY" | "DRAW";
  statusCode: "RESULT" | "BEFORE" | "LIVE" | "STARTED";
  statusInfo: string;
  cancel: boolean;

  broadChannel: string;
  homeStarterName: string;
  awayStarterName: string;
  winPitcherName: string;
  losePitcherName: string;
}

export interface LeagueStanding {
  rankNum: number;
  teamName: string;
  wins: number;
  losses: number;
  draws: number;
  winPct: number;
  gamesBehind: number;
  streak: string;
  totalGames: number;
  teamAvg: number | null;
  teamEra: number | null;
  last5: string | null;
}

export interface InningScore {
  inning: number;
  homeScore: string;
  awayScore: string;
}

export interface PitcherInfo {
  name: string;
  pcode: string;
}

export interface LineupPlayer {
  name: string;
  pcode: string;
  pos: string;
  batOrder: number;
}

export interface GameScore {
  innings: InningScore[];
  homeScore: string;
  awayScore: string;
  homeHit: string;
  awayHit: string;
  winPitcher?: PitcherInfo;
  losePitcher?: PitcherInfo;
  homeLineup: LineupPlayer[];
  awayLineup: LineupPlayer[];
}

// ==================== API 함수 ====================

const BASE_URL = "http://localhost:8080/api";

export async function fetchGamesByDate(date?: string): Promise<GameInfo[]> {
  const param = date ? `?date=${date}` : "";
  const res = await fetch(`${BASE_URL}/games/date${param}`);
  if (!res.ok) throw new Error("경기 일정 조회 실패");
  return res.json();
}

export async function fetchRecentGames(): Promise<GameInfo[]> {
  const res = await fetch(`${BASE_URL}/games/recent`);
  if (!res.ok) throw new Error("최근 경기 조회 실패");
  return res.json();
}

export async function fetchUpcomingGames(): Promise<GameInfo[]> {
  const res = await fetch(`${BASE_URL}/games/upcoming`);
  if (!res.ok) throw new Error("예정 경기 조회 실패");
  return res.json();
}

export async function fetchStandings(
  season: number,
): Promise<LeagueStanding[]> {
  const res = await fetch(`${BASE_URL}/standings?season=${season}`);
  if (!res.ok) throw new Error("순위 조회 실패");
  return res.json();
}

export async function fetchGameScore(gameId: string): Promise<GameScore> {
  const res = await fetch(`${BASE_URL}/games/${gameId}/score`);
  if (!res.ok) throw new Error("스코어 조회 실패");
  return res.json();
}

// ==================== 유틸 함수 ====================

export function getTeamImageUrl(teamCode: string): string {
  return `/images/teams/${teamCode}.png`;
}

export function formatGameTime(gameDateTime: string): string {
  if (!gameDateTime) return "";
  const date = new Date(gameDateTime);
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function formatGameDate(gameDate: string): string {
  if (!gameDate) return "";
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const d = new Date(gameDate);
  return `${d.getMonth() + 1}/${d.getDate()} (${days[d.getDay()]})`;
}

export function getStatusLabel(game: GameInfo): string {
  if (game.cancel) return "취소";
  switch (game.statusCode) {
    case "RESULT":
      return "종료";
    case "LIVE":
    case "STARTED":
      return "🔴 LIVE";
    case "BEFORE":
      return formatGameTime(game.gameDateTime);
    default:
      return game.statusInfo;
  }
}
