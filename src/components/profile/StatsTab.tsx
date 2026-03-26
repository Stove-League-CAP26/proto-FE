// 선수 프로필의 스탯 탭 - 주요 지표 요약 카드, 시즌별 기록 테이블, 연도별 추이 바 차트를 표시
// 타자/투수 타입에 따라 다른 컬럼과 지표를 렌더링

// ── 타자 시즌 스탯 (API 응답 → 변환 후) ─────────────────
interface HitterSeasonStat {
  year: number;
  team: string;
  g: number;
  pa: number;
  ab: number;
  r: number;
  h: number;
  b2: number;
  b3: number;
  hr: number;
  rbi: number;
  tb: number;
  sac: number;
  sf: number;
  avg: number | string;
  hitterRank?: number;
}

// ── 투수 시즌 스탯 (API 응답 → 변환 후) ─────────────────
interface PitcherSeasonStat {
  year: number;
  team: string;
  g: number;
  w: number;
  l: number;
  sv: number;
  hld: number;
  ip: number;
  h: number;
  hr: number;
  hbp: number;
  r: number;
  er: number;
  so: number;
  era: number | string;
  whip: number | string;
  wpct: number | string;
  pitcherRank?: number;
}

interface StatsTabProps {
  playerType: "hitter" | "pitcher";
  stats: HitterSeasonStat[] | PitcherSeasonStat[];
}

// ── 타자 컬럼 정의 ────────────────────────────────────────
const HITTER_COLS: { key: keyof HitterSeasonStat; label: string }[] = [
  { key: "year", label: "연도" },
  { key: "team", label: "팀" },
  { key: "g", label: "G" },
  { key: "pa", label: "PA" },
  { key: "ab", label: "AB" },
  { key: "r", label: "R" },
  { key: "h", label: "H" },
  { key: "b2", label: "2B" },
  { key: "b3", label: "3B" },
  { key: "hr", label: "HR" },
  { key: "rbi", label: "RBI" },
  { key: "tb", label: "TB" },
  { key: "sac", label: "SAC" },
  { key: "sf", label: "SF" },
  { key: "avg", label: "AVG" },
  { key: "hitterRank", label: "순위" },
];

const HITTER_HIGHLIGHT = new Set(["avg", "hr", "rbi", "pa"]);

// ── 투수 컬럼 정의 ────────────────────────────────────────
const PITCHER_COLS: { key: keyof PitcherSeasonStat; label: string }[] = [
  { key: "year", label: "연도" },
  { key: "team", label: "팀" },
  { key: "g", label: "G" },
  { key: "w", label: "W" },
  { key: "l", label: "L" },
  { key: "sv", label: "SV" },
  { key: "hld", label: "HLD" },
  { key: "ip", label: "IP" },
  { key: "h", label: "H" },
  { key: "hr", label: "HR" },
  { key: "hbp", label: "HBP" },
  { key: "r", label: "R" },
  { key: "er", label: "ER" },
  { key: "so", label: "SO" },
  { key: "era", label: "ERA" },
  { key: "whip", label: "WHIP" },
  { key: "wpct", label: "승률" },
  { key: "pitcherRank", label: "순위" },
];

const PITCHER_HIGHLIGHT = new Set(["era", "whip", "so", "w"]);

// ── 값 포맷 유틸 ─────────────────────────────────────────
function fmt(val: unknown): string {
  if (val === undefined || val === null) return "-";
  if (typeof val === "number") {
    // AVG, ERA, WHIP, 승률처럼 소수점이 있는 경우
    if (!Number.isInteger(val)) return val.toFixed(3);
    return String(val);
  }
  return String(val);
}

export default function StatsTab({ playerType, stats }: StatsTabProps) {
  const isHitter = playerType === "hitter";

  if (!stats || stats.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        <p className="text-4xl mb-3">📊</p>
        <p className="font-bold">스탯 데이터가 없습니다</p>
      </div>
    );
  }

  // 최신 시즌 (season 내림차순 기준 첫 번째)
  const sorted = [...stats].sort((a, b) => b.year - a.year);
  const latest = sorted[0];

  // ── 타자 요약 카드 ──────────────────────────────────────
  const hitterSummaryCards = () => {
    const s = latest as HitterSeasonStat;
    return [
      { label: "타율", val: fmt(s.avg), color: "from-blue-500 to-blue-600" },
      { label: "홈런", val: fmt(s.hr), color: "from-red-500 to-red-600" },
      { label: "타점", val: fmt(s.rbi), color: "from-amber-500 to-amber-600" },
      {
        label: "득점",
        val: fmt(s.r),
        color: "from-emerald-500 to-emerald-600",
      },
    ];
  };

  // ── 투수 요약 카드 ──────────────────────────────────────
  const pitcherSummaryCards = () => {
    const s = latest as PitcherSeasonStat;
    return [
      { label: "ERA", val: fmt(s.era), color: "from-blue-500 to-blue-600" },
      {
        label: "승리",
        val: fmt(s.w),
        color: "from-emerald-500 to-emerald-600",
      },
      { label: "탈삼진", val: fmt(s.so), color: "from-red-500 to-red-600" },
      { label: "WHIP", val: fmt(s.whip), color: "from-amber-500 to-amber-600" },
    ];
  };

  const summaryCards = isHitter ? hitterSummaryCards() : pitcherSummaryCards();

  // ── 차트용 데이터: 타자=AVG, 투수=ERA ───────────────────
  const chartRows = sorted.map((row) => {
    const s = row as any;
    const rawVal = isHitter ? s.avg : s.era;
    const numVal = parseFloat(String(rawVal));
    // AVG는 0~0.4 범위, ERA는 0~9 범위로 정규화
    const maxVal = isHitter ? 0.4 : 9;
    const pct = isNaN(numVal) ? 0 : Math.min((numVal / maxVal) * 100, 100);
    return { year: s.year, display: fmt(rawVal), pct };
  });

  const chartLabel = isHitter ? "AVG 연도별 추이" : "ERA 연도별 추이";
  const chartColor = isHitter
    ? "linear-gradient(90deg,#3b82f6,#06b6d4)"
    : "linear-gradient(90deg,#ef4444,#f97316)";

  // ── 테이블 렌더링 ────────────────────────────────────────
  const cols = isHitter ? HITTER_COLS : PITCHER_COLS;
  const highlight = isHitter ? HITTER_HIGHLIGHT : PITCHER_HIGHLIGHT;

  return (
    <div className="space-y-6">
      {/* 주요 지표 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryCards.map(({ label, val, color }) => (
          <div
            key={label}
            className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-white shadow-sm`}
          >
            <p className="text-white/70 text-xs font-medium">{label}</p>
            <p className="text-3xl font-black mt-0.5">{val}</p>
            <p className="text-white/60 text-xs mt-1">최근 시즌</p>
          </div>
        ))}
      </div>

      {/* 시즌 기록 테이블 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-800">
            {isHitter ? "시즌 타격 기록" : "시즌 투구 기록"}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {cols.map(({ key, label }) => (
                  <th
                    key={key}
                    className={`px-3 py-2.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${
                      highlight.has(key as string)
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    {label}
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
                  {cols.map(({ key }) => (
                    <td
                      key={key}
                      className={`px-3 py-3 text-center whitespace-nowrap ${
                        highlight.has(key as string)
                          ? "font-bold text-gray-800"
                          : "text-gray-500"
                      }`}
                    >
                      {fmt((row as any)[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 연도별 추이 바 차트 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-800 mb-4">{chartLabel}</h3>
        <div className="space-y-3">
          {chartRows.map((row) => (
            <div key={row.year} className="flex items-center gap-3">
              <span className="w-10 text-sm font-bold text-gray-500">
                {row.year}
              </span>
              <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${row.pct}%`, background: chartColor }}
                >
                  <span className="text-xs font-bold text-white">
                    {row.display}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
