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
// 백엔드 radar API 응답(영어 키) → 한글 라벨 변환
// ─────────────────────────────────────────────────────────────

const HITTER_RADAR_LABEL: Record<string, string> = {
  power: "파워",
  contact: "컨택",
  extra: "장타력",
  speed: "스피드",
  contrib: "생산성",
  eye: "선구안",
};

const PITCHER_RADAR_LABEL: Record<string, string> = {
  strikeout: "삼진",
  eraControl: "구위",
  control: "제구",
  hrControl: "장타억제",
  stamina: "내구성",
  hitControl: "피안타억제",
};

/** 타자 레이더 응답 → 한글 키 Record (style 제외) */
export function mapHitterRadar(
  raw: Record<string, number | string>,
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(raw)
      .filter(([k]) => k !== "style")
      .map(([k, v]) => [HITTER_RADAR_LABEL[k] ?? k, v as number]),
  );
}

/** 투수 레이더 응답 → 한글 키 Record (style 제외) */
export function mapPitcherRadar(
  raw: Record<string, number | string>,
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(raw)
      .filter(([k]) => k !== "style")
      .map(([k, v]) => [PITCHER_RADAR_LABEL[k] ?? k, v as number]),
  );
}
