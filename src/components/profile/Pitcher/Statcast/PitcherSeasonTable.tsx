// src/components/profile/Pitcher/Statcast/PitcherSeasonTable.tsx
// 색 강조: ERA(orange), W(green), L(red), SV(blue), WHIP(orange) 만 유지 — 나머지 검정
import type { PitcherStatRaw } from "@/utils/StatsCalculator";
import { calcPitcherDerived, fmtEra, fmtWhip } from "@/utils/StatsCalculator";

interface PitcherSeasonTableProps {
  stats: PitcherStatRaw[];
}

// highlight: 히어로 배지(ERA / W-L-S / WHIP)에 포함된 컬럼만 색 강조
const COLUMNS: { key: string; label: string; color?: string }[] = [
  { key: "season", label: "연도" },
  { key: "team", label: "팀" },
  { key: "g", label: "G" },
  { key: "w", label: "W", color: "text-green-600" }, // ✓ 히어로 배지
  { key: "l", label: "L", color: "text-red-500" }, // ✓ 히어로 배지
  { key: "sv", label: "SV", color: "text-blue-500" }, // ✓ 히어로 배지(S)
  { key: "hld", label: "HLD" }, // 색 제거
  { key: "wpct", label: "W%" }, // 색 제거
  { key: "ip", label: "IP" },
  { key: "h", label: "H" },
  { key: "hr", label: "HR" }, // 색 제거
  { key: "bb", label: "BB" },
  { key: "hbp", label: "HBP" },
  { key: "so", label: "K" }, // 색 제거
  { key: "r", label: "R" },
  { key: "er", label: "ER" },
  { key: "era", label: "ERA", color: "text-orange-500" }, // ✓ 히어로 배지
  { key: "whip", label: "WHIP", color: "text-orange-400" }, // ✓ 히어로 배지
  { key: "kPct", label: "K%" }, // 색 제거
  { key: "bbPct", label: "BB%" }, // 색 제거
  { key: "k9", label: "K/9" }, // 색 제거
  { key: "bb9", label: "BB/9" }, // 색 제거
  { key: "kbb", label: "K/BB" }, // 색 제거
  { key: "war", label: "WAR" }, // 색 제거
];

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
    case "hld":
      return (row as any).hld != null ? String((row as any).hld) : "-";
    case "wpct":
      return (row as any).wpct != null
        ? Number((row as any).wpct).toFixed(3)
        : "-";
    case "ip":
      return row.ip != null ? String(row.ip) : "-";
    case "h":
      return row.h != null ? String(row.h) : "-";
    case "hr":
      return row.hr != null ? String(row.hr) : "-";
    case "bb":
      return row.bb != null ? String(row.bb) : "-";
    case "hbp":
      return (row as any).hbp != null ? String((row as any).hbp) : "-";
    case "so":
      return row.so != null ? String(row.so) : "-";
    case "r":
      return (row as any).r != null ? String((row as any).r) : "-";
    case "er":
      return (row as any).er != null ? String((row as any).er) : "-";
    case "era":
      return fmtEra(row.era);
    case "whip":
      return fmtWhip(row.whip);
    case "kPct": {
      const v = (row as any).kPct;
      return v != null ? `${(Number(v) * 100).toFixed(1)}%` : "-";
    }
    case "bbPct": {
      const v = (row as any).bbPct;
      return v != null ? `${(Number(v) * 100).toFixed(1)}%` : "-";
    }
    case "k9":
      return d.k9 != null ? d.k9.toFixed(1) : "-";
    case "bb9":
      return d.bb9 != null ? d.bb9.toFixed(1) : "-";
    case "kbb":
      return d.kbb != null ? d.kbb.toFixed(2) : "-";
    case "war": {
      const v = (row as any).war;
      return v != null ? Number(v).toFixed(2) : "-";
    }
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
                    col.color ?? "text-gray-500",
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
              return (
                <tr
                  key={i}
                  className={`border-t border-gray-50 ${isLatest ? "bg-orange-50/40" : ""} hover:brightness-95`}
                >
                  {COLUMNS.map((col) => {
                    const isSticky = !!STICKY[col.key];
                    const stickyBg = isLatest ? "bg-orange-50/60" : "bg-white";
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
                              ? "text-gray-800" // ← 색 강조 없는 컬럼은 검정
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
