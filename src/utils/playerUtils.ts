// 선수 프로필 관련 유틸 함수 모음
import type { HitterStat, PitcherStat } from "@/types/playerStats";

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

// ── 타자 레이더 레이블 ───────────────────────────────────────────────────────
// A안: 파워 · 컨택 · 장타 · 스피드 · 타점 · 눈
const HITTER_RADAR_LABEL: Record<string, string> = {
  contact: "컨택",
  eye: "선구안",
  speed: "스피드",
  power: "파워",
  contrib: "타점",
  ops: "OPS",
};

// ── 투수 레이더 레이블 ───────────────────────────────────────────────────────
// A안: 평균자책 · 제구 · 삼진 · 내구 · 피홈런 · 피안타
const PITCHER_RADAR_LABEL: Record<string, string> = {
  era: "평균자책", // ← 수정
  whip: "WHIP",
  hrControl: "장타억제",
  hitControl: "피안타억제",
  control: "제구",
  strikeout: "삼진",
};

// 표시 순서 고정 (육각형 배치: 12시부터 시계방향)
const HITTER_ORDER = ["컨택", "선구안", "스피드", "파워", "타점", "OPS"];
const PITCHER_ORDER = [
  "평균자책",
  "WHIP",
  "장타억제",
  "피안타억제",
  "제구",
  "삼진",
];

export function mapHitterRadar(
  raw: Record<string, number | string>,
): Record<string, number> {
  const mapped = Object.fromEntries(
    Object.entries(raw)
      //.filter(([k]) => k !== "style")
      .map(([k, v]) => [HITTER_RADAR_LABEL[k] ?? k, v as number]),
  );
  // 순서 정렬
  return Object.fromEntries(
    HITTER_ORDER.filter((k) => k in mapped).map((k) => [k, mapped[k]]),
  );
}

export function mapPitcherRadar(
  raw: Record<string, number | string>,
): Record<string, number> {
  const mapped = Object.fromEntries(
    Object.entries(raw)
      //.filter(([k]) => k !== "style")
      .map(([k, v]) => [PITCHER_RADAR_LABEL[k] ?? k, v as number]),
  );
  return Object.fromEntries(
    PITCHER_ORDER.filter((k) => k in mapped).map((k) => [k, mapped[k]]),
  );
}
