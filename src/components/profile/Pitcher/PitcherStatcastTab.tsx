/**
 * PitcherStatcastTab.tsx
 * 투수 스탯캐스트 탭
 * - 구종 차트: MOCK 데이터 사용 (⚠️ 실데이터 연동 전까지 임시)
 * - ERA 바 차트: DB 실데이터
 * - K/9, BB/9, K/BB 계산
 */

import { calcPitcherDerived, fmtEra, fmtWhip } from "@/utils/StatsCalculator";
import type { PitcherStatRaw } from "@/utils/StatsCalculator";

// ── Mock 구종 데이터 ─────────────────────────────────────────────
const MOCK_PITCH_ARSENAL = [
  {
    name: "포심 패스트볼",
    abbr: "FF",
    pct: 38,
    avgVelo: 153.2,
    whiff: 28,
    color: "#EF4444",
  },
  {
    name: "슬라이더",
    abbr: "SL",
    pct: 28,
    avgVelo: 141.5,
    whiff: 42,
    color: "#3B82F6",
  },
  {
    name: "포크볼",
    abbr: "FS",
    pct: 18,
    avgVelo: 143.8,
    whiff: 51,
    color: "#F59E0B",
  },
  {
    name: "커브볼",
    abbr: "CU",
    pct: 10,
    avgVelo: 129.4,
    whiff: 35,
    color: "#10B981",
  },
  {
    name: "체인지업",
    abbr: "CH",
    pct: 6,
    avgVelo: 139.7,
    whiff: 38,
    color: "#8B5CF6",
  },
];

interface PitcherStatcastTabProps {
  stats: PitcherStatRaw[];
  // pitchStats prop 제거 — mock으로 대체
}

// ── 구종 구성 차트 (Mock) ────────────────────────────────────────
function PitchArsenalChart() {
  return (
    <div className="space-y-3">
      {MOCK_PITCH_ARSENAL.map((p) => (
        <div key={p.abbr} className="flex items-center gap-3">
          <div
            className="w-8 h-6 rounded-md flex items-center justify-center text-white text-xs font-black flex-shrink-0"
            style={{ backgroundColor: p.color }}
          >
            {p.abbr}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-gray-700">{p.name}</span>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="font-bold text-gray-600">{p.avgVelo}km/h</span>
                <span>Whiff {p.whiff}%</span>
              </div>
            </div>
            <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full flex items-center justify-end pr-2"
                style={{ width: `${p.pct}%`, backgroundColor: p.color + "dd" }}
              >
                <span className="text-white text-xs font-black">{p.pct}%</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── 주구종 요약 카드 (Mock) ──────────────────────────────────────
function PitchSummaryCards() {
  const top = MOCK_PITCH_ARSENAL[0];
  const maxSpd = [...MOCK_PITCH_ARSENAL].sort(
    (a, b) => b.avgVelo - a.avgVelo,
  )[0];
  return (
    <div className="grid grid-cols-2 gap-2 mt-5">
      <div className="rounded-xl p-3 bg-gray-50 border border-gray-100 text-center">
        <p className="text-xs text-gray-400">주구종</p>
        <p className="text-sm font-black mt-0.5" style={{ color: top.color }}>
          {top.name}
        </p>
      </div>
      <div className="rounded-xl p-3 bg-gray-50 border border-gray-100 text-center">
        <p className="text-xs text-gray-400">최고 구속</p>
        <p className="text-sm font-black mt-0.5 text-blue-600">
          {maxSpd.avgVelo}km/h
        </p>
      </div>
    </div>
  );
}

// ── 연도별 ERA 바 차트 (실데이터) ────────────────────────────────
function EraBarChart({ stats }: { stats: PitcherStatRaw[] }) {
  if (stats.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-300 text-sm">
        스탯 데이터 없음
      </div>
    );
  }

  const sorted = [...stats].sort((a, b) => a.season - b.season);
  const getEra = (s: PitcherStatRaw) => parseFloat(String(s.era ?? 0));
  const maxEra = Math.max(...sorted.map(getEra), 6.0);
  const GUIDES = [2.0, 3.0, 4.0, 5.0];

  const barColor = (era: number) => {
    if (era <= 2.5) return "#3B82F6";
    if (era <= 3.5) return "#10B981";
    if (era <= 4.5) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs text-gray-300 px-1 mb-1">
        {GUIDES.map((g) => (
          <span key={g}>{g.toFixed(2)}</span>
        ))}
      </div>
      {sorted.map((s) => {
        const era = getEra(s);
        const pct = Math.min(((maxEra - era) / maxEra) * 100, 100);
        const color = barColor(era);
        const latest = s.season === sorted[sorted.length - 1].season;
        return (
          <div key={s.season} className="flex items-center gap-3">
            <span
              className={`text-xs font-bold w-10 flex-shrink-0 ${latest ? "text-orange-500" : "text-gray-400"}`}
            >
              {s.season}
            </span>
            <div className="flex-1 relative h-7 rounded-lg overflow-hidden bg-gray-100">
              {GUIDES.map((g) => (
                <div
                  key={g}
                  className="absolute top-0 bottom-0 w-px bg-white"
                  style={{
                    left: `${((maxEra - g) / maxEra) * 100}%`,
                    opacity: 0.6,
                  }}
                />
              ))}
              <div
                className="absolute top-0 left-0 h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              >
                <span className="text-white text-xs font-black">
                  {fmtEra(era)}
                </span>
              </div>
            </div>
            <span className="text-xs text-gray-400 w-14 flex-shrink-0 text-right">
              {s.w}승 {s.l}패
            </span>
          </div>
        );
      })}
      <div className="flex items-center gap-4 pt-1 flex-wrap">
        {[
          { label: "에이스 (2.50↓)", color: "#3B82F6" },
          { label: "우수 (3.50↓)", color: "#10B981" },
          { label: "평균 (4.50↓)", color: "#F59E0B" },
          { label: "평균 이하", color: "#EF4444" },
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

// ── 메인 컴포넌트 ─────────────────────────────────────────────────
export default function PitcherStatcastTab({ stats }: PitcherStatcastTabProps) {
  const sorted = [...stats].sort((a, b) => b.season - a.season);
  const latest = sorted[0] ?? null;

  return (
    <div className="space-y-6">
      {/* 시즌 기록 테이블 — 실데이터 */}
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
                  "W",
                  "L",
                  "IP",
                  "ERA",
                  "WHIP",
                  "K",
                  "BB",
                  "HR",
                  "K/9",
                  "BB/9",
                  "K/BB",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-3 py-2.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${
                      ["ERA", "WHIP"].includes(h)
                        ? "text-orange-500"
                        : ["K/9", "BB/9", "K/BB"].includes(h)
                          ? "text-violet-500"
                          : h === "K"
                            ? "text-blue-500"
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
                const { k9, bb9, kbb } = calcPitcherDerived(row);
                return (
                  <tr
                    key={i}
                    className={`border-t border-gray-50 ${i === 0 ? "bg-orange-50/40" : "hover:bg-gray-50"}`}
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
                    <td className="px-3 py-3 text-center font-bold text-green-600">
                      {row.w ?? "-"}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {row.l ?? "-"}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {row.ip ?? "-"}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-orange-500">
                      {fmtEra(row.era)}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-orange-400">
                      {fmtWhip(row.whip)}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-blue-600">
                      {row.so ?? "-"}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {row.bb ?? "-"}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {row.hr ?? "-"}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-violet-500">
                      {k9 != null ? k9.toFixed(1) : "-"}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-violet-400">
                      {bb9 != null ? bb9.toFixed(1) : "-"}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-violet-600">
                      {kbb != null ? kbb.toFixed(2) : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 구종 구성 — Mock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 rounded-full bg-red-500" />
            <h3 className="font-bold text-gray-800 text-sm">
              구종 구성 (Pitch Usage)
            </h3>
            <span className="ml-auto text-[10px] text-amber-500 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
              SAMPLE DATA
            </span>
          </div>
          <PitchArsenalChart />
          <PitchSummaryCards />
        </div>

        {/* 연도별 ERA 바 차트 — 실데이터 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-orange-500" />
            <h3 className="font-bold text-gray-800 text-sm">연도별 ERA 추이</h3>
            {latest && (
              <span className="ml-auto text-xl font-black text-orange-500">
                {fmtEra(latest.era)}
              </span>
            )}
          </div>
          <EraBarChart stats={stats} />
          {sorted.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                {
                  label: "커리어 최저 ERA",
                  val: fmtEra(
                    Math.min(
                      ...sorted.map((s) => parseFloat(String(s.era ?? 99))),
                    ),
                  ),
                  color: "#10B981",
                },
                {
                  label: "커리어 최고 ERA",
                  val: fmtEra(
                    Math.max(
                      ...sorted.map((s) => parseFloat(String(s.era ?? 0))),
                    ),
                  ),
                  color: "#EF4444",
                },
                {
                  label: "최근 시즌 WHIP",
                  val: latest ? fmtWhip(latest.whip) : "-",
                  color: "#3B82F6",
                },
                {
                  label: "최근 시즌 탈삼진",
                  val: latest ? `${latest.so}K` : "-",
                  color: "#8B5CF6",
                },
              ].map(({ label, val, color }) => (
                <div
                  key={label}
                  className="rounded-xl p-3 bg-gray-50 border border-gray-100"
                >
                  <p className="text-xs text-gray-400 leading-tight">{label}</p>
                  <p className="text-lg font-black mt-0.5" style={{ color }}>
                    {val}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
