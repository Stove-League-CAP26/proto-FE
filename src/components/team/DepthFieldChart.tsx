// 팀 뎁스 탭에서 야구장 필드 위에 포지션별 선수와 WAR을 오버레이로 표시하는 컴포넌트
import PlayerAvatar from "@/components/common/PlayerAvatar";

interface DepthFieldChartProps {
  depthMap: Record<string, [string, string][]>;
  teamColor: string;
}

const POSITIONS: Record<string, { x: number; y: number }> = {
  좌익수:   { x: 42,  y: 60  },
  중견수:   { x: 100, y: 32  },
  우익수:   { x: 158, y: 60  },
  유격수:   { x: 72,  y: 95  },
  "2루수":  { x: 118, y: 88  },
  "1루수":  { x: 138, y: 108 },
  "3루수":  { x: 62,  y: 108 },
  포수:     { x: 100, y: 148 },
  지명타자: { x: 100, y: 168 },
};

export default function DepthFieldChart({ depthMap, teamColor }: DepthFieldChartProps) {
  return (
    <div
      className="relative"
      style={{ background: "#2d6a2d", borderRadius: 12, overflow: "hidden", paddingBottom: "60%" }}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 200 180" className="w-full h-full">
          <path d="M100,175 L5,85 Q100,5 195,85 Z" fill="#2d6a2d" />
          <path d="M100,155 L50,105 L100,58 L150,105 Z" fill="#c8a26a" />
          <ellipse cx="100" cy="108" rx="30" ry="30" fill="#2d6a2d" />
          {[[100, 58], [150, 105], [100, 155], [50, 105]].map(([x, y], i) => (
            <rect key={i} x={x - 4} y={y - 4} width="8" height="8"
              fill="white" transform={`rotate(45,${x},${y})`} />
          ))}
          <polygon points="97,163 103,163 106,170 100,175 94,170" fill="white" />
          <line x1="100" y1="175" x2="5" y2="85" stroke="white" strokeWidth="1" opacity="0.4" />
          <line x1="100" y1="175" x2="195" y2="85" stroke="white" strokeWidth="1" opacity="0.4" />
        </svg>
        {Object.entries(POSITIONS).map(([pos, coord]) => {
          const players = depthMap[pos] || [];
          return (
            <div
              key={pos}
              className="absolute"
              style={{
                left: `${(coord.x / 200) * 100}%`,
                top: `${(coord.y / 180) * 100}%`,
                transform: "translate(-50%,-50%)",
              }}
            >
              <div
                className="rounded px-1.5 py-1 text-center shadow-lg"
                style={{ backgroundColor: teamColor, minWidth: 52 }}
              >
                {players.map((p, i) => (
                  <p
                    key={i}
                    className="text-white font-bold leading-tight"
                    style={{ fontSize: i === 0 ? 8 : 7, opacity: i === 0 ? 1 : 0.75 }}
                  >
                    {p[0]}
                    <span className="opacity-60 ml-0.5">{p[1]}</span>
                  </p>
                ))}
              </div>
            </div>
          );
        })}
        <p className="absolute bottom-1 right-2 text-white/40 text-xs">*시즌 WAR/144</p>
      </div>
    </div>
  );
}