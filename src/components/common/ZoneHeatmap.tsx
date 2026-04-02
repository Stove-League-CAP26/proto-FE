// 존 히트맵 공통 컴포넌트
// HotColdTab(타자 핫콜드존/삼진분포), PitchZoneTab(투구분포/탈삼진분포) 에서 공유
// 구조: 외곽 코너 4칸 + 중앙 3×3 격자 (내부가 외곽 위로 겹침)

interface ZoneCell {
  val: string;
  step: number;
}

export interface ZoneGrid {
  outer: ZoneCell[]; // [TL, TR, BL, BR]
  inner: ZoneCell[]; // 9칸 row-major
}

interface ZoneHeatmapProps {
  zone: ZoneGrid;
  footnote?: string;
}

// ── 히트맵 색상 (step 1=파랑/저 ~ 5=빨강/고) ─────────────────────────────────
const HEAT: Record<number, string> = {
  1: "#4A90D9",
  2: "#82B8E8",
  3: "#C8C8C8",
  4: "#F08080",
  5: "#D94040",
};

function heatColor(step: number): string {
  return HEAT[Math.min(5, Math.max(1, step))] ?? HEAT[3];
}

const TOTAL = 280;
const OUTER = 139;
const INNER = 168;
const INNER_OFFSET = OUTER - 85; // overlap: 85px

const CELL_SIZE = INNER / 3;

export default function ZoneHeatmap({ zone, footnote }: ZoneHeatmapProps) {
  const [tl, tr, bl, br] = zone.outer;

  const baseCell: React.CSSProperties = {
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 12,
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* ── 히트맵 컨테이너 ── */}
      <div style={{ position: "relative", width: TOTAL, height: TOTAL }}>
        {/* ── 레이어 1: 외곽 코너 4칸 ── */}
        {[
          {
            cell: tl,
            top: 0,
            left: 0,
            alignItems: "flex-start",
            justifyContent: "flex-start",
          },
          {
            cell: tr,
            top: 0,
            left: TOTAL - OUTER,
            alignItems: "flex-start",
            justifyContent: "flex-end",
          },
          {
            cell: bl,
            top: TOTAL - OUTER,
            left: 0,
            alignItems: "flex-end",
            justifyContent: "flex-start",
          },
          {
            cell: br,
            top: TOTAL - OUTER,
            left: TOTAL - OUTER,
            alignItems: "flex-end",
            justifyContent: "flex-end",
          },
        ].map(({ cell: c, top, left, alignItems, justifyContent }, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top,
              left,
              width: OUTER,
              height: OUTER,
              backgroundColor: heatColor(c?.step ?? 3),
              fontSize: 13,
              fontWeight: 700,
              color: "white",
              borderRadius: 4,
              display: "flex",
              alignItems,
              justifyContent,
              padding: 8,
            }}
          >
            {c?.val ?? "-"}
          </div>
        ))}

        {/* ── 레이어 2: 내부 3×3 (외곽 위로 겹침) ── */}
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
                ...baseCell,
                backgroundColor: heatColor(c?.step ?? 3),
                borderRadius: 3,
                border: "1.5px solid rgba(128, 128, 128, 0.5)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
              }}
            >
              {c?.val ?? "-"}
            </div>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-1 mt-4">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex flex-col items-center gap-0.5">
            <div
              className="w-7 h-3 rounded-sm"
              style={{ backgroundColor: heatColor(s) }}
            />
            <span className="text-xs text-gray-400">
              {s === 1 ? "저" : s === 5 ? "고" : ""}
            </span>
          </div>
        ))}
      </div>

      {footnote && (
        <p className="text-xs text-gray-400 text-center mt-1">{footnote}</p>
      )}
    </div>
  );
}
