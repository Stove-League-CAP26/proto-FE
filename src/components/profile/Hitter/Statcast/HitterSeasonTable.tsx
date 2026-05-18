// src/components/profile/Hitter/Statcast/HitterSeasonTable.tsx
import type { HitterCombinedStat } from "@/utils/StatsCalculator";
import { calcHitterDerived, fmtAvg, fmtPct } from "@/utils/StatsCalculator";

interface HitterSeasonTableProps {
  stats: HitterCombinedStat[];
}

const COLUMNS: { key: string; label: string; desc?: string; color?: string }[] =
  [
    { key: "season", label: "연도" },
    { key: "team", label: "팀" },
    { key: "g", label: "G", desc: "경기" },
    { key: "pa", label: "PA", desc: "타석" },
    { key: "ab", label: "AB", desc: "타수" },
    { key: "r", label: "R", desc: "득점" },
    { key: "h", label: "H", desc: "안타" },
    { key: "b2", label: "2B", desc: "2루타" },
    { key: "b3", label: "3B", desc: "3루타" },
    { key: "hr", label: "HR", desc: "홈런", color: "text-red-500" },
    { key: "tb", label: "TB", desc: "루타" },
    { key: "rbi", label: "RBI", desc: "타점", color: "text-amber-500" },
    { key: "sb", label: "SB", desc: "도루" },
    { key: "sac", label: "SAC", desc: "희생번트" },
    { key: "sf", label: "SF", desc: "희생플라이" },
    { key: "bb", label: "BB", desc: "볼넷" },
    { key: "ibb", label: "IBB", desc: "고의4구" },
    { key: "hbp", label: "HBP", desc: "사구" },
    { key: "so", label: "SO", desc: "삼진" },
    { key: "gdp", label: "GDP", desc: "병살" },
    { key: "mh", label: "MH", desc: "멀티히트" },
    { key: "avg", label: "AVG", desc: "타율", color: "text-blue-600" },
    { key: "obp", label: "OBP", desc: "출루율" },
    { key: "slg", label: "SLG", desc: "장타율" },
    { key: "ops", label: "OPS", desc: "출장합" },
    { key: "risp", label: "RISP", desc: "득점권타율" },
    { key: "phBa", label: "PH-BA", desc: "대타타율" },
    { key: "bbPct", label: "BB%", desc: "볼넷률" },
    { key: "kPct", label: "K%", desc: "삼진률" },
  ];

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
    case "sb":
      return (row as any).sb != null ? String((row as any).sb) : "-";
    case "sac":
      return row.sac != null ? String(row.sac) : "-";
    case "sf":
      return row.sf != null ? String(row.sf) : "-";
    case "bb":
      return row.bb != null ? String(row.bb) : "-";
    case "ibb":
      return row.ibb != null ? String(row.ibb) : "-";
    case "hbp":
      return (row as any).hbp != null ? String((row as any).hbp) : "-";
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
                    "px-3 py-2 text-center whitespace-nowrap border-b border-gray-100",
                    STICKY[col.key] ?? "",
                    STICKY[col.key]
                      ? "bg-gray-50 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]"
                      : "",
                  ].join(" ")}
                >
                  {/* 영문 약어 */}
                  <p
                    className={`text-xs font-bold uppercase tracking-wide ${col.color ?? "text-gray-500"}`}
                  >
                    {col.label}
                  </p>
                  {/* 한국어 설명 */}
                  {col.desc && (
                    <p className="text-[9px] text-gray-400 font-normal mt-0.5">
                      {col.desc}
                    </p>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const d = calcHitterDerived(row);
              const isLatest = i === 0;
              return (
                <tr
                  key={i}
                  className={`border-t border-gray-50 ${isLatest ? "bg-blue-50/40" : ""} hover:brightness-95`}
                >
                  {COLUMNS.map((col) => {
                    const isSticky = !!STICKY[col.key];
                    const stickyBg = isLatest ? "bg-blue-50/60" : "bg-white";
                    return (
                      <td
                        key={col.key}
                        className={[
                          "px-3 py-3 text-center whitespace-nowrap",
                          col.key === "season" ? "font-bold text-gray-900" : "",
                          col.key === "team" ? "text-gray-500" : "",
                          col.color &&
                          col.key !== "season" &&
                          col.key !== "team"
                            ? `font-bold ${col.color}`
                            : col.key !== "season" && col.key !== "team"
                              ? "text-gray-800"
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
