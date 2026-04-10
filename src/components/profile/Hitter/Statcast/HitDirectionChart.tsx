// 타구 방향 분포 컴포넌트
// 부채꼴을 LF / CF / RF 3등분하고 퍼센테이지 높을수록 빨간색이 진해짐
// max 대비 상대 비율로 alpha 계산 (기본 0.50 ~ 최대 0.95)
import fieldImg from "@/assets/field.png";

interface HitDirectionChartProps {
  hitDistrib: { LF: string; CF: string; RF: string };
}

function parsePct(val: string): number {
  if (!val || val === "-") return 0;
  return parseFloat(val.replace("%", "").trim()) || 0;
}

// max 대비 상대 비율로 alpha 결정: 0/null/- → 완전 투명, max → 0.95, 나머지는 비례
function redFill(pct: number, max: number): string {
  if (pct <= 0 || max === 0) return "rgba(255, 0, 0, 0)";
  const ratio = pct / max;
  const alpha = 0.20 + ratio * 0.7; // 0.50 ~ 0.95
  return `rgba(255, 0, 0, ${alpha.toFixed(2)})`;
}

function sectorPath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  startDeg: number,
  endDeg: number,
): string {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
  const x1 = cx + rx * Math.cos(toRad(startDeg));
  const y1 = cy + ry * Math.sin(toRad(startDeg));
  const x2 = cx + rx * Math.cos(toRad(endDeg));
  const y2 = cy + ry * Math.sin(toRad(endDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${rx} ${ry} 0 ${large} 1 ${x2} ${y2} Z`;
}

function labelPos(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  startDeg: number,
  endDeg: number,
): { x: number; y: number } {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
  const mid = (startDeg + endDeg) / 2;
  return {
    x: cx + rx * 0.75 * Math.cos(toRad(mid)),
    y: cy + ry * 0.65 * Math.sin(toRad(mid)),
  };
}

export default function HitDirectionChart({
  hitDistrib,
}: HitDirectionChartProps) {
  const lf = parsePct(hitDistrib.LF);
  const cf = parsePct(hitDistrib.CF);
  const rf = parsePct(hitDistrib.RF);
  const max = Math.max(lf, cf, rf);

  const CX = 101,
    CY = 182,
    RX = 240,
    RY = 110;

  const sectors = [
    { key: "LF", val: lf, start: -45, end: -20 },
    { key: "CF", val: cf, start: -20, end: 20 },
    { key: "RF", val: rf, start: 20, end: 45 },
  ];

  const bars = [
    { key: "좌측", val: lf, display: hitDistrib.LF },
    { key: "중앙", val: cf, display: hitDistrib.CF },
    { key: "우측", val: rf, display: hitDistrib.RF },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 rounded-full bg-green-500" />
        <h3 className="font-bold text-gray-800 text-sm">타구 방향 분포</h3>
      </div>

      <div className="flex justify-center">
        <div className="relative w-80 h-48 overflow-hidden rounded-xl">
          {/* 야구장 배경 이미지 */}
          <img
            src={fieldImg}
            alt="야구장"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          />

          {/* 섹터 오버레이 SVG */}
          <svg viewBox="0 0 200 185" className="absolute inset-0 w-full h-full">
            {/* 타구 섹터 */}
            {sectors.map((s) => (
              <path
                key={s.key}
                d={sectorPath(CX, CY, RX, RY, s.start, s.end)}
                fill={redFill(s.val, max)}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1"
              />
            ))}

            {/* 구분선 */}
            {sectors.map((s) => (
              <line
                key={s.key + "_line"}
                x1={CX}
                y1={CY}
                x2={CX + RX * Math.cos(((s.start - 90) * Math.PI) / 180)}
                y2={CY + RY * Math.sin(((s.start - 90) * Math.PI) / 180)}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1"
                strokeDasharray="4,3"
              />
            ))}

            {/* 퍼센테이지만 표시 (필드 라벨 제거) */}
            {sectors.map((s) => {
              const pos = labelPos(CX, CY, RX, RY, s.start, s.end);
              return (
                <text
                  key={s.key + "_label"}
                  x={pos.x}
                  y={pos.y - 4}
                  textAnchor="middle"
                  fontSize="20"
                  fontWeight="800"
                  fill="white"
                  style={{ filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.9))" }}
                >
                  {s.val > 0 ? `${s.val}%` : "-"}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 하단 막대그래프 — max 대비 비율로 그라데이션 */}
      <div className="mt-4 space-y-2">
        {bars.map(({ key, val, display }) => {
          const isMax = val === max && max > 0;
          const barPct = max > 0 ? (val / max) * 100 : 0;
          const ratio = max > 0 ? val / max : 0;
          const endAlpha = (0.50 + ratio * 0.45).toFixed(2);
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 w-8 flex-shrink-0">
                {key}
              </span>
              <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: `${barPct}%`,
                    background: val > 0
                      ? `linear-gradient(to right, rgba(255,0,0,0.50), rgba(255,0,0,${endAlpha}))`
                      : "#e5e7eb",
                    minWidth: val > 0 ? "2rem" : "0",
                  }}
                >
                  <span
                    className="text-white text-xs font-bold"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                  >
                    {display || "-"}
                  </span>
                </div>
              </div>
              {isMax && (
                <span
                  className="text-xs font-black flex-shrink-0"
                  style={{ color: "#ff0000" }}
                >
                  MOST
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}