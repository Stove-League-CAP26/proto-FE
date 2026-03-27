// 선수 프로필 관련 유틸 함수 모음
import type { HitterStat, PitcherStat } from "@/types/playerStats";

// ─────────────────────────────────────────────────────────────
// 투수 판별
// "투수(좌투좌타)", "pitcher", "P", "선발", "불펜", "마무리" 등 모두 커버
// ─────────────────────────────────────────────────────────────
export function isPitcher(playerMPosition: string | undefined | null): boolean {
  if (!playerMPosition) return false;
  const pos = playerMPosition.toLowerCase().trim();
  return (
    pos.startsWith("투수") ||
    pos === "pitcher" ||
    pos === "p" ||
    pos.includes("선발") ||
    pos.includes("불펜") ||
    pos.includes("마무리") ||
    pos.includes("pitcher")
  );
}

// ─────────────────────────────────────────────────────────────
// 숫자 포맷 유틸
// ─────────────────────────────────────────────────────────────
export function fmtAvg(v: number | null | undefined) {
  return v != null ? v.toFixed(3) : "-";
}
export function fmtEra(v: number | null | undefined) {
  return v != null ? v.toFixed(2) : "-";
}
export function fmtWhip(v: number | null | undefined) {
  return v != null ? v.toFixed(2) : "-";
}
export function fmtWpct(v: number | null | undefined) {
  return v != null ? v.toFixed(3) : "-";
}

// ─────────────────────────────────────────────────────────────
// 레이더 차트 정규화 유틸
// ─────────────────────────────────────────────────────────────

/** 값을 min~max 범위에서 0~100으로 클램프 정규화 */
export function norm(
  val: number | null | undefined,
  min: number,
  max: number,
): number {
  if (val == null || isNaN(val)) return 0;
  return Math.round(Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100)));
}

/** 타자 스탯 → 레이더 데이터 (최신 시즌 기준) */
export function buildHitterRadar(stats: HitterStat[]): Record<string, number> {
  if (!stats.length)
    return { 타율: 0, 장타력: 0, 출루: 0, 생산성: 0, 안타: 0, 컨택: 0 };

  const s = [...stats].sort((a, b) => b.season - a.season)[0];
  const contactRate = s.ab > 0 ? s.h / s.ab : 0;

  return {
    타율:   norm(s.avg,       0.15, 0.38),
    장타력: norm(s.hr,        0,    45),
    출루:   norm(s.pa,        100,  600),
    생산성: norm(s.rbi,       0,    120),
    안타:   norm(s.h,         20,   180),
    컨택:   norm(contactRate, 0.15, 0.38),
  };
}

/** 투수 스탯 → 레이더 데이터 (최신 시즌 기준) */
export function buildPitcherRadar(stats: PitcherStat[]): Record<string, number> {
  if (!stats.length)
    return { 구위: 0, 탈삼진: 0, 제구: 0, 내구성: 0, 승리: 0, 피안타억제: 0 };

  const s = [...stats].sort((a, b) => b.season - a.season)[0];
  // ERA, 피안타는 낮을수록 좋으므로 역산
  const eraScore  = s.era != null ? norm(5.0 - s.era, -1,   4.5) : 0;
  const hitScore  = s.h   != null ? norm(250 - s.h,   50,   230) : 0;

  return {
    구위:       eraScore,
    탈삼진:     norm(s.so, 0,   230),
    제구:       norm(150 - (s.h ?? 150), -50, 130),
    내구성:     norm(s.ip, 0,   210),
    승리:       norm(s.w,  0,   20),
    피안타억제: hitScore,
  };
}
