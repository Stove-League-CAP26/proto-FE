// 타자 스탯캐스트 탭 - 스프레이 차트, 롤링 OPS 추이, 시즌 기록 테이블
// 레이더 차트는 PlayerHeroBanner에서 표시하므로 이 탭에서는 제거
import RollingLineChart from "@/components/common/RollingLineChart";
import { fmtAvg } from "@/utils/playerUtils";
import type { HitterStat } from "@/types/playerStats";

const MOCK_SPRAY: { x: number; y: number; type: string }[] = [
  { x: 58, y: 92, type: "1B" },
  { x: 48, y: 108, type: "OUT" },
  { x: 72, y: 78, type: "2B" },
  { x: 53, y: 82, type: "HR" },
  { x: 63, y: 98, type: "1B" },
  { x: 68, y: 68, type: "HR" },
  { x: 128, y: 38, type: "HR" },
  { x: 150, y: 32, type: "OUT" },
  { x: 168, y: 44, type: "2B" },
  { x: 140, y: 52, type: "1B" },
  { x: 222, y: 92, type: "1B" },
  { x: 238, y: 78, type: "2B" },
  { x: 228, y: 63, type: "HR" },
  { x: 242, y: 88, type: "1B" },
  { x: 113, y: 108, type: "OUT" },
  { x: 133, y: 98, type: "1B" },
  { x: 162, y: 113, type: "OUT" },
  { x: 178, y: 100, type: "2B" },
];

const MOCK_ROLLING_OPS = [
  { label: "4/01", val: 0.82 },
  { label: "4/15", val: 0.88 },
  { label: "5/01", val: 0.91 },
  { label: "5/15", val: 0.87 },
  { label: "6/01", val: 0.94 },
  { label: "6/15", val: 0.93 },
  { label: "7/01", val: 0.89 },
  { label: "7/15", val: 0.96 },
  { label: "8/01", val: 0.92 },
  { label: "9/15", val: 0.939 },
];

interface HitterStatcastTabProps {
  stats: HitterStat[];
}

export default function HitterStatcastTab({ stats }: HitterStatcastTabProps) {
  const sorted = [...stats].sort((a, b) => b.season - a.season);
  const latest = sorted[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* 스프레이 차트 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 rounded-full bg-green-500" />
            <h3 className="font-bold text-gray-800 text-sm">
              타구 분포 (스프레이 차트)
            </h3>
            <span className="ml-auto text-xs text-gray-400">
              {latest?.season ?? "-"} 시즌
            </span>
          </div>
          <div className="relative w-full" style={{ height: 220 }}>
            <svg
              viewBox="0 0 300 260"
              className="absolute inset-0 w-full h-full max-w-xs mx-auto left-0 right-0"
            >
              <path d="M150,245 L10,90 Q150,5 290,90 Z" fill="#2d6a2d" />
              <path d="M150,183 L93,128 L150,75 L207,128 Z" fill="#c8a26a" />
              <ellipse cx="150" cy="133" rx="38" ry="38" fill="#2d6a2d" />
              <path
                d="M150,245 L10,90 Q150,5 290,90 Z"
                fill="none"
                stroke="#a07840"
                strokeWidth="8"
                strokeOpacity="0.4"
              />
              <line
                x1="150"
                y1="245"
                x2="10"
                y2="90"
                stroke="white"
                strokeWidth="1.5"
                opacity="0.4"
              />
              <line
                x1="150"
                y1="245"
                x2="290"
                y2="90"
                stroke="white"
                strokeWidth="1.5"
                opacity="0.4"
              />
              {(
                [
                  [150, 75],
                  [207, 128],
                  [150, 183],
                  [93, 128],
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
              <polygon
                points="147,240 153,240 155,245 150,248 145,245"
                fill="white"
              />
              <ellipse
                cx="150"
                cy="133"
                rx="6"
                ry="6"
                fill="#c8a26a"
                stroke="#a07840"
                strokeWidth="1"
              />
              {MOCK_SPRAY.map((d, i) => {
                const colors: Record<string, string> = {
                  HR: "#EF4444",
                  "2B": "#F59E0B",
                  "1B": "#10B981",
                  OUT: "#9CA3AF",
                };
                return (
                  <circle
                    key={i}
                    cx={d.x}
                    cy={d.y}
                    r="4.5"
                    fill={colors[d.type] ?? "#9CA3AF"}
                    opacity="0.85"
                    stroke="white"
                    strokeWidth="0.8"
                  />
                );
              })}
            </svg>
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
            {(
              [
                ["HR", "#EF4444"],
                ["2루타", "#F59E0B"],
                ["안타", "#10B981"],
                ["아웃", "#9CA3AF"],
              ] as [string, string][]
            ).map(([t, c]) => (
              <div key={t} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: c }}
                />
                <span className="text-xs text-gray-500 font-medium">{t}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              ["좌", "50.6%", "#10B981"],
              ["중", "24.7%", "#3B82F6"],
              ["우", "24.7%", "#8B5CF6"],
            ].map(([d, v, c]) => (
              <div
                key={d}
                className="text-center p-2 rounded-xl border"
                style={{ borderColor: c + "40", background: c + "10" }}
              >
                <p className="text-xs font-medium text-gray-500">{d}방향</p>
                <p className="text-base font-black" style={{ color: c }}>
                  {v}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 롤링 OPS */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 rounded-full bg-blue-500" />
            <h3 className="font-bold text-gray-800 text-sm">롤링 OPS 추이</h3>
            <span className="ml-auto text-xl font-black text-blue-600">
              {latest ? fmtAvg(latest.avg) : "-"}
            </span>
          </div>
          <RollingLineChart
            data={MOCK_ROLLING_OPS}
            color="#3B82F6"
            minVal={0.75}
            maxVal={1.05}
            label="ops"
          />
          <p className="text-xs text-gray-400 text-center mt-1">
            14일 이동 평균
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { label: "최고 OPS", val: "0.960", sub: "7월", color: "#EF4444" },
              { label: "최저 OPS", val: "0.820", sub: "4월", color: "#6B7280" },
              { label: "전반기", val: "0.908", sub: "AVG", color: "#3B82F6" },
              { label: "후반기", val: "0.931", sub: "AVG", color: "#10B981" },
            ].map(({ label, val, sub, color }) => (
              <div
                key={label}
                className="rounded-xl p-3 bg-gray-50 border border-gray-100"
              >
                <p className="text-xs text-gray-400">{label}</p>
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
                  "PA",
                  "AB",
                  "H",
                  "2B",
                  "3B",
                  "HR",
                  "RBI",
                  "TB",
                  "AVG",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-3 py-2.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${["AVG", "HR", "RBI"].includes(h) ? "text-blue-600" : "text-gray-400"}`}
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
                  className={`border-t border-gray-50 ${i === 0 ? "bg-blue-50/40" : "hover:bg-gray-50"}`}
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
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.pa}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.ab}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.h}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.b2}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.b3}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-gray-800">
                    {row.hr}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-gray-800">
                    {row.rbi}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.tb}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-blue-600">
                    {fmtAvg(row.avg)}
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
