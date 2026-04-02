// 투수 시즌 기록 테이블 컴포넌트
import type { PitcherStatRaw } from "@/utils/StatsCalculator";
import { calcPitcherDerived, fmtEra, fmtWhip } from "@/utils/StatsCalculator";

interface PitcherSeasonTableProps {
  stats: PitcherStatRaw[];
}

export default function PitcherSeasonTable({ stats }: PitcherSeasonTableProps) {
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
  );
}
