// 타자 핫/콜드존 탭 — HOT&COLD ZONE + 삼진 분포도
// 타구 방향 분포는 HitterStatcastTab으로 이동

interface ZoneCell {
  val: string;
  step: number;
}

interface HotColdTabData {
  outer: ZoneCell[];
  inner: ZoneCell[];
  strikeout: { outer: ZoneCell[]; inner: ZoneCell[] };
  hitDistrib: { LF: string; CF: string; RF: string }; // HitterStatcastTab에서 사용, 여기선 미사용
}

interface HotColdTabProps {
  data: HotColdTabData;
  dataSource?: "db" | "mock" | "loading";
}

// ─── 히트맵 색상 (step 1=파랑/콜드 ~ 5=빨강/핫) ──────────────────────────────
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

// ─── 존 히트맵 공통 컴포넌트 ─────────────────────────────────────────────────
function ZoneHeatmap({
  zone,
}: {
  zone: { outer: ZoneCell[]; inner: ZoneCell[] };
}) {
  const [tl, tr, bl, br] = zone.outer;

  const cell = (c: ZoneCell, extra?: React.CSSProperties) => ({
    backgroundColor: heatColor(c?.step ?? 3),
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 12,
    ...extra,
  });

  return (
    <div className="flex flex-col items-center w-full">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "80px 1fr 1fr 1fr 80px",
          gridTemplateRows: "64px 56px 56px 56px 64px",
          width: "100%",
          maxWidth: 340,
          gap: 2,
        }}
      >
        {/* 외곽 TL */}
        <div
          style={{ ...cell(tl, { fontSize: 13 }), gridRow: 1, gridColumn: 1 }}
        >
          {tl?.val ?? "-"}
        </div>
        {/* 상단 중앙 빈칸 */}
        <div
          style={{
            gridRow: 1,
            gridColumn: "2 / 5",
            backgroundColor: "#E5E7EB",
          }}
        />
        {/* 외곽 TR */}
        <div
          style={{ ...cell(tr, { fontSize: 13 }), gridRow: 1, gridColumn: 5 }}
        >
          {tr?.val ?? "-"}
        </div>

        {/* inner 3×3 */}
        {zone.inner.map((c, i) => (
          <div
            key={i}
            style={{
              ...cell(c),
              gridRow: Math.floor(i / 3) + 2,
              gridColumn: (i % 3) + 2,
            }}
          >
            {c?.val ?? "-"}
          </div>
        ))}

        {/* 좌측 중앙 빈칸 */}
        <div
          style={{
            gridRow: "2 / 5",
            gridColumn: 1,
            backgroundColor: "#E5E7EB",
          }}
        />
        {/* 우측 중앙 빈칸 */}
        <div
          style={{
            gridRow: "2 / 5",
            gridColumn: 5,
            backgroundColor: "#E5E7EB",
          }}
        />

        {/* 외곽 BL */}
        <div
          style={{ ...cell(bl, { fontSize: 13 }), gridRow: 5, gridColumn: 1 }}
        >
          {bl?.val ?? "-"}
        </div>
        {/* 하단 중앙 빈칸 */}
        <div
          style={{
            gridRow: 5,
            gridColumn: "2 / 5",
            backgroundColor: "#E5E7EB",
          }}
        />
        {/* 외곽 BR */}
        <div
          style={{ ...cell(br, { fontSize: 13 }), gridRow: 5, gridColumn: 5 }}
        >
          {br?.val ?? "-"}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-1 mt-3">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex flex-col items-center gap-0.5">
            <div
              className="w-7 h-3 rounded-sm"
              style={{ backgroundColor: heatColor(s) }}
            />
            <span className="text-xs text-gray-400">
              {s === 1 ? "콜드" : s === 5 ? "핫" : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────
export default function HotColdTab({ data, dataSource }: HotColdTabProps) {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── HOT & COLD ZONE ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-6 rounded-full bg-red-500 inline-block" />
          <h3 className="font-bold text-gray-800">HOT &amp; COLD ZONE</h3>
          {badge}
        </div>
        <ZoneHeatmap zone={{ outer: data.outer, inner: data.inner }} />
        <p className="text-xs text-gray-400 text-center mt-2">
          타자 시점 기준 (타율)
        </p>
      </div>

      {/* ── 삼진 분포도 ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-6 rounded-full bg-yellow-400 inline-block" />
          <h3 className="font-bold text-gray-800">삼진 분포도</h3>
          {badge}
        </div>
        <ZoneHeatmap zone={data.strikeout} />
        <p className="text-xs text-gray-400 text-center mt-2">
          타자 시점 기준 (삼진비율)
        </p>
      </div>
    </div>
  );
}
