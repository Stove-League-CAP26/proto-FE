// src/components/profile/Hitter/Statcast/HitterStatcastTab.tsx
import { useState, useEffect } from "react";
import type { HitterCombinedStat } from "@/utils/StatsCalculator";
import HitterSeasonTable from "@/components/profile/Hitter/Statcast/HitterSeasonTable";
import HitDirectionChart from "@/components/profile/Hitter/Statcast/HitDirectionChart";
import { fetchPlayerAiAnalysis, type PlayerAiAnalysis } from "@/api/playerApi";

interface HitterStatcastTabProps {
  pid: number;
  stats: HitterCombinedStat[];
  hitDistrib?: { LF: string; CF: string; RF: string };
}

function AiAnalysisBox({ pid }: { pid: number }) {
  const [analysis, setAnalysis] = useState<PlayerAiAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPlayerAiAnalysis(pid, "hitter")
      .then(setAnalysis)
      .finally(() => setLoading(false));
  }, [pid]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* 헤더 — PitchArsenalCard 구조와 동일 */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
        <div className="w-1 h-5 rounded-full bg-blue-500" />
        <h3 className="font-bold text-gray-800 text-sm">AI 분석</h3>
        {loading && (
          <div className="ml-auto w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        )}
      </div>

      <div className="px-5 py-4">
        {/* 로딩 스켈레톤 */}
        {loading && (
          <div className="flex flex-col gap-3 animate-pulse">
            <div className="h-3 bg-gray-100 rounded w-1/4" />
            <div className="h-2 bg-gray-100 rounded w-full" />
            <div className="h-2 bg-gray-100 rounded w-5/6" />
            <div className="h-2 bg-gray-100 rounded w-4/6" />
            <div className="h-px bg-gray-100 my-1" />
            <div className="h-2 bg-gray-100 rounded w-3/4" />
            <div className="h-2 bg-gray-100 rounded w-2/3" />
          </div>
        )}

        {/* 데이터 없음 */}
        {!loading && !analysis && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <p className="text-xs text-gray-400">
              아직 분석 데이터가 없습니다.
            </p>
            <p className="text-[10px] text-gray-300">
              시즌 데이터 업데이트 후 제공됩니다.
            </p>
          </div>
        )}

        {/* 실제 분석 */}
        {!loading && analysis && (
          <div className="space-y-3">
            {/* 선수 유형 뱃지 */}
            <span className="inline-block text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
              {analysis.analysisJson.player_type_label}
            </span>

            {/* 요약 */}
            <p className="text-xs text-gray-600 leading-relaxed">
              {analysis.analysisJson.summary}
            </p>

            {/* 강점 */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                강점
              </p>
              {analysis.analysisJson.strengths.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1" />
                  <p className="text-xs text-gray-600">{item}</p>
                </div>
              ))}
            </div>

            {/* 약점 */}
            {analysis.analysisJson.weakness && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  약점
                </p>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0 mt-1" />
                  <p className="text-xs text-gray-600">
                    {analysis.analysisJson.weakness}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 푸터 — 분석 기준 시즌 */}
      {!loading && analysis && (
        <div className="px-5 py-3 border-t border-gray-50">
          <p className="text-[10px] text-gray-300">
            {analysis.mainSeason}시즌 기준 · {analysis.model}
          </p>
        </div>
      )}
    </div>
  );
}

export default function HitterStatcastTab({
  pid,
  stats,
  hitDistrib,
}: HitterStatcastTabProps) {
  return (
    <div className="space-y-6">
      <HitterSeasonTable stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hitDistrib && <HitDirectionChart hitDistrib={hitDistrib} />}
        <AiAnalysisBox pid={pid} />
      </div>
    </div>
  );
}
