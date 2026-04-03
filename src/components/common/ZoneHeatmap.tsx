// 존 히트맵 공통 컴포넌트
//
// colorMode:
//   "hotcold"  — 높음=빨강, 낮음=파랑 (HOT&COLD ZONE, 탈삼진 분포도)
//   "inverted" — 높음=파랑, 낮음=빨강 (타자 삼진 분포도)
//   "single"   — 단색 그라데이션, 높음=진빨강, 낮음=연빨강 (투구 분포도)
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

export type ZoneColorMode = "hotcold" | "inverted" | "single";

interface ZoneHeatmapProps {
  zone: ZoneGrid;
  footnote?: string;
  colorMode?: ZoneColorMode;
}

// ── 5단계 팔레트 (네이버 스포츠 톤) ─────────────────────────────────────────
// step 1=진파랑, 2=중파랑, 3=회색, 4=중빨강, 5=진빨강

const PALETTE_HOTCOLD: Record<number, { bg: string; text: string }> = {
  1: { bg: "#5B9BD5", text: "#ffffff" }, // 진파랑
  2: { bg: "#92C0E8", text: "#ffffff" }, // 중파랑
  3: { bg: "#E8E8E8", text: "#888888" }, // 회색
  4: { bg: "#E07878", text: "#ffffff" }, // 중빨강
  5: { bg: "#CC4444", text: "#ffffff" }, // 진빨강
};

const PALETTE_INVERTED: Record<number, { bg: string; text: string }> = {
  1: { bg: "#CC4444", text: "#ffffff" }, // 진빨강
  2: { bg: "#E07878", text: "#ffffff" }, // 중빨강
  3: { bg: "#E8E8E8", text: "#888888" }, // 회색
  4: { bg: "#92C0E8", text: "#ffffff" }, // 중파랑
  5: { bg: "#5B9BD5", text: "#ffffff" }, // 진파랑
};

const PALETTE_SINGLE: Record<number, { bg: string; text: string }> = {
  1: { bg: "#d3eed3", text: "#1a4a1a" }, // 극연초록
  2: { bg: "#a3d6a3", text: "#ffffff" }, // 연초록
  3: { bg: "#6abd6a", text: "#ffffff" }, // 중초록
  4: { bg: "#359435", text: "#ffffff" }, // 진중초록
  5: { bg: "#145214", text: "#ffffff" }, // 진초록
};

// 값 없음("-") 전용 스타일
const EMPTY_STYLE = { bg: "#E8E8E8", text: "#888888" };

function getPalette(mode: ZoneColorMode) {
  if (mode === "inverted") return PALETTE_INVERTED;
  if (mode === "single") return PALETTE_SINGLE;
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
      <div style={{ position: "relative", width: TOTAL, height: TOTAL }}>
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
              ...getStyle(c?.val ?? "-", c?.step ?? 3, colorMode),
            }}
          >
            {c?.val ?? "-"}
          </div>
        ))}

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
                boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
                ...getStyle(c?.val ?? "-", c?.step ?? 3, colorMode),
              }}
            >
              {c?.val ?? "-"}
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
