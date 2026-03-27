// 선수/팀 능력치를 육각형 레이더 차트로 시각화하는 공통 컴포넌트
// theme="light" : 프로필 페이지용 (밝은 배경, 파란 폴리곤)
// theme="dark"  : 팀 페이지용 (어두운 배경, 골드/레드 그라디언트)

interface RadarChartProps {
  data: Record<string, number>;
  theme?: "light" | "dark";
}

export default function RadarChart({ data, theme = "light" }: RadarChartProps) {
  const keys = Object.keys(data);
  const vals = Object.values(data);
  const N = keys.length;
  const cx = theme === "dark" ? 120 : 100;
  const cy = theme === "dark" ? 120 : 100;
  const r = theme === "dark" ? 85 : 70;

  const angleOf = (i: number) => (Math.PI * 2 * i) / N - Math.PI / 2;
  const ptOf = (i: number, val: number) => {
    const a = angleOf(i);
    const d = (val / 100) * r;
    return { x: cx + d * Math.cos(a), y: cy + d * Math.sin(a) };
  };

  const dp = vals.map((v, i) => ptOf(i, v));
  const poly =
    dp.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  const viewBox = theme === "dark" ? "0 0 240 240" : "0 0 200 200";
  const gridStroke = theme === "dark" ? "#ffffff20" : "#e5e7eb";
  const axisStroke = theme === "dark" ? "#ffffff15" : "#e5e7eb";
  const labelColor = theme === "dark" ? "#fbbf24" : "#374151";
  const labelSize = theme === "dark" ? 10 : 9;
  const dotColor = theme === "dark" ? "#f59e0b" : "#3B82F6";
  const labelR = r + (theme === "dark" ? 22 : 18);

  return (
    <svg viewBox={viewBox} className="w-full h-full">
      {/* dark 테마: 배경 rect */}
      {theme === "dark" && (
        <>
          <defs>
            <linearGradient
              id="radarGradDark"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <rect width="240" height="240" fill="#1a1a2e" rx="12" />
        </>
      )}

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
          stroke={gridStroke}
          strokeWidth={theme === "dark" ? 1 : 0.7}
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
            stroke={axisStroke}
            strokeWidth={theme === "dark" ? 1 : 0.7}
          />
        );
      })}

      {/* 폴리곤 */}
      <path
        d={poly}
        fill={theme === "dark" ? "url(#radarGradDark)" : "rgba(59,130,246,0.2)"}
        stroke={theme === "dark" ? "#f59e0b" : "#3B82F6"}
        strokeWidth={theme === "dark" ? 2 : 1.5}
        opacity={theme === "dark" ? 0.9 : 1}
      />

      {/* 꼭짓점 점 */}
      {dp.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={theme === "dark" ? 4 : 3}
          fill={dotColor}
        />
      ))}

      {/* 라벨 */}
      {keys.map((k, i) => {
        const a = angleOf(i);
        const lx = cx + labelR * Math.cos(a);
        const ly = cy + labelR * Math.sin(a);
        return (
          <g key={k}>
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={labelSize}
              fill={labelColor}
              fontWeight={theme === "dark" ? "700" : "600"}
            >
              {k}
            </text>
            {/* dark 테마: 라벨 아래 수치 표시 */}
            {theme === "dark" && (
              <text
                x={lx}
                y={ly + 12}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
                fill="#ffffff60"
              >
                {vals[i]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
