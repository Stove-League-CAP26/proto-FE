// 선수/팀 능력치를 육각형 레이더 차트로 시각화하는 공통 컴포넌트
// theme="light" : 프로필 페이지용 (어두운 배경, 파란 그라디언트)
// theme="dark"  : 팀 페이지용 (어두운 배경, 골드/레드 그라디언트)

interface RadarChartProps {
  data: Record<string, number>;
  theme?: "light" | "dark";
}

export default function RadarChart({ data, theme = "light" }: RadarChartProps) {
  const keys = Object.keys(data);
  const vals = Object.values(data);
  const N = keys.length;
  const cx = 160,
    cy = 160,
    r = 110;

  const angleOf = (i: number) => (Math.PI * 2 * i) / N - Math.PI / 2;
  const ptOf = (i: number, val: number) => {
    const a = angleOf(i);
    const d = (val / 100) * r;
    return { x: cx + d * Math.cos(a), y: cy + d * Math.sin(a) };
  };

  const dp = vals.map((v, i) => ptOf(i, v));
  const poly =
    dp.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  const gradId = theme === "dark" ? "radarGradDark" : "radarGradLight";
  const gradFrom = theme === "dark" ? "#f59e0b" : "#3b82f6";
  const gradTo = theme === "dark" ? "#ef4444" : "#06b6d4";
  const strokeColor = theme === "dark" ? "#f59e0b" : "#60a5fa";
  const dotColor = theme === "dark" ? "#f59e0b" : "#60a5fa";
  const labelColor = theme === "dark" ? "#fbbf24" : "#93c5fd";
  const valColor = theme === "dark" ? "#ffffff80" : "#ffffff60";

  return (
    <svg viewBox="0 0 320 320" className="w-full h-full">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradFrom} stopOpacity="0.7" />
          <stop offset="100%" stopColor={gradTo} stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* 배경 */}
      <rect width="320" height="320" fill="#1a1a2e" rx="16" />

      {/* 그리드 */}
      {[20, 40, 60, 80, 100].map((lv) => (
        <polygon
          key={lv}
          points={keys
            .map((_, i) => {
              const p = ptOf(i, lv);
              return `${p.x},${p.y}`;
            })
            .join(" ")}
          fill="none"
          stroke="#ffffff20"
          strokeWidth="1"
        />
      ))}

      {/* 축 */}
      {keys.map((_, i) => {
        const p = ptOf(i, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#ffffff15"
            strokeWidth="1"
          />
        );
      })}

      {/* 폴리곤 */}
      <path
        d={poly}
        fill={`url(#${gradId})`}
        stroke={strokeColor}
        strokeWidth="2.5"
        opacity="0.9"
      />

      {/* 꼭짓점 점 */}
      {dp.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="5"
          fill={dotColor}
          stroke="white"
          strokeWidth="1.5"
        />
      ))}

      {/* 라벨 */}
      {keys.map((k, i) => {
        const a = angleOf(i);
        const lx = cx + (r + 28) * Math.cos(a);
        const ly = cy + (r + 28) * Math.sin(a);
        return (
          <g key={k}>
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="17"
              fill={labelColor}
              fontWeight="700"
            >
              {k}
            </text>
            <text
              x={lx}
              y={ly + 16}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="15"
              fill={valColor}
              fontWeight="600"
            >
              {vals[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
