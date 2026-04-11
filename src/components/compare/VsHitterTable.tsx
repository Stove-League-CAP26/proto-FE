// src/components/compare/VsHitterTable.tsx
// HvP 모드 — 투수 vs 타자 DB 상대전적 테이블

import { useEffect, useState } from "react";
import { fetchVsRecord } from "@/api/playerApi";
import type { VsHitterRecord } from "@/api/playerApi";

interface Props {
  pitcherPid: number;
  batterPid: number;
  pitcherName: string;
  batterName: string;
}

const COLS: {
  key: keyof VsHitterRecord;
  label: string;
  decimal?: number;
  highlight?: boolean;
}[] = [
  { key: "season", label: "시즌" },
  { key: "pa", label: "타석" },
  { key: "ab", label: "타수" },
  { key: "hit", label: "안타" },
  { key: "h2", label: "2루타" },
  { key: "h3", label: "3루타" },
  { key: "hr", label: "홈런", highlight: true },
  { key: "rbi", label: "타점" },
  { key: "bb", label: "4사구" },
  { key: "so", label: "삼진", highlight: true },
  { key: "gdp", label: "병살" },
  { key: "avg", label: "타율", decimal: 3, highlight: true },
  { key: "obp", label: "출루율", decimal: 3 },
  { key: "slg", label: "장타율", decimal: 3 },
  { key: "ops", label: "OPS", decimal: 3, highlight: true },
];

export default function VsHitterTable({
  pitcherPid,
  batterPid,
  pitcherName,
  batterName,
}: Props) {
  const [data, setData] = useState<VsHitterRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pitcherPid || !batterPid) {
      setData([]);
      return;
    }
    setLoading(true);
    setData([]);
    fetchVsRecord(pitcherPid, batterPid)
      .then(setData)
      .finally(() => setLoading(false));
  }, [pitcherPid, batterPid]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2 flex-wrap">
        <div className="w-1 h-5 rounded-full bg-purple-500" />
        <h3 className="font-bold text-gray-800 text-sm">상대전적</h3>
        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100">
          ⚾ {pitcherName}
        </span>
        <span className="text-xs text-gray-400">vs</span>
        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 border border-blue-100">
          🏏 {batterName}
        </span>
        <span className="ml-auto text-xs text-gray-400">최근 3시즌</span>
      </div>

      {/* 본문 */}
      {loading ? (
        <div className="py-12 text-center text-sm text-gray-400 animate-pulse">
          상대전적 불러오는 중...
        </div>
      ) : data.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-300">
          상대전적 데이터 없음
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-max">
            <thead>
              <tr className="bg-gray-50">
                {COLS.map((c) => (
                  <th
                    key={String(c.key)}
                    className={`px-3 py-2.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap text-center border-b border-gray-100
                      ${c.highlight ? "text-purple-500" : "text-gray-400"}`}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr
                  key={row.season}
                  className={`border-t border-gray-50 hover:brightness-95
                    ${i === 0 ? "bg-purple-50/40" : ""}`}
                >
                  {COLS.map((c) => {
                    const raw = row[c.key] as number;
                    const val =
                      c.decimal !== undefined
                        ? Number(raw).toFixed(c.decimal)
                        : String(raw ?? "-");
                    return (
                      <td
                        key={String(c.key)}
                        className={`px-3 py-3 text-center whitespace-nowrap
                          ${c.key === "season" ? "font-bold text-gray-800" : ""}
                          ${c.highlight ? "font-bold text-purple-600" : "text-gray-600"}`}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
