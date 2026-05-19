// src/components/compare/CompareRadarChart.tsx

interface CompareRadarChartProps {
  dataA: Record<string, number>;
  dataB: Record<string, number>;
  nameA: string;
  nameB: string;
}

const SIZE = 460;
const LEGEND_HEIGHT = 36;
const VIEW_H = SIZE + LEGEND_HEIGHT;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 120;
const LEVELS = 5;
const LABEL_R = R + 56;

function polar(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

const COLOR_A = "hsl(220,65%,62%)";
const COLOR_B = "hsl(0,65%,62%)";

export default function CompareRadarChart({
  dataA,
  dataB,
  nameA,
  nameB,
}: CompareRadarChartProps) {
  const keys = Object.keys(dataA);
  const N = keys.length;
  if (N === 0) return null;

  const valsA = keys.map((k) => dataA[k] ?? 0);
  const valsB = keys.map((k) => dataB[k] ?? 0);
  const angleStep = 360 / N;

  const gridPolygons = Array.from({ length: LEVELS }, (_, li) => {
    const ratio = (li + 1) / LEVELS;
    return keys
      .map((_, i) => {
        const p = polar(i * angleStep, R * ratio);
        return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
      })
      .join(" ");
  });

  const ptsA = valsA.map((v, i) => polar(i * angleStep, (v / 100) * R));
  const ptsB = valsB.map((v, i) => polar(i * angleStep, (v / 100) * R));
  const polyA =
    ptsA
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`,
      )
      .join(" ") + " Z";
  const polyB =
    ptsB
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`,
      )
      .join(" ") + " Z";

  const shortA = nameA.split(" ")[0];
  const shortB = nameB.split(" ")[0];

  // 범례 중앙 정렬
  const legendItemW = 80;
  const legendGap = 20;
  const legendTotalW = legendItemW * 2 + legendGap;
  const legendStartX = (SIZE - legendTotalW) / 2;
  const legendY = SIZE + 12;

  return (
    <svg viewBox={`0 0 ${SIZE} ${VIEW_H}`} className="w-full h-full">
      <rect width={SIZE} height={VIEW_H} fill="#1a1a2e" rx="16" />

      {/* 격자 */}
      {gridPolygons.map((pts, li) => (
        <polygon
          key={li}
          points={pts}
          fill={li === LEVELS - 1 ? "rgba(255,255,255,0.02)" : "none"}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
      ))}

      {/* 축선 */}
      {keys.map((_, i) => {
        const end = polar(i * angleStep, R);
        return (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={end.x.toFixed(2)}
            y2={end.y.toFixed(2)}
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="1"
          />
        );
      })}

      {/* B 폴리곤 (뒤) */}
      <path
        d={polyB}
        fill="rgba(239,68,68,0.15)"
        stroke={COLOR_B}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {ptsB.map((p, i) => (
        <circle
          key={i}
          cx={p.x.toFixed(2)}
          cy={p.y.toFixed(2)}
          r="4.5"
          fill={COLOR_B}
        />
      ))}

      {/* A 폴리곤 (앞) */}
      <path
        d={polyA}
        fill="rgba(59,130,246,0.15)"
        stroke={COLOR_A}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {ptsA.map((p, i) => (
        <circle
          key={i}
          cx={p.x.toFixed(2)}
          cy={p.y.toFixed(2)}
          r="4.5"
          fill={COLOR_A}
        />
      ))}

      {/* 라벨 */}
      {keys.map((k, i) => {
        const lp = polar(i * angleStep, LABEL_R);
        return (
          <g key={k}>
            {/* 항목명 */}
            <text
              x={lp.x.toFixed(2)}
              y={(lp.y - 13).toFixed(2)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="17"
              fontWeight="800"
              fill="rgba(255,255,255,0.85)"
              style={{ userSelect: "none" }}
            >
              {k}
            </text>
            {/* A 수치 */}
            <text
              x={(lp.x - 13).toFixed(2)}
              y={(lp.y + 11).toFixed(2)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="15"
              fontWeight="700"
              fill={COLOR_A}
              style={{ userSelect: "none" }}
            >
              {valsA[i]}
            </text>
            {/* B 수치 */}
            <text
              x={(lp.x + 13).toFixed(2)}
              y={(lp.y + 11).toFixed(2)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="15"
              fontWeight="700"
              fill={COLOR_B}
              style={{ userSelect: "none" }}
            >
              {valsB[i]}
            </text>
          </g>
        );
      })}

      {/* 범례 — 중앙 정렬 */}
      {/* A */}
      <line
        x1={legendStartX}
        y1={legendY + 5}
        x2={legendStartX + 16}
        y2={legendY + 5}
        stroke={COLOR_A}
        strokeWidth="2.5"
      />
      <circle cx={legendStartX + 8} cy={legendY + 5} r="3.5" fill={COLOR_A} />
      <text
        x={legendStartX + 24}
        y={legendY + 10}
        fontSize="13"
        fill={COLOR_A}
        fontWeight="700"
        style={{ userSelect: "none" }}
      >
        {shortA}
      </text>

      {/* B */}
      <line
        x1={legendStartX + legendItemW + legendGap}
        y1={legendY + 5}
        x2={legendStartX + legendItemW + legendGap + 16}
        y2={legendY + 5}
        stroke={COLOR_B}
        strokeWidth="2.5"
      />
      <circle
        cx={legendStartX + legendItemW + legendGap + 8}
        cy={legendY + 5}
        r="3.5"
        fill={COLOR_B}
      />
      <text
        x={legendStartX + legendItemW + legendGap + 24}
        y={legendY + 10}
        fontSize="13"
        fill={COLOR_B}
        fontWeight="700"
        style={{ userSelect: "none" }}
      >
        {shortB}
      </text>
    </svg>
  );
}
