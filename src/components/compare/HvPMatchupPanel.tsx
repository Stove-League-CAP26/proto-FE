// src/components/compare/HvP/HvPMatchupPanel.tsx
// 네이버 스포츠 크롤링 구조 기준
// 시즌별 행 (최대 3시즌), 4사구/병살 컬럼, 이모지 없음
import { useState } from "react";
import type { HvPSeasonRecord, HvPInsight } from "@/mock/hvpData";

interface HvPMatchupPanelProps {
  seasonRecords: HvPSeasonRecord[] | null;
  careerSummary: {
    pa: number;
    ab: number;
    h: number;
    hr: number;
    rbi: number;
    so: number;
    bb4: number;
    gdp: number;
    avg: string;
    obp: string;
    slg: string;
    ops: string;
    lastUpdated: string;
  } | null;
  insights: HvPInsight[];
  pitcherName: string;
  hitterName: string;
  loading?: boolean;
}

// 네이버 스포츠 컬럼 순서와 동일
const COLS = [
  { key: "pa", label: "타석", desc: "타석수" },
  { key: "ab", label: "타수", desc: "타수" },
  { key: "h", label: "안타", desc: "안타" },
  { key: "b2", label: "2루타", desc: "2루타" },
  { key: "b3", label: "3루타", desc: "3루타" },
  { key: "hr", label: "홈런", desc: "홈런", hi: true },
  { key: "rbi", label: "타점", desc: "타점" },
  { key: "bb4", label: "4사구", desc: "볼넷+사구" },
  { key: "so", label: "삼진", desc: "삼진", hi: true },
  { key: "gdp", label: "병살", desc: "병살타" },
  { key: "avg", label: "타율", desc: "타율", hi: true },
  { key: "obp", label: "출루율", desc: "출루율", hi: true },
  { key: "slg", label: "장타율", desc: "장타율", hi: true },
  { key: "ops", label: "OPS", desc: "OPS", hi: true },
];

const INSIGHT_STYLE = {
  danger: {
    color: "#EF4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.18)",
    label: "위험 구역",
  },
  advantage: {
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.18)",
    label: "공략 포인트",
  },
  neutral: {
    color: "#6B7280",
    bg: "rgba(107,114,128,0.08)",
    border: "rgba(107,114,128,0.18)",
    label: "전반 분석",
  },
  trend: {
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.18)",
    label: "최근 트렌드",
  },
};

export default function HvPMatchupPanel({
  seasonRecords,
  careerSummary,
  insights,
  pitcherName,
  hitterName,
  loading = false,
}: HvPMatchupPanelProps) {
  const [showInsights, setShowInsights] = useState(false);
  const [revealed, setRevealed] = useState(0);

  const handleReveal = () => {
    if (showInsights) return;
    setShowInsights(true);
    let c = 0;
    const t = setInterval(() => {
      c++;
      setRevealed(c);
      if (c >= insights.length) clearInterval(t);
    }, 500);
  };

  if (loading) {
    return (
      <div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8
                      flex items-center justify-center"
      >
        <div className="text-center">
          <div
            className="w-7 h-7 border-2 border-gray-200 border-t-blue-400
                          rounded-full animate-spin mx-auto mb-2"
          />
          <p className="text-xs text-gray-400">상대전적 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!seasonRecords || seasonRecords.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <p className="text-sm text-gray-400">상대전적 데이터가 없습니다</p>
        <p className="text-xs text-gray-300 mt-1">
          선수를 선택하면 자동으로 불러옵니다
        </p>
      </div>
    );
  }

  // 통산 OPS 기준 상성 판단
  const opsNum = careerSummary ? parseFloat(careerSummary.ops) : 0;
  const matchup =
    opsNum >= 0.9
      ? { label: "타자 우세", color: "#3B82F6" }
      : opsNum <= 0.65
        ? { label: "투수 우세", color: "#CC4444" }
        : { label: "균형", color: "#6B7280" };

  // 최근 시즌 (첫 번째 행)
  const latest = seasonRecords[0];

  return (
    <div className="space-y-4">
      {/* ── 상대전적 카드 ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* 헤더 */}
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-1.5 h-6 rounded-full inline-block bg-purple-500" />
            <h3 className="font-bold text-gray-800">상대 전적</h3>
            {careerSummary && (
              <span
                className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full
                               border border-gray-100 whitespace-nowrap"
              >
                {careerSummary.lastUpdated} 최종
              </span>
            )}
            <span
              className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5
                             rounded-full border border-amber-100 whitespace-nowrap"
            >
              Mock 데이터
            </span>
          </div>
          <div
            className="px-3 py-1.5 rounded-full text-xs font-black text-white whitespace-nowrap"
            style={{ background: matchup.color }}
          >
            {matchup.label}
          </div>
        </div>

        {/* 대결 제목 */}
        <div
          className="px-5 py-2.5 flex items-center justify-center gap-3"
          style={{ background: "linear-gradient(135deg, #f8fafc, #eff6ff)" }}
        >
          <span className="font-black text-red-500 text-sm">
            {pitcherName || "투수"}
          </span>
          <span className="text-gray-300 font-bold text-xs">vs</span>
          <span className="font-black text-blue-600 text-sm">
            {hitterName || "타자"}
          </span>
          {careerSummary && (
            <span className="text-xs text-gray-400 ml-1">
              통산 {careerSummary.pa}타석
            </span>
          )}
        </div>

        {/* 시즌별 기록 테이블 — 네이버 스포츠 구조와 동일 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {/* 시즌 컬럼 고정 */}
                <th
                  className="px-3 py-2.5 text-center text-xs font-black text-gray-500
                               sticky left-0 bg-gray-50 whitespace-nowrap border-r border-gray-100"
                >
                  시즌
                </th>
                {COLS.map((col) => (
                  <th
                    key={col.key}
                    className="px-3 py-2.5 text-center text-xs font-black uppercase
                               tracking-wide whitespace-nowrap"
                    style={{ color: col.hi ? "#6D28D9" : "#9CA3AF" }}
                    title={col.desc}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {seasonRecords.map((row, i) => {
                const isLatest = i === 0;
                return (
                  <tr
                    key={row.season}
                    className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors"
                    style={{ background: isLatest ? "#f0f9ff" : undefined }}
                  >
                    {/* 시즌 레이블 */}
                    <td
                      className="px-3 py-3 text-center whitespace-nowrap font-black text-gray-700
                                 sticky left-0 border-r border-gray-100"
                      style={{ background: isLatest ? "#f0f9ff" : "white" }}
                    >
                      {row.season}
                      {isLatest && (
                        <span className="ml-1 text-[8px] font-black text-blue-400 align-middle">
                          최근
                        </span>
                      )}
                    </td>
                    {COLS.map((col) => {
                      const val = row[col.key as keyof HvPSeasonRecord];
                      return (
                        <td
                          key={col.key}
                          className="px-3 py-3 text-center whitespace-nowrap font-bold"
                          style={{ color: col.hi ? "#4C1D95" : "#374151" }}
                        >
                          {String(val)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* 통산 합산 행 */}
              {careerSummary && (
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td
                    className="px-3 py-3 text-center font-black text-gray-500 text-xs
                                 sticky left-0 bg-gray-50 border-r border-gray-100 whitespace-nowrap"
                  >
                    통산
                  </td>
                  {COLS.map((col) => {
                    const keyMap: Record<string, string> = {
                      pa: "pa",
                      ab: "ab",
                      h: "h",
                      b2: "-",
                      b3: "-",
                      hr: "hr",
                      rbi: "rbi",
                      bb4: "bb4",
                      so: "so",
                      gdp: "gdp",
                      avg: "avg",
                      obp: "obp",
                      slg: "slg",
                      ops: "ops",
                    };
                    const mappedKey = keyMap[col.key];
                    const val =
                      mappedKey === "-"
                        ? "-"
                        : (careerSummary[
                            mappedKey as keyof typeof careerSummary
                          ] ?? "-");
                    return (
                      <td
                        key={col.key}
                        className="px-3 py-3 text-center whitespace-nowrap font-black text-xs"
                        style={{ color: col.hi ? "#6D28D9" : "#6B7280" }}
                      >
                        {String(val)}
                      </td>
                    );
                  })}
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 출처 안내 */}
        <div className="px-5 py-2 border-t border-gray-50">
          <p className="text-[9px] text-gray-300">
            출처: 네이버 스포츠 VS 성적 (최대 최근 3시즌) · 실제 크롤링 연동 전
            Mock 데이터
          </p>
        </div>

        {/* 최근 시즌 요약 수치 */}
        {careerSummary && (
          <div className="px-5 py-4 border-t border-gray-50 grid grid-cols-3 gap-3">
            {[
              {
                label: "통산 타율",
                val: careerSummary.avg,
                sub: `${careerSummary.h}안타 / ${careerSummary.ab}타수`,
                color:
                  parseFloat(careerSummary.avg) >= 0.35
                    ? "#3B82F6"
                    : parseFloat(careerSummary.avg) <= 0.22
                      ? "#CC4444"
                      : "#6B7280",
              },
              {
                label: "통산 OPS",
                val: careerSummary.ops,
                sub: `출루 ${careerSummary.obp} + 장타 ${careerSummary.slg}`,
                color:
                  parseFloat(careerSummary.ops) >= 0.9 ? "#3B82F6" : "#6B7280",
              },
              {
                label: "삼진율",
                val: `${Math.round((careerSummary.so / careerSummary.pa) * 100)}%`,
                sub: `${careerSummary.so}K / ${careerSummary.pa}타석`,
                color:
                  careerSummary.so / careerSummary.pa >= 0.3
                    ? "#CC4444"
                    : "#10B981",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="text-center rounded-xl p-3 bg-gray-50"
              >
                <p className="text-xs text-gray-400 font-medium">
                  {item.label}
                </p>
                <p
                  className="text-xl font-black mt-0.5"
                  style={{ color: item.color }}
                >
                  {item.val}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 매치업 인사이트 ── */}
      <div
        className="rounded-2xl overflow-hidden border border-gray-200"
        style={{ background: "#0f0f1a" }}
      >
        <button
          onClick={handleReveal}
          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                       text-xs font-black text-white"
            style={{ background: "#7C3AED" }}
          >
            AI
          </div>
          <div className="flex-1 text-left">
            <p className="text-white font-bold text-sm">매치업 인사이트 분석</p>
            <p className="text-white/40 text-xs">
              핫존 x 투구분포 교차 분석 기반 공략 포인트
            </p>
          </div>
          {showInsights ? (
            <span className="text-green-400 text-xs font-bold">분석 완료</span>
          ) : (
            <span className="text-purple-400 text-xs">실행</span>
          )}
        </button>

        {showInsights && (
          <div className="px-5 pb-5 space-y-2.5 border-t border-white/10">
            {insights.slice(0, revealed).map((ins, i) => {
              const s = INSIGHT_STYLE[ins.type];
              return (
                <div
                  key={i}
                  className="flex gap-3 pt-3"
                  style={{ animation: "fadeInUp 0.4s ease-out" }}
                >
                  <div
                    className="w-1 rounded-full flex-shrink-0 mt-1 self-stretch"
                    style={{ background: s.color, minHeight: 36 }}
                  />
                  <div
                    className="flex-1 rounded-xl px-3 py-2.5"
                    style={{
                      background: s.bg,
                      border: `1px solid ${s.border}`,
                    }}
                  >
                    <div className="mb-1">
                      <span
                        className="text-[10px] font-black uppercase"
                        style={{ color: s.color }}
                      >
                        {s.label}
                      </span>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">
                      {ins.text}
                    </p>
                  </div>
                </div>
              );
            })}
            {revealed < insights.length && (
              <div className="flex gap-1 pt-2 pl-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
