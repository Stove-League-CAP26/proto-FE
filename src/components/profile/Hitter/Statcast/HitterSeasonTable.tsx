// 타자 시즌 기록 테이블 컴포넌트 — 전체 스탯 컬럼 + 좌우 스크롤
import type { HitterCombinedStat } from "@/utils/StatsCalculator";
import { calcHitterDerived, fmtAvg, fmtPct } from "@/utils/StatsCalculator";

interface HitterSeasonTableProps {
  stats: HitterCombinedStat[];
}

const COLUMNS: {
  key: string;
  label: string;
  color?: string;
  derived?: boolean;
}[] = [
  { key: "season", label: "연도" },
  { key: "team", label: "팀" },
  { key: "g", label: "G" },
  { key: "pa", label: "PA" },
  { key: "ab", label: "AB" },
  { key: "r", label: "R" },
  { key: "h", label: "H" },
  { key: "b2", label: "2B" },
  { key: "b3", label: "3B" },
  { key: "hr", label: "HR", color: "text-red-500" },
  { key: "tb", label: "TB" },
  { key: "rbi", label: "RBI", color: "text-amber-500" },
  { key: "sac", label: "SAC" },
  { key: "sf", label: "SF" },
  { key: "bb", label: "BB" },
  { key: "ibb", label: "IBB" },
  { key: "hbp", label: "HBP" },
  { key: "so", label: "SO" },
  { key: "gdp", label: "GDP" },
  { key: "mh", label: "MH" },
  { key: "avg", label: "AVG", color: "text-blue-600" },
  { key: "obp", label: "OBP", color: "text-blue-600" },
  { key: "slg", label: "SLG", color: "text-blue-600" },
  { key: "ops", label: "OPS", color: "text-yellow-600" },
  { key: "risp", label: "RISP", color: "text-emerald-600" },
  { key: "phBa", label: "PH-BA" },
  { key: "bbPct", label: "BB%", color: "text-violet-500", derived: true },
  { key: "kPct", label: "K%", color: "text-violet-500", derived: true },
];

// 연도·팀 sticky 처리
const STICKY: Record<string, string> = {
  season: "sticky left-0 z-10",
  team: "sticky left-[60px] z-10",
};

function fmtCell(
  key: string,
  row: HitterCombinedStat,
  d: ReturnType<typeof calcHitterDerived>,
): string {
  switch (key) {
    case "season":
      return String(row.season);
    case "team":
      return row.team ?? "-";
    case "g":
      return row.g != null ? String(row.g) : "-";
    case "pa":
      return row.pa != null ? String(row.pa) : "-";
    case "ab":
      return row.ab != null ? String(row.ab) : "-";
    case "r":
      return row.r != null ? String(row.r) : "-";
    case "h":
      return row.h != null ? String(row.h) : "-";
    case "b2":
      return row.b2 != null ? String(row.b2) : "-";
    case "b3":
      return row.b3 != null ? String(row.b3) : "-";
    case "hr":
      return row.hr != null ? String(row.hr) : "-";
    case "tb":
      return row.tb != null ? String(row.tb) : "-";
    case "rbi":
      return row.rbi != null ? String(row.rbi) : "-";
    case "sac":
      return row.sac != null ? String(row.sac) : "-";
    case "sf":
      return row.sf != null ? String(row.sf) : "-";
    case "bb":
      return row.bb != null ? String(row.bb) : "-";
    case "ibb":
      return row.ibb != null ? String(row.ibb) : "-";
    case "hbp":
      return row.hbp != null ? String(row.hbp) : "-";
    case "so":
      return row.so != null ? String(row.so) : "-";
    case "gdp":
      return row.gdp != null ? String(row.gdp) : "-";
    case "mh":
      return row.mh != null ? String(row.mh) : "-";
    case "avg":
      return fmtAvg(row.avg);
    case "obp":
      return fmtAvg(d.obp);
    case "slg":
      return fmtAvg(d.slg);
    case "ops":
      return d.ops.toFixed(3);
    case "risp":
      return row.risp != null ? row.risp.toFixed(3) : "-";
    case "phBa":
      return row.phBa != null ? row.phBa.toFixed(3) : "-";
    case "bbPct":
      return fmtPct(d.bbPct);
    case "kPct":
      return fmtPct(d.kPct);
    default:
      return "-";
  }
}

export default function HitterSeasonTable({ stats }: HitterSeasonTableProps) {
  const sorted = [...stats].sort((a, b) => b.season - a.season);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
        <div className="w-1 h-5 rounded-full bg-purple-500" />
        <h3 className="font-bold text-gray-800">시즌 기록</h3>
        <span className="ml-auto text-xs text-gray-400">← 좌우 스크롤</span>
      </div>

      <div className="overflow-x-auto table-scroll">
        <table className="text-sm border-collapse min-w-full">
          <thead>
            <tr className="bg-gray-50">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={[
                    "px-3 py-2.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap border-b border-gray-100",
                    col.color ?? "text-gray-400",
                    STICKY[col.key] ?? "",
                    STICKY[col.key]
                      ? "bg-gray-50 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]"
                      : "",
                  ].join(" ")}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const d = calcHitterDerived(row);
              const isLatest = i === 0;
              const rowBg = isLatest ? "bg-blue-50/40" : "";

              return (
                <tr
                  key={i}
                  className={`border-t border-gray-50 ${rowBg} hover:brightness-95`}
                >
                  {COLUMNS.map((col) => {
                    const isSticky = !!STICKY[col.key];
                    const stickyBg = isLatest ? "bg-blue-50/60" : "bg-white";

                    return (
                      <td
                        key={col.key}
                        className={[
                          "px-3 py-3 text-center whitespace-nowrap",
                          col.key === "season" ? "font-bold text-gray-800" : "",
                          col.key === "team" ? "text-gray-500" : "",
                          col.color &&
                          col.key !== "season" &&
                          col.key !== "team"
                            ? `font-bold ${col.color}`
                            : col.key !== "season" && col.key !== "team"
                              ? "text-gray-600"
                              : "",
                          isSticky
                            ? `${STICKY[col.key]} ${stickyBg} shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]`
                            : "",
                        ].join(" ")}
                      >
                        {fmtCell(col.key, row, d)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
