// 선수/팀 능력치 육각형 레이더 차트 — 팀 페이지 스타일 통일
// accentColor: 선수 팀컬러 or heroAccent 전달 → HSL 보정 후 렌더링

interface RadarChartProps {
  data: Record<string, number>;
  theme?: "light" | "dark"; // 하위호환 유지 (현재는 accentColor 우선)
  accentColor?: string; // 선수/팀 컬러
}

const SIZE = 320;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 108;
const LEVELS = 5;

function polar(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

// 팀 페이지 TeamRadarChart와 동일한 HSL 보정 함수
function safeColor(hex: string): string {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return "hsl(220,65%,62%)";
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

export default function RadarChart({
  data,
  theme = "light",
  accentColor,
}: RadarChartProps) {
  const keys = Object.keys(data);
  const vals = Object.values(data);
  const N = keys.length;
  if (N === 0) return null;

  const angleStep = 360 / N;

  // 색상 결정: accentColor 우선, 없으면 theme 기반
  const baseColor = accentColor
    ? safeColor(accentColor)
    : theme === "dark"
      ? "hsl(38,90%,60%)"
      : "hsl(220,65%,62%)";

  const colorA = baseColor; // 선 + 점
  const colorFill = baseColor.replace("hsl(", "hsla(").replace(")", ",0.25)");

  // 그리드 다각형 좌표
  const gridPolygons = Array.from({ length: LEVELS }, (_, li) => {
    const ratio = (li + 1) / LEVELS;
    return keys
      .map((_, i) => {
        const p = polar(i * angleStep, R * ratio);
        return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
      })
      .join(" ");
  });

  // 데이터 폴리곤
  const dataPoints = vals.map((v, i) => polar(i * angleStep, (v / 100) * R));
  const dataPoly = dataPoints
    .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");

  // 라벨 위치
  const labelR = R + 30;

  const gradId = `rg-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full">
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={colorA} stopOpacity="0.3" />
          <stop offset="100%" stopColor={colorA} stopOpacity="0.08" />
        </radialGradient>
      </defs>

      {/* 배경 */}
      <rect width={SIZE} height={SIZE} fill="#1a1a2e" rx="16" />

      {/* 그리드 다각형 */}
      {gridPolygons.map((pts, li) => (
        <polygon
          key={li}
          points={pts}
          fill={li === LEVELS - 1 ? "rgba(255,255,255,0.02)" : "none"}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.8"
        />
      ))}

      {/* 축 선 */}
      {keys.map((_, i) => {
        const end = polar(i * angleStep, R);
        return (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={end.x.toFixed(2)}
            y2={end.y.toFixed(2)}
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="0.8"
          />
        );
      })}

      {/* 데이터 면 */}
      <polygon
        points={dataPoly}
        fill={`url(#${gradId})`}
        stroke={colorA}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* 꼭짓점 */}
      {dataPoints.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5.5" fill={colorA} opacity="0.2" />
          <circle cx={p.x} cy={p.y} r="3" fill={colorA} />
        </g>
      ))}

      {/* 라벨 + 수치 */}
      {keys.map((k, i) => {
        const lp = polar(i * angleStep, labelR);
        return (
          <g key={k}>
            <text
              x={lp.x.toFixed(2)}
              y={(lp.y - 7).toFixed(2)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="13"
              fontWeight="800"
              fill={colorA}
              style={{ userSelect: "none" }}
            >
              {k}
            </text>
            <text
              x={lp.x.toFixed(2)}
              y={(lp.y + 8).toFixed(2)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fontWeight="700"
              fill="rgba(255,255,255,0.55)"
              style={{ userSelect: "none" }}
            >
              {vals[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
