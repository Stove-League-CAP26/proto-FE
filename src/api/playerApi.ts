const BASE_URL = "/api";

// ─────────────────────────────────────────────────────────────
// 선수 기본 API
// ─────────────────────────────────────────────────────────────

export async function fetchPlayerBasic(pid: number) {
  const res = await fetch(`${BASE_URL}/players/${pid}`);
  if (!res.ok)
    throw new Error(`선수 정보 로드 실패 (pid: ${pid}, status: ${res.status})`);
  return res.json();
}

export async function searchPlayersByName(name: string) {
  const res = await fetch(
    `/api/players/search?name=${encodeURIComponent(name)}`,
  );
  if (!res.ok) throw new Error(`검색 실패 (status: ${res.status})`);
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// 시즌 스탯 API
// ─────────────────────────────────────────────────────────────

export async function fetchHitterStats(pid: number) {
  const res = await fetch(`${BASE_URL}/stats/hitter/${pid}`);
  if (!res.ok)
    throw new Error(`타자 스탯 로드 실패 (pid: ${pid}, status: ${res.status})`);
  return res.json();
}

export async function fetchPitcherStats(pid: number) {
  const res = await fetch(`${BASE_URL}/stats/pitcher/${pid}`);
  if (!res.ok)
    throw new Error(`투수 스탯 로드 실패 (pid: ${pid}, status: ${res.status})`);
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// 레이더 차트 타입 + API
// ─────────────────────────────────────────────────────────────

/** 타자 레이더 — 실제 지표 기반으로 0~100 정규화된 값 */
export interface HitterRadar {
  power: number; // HR/AB 기반
  contact: number; // H/AB 기반
  extra: number; // TB/AB 기반
  speed: number; // (2B+3B*3)/H 기반
  contrib: number; // RBI/G 기반
  eye: number; // (PA-AB)/PA 기반
  style: string; // "슬러거" | "스피드스터" | "클린업" | "교타자" | "올라운더"
}

/** 투수 레이더 — 실제 지표 기반으로 0~100 정규화된 값 */
export interface PitcherRadar {
  strikeout: number; // SO/IP 기반
  eraControl: number; // 역수ERA 기반
  control: number; // 역수HBP/IP 기반
  hrControl: number; // 역수HR/IP 기반
  stamina: number; // IP/G 기반
  hitControl: number; // 역수H/IP 기반
  style: string; // "파워피처" | "에이스" | "기교파" | "이닝이터" | "마무리형"
}

export async function fetchHitterRadar(pid: number): Promise<HitterRadar> {
  const res = await fetch(`${BASE_URL}/stats/radar/hitter/${pid}`);
  if (!res.ok)
    throw new Error(
      `타자 레이더 로드 실패 (pid: ${pid}, status: ${res.status})`,
    );
  return res.json();
}

export async function fetchPitcherRadar(pid: number): Promise<PitcherRadar> {
  const res = await fetch(`${BASE_URL}/stats/radar/pitcher/${pid}`);
  if (!res.ok)
    throw new Error(
      `투수 레이더 로드 실패 (pid: ${pid}, status: ${res.status})`,
    );
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// 차트 존 데이터 타입 (HOT/COLD ZONE, 투구 분포도 등)
// ─────────────────────────────────────────────────────────────

/** 구역 하나의 값 + 색상 단계(1~5) */
export interface ZoneCell {
  val: string; // "0.337" | "12.5%" | "-"
  step: number; // 1(낮음/차가움) ~ 5(높음/뜨거움)
}

/** outer 코너 4칸 [TL, TR, BL, BR] + inner 스트라이크존 3×3 */
export interface ZoneGrid {
  outer: ZoneCell[]; // 4개
  inner: ZoneCell[]; // 9개
}

/** 타구 방향 분포 */
export interface HitDirection {
  lf: string; // "50.6%"
  cf: string;
  rf: string;
}

/** 타자용 차트 전체 */
export interface HitterChart {
  hotCold: ZoneGrid; // HOT & COLD ZONE (구역별 타율)
  strikeout: ZoneGrid; // 삼진 분포도
  hitDistrib: HitDirection; // 타구 방향 LF/CF/RF
}

/** 투수용 차트 전체 */
export interface PitcherChart {
  pitchZone: ZoneGrid; // 투구 분포도
  strikeoutZone: ZoneGrid; // 탈삼진 분포도
}

/** GET /api/players/{pid}/chart 응답 전체 */
export interface PlayerChartResponse {
  pid: number;
  playerType: "hitter" | "pitcher";
  hitter: HitterChart | null;
  pitcher: PitcherChart | null;
}

/**
 * 선수 차트 데이터 조회
 * — HOT/COLD ZONE, 삼진 분포, 타구 방향, 투구 분포도, 탈삼진 분포
 * — 실패 시 null 반환 → 호출부에서 MOCK fallback 처리
 */
export async function fetchPlayerChart(
  pid: number,
): Promise<PlayerChartResponse | null> {
  try {
    const res = await fetch(`${BASE_URL}/players/${pid}/chart`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export interface PitchStat {
  pitchType: string; // "직구", "슬라이더" 등
  speed: number | null; // km/h
  usage: number | null; // %
}

export async function fetchPitchStats(pid: number): Promise<PitchStat[]> {
  try {
    const res = await fetch(`/api/stats/pitcher/${pid}/pitch`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// BEST 플레이어 API
// ─────────────────────────────────────────────────────────────

export interface BestRankItem {
  rank: number;
  pid: number;
  name: string;
  team: string;
  val: number; // 백엔드에서 Double로 내려옴
}

export interface HitterBestResponse {
  season: number;
  AVG: BestRankItem[];
  HR: BestRankItem[];
  RBI: BestRankItem[];
  H: BestRankItem[];
  TB: BestRankItem[];
}

export interface PitcherBestResponse {
  season: number;
  ERA: BestRankItem[];
  WIN: BestRankItem[];
  KK: BestRankItem[];
  SAVE: BestRankItem[];
  WHIP: BestRankItem[];
}

export async function fetchHitterBest(
  season = 2025,
): Promise<HitterBestResponse | null> {
  try {
    const res = await fetch(`${BASE_URL}/best/hitter?season=${season}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchPitcherBest(
  season = 2025,
): Promise<PitcherBestResponse | null> {
  try {
    const res = await fetch(`${BASE_URL}/best/pitcher?season=${season}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
