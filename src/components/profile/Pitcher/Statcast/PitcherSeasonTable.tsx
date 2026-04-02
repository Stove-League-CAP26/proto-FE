// 투수 시즌 기록 테이블 컴포넌트 — 전체 스탯 컬럼 + 좌우 스크롤
import type { PitcherStatRaw } from "@/utils/StatsCalculator";
import { calcPitcherDerived, fmtEra, fmtWhip } from "@/utils/StatsCalculator";

interface PitcherSeasonTableProps {
  stats: PitcherStatRaw[];
}

const COLUMNS: { key: string; label: string; color?: string }[] = [
  { key: "season", label: "연도" },
  { key: "team", label: "팀" },
  { key: "g", label: "G" },
  { key: "w", label: "W", color: "text-green-600" },
  { key: "l", label: "L", color: "text-red-400" },
  { key: "sv", label: "SV", color: "text-blue-500" },
  { key: "hld", label: "HLD", color: "text-sky-500" },
  { key: "wpct", label: "W%", color: "text-green-500" },
  { key: "ip", label: "IP" },
  { key: "h", label: "H" },
  { key: "hr", label: "HR", color: "text-red-500" },
  { key: "bb", label: "BB" },
  { key: "hbp", label: "HBP" },
  { key: "so", label: "K", color: "text-blue-600" },
  { key: "r", label: "R" },
  { key: "er", label: "ER" },
  { key: "era", label: "ERA", color: "text-orange-500" },
  { key: "whip", label: "WHIP", color: "text-orange-400" },
  { key: "k9", label: "K/9", color: "text-violet-500" },
  { key: "bb9", label: "BB/9", color: "text-violet-400" },
  { key: "kbb", label: "K/BB", color: "text-violet-600" },
];

// 연도·팀 sticky 처리
const STICKY: Record<string, string> = {
  season: "sticky left-0 z-10",
  team: "sticky left-[60px] z-10",
};

function fmtCell(
  key: string,
  row: PitcherStatRaw,
  d: ReturnType<typeof calcPitcherDerived>,
): string {
  switch (key) {
    case "season":
      return String(row.season);
    case "team":
      return String(row.team ?? "-");
    case "g":
      return row.g != null ? String(row.g) : "-";
    case "w":
      return row.w != null ? String(row.w) : "-";
    case "l":
      return row.l != null ? String(row.l) : "-";
    case "sv":
      return row.sv != null ? String(row.sv) : "-";
    case "hld": {
      const v = (row as any).hld;
      return v != null ? String(v) : "-";
    }
    case "wpct": {
      const v = (row as any).wpct;
      return v != null ? Number(v).toFixed(3) : "-";
    }
    case "ip":
      return row.ip != null ? String(row.ip) : "-";
    case "h":
      return row.h != null ? String(row.h) : "-";
    case "hr":
      return row.hr != null ? String(row.hr) : "-";
    case "bb":
      return row.bb != null ? String(row.bb) : "-";
    case "hbp": {
      const v = (row as any).hbp;
      return v != null ? String(v) : "-";
    }
    case "so":
      return row.so != null ? String(row.so) : "-";
    case "r": {
      const v = (row as any).r;
      return v != null ? String(v) : "-";
    }
    case "er": {
      const v = (row as any).er;
      return v != null ? String(v) : "-";
    }
    case "era":
      return fmtEra(row.era);
    case "whip":
      return fmtWhip(row.whip);
    case "k9":
      return d.k9 != null ? d.k9.toFixed(1) : "-";
    case "bb9":
      return d.bb9 != null ? d.bb9.toFixed(1) : "-";
    case "kbb":
      return d.kbb != null ? d.kbb.toFixed(2) : "-";
    default:
      return "-";
  }
}

export default function PitcherSeasonTable({ stats }: PitcherSeasonTableProps) {
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
              const d = calcPitcherDerived(row);
              const isLatest = i === 0;
              const rowBg = isLatest ? "bg-orange-50/40" : "";

              return (
                <tr
                  key={i}
                  className={`border-t border-gray-50 ${rowBg} hover:brightness-95`}
                >
                  {COLUMNS.map((col) => {
                    const isSticky = !!STICKY[col.key];
                    const stickyBg = isLatest ? "bg-orange-50/60" : "bg-white";

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
