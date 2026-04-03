// 한반도 SVG 지도 — 팀 선택 랜딩에서 마커 클릭으로 팀 선택
import { KBO_TEAMS, type Team } from "@/mock/teamData";
import { KOREA_PATH } from "@/constants/teamConstants";

interface KoreaMapProps {
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (t: Team) => void;
}

export default function KoreaMap({
  hoveredId,
  onHover,
  onSelect,
}: KoreaMapProps) {
  return (
    <svg
      viewBox="0 0 280 360"
      className="w-full h-full"
      style={{ filter: "drop-shadow(0 12px 40px rgba(0,0,0,0.6))" }}
    >
      <rect width="280" height="360" fill="#0c1a2e" rx="16" />
      {Array.from({ length: 30 }, (_, i) => (
        <circle
          key={i}
          cx={(i * 47) % 280}
          cy={(i * 31) % 360}
          r="1"
          fill="rgba(255,255,255,0.03)"
        />
      ))}
      <path d={KOREA_PATH} fill="#1e3a5f" stroke="#2d5a8e" strokeWidth="1.5" />
      <ellipse
        cx="101"
        cy="300"
        rx="22"
        ry="12"
        fill="#1e3a5f"
        stroke="#2d5a8e"
        strokeWidth="1.2"
      />

      {KBO_TEAMS.map((team) => {
        const hov = hoveredId === team.id;
        const dim = hoveredId !== null && !hov;
        return (
          <g
            key={team.id}
            transform={`translate(${team.mapCoords.x},${team.mapCoords.y})`}
            style={{
              cursor: "pointer",
              opacity: dim ? 0.25 : 1,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={() => onHover(team.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(team)}
          >
            {hov && <circle r="18" fill={team.colors.primary} opacity="0.2" />}
            {hov && <circle r="14" fill={team.colors.primary} opacity="0.15" />}
            <circle
              r={hov ? 10 : 7}
              fill={team.colors.primary}
              stroke={
                team.colors.secondary === "#000000"
                  ? "#ffffff44"
                  : team.colors.secondary
              }
              strokeWidth="2"
              style={{ transition: "r 0.15s" }}
            />
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fill={team.colors.text}
              fontSize={hov ? "6.5" : "5"}
              fontWeight="900"
              style={{ userSelect: "none", transition: "font-size 0.15s" }}
            >
              {team.shortName.slice(0, 2)}
            </text>
            {hov && (
              <g>
                <rect
                  x="-30"
                  y="-28"
                  width="60"
                  height="18"
                  rx="5"
                  fill={team.colors.primary}
                  opacity="0.95"
                />
                <text
                  x="0"
                  y="-19"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={team.colors.text}
                  fontSize="7"
                  fontWeight="800"
                  style={{ userSelect: "none" }}
                >
                  {team.name}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
