// src/components/main/GamePredictionBar.tsx
import { useState } from "react";
import { getProviderColor, type TodayPrediction } from "@/api/predictionApi";

// ── 팀 이미지 맵 ──────────────────────────────────────────────────────────────
const TEAM_NAME_TO_IMAGE: Record<string, string> = {
  LG: "/images/teams/lg.png",
  KT: "/images/teams/kt.png",
  SSG: "/images/teams/ssg.png",
  NC: "/images/teams/nc.png",
  두산: "/images/teams/doosan.png",
  KIA: "/images/teams/kia.png",
  롯데: "/images/teams/lotte.png",
  삼성: "/images/teams/samsung.png",
  한화: "/images/teams/hanwha.png",
  키움: "/images/teams/kiwoom.png",
};

// ── AI 제공자 표시 정보 ──────────────────────────────────────────────────────
const PROVIDER_LABEL: Record<string, string> = {
  openai: "GPT",
  gemini: "Gemini",
  anthropic: "Claude",
};

const PROVIDER_IMAGE: Record<string, string> = {
  openai: "/images/ai/openai.png",
  gemini: "/images/ai/gemini.png",
  anthropic: "/images/ai/anthropic.png",
};

// ── Props ────────────────────────────────────────────────────────────────────
interface GamePredictionBarProps {
  prediction: TodayPrediction | undefined;
  loading: boolean;
}

// ── 컴포넌트 ─────────────────────────────────────────────────────────────────
export default function GamePredictionBar({
  prediction,
  loading,
}: GamePredictionBarProps) {
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);

  // 로딩 스켈레톤
  if (loading) {
    return (
      <div className="mt-1.5 h-16 bg-gray-100 rounded-xl animate-pulse" />
    );
  }

  // 예측 데이터 없음
  if (!prediction || prediction.predictions.length === 0) {
    return (
      <div className="mt-1.5 px-2 py-2 bg-white rounded-xl border border-purple-100 text-center">
        <p className="text-[10px] text-gray-400">🔮 예측 준비 중</p>
      </div>
    );
  }

  return (
    <div className="mt-1.5 bg-white rounded-xl border border-purple-100 overflow-hidden">
      {/* 헤더 */}
      <div className="px-2.5 py-1.5 bg-purple-50 border-b border-purple-100">
        <span className="text-[10px] font-black text-purple-600">
          🤖 AI 예측
        </span>
      </div>

      {/* AI별 예측 목록 */}
      <div className="divide-y divide-gray-50">
        {prediction.predictions.map((pred) => {
          const color = getProviderColor(pred.provider);
          const isExpanded = expandedProvider === pred.provider;
          const label = PROVIDER_LABEL[pred.provider] ?? pred.provider;
          const imgSrc = PROVIDER_IMAGE[pred.provider];
          const winnerImgSrc = TEAM_NAME_TO_IMAGE[pred.winner];

          return (
            <div key={pred.provider}>
              {/* 메인 행: AI 로고 | 이름 | 예측 스코어 | 승리팀 | 적중여부 | 화살표 */}
              <button
                className="w-full px-2.5 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors text-left"
                onClick={() =>
                  setExpandedProvider(isExpanded ? null : pred.provider)
                }
              >
                {/* AI 로고 */}
                <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={label}
                      className="w-4 h-4 object-contain rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-[10px]">🤖</span>
                  )}
                </div>

                {/* AI 이름 */}
                <span
                  className="text-[10px] font-black w-10 flex-shrink-0"
                  style={{ color }}
                >
                  {label}
                </span>

                {/* 예측 스코어 (원정:홈) */}
                <div
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md flex-shrink-0"
                  style={{ background: color + "18" }}
                >
                  <span className="text-[11px] font-black" style={{ color }}>
                    {pred.awayScorePred}
                  </span>
                  <span className="text-[9px] text-gray-300 mx-0.5">:</span>
                  <span className="text-[11px] font-black" style={{ color }}>
                    {pred.homeScorePred}
                  </span>
                </div>

                {/* 예측 승리팀 */}
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  {winnerImgSrc && (
                    <img
                      src={winnerImgSrc}
                      alt={pred.winner}
                      className="w-3.5 h-3.5 object-contain flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <span className="text-[10px] font-bold text-gray-700 truncate">
                    {pred.winner} 승
                  </span>
                </div>

                {/* 적중 여부 (경기 종료 후) */}
                {pred.isCorrect !== null && (
                  <span className="text-[11px] flex-shrink-0">
                    {pred.isCorrect ? "✅" : "❌"}
                  </span>
                )}

                {/* 펼치기 화살표 */}
                <span
                  className="text-[10px] text-gray-400 flex-shrink-0 transition-transform duration-200"
                  style={{
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    display: "inline-block",
                  }}
                >
                  ▾
                </span>
              </button>

              {/* 예측 근거 (클릭 시 펼침) */}
              {isExpanded && (
                <div
                  className="px-3 py-2 text-[11px] text-gray-600 leading-relaxed border-t"
                  style={{
                    borderColor: color + "20",
                    background: color + "06",
                  }}
                >
                  {pred.reason ?? "예측 근거가 없습니다."}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
