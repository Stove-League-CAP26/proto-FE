// ERA / OPS 추이를 SVG 라인 차트로 표시하는 공용 컴포넌트

interface RollingLineChartProps {
  data: { label: string; val: number }[];
  color: string;
  minVal: number;
  maxVal: number;
  label: string;
  inverse?: boolean;
}

export default function RollingLineChart({
  data,
  color,
  minVal,
  maxVal,
  label,
  inverse = false,
}: RollingLineChartProps) {
  const W = 400, H = 130, pad = { l: 36, r: 12, t: 12, b: 28 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;

  const toY = (v: number) =>
    inverse
      ? pad.t + ((v - minVal) / (maxVal - minVal)) * cH
      : pad.t + cH - ((v - minVal) / (maxVal - minVal)) * cH;

  const pts = data.map((d, i) => ({
    x: pad.l + (i / (data.length - 1)) * cW,
    y: toY(d.val),
    ...d,
  }));

  const pathD = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const areaD = `${pathD} L${pts[pts.length - 1].x},${pad.t + cH} L${pts[0].x},${pad.t + cH} Z`;
  const gridVals = [
    minVal,
    minVal + (maxVal - minVal) * 0.33,
    minVal + (maxVal - minVal) * 0.67,
    maxVal,
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {gridVals.map((v) => {
        const y = toY(v);
        return (
          <g key={v}>
            <line x1={pad.l} y1={y} x2={W - pad.r} y2={y}
              stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="4,3" />
            <text x={pad.l - 4} y={y} textAnchor="end" fontSize="8"
              fill="#9CA3AF" dominantBaseline="middle">
              {v.toFixed(2)}
            </text>
          </g>
        );
      })}
      <path d={areaD} fill={`url(#grad-${label})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="white" strokeWidth="1.5" />
      ))}
      {pts
        .filter((_, i) => i % Math.floor(pts.length / 5) === 0)
        .map((p, i) => (
          <text key={i} x={p.x} y={H - 6} textAnchor="middle" fontSize="7.5" fill="#9CA3AF">
            {p.label}
          </text>
        ))}
    </svg>
  );
}
