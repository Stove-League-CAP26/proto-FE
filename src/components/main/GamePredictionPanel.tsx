// src/components/main/GamePredictionPanel.tsx
import { getProviderColor, type TodayPrediction } from "@/api/predictionApi";
import gptImg from "@/assets/gpt.png";
import geminiImg from "@/assets/gemini.png";
import claudeImg from "@/assets/claude.png";
import { AiRankingCompact } from "./AiRankingBar";

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

const PROVIDER_LABEL: Record<string, string> = {
  openai: "GPT-4o",
  gemini: "Gemini",
  anthropic: "Claude",
};

const PROVIDER_IMAGE: Record<string, string> = {
  openai: gptImg,
  gemini: geminiImg,
  anthropic: claudeImg,
};

function formatGameDateLabel(dateStr: string): string {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const d = new Date(dateStr);
  return `KBO 2026 시즌 · ${d.getMonth() + 1}/${d.getDate()}(${days[d.getDay()]})`;
}

interface GamePredictionPanelProps {
  prediction: TodayPrediction | undefined;
  loading: boolean;
  homeTeamName: string;
  awayTeamName: string;
  gameDate?: string;
}

// ── AI 한 행 ─────────────────────────────────────────────────────────────────
function PredictionRow({
  pred,
  awayTeamName,
  homeTeamName,
}: {
  pred: TodayPrediction["predictions"][number];
  awayTeamName: string;
  homeTeamName: string;
}) {
  const color = getProviderColor(pred.provider);
  const label = PROVIDER_LABEL[pred.provider] ?? pred.provider;
  const imgSrc = PROVIDER_IMAGE[pred.provider];
  const winnerImg = TEAM_NAME_TO_IMAGE[pred.winner];

  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{ borderColor: color + "30" }}
    >
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ background: color + "08" }}
      >
        <div className="flex items-center gap-2 w-28 flex-shrink-0">
          <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
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
              <span className="text-lg">🤖</span>
            )}
          </div>
          <span className="text-sm font-black" style={{ color }}>
            {label}
          </span>
        </div>

        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl flex-shrink-0"
          style={{ background: color + "18" }}
        >
          <span className="text-sm font-black" style={{ color }}>
            {pred.awayScorePred}
          </span>
          <span className="text-xs text-gray-300">:</span>
          <span className="text-sm font-black" style={{ color }}>
            {pred.homeScorePred}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {winnerImg && (
            <img
              src={winnerImg}
              alt={pred.winner}
              className="w-5 h-5 object-contain flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <span className="text-sm font-bold text-gray-700">
            {pred.winner} 승
          </span>
        </div>

        <div className="flex items-center gap-2 w-40 flex-shrink-0">
          <span className="text-xs text-gray-500 w-8 text-right flex-shrink-0">
            {awayTeamName.slice(0, 2)}
          </span>
          <div className="flex items-center gap-1 flex-1">
            <span className="text-xs font-bold text-gray-500 w-7 text-right flex-shrink-0">
              {pred.awayWinProb}%
            </span>
            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pred.homeWinProb}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            <span
              className="text-xs font-bold flex-shrink-0 w-7"
              style={{ color }}
            >
              {pred.homeWinProb}%
            </span>
          </div>
          <span className="text-xs text-gray-500 w-8 flex-shrink-0">
            {homeTeamName.slice(0, 2)}
          </span>
        </div>

        {pred.isCorrect !== null && (
          <span className="text-base flex-shrink-0">
            {pred.isCorrect ? "✅" : "❌"}
          </span>
        )}
      </div>

      <div
        className="px-4 py-2.5 border-t"
        style={{ borderColor: color + "20" }}
      >
        <span className="text-[11px] font-bold mr-2" style={{ color }}>
          예측 근거
        </span>
        <span className="text-xs text-gray-600 leading-relaxed">
          {pred.reason ?? "예측 근거가 없습니다."}
        </span>
      </div>
    </div>
  );
}

// ── 메인 패널 ────────────────────────────────────────────────────────────────
export default function GamePredictionPanel({
  prediction,
  loading,
  homeTeamName,
  awayTeamName,
  gameDate,
}: GamePredictionPanelProps) {
  const awayImg = TEAM_NAME_TO_IMAGE[awayTeamName];
  const homeImg = TEAM_NAME_TO_IMAGE[homeTeamName];
  const dateLabel = gameDate ? formatGameDateLabel(gameDate) : "KBO 2026 시즌";

  if (loading) {
    return (
      <div className="mt-3 p-4 bg-white rounded-2xl border border-purple-100 space-y-2">
        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!prediction || prediction.predictions.length === 0) {
    return (
      <div className="mt-3 py-8 bg-white rounded-2xl border border-purple-100 text-center">
        <p className="text-2xl mb-2">🔮</p>
        <p className="text-sm font-bold text-gray-500">예측 준비 중</p>
        <p className="text-xs text-gray-400 mt-1">
          경기 시작 전 자동으로 생성됩니다
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 bg-white rounded-2xl border border-purple-100 overflow-hidden">
      {/* ── 헤더 ── */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
        {/* 1행: AI 승부예측 타이틀 + 우측 compact 적중률 카드 */}
        <div className="flex items-start justify-between gap-3">
          {/* 좌: 타이틀 / 날짜 / 팀 정보 */}
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-black text-purple-700">
              AI 승부예측
            </span>
            <span className="text-[11px] text-gray-400 font-medium">
              {dateLabel}
            </span>
            {/* 팀 아이콘 + 팀명 VS — 날짜 바로 아래 */}
            <div className="flex items-center gap-1.5 mt-0.5">
              {awayImg && (
                <img
                  src={awayImg}
                  alt={awayTeamName}
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              <span className="text-sm font-black text-gray-700">
                {awayTeamName}
              </span>
              <span className="text-xs text-gray-300 font-bold">VS</span>
              <span className="text-sm font-black text-gray-700">
                {homeTeamName}
              </span>
              {homeImg && (
                <img
                  src={homeImg}
                  alt={homeTeamName}
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>
          </div>

          {/* 우: compact 적중률 카드 3개 */}
          <div className="flex-shrink-0">
            <AiRankingCompact />
          </div>
        </div>
      </div>

      {/* AI별 예측 + 근거 */}
      <div className="p-3 space-y-2">
        {prediction.predictions.map((pred) => (
          <PredictionRow
            key={pred.provider}
            pred={pred}
            awayTeamName={awayTeamName}
            homeTeamName={homeTeamName}
          />
        ))}
      </div>
    </div>
  );
}
