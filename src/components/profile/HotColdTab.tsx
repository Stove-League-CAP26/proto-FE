// 타자 핫/콜드존 탭 — 레퍼런스 이미지 기반 히트맵 디자인
// HOT&COLD ZONE + 삼진분포 + 타구방향 3칸

interface ZoneCell {
  val: string;
  step: number;
}

interface HotColdTabData {
  outer: ZoneCell[];
  inner: ZoneCell[];
  strikeout: { outer: ZoneCell[]; inner: ZoneCell[] };
  hitDistrib: { LF: string; CF: string; RF: string };
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

      {/* ── 타구 방향 분포 ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-6 rounded-full bg-green-500 inline-block" />
          <h3 className="font-bold text-gray-800">타구 분포도</h3>
          {badge}
        </div>
        <div className="flex justify-center">
          <svg viewBox="0 0 200 180" className="w-48 h-44">
            <path d="M100,170 L10,80 Q100,10 190,80 Z" fill="#2d6a2d" />
            <path d="M100,150 L60,110 L100,70 L140,110 Z" fill="#c8a26a" />
            <ellipse cx="100" cy="112" rx="28" ry="28" fill="#2d6a2d" />
            {(
              [
                [100, 70],
                [140, 110],
                [100, 150],
                [60, 110],
              ] as [number, number][]
            ).map(([x, y], i) => (
              <rect
                key={i}
                x={x - 4}
                y={y - 4}
                width="8"
                height="8"
                fill="white"
                transform={`rotate(45,${x},${y})`}
              />
            ))}
            <polygon
              points="97,160 103,160 105,166 100,170 95,166"
              fill="white"
            />
            <line
              x1="100"
              y1="170"
              x2="10"
              y2="80"
              stroke="white"
              strokeWidth="1"
              opacity="0.5"
            />
            <line
              x1="100"
              y1="170"
              x2="190"
              y2="80"
              stroke="white"
              strokeWidth="1"
              opacity="0.5"
            />
            <text
              x="45"
              y="70"
              fill="white"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
            >
              LF
            </text>
            <text
              x="100"
              y="38"
              fill="white"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
            >
              CF
            </text>
            <text
              x="155"
              y="70"
              fill="white"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
            >
              RF
            </text>
            <text
              x="45"
              y="83"
              fill="#fbbf24"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
            >
              {data.hitDistrib.LF}
            </text>
            <text
              x="100"
              y="52"
              fill="#fbbf24"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
            >
              {data.hitDistrib.CF}
            </text>
            <text
              x="155"
              y="83"
              fill="#fbbf24"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
            >
              {data.hitDistrib.RF}
            </text>
          </svg>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            ["LF", data.hitDistrib.LF, "bg-green-50 text-green-700"],
            ["CF", data.hitDistrib.CF, "bg-blue-50  text-blue-700"],
            ["RF", data.hitDistrib.RF, "bg-purple-50 text-purple-700"],
          ].map(([k, v, cls]) => (
            <div key={k} className={`rounded-xl p-3 text-center ${cls}`}>
              <p className="text-xs font-medium">{k}</p>
              <p className="text-xl font-black">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
