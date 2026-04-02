// 타구 방향 분포 (LF / CF / RF) 시각화 컴포넌트
interface HitDirectionChartProps {
  hitDistrib: { LF: string; CF: string; RF: string };
}

export default function HitDirectionChart({
  hitDistrib,
}: HitDirectionChartProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 rounded-full bg-green-500" />
        <h3 className="font-bold text-gray-800 text-sm">타구 방향 분포</h3>
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
            {hitDistrib.LF}
          </text>
          <text
            x="100"
            y="52"
            fill="#fbbf24"
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
          >
            {hitDistrib.CF}
          </text>
          <text
            x="155"
            y="83"
            fill="#fbbf24"
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
          >
            {hitDistrib.RF}
          </text>
        </svg>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[
          ["LF", hitDistrib.LF, "bg-green-50 text-green-700"],
          ["CF", hitDistrib.CF, "bg-blue-50 text-blue-700"],
          ["RF", hitDistrib.RF, "bg-purple-50 text-purple-700"],
        ].map(([k, v, cls]) => (
          <div key={k} className={`rounded-xl p-3 text-center ${cls}`}>
            <p className="text-xs font-medium">{k}</p>
            <p className="text-xl font-black">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
