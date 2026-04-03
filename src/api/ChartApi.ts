// 차트 API — /api/players/chart/{pid}?type=xxx
// 각 존별로 개별 호출

export interface ZoneCell {
  val: string;
  step: number; // 1~5
}

export interface ZoneGrid {
  outer: ZoneCell[]; // [1,2,3,4] — TL, TR, BL, BR
  inner: ZoneCell[]; // [1~9]
}

export interface HitDirection {
  lf: string;
  cf: string;
  rf: string;
}

const CHART_BASE = "/api/players/chart";

async function fetchChartZone(
  pid: number,
  type: string,
): Promise<ZoneGrid | null> {
  try {
    const res = await fetch(`${CHART_BASE}/${pid}?type=${type}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchChartHitDir(pid: number): Promise<HitDirection | null> {
  try {
    const res = await fetch(`${CHART_BASE}/${pid}?type=hitdir`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── 타자용 ────────────────────────────────────────────────────────────────────

/** HOT & COLD ZONE */
export function fetchHotColdZone(pid: number): Promise<ZoneGrid | null> {
  return fetchChartZone(pid, "hotcold");
}

/** 삼진 분포도 */
export function fetchStrikeoutZone(pid: number): Promise<ZoneGrid | null> {
  return fetchChartZone(pid, "strikeout");
}

/** 타구 방향 분포 */
export function fetchHitDirection(pid: number): Promise<HitDirection | null> {
  return fetchChartHitDir(pid);
}

// ── 투수용 ────────────────────────────────────────────────────────────────────

/** 투구 분포도 */
export function fetchPitchZone(pid: number): Promise<ZoneGrid | null> {
  return fetchChartZone(pid, "pitchzone");
}

/** 탈삼진 분포도 */
export function fetchKsZone(pid: number): Promise<ZoneGrid | null> {
  return fetchChartZone(pid, "kszone");
}

/** 구역별 피안타율 */
export function fetchBaZone(pid: number): Promise<ZoneGrid | null> {
  return fetchChartZone(pid, "bazone");
}
