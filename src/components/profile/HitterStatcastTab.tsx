/**
 * HitterStatcastTab.tsx
 * 타자 스탯캐스트 탭
 *
 * 변경사항:
 * - OBP/SLG/OPS: DB값 우선, 없으면 StatsCalculator로 계산
 * - BB%, K%, WAR: StatsCalculator로 계산
 * - 테이블 컬럼: AB·R 제거, WAR 추가
 */

import type { HitterCombinedStat } from "@/utils/StatsCalculator";
import { calcHitterDerived, fmtAvg, fmtPct } from "@/utils/StatsCalculator";

interface HitterStatcastTabProps {
  stats: HitterCombinedStat[];
  hitDistrib?: { LF: string; CF: string; RF: string };
}

// ── 퍼센테이지 문자열 파싱 ─────────────────────────────────────────────────
function parsePct(v: string): number {
  return parseFloat(v.replace("%", "")) || 0;
}

// ── 방향별 타구 분포 히트맵 차트 ──────────────────────────────────────────
function SprayHeatmap({ lf, cf, rf }: { lf: string; cf: string; rf: string }) {
  const lfN = parsePct(lf);
  const cfN = parsePct(cf);
  const rfN = parsePct(rf);
  const max = Math.max(lfN, cfN, rfN, 1);

  // 가장 높은 방향 = 1.0, 나머지 비례
  const lfRatio = lfN / max;
  const cfRatio = cfN / max;
  const rfRatio = rfN / max;

  // 불투명도: 0.18(최소) ~ 0.80(최대)
  const opacity = (r: number) => 0.18 + r * 0.62;

  // 테두리 두께: 가장 높은 방향 강조
  const isTop = (n: number) => n === max;

  return (
    <svg viewBox="0 0 300 270" className="w-full" style={{ maxHeight: 240 }}>
      <defs>
        {/* LF 그라디언트 (녹색) */}
        <radialGradient id="gradLF" cx="30%" cy="80%" r="70%">
          <stop
            offset="0%"
            stopColor="#10B981"
            stopOpacity={opacity(lfRatio)}
          />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
        {/* CF 그라디언트 (파랑) */}
        <radialGradient id="gradCF" cx="50%" cy="60%" r="60%">
          <stop
            offset="0%"
            stopColor="#3B82F6"
            stopOpacity={opacity(cfRatio)}
          />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </radialGradient>
        {/* RF 그라디언트 (보라) */}
        <radialGradient id="gradRF" cx="70%" cy="80%" r="70%">
          <stop
            offset="0%"
            stopColor="#8B5CF6"
            stopOpacity={opacity(rfRatio)}
          />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
        {/* 내야 마스크 (잔디) */}
        <clipPath id="fieldClip">
          <path d="M150,255 L5,92 Q150,2 295,92 Z" />
        </clipPath>
      </defs>

      {/* ── 외야 잔디 (베이스) ── */}
      <path d="M150,255 L5,92 Q150,2 295,92 Z" fill="#2a5e2a" />

      {/* ── 방향 구분선 (홈→LF경계, 홈→RF경계) ── */}
      {/* LF-CF 구분: 홈 → 약 (95, 38) */}
      <line
        x1="150"
        y1="255"
        x2="95"
        y2="38"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1.5"
        strokeDasharray="5,4"
      />
      {/* CF-RF 구분: 홈 → 약 (205, 38) */}
      <line
        x1="150"
        y1="255"
        x2="205"
        y2="38"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1.5"
        strokeDasharray="5,4"
      />

      {/* ── LF 히트맵 존 ── */}
      <path
        d="M150,255 L5,92 Q95,10 95,38 Z"
        fill="url(#gradLF)"
        clipPath="url(#fieldClip)"
      />
      {/* ── CF 히트맵 존 ── */}
      <path
        d="M150,255 L95,38 Q150,2 205,38 Z"
        fill="url(#gradCF)"
        clipPath="url(#fieldClip)"
      />
      {/* ── RF 히트맵 존 ── */}
      <path
        d="M150,255 L205,38 Q210,10 295,92 Z"
        fill="url(#gradRF)"
        clipPath="url(#fieldClip)"
      />

      {/* ── 존 테두리 강조 (1위 방향) ── */}
      {isTop(lfN) && (
        <path
          d="M150,255 L5,92 Q95,10 95,38 Z"
          fill="none"
          stroke="#10B981"
          strokeWidth="2.5"
          strokeOpacity="0.7"
          clipPath="url(#fieldClip)"
        />
      )}
      {isTop(cfN) && (
        <path
          d="M150,255 L95,38 Q150,2 205,38 Z"
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2.5"
          strokeOpacity="0.7"
          clipPath="url(#fieldClip)"
        />
      )}
      {isTop(rfN) && (
        <path
          d="M150,255 L205,38 Q210,10 295,92 Z"
          fill="none"
          stroke="#8B5CF6"
          strokeWidth="2.5"
          strokeOpacity="0.7"
          clipPath="url(#fieldClip)"
        />
      )}

      {/* ── 내야 (흙) ── */}
      <path d="M150,195 L88,138 L150,80 L212,138 Z" fill="#c8a26a" />
      <ellipse cx="150" cy="143" rx="40" ry="40" fill="#2a5e2a" />
      {/* 내야 외곽선 */}
      <path
        d="M150,195 L88,138 L150,80 L212,138 Z"
        fill="none"
        stroke="#a07840"
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />

      {/* ── 파울 라인 ── */}
      <line
        x1="150"
        y1="255"
        x2="5"
        y2="92"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.3"
      />
      <line
        x1="150"
        y1="255"
        x2="295"
        y2="92"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.3"
      />

      {/* ── 베이스 다이아몬드 ── */}
      {(
        [
          [150, 80],
          [212, 138],
          [150, 195],
          [88, 138],
        ] as [number, number][]
      ).map(([x, y], i) => (
        <rect
          key={i}
          x={x - 5}
          y={y - 5}
          width="10"
          height="10"
          fill="white"
          transform={`rotate(45,${x},${y})`}
        />
      ))}
      {/* 홈플레이트 */}
      <polygon points="147,251 153,251 155,255 150,258 145,255" fill="white" />
      <ellipse
        cx="150"
        cy="143"
        rx="5"
        ry="5"
        fill="#c8a26a"
        stroke="#a07840"
        strokeWidth="1"
      />

      {/* ── 퍼센테이지 라벨 (존 중앙) ── */}
      {/* LF 라벨 */}
      <g>
        <rect
          x="34"
          y="118"
          width="52"
          height="36"
          rx="8"
          fill="rgba(0,0,0,0.55)"
        />
        <text
          x="60"
          y="133"
          textAnchor="middle"
          fontSize="9"
          fill="#6EE7B7"
          fontWeight="bold"
        >
          좌 (LF)
        </text>
        <text
          x="60"
          y="148"
          textAnchor="middle"
          fontSize="14"
          fill="white"
          fontWeight="900"
        >
          {lf}
        </text>
        {isTop(lfN) && (
          <text x="60" y="162" textAnchor="middle" fontSize="8" fill="#10B981">
            ▲ 최다
          </text>
        )}
      </g>
      {/* CF 라벨 */}
      <g>
        <rect
          x="116"
          y="30"
          width="68"
          height="36"
          rx="8"
          fill="rgba(0,0,0,0.55)"
        />
        <text
          x="150"
          y="45"
          textAnchor="middle"
          fontSize="9"
          fill="#93C5FD"
          fontWeight="bold"
        >
          중 (CF)
        </text>
        <text
          x="150"
          y="60"
          textAnchor="middle"
          fontSize="14"
          fill="white"
          fontWeight="900"
        >
          {cf}
        </text>
        {isTop(cfN) && (
          <text x="150" y="74" textAnchor="middle" fontSize="8" fill="#3B82F6">
            ▲ 최다
          </text>
        )}
      </g>
      {/* RF 라벨 */}
      <g>
        <rect
          x="214"
          y="118"
          width="52"
          height="36"
          rx="8"
          fill="rgba(0,0,0,0.55)"
        />
        <text
          x="240"
          y="133"
          textAnchor="middle"
          fontSize="9"
          fill="#C4B5FD"
          fontWeight="bold"
        >
          우 (RF)
        </text>
        <text
          x="240"
          y="148"
          textAnchor="middle"
          fontSize="14"
          fill="white"
          fontWeight="900"
        >
          {rf}
        </text>
        {isTop(rfN) && (
          <text x="240" y="162" textAnchor="middle" fontSize="8" fill="#8B5CF6">
            ▲ 최다
          </text>
        )}
      </g>

      {/* ── 범례 바 (하단) ── */}
      <g transform="translate(60, 238)">
        {(
          [
            ["좌", "#10B981", lfRatio],
            ["중", "#3B82F6", cfRatio],
            ["우", "#8B5CF6", rfRatio],
          ] as [string, string, number][]
        ).map(([label, color, ratio], i) => (
          <g key={label} transform={`translate(${i * 65}, 0)`}>
            <rect
              x="0"
              y="0"
              width={Math.max(ratio * 56, 6)}
              height="7"
              rx="3.5"
              fill={color}
              opacity="0.85"
            />
            <rect
              x="0"
              y="0"
              width="56"
              height="7"
              rx="3.5"
              fill={color}
              opacity="0.15"
            />
            <text x="28" y="18" textAnchor="middle" fontSize="8" fill="#9CA3AF">
              {label}방향
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function OpsBarChart({ stats }: { stats: HitterCombinedStat[] }) {
  if (stats.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-300 text-sm">
        스탯 데이터 없음
      </div>
    );
  }

  const sorted = [...stats].sort((a, b) => a.season - b.season);
  const getOps = (s: HitterCombinedStat) => calcHitterDerived(s).ops;
  const maxOps = Math.max(...sorted.map(getOps), 1.0);
  const GUIDES = [0.7, 0.8, 0.9, 1.0];

  const barColor = (ops: number) => {
    if (ops >= 0.9) return "#3B82F6";
    if (ops >= 0.8) return "#10B981";
    if (ops >= 0.7) return "#F59E0B";
    return "#9CA3AF";
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs text-gray-300 px-1 mb-1">
        {GUIDES.map((g) => (
          <span key={g}>{g.toFixed(3)}</span>
        ))}
      </div>
      {sorted.map((s) => {
        const ops = getOps(s);
        const pct = Math.min((ops / maxOps) * 100, 100);
        const color = barColor(ops);
        const latest = s.season === sorted[sorted.length - 1].season;
        return (
          <div key={s.season} className="flex items-center gap-3">
            <span
              className={`text-xs font-bold w-10 flex-shrink-0 ${latest ? "text-blue-600" : "text-gray-400"}`}
            >
              {s.season}
            </span>
            <div className="flex-1 relative h-7 rounded-lg overflow-hidden bg-gray-100">
              {GUIDES.map((g) => (
                <div
                  key={g}
                  className="absolute top-0 bottom-0 w-px bg-white"
                  style={{ left: `${(g / maxOps) * 100}%`, opacity: 0.6 }}
                />
              ))}
              <div
                className="absolute top-0 left-0 h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              >
                <span className="text-white text-xs font-black">
                  {ops.toFixed(3)}
                </span>
              </div>
            </div>
            <span className="text-xs text-gray-400 w-10 flex-shrink-0 text-right">
              {s.team}
            </span>
          </div>
        );
      })}
      <div className="flex items-center gap-4 pt-1 flex-wrap">
        {[
          { label: "엘리트 (0.900+)", color: "#3B82F6" },
          { label: "우수 (0.800+)", color: "#10B981" },
          { label: "평균 (0.700+)", color: "#F59E0B" },
          { label: "평균 이하", color: "#9CA3AF" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HitterStatcastTab({
  stats,
  hitDistrib,
}: HitterStatcastTabProps) {
  const sorted = [...stats].sort((a, b) => b.season - a.season);
  const latest = sorted[0] ?? null;

  const lf = hitDistrib?.LF ?? "50.6%";
  const cf = hitDistrib?.CF ?? "24.7%";
  const rf = hitDistrib?.RF ?? "24.7%";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* 스프레이 차트 — 방향별 타구 히트맵 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 rounded-full bg-green-500" />
            <h3 className="font-bold text-gray-800 text-sm">타구 방향 분포</h3>
            <span className="ml-auto text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
              밝을수록 높은 비율
            </span>
          </div>

          {/* 히트맵 차트 */}
          <div className="flex justify-center">
            <div className="w-full max-w-[260px]">
              <SprayHeatmap lf={lf} cf={cf} rf={rf} />
            </div>
          </div>

          {/* 수치 카드 */}
          <div className="mt-1 grid grid-cols-3 gap-2">
            {(
              [
                ["좌 (LF)", "#10B981", lf, parsePct(lf)],
                ["중 (CF)", "#3B82F6", cf, parsePct(cf)],
                ["우 (RF)", "#8B5CF6", rf, parsePct(rf)],
              ] as [string, string, string, number][]
            ).map(([label, color, val, num]) => {
              const isMax =
                num === Math.max(parsePct(lf), parsePct(cf), parsePct(rf));
              return (
                <div
                  key={label}
                  className={`text-center p-2.5 rounded-xl border-2 transition-all ${
                    isMax ? "shadow-sm" : ""
                  }`}
                  style={{
                    borderColor: isMax ? color : color + "30",
                    background: isMax ? color + "15" : color + "08",
                  }}
                >
                  <p className="text-xs font-medium text-gray-400">{label}</p>
                  <p className="text-lg font-black mt-0.5" style={{ color }}>
                    {val}
                  </p>
                  {isMax && (
                    <p className="text-xs font-bold mt-0.5" style={{ color }}>
                      최다 방향
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 연도별 OPS 바 차트 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-blue-500" />
            <h3 className="font-bold text-gray-800 text-sm">연도별 OPS 추이</h3>
            {latest && (
              <span className="ml-auto text-xl font-black text-blue-600">
                {calcHitterDerived(latest).ops.toFixed(3)}
              </span>
            )}
          </div>
          <OpsBarChart stats={stats} />
          {sorted.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                {
                  label: "커리어 최고 OPS",
                  val: Math.max(
                    ...sorted.map((s) => calcHitterDerived(s).ops),
                  ).toFixed(3),
                  color: "#EF4444",
                },
                {
                  label: "커리어 최저 OPS",
                  val: Math.min(
                    ...sorted.map((s) => calcHitterDerived(s).ops),
                  ).toFixed(3),
                  color: "#6B7280",
                },
                {
                  label: "최근 시즌 AVG",
                  val: latest ? fmtAvg(latest.avg) : "-",
                  color: "#3B82F6",
                },
                {
                  label: "최근 시즌 HR",
                  val: latest ? String(latest.hr ?? "-") : "-",
                  color: "#F59E0B",
                },
              ].map(({ label, val, color }) => (
                <div
                  key={label}
                  className="rounded-xl p-3 bg-gray-50 border border-gray-100"
                >
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-lg font-black mt-0.5" style={{ color }}>
                    {val}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 시즌 기록 테이블 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-purple-500" />
          <h3 className="font-bold text-gray-800">시즌 기록</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {[
                  "연도",
                  "팀",
                  "G",
                  "PA",
                  "H",
                  "HR",
                  "RBI",
                  "SB",
                  "AVG",
                  "OBP",
                  "SLG",
                  "OPS",
                  "BB%",
                  "K%",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-3 py-2.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${
                      ["AVG", "OBP", "SLG", "OPS"].includes(h)
                        ? "text-blue-600"
                        : h === "SB"
                          ? "text-emerald-500"
                          : "text-gray-400"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => {
                const d = calcHitterDerived(row);
                return (
                  <tr
                    key={i}
                    className={`border-t border-gray-50 ${i === 0 ? "bg-blue-50/40" : "hover:bg-gray-50"}`}
                  >
                    <td className="px-3 py-3 text-center font-bold text-gray-800">
                      {row.season}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {row.team}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {row.g ?? "-"}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {row.pa ?? "-"}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {row.h ?? "-"}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-gray-800">
                      {row.hr ?? "-"}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-gray-800">
                      {row.rbi ?? "-"}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-emerald-600">
                      {row.sb ?? "-"}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-blue-600">
                      {fmtAvg(row.avg)}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-blue-600">
                      {fmtAvg(d.obp)}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-blue-600">
                      {fmtAvg(d.slg)}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-yellow-600">
                      {d.ops.toFixed(3)}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {fmtPct(d.bbPct)}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {fmtPct(d.kPct)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
