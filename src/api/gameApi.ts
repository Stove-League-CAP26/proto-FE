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
  statusCode: "RESULT" | "BEFORE" | "LIVE";
  statusInfo: string; // "경기전" | "9회초" | "경기취소" 등
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

// ==================== API 함수 ====================

const BASE_URL = "http://localhost:8080/api";

/**
 * 특정 날짜의 경기 목록 조회
 * date: "2026-04-14" 형식. 생략 시 오늘.
 */
export async function fetchGamesByDate(date?: string): Promise<GameInfo[]> {
  const param = date ? `?date=${date}` : "";
  const res = await fetch(`${BASE_URL}/games/date${param}`);
  if (!res.ok) throw new Error("경기 일정 조회 실패");
  return res.json();
}

/**
 * 가장 최근 경기 결과 (오늘 경기 없을 때 사용)
 */
export async function fetchRecentGames(): Promise<GameInfo[]> {
  const res = await fetch(`${BASE_URL}/games/recent`);
  if (!res.ok) throw new Error("최근 경기 조회 실패");
  return res.json();
}

/**
 * 다음 예정 경기
 */
export async function fetchUpcomingGames(): Promise<GameInfo[]> {
  const res = await fetch(`${BASE_URL}/games/upcoming`);
  if (!res.ok) throw new Error("예정 경기 조회 실패");
  return res.json();
}

/**
 * 리그 순위 조회
 */
export async function fetchStandings(
  season: number,
): Promise<LeagueStanding[]> {
  const res = await fetch(`${BASE_URL}/standings?season=${season}`);
  if (!res.ok) throw new Error("순위 조회 실패");
  return res.json();
}

// ==================== 유틸 함수 ====================

/**
 * 팀 코드 → 로컬 이미지 경로
 * (public/images/teams/ 폴더에 저장된 경우)
 */
export function getTeamImageUrl(teamCode: string): string {
  // 네이버 CDN 이미지 CORS 차단 → 로컬 fallback
  return `/images/teams/${teamCode}.png`;
}

/**
 * gameDateTime → "18:30" 형식
 */
export function formatGameTime(gameDateTime: string): string {
  if (!gameDateTime) return "";
  const date = new Date(gameDateTime);
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * gameDate → "4/14 (화)" 형식
 */
export function formatGameDate(gameDate: string): string {
  if (!gameDate) return "";
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const d = new Date(gameDate);
  return `${d.getMonth() + 1}/${d.getDate()} (${days[d.getDay()]})`;
}

/**
 * statusCode + cancel → 표시 텍스트
 */
export function getStatusLabel(game: GameInfo): string {
  if (game.cancel) return "취소";
  switch (game.statusCode) {
    case "RESULT":
      return "종료";
    case "LIVE":
      return "🔴 LIVE";
    case "BEFORE":
      return formatGameTime(game.gameDateTime);
    default:
      return game.statusInfo;
  }
}
