// 선수 능력치를 육각형 레이더 차트로 시각화하는 컴포넌트
// data는 { 항목명: 수치(0~100) } 형태의 객체를 받음
interface RadarChartProps {
  data: Record<string, number>;
}

export default function RadarChart({ data }: RadarChartProps) {
  const keys = Object.keys(data);
  const vals = Object.values(data);
  const N = keys.length;
  const cx = 100, cy = 100, r = 70;

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
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {[20, 40, 60, 80, 100].map((lv) => (
        <polygon
          key={lv}
          points={keys.map((_, i) => {
            const p = ptOf(i, lv);
            return `${p.x},${p.y}`;
          }).join(" ")}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="0.7"
        />
      ))}
      {keys.map((_, i) => {
        const p = ptOf(i, 100);
        return (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y}
            stroke="#e5e7eb" strokeWidth="0.7" />
        );
      })}
      <path d={poly} fill="rgba(59,130,246,0.2)" stroke="#3B82F6" strokeWidth="1.5" />
      {dp.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#3B82F6" />
      ))}
      {keys.map((k, i) => {
        const a = angleOf(i);
        const lx = cx + (r + 18) * Math.cos(a);
        const ly = cy + (r + 18) * Math.sin(a);
        return (
          <text key={k} x={lx} y={ly} textAnchor="middle"
            dominantBaseline="middle" fontSize="9" fill="#374151" fontWeight="600">
            {k}
          </text>
        );
      })}
    </svg>
  );
}