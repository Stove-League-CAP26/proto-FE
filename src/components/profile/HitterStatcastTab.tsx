// 타자 스탯캐스트 탭
// - 스프레이 차트 (타구 분포)
// - 연도별 OPS 바 차트 (실제 DB 시즌 스탯)
// - 시즌 기록 테이블
import type { HitterStat } from "@/types/playerStats";
import { fmtAvg } from "@/utils/playerUtils";

interface HitterStatcastTabProps {
  stats: HitterStat[];
  hitDistrib?: { LF: string; CF: string; RF: string }; // DB 타구 방향 (없으면 기본값)
}

// 스프레이 차트 점 데이터 (mock — 실제 경기 단위 데이터 없으면 유지)
const SPRAY_DOTS: { x: number; y: number; type: string }[] = [
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

const DOT_COLOR: Record<string, string> = {
  HR: "#EF4444",
  "2B": "#F59E0B",
  "1B": "#10B981",
  OUT: "#9CA3AF",
};

// ── 연도별 OPS 바 차트 ──────────────────────────────────────────
function OpsBarChart({ stats }: { stats: HitterStat[] }) {
  if (stats.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-300 text-sm">
        스탯 데이터 없음
      </div>
    );
  }

  const sorted = [...stats].sort((a, b) => a.season - b.season);

  // OPS = OBP + SLG — DB에 ops 컬럼이 있으면 그대로, 없으면 obp+slg 합산
  const getOps = (s: HitterStat): number => {
    if (s.ops != null) return parseFloat(String(s.ops));
    const obp = parseFloat(String(s.obp ?? 0));
    const slg = parseFloat(String(s.slg ?? 0));
    return obp + slg;
  };

  const maxOps = Math.max(...sorted.map(getOps), 1.0);

  // 기준선: 0.700 / 0.800 / 0.900 / 1.000
  const GUIDES = [0.7, 0.8, 0.9, 1.0];

  // OPS 수준별 색상
  const barColor = (ops: number) => {
    if (ops >= 0.9) return { bar: "#3B82F6", bg: "#EFF6FF" };
    if (ops >= 0.8) return { bar: "#10B981", bg: "#ECFDF5" };
    if (ops >= 0.7) return { bar: "#F59E0B", bg: "#FFFBEB" };
    return { bar: "#9CA3AF", bg: "#F9FAFB" };
  };

  return (
    <div className="space-y-2.5">
      {/* 가이드라인 헤더 */}
      <div className="flex items-center justify-between text-xs text-gray-300 px-1 mb-1">
        {GUIDES.map((g) => (
          <span key={g}>{g.toFixed(3)}</span>
        ))}
      </div>

      {sorted.map((s) => {
        const ops = getOps(s);
        const pct = Math.min((ops / maxOps) * 100, 100);
        const { bar, bg } = barColor(ops);
        const latest = s.season === sorted[sorted.length - 1].season;

        return (
          <div key={s.season} className="flex items-center gap-3">
            {/* 연도 */}
            <span
              className={`text-xs font-bold w-10 flex-shrink-0 ${latest ? "text-blue-600" : "text-gray-400"}`}
            >
              {s.season}
            </span>

            {/* 바 */}
            <div
              className="flex-1 relative h-7 rounded-lg overflow-hidden"
              style={{ background: "#F3F4F6" }}
            >
              {/* 가이드라인 수직선 */}
              {GUIDES.map((g) => (
                <div
                  key={g}
                  className="absolute top-0 bottom-0 w-px bg-white"
                  style={{ left: `${(g / maxOps) * 100}%`, opacity: 0.6 }}
                />
              ))}
              {/* 실제 바 */}
              <div
                className="absolute top-0 left-0 h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: bar }}
              >
                <span className="text-white text-xs font-black">
                  {ops.toFixed(3)}
                </span>
              </div>
            </div>

            {/* 팀 */}
            <span className="text-xs text-gray-400 w-10 flex-shrink-0 text-right">
              {s.team}
            </span>
          </div>
        );
      })}

      {/* 범례 */}
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

// ── 메인 컴포넌트 ────────────────────────────────────────────────
export default function HitterStatcastTab({
  stats,
  hitDistrib,
}: HitterStatcastTabProps) {
  const sorted = [...stats].sort((a, b) => b.season - a.season);
  const latest = sorted[0] ?? null;

  // 타구 방향: DB 데이터 우선, 없으면 기본값
  const lf = hitDistrib?.LF ?? "50.6%";
  const cf = hitDistrib?.CF ?? "24.7%";
  const rf = hitDistrib?.RF ?? "24.7%";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ── 스프레이 차트 ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 rounded-full bg-green-500" />
            <h3 className="font-bold text-gray-800 text-sm">
              타구 분포 (스프레이 차트)
            </h3>
            <span className="ml-auto text-xs text-gray-400">2025 시즌</span>
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
              {SPRAY_DOTS.map((d, i) => (
                <circle
                  key={i}
                  cx={d.x}
                  cy={d.y}
                  r="4.5"
                  fill={DOT_COLOR[d.type] ?? "#9CA3AF"}
                  opacity="0.85"
                  stroke="white"
                  strokeWidth="0.8"
                />
              ))}
            </svg>
          </div>

          {/* 범례 */}
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

          {/* 타구 방향 — DB 실제 데이터 */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(
              [
                ["좌", "#10B981", lf],
                ["중", "#3B82F6", cf],
                ["우", "#8B5CF6", rf],
              ] as [string, string, string][]
            ).map(([d, c, v]) => (
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

        {/* ── 연도별 OPS 바 차트 ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-blue-500" />
            <h3 className="font-bold text-gray-800 text-sm">연도별 OPS 추이</h3>
            {latest && (
              <span className="ml-auto text-xl font-black text-blue-600">
                {(() => {
                  const ops =
                    latest.ops != null
                      ? parseFloat(String(latest.ops))
                      : parseFloat(String(latest.obp ?? 0)) +
                        parseFloat(String(latest.slg ?? 0));
                  return ops.toFixed(3);
                })()}
              </span>
            )}
          </div>

          <OpsBarChart stats={stats} />

          {/* 요약 카드 */}
          {sorted.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                {
                  label: "커리어 최고 OPS",
                  val: (() => {
                    const max = Math.max(
                      ...sorted.map((s) =>
                        s.ops != null
                          ? parseFloat(String(s.ops))
                          : parseFloat(String(s.obp ?? 0)) +
                            parseFloat(String(s.slg ?? 0)),
                      ),
                    );
                    return max.toFixed(3);
                  })(),
                  color: "#EF4444",
                },
                {
                  label: "커리어 최저 OPS",
                  val: (() => {
                    const min = Math.min(
                      ...sorted.map((s) =>
                        s.ops != null
                          ? parseFloat(String(s.ops))
                          : parseFloat(String(s.obp ?? 0)) +
                            parseFloat(String(s.slg ?? 0)),
                      ),
                    );
                    return min.toFixed(3);
                  })(),
                  color: "#6B7280",
                },
                {
                  label: "최근 시즌 AVG",
                  val: latest ? fmtAvg(latest.avg) : "-",
                  color: "#3B82F6",
                },
                {
                  label: "최근 시즌 HR",
                  val: latest ? String(latest.hr) : "-",
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

      {/* ── 시즌 기록 테이블 ── */}
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
                  "HR",
                  "RBI",
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
                const ops =
                  row.ops != null
                    ? parseFloat(String(row.ops))
                    : parseFloat(String(row.obp ?? 0)) +
                      parseFloat(String(row.slg ?? 0));
                const bbPct =
                  row.pa && row.bb != null
                    ? ((row.bb / row.pa) * 100).toFixed(1) + "%"
                    : "-";
                const kPct =
                  row.pa && row.so != null
                    ? ((row.so / row.pa) * 100).toFixed(1) + "%"
                    : "-";
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
                    <td className="px-3 py-3 text-center font-bold text-gray-800">
                      {row.hr}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-gray-800">
                      {row.rbi}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-blue-600">
                      {fmtAvg(row.avg)}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-blue-600">
                      {fmtAvg(row.obp)}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-blue-600">
                      {fmtAvg(row.slg)}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-yellow-600">
                      {ops.toFixed(3)}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {bbPct}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {kPct}
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
