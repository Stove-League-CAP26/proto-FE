// 타자 시즌 기록 테이블 컴포넌트
import type { HitterCombinedStat } from "@/utils/StatsCalculator";
import { calcHitterDerived, fmtAvg, fmtPct } from "@/utils/StatsCalculator";

interface HitterSeasonTableProps {
  stats: HitterCombinedStat[];
}

export default function HitterSeasonTable({ stats }: HitterSeasonTableProps) {
  const sorted = [...stats].sort((a, b) => b.season - a.season);

  return (
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
  );
}
