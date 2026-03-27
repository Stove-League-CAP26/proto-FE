// 선수 퍼센타일 순위를 원형 게이지로 표시하는 컴포넌트
// 90+: 빨강, 70-89: 주황, 40-69: 파랑, -39: 회색

interface PercentileRingProps {
  label: string;
  pct: number;
  val: string;
  inverse?: boolean;
}

export default function PercentileRing({
  label,
  pct,
  val,
  inverse = false,
}: PercentileRingProps) {
  const display = inverse ? 100 - pct : pct;
  const color =
    display >= 90
      ? "#EF4444"
      : display >= 70
        ? "#F97316"
        : display >= 40
          ? "#3B82F6"
          : "#6B7280";
  const r = 22;
  const circ = 2 * Math.PI * r;

  return (
    <div
      className="flex flex-col items-center gap-1 flex-shrink-0"
      style={{ minWidth: 72 }}
    >
      <div className="relative" style={{ width: 56, height: 56 }}>
        <svg viewBox="0 0 56 56" className="w-full h-full">
          <circle cx="28" cy="28" r={r} fill="none" stroke="#E5E7EB" strokeWidth="4" />
          <circle
            cx="28" cy="28" r={r}
            fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - display / 100)}
            strokeLinecap="round"
            transform="rotate(-90 28 28)"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-sm font-black"
          style={{ color }}
        >
          {display}
        </span>
      </div>
      <p className="text-xs font-bold text-gray-700 text-center leading-tight">{label}</p>
      <p className="text-xs text-gray-400 text-center">{val}</p>
    </div>
  );
}
