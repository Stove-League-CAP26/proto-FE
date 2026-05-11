// src/components/main/AiPredictionSection.tsx

import React, { useState, useEffect } from "react";
import {
  fetchAiRanking,
  fetchTodayPredictions,
  getProviderColor,
  type AiRankingItem,
  type TodayPrediction,
} from "@/api/predictionApi";
import gptImg from "@/assets/gpt.png";
import geminiImg from "@/assets/gemini.png";
import claudeImg from "@/assets/claude.png";

const PROVIDER_IMAGE: Record<string, string> = {
  openai: gptImg,
  gemini: geminiImg,
  anthropic: claudeImg,
};

const TEAM_IMG: Record<string, string> = {
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

function TeamLogo({ team, size = 18 }: { team: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const src = TEAM_IMG[team];
  if (!src || failed) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full font-black text-white text-[9px] flex-shrink-0"
        style={{ width: size, height: size, background: "#94a3b8" }}
      >
        {team.slice(0, 1)}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={team}
      style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }}
      onError={() => setFailed(true)}
    />
  );
}

function isCrown(item: AiRankingItem, ranking: AiRankingItem[]): boolean {
  if (ranking.every((r) => r.totalCount === 0)) return false;
  const maxRate = Math.max(...ranking.map((r) => r.winRate));
  return item.winRate === maxRate && maxRate > 0;
}

// ── 플립 카드 ────────────────────────────────────────────────────
function FlipGameCard({
  game,
  provider,
  color,
}: {
  game: TodayPrediction;
  provider: string;
  color: string;
}) {
  const [flipped, setFlipped] = useState(false);
  const pred = game.predictions.find((p) => p.provider === provider);
  if (!pred) return null;

  const isResult = game.statusCode === "RESULT";

  return (
    <div
      className="cursor-pointer"
      style={{ perspective: "800px" }}
      onClick={() => setFlipped((v) => !v)}
    >
      <div
        style={{
          position: "relative",
          transformStyle: "preserve-3d",
          transition: "transform 0.45s ease",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          minHeight: isResult ? "88px" : "72px",
        }}
      >
        {/* ── 앞면 ── */}
        <div
          className="rounded-xl p-2.5 absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: isResult
              ? pred.isCorrect
                ? "#f0fdf4"
                : "#fff1f2"
              : color + "08",
            border: `1px solid ${
              isResult ? (pred.isCorrect ? "#86efac" : "#fca5a5") : color + "20"
            }`,
          }}
        >
          {/* 경기 전 / 경기 중 */}
          {!isResult && (
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <TeamLogo team={game.awayTeam} size={18} />
                <span className="text-[11px] font-bold text-gray-700 truncate">
                  {game.awayTeam}
                </span>
              </div>
              <div className="flex flex-col items-center mx-2 flex-shrink-0">
                <div
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
                  style={{ background: color + "18" }}
                >
                  <span className="text-sm font-black" style={{ color }}>
                    {pred.awayScorePred}
                  </span>
                  <span className="text-[10px] text-gray-300">:</span>
                  <span className="text-sm font-black" style={{ color }}>
                    {pred.homeScorePred}
                  </span>
                </div>
                <span
                  className="text-[9px] font-black mt-1 px-1.5 py-0.5 rounded-full"
                  style={{ background: color + "15", color }}
                >
                  예측 승: {pred.winner}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                <span className="text-[11px] font-bold text-gray-700 truncate text-right">
                  {game.homeTeam}
                </span>
                <TeamLogo team={game.homeTeam} size={18} />
              </div>
            </div>
          )}

          {/* 경기 종료 — 2행 레이아웃 */}
          {isResult && (
            <div className="flex flex-col gap-1.5">
              {/* 1행: 원정팀 | 예측스코어 | 실제스코어 | 홈팀 */}
              <div className="flex items-center justify-between gap-1">
                {/* 원정팀 */}
                <div className="flex flex-col items-center gap-0.5 w-8 shrink-0">
                  <TeamLogo team={game.awayTeam} size={18} />
                  <span className="text-[9px] font-bold text-gray-500">
                    {game.awayTeam}
                  </span>
                </div>

                {/* 예측 스코어 */}
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[8px] text-gray-400">예측</span>
                  <div
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                    style={{ background: color + "18" }}
                  >
                    <span className="text-xs font-black" style={{ color }}>
                      {pred.awayScorePred ?? "-"}
                    </span>
                    <span className="text-[9px] text-gray-300">:</span>
                    <span className="text-xs font-black" style={{ color }}>
                      {pred.homeScorePred ?? "-"}
                    </span>
                  </div>
                </div>

                {/* 실제 스코어 */}
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[8px] text-gray-400">실제</span>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gray-100">
                    <span
                      className={`text-xs font-black ${game.winner === game.awayTeam ? "text-gray-800" : "text-gray-400"}`}
                    >
                      {game.awayScore ?? "-"}
                    </span>
                    <span className="text-[9px] text-gray-300">:</span>
                    <span
                      className={`text-xs font-black ${game.winner === game.homeTeam ? "text-gray-800" : "text-gray-400"}`}
                    >
                      {game.homeScore ?? "-"}
                    </span>
                  </div>
                </div>

                {/* 홈팀 */}
                <div className="flex flex-col items-center gap-0.5 w-8 shrink-0">
                  <TeamLogo team={game.homeTeam} size={18} />
                  <span className="text-[9px] font-bold text-gray-500">
                    {game.homeTeam}
                  </span>
                </div>
              </div>

              {/* 2행: 적중 여부 */}
              <div className="flex items-center justify-center gap-1">
                <span className="text-sm">
                  {pred.isCorrect === true
                    ? "✅"
                    : pred.isCorrect === false
                      ? "❌"
                      : "⏳"}
                </span>
                <span className="text-[10px] text-gray-500">
                  {pred.isCorrect === true
                    ? "승리팀 적중"
                    : pred.isCorrect === false
                      ? "승리팀 미적중"
                      : "집계 중"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── 뒷면 (예측 근거) ── */}
        <div
          className="rounded-xl p-2.5 absolute inset-0 flex items-center"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: color + "12",
            border: `1px solid ${color}30`,
          }}
        >
          <p className="text-[11px] text-gray-700 leading-relaxed line-clamp-3">
            {pred.reason ?? "예측 근거가 없습니다."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── AI 모델 카드 ─────────────────────────────────────────────────
function AiModelCard({
  item,
  ranking,
  todayPredictions,
}: {
  item: AiRankingItem;
  ranking: AiRankingItem[];
  todayPredictions: TodayPrediction[];
}) {
  const color = getProviderColor(item.provider);
  const crown = isCrown(item, ranking);
  const imgSrc = PROVIDER_IMAGE[item.provider];

  const hasTodayGames = todayPredictions.some((game) =>
    game.predictions.some((p) => p.provider === item.provider),
  );

  const resultOnly = item.recentResults;

  const recentCorrect = resultOnly.filter((r) => r.isCorrect === true).length;
  const recentTotal = resultOnly.filter((r) => r.isCorrect !== null).length;
  const recentRate =
    recentTotal > 0 ? (recentCorrect / recentTotal) * 100 : null;

  return (
    <div
      className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col"
      style={{ borderColor: color + "25" }}
    >
      {/* 헤더 */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          background: `linear-gradient(135deg, ${color}12, ${color}06)`,
        }}
      >
        <div className="flex items-center gap-2.5">
          {crown && <span className="text-base leading-none">👑</span>}
          <img
            src={imgSrc}
            alt={item.providerLabel}
            className="w-8 h-8 object-contain rounded-lg flex-shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div>
            <p className="text-sm font-black text-gray-800 leading-tight">
              {item.providerLabel}
            </p>
            <p className="text-[10px] text-gray-400">{item.provider}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-gray-400 leading-none mb-0.5">
            전체 적중률
          </p>
          <p className="text-lg font-black leading-none" style={{ color }}>
            {item.totalCount > 0 ? `${(item.winRate * 100).toFixed(1)}%` : "-"}
          </p>
          <div className="text-right">
            <p className="text-sm font-black" style={{ color }}>
              {item.correctCount}/{item.totalCount}
            </p>
          </div>
        </div>
      </div>

      {/* 최근 5승부예측 결과 (위) */}
      <div className="px-4 py-3">
        <p className="text-[11px] font-bold text-gray-400 mb-2">
          최근 5승부예측 결과
        </p>
        {resultOnly.length === 0 ? (
          <p className="text-[11px] text-gray-300 text-center py-1">
            종료된 경기 없음
          </p>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {resultOnly.map((r, i) => (
                <span key={i} className="text-base leading-none">
                  {r.isCorrect === true ? "✅" : "❌"}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[9px] text-gray-400">적중</p>
                <p className="text-sm font-black" style={{ color }}>
                  {recentCorrect}/{recentTotal}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-gray-400">최근 적중률</p>
                <p className="text-sm font-black text-gray-700">
                  {recentRate !== null ? `${recentRate.toFixed(1)}%` : "-"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 오늘 경기 예측 (아래) */}
      <div
        className="px-4 pt-3 pb-3 flex-1 border-t"
        style={{ borderColor: color + "15" }}
      >
        <p className="text-[11px] font-bold text-gray-400 mb-2">
          오늘 경기 예측
        </p>
        {hasTodayGames ? (
          <div className="space-y-2">
            {todayPredictions.map((game) => (
              <FlipGameCard
                key={game.naverGameId}
                game={game}
                provider={item.provider}
                color={color}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-6">
            <p className="text-sm text-gray-400">🔮 예측 진행 중 ...</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 메인 섹션 ────────────────────────────────────────────────────
export default function AiPredictionSection() {
  const [ranking, setRanking] = useState<AiRankingItem[]>([]);
  const [todayPredictions, setTodayPredictions] = useState<TodayPrediction[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAiRanking(), fetchTodayPredictions()])
      .then(([rank, today]) => {
        setRanking(rank);
        setTodayPredictions(today);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (ranking.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <p className="text-sm text-gray-400 font-medium">
          아직 AI 승부예측 데이터가 없습니다
        </p>
        <p className="text-xs text-gray-300 mt-1">
          경기 시작 전 자동으로 예측이 생성됩니다
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {ranking.map((item) => (
        <AiModelCard
          key={item.provider}
          item={item}
          ranking={ranking}
          todayPredictions={todayPredictions}
        />
      ))}
    </div>
  );
}
