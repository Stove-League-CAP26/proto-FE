// 선수 비교 스탯 패널 — 좌우 나란히 수치 비교, 우위 항목 강조
import { calcHitterDerived } from "@/utils/StatsCalculator";

interface StatRow {
  label: string;
  keyA: string;
  keyB: string;
  higherIsBetter: boolean;
  format?: (v: any) => string;
}

interface CompareStatPanelProps {
  mode: "HvH" | "PvP";
  statsA: any | null; // 최신 시즌 단일 스탯 객체
  statsB: any | null;
  playerNameA: string;
  playerNameB: string;
}

const HITTER_ROWS: StatRow[] = [
  { label: "경기", keyA: "g", keyB: "g", higherIsBetter: true },
  { label: "타석", keyA: "pa", keyB: "pa", higherIsBetter: true },
  { label: "타수", keyA: "ab", keyB: "ab", higherIsBetter: true },
  { label: "안타", keyA: "h", keyB: "h", higherIsBetter: true },
  { label: "2루타", keyA: "b2", keyB: "b2", higherIsBetter: true },
  { label: "홈런", keyA: "hr", keyB: "hr", higherIsBetter: true },
  { label: "타점", keyA: "rbi", keyB: "rbi", higherIsBetter: true },
  { label: "득점", keyA: "r", keyB: "r", higherIsBetter: true },
  {
    label: "타율",
    keyA: "avg",
    keyB: "avg",
    higherIsBetter: true,
    format: (v) => v?.toFixed(3) ?? "-",
  },
  {
    label: "출루율",
    keyA: "obp",
    keyB: "obp",
    higherIsBetter: true,
    format: (v) => v?.toFixed(3) ?? "-",
  },
  {
    label: "장타율",
    keyA: "slg",
    keyB: "slg",
    higherIsBetter: true,
    format: (v) => v?.toFixed(3) ?? "-",
  },
  {
    label: "OPS",
    keyA: "ops",
    keyB: "ops",
    higherIsBetter: true,
    format: (v) => v?.toFixed(3) ?? "-",
  },
];

const PITCHER_ROWS: StatRow[] = [
  { label: "경기", keyA: "g", keyB: "g", higherIsBetter: true },
  { label: "승", keyA: "w", keyB: "w", higherIsBetter: true },
  { label: "패", keyA: "l", keyB: "l", higherIsBetter: false },
  { label: "세이브", keyA: "sv", keyB: "sv", higherIsBetter: true },
  { label: "이닝", keyA: "ip", keyB: "ip", higherIsBetter: true },
  { label: "탈삼진", keyA: "so", keyB: "so", higherIsBetter: true },
  { label: "볼넷", keyA: "bb", keyB: "bb", higherIsBetter: false },
  { label: "피안타", keyA: "h", keyB: "h", higherIsBetter: false },
  { label: "피홈런", keyA: "hr", keyB: "hr", higherIsBetter: false },
  {
    label: "ERA",
    keyA: "era",
    keyB: "era",
    higherIsBetter: false,
    format: (v) => v?.toFixed(2) ?? "-",
  },
  {
    label: "WHIP",
    keyA: "whip",
    keyB: "whip",
    higherIsBetter: false,
    format: (v) => v?.toFixed(2) ?? "-",
  },
];

function getVal(
  stat: any,
  row: StatRow,
  mode: "HvH" | "PvP",
  side: "A" | "B",
): any {
  if (!stat) return null;
  const key = side === "A" ? row.keyA : row.keyB;

  // 타자의 경우 파생 스탯 계산
  if (mode === "HvH" && (key === "obp" || key === "slg" || key === "ops")) {
    const d = calcHitterDerived(stat);
    if (key === "obp") return d.obp;
    if (key === "slg") return d.slg;
    if (key === "ops") return d.ops;
  }

  return stat[key] ?? null;
}

function formatVal(v: any, row: StatRow): string {
  if (v == null) return "-";
  if (row.format) return row.format(v);
  return String(v);
}

function winner(vA: any, vB: any, higherIsBetter: boolean): "A" | "B" | null {
  if (vA == null || vB == null) return null;
  const nA = parseFloat(String(vA));
  const nB = parseFloat(String(vB));
  if (isNaN(nA) || isNaN(nB) || nA === nB) return null;
  if (higherIsBetter) return nA > nB ? "A" : "B";
  else return nA < nB ? "A" : "B";
}

export default function CompareStatPanel({
  mode,
  statsA,
  statsB,
  playerNameA,
  playerNameB,
}: CompareStatPanelProps) {
  const rows = mode === "HvH" ? HITTER_ROWS : PITCHER_ROWS;

  if (!statsA && !statsB) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <p className="text-3xl mb-2">📊</p>
        <p className="text-gray-400 text-sm">
          선수를 선택하면 스탯을 비교합니다
        </p>
      </div>
    );
  }

  // 전체 승리 카운트
  let aWins = 0,
    bWins = 0;
  rows.forEach((row) => {
    const vA = getVal(statsA, row, mode, "A");
    const vB = getVal(statsB, row, mode, "B");
    const w = winner(vA, vB, row.higherIsBetter);
    if (w === "A") aWins++;
    if (w === "B") bWins++;
  });
  const total = aWins + bWins;
  const aPct = total > 0 ? Math.round((aWins / total) * 100) : 50;
  const bPct = 100 - aPct;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 헤더 — 종합 벤치마크 바 */}
      <div className="px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-black text-blue-600 w-10 text-right">
            {aPct}%
          </span>
          <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${aPct}%`,
                background: "linear-gradient(to right, #3B82F6, #60A5FA)",
              }}
            />
          </div>
          <span className="text-xs font-black text-red-500 w-10">{bPct}%</span>
        </div>
        <div className="flex items-center justify-between px-10">
          <span className="text-[11px] font-bold text-blue-500">
            {playerNameA} ({aWins}개)
          </span>
          <span className="text-[11px] text-gray-400">종합 우위</span>
          <span className="text-[11px] font-bold text-red-500">
            ({bWins}개) {playerNameB}
          </span>
        </div>
      </div>

      {/* 스탯 행 */}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2.5 text-xs font-black text-blue-600 text-center w-[38%]">
              {playerNameA || "선수 A"}
            </th>
            <th className="px-4 py-2.5 text-xs font-bold text-gray-400 text-center w-[24%] uppercase tracking-wide">
              항목
            </th>
            <th className="px-4 py-2.5 text-xs font-black text-red-500 text-center w-[38%]">
              {playerNameB || "선수 B"}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const vA = getVal(statsA, row, mode, "A");
            const vB = getVal(statsB, row, mode, "B");
            const w = winner(vA, vB, row.higherIsBetter);
            const strA = formatVal(vA, row);
            const strB = formatVal(vB, row);

            return (
              <tr
                key={row.label}
                className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                {/* 선수 A */}
                <td
                  className={`px-4 py-2.5 text-center font-bold transition-colors ${
                    w === "A" ? "text-blue-600 bg-blue-50/60" : "text-gray-500"
                  }`}
                >
                  {w === "A" && (
                    <span className="mr-1.5 text-blue-400 text-xs">▶</span>
                  )}
                  {strA}
                </td>

                {/* 항목명 */}
                <td className="px-4 py-2.5 text-center text-xs font-black text-gray-400 uppercase tracking-wide">
                  {row.label}
                </td>

                {/* 선수 B */}
                <td
                  className={`px-4 py-2.5 text-center font-bold transition-colors ${
                    w === "B" ? "text-red-500 bg-red-50/60" : "text-gray-500"
                  }`}
                >
                  {strB}
                  {w === "B" && (
                    <span className="ml-1.5 text-red-400 text-xs">◀</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
