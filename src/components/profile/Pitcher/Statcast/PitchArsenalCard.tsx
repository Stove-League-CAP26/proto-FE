// 구종 구성 (Pitch Usage) 컴포넌트 — 도넛 원그래프 + 구종별 구속
import { useState, useEffect } from "react";
import { fetchPitchArsenal } from "@/api/pitchApi";
import type { PitchArsenalItem } from "@/api/pitchApi";

interface PitchArsenalCardProps {
  pid: number;
}

// ── 원그래프 SVG 생성 ────────────────────────────────────────────────────────
function PieChart({ items }: { items: PitchArsenalItem[] }) {
  const SIZE = 220;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = 95;
  const GAP = 1.5;

  const total = items.reduce((s, p) => s + (p.usage ?? 0), 0);

  let cumulative = 0;
  const slices = items.map((p) => {
    const pct = total > 0 ? ((p.usage ?? 0) / total) * 100 : 0;
    const start = cumulative;
    cumulative += pct;
    return { ...p, pct, start, end: cumulative };
  });

  function polarToXY(deg: number, r: number) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
  }

  function slicePath(startDeg: number, endDeg: number): string {
    const s = startDeg + GAP / 2;
    const e = endDeg - GAP / 2;
    if (e - s <= 0) return "";
    const os = polarToXY(s, R);
    const oe = polarToXY(e, R);
    const large = e - s > 180 ? 1 : 0;
    return [
      `M ${CX} ${CY}`,
      `L ${os.x.toFixed(2)} ${os.y.toFixed(2)}`,
      `A ${R} ${R} 0 ${large} 1 ${oe.x.toFixed(2)} ${oe.y.toFixed(2)}`,
      "Z",
    ].join(" ");
  }

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full">
      {slices.map((s) => {
        const startDeg = s.start * 3.6;
        const endDeg = s.end * 3.6;
        const midDeg = (startDeg + endDeg) / 2;
        const labelR = R * 0.62;
        const lx = CX + labelR * Math.cos(((midDeg - 90) * Math.PI) / 180);
        const ly = CY + labelR * Math.sin(((midDeg - 90) * Math.PI) / 180);
        const showLabel = s.pct >= 7;
        const nameParts = s.name.split(" ");
        const pctStr = `${Math.round(s.pct * 10) / 10}%`;
        // 이름 줄 수에 따라 전체 블록 y 중앙 정렬
        const lineH = 10;
        const totalLines = nameParts.length + 1; // 이름 줄 + 퍼센트 1줄
        const blockStartY = ly - ((totalLines - 1) * lineH) / 2;
        return (
          <g key={s.abbr}>
            <path
              d={slicePath(startDeg, endDeg)}
              fill={s.color}
              opacity={0.9}
            />
            {showLabel && (
              <text textAnchor="middle" style={{ pointerEvents: "none" }}>
                {nameParts.map((part, i) => (
                  <tspan
                    key={i}
                    x={lx.toFixed(2)}
                    y={(blockStartY + i * lineH).toFixed(2)}
                    dominantBaseline="middle"
                    fontSize="8"
                    fontWeight="700"
                    fill="white"
                  >
                    {part}
                  </tspan>
                ))}
                <tspan
                  x={lx.toFixed(2)}
                  y={(blockStartY + nameParts.length * lineH).toFixed(2)}
                  dominantBaseline="middle"
                  fontSize="9"
                  fontWeight="900"
                  fill="white"
                  opacity="0.95"
                >
                  {pctStr}
                </tspan>
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export default function PitchArsenalCard({ pid }: PitchArsenalCardProps) {
  const [arsenal, setArsenal] = useState<PitchArsenalItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pid) return;
    setLoading(true);
    setArsenal([]);
    fetchPitchArsenal(pid)
      .then(setArsenal)
      .finally(() => setLoading(false));
  }, [pid]);

  // usage 합산 후 정규화된 퍼센트 계산
  const total = arsenal.reduce((s, p) => s + (p.usage ?? 0), 0);
  const normalized = arsenal.map((p) => ({
    ...p,
    pctNorm: total > 0 ? Math.round(((p.usage ?? 0) / total) * 1000) / 10 : 0,
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-5 rounded-full bg-red-500" />
        <h3 className="font-bold text-gray-800 text-sm">
          구종 구성 (Pitch Usage)
        </h3>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-36 text-gray-300 text-sm">
          로딩 중...
        </div>
      )}

      {!loading && arsenal.length === 0 && (
        <div className="flex items-center justify-center h-36 text-gray-300 text-sm">
          구종 데이터가 없습니다.
        </div>
      )}

      {!loading && arsenal.length > 0 && (
        <div className="flex items-start gap-5">
          {/* 원그래프 */}
          <div className="w-52 h-52 flex-shrink-0">
            <PieChart items={arsenal} />
          </div>

          {/* 구종별 목록 */}
          <div className="flex-1 space-y-2 min-w-0">
            {normalized.map((p) => (
              <div key={p.abbr} className="flex items-center gap-2">
                {/* 색상 도트 + 약어 */}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <span className="text-xs font-black text-gray-600 w-6 flex-shrink-0">
                  {p.abbr}
                </span>
                {/* 구종명 */}
                <span className="text-xs text-gray-500 flex-1 truncate">
                  {p.name}
                </span>
                {/* 구속 */}
                <span className="text-xs font-bold text-gray-500 flex-shrink-0">
                  {p.speed != null ? `${p.speed}km/h` : "-"}
                </span>
                {/* 비율 */}
                <span
                  className="text-xs font-black flex-shrink-0 w-10 text-right"
                  style={{ color: p.color }}
                >
                  {p.pctNorm}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
