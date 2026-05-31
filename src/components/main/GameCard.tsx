// src/components/main/GameCard.tsx
import React from "react";
import { TEAM_COLORS } from "@/constants/teamColors";
import { formatGameTime, formatGameDate, type GameInfo } from "@/api/gameApi";
import { type TodayPrediction } from "@/api/predictionApi";
import gptImg from "@/assets/gpt.png";
import geminiImg from "@/assets/gemini.png";
import claudeImg from "@/assets/claude.png";

// ── 상수 ────────────────────────────────────────────────────────────────────
const TEAM_CODE_TO_NAME: Record<string, string> = {
  LG: "LG",
  KT: "KT",
  SK: "SSG",
  NC: "NC",
  OB: "두산",
  HT: "KIA",
  LT: "롯데",
  SS: "삼성",
  HH: "한화",
  WO: "키움",
};

const TEAM_CODE_TO_IMAGE: Record<string, string> = {
  LG: "/images/teams/lg.png",
  KT: "/images/teams/kt.png",
  SK: "/images/teams/ssg.png",
  NC: "/images/teams/nc.png",
  OB: "/images/teams/doosan.png",
  HT: "/images/teams/kia.png",
  LT: "/images/teams/lotte.png",
  SS: "/images/teams/samsung.png",
  HH: "/images/teams/hanwha.png",
  WO: "/images/teams/kiwoom.png",
};

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

const PROVIDER_IMAGE: Record<string, string> = {
  openai: gptImg,
  gemini: geminiImg,
  anthropic: claudeImg,
};

// ── AI 예측 버튼 미리보기 한 줄 ─────────────────────────────────────────────
function PredictionPreviewRow({
  pred,
  isResult,
}: {
  pred: TodayPrediction["predictions"][number];
  isResult: boolean;
}) {
  const imgSrc = PROVIDER_IMAGE[pred.provider];
  const winnerImg = TEAM_NAME_TO_IMAGE[pred.winner];

  // 상태 아이콘: 경기 전 → "예측 중", 경기 후 → ✅/❌
  const statusEl = isResult ? (
    <span className="text-xs flex-shrink-0">
      {pred.isCorrect === true
        ? "✅적중"
        : pred.isCorrect === false
          ? "❌실패"
          : "예측 완료"}
    </span>
  ) : (
    <span className="text-[10px] text-gray-400 flex-shrink-0">예측 완료</span>
  );

  return (
    <div className="flex items-center gap-1.5 w-full">
      {/* AI 로고 */}
      <div className="w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={pred.provider}
            className="w-3.5 h-3.5 object-contain rounded"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <span className="text-[9px]">AI</span>
        )}
      </div>

      {/* 팀 로고 */}
      {winnerImg && (
        <img
          src={winnerImg}
          alt={pred.winner}
          className="w-3.5 h-3.5 object-contain flex-shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}

      {/* 팀명 + 승 */}
      <span className="text-[10px] font-bold text-gray-700 truncate flex-1">
        {pred.winner} 승
      </span>

      {/* 상태 */}
      {statusEl}
    </div>
  );
}

// ── AI 예측 버튼 영역 ────────────────────────────────────────────────────────
function PredictionButton({
  prediction,
  isPredictionSelected,
  isResult,
  onClick,
}: {
  prediction: TodayPrediction | undefined;
  isPredictionSelected: boolean;
  isResult: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const hasPredictions = prediction && prediction.predictions.length > 0;

  return (
    <button
      onClick={onClick}
      className={`mx-2 mb-2 px-2 py-1.5 rounded-xl text-[11px] font-bold transition-all w-[calc(100%-16px)] text-left ${
        isPredictionSelected
          ? "bg-purple-600 text-white"
          : "bg-purple-50 hover:bg-purple-100 text-purple-700"
      }`}
    >
      {!hasPredictions ? (
        // 예측 없음
        <span
          className={`text-[10px] font-bold flex items-center justify-center ${isPredictionSelected ? "text-white" : "text-gray-400"}`}
        >
          AI 예측 없음
        </span>
      ) : isPredictionSelected ? (
        // 선택 중 — 닫기
        <span className="flex items-center justify-center text-[10px] font-black text-white">
          예측 닫기
        </span>
      ) : (
        // 미리보기 — 3행
        <div className="space-y-0.5">
          {prediction.predictions.map((pred) => (
            <PredictionPreviewRow
              key={pred.provider}
              pred={pred}
              isResult={isResult}
            />
          ))}
        </div>
      )}
    </button>
  );
}

// ── 경기 카드 ────────────────────────────────────────────────────────────────
export default function GameCard({
  game,
  prediction,
  onClick,
  onPredictionClick,
  isPredictionSelected,
}: {
  game: GameInfo;
  prediction: TodayPrediction | undefined;
  onClick: () => void;
  onPredictionClick: (e: React.MouseEvent) => void;
  isPredictionSelected: boolean;
}) {
  const homeTeamName =
    TEAM_CODE_TO_NAME[game.homeTeamCode] ?? game.homeTeamName;
  const awayTeamName =
    TEAM_CODE_TO_NAME[game.awayTeamCode] ?? game.awayTeamName;
  const homeColor = TEAM_COLORS[homeTeamName]?.bg ?? "#334155";
  const awayColor = TEAM_COLORS[awayTeamName]?.bg ?? "#334155";
  const isResult =
    !game.cancel &&
    (game.statusCode === "RESULT" || game.statusCode === "DONE");
  const isLive = game.statusCode === "LIVE" || game.statusCode === "STARTED";
  const isCancel = game.cancel;
  const homeWin = game.winner === "HOME";
  const awayWin = game.winner === "AWAY";

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-all ${
        isPredictionSelected
          ? "border-purple-300 shadow-purple-100 shadow-md"
          : "border-gray-100 hover:shadow-md"
      }`}
    >
      {/* 카드 본체 — 클릭 시 LineScoreModal */}
      <div onClick={onClick} className="cursor-pointer flex-1">
        {/* 구장 + 상태 */}
        <div className="flex items-center justify-between px-3 pt-3 pb-1">
          <span className="text-[10px] text-gray-400 truncate max-w-[60%]">
            {game.stadium}
          </span>
          {isLive ? (
            <span className="flex items-center gap-1 text-[10px] font-black text-red-500 flex-shrink-0">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping absolute" />
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full relative" />
              {game.statusInfo || "LIVE"}
            </span>
          ) : isResult ? (
            <span className="text-[10px] font-bold text-gray-400 flex-shrink-0">
              종료
            </span>
          ) : isCancel ? (
            <span className="text-[10px] font-bold text-blue-400 flex-shrink-0">
              취소
            </span>
          ) : (
            <span className="text-[10px] font-bold text-blue-500 flex-shrink-0">
              {formatGameTime(game.gameDateTime)}
            </span>
          )}
        </div>

        {/* 팀 배치: 왼쪽 원정(Away) VS 오른쪽 홈(Home) */}
        <div className="flex items-center px-3 py-2 gap-2">
          {/* 원정팀 */}
          <div
            className={`flex-1 flex flex-col items-center gap-1 ${isResult && !awayWin ? "opacity-40" : ""}`}
          >
            <img
              src={
                TEAM_CODE_TO_IMAGE[game.awayTeamCode] ?? game.awayTeamEmblemUrl
              }
              alt={awayTeamName}
              className="w-9 h-9 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const n = e.currentTarget
                  .nextElementSibling as HTMLElement | null;
                if (n) n.style.display = "flex";
              }}
            />
            <div
              className="w-9 h-9 rounded-xl items-center justify-center text-white text-[10px] font-black hidden"
              style={{ backgroundColor: awayColor }}
            >
              {awayTeamName.slice(0, 2)}
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-bold text-gray-600">
                {awayTeamName}
              </span>
              {/* 원정 라벨 */}
              <span className="text-[8px] font-bold text-gray-300 leading-none">
                어웨이
              </span>
            </div>
            {isResult && (
              <span
                className={`text-xl font-black leading-none ${awayWin ? "text-gray-900" : "text-gray-400"}`}
              >
                {game.awayTeamScore}
              </span>
            )}
            {isLive && (
              <span
                className="text-2xl font-black leading-none"
                style={{ color: awayColor }}
              >
                {game.awayTeamScore}
              </span>
            )}
          </div>

          {/* 중간 */}
          {isLive ? (
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <span className="text-[9px] font-black text-red-400 animate-pulse">
                LIVE
              </span>
              <span className="text-xs font-bold text-gray-300">:</span>
            </div>
          ) : (
            <span className="text-xs font-bold text-gray-200 flex-shrink-0">
              VS
            </span>
          )}

          {/* 홈팀 */}
          <div
            className={`flex-1 flex flex-col items-center gap-1 ${isResult && !homeWin ? "opacity-40" : ""}`}
          >
            <img
              src={
                TEAM_CODE_TO_IMAGE[game.homeTeamCode] ?? game.homeTeamEmblemUrl
              }
              alt={homeTeamName}
              className="w-9 h-9 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const n = e.currentTarget
                  .nextElementSibling as HTMLElement | null;
                if (n) n.style.display = "flex";
              }}
            />
            <div
              className="w-9 h-9 rounded-xl items-center justify-center text-white text-[10px] font-black hidden"
              style={{ backgroundColor: homeColor }}
            >
              {homeTeamName.slice(0, 2)}
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-bold text-gray-600">
                {homeTeamName}
              </span>
              {/* 홈 라벨 */}
              <span
                className="text-[8px] font-black px-1 py-0.5 rounded-sm leading-none"
                style={{ background: homeColor + "20", color: homeColor }}
              >
                홈
              </span>
            </div>
            {isResult && (
              <span
                className={`text-xl font-black leading-none ${homeWin ? "text-gray-900" : "text-gray-400"}`}
              >
                {game.homeTeamScore}
              </span>
            )}
            {isLive && (
              <span
                className="text-2xl font-black leading-none"
                style={{ color: homeColor }}
              >
                {game.homeTeamScore}
              </span>
            )}
          </div>
        </div>

        {/* 경기 결과 배너 */}
        {isResult && game.winner !== "DRAW" && (
          <div
            className="mx-3 mb-2 rounded-lg py-1 text-center text-[10px] font-black text-white"
            style={{ backgroundColor: homeWin ? homeColor : awayColor }}
          >
            {homeWin ? homeTeamName : awayTeamName} 승리
          </div>
        )}
        {isResult &&
          game.winner === "DRAW" &&
          (game.homeTeamScore > 0 || game.awayTeamScore > 0) && (
            <div className="mx-3 mb-2 rounded-lg py-1 text-center text-[10px] font-bold text-gray-500 bg-gray-100">
              무승부
            </div>
          )}

        {/* 승/패 투수 — 해당 팀 위치에 맞게 배치 */}
        {isResult && (game.winPitcherName || game.losePitcherName) && (
          <div className="mx-3 mb-2 flex items-center justify-between text-[10px] border-t pt-1.5">
            {/* 왼쪽: 원정팀 투수 */}
            <div className="flex-1 text-left">
              {awayWin && game.winPitcherName ? (
                <span className="text-green-600 font-bold">
                  승 {game.winPitcherName}
                </span>
              ) : !awayWin && game.losePitcherName ? (
                <span className="text-red-500 font-bold">
                  패 {game.losePitcherName}
                </span>
              ) : null}
            </div>
            {/* 오른쪽: 홈팀 투수 */}
            <div className="flex-1 text-right">
              {homeWin && game.winPitcherName ? (
                <span className="text-green-600 font-bold">
                  승 {game.winPitcherName}
                </span>
              ) : !homeWin && game.winner !== "DRAW" && game.losePitcherName ? (
                <span className="text-red-500 font-bold">
                  패 {game.losePitcherName}
                </span>
              ) : null}
            </div>
          </div>
        )}

        {/* 선발 투수 (경기 전) */}
        {!isResult && !isLive && !isCancel && game.homeStarterName && (
          <div className="flex justify-between mx-3 mb-1 text-[10px] text-gray-400 border-t pt-1.5">
            <span>{game.awayStarterName || "-"}</span>
            <span className="text-gray-300">선발</span>
            <span>{game.homeStarterName || "-"}</span>
          </div>
        )}

        {/* 중계 채널 */}
        {game.broadChannel && (
          <div className="text-center text-[10px] text-gray-400 mb-1 px-2">
            📺 {game.broadChannel.replace("^", " / ")}
          </div>
        )}
        {!isResult && !isLive && !isCancel && !game.broadChannel && (
          <p className="text-center text-[10px] text-gray-400 mb-1 px-2">
            {formatGameDate(game.gameDate)} {formatGameTime(game.gameDateTime)}
          </p>
        )}
        {isCancel && (
          <p className="text-center text-[10px] text-blue-400 font-bold mb-1">
            취소
          </p>
        )}
      </div>

      {/* AI 예측 버튼 — 취소 경기 제외 */}
      {!isCancel && (
        <PredictionButton
          prediction={prediction}
          isPredictionSelected={isPredictionSelected}
          isResult={isResult}
          onClick={onPredictionClick}
        />
      )}
    </div>
  );
}
