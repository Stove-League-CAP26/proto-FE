// src/pages/MainPage.tsx
// 메인 페이지 — 경기일정 / 리그순위 / 뉴스 / 유튜브 / 중계사이트

import { useState, useEffect } from "react";
import { TEAM_COLORS } from "@/constants/teamColors";
import {
  fetchGamesByDate,
  fetchRecentGames,
  fetchUpcomingGames,
  fetchStandings,
  formatGameTime,
  formatGameDate,
  getStatusLabel,
  type GameInfo,
  type LeagueStanding,
} from "@/api/gameApi";
import {
  MOCK_NEWS,
  YOUTUBE_CHANNELS,
  TEAM_FAN_CHANNELS,
  BROADCAST_SITES,
  COMMUNITY_LINKS,
} from "@/mock/homeData";

// ── Props ─────────────────────────────────────────────────────────────────────
// (현재 사용 props 없음 — 향후 확장용으로 유지)
interface MainPageProps {}

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
    const label =
      i === -1
        ? "어제"
        : i === 0
          ? "오늘"
          : i === 1
            ? "내일"
            : i === -2
              ? `${d.getMonth() + 1}/${d.getDate()}(${days[d.getDay()]})`
              : `${d.getMonth() + 1}/${d.getDate()}(${days[d.getDay()]})`;
    tabs.push({ dateStr, label, isToday: i === 0 });
  }
  return tabs;
}

// ── 팀 코드 → 한글 팀명 매핑 (순위표 팀명과 일치용) ──────────────────────────
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

// ── 경기 카드 ─────────────────────────────────────────────────────────────────
function GameCard({ game }: { game: GameInfo }) {
  const homeTeamName =
    TEAM_CODE_TO_NAME[game.homeTeamCode] ?? game.homeTeamName;
  const awayTeamName =
    TEAM_CODE_TO_NAME[game.awayTeamCode] ?? game.awayTeamName;
  const homeColor = TEAM_COLORS[homeTeamName]?.bg ?? "#334155";
  const awayColor = TEAM_COLORS[awayTeamName]?.bg ?? "#334155";

  const isResult = game.statusCode === "RESULT";
  const isLive = game.statusCode === "LIVE";
  const isCancel = game.cancel;
  const homeWin = game.winner === "HOME";
  const awayWin = game.winner === "AWAY";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* 상태 & 구장 */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <span className="text-[10px] text-gray-400 truncate max-w-[70%]">
          {game.stadium}
        </span>
        {isLive ? (
          <span className="flex items-center gap-1 text-[10px] font-black text-red-500 animate-pulse flex-shrink-0">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            LIVE
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

      {/* 원정 vs 홈 */}
      <div className="flex items-center px-3 py-2 gap-2 flex-1">
        {/* 원정팀 */}
        <div
          className={`flex-1 flex flex-col items-center gap-1 ${
            isResult && !awayWin ? "opacity-40" : ""
          }`}
        >
          {/* 원정팀 이미지 */}
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
              className={`text-xl font-black leading-none ${
                awayWin ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {game.awayTeamScore}
            </span>
          )}
        </div>

        <span className="text-xs font-bold text-gray-200">VS</span>

        {/* 홈팀 */}
        <div
          className={`flex-1 flex flex-col items-center gap-1 ${
            isResult && !homeWin ? "opacity-40" : ""
          }`}
        >
          {/* 홈팀 이미지 */}
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
              className={`text-xl font-black leading-none ${
                homeWin ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {game.homeTeamScore}
            </span>
          )}
        </div>
      </div>

      {/* 결과 배지 */}
      {isResult && game.winner !== "DRAW" && (
        <div
          className="mx-3 mb-2 rounded-lg py-1 text-center text-[10px] font-black text-white"
          style={{ backgroundColor: homeWin ? homeColor : awayColor }}
        >
          {homeWin ? homeTeamName : awayTeamName} 승리
        </div>
      )}
      {isResult && game.winner === "DRAW" && (
        <div className="mx-3 mb-2 rounded-lg py-1 text-center text-[10px] font-bold text-gray-500 bg-gray-100">
          무승부
        </div>
      )}

      {/* 승/패 투수 (결과 경기) */}
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

      {/* 선발 투수 (예정 경기) */}
      {!isResult && !isCancel && game.homeStarterName && (
        <div className="flex justify-between mx-3 mb-2 text-[10px] text-gray-400 border-t pt-1.5">
          <span>{game.awayStarterName || "-"}</span>
          <span className="text-gray-300">선발</span>
          <span>{game.homeStarterName || "-"}</span>
        </div>
      )}

      {/* 중계 채널 */}
      {game.broadChannel && (
        <div className="text-center text-[10px] text-gray-400 mb-2.5 px-2">
          📺 {game.broadChannel.replace("^", " / ")}
        </div>
      )}

      {/* 예정 시간 (중계 없을 때) */}
      {!isResult && !isCancel && !game.broadChannel && (
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
                  className={`border-t border-gray-50 transition-colors ${
                    onTeamClick
                      ? "cursor-pointer hover:bg-amber-50/40"
                      : "hover:bg-gray-50/40"
                  }`}
                  onClick={() => onTeamClick?.(s.teamName)}
                >
                  {/* 순위 */}
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

                  {/* 팀 */}
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
                      {/* 이미지 로드 실패 시 fallback */}
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

                  {/* 경기수 */}
                  <td className="px-3 py-2.5 text-center text-xs text-gray-400">
                    {s.totalGames}
                  </td>

                  {/* 승 */}
                  <td className="px-3 py-2.5 text-center text-sm font-bold text-blue-600">
                    {s.wins}
                  </td>

                  {/* 패 */}
                  <td className="px-3 py-2.5 text-center text-sm font-bold text-red-500">
                    {s.losses}
                  </td>

                  {/* 무 */}
                  <td className="px-3 py-2.5 text-center text-xs text-gray-400">
                    {s.draws}
                  </td>

                  {/* 승률 */}
                  <td className="px-3 py-2.5 text-center text-sm font-black text-gray-800">
                    {s.winPct != null ? s.winPct.toFixed(3) : "-"}
                  </td>

                  {/* GB */}
                  <td className="px-3 py-2.5 text-center text-xs text-gray-400">
                    {s.gamesBehind === 0
                      ? "-"
                      : (s.gamesBehind?.toFixed(1) ?? "-")}
                  </td>

                  {/* 연속 */}
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

                  {/* 팀 타율 */}
                  <td className="px-3 py-2.5 text-center text-xs font-bold text-blue-500 hidden md:table-cell">
                    {s.teamAvg != null ? s.teamAvg.toFixed(3) : "-"}
                  </td>

                  {/* 팀 ERA */}
                  <td className="px-3 py-2.5 text-center text-xs font-bold text-orange-500 hidden md:table-cell">
                    {s.teamEra != null ? s.teamEra.toFixed(2) : "-"}
                  </td>

                  {/* 최근 5경기 */}
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
  선수: "#10B981",
  팀소식: "#F59E0B",
  예고: "#8B5CF6",
  리그: "#EF4444",
};
function NewsCard({ news }: { news: (typeof MOCK_NEWS)[0] }) {
  const catColor = CATEGORY_COLOR[news.category] ?? "#64748b";
  return (
    <a
      href={news.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div
        className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl"
        style={{ backgroundColor: catColor + "15" }}
      >
        ⚾
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: catColor + "15", color: catColor }}
          >
            {news.category}
          </span>
          <span className="text-[10px] text-gray-300">{news.source}</span>
        </div>
        <p className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">
          {news.title}
        </p>
        <p className="text-xs text-gray-400 mt-1">{news.date}</p>
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
export default function MainPage({}: MainPageProps) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [games, setGames] = useState<GameInfo[]>([]);
  const [displayDate, setDisplayDate] = useState(todayStr);
  const [standings, setStandings] = useState<LeagueStanding[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [standingsLoading, setStandingsLoading] = useState(true);
  const [activeNewsTab, setActiveNewsTab] = useState<string>("전체");
  const [showAllStandings, setShowAllStandings] = useState(false);

  const dateTabs = buildDateTabs();

  // 경기 로드 — 오늘 경기 없으면 자동으로 최근/예정 표시
  useEffect(() => {
    const load = async () => {
      setGamesLoading(true);
      try {
        let data = await fetchGamesByDate(selectedDate);

        if (data.length === 0 && selectedDate === todayStr) {
          // 오늘 경기 없음 → 최근 결과
          const recent = await fetchRecentGames();
          if (recent.length > 0) {
            data = recent;
            setDisplayDate(recent[0].gameDate);
          } else {
            // 최근 결과도 없음 → 다음 예정
            const upcoming = await fetchUpcomingGames();
            data = upcoming;
            if (upcoming.length > 0) setDisplayDate(upcoming[0].gameDate);
          }
        } else {
          setDisplayDate(selectedDate);
        }

        setGames(data);
      } catch (e) {
        console.error("경기 로드 실패:", e);
        setGames([]);
      } finally {
        setGamesLoading(false);
      }
    };
    load();
  }, [selectedDate]);

  // 순위 로드
  useEffect(() => {
    fetchStandings(2026)
      .then(setStandings)
      .catch(console.error)
      .finally(() => setStandingsLoading(false));
  }, []);

  const newsCategories = [
    "전체",
    ...Array.from(new Set(MOCK_NEWS.map((n) => n.category))),
  ];
  const filteredNews =
    activeNewsTab === "전체"
      ? MOCK_NEWS
      : MOCK_NEWS.filter((n) => n.category === activeNewsTab);
  const displayedStandings = showAllStandings
    ? standings
    : standings.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-10">
      {/* ══ 섹션 1: 경기 일정 / 결과 ══════════════════════════════════════════ */}
      <section>
        <SectionHeader
          title="경기 일정 & 결과"
          subtitle={`KBO 2026 시즌 · ${formatGameDate(displayDate)}`}
          color="#EF4444"
        />

        {/* 날짜 탭 */}
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
              <GameCard key={g.gameId} game={g} />
            ))}
          </div>
        )}
      </section>

      {/* ══ 섹션 2: 리그 순위 ════════════════════════════════════════════════ */}
      <section>
        <SectionHeader title="리그 순위" subtitle="2026 KBO" color="#F59E0B" />
        {standingsLoading ? (
          <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
        ) : (
          <>
            <StandingsTable standings={displayedStandings} />
            <button
              onClick={() => setShowAllStandings((v) => !v)}
              className="w-full mt-2 py-2.5 text-xs font-bold text-gray-400 hover:text-gray-600 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              {showAllStandings ? "접기 ▲" : "전체 보기 ▼"}
            </button>
          </>
        )}
      </section>

      {/* ══ 섹션 3: 야구 뉴스 ════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          title="야구 뉴스"
          subtitle="최신 KBO 소식"
          color="#3B82F6"
        />
        <div
          className="flex gap-1.5 mb-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {newsCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveNewsTab(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeNewsTab === cat
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="space-y-2.5">
          {filteredNews.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>
      </section>

      {/* ══ 섹션 4: 야구 유튜브 ══════════════════════════════════════════════ */}
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

      {/* ══ 섹션 5: 팀별 편파 채널 ══════════════════════════════════════════ */}
      <section>
        <SectionHeader
          title="팀별 편파 채널"
          subtitle="팬들의 편파 해설"
          color="#8B5CF6"
        />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.entries(TEAM_FAN_CHANNELS).map(([team, ch]) => {
            const tc = TEAM_COLORS[team];
            return (
              <a
                key={team}
                href={ch.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white rounded-xl border border-gray-100 shadow-sm px-3 py-2.5 hover:shadow-md transition-all"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                  style={{ backgroundColor: tc?.bg ?? "#64748b" }}
                >
                  {team.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-700 truncate">
                    {ch.name}
                  </p>
                  <p className="text-[10px] text-gray-400">{ch.emoji}</p>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* ══ 섹션 6: 중계 사이트 ══════════════════════════════════════════════ */}
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

      {/* ══ 섹션 7: 커뮤니티 ════════════════════════════════════════════════ */}
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
