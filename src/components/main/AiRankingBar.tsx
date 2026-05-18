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

const RANK_COLORS = ["#F59E0B", "#9CA3AF", "#CD7F32"];

// ── 공통 데이터 훅 ────────────────────────────────────────────────────────────
function useAiRanking() {
  const [ranking, setRanking] = useState<AiRankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAiRanking()
      .then(setRanking)
      .finally(() => setLoading(false));
  }, []);

  return { ranking, loading };
}

// ── 헤더용 소형 카드 (compact) ────────────────────────────────────────────────
export function AiRankingCompact() {
  const { ranking, loading } = useAiRanking();

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-[230px] h-[68px] bg-purple-100/50 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (ranking.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {ranking.map((item, idx) => {
        const color = getProviderColor(item.provider);
        const imgSrc = PROVIDER_IMAGE[item.provider];
        const label = PROVIDER_LABEL[item.provider] ?? item.providerLabel;
        const winRatePct =
          item.totalCount > 0 ? (item.winRate * 100).toFixed(1) : null;

        const recentResults = item.recentResults ?? [];
        const recentCorrect = recentResults.filter(
          (r) => r.isCorrect === true,
        ).length;
        const recentTotal = recentResults.filter(
          (r) => r.isCorrect !== null,
        ).length;
        const recentRatePct =
          recentTotal > 0
            ? ((recentCorrect / recentTotal) * 100).toFixed(0)
            : null;

        const rankColor = RANK_COLORS[idx] ?? "#9CA3AF";

        return (
          <div
            key={item.provider}
            className="bg-white/90 rounded-xl border overflow-hidden flex-shrink-0"
            style={{ borderColor: color + "40", width: 230 }}
          >
            {/* 상단: 순위 + AI이미지 + 이름 */}
            <div
              className="px-3 pt-2 pb-1.5 flex items-center gap-1.5"
              style={{ borderBottom: `1px solid ${color}20` }}
            >
              <span
                className="text-xs font-black w-3.5 text-center leading-none flex-shrink-0"
                style={{ color: rankColor }}
              >
                {idx + 1}
              </span>
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={label}
                  className="w-5 h-5 object-contain rounded flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span className="text-sm flex-shrink-0">🤖</span>
              )}
              <span className="text-xs font-black truncate" style={{ color }}>
                {label}
              </span>
            </div>

            {/* 중간: 전체 적중률 */}
            <div className="px-3 pt-1.5 flex items-center justify-between gap-1">
              <span className="text-[10px] text-gray-400 font-medium flex-shrink-0"></span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-400">
                  [전체 적중률] {item.correctCount}/{item.totalCount}
                </span>
                <span className="text-xs font-black" style={{ color }}>
                  {winRatePct ? `${winRatePct}%` : "-"}
                </span>
              </div>
            </div>

            {/* 하단: 최근 아이콘 + 최근 적중률 */}
            <div className="px-3 pb-2 flex items-center justify-between gap-1">
              <div className="flex items-center gap-px flex-shrink-0">
                {recentResults.length === 0 ? (
                  <span className="text-[10px] text-gray-300">-</span>
                ) : (
                  recentResults.slice(0, 5).map((r, i) => (
                    <span key={i} className="text-[10px] leading-none">
                      {r.isCorrect === true
                        ? "✅"
                        : r.isCorrect === false
                          ? "❌"
                          : "⏳"}
                    </span>
                  ))
                )}
              </div>
              <div className="flex items-center gap-1">
                {recentTotal > 0 && (
                  <span className="text-[10px] text-gray-400">
                    [최근 적중률] {recentCorrect}/{recentTotal}
                  </span>
                )}
                <span
                  className="text-xs font-black"
                  style={{ color: recentRatePct ? color : "#9ca3af" }}
                >
                  {recentRatePct ? `${recentRatePct}%` : "-"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 독립형 전체 카드 (기본 export) ────────────────────────────────────────────
export default function AiRankingBar() {
  const { ranking, loading } = useAiRanking();

  if (loading) {
    return (
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (ranking.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-black text-gray-500">
          🏆 AI 전체 적중률
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {ranking.map((item, idx) => {
          const color = getProviderColor(item.provider);
          const imgSrc = PROVIDER_IMAGE[item.provider];
          const label = PROVIDER_LABEL[item.provider] ?? item.providerLabel;
          const winRatePct =
            item.totalCount > 0 ? (item.winRate * 100).toFixed(1) : null;

          const recentResults = item.recentResults ?? [];
          const recentCorrect = recentResults.filter(
            (r) => r.isCorrect === true,
          ).length;
          const recentTotal = recentResults.filter(
            (r) => r.isCorrect !== null,
          ).length;
          const recentRatePct =
            recentTotal > 0
              ? ((recentCorrect / recentTotal) * 100).toFixed(0)
              : null;

          const rankColor = RANK_COLORS[idx] ?? "#9CA3AF";

          return (
            <div
              key={item.provider}
              className="bg-white rounded-2xl border shadow-sm overflow-hidden"
              style={{ borderColor: color + "30" }}
            >
              {/* 상단: 순위 + AI 로고 + 이름 | 전체 적중률 */}
              <div
                className="px-3 pt-3 pb-2 flex items-center justify-between"
                style={{ borderBottom: `1px solid ${color}18` }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-black w-4 text-center flex-shrink-0"
                    style={{ color: rankColor }}
                  >
                    {idx + 1}
                  </span>
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={label}
                      className="w-7 h-7 object-contain rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-base"
                      style={{ background: color + "18" }}
                    >
                      🤖
                    </div>
                  )}
                  <span className="text-xs font-black text-gray-700">
                    {label}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-gray-400 font-medium">
                    전체 적중률
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[10px] text-gray-400">
                      {item.correctCount}/{item.totalCount}
                    </span>
                    <span
                      className="text-sm font-black leading-none"
                      style={{ color }}
                    >
                      {winRatePct ? `${winRatePct}%` : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 하단: 최근 결과 아이콘 | 최근 5경기 적중률 */}
              <div className="px-3 py-2 flex items-center justify-between">
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

                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-gray-400 font-medium">
                    최근 5경기
                  </span>
                  <div className="flex items-baseline gap-1">
                    {recentTotal > 0 && (
                      <span className="text-[10px] text-gray-400">
                        {recentCorrect}/{recentTotal}
                      </span>
                    )}
                    <span
                      className="text-xs font-black"
                      style={{ color: recentRatePct ? color : "#9ca3af" }}
                    >
                      {recentRatePct ? `${recentRatePct}%` : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
