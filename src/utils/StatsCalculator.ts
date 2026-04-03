/**
 * StatsCalculator.ts
 * KBO 스탯 계산 유틸리티
 *
 * 타자 WAR: wOBA 기반 (근사치, KBO 리그 상수 적용)
 * 투수 FIP/WAR: FIP 기반 (KBO 리그 상수 적용)
 *
 * ─ KBO 리그 상수 (2023~2025 시즌 근사값) ─
 *   lgwOBA     = 0.325   (리그 평균 wOBA)
 *   wOBA_scale = 1.15
 *   FIP상수    = 3.20
 *   lgFIP      = 4.20    (리그 평균 FIP)
 *   runsPerWin = 9.5
 */

// ─── 타입 ──────────────────────────────────────────────────────────────────

export interface HitterCombinedStat {
  pid?: number;
  season: number;
  team: string;
  g?: number | null;
  pa?: number | null;
  ab?: number | null;
  r?: number | null;
  h?: number | null;
  b2?: number | null;
  b3?: number | null;
  hr?: number | null;
  tb?: number | null;
  rbi?: number | null;
  sb?: number | null; // 도루
  sac?: number | null;
  sf?: number | null;
  avg?: number | null;
  // extra
  bb?: number | null;
  ibb?: number | null;
  hbp?: number | null;
  so?: number | null;
  gdp?: number | null;
  slg?: number | null;
  obp?: number | null;
  ops?: number | null;
  mh?: number | null;
  risp?: number | null;
  phBa?: number | null;
}

export interface PitcherStatRaw {
  pid?: number;
  season: number;
  team: string;
  g?: number | null;
  w?: number | null;
  l?: number | null;
  sv?: number | null;
  ip?: string | number | null;
  era?: number | null;
  whip?: number | null;
  so?: number | null;
  bb?: number | null;
  hr?: number | null;
  [key: string]: unknown;
}

// ─── 타자 파생 스탯 계산 ───────────────────────────────────────────────────

export interface HitterDerived {
  obp: number;
  slg: number;
  ops: number;
  bbPct: number; // %
  kPct: number; // %
  war: number;
}

export function calcHitterDerived(s: HitterCombinedStat): HitterDerived {
  const pa = toN(s.pa);
  const ab = toN(s.ab);
  const h = toN(s.h);
  const b2 = toN(s.b2);
  const b3 = toN(s.b3);
  const hr = toN(s.hr);
  const bb = toN(s.bb);
  const hbp = toN(s.hbp);
  const so = toN(s.so);
  const sf = toN(s.sf);

  // 1루타
  const b1 = Math.max(h - hr - b2 - b3, 0);

  // TB (DB값 없으면 직접 계산)
  const tb = toN(s.tb) || b1 + 2 * b2 + 3 * b3 + 4 * hr;

  // OBP: DB값 우선, 없거나 0이면 계산
  const dbObp = toF(s.obp);
  const obp =
    dbObp && dbObp > 0
      ? dbObp
      : ab + bb + hbp + sf > 0
        ? (h + bb + hbp) / (ab + bb + hbp + sf)
        : 0;

  // SLG: DB값 우선
  const dbSlg = toF(s.slg);
  const slg = dbSlg && dbSlg > 0 ? dbSlg : ab > 0 ? tb / ab : 0;

  // OPS: DB값 우선
  const dbOps = toF(s.ops);
  const ops = dbOps && dbOps > 0 ? dbOps : obp + slg;

  // BB%, K%
  const bbPct = pa > 0 ? (bb / pa) * 100 : 0;
  const kPct = pa > 0 ? (so / pa) * 100 : 0;

  // wOBA
  const woba =
    pa > 0
      ? (0.69 * bb +
          0.72 * hbp +
          0.89 * b1 +
          1.27 * b2 +
          1.62 * b3 +
          2.1 * hr) /
        pa
      : 0;

  // WAR (타격 기여 + 대체선수 수준)
  const battingRuns = ((woba - 0.325) / 1.15) * pa;
  const replacementRuns = 0.025 * pa;
  const war = (battingRuns + replacementRuns) / 9.5;

  return { obp, slg, ops, bbPct, kPct, war };
}

// ─── 투수 파생 스탯 계산 ───────────────────────────────────────────────────

export interface PitcherDerived {
  k9: number | null; // 9이닝당 탈삼진
  bb9: number | null; // 9이닝당 볼넷
  kbb: number | null; // K/BB 비율
}

/**
 * IP 문자열 파싱: "15.1" → 15.333...
 * KBO는 소수점 이하가 이닝의 아웃카운트 수를 나타냄 (0~2)
 */
export function parseIP(ip: string | number | null | undefined): number {
  if (ip == null || ip === "") return 0;
  const s = String(ip).trim();
  const parts = s.split(".");
  const full = parseInt(parts[0], 10) || 0;
  const thirds = parts[1] ? Math.min(parseInt(parts[1], 10), 2) : 0; // 최대 2
  return full + thirds / 3;
}

export function calcPitcherDerived(s: PitcherStatRaw): PitcherDerived {
  const ip = parseIP(s.ip);
  const so = toN(s.so);
  const bb = toN(s.bb);

  if (ip <= 0) return { k9: null, bb9: null, kbb: null };

  const k9 = Math.round((so / ip) * 9 * 10) / 10;
  const bb9 = Math.round((bb / ip) * 9 * 10) / 10;
  const kbb = bb > 0 ? Math.round((so / bb) * 100) / 100 : null;

  return { k9, bb9, kbb };
}

// ─── 포매터 ────────────────────────────────────────────────────────────────

/** 타율 포맷: 0.347 → ".347" */
export function fmtAvg(v: number | null | undefined): string {
  const n = toF(v);
  if (!n && n !== 0) return "-";
  return n.toFixed(3).replace(/^0/, "");
}

/** ERA/FIP 포맷: 2.31 */
export function fmtEra(v: number | null | undefined): string {
  const n = toF(v);
  if (!n && n !== 0) return "-";
  return n.toFixed(2);
}

/** WHIP 포맷 */
export function fmtWhip(v: number | null | undefined): string {
  const n = toF(v);
  if (!n && n !== 0) return "-";
  return n.toFixed(2);
}

/** WAR 포맷: 소수 1자리 */
export function fmtWar(v: number | null | undefined): string {
  if (v == null) return "-";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(n)) return "-";
  return n.toFixed(1);
}

/** % 포맷 */
export function fmtPct(v: number): string {
  return v.toFixed(1) + "%";
}

// ─── 내부 유틸 ────────────────────────────────────────────────────────────

function toN(v: unknown): number {
  if (v == null) return 0;
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return isNaN(n) ? 0 : n;
}

function toF(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return isNaN(n) ? null : n;
}
