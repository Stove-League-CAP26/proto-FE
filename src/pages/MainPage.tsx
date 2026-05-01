// src/pages/MainPage.tsx
// 메인 페이지 — 경기일정 / 리그순위 / 뉴스 / 유튜브 / 중계사이트

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TEAM_COLORS } from "@/constants/teamColors";
import {
  fetchGamesByDate,
  fetchRecentGames,
  fetchUpcomingGames,
  fetchStandings,
  fetchGameScore,
  formatGameTime,
  formatGameDate,
  getStatusLabel,
  type GameInfo,
  type LeagueStanding,
  type GameScore,
  type LineupPlayer,
  type PitcherInfo,
} from "@/api/gameApi";
import {
  YOUTUBE_CHANNELS,
  BROADCAST_SITES,
  COMMUNITY_LINKS,
} from "@/mock/homeData";
import {
  fetchNews,
  filterNewsByCategory,
  formatNewsDate,
  NEWS_CATEGORIES,
  type NewsItem,
  type NewsCategory,
} from "@/api/newsApi";

// ── Props ─────────────────────────────────────────────────────────────────────
interface MainPageProps {
  onSelectPlayer?: (pid: number) => void;
}

// ── 날짜 유틸 ─────────────────────────────────────────────────────────────────
function buildDateTabs() {
  const tabs = [];
  const today = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  for (let i = -2; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const label = `${d.getMonth() + 1}/${d.getDate()}(${days[d.getDay()]})`;
    tabs.push({ dateStr, label, isToday: i === 0 });
  }
  return tabs;
}

// ── 팀 코드 → 한글 팀명 ──────────────────────────────────────────────────────
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

// ── 팀 코드 → 로컬 이미지 (경기 카드용) ─────────────────────────────────────
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

// ── 팀명 → 로컬 이미지 (순위표용) ────────────────────────────────────────────
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

// ── 선수 이미지 URL — 네이버 CDN (팀 페이지 PlayerAvatar와 동일) ────────────
function getPlayerImageUrl(pcode: string, year: number = 2026): string {
  if (!pcode) return "";
  return `https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/kbo/${year}/${pcode}.png`;
}

// ── 선수 아바타 ───────────────────────────────────────────────────────────────
function PlayerAvatar({
  pcode,
  name,
  size = "sm",
  onClick,
}: {
  pcode: string;
  name: string;
  size?: "sm" | "md";
  onClick?: () => void;
}) {
  const dim = size === "md" ? "w-14 h-14" : "w-10 h-10";
  const YEARS = [2026, 2025, 2024, 2023];
  const [yearIdx, setYearIdx] = React.useState(0);
  const [failed, setFailed] = React.useState(false);

  // pcode 변경 시 초기화
  React.useEffect(() => {
    setYearIdx(0);
    setFailed(false);
  }, [pcode]);

  // pcode 없으면 이니셜만 표시
  if (!pcode) {
    return (
      <button
        onClick={onClick}
        title={name}
        className={`${dim} rounded-full bg-gray-200 border-2 border-white shadow flex-shrink-0 flex items-center justify-center ${
          onClick
            ? "cursor-pointer hover:scale-110 transition-transform"
            : "cursor-default"
        }`}
      >
        <span style={{ fontSize: 11, color: "#9ca3af" }}>
          {name.slice(0, 1)}
        </span>
      </button>
    );
  }

  const handleImgError = () => {
    if (yearIdx < YEARS.length - 1) setYearIdx((i) => i + 1);
    else setFailed(true);
  };

  return (
    <button
      onClick={onClick}
      className={`${dim} rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow flex-shrink-0 ${
        onClick
          ? "cursor-pointer hover:scale-110 transition-transform"
          : "cursor-default"
      }`}
      title={name}
    >
      {failed ? (
        <span
          style={{
            fontSize: 11,
            color: "#9ca3af",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "100%",
          }}
        >
          {name.slice(0, 1)}
        </span>
      ) : (
        <img
          src={getPlayerImageUrl(pcode, YEARS[yearIdx])}
          alt={name}
          className="w-full h-full object-cover object-top"
          onError={handleImgError}
        />
      )}
    </button>
  );
}

// ── 경기 카드 ─────────────────────────────────────────────────────────────────
function GameCard({ game, onClick }: { game: GameInfo; onClick: () => void }) {
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
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col cursor-pointer"
    >
      {/* 상태 & 구장 */}
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

      {/* 원정 vs 홈 — LIVE면 스코어 강조 표시 */}
      <div className="flex items-center px-3 py-2 gap-2 flex-1">
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
              const img = e.currentTarget;
              img.style.display = "none";
              const next = img.nextElementSibling as HTMLElement | null;
              if (next) next.style.display = "flex";
            }}
          />
          <div
            className="w-9 h-9 rounded-xl items-center justify-center text-white text-[10px] font-black hidden"
            style={{ backgroundColor: awayColor }}
          >
            {awayTeamName.slice(0, 2)}
          </div>
          <span className="text-[10px] font-bold text-gray-600">
            {awayTeamName}
          </span>
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

        {isLive ? (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] font-black text-red-400 animate-pulse">
              LIVE
            </span>
            <span className="text-xs font-bold text-gray-300">:</span>
          </div>
        ) : (
          <span className="text-xs font-bold text-gray-200">VS</span>
        )}

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
              const img = e.currentTarget;
              img.style.display = "none";
              const next = img.nextElementSibling as HTMLElement | null;
              if (next) next.style.display = "flex";
            }}
          />
          <div
            className="w-9 h-9 rounded-xl items-center justify-center text-white text-[10px] font-black hidden"
            style={{ backgroundColor: homeColor }}
          >
            {homeTeamName.slice(0, 2)}
          </div>
          <span className="text-[10px] font-bold text-gray-600">
            {homeTeamName}
          </span>
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

      {isResult && game.winPitcherName && (
        <div className="mx-3 mb-2 text-center">
          <span className="text-[10px] text-green-600 font-bold">
            승 {game.winPitcherName}
          </span>
          <span className="text-gray-300 mx-1">·</span>
          <span className="text-[10px] text-red-500 font-bold">
            패 {game.losePitcherName}
          </span>
        </div>
      )}

      {!isResult && !isLive && !isCancel && game.homeStarterName && (
        <div className="flex justify-between mx-3 mb-2 text-[10px] text-gray-400 border-t pt-1.5">
          <span>{game.awayStarterName || "-"}</span>
          <span className="text-gray-300">선발</span>
          <span>{game.homeStarterName || "-"}</span>
        </div>
      )}

      {game.broadChannel && (
        <div className="text-center text-[10px] text-gray-400 mb-2.5 px-2">
          📺 {game.broadChannel.replace("^", " / ")}
        </div>
      )}

      {!isResult && !isLive && !isCancel && !game.broadChannel && (
        <p className="text-center text-[10px] text-gray-400 mb-2.5 px-2">
          {formatGameDate(game.gameDate)} {formatGameTime(game.gameDateTime)}
        </p>
      )}

      {isCancel && (
        <p className="text-center text-[10px] text-blue-400 font-bold mb-2.5">
          취소
        </p>
      )}
    </div>
  );
}

// ── 라인스코어 모달 ───────────────────────────────────────────────────────────
function LineScoreModal({
  game,
  score,
  loading,
  onClose,
  onSelectPlayer,
}: {
  game: GameInfo;
  score: GameScore | null;
  loading: boolean;
  onClose: () => void;
  onSelectPlayer: (pid: number) => void;
}) {
  const homeTeamName =
    TEAM_CODE_TO_NAME[game.homeTeamCode] ?? game.homeTeamName;
  const awayTeamName =
    TEAM_CODE_TO_NAME[game.awayTeamCode] ?? game.awayTeamName;
  const homeColor = TEAM_COLORS[homeTeamName]?.bg ?? "#334155";
  const awayColor = TEAM_COLORS[awayTeamName]?.bg ?? "#334155";
  const innings = score?.innings ?? [];

  const handlePlayer = (pcode: string) => {
    if (!pcode) return;
    onClose();
    onSelectPlayer(Number(pcode));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-y-auto flex-1">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-600">
                {game.stadium}
              </span>
              <span className="text-xs text-gray-300">|</span>
              <span className="text-xs text-gray-400">
                {formatGameDate(game.gameDate)}
              </span>
              {game.statusCode === "LIVE" && (
                <span className="flex items-center gap-1 text-xs font-black text-red-500 animate-pulse ml-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block" />
                  LIVE
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-lg w-7 h-7 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* 최종 스코어 */}
          <div className="flex items-center justify-center gap-6 py-5 px-5">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <img
                src={TEAM_CODE_TO_IMAGE[game.awayTeamCode]}
                alt={awayTeamName}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <span className="text-xs font-bold text-gray-600">
                {awayTeamName}
              </span>
              {game.statusCode !== "BEFORE" && (
                <span className="text-xs text-gray-400">
                  {score?.awayHit ?? "-"}안타
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span
                className="text-5xl font-black"
                style={{ color: awayColor }}
              >
                {loading || game.statusCode === "BEFORE"
                  ? "-"
                  : (score?.awayScore ?? game.awayTeamScore)}
              </span>
              <span className="text-2xl text-gray-200 font-bold">:</span>
              <span
                className="text-5xl font-black"
                style={{ color: homeColor }}
              >
                {loading || game.statusCode === "BEFORE"
                  ? "-"
                  : (score?.homeScore ?? game.homeTeamScore)}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <img
                src={TEAM_CODE_TO_IMAGE[game.homeTeamCode]}
                alt={homeTeamName}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <span className="text-xs font-bold text-gray-600">
                {homeTeamName}
              </span>
              {game.statusCode !== "BEFORE" && (
                <span className="text-xs text-gray-400">
                  {score?.homeHit ?? "-"}안타
                </span>
              )}
            </div>
          </div>

          {/* 라인스코어 테이블 */}
          {game.statusCode === "BEFORE" ? (
            <div className="mx-5 mb-4 py-3 bg-blue-50 rounded-xl text-center">
              <p className="text-xs font-bold text-blue-400">
                경기 전 — 아직 시작되지 않았습니다
              </p>
            </div>
          ) : loading ? (
            <div className="h-16 mx-5 mb-4 bg-gray-100 rounded-xl animate-pulse" />
          ) : innings.length > 0 ? (
            <div className="px-5 mb-4 overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 py-2 text-left font-bold text-gray-500 w-14">
                      팀
                    </th>
                    {innings.map((inn) => (
                      <th
                        key={inn.inning}
                        className="px-1.5 py-2 font-bold text-gray-400 w-7"
                      >
                        {inn.inning}
                      </th>
                    ))}
                    <th className="px-2 py-2 font-black text-gray-700 w-8">
                      R
                    </th>
                    <th className="px-2 py-2 font-bold text-gray-400 w-8">H</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-2.5 text-left font-bold text-gray-700">
                      {awayTeamName}
                    </td>
                    {innings.map((inn) => (
                      <td
                        key={inn.inning}
                        className={`px-1.5 py-2.5 font-medium ${inn.awayScore !== "0" && inn.awayScore !== "-" ? "text-gray-900 font-bold" : "text-gray-400"}`}
                      >
                        {inn.awayScore}
                      </td>
                    ))}
                    <td className="px-2 py-2.5 font-black text-gray-900">
                      {score?.awayScore}
                    </td>
                    <td className="px-2 py-2.5 text-gray-400">
                      {score?.awayHit}
                    </td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="px-2 py-2.5 text-left font-bold text-gray-700">
                      {homeTeamName}
                    </td>
                    {innings.map((inn) => (
                      <td
                        key={inn.inning}
                        className={`px-1.5 py-2.5 font-medium ${inn.homeScore !== "0" && inn.homeScore !== "-" ? "text-gray-900 font-bold" : "text-gray-400"}`}
                      >
                        {inn.homeScore}
                      </td>
                    ))}
                    <td className="px-2 py-2.5 font-black text-gray-900">
                      {score?.homeScore}
                    </td>
                    <td className="px-2 py-2.5 text-gray-400">
                      {score?.homeHit}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : null}

          {/* 승/패 투수 (있을 때만) */}
          {!loading && (score?.winPitcher || score?.losePitcher) && (
            <div className="px-5 mb-4">
              <div className="flex gap-3">
                {score?.winPitcher && (
                  <div className="flex-1 flex items-center gap-3 bg-blue-50 rounded-xl px-3 py-2.5">
                    <PlayerAvatar
                      pcode={score.winPitcher.pcode}
                      name={score.winPitcher.name}
                      size="md"
                      onClick={() => handlePlayer(score.winPitcher!.pcode)}
                    />
                    <div>
                      <p className="text-[10px] font-bold text-blue-400">
                        승리투수
                      </p>
                      <p className="text-sm font-black text-gray-800">
                        {score.winPitcher.name}
                      </p>
                    </div>
                  </div>
                )}
                {score?.losePitcher && (
                  <div className="flex-1 flex items-center gap-3 bg-red-50 rounded-xl px-3 py-2.5">
                    <PlayerAvatar
                      pcode={score.losePitcher.pcode}
                      name={score.losePitcher.name}
                      size="md"
                      onClick={() => handlePlayer(score.losePitcher!.pcode)}
                    />
                    <div>
                      <p className="text-[10px] font-bold text-red-400">
                        패전투수
                      </p>
                      <p className="text-sm font-black text-gray-800">
                        {score.losePitcher.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 선발 라인업 */}
          {!loading &&
          (score?.awayLineup?.length || score?.homeLineup?.length) ? (
            <div className="px-5 mb-4">
              <p className="text-xs font-black text-gray-400 mb-3">
                선발 라인업
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2">
                    {awayTeamName}
                  </p>
                  <div className="space-y-1.5">
                    {score?.awayLineup?.map((p) => (
                      <div key={p.pcode} className="flex items-center gap-2">
                        <PlayerAvatar
                          pcode={p.pcode}
                          name={p.name}
                          size="sm"
                          onClick={() => handlePlayer(p.pcode)}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {p.batOrder > 0 ? `${p.batOrder}번 ` : ""}
                            {p.pos}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2">
                    {homeTeamName}
                  </p>
                  <div className="space-y-1.5">
                    {score?.homeLineup?.map((p) => (
                      <div key={p.pcode} className="flex items-center gap-2">
                        <PlayerAvatar
                          pcode={p.pcode}
                          name={p.name}
                          size="sm"
                          onClick={() => handlePlayer(p.pcode)}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {p.batOrder > 0 ? `${p.batOrder}번 ` : ""}
                            {p.pos}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* 문자중계 버튼 — 고정 하단 */}
        <div className="px-5 py-4 border-t border-gray-100">
          <a
            href={`https://m.sports.naver.com/game/${game.gameId}/relay`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#03C75A" }}
          >
            <span>📋</span> 네이버 문자중계 보기
          </a>
        </div>
      </div>
    </div>
  );
}

// ── 리그 순위 테이블 ──────────────────────────────────────────────────────────
function StandingsTable({
  standings,
  onTeamClick,
}: {
  standings: LeagueStanding[];
  onTeamClick?: (teamName: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-3 py-3 text-xs font-bold text-gray-400 text-left w-8">
                순위
              </th>
              <th className="px-3 py-3 text-xs font-bold text-gray-400 text-left">
                팀
              </th>
              <th className="px-3 py-3 text-xs font-bold text-gray-400 text-center">
                경기
              </th>
              <th className="px-3 py-3 text-xs font-bold text-blue-400 text-center">
                승
              </th>
              <th className="px-3 py-3 text-xs font-bold text-red-400 text-center">
                패
              </th>
              <th className="px-3 py-3 text-xs font-bold text-gray-400 text-center">
                무
              </th>
              <th className="px-3 py-3 text-xs font-bold text-gray-600 text-center">
                승률
              </th>
              <th className="px-3 py-3 text-xs font-bold text-gray-400 text-center">
                GB
              </th>
              <th className="px-3 py-3 text-xs font-bold text-gray-400 text-center hidden sm:table-cell">
                연속
              </th>
              <th className="px-3 py-3 text-xs font-bold text-blue-300 text-center hidden md:table-cell">
                타율
              </th>
              <th className="px-3 py-3 text-xs font-bold text-orange-300 text-center hidden md:table-cell">
                ERA
              </th>
              <th className="px-3 py-3 text-xs font-bold text-gray-400 text-center hidden lg:table-cell">
                최근5경기
              </th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s) => {
              const tc = TEAM_COLORS[s.teamName];
              return (
                <tr
                  key={s.teamName}
                  className={`border-t border-gray-50 transition-colors ${onTeamClick ? "cursor-pointer hover:bg-amber-50/40" : "hover:bg-gray-50/40"}`}
                  onClick={() => onTeamClick?.(s.teamName)}
                >
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                        s.rankNum === 1
                          ? "bg-yellow-100 text-yellow-700"
                          : s.rankNum <= 3
                            ? "bg-blue-50 text-blue-600"
                            : s.rankNum >= 9
                              ? "bg-red-50 text-red-400"
                              : "text-gray-500"
                      }`}
                    >
                      {s.rankNum}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <img
                        src={TEAM_NAME_TO_IMAGE[s.teamName]}
                        alt={s.teamName}
                        className="w-6 h-6 object-contain flex-shrink-0"
                        onError={(e) => {
                          const img = e.currentTarget;
                          img.style.display = "none";
                          const next =
                            img.nextElementSibling as HTMLElement | null;
                          if (next) next.style.display = "flex";
                        }}
                      />
                      <div
                        className="w-6 h-6 rounded-lg items-center justify-center text-white text-[9px] font-black flex-shrink-0 hidden"
                        style={{ backgroundColor: tc?.bg ?? "#64748b" }}
                      >
                        {s.teamName.slice(0, 2)}
                      </div>
                      <span className="text-sm font-bold text-gray-800">
                        {s.teamName}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center text-xs text-gray-400">
                    {s.totalGames}
                  </td>
                  <td className="px-3 py-2.5 text-center text-sm font-bold text-blue-600">
                    {s.wins}
                  </td>
                  <td className="px-3 py-2.5 text-center text-sm font-bold text-red-500">
                    {s.losses}
                  </td>
                  <td className="px-3 py-2.5 text-center text-xs text-gray-400">
                    {s.draws}
                  </td>
                  <td className="px-3 py-2.5 text-center text-sm font-black text-gray-800">
                    {s.winPct != null ? s.winPct.toFixed(3) : "-"}
                  </td>
                  <td className="px-3 py-2.5 text-center text-xs text-gray-400">
                    {s.gamesBehind === 0
                      ? "-"
                      : (s.gamesBehind?.toFixed(1) ?? "-")}
                  </td>
                  <td className="px-3 py-2.5 text-center hidden sm:table-cell">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        s.streak?.includes("승")
                          ? "bg-blue-50 text-blue-600"
                          : s.streak?.includes("패")
                            ? "bg-red-50 text-red-500"
                            : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {s.streak ?? "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center text-xs font-bold text-blue-500 hidden md:table-cell">
                    {s.teamAvg != null ? s.teamAvg.toFixed(3) : "-"}
                  </td>
                  <td className="px-3 py-2.5 text-center text-xs font-bold text-orange-500 hidden md:table-cell">
                    {s.teamEra != null ? s.teamEra.toFixed(2) : "-"}
                  </td>
                  <td className="px-3 py-2.5 text-center hidden lg:table-cell">
                    <div className="flex items-center justify-center gap-0.5">
                      {s.last5 ? (
                        s.last5.split("").map((r, i) => (
                          <span
                            key={i}
                            className={`w-5 h-5 rounded text-[9px] font-black flex items-center justify-center text-white ${
                              r === "W"
                                ? "bg-blue-500"
                                : r === "L"
                                  ? "bg-red-400"
                                  : "bg-gray-300"
                            }`}
                          >
                            {r === "W" ? "승" : r === "L" ? "패" : "무"}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-300">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 뉴스 카드 ────────────────────────────────────────────────────────────────
const CATEGORY_COLOR: Record<string, string> = {
  경기결과: "#3B82F6",
  투수: "#8B5CF6",
  타자: "#10B981",
  홈런: "#EF4444",
  트레이드: "#F59E0B",
  FA: "#06B6D4",
  부상: "#F97316",
  팀소식: "#64748b",
};

function NewsCard({ news }: { news: NewsItem }) {
  const catColor = CATEGORY_COLOR[news.category] ?? "#64748b";
  const url = news.originallink || news.link;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div
        className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-xl flex-none"
        style={{ backgroundColor: catColor + "18" }}
      >
        ⚾
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: catColor + "18", color: catColor }}
          >
            {news.category}
          </span>
          <span className="text-[10px] text-gray-300 truncate">
            {formatNewsDate(news.pubDate)}
          </span>
        </div>
        <p className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">
          {news.title}
        </p>
        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
          {news.description}
        </p>
      </div>
    </a>
  );
}

// ── 섹션 헤더 ────────────────────────────────────────────────────────────────
function SectionHeader({
  title,
  subtitle,
  color = "#3B82F6",
  action,
}: {
  title: string;
  subtitle?: string;
  color?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div
          className="w-1 h-6 rounded-full"
          style={{ backgroundColor: color }}
        />
        <div>
          <h2 className="text-base font-black text-gray-900">{title}</h2>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────────────────────
export default function MainPage({ onSelectPlayer }: MainPageProps) {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [games, setGames] = useState<GameInfo[]>([]);
  const [displayDate, setDisplayDate] = useState(todayStr);
  const [standings, setStandings] = useState<LeagueStanding[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [standingsLoading, setStandingsLoading] = useState(true);
  const [showAllStandings, setShowAllStandings] = useState(false);
  const [activeNewsTab, setActiveNewsTab] = useState<NewsCategory>("전체");
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState(false);
  const [newsVisible, setNewsVisible] = useState(5);
  const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null);
  const [gameScore, setGameScore] = useState<GameScore | null>(null);
  const [scoreLoading, setScoreLoading] = useState(false);

  const dateTabs = buildDateTabs();

  const handleSelectPlayer = (pid: number) => {
    if (onSelectPlayer) {
      onSelectPlayer(pid);
    } else {
      navigate("/player", { state: { pid } });
    }
  };

  const [pendingGame, setPendingGame] = useState<GameInfo | null>(null); // 로딩 중 대기 게임

  const handleGameClick = async (game: GameInfo) => {
    // 취소 경기
    if (game.cancel) {
      setGameScore(null);
      setSelectedGame(game);
      return;
    }
    // 로딩 시작 — 모달은 아직 열지 않음 (카드에 스피너)
    setPendingGame(game);
    setGameScore(null);
    setScoreLoading(true);
    try {
      const score = await fetchGameScore(game.gameId);
      setGameScore(score);
    } catch {
      // fetch 실패해도 모달 표시
    } finally {
      setScoreLoading(false);
      setSelectedGame(game); // 로드 완료 후 모달 오픈
      setPendingGame(null);
    }
  };

  // 경기 로드
  useEffect(() => {
    const load = async (silent = false): Promise<GameInfo[]> => {
      if (!silent) setGamesLoading(true);
      try {
        let data = await fetchGamesByDate(selectedDate);
        if (data.length === 0 && selectedDate === todayStr) {
          const recent = await fetchRecentGames();
          if (recent.length > 0) {
            data = recent;
            setDisplayDate(recent[0].gameDate);
          } else {
            const upcoming = await fetchUpcomingGames();
            data = upcoming;
            if (upcoming.length > 0) setDisplayDate(upcoming[0].gameDate);
          }
        } else {
          setDisplayDate(selectedDate);
        }
        setGames(data);
        return data;
      } catch (e) {
        console.error("경기 로드 실패:", e);
        if (!silent) setGames([]);
        return [];
      } finally {
        if (!silent) setGamesLoading(false);
      }
    };

    let interval: ReturnType<typeof setInterval> | null = null;
    load();
    // 오늘 탭이면 항상 30초 폴링 — BEFORE일 때도 LIVE 전환 감지
    if (selectedDate === todayStr) {
      interval = setInterval(() => load(true), 30_000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedDate]);

  // 순위 로드
  useEffect(() => {
    fetchStandings(2026)
      .then(setStandings)
      .catch(console.error)
      .finally(() => setStandingsLoading(false));
  }, []);

  // 뉴스 로드 — 마운트 시 한 번만 fetch
  useEffect(() => {
    setNewsLoading(true);
    setNewsError(false);
    fetchNews()
      .then(setNewsList)
      .catch(() => setNewsError(true))
      .finally(() => setNewsLoading(false));
  }, []);

  const displayedStandings = showAllStandings
    ? standings
    : standings.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-10">
      {selectedGame && (
        <LineScoreModal
          game={selectedGame}
          score={gameScore}
          loading={scoreLoading}
          onClose={() => setSelectedGame(null)}
          onSelectPlayer={handleSelectPlayer}
        />
      )}

      {/* ══ 섹션 1: 경기 일정 / 결과 */}
      <section>
        <SectionHeader
          title="경기 일정 & 결과"
          subtitle={`KBO 2026 시즌 · ${formatGameDate(displayDate)}`}
          color="#EF4444"
        />
        <div
          className="flex gap-1.5 mb-4 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {dateTabs.map((tab) => (
            <button
              key={tab.dateStr}
              onClick={() => setSelectedDate(tab.dateStr)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                selectedDate === tab.dateStr
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {tab.label}
              {tab.isToday && selectedDate === tab.dateStr && (
                <span className="ml-1 text-red-400 text-xs">●</span>
              )}
            </button>
          ))}
        </div>
        {gamesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-44 bg-gray-100 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">⚾</p>
            <p className="text-gray-400 text-sm font-medium">
              해당 날짜에 경기가 없습니다
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {games.map((g) => (
              <div key={g.gameId} className="relative">
                <GameCard
                  game={g}
                  onClick={() => {
                    if (!pendingGame) handleGameClick(g);
                  }}
                />
                {pendingGame?.gameId === g.gameId && (
                  <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center z-10">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══ 섹션 2: 리그 순위 */}
      <section>
        <SectionHeader title="리그 순위" subtitle="2026 KBO" color="#F59E0B" />
        {standingsLoading ? (
          <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
        ) : (
          <>
            <StandingsTable
              standings={displayedStandings}
              onTeamClick={(teamName) => {
                const ID_MAP: Record<string, string> = {
                  LG: "lg",
                  KT: "kt",
                  SSG: "ssg",
                  NC: "nc",
                  두산: "doosan",
                  KIA: "kia",
                  롯데: "lotte",
                  삼성: "samsung",
                  한화: "hanwha",
                  키움: "kiwoom",
                };
                const id = ID_MAP[teamName];
                if (id) navigate("/team", { state: { teamId: id } });
              }}
            />
            <button
              onClick={() => setShowAllStandings((v) => !v)}
              className="w-full mt-2 py-2.5 text-xs font-bold text-gray-400 hover:text-gray-600 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              {showAllStandings ? "접기 ▲" : "전체 보기 ▼"}
            </button>
          </>
        )}
      </section>

      {/* ══ 섹션 3: 야구 뉴스 */}
      <section>
        <SectionHeader
          title="야구 뉴스"
          subtitle="최신 KBO 소식 · 네이버 뉴스"
          color="#3B82F6"
        />
        {/* 카테고리 탭 */}
        <div
          className="flex gap-1.5 mb-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {NEWS_CATEGORIES.map((cat) => {
            const count =
              cat === "전체"
                ? newsList.length
                : newsList.filter((n) => n.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveNewsTab(cat);
                  setNewsVisible(5);
                }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                  activeNewsTab === cat
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {cat}
                {!newsLoading && count > 0 && (
                  <span
                    className={`text-[10px] px-1 rounded-full ${activeNewsTab === cat ? "bg-white/30 text-white" : "bg-gray-100 text-gray-400"}`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 뉴스 목록 */}
        {newsLoading ? (
          <div className="space-y-2.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : newsError ? (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-400 text-sm">뉴스를 불러오지 못했습니다</p>
          </div>
        ) : (
          (() => {
            const filtered = filterNewsByCategory(newsList, activeNewsTab);
            const visible = filtered.slice(0, newsVisible);
            const hasMore = filtered.length > newsVisible;
            return (
              <>
                <div className="space-y-2.5">
                  {visible.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
                      <p className="text-gray-400 text-sm">
                        해당 카테고리 기사가 없습니다
                      </p>
                    </div>
                  ) : (
                    visible.map((news, i) => <NewsCard key={i} news={news} />)
                  )}
                </div>
                {hasMore && (
                  <button
                    onClick={() => setNewsVisible((v) => v + 5)}
                    className="w-full mt-3 py-2.5 text-xs font-bold text-gray-400 hover:text-gray-600 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    더 보기 ({filtered.length - newsVisible}개 남음) ▼
                  </button>
                )}
              </>
            );
          })()
        )}
      </section>

      {/* ══ 섹션 4: 야구 유튜브 */}
      <section>
        <SectionHeader
          title="야구 유튜브"
          subtitle="채널 바로가기"
          color="#CC0000"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {YOUTUBE_CHANNELS.map((ch) => (
            <a
              key={ch.name}
              href={ch.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all text-center group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
                style={{ backgroundColor: ch.color + "15" }}
              >
                {ch.emoji}
              </div>
              <p className="text-sm font-black text-gray-800">{ch.name}</p>
              <p className="text-xs text-gray-400 leading-tight">{ch.desc}</p>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: ch.color }}
              >
                YouTube
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ══ 섹션 5: 중계 사이트 */}
      <section>
        <SectionHeader
          title="중계 사이트"
          subtitle="KBO 시청 방법"
          color="#10B981"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BROADCAST_SITES.map((site) => (
            <a
              key={site.name}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform flex-shrink-0">
                {site.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-800">{site.name}</p>
                  <span
                    className="text-[10px] font-black px-1.5 py-0.5 rounded-full text-white flex-shrink-0"
                    style={{ backgroundColor: site.badgeColor }}
                  >
                    {site.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {site.desc}
                </p>
              </div>
              <span className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0">
                →
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ══ 섹션 7: 커뮤니티 */}
      <section>
        <SectionHeader
          title="야구 커뮤니티"
          subtitle="팬들의 이야기"
          color="#F97316"
        />
        <div className="flex flex-wrap gap-2">
          {COMMUNITY_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 hover:border-orange-300 hover:text-orange-600 hover:shadow-sm transition-all"
            >
              <span>{link.emoji}</span>
              {link.name}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
