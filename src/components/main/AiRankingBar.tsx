// src/components/main/AiRankingBar.tsx
import { useState, useEffect } from "react";
import {
  fetchAiRanking,
  getProviderColor,
  type AiRankingItem,
} from "@/api/predictionApi";
import gptImg from "@/assets/gpt.png";
import geminiImg from "@/assets/gemini.png";
import claudeImg from "@/assets/claude.png";

const PROVIDER_IMAGE: Record<string, string> = {
  openai: gptImg,
  gemini: geminiImg,
  anthropic: claudeImg,
};

const PROVIDER_LABEL: Record<string, string> = {
  openai: "GPT-4o",
  gemini: "Gemini",
  anthropic: "Claude",
};

function isCrown(item: AiRankingItem, ranking: AiRankingItem[]): boolean {
  if (ranking.every((r) => r.totalCount === 0)) return false;
  const maxRate = Math.max(...ranking.map((r) => r.winRate));
  return item.winRate === maxRate && maxRate > 0;
}

export default function AiRankingBar() {
  const [ranking, setRanking] = useState<AiRankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAiRanking()
      .then(setRanking)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (ranking.length === 0) return null;

  return (
    <div className="mt-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-black text-gray-500">
          🏆 AI 전체 적중률
        </span>
      </div>

      {/* AI 3개 카드 */}
      <div className="grid grid-cols-3 gap-3">
        {ranking.map((item) => {
          const color = getProviderColor(item.provider);
          const crown = isCrown(item, ranking);
          const imgSrc = PROVIDER_IMAGE[item.provider];
          const label = PROVIDER_LABEL[item.provider] ?? item.providerLabel;
          const winRatePct =
            item.totalCount > 0 ? (item.winRate * 100).toFixed(1) : null;

          // 최근 5경기 결과
          const recentResults = item.recentResults ?? [];

          return (
            <div
              key={item.provider}
              className="bg-white rounded-2xl border shadow-sm px-4 py-3 flex items-center gap-3"
              style={{ borderColor: color + "30" }}
            >
              {/* AI 로고 */}
              <div className="relative flex-shrink-0">
                {crown && (
                  <span className="absolute -top-2 -left-1 text-sm leading-none">
                    👑
                  </span>
                )}
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={label}
                    className="w-9 h-9 object-contain rounded-xl"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: color + "18" }}
                  >
                    🤖
                  </div>
                )}
              </div>

              {/* 이름 + 적중률 */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-gray-700">{label}</p>
                <p
                  className="text-lg font-black leading-tight"
                  style={{ color }}
                >
                  {winRatePct ? `${winRatePct}%` : "-"}
                </p>
                <p className="text-[10px] text-gray-400">
                  {item.correctCount}/{item.totalCount}
                </p>
              </div>

              {/* 최근 5경기 아이콘 */}
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                <span className="text-[9px] text-gray-400 mb-0.5">최근</span>
                <div className="flex items-center gap-0.5">
                  {recentResults.length === 0 ? (
                    <span className="text-[10px] text-gray-300">-</span>
                  ) : (
                    recentResults.map((r, i) => (
                      <span key={i} className="text-xs leading-none">
                        {r.isCorrect === true
                          ? "✅"
                          : r.isCorrect === false
                            ? "❌"
                            : "⏳"}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
