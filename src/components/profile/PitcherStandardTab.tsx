// 투수 기본 스탯 탭 - 요약 카드 4개 + 시즌 투구 기록 테이블
import { fmtEra, fmtWhip, fmtWpct } from "@/utils/playerUtils";
import type { PitcherStat } from "@/types/playerStats";

interface PitcherStandardTabProps {
  stats: PitcherStat[];
}

export default function PitcherStandardTab({ stats }: PitcherStandardTabProps) {
  const sorted = [...stats].sort((a, b) => b.season - a.season);
  const latest = sorted[0];

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "ERA",    val: latest ? fmtEra(latest.era)   : "-", color: "from-orange-500 to-orange-600" },
          { label: "승리",   val: latest ? `${latest.w}승`       : "-", color: "from-green-500 to-green-600" },
          { label: "탈삼진", val: latest ? `${latest.so}K`       : "-", color: "from-blue-500 to-blue-600" },
          { label: "WHIP",   val: latest ? fmtWhip(latest.whip) : "-", color: "from-purple-500 to-purple-600" },
        ].map(({ label, val, color }) => (
          <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-white shadow-sm`}>
            <p className="text-white/70 text-xs font-medium">{label}</p>
            <p className="text-3xl font-black mt-0.5">{val}</p>
            <p className="text-white/60 text-xs mt-1">최근 시즌</p>
          </div>
        ))}
      </div>

      {/* 시즌 투구 기록 테이블 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-800">시즌 투구 기록</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {["연도","팀","G","W","L","SV","HLD","IP","H","R","ER","SO","HR","ERA","WHIP","승률"].map((h) => (
                  <th key={h} className={`px-3 py-2.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${["ERA","WHIP"].includes(h) ? "text-orange-500" : "text-gray-400"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => (
                <tr key={i} className={`border-t border-gray-50 ${i === 0 ? "bg-orange-50/40" : "hover:bg-gray-50"}`}>
                  <td className="px-3 py-3 text-center font-bold text-gray-800">{row.season}</td>
                  <td className="px-3 py-3 text-center text-gray-500">{row.team}</td>
                  <td className="px-3 py-3 text-center text-gray-500">{row.g}</td>
                  <td className="px-3 py-3 text-center font-bold text-green-600">{row.w}</td>
                  <td className="px-3 py-3 text-center text-gray-500">{row.l}</td>
                  <td className="px-3 py-3 text-center text-gray-500">{row.sv}</td>
                  <td className="px-3 py-3 text-center text-gray-500">{row.hld}</td>
                  <td className="px-3 py-3 text-center text-gray-500">{row.ip}</td>
                  <td className="px-3 py-3 text-center text-gray-500">{row.h}</td>
                  <td className="px-3 py-3 text-center text-gray-500">{row.r}</td>
                  <td className="px-3 py-3 text-center text-gray-500">{row.er}</td>
                  <td className="px-3 py-3 text-center font-bold text-blue-600">{row.so}</td>
                  <td className="px-3 py-3 text-center text-gray-500">{row.hr}</td>
                  <td className="px-3 py-3 text-center font-bold text-orange-500">{fmtEra(row.era)}</td>
                  <td className="px-3 py-3 text-center font-bold text-orange-400">{fmtWhip(row.whip)}</td>
                  <td className="px-3 py-3 text-center text-gray-500">{fmtWpct(row.wpct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
