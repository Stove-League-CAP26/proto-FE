/**
 * HitterStatcastTab.tsx
 * 타자 스탯캐스트 탭
 *
 * 변경사항:
 * - HotColdTab에 있던 "타구 방향 분포" 섹션을 이동
 * - hitDistrib prop을 실제로 활용
 */

import type { HitterCombinedStat } from "@/utils/StatsCalculator";
import { calcHitterDerived, fmtAvg, fmtPct } from "@/utils/StatsCalculator";

interface HitterStatcastTabProps {
  stats: HitterCombinedStat[];
  hitDistrib?: { LF: string; CF: string; RF: string };
}

// ── 연도별 OPS 바 차트 ────────────────────────────────────────────────────────
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

// ── 타구 방향 분포 (HotColdTab에서 이동) ─────────────────────────────────────
function HitDistribChart({
  hitDistrib,
}: {
  hitDistrib: { LF: string; CF: string; RF: string };
}) {
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

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export default function HitterStatcastTab({
  stats,
  hitDistrib,
}: HitterStatcastTabProps) {
  const sorted = [...stats].sort((a, b) => b.season - a.season);
  const latest = sorted[0] ?? null;

  return (
    <div className="space-y-6">
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

      {/* 연도별 OPS 바 차트 + 타구 방향 분포 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* OPS 바 차트 */}
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

        {/* 타구 방향 분포 */}
        {hitDistrib && <HitDistribChart hitDistrib={hitDistrib} />}
      </div>
    </div>
  );
}
