// 타구 방향 분포 컴포넌트
// 부채꼴을 LF / CF / RF 3등분하고 퍼센테이지 높을수록 노란색이 진해짐

interface HitDirectionChartProps {
  hitDistrib: { LF: string; CF: string; RF: string };
}

function parsePct(val: string): number {
  if (!val || val === "-") return 0;
  return parseFloat(val.replace("%", "").trim()) || 0;
}

function yellowFill(pct: number, max: number): string {
  if (max === 0) return "rgba(253, 224, 71, 0.15)";
  const ratio = pct / max;
  const alpha = 0.15 + ratio * 0.75;
  return `rgba(253, 224, 71, ${alpha.toFixed(2)})`;
}

function sectorPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

function labelPos(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): { x: number; y: number } {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
  const mid = (startDeg + endDeg) / 2;
  return {
    x: cx + r * 0.65 * Math.cos(toRad(mid)),
    y: cy + r * 0.65 * Math.sin(toRad(mid)),
  };
}

export default function HitDirectionChart({
  hitDistrib,
}: HitDirectionChartProps) {
  const lf = parsePct(hitDistrib.LF);
  const cf = parsePct(hitDistrib.CF);
  const rf = parsePct(hitDistrib.RF);
  const max = Math.max(lf, cf, rf);

  const CX = 99,
    CY = 182,
    R = 180;
  const sectors = [
    { key: "LF", label: "LF", val: lf, start: -45, end: -20 },
    { key: "CF", label: "CF", val: cf, start: -20, end: 20 },
    { key: "RF", label: "RF", val: rf, start: 20, end: 45 },
  ];

  const bars = [
    { key: "LF", val: lf, display: hitDistrib.LF },
    { key: "CF", val: cf, display: hitDistrib.CF },
    { key: "RF", val: rf, display: hitDistrib.RF },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 rounded-full bg-green-500" />
        <h3 className="font-bold text-gray-800 text-sm">타구 방향 분포</h3>
      </div>

      <div className="flex justify-center">
        <svg viewBox="0 0 200 185" className="w-80 h-48">
          <path d={sectorPath(CX, CY, R, -45, 45)} fill="#4a7c4a" />
          <rect
            x="55"
            y="102"
            width="70"
            height="70"
            fill="#c8a26a"
            transform="rotate(45 100 146)"
          />
          <ellipse cx={CX} cy="140" rx="14" ry="14" fill="#4a7c4a" />

          {sectors.map((s) => (
            <path
              key={s.key}
              d={sectorPath(CX, CY, R, s.start, s.end)}
              fill={yellowFill(s.val, max)}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
            />
          ))}

          {(
            [
              [CX, 90],
              [CX + 43, 133],
              [CX, 175],
              [CX - 43, 133],
            ] as [number, number][]
          ).map(([x, y], i) => (
            <rect
              key={i}
              x={x - 4}
              y={y - 4}
              width="8"
              height="8"
              fill="white"
              transform={`rotate(45 ${x} ${y})`}
            />
          ))}

          <polygon
            points={`${CX - 5},${CY - 4} ${CX + 5},${CY - 4} ${CX + 5},${CY + 2} ${CX},${CY + 6} ${CX - 5},${CY + 2}`}
            fill="white"
          />

          {sectors.map((s) => (
            <line
              key={s.key + "_line"}
              x1={CX}
              y1={CY}
              x2={CX + R * Math.cos(((s.start - 90) * Math.PI) / 180)}
              y2={CY + R * Math.sin(((s.start - 90) * Math.PI) / 180)}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1"
              strokeDasharray="4,3"
            />
          ))}

          {sectors.map((s) => {
            const pos = labelPos(CX, CY, R, s.start, s.end);
            return (
              <g key={s.key + "_label"}>
                <text
                  x={pos.x}
                  y={pos.y - 6}
                  textAnchor="middle"
                  fontSize="15"
                  fontWeight="700"
                  fill="white"
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}
                >
                  {s.label}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 7}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="800"
                  fill="#ff8800"
                  style={{ textShadow: "1px 1px 1px rgba(0,0,0,0.8)" }}
                >
                  {s.val > 0 ? `${s.val}%` : "-"}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 하단 막대그래프 */}
      <div className="mt-4 space-y-2">
        {bars.map(({ key, val, display }) => {
          const isMax = val === max && max > 0;
          const barPct = max > 0 ? (val / max) * 100 : 0;
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 w-6 flex-shrink-0">
                {key}
              </span>
              <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: `${barPct}%`,
                    backgroundColor: isMax ? "#f59e0b" : "#9ca3af",
                    minWidth: val > 0 ? "2rem" : "0",
                  }}
                >
                  <span className="text-white text-xs font-bold">
                    {display || "-"}
                  </span>
                </div>
              </div>
              {isMax && (
                <span className="text-xs font-black text-amber-500 flex-shrink-0">
                  MOST
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
