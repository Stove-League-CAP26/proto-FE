// src/components/profile/NaverSeasonStatsSection.tsx
// 네이버 API 기반 시즌별 스탯 테이블 (2024/2025/2026 + 통산)
import { useState, useEffect } from "react";
import { fetchPlayerStats } from "@/api/playerStatsApi";
import type { SeasonStatRow } from "@/api/playerStatsApi";

interface Props {
  pid: number;
  playerType: "hitter" | "pitcher";
  accentColor?: string;
}

// 타자 주요 컬럼 표시 순서
const HITTER_COLS = [
  "타율",
  "경기수",
  "타수",
  "안타",
  "2루타",
  "홈런",
  "타점",
  "득점",
  "도루",
  "볼넷",
  "삼진",
  "출루율",
  "장타율",
  "OPS",
  "WAR",
];
const PITCHER_COLS = [
  "평균자책",
  "경기수",
  "이닝",
  "승",
  "패",
  "세이브",
  "홀드",
  "탈삼진",
  "피안타",
  "피홈런",
  "볼넷",
  "승률",
  "WHIP",
  "K/9",
  "WAR",
];

export default function NaverSeasonStatsSection({
  pid,
  playerType,
  accentColor = "#3B82F6",
}: Props) {
  const [rows, setRows] = useState<SeasonStatRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetchPlayerStats(pid, playerType)
      .then((data) => {
        setHeaders(data.headers);
        setRows(data.stats);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [pid, playerType]);

  const DISPLAY_COLS = playerType === "pitcher" ? PITCHER_COLS : HITTER_COLS;
  // 실제 headers 중 표시할 컬럼만 필터 (순서 유지)
  const visibleCols = DISPLAY_COLS.filter((c) => headers.includes(c));

  if (loading)
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-4" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );

  if (error || rows.length === 0)
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center py-10">
        <p className="text-sm text-gray-300">시즌 스탯 데이터가 없습니다</p>
      </div>
    );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
        <span
          className="w-1.5 h-5 rounded-full"
          style={{ background: accentColor }}
        />
        <h3 className="font-bold text-gray-800 text-sm">시즌 기록</h3>
        <span className="ml-auto text-[10px] text-gray-400">
          네이버 스포츠 기준
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-center">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-3 py-2.5 text-left font-bold text-gray-500 sticky left-0 bg-gray-50 min-w-[52px]">
                시즌
              </th>
              {visibleCols.map((col) => (
                <th
                  key={col}
                  className={`px-2.5 py-2.5 font-bold whitespace-nowrap ${
                    col === "타율" ||
                    col === "OPS" ||
                    col === "평균자책" ||
                    col === "WAR"
                      ? "text-gray-700"
                      : "text-gray-400"
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isTotal = row.isTotal;
              const isCurrent = row.season === "2026";
              return (
                <tr
                  key={i}
                  className={`border-t border-gray-50 ${
                    isTotal
                      ? "bg-gray-50 font-bold"
                      : isCurrent
                        ? "bg-blue-50/40"
                        : "hover:bg-gray-50/50"
                  }`}
                >
                  <td
                    className={`px-3 py-2.5 text-left sticky left-0 font-bold ${
                      isTotal
                        ? "bg-gray-50 text-gray-600"
                        : isCurrent
                          ? "bg-blue-50/40 text-blue-600"
                          : "bg-white text-gray-500"
                    }`}
                  >
                    {row.season}
                    {isCurrent && (
                      <span className="ml-1 text-[8px] bg-blue-500 text-white px-1 py-0.5 rounded">
                        현재
                      </span>
                    )}
                  </td>
                  {visibleCols.map((col) => {
                    const val = row[col] as string;
                    const isKey =
                      col === "타율" ||
                      col === "OPS" ||
                      col === "평균자책" ||
                      col === "WAR";
                    return (
                      <td
                        key={col}
                        className={`px-2.5 py-2.5 ${isKey ? "font-black text-gray-800" : "text-gray-500"}`}
                      >
                        {val ?? "-"}
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
