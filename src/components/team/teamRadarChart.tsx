// 팀 상세 홈탭의 팀 능력치 레이더 차트 (다크 테마)
import type { Team } from "@/mock/teamData";
import { RADAR_AXES } from "@/constants/teamConstants";
import { normalizeStats } from "@/mock/teamData";

interface TeamRadarChartProps {
  team: Team;
}

export default function TeamRadarChart({ team }: TeamRadarChartProps) {
  const cx = 130,
    cy = 130,
    r = 90;
  const scores = normalizeStats(team.stats2024);
  const vals = RADAR_AXES.map((a) => (scores[a.key] ?? 0) / 100);
  const angleAt = (i: number) => (i * (2 * Math.PI)) / 6 - Math.PI / 2;

  const hexPts = (level: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = angleAt(i);
      return `${i === 0 ? "M" : "L"} ${(cx + r * level * Math.cos(a)).toFixed(1)},${(cy + r * level * Math.sin(a)).toFixed(1)}`;
    }).join(" ") + " Z";

  const dataPts =
    vals
      .map((v, i) => {
        const a = angleAt(i);
        const rv = Math.max(0.06, v) * r;
        return `${i === 0 ? "M" : "L"} ${(cx + rv * Math.cos(a)).toFixed(1)},${(cy + rv * Math.sin(a)).toFixed(1)}`;
      })
      .join(" ") + " Z";

  const displayVal: Record<string, string> = {
    ERA: team.stats2024.era.toFixed(2),
    WHIP: team.stats2024.whip.toFixed(2),
    QS: `${team.stats2024.qs}회`,
    AVG: team.stats2024.avg.toFixed(3),
    SB: `${team.stats2024.sb}개`,
    OPS: team.stats2024.ops.toFixed(3),
  };

  return (
    <svg viewBox="0 0 260 260" className="w-full max-w-[260px] mx-auto">
      {[0.2, 0.4, 0.6, 0.8, 1.0].map((lv) => (
        <path
          key={lv}
          d={hexPts(lv)}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="1"
        />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={cx + r * Math.cos(angleAt(i))}
          y2={cy + r * Math.sin(angleAt(i))}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="1"
        />
      ))}
      <path
        d={dataPts}
        fill={team.colors.primary + "44"}
        stroke={team.colors.primary}
        strokeWidth="2.5"
      />
      {vals.map((v, i) => {
        const rv = Math.max(0.06, v) * r;
        return (
          <circle
            key={i}
            cx={cx + rv * Math.cos(angleAt(i))}
            cy={cy + rv * Math.sin(angleAt(i))}
            r="4.5"
            fill={team.colors.primary}
            stroke={team.colors.bg}
            strokeWidth="2"
          />
        );
      })}
      {RADAR_AXES.map((ax, i) => {
        const a = angleAt(i);
        const lx = cx + (r + 24) * Math.cos(a);
        const ly = cy + (r + 24) * Math.sin(a);
        return (
          <g key={ax.key}>
            <text
              x={lx}
              y={ly - 5}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="8.5"
              fontWeight="800"
            >
              {ax.label}
            </text>
            <text
              x={lx}
              y={ly + 6}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={team.colors.primary}
              fontSize="8"
              fontWeight="700"
            >
              {displayVal[ax.key]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
