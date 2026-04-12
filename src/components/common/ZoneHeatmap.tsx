// 존 히트맵 공통 컴포넌트
//
// colorMode:
//   "hotcold"    — 상대값 기준 높음=빨강, 낮음=파랑 (HOT&COLD ZONE)
//                  ★ 백엔드 step 무시, 이 선수 존 내 min~max 상대값으로 step 재계산
//   "inverted"   — 파란 단색 그라데이션 (타자 삼진 분포도)
//   "single"     — 단색 그라데이션, 높음=진초록 (투구 분포도)
//   "single-red" — 단색 그라데이션, 높음=진빨강 (탈삼진 분포도)

interface ZoneCell {
  val: string;
  step: number; // 1~5
}

export interface ZoneGrid {
  outer: ZoneCell[];
  inner: ZoneCell[];
}

export type ZoneColorMode = "hotcold" | "inverted" | "single" | "single-red";

interface ZoneHeatmapProps {
  zone: ZoneGrid;
  footnote?: string;
  colorMode?: ZoneColorMode;
}

// ── 5단계 팔레트 ─────────────────────────────────────────────

const PALETTE_HOTCOLD: Record<number, { bg: string; text: string }> = {
  1: { bg: "#1D4ED8", text: "#ffffff" }, // 진파랑 (최저)
  2: { bg: "#93C5FD", text: "#1e3a8a" }, // 연파랑
  3: { bg: "#F3F4F6", text: "#6B7280" }, // 중립
  4: { bg: "#FCA5A5", text: "#7f1d1d" }, // 연빨강
  5: { bg: "#DC2626", text: "#ffffff" }, // 진빨강 (최고)
};

const PALETTE_INVERTED: Record<number, { bg: string; text: string }> = {
  1: { bg: "#dbeafe", text: "#1e3a8a" },
  2: { bg: "#93c5fd", text: "#1e3a8a" },
  3: { bg: "#3b82f6", text: "#ffffff" },
  4: { bg: "#1d4ed8", text: "#ffffff" },
  5: { bg: "#1e3a8a", text: "#ffffff" },
};

const PALETTE_SINGLE: Record<number, { bg: string; text: string }> = {
  1: { bg: "#d3eed3", text: "#1a4a1a" },
  2: { bg: "#a3d6a3", text: "#ffffff" },
  3: { bg: "#6abd6a", text: "#ffffff" },
  4: { bg: "#359435", text: "#ffffff" },
  5: { bg: "#145214", text: "#ffffff" },
};

const PALETTE_SINGLE_RED: Record<number, { bg: string; text: string }> = {
  1: { bg: "#fee2e2", text: "#991b1b" },
  2: { bg: "#fca5a5", text: "#7f1d1d" },
  3: { bg: "#f87171", text: "#ffffff" },
  4: { bg: "#dc2626", text: "#ffffff" },
  5: { bg: "#991b1b", text: "#ffffff" },
};

const EMPTY_STYLE = { bg: "#E8E8E8", text: "#888888" };

// ── 상대값 step 재계산 (전체 colorMode 공통) ─────────────────
//
// 백엔드 step은 절대 수치 구간 기준 → 값이 좁은 범위에 몰리면 전부 같은 색.
// 이 선수의 outer+inner 전체 값 중 min~max를 기준으로 1~5를 재배정한다.

function computeRelativeStepMap(
  zone: ZoneGrid,
  // hotcold 전용: 절대 임계값 이상이면 최소 step 보장
  // ex) { threshold: 0.300, minStep: 4 } → 타율 3할 이상은 최소 연한빨강(step 4)
  absoluteMin?: { threshold: number; minStep: number },
): Map<ZoneCell, number> {
  const allCells = [...(zone.outer ?? []), ...(zone.inner ?? [])];

  const numeric = allCells
    .map((c) => ({ cell: c, num: parseFloat(c?.val ?? "") }))
    .filter(({ num }) => !isNaN(num));

  const stepMap = new Map<ZoneCell, number>();
  if (numeric.length === 0) return stepMap;

  const min = Math.min(...numeric.map((x) => x.num));
  const max = Math.max(...numeric.map((x) => x.num));
  const range = max - min;

  numeric.forEach(({ cell, num }) => {
    const normalized = range === 0 ? 0.5 : (num - min) / range;
    const relativeStep = Math.min(
      5,
      Math.max(1, Math.round(normalized * 4) + 1),
    );

    // 절대 임계값 적용: 타율 3할 이상이면 최소 연한빨강(step 4) 보장
    const absoluteFloor =
      absoluteMin && num >= absoluteMin.threshold ? absoluteMin.minStep : 1;

    stepMap.set(cell, Math.max(relativeStep, absoluteFloor));
  });

  return stepMap;
}

// ── 팔레트 / 스타일 헬퍼 ─────────────────────────────────────

function displayVal(val: string, mode: ZoneColorMode): string {
  if (!val || val === "-") return "-";
  if (mode === "inverted") return `${val}%`;
  return val;
}

function getPalette(mode: ZoneColorMode) {
  if (mode === "inverted") return PALETTE_INVERTED;
  if (mode === "single") return PALETTE_SINGLE;
  if (mode === "single-red") return PALETTE_SINGLE_RED;
  return PALETTE_HOTCOLD;
}

function getStyle(
  cell: ZoneCell,
  mode: ZoneColorMode,
  relativeStepMap?: Map<ZoneCell, number>,
): React.CSSProperties {
  const val = cell?.val ?? "-";
  if (!val || val === "-") {
    return { backgroundColor: EMPTY_STYLE.bg, color: EMPTY_STYLE.text };
  }
  const palette = getPalette(mode);
  // 상대값 step 사용 (모든 모드)
  const step =
    relativeStepMap?.get(cell) ?? Math.min(5, Math.max(1, cell.step ?? 3));

  return {
    backgroundColor: palette[step].bg,
    color: palette[step].text,
  };
}

// ── 레이아웃 상수 ─────────────────────────────────────────────

const TOTAL = 280;
const OUTER = 139;
const INNER = 168;
const INNER_OFFSET = OUTER - 85;
const CELL_SIZE = INNER / 3;

const STRIKE_PADDING = 6;
const STRIKE_LEFT = INNER_OFFSET - STRIKE_PADDING;
const STRIKE_TOP = INNER_OFFSET - STRIKE_PADDING;
const STRIKE_SIZE = INNER + STRIKE_PADDING * 2;

const BALL_PADDING = 4;

// ── 범례 ─────────────────────────────────────────────────────

function LegendBar({ mode }: { mode: ZoneColorMode }) {
  const palette = getPalette(mode);

  // 각 모드별 범례 색상 그라데이션 (step 1→5)
  const gradColors = [1, 2, 3, 4, 5].map((s) => palette[s].bg).join(", ");
  const lowLabel = mode === "inverted" ? "고" : "저";
  const highLabel = mode === "inverted" ? "저" : "고";

  return (
    <div className="flex flex-col items-center gap-1 mt-4">
      <div
        className="h-3 rounded-full"
        style={{
          width: 160,
          background: `linear-gradient(to right, ${gradColors})`,
        }}
      />
      <div className="flex justify-between w-40">
        <span className="text-[10px] font-bold text-gray-500">{lowLabel}</span>
        <span className="text-[10px] font-bold text-gray-400">중간</span>
        <span className="text-[10px] font-bold text-gray-500">{highLabel}</span>
      </div>
      <p className="text-[10px] text-gray-400 mt-0.5">
        색상은 이 선수 존 내 상대값 기준
      </p>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────

export default function ZoneHeatmap({
  zone,
  footnote,
  colorMode = "hotcold",
}: ZoneHeatmapProps) {
  const [tl, tr, bl, br] = zone.outer;

  // 모든 모드에서 상대값 step 재계산 (min~max 기준)
  // hotcold 모드: 타율 0.300 이상이면 최소 step 4(연한빨강) 보장
  const relativeStepMap = computeRelativeStepMap(
    zone,
    colorMode === "hotcold" ? { threshold: 0.3, minStep: 4 } : undefined,
  );

  return (
    <div className="flex flex-col items-center w-full">
      {/* 볼존 라벨 */}
      <div
        style={{
          width: TOTAL,
          textAlign: "left",
          fontSize: 12,
          fontWeight: 700,
          color: "#555555",
          letterSpacing: "0.05em",
          marginBottom: 4,
        }}
      >
        볼존
      </div>

      <div style={{ position: "relative", width: TOTAL, height: TOTAL }}>
        {/* 볼존 테두리 */}
        <div
          style={{
            position: "absolute",
            top: -BALL_PADDING,
            left: -BALL_PADDING,
            width: TOTAL + BALL_PADDING * 2,
            height: TOTAL + BALL_PADDING * 2,
            border: "3px solid #555555",
            borderRadius: 8,
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* 외곽 코너 4칸 */}
        {[
          { cell: tl, top: 0, left: 0, ai: "flex-start", jc: "flex-start" },
          {
            cell: tr,
            top: 0,
            left: TOTAL - OUTER,
            ai: "flex-start",
            jc: "flex-end",
          },
          {
            cell: bl,
            top: TOTAL - OUTER,
            left: 0,
            ai: "flex-end",
            jc: "flex-start",
          },
          {
            cell: br,
            top: TOTAL - OUTER,
            left: TOTAL - OUTER,
            ai: "flex-end",
            jc: "flex-end",
          },
        ].map(({ cell: c, top, left, ai, jc }, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top,
              left,
              width: OUTER,
              height: OUTER,
              borderRadius: 4,
              display: "flex",
              alignItems: ai,
              justifyContent: jc,
              padding: 8,
              fontSize: 13,
              fontWeight: 700,
              zIndex: 2,
              ...getStyle(c, colorMode, relativeStepMap),
            }}
          >
            {displayVal(c?.val ?? "-", colorMode)}
          </div>
        ))}

        {/* 스트라이크존 테두리 */}
        <div
          style={{
            position: "absolute",
            top: STRIKE_TOP + 2,
            left: STRIKE_LEFT + 2,
            width: STRIKE_SIZE,
            height: STRIKE_SIZE,
            border: "3px solid #ff0000",
            borderRadius: 6,
            zIndex: 9,
            pointerEvents: "none",
          }}
        />

        {/* 스트라이크존 라벨 */}
        <div
          style={{
            position: "absolute",
            top: STRIKE_TOP - 15,
            left: STRIKE_LEFT,
            width: STRIKE_SIZE,
            textAlign: "left",
            fontSize: 12,
            fontWeight: 700,
            color: "#ff0000",
            letterSpacing: "0.05em",
            zIndex: 11,
            pointerEvents: "none",
          }}
        >
          스트라이크존
        </div>

        {/* 내부 3×3 */}
        <div
          style={{
            position: "absolute",
            top: INNER_OFFSET,
            left: INNER_OFFSET,
            width: INNER,
            height: INNER,
            display: "grid",
            gridTemplateColumns: `repeat(3, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(3, ${CELL_SIZE}px)`,
            gap: 2,
            zIndex: 10,
          }}
        >
          {zone.inner.map((c, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 12,
                borderRadius: 3,
                border: "1.5px solid rgba(255,255,255,0.6)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.74)",
                ...getStyle(c, colorMode, relativeStepMap),
              }}
            >
              {displayVal(c?.val ?? "-", colorMode)}
            </div>
          ))}
        </div>
      </div>

      <LegendBar mode={colorMode} />

      {footnote && (
        <p className="text-xs text-gray-400 text-center mt-1">{footnote}</p>
      )}
    </div>
  );
}
