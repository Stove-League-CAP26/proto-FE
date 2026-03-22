// 팀 소개 탭에서 팀 능력치를 육각형 레이더 차트로 시각화하는 컴포넌트
// 어두운 배경(#1a1a2e)에 골드/레드 그라디언트로 표현
interface HexRadarProps {
  data: Record<string, number>;
}

export default function HexRadar({ data }: HexRadarProps) {
  const keys = Object.keys(data);
  const vals = Object.values(data);
  const N = keys.length;
  const cx = 120, cy = 120, r = 85;

  const angleOf = (i: number) => (Math.PI * 2 * i) / N - Math.PI / 2;
  const ptOf = (i: number, val: number) => {
    const a = angleOf(i);
    const d = (val / 100) * r;
    return { x: cx + d * Math.cos(a), y: cy + d * Math.sin(a) };
  };

  const dp = vals.map((v, i) => ptOf(i, v));
  const poly =
    dp.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  return (
    <svg viewBox="0 0 240 240" className="w-full h-full">
      <defs>
        <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <rect width="240" height="240" fill="#1a1a2e" rx="12" />
      {[20, 40, 60, 80, 100].map((lv) => (
        <polygon
          key={lv}
          points={keys.map((_, i) => {
            const p = ptOf(i, lv);
            return `${p.x},${p.y}`;
          }).join(" ")}
          fill="none"
          stroke="#ffffff20"
          strokeWidth="1"
        />
      ))}
      {keys.map((_, i) => {
        const p = ptOf(i, 100);
        return (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y}
            stroke="#ffffff15" strokeWidth="1" />
        );
      })}
      <path d={poly} fill="url(#hexGrad)" stroke="#f59e0b" strokeWidth="2" opacity="0.9" />
      {dp.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#f59e0b" />
      ))}
      {keys.map((k, i) => {
        const a = angleOf(i);
        const lx = cx + (r + 22) * Math.cos(a);
        const ly = cy + (r + 22) * Math.sin(a);
        return (
          <g key={k}>
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
              fontSize="10" fill="#fbbf24" fontWeight="700">
              {k}
            </text>
            <text x={lx} y={ly + 12} textAnchor="middle" dominantBaseline="middle"
              fontSize="8" fill="#ffffff60">
              {vals[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}