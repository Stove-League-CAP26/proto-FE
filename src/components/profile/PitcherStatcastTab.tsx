// 투수 스탯캐스트 탭 - 구종 구성, 롤링 ERA 추이, 시즌 기록 테이블
// 레이더 차트는 PlayerHeroBanner에서 표시하므로 이 탭에서는 제거
import PitchArsenalChart from "@/components/profile/PitchArsenalChart";
import RollingLineChart from "@/components/common/RollingLineChart";
import { fmtEra, fmtWhip, fmtWpct } from "@/utils/playerUtils";
import { MOCK_ROLLING_ERA } from "@/mock/statsData";
import type { PitcherStat } from "@/types/playerStats";

interface PitcherStatcastTabProps {
  stats: PitcherStat[];
}

export default function PitcherStatcastTab({ stats }: PitcherStatcastTabProps) {
  const sorted = [...stats].sort((a, b) => b.season - a.season);
  const latest = sorted[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 구종 비율 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 rounded-full bg-red-500" />
            <h3 className="font-bold text-gray-800 text-sm">
              구종 구성 (Pitch Usage)
            </h3>
            <span className="ml-auto text-xs text-gray-400">
              {latest?.season ?? "-"} 시즌
            </span>
          </div>
          <PitchArsenalChart />
          <div className="grid grid-cols-3 gap-2 mt-5">
            {[
              { label: "주구종", val: "포심", color: "#EF4444" },
              { label: "평균 구속", val: "153km", color: "#3B82F6" },
              { label: "헛스윙%", val: "32.1%", color: "#F59E0B" },
            ].map(({ label, val, color }) => (
              <div
                key={label}
                className="rounded-xl p-3 bg-gray-50 border border-gray-100 text-center"
              >
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-black mt-0.5" style={{ color }}>
                  {val}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 롤링 ERA */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 rounded-full bg-orange-500" />
            <h3 className="font-bold text-gray-800 text-sm">롤링 ERA 추이</h3>
            <span className="ml-auto text-xl font-black text-orange-500">
              {latest ? fmtEra(latest.era) : "-"}
            </span>
          </div>
          <RollingLineChart
            data={MOCK_ROLLING_ERA}
            color="#F97316"
            minVal={1.5}
            maxVal={3.5}
            label="era"
            inverse
          />
          <p className="text-xs text-gray-400 text-center mt-1">
            14일 이동 평균 · 낮을수록 좋음
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              {
                label: "시즌 최저 ERA",
                val: "1.98",
                sub: "7월",
                color: "#10B981",
              },
              {
                label: "시즌 최고 ERA",
                val: "3.20",
                sub: "4월",
                color: "#EF4444",
              },
              {
                label: "전반기 ERA",
                val: "2.54",
                sub: "AVG",
                color: "#3B82F6",
              },
              {
                label: "후반기 ERA",
                val: latest ? fmtEra(latest.era) : "-",
                sub: "AVG",
                color: "#F97316",
              },
            ].map(({ label, val, sub, color }) => (
              <div
                key={label}
                className="rounded-xl p-3 bg-gray-50 border border-gray-100"
              >
                <p className="text-xs text-gray-400 leading-tight">{label}</p>
                <p className="text-lg font-black mt-0.5" style={{ color }}>
                  {val}
                </p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>
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
                  "W",
                  "L",
                  "SV",
                  "HLD",
                  "IP",
                  "H",
                  "HR",
                  "R",
                  "ER",
                  "SO",
                  "ERA",
                  "WHIP",
                  "승률",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-3 py-2.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${["ERA", "WHIP"].includes(h) ? "text-orange-500" : "text-gray-400"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => (
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
                    {row.g}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-green-600">
                    {row.w}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.l}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.sv}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.hld}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.ip}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.h}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.hr}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.r}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.er}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-blue-600">
                    {row.so}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-orange-500">
                    {fmtEra(row.era)}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-orange-400">
                    {fmtWhip(row.whip)}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {fmtWpct(row.wpct)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
