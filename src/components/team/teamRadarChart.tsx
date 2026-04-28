// src/components/team/TeamRadarChart.tsx
import type { Team } from "@/mock/teamData";
import type { TeamRadarData } from "@/api/teamStatsApi";

interface Props {
  team: Team;
  radarData?: TeamRadarData | null; // 특정 팀 레이더
  avgData?: TeamRadarData | null; // 리그 평균 레이더
}

// 12시 방향부터 시계방향 — 백엔드 키와 매핑
const AXES = [
  { key: "era", label: "ERA", angle: -90 }, // 12시 — 수비
  { key: "whip", label: "WHIP", angle: -30 }, // 2시  — 수비
  { key: "ops", label: "OPS", angle: 30 }, // 4시  — 공격
  { key: "avg", label: "타율", angle: 90 }, // 6시  — 공격
  { key: "stolenBase", label: "도루", angle: 150 }, // 8시  — 공격
  { key: "defense", label: "수비", angle: 210 }, // 10시 — 수비
] as const;

type AxisKey = (typeof AXES)[number]["key"];

const SIZE = 240;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 72;
const LEVELS = 4;

const IS_DEFENSE = new Set<AxisKey>(["era", "whip", "defense"]);

function polar(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

// 팀 컬러 → 어두운 배경 최적화 HSL
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

// mock fallback — 백엔드 데이터 없을 때 (최솟값 10 보장)
function mockRadar(team: Team): TeamRadarData {
  const s = team.stats2024;
  const clamp = (v: number) => Math.max(10, Math.min(100, v));
  return {
    teamName: team.name,
    season: 2025,
    era: clamp(100 - ((s.era - 3.0) / 3.0) * 90),
    whip: clamp(100 - ((s.whip - 1.0) / 0.8) * 90),
    defense: clamp(70),
    stolenBase: clamp(30 + (s.sb / 130) * 70),
    ops: clamp(10 + ((s.ops - 0.65) / 0.2) * 90),
    avg: clamp(10 + ((s.avg - 0.24) / 0.06) * 90),
  };
}

// TeamRadarData → 폴리곤 포인트 배열
function toPoints(data: TeamRadarData) {
  return AXES.map((ax) => {
    const val = data[ax.key] as number;
    const r = (val / 100) * R;
    return polar(ax.angle, r);
  });
}

export default function TeamRadarChart({ team, radarData, avgData }: Props) {
  const data = radarData ?? mockRadar(team);
  const color = safeColor(team.colors.primary);
  const colorB = color.replace("62%)", "78%)");

  const teamPoints = toPoints(data);
  const avgPoints = avgData ? toPoints(avgData) : null;

  const teamPolygon =
    teamPoints
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`,
      )
      .join(" ") + " Z";
  const avgPolygon = avgPoints
    ? avgPoints
        .map(
          (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`,
        )
        .join(" ") + " Z"
    : null;

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

      {/* ── 리그 평균 폴리곤 (먼저 그려서 뒤에 깔림) ── */}
      {avgPolygon && (
        <>
          <defs>
            <radialGradient
              id={`avg-grad-${team.id}`}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor="rgba(148,163,184,0.30)" />
              <stop offset="100%" stopColor="rgba(148,163,184,0.06)" />
            </radialGradient>
          </defs>
          <path
            d={avgPolygon}
            fill={`url(#avg-grad-${team.id})`}
            stroke="rgba(148,163,184,0.7)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* 평균 꼭짓점 */}
          {avgPoints!.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="2.5"
              fill="rgba(148,163,184,0.8)"
            />
          ))}
        </>
      )}

      {/* ── 팀 데이터 폴리곤 ── */}
      <path
        d={teamPolygon}
        fill={`url(#dg-${team.id})`}
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* 팀 꼭짓점 */}
      {teamPoints.map((p, i) => {
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

      {/* 라벨 + 점수 */}
      {AXES.map((ax) => {
        const lp = polar(ax.angle, R + 28);
        const val = Math.round(data[ax.key] as number);
        const isD = IS_DEFENSE.has(ax.key);
        const labelColor = isD ? "rgba(255,255,255,0.85)" : colorB;
        const scoreColor = isD ? color : colorB;
        const badgeBg = isD
          ? "rgba(255,255,255,0.10)"
          : "rgba(255,255,255,0.07)";

        return (
          <g key={ax.key}>
            {/* 배경 뱃지 */}
            <rect
              x={(parseFloat(lp.x.toFixed(2)) - 22).toFixed(2)}
              y={(parseFloat(lp.y.toFixed(2)) - 14).toFixed(2)}
              width="44"
              height="28"
              rx="5"
              fill={badgeBg}
            />

            {/* 지표명 */}
            <text
              x={lp.x.toFixed(2)}
              y={(lp.y - 5).toFixed(2)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="8"
              fontWeight="800"
              fill={labelColor}
              style={{ userSelect: "none" }}
            >
              {ax.label}
            </text>

            {/* 점수 + /100 */}
            <text
              x={(parseFloat(lp.x.toFixed(2)) - 3).toFixed(2)}
              y={(lp.y + 7).toFixed(2)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="9"
              fontWeight="900"
              fill={scoreColor}
              style={{ userSelect: "none" }}
            >
              {val}
            </text>
            <text
              x={(parseFloat(lp.x.toFixed(2)) - 2).toFixed(2)}
              y={(lp.y + 7).toFixed(2)}
              textAnchor="start"
              dominantBaseline="middle"
              fontSize="6.5"
              fontWeight="600"
              fill="rgba(255,255,255,0.35)"
              style={{ userSelect: "none" }}
            >
              /100점
            </text>
          </g>
        );
      })}

      {/* 범례 */}
      <g transform={`translate(${SIZE - 85}, ${SIZE - 22})`}>
        <line x1="0" y1="4" x2="12" y2="4" stroke={color} strokeWidth="2" />
        <text x="15" y="7" fontSize="7" fill={color} fontWeight="700">
          우리 팀
        </text>
        <line
          x1="40"
          y1="4"
          x2="52"
          y2="4"
          stroke="rgba(148,163,184,0.8)"
          strokeWidth="1.8"
        />
        <text
          x="55"
          y="7"
          fontSize="7"
          fill="rgba(148,163,184,0.8)"
          fontWeight="700"
        >
          리그 평균
        </text>
      </g>
    </svg>
  );
}
