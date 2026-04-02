// 투수 투구존 탭 — 레퍼런스 이미지 기반 히트맵 디자인
// - 빨강(높은값) ↔ 파랑(낮은값) 연속 그라디언트
// - 셀 간 gap 없음, 모서리 없음, 흰 텍스트
// - 외곽 코너 4칸 + 중앙 3×3

interface ZoneCell {
  val: string;
  step: number;
}

interface ZoneGrid {
  outer: ZoneCell[]; // [TL, TR, BL, BR]
  inner: ZoneCell[]; // 9칸 row-major
}

interface PitchZoneTabProps {
  pitchZone: ZoneGrid;
  strikeoutZone: ZoneGrid;
  baZone?: ZoneGrid; // 구역별 피안타율 (optional)
  loading?: boolean;
  dataSource?: "db" | "mock" | "loading";
}

// ─── 히트맵 색상 (step 1=파랑/저빈도 ~ 5=빨강/고빈도) ────────────────────────
const HEAT: Record<number, string> = {
  1: "#4A90D9", // 파랑 (낮음)
  2: "#82B8E8", // 연파랑
  3: "#C8C8C8", // 중립 회색
  4: "#F08080", // 연빨강
  5: "#D94040", // 빨강 (높음)
};

function heatColor(step: number): string {
  return HEAT[Math.min(5, Math.max(1, step))] ?? HEAT[3];
}

// ─── 존 그리드 컴포넌트 ────────────────────────────────────────────────────────
// 구조:
//   [outer TL ]          [outer TR ]
//             [in][in][in]
//             [in][in][in]
//             [in][in][in]
//   [outer BL ]          [outer BR ]
//
// CSS Grid 5×5: outer-col | inner×3 | outer-col
//               outer-row | inner×3 | outer-row
function ZoneHeatmap({
  zone,
  footnote,
}: {
  zone: ZoneGrid;
  footnote?: string;
}) {
  const [tl, tr, bl, br] = zone.outer;

  // 셀 스타일 공통
  const cell = (c: ZoneCell, extra?: React.CSSProperties) => ({
    backgroundColor: heatColor(c?.step ?? 3),
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    ...extra,
  });

  return (
    <div className="flex flex-col items-center w-full">
      {/* ── 그리드 컨테이너 ── */}
      <div
        style={{
          display: "grid",
          // 외곽 컬럼 90px, 내부 3칸은 1fr씩
          gridTemplateColumns: "90px 1fr 1fr 1fr 90px",
          // 외곽 행 70px, 내부 3칸은 60px씩
          gridTemplateRows: "70px 60px 60px 60px 70px",
          width: "100%",
          maxWidth: 380,
          gap: 2, // 2px 간격 (이미지처럼 약간의 구분선)
        }}
      >
        {/* 외곽 TL — row1 col1 */}
        <div style={{ ...cell(tl), gridRow: 1, gridColumn: 1, fontSize: 13 }}>
          {tl?.val ?? "-"}
        </div>

        {/* 상단 중앙 빈칸 (inner 없음) — row1 col2~4 */}
        <div
          style={{
            gridRow: 1,
            gridColumn: "2 / 5",
            backgroundColor: "#E5E7EB",
          }}
        />

        {/* 외곽 TR — row1 col5 */}
        <div style={{ ...cell(tr), gridRow: 1, gridColumn: 5, fontSize: 13 }}>
          {tr?.val ?? "-"}
        </div>

        {/* inner 3×3 — row2~4, col2~4 */}
        {zone.inner.map((c, i) => {
          const row = Math.floor(i / 3) + 2; // 2,3,4
          const col = (i % 3) + 2; // 2,3,4
          return (
            <div
              key={i}
              style={{
                ...cell(c),
                gridRow: row,
                gridColumn: col,
                fontSize: 12,
              }}
            >
              {c?.val ?? "-"}
            </div>
          );
        })}

        {/* 좌측 중앙 빈칸 — row2~4 col1 */}
        <div
          style={{
            gridRow: "2 / 5",
            gridColumn: 1,
            backgroundColor: "#E5E7EB",
          }}
        />

        {/* 우측 중앙 빈칸 — row2~4 col5 */}
        <div
          style={{
            gridRow: "2 / 5",
            gridColumn: 5,
            backgroundColor: "#E5E7EB",
          }}
        />

        {/* 외곽 BL — row5 col1 */}
        <div style={{ ...cell(bl), gridRow: 5, gridColumn: 1, fontSize: 13 }}>
          {bl?.val ?? "-"}
        </div>

        {/* 하단 중앙 빈칸 — row5 col2~4 */}
        <div
          style={{
            gridRow: 5,
            gridColumn: "2 / 5",
            backgroundColor: "#E5E7EB",
          }}
        />

        {/* 외곽 BR — row5 col5 */}
        <div style={{ ...cell(br), gridRow: 5, gridColumn: 5, fontSize: 13 }}>
          {br?.val ?? "-"}
        </div>
      </div>

      {/* ── 범례 ── */}
      <div className="flex items-center gap-1 mt-3">
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

// ─── 로딩 스켈레톤 ────────────────────────────────────────────────────────────
function ZoneSkeleton() {
  return (
    <div className="flex justify-center py-6">
      <div className="w-full max-w-sm h-56 bg-gray-100 rounded-lg animate-pulse" />
    </div>
  );
}

// ─── 메인 탭 컴포넌트 ────────────────────────────────────────────────────────
export default function PitchZoneTab({
  pitchZone,
  strikeoutZone,
  baZone,
  loading = false,
  dataSource,
}: PitchZoneTabProps) {
  const sourceBadge =
    dataSource === "db"
      ? {
          label: "DB 데이터",
          cls: "bg-green-50 text-green-600 border-green-200",
        }
      : dataSource === "mock"
        ? {
            label: "샘플 데이터",
            cls: "bg-gray-50 text-gray-400 border-gray-200",
          }
        : null;

  const badge = sourceBadge && (
    <span
      className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full border ${sourceBadge.cls}`}
    >
      {sourceBadge.label}
    </span>
  );

  const cols = baZone
    ? "grid-cols-1 lg:grid-cols-3"
    : "grid-cols-1 lg:grid-cols-2";

  return (
    <div className={`grid ${cols} gap-6`}>
      {/* ── 투구 분포도 ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 rounded-full bg-blue-500" />
          <h3 className="font-bold text-gray-800">투구 분포도</h3>
          {badge}
        </div>
        {loading ? (
          <ZoneSkeleton />
        ) : (
          <ZoneHeatmap
            zone={pitchZone}
            footnote="해당 차트는 투수시점으로 구현되었습니다."
          />
        )}
      </div>

      {/* ── 구역별 피안타율 (있을 때만) ── */}
      {baZone && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 rounded-full bg-emerald-500" />
            <h3 className="font-bold text-gray-800">구역별 피안타율</h3>
            {badge}
          </div>
          {loading ? (
            <ZoneSkeleton />
          ) : (
            <ZoneHeatmap
              zone={baZone}
              footnote="해당 차트는 투수시점으로 구현되었습니다."
            />
          )}
        </div>
      )}

      {/* ── 탈삼진 분포도 ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 rounded-full bg-orange-500" />
          <h3 className="font-bold text-gray-800">탈삼진 분포도</h3>
          {badge}
        </div>
        {loading ? (
          <ZoneSkeleton />
        ) : (
          <ZoneHeatmap
            zone={strikeoutZone}
            footnote="해당 차트는 투수시점으로 구현되었습니다."
          />
        )}
      </div>
    </div>
  );
}
