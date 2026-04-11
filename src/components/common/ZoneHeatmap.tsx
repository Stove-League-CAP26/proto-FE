// 존 히트맵 공통 컴포넌트
//
// colorMode:
//   "hotcold"  — 높음=빨강, 낮음=파랑 (HOT&COLD ZONE, 탈삼진 분포도)
//   "inverted" — 파란 단색 그라데이션 (타자 삼진 분포도)
//   "single"   — 단색 그라데이션, 높음=진초록, 낮음=연초록 (투구 분포도)
//   "single-red" — 단색 그라데이션, 높음=진빨강, 낮음=연빨강 (탈삼진 분포도)
//
// step: 백엔드에서 내려오는 1~5 값을 그대로 사용

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

// ── 5단계 팔레트 ─────────────────────────────────────────────────────────────

const PALETTE_HOTCOLD: Record<number, { bg: string; text: string }> = {
  1: { bg: "#5B9BD5", text: "#ffffff" },
  2: { bg: "#92C0E8", text: "#ffffff" },
  3: { bg: "#d9eef7", text: "#656565" },
  4: { bg: "#E07878", text: "#ffffff" },
  5: { bg: "#CC4444", text: "#ffffff" },
};

const PALETTE_INVERTED: Record<number, { bg: string; text: string }> = {
  1: { bg: "#dbeafe", text: "#1e3a8a" }, // 극연파랑
  2: { bg: "#93c5fd", text: "#1e3a8a" }, // 연파랑
  3: { bg: "#3b82f6", text: "#ffffff" }, // 중파랑
  4: { bg: "#1d4ed8", text: "#ffffff" }, // 진파랑
  5: { bg: "#1e3a8a", text: "#ffffff" }, // 짙은파랑
};

const PALETTE_SINGLE: Record<number, { bg: string; text: string }> = {
  1: { bg: "#d3eed3", text: "#1a4a1a" },
  2: { bg: "#a3d6a3", text: "#ffffff" },
  3: { bg: "#6abd6a", text: "#ffffff" },
  4: { bg: "#359435", text: "#ffffff" },
  5: { bg: "#145214", text: "#ffffff" },
};

// 빨간 단색 팔레트 — 탈삼진 분포도 전용
const PALETTE_SINGLE_RED: Record<number, { bg: string; text: string }> = {
  1: { bg: "#fee2e2", text: "#991b1b" }, // 극연빨강
  2: { bg: "#fca5a5", text: "#7f1d1d" }, // 연빨강
  3: { bg: "#f87171", text: "#ffffff" }, // 중빨강
  4: { bg: "#dc2626", text: "#ffffff" }, // 진빨강
  5: { bg: "#991b1b", text: "#ffffff" }, // 짙은빨강
};

const EMPTY_STYLE = { bg: "#E8E8E8", text: "#888888" };

// colorMode에 따라 값 표시 포맷 결정
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
  val: string,
  step: number,
  mode: ZoneColorMode,
): React.CSSProperties {
  if (!val || val === "-") {
    return { backgroundColor: EMPTY_STYLE.bg, color: EMPTY_STYLE.text };
  }
  const palette = getPalette(mode);
  const s = Math.min(5, Math.max(1, step ?? 3));
  return {
    backgroundColor: palette[s].bg,
    color: palette[s].text,
  };
}

// ── 레이아웃 상수 ─────────────────────────────────────────────────────────────

const TOTAL = 280;
const OUTER = 139;
const INNER = 168;
const INNER_OFFSET = OUTER - 85;
const CELL_SIZE = INNER / 3;

// 스트라이크존 테두리
const STRIKE_PADDING = 6;
const STRIKE_LEFT = INNER_OFFSET - STRIKE_PADDING;
const STRIKE_TOP = INNER_OFFSET - STRIKE_PADDING;
const STRIKE_SIZE = INNER + STRIKE_PADDING * 2;

// 볼존 테두리 — 전체 TOTAL 영역을 감쌈
const BALL_PADDING = 4;

// ── 범례 ─────────────────────────────────────────────────────────────────────

function LegendBar({ mode }: { mode: ZoneColorMode }) {
  const palette = getPalette(mode);
  const isInverted = mode === "inverted";

  return (
    <div className="flex items-center gap-1 mt-4">
      {[1, 2, 3, 4, 5].map((s) => (
        <div key={s} className="flex flex-col items-center gap-0.5">
          <div
            className="w-7 h-3 rounded-sm"
            style={{ backgroundColor: palette[s].bg }}
          />
          <span className="text-xs text-gray-400">
            {s === 1
              ? isInverted
                ? "고"
                : "저"
              : s === 5
                ? isInverted
                  ? "저"
                  : "고"
                : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export default function ZoneHeatmap({
  zone,
  footnote,
  colorMode = "hotcold",
}: ZoneHeatmapProps) {
  const [tl, tr, bl, br] = zone.outer;

  return (
    <div className="flex flex-col items-center w-full">
      {/* 볼존 라벨 — 박스 위 */}
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
        {/* 볼존 테두리 박스 — 전체 영역 감쌈 */}
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

        {/* 외곽 코너 4칸 (볼존) */}
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
              ...getStyle(c?.val ?? "-", c?.step ?? 3, colorMode),
            }}
          >
            {displayVal(c?.val ?? "-", colorMode)}
          </div>
        ))}

        {/* 스트라이크존 테두리 박스 */}
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

        {/* 내부 3×3 (스트라이크존) */}
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
                boxShadow: "0 1px 4px rgba(0, 0, 0, 0.74)",
                ...getStyle(c?.val ?? "-", c?.step ?? 3, colorMode),
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
