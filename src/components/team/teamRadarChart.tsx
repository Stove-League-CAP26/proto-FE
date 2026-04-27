// src/components/team/TeamRadarChart.tsx
import type { Team } from "@/mock/teamData";
import type { TeamRadar } from "@/api/teamStatsApi";

interface Props {
  team: Team;
  radarData?: TeamRadar | null;
}

// 수비 3개(좌) / 공격 3개(우) — 12시 방향부터 시계방향
const AXES = [
  { key: "ERA", label: "ERA", angle: -90 }, // 12시 — 수비
  { key: "WHIP", label: "WHIP", angle: -30 }, // 2시  — 수비
  { key: "OPS", label: "OPS", angle: 30 }, // 4시  — 공격
  { key: "타율", label: "타율", angle: 90 }, // 6시  — 공격
  { key: "도루", label: "도루", angle: 150 }, // 8시  — 공격
  { key: "수비", label: "수비", angle: 210 }, // 10시 — 수비
] as const;

const SIZE = 240;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 72;
const LEVELS = 4;

// 수비 지표 여부 (색상 구분용)
const IS_DEFENSE = new Set(["ERA", "WHIP", "수비"]);

function polar(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

// mock fallback (하한 30점 보장)
function mockRadar(team: Team): TeamRadar {
  const s = team.stats2024;
  const clamp = (v: number) => Math.max(30, Math.min(100, v));
  return {
    ERA: clamp(100 - ((s.era - 3.0) / 2.5) * 70),
    WHIP: clamp(100 - ((s.whip - 1.0) / 0.7) * 70),
    수비: clamp(70),
    도루: clamp(50 + (s.sb / 150) * 40),
    OPS: clamp((s.ops / 0.85) * 90),
    타율: clamp((s.avg / 0.3) * 80),
  };
}

// 팀 컬러 → 어두운 배경 최적화 HSL (채도 65%, 명도 60%)
function safeColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return `hsl(${Math.round(h * 360)},65%,62%)`;
}

export default function TeamRadarChart({ team, radarData }: Props) {
  const data = radarData ?? mockRadar(team);
  const color = safeColor(team.colors.primary);
  // 수비 보조색 — 같은 색상의 더 밝은 톤
  const colorB = color.replace("62%)", "78%)");

  const points = AXES.map((ax) => {
    const r = (data[ax.key] / 100) * R;
    return polar(ax.angle, r);
  });
  const polygon = points
    .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");

  const gridLevels = Array.from({ length: LEVELS }, (_, i) =>
    AXES.map((ax) => polar(ax.angle, (R * (i + 1)) / LEVELS)),
  );

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full">
      <defs>
        <radialGradient id={`rg-${team.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
        </radialGradient>
        <radialGradient id={`dg-${team.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.08" />
        </radialGradient>
      </defs>

      {/* 배경 광원 */}
      <circle cx={CX} cy={CY} r={R + 22} fill={`url(#rg-${team.id})`} />

      {/* 격자 */}
      {gridLevels.map((pts, li) => (
        <polygon
          key={li}
          points={pts
            .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
            .join(" ")}
          fill={li === LEVELS - 1 ? "rgba(255,255,255,0.02)" : "none"}
          stroke="rgba(255,255,255,0.09)"
          strokeWidth="0.8"
        />
      ))}

      {/* 축 */}
      {AXES.map((ax) => {
        const end = polar(ax.angle, R);
        const isD = IS_DEFENSE.has(ax.key);
        return (
          <line
            key={ax.key}
            x1={CX}
            y1={CY}
            x2={end.x.toFixed(2)}
            y2={end.y.toFixed(2)}
            stroke={isD ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)"}
            strokeWidth="0.8"
            strokeDasharray={isD ? "none" : "2,2"}
          />
        );
      })}

      {/* 데이터 면 */}
      <polygon
        points={polygon}
        fill={`url(#dg-${team.id})`}
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* 꼭짓점 */}
      {points.map((p, i) => {
        const isD = IS_DEFENSE.has(AXES[i].key);
        return (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="5"
              fill={isD ? color : colorB}
              opacity="0.18"
            />
            <circle cx={p.x} cy={p.y} r="2.5" fill={isD ? color : colorB} />
          </g>
        );
      })}

      {/* 레이블 + 점수 */}
      {AXES.map((ax) => {
        const lp = polar(ax.angle, R + 22);
        const val = Math.round(data[ax.key]);
        const isD = IS_DEFENSE.has(ax.key);
        const lblColor = isD ? "rgba(255,255,255,0.80)" : colorB;
        return (
          <g key={ax.key}>
            <text
              x={lp.x.toFixed(2)}
              y={(lp.y - 5).toFixed(2)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="8.5"
              fontWeight="800"
              fill={lblColor}
              style={{ userSelect: "none" }}
            >
              {ax.label}
            </text>
            <text
              x={lp.x.toFixed(2)}
              y={(lp.y + 6).toFixed(2)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="7.5"
              fontWeight="700"
              fill={isD ? color : colorB}
              style={{ userSelect: "none" }}
            >
              {val}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
