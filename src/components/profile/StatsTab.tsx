// 선수 프로필의 스탯 탭 - 주요 지표 요약 카드, 시즌별 타격 기록 테이블, OPS 연도별 추이 바 차트를 표시
interface SeasonStat {
  year: number;
  team: string;
  G: number;
  PA: number;
  AB: number;
  R: number;
  H: number;
  "2B": number;
  "3B": number;
  HR: number;
  RBI: number;
  SB: number;
  BB: number;
  SO: number;
  AVG: string;
  OBP: string;
  SLG: string;
  OPS: string;
}

interface StatsTabProps {
  stats: {
    season: SeasonStat[];
  };
}

export default function StatsTab({ stats }: StatsTabProps) {
  const cols = [
    "year", "team", "G", "PA", "AB", "R", "H",
    "2B", "3B", "HR", "RBI", "SB", "BB", "SO",
    "AVG", "OBP", "SLG", "OPS",
  ];
  const highlight = ["AVG", "OBP", "SLG", "OPS", "HR", "RBI"];

  return (
    <div className="space-y-6">
      {/* 주요 지표 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "타율", val: stats.season[0].AVG, color: "from-blue-500 to-blue-600" },
          { label: "홈런", val: stats.season[0].HR, color: "from-red-500 to-red-600" },
          { label: "타점", val: stats.season[0].RBI, color: "from-amber-500 to-amber-600" },
          { label: "OPS", val: stats.season[0].OPS, color: "from-emerald-500 to-emerald-600" },
        ].map(({ label, val, color }) => (
          <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-white shadow-sm`}>
            <p className="text-white/70 text-xs font-medium">{label}</p>
            <p className="text-3xl font-black mt-0.5">{val}</p>
            <p className="text-white/60 text-xs mt-1">최근 시즌</p>
          </div>
        ))}
      </div>

      {/* 시즌 타격 기록 테이블 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-800">시즌 타격 기록</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {cols.map((c) => (
                  <th
                    key={c}
                    className={`px-3 py-2.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${highlight.includes(c) ? "text-blue-600" : "text-gray-400"}`}
                  >
                    {c === "year" ? "연도" : c === "team" ? "팀" : c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.season.map((row, i) => (
                <tr key={i} className={`border-t border-gray-50 ${i === 0 ? "bg-blue-50/40" : "hover:bg-gray-50"}`}>
                  {cols.map((c) => (
                    <td
                      key={c}
                      className={`px-3 py-3 text-center whitespace-nowrap ${highlight.includes(c) ? "font-bold text-gray-800" : "text-gray-500"}`}
                    >
                      {row[c as keyof SeasonStat] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OPS 연도별 추이 바 차트 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-800 mb-4">OPS 연도별 추이</h3>
        <div className="space-y-3">
          {stats.season.map((row) => {
            const pct = (parseFloat(row.OPS) / 1.2) * 100;
            return (
              <div key={row.year} className="flex items-center gap-3">
                <span className="w-10 text-sm font-bold text-gray-500">{row.year}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center justify-end pr-2"
                    style={{
                      width: `${pct}%`,
                      background: "linear-gradient(90deg,#3b82f6,#06b6d4)",
                    }}
                  >
                    <span className="text-xs font-bold text-white">{row.OPS}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}