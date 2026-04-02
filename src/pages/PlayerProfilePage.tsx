// 선수 프로필 페이지 - 상태관리 + 컴포넌트 조합만 담당
import { useState, useEffect, useMemo } from "react";
import PlayerSearchBar from "@/components/common/PlayerSearchBar";
import PlayerHeroBanner from "@/components/profile/PlayerHeroBanner";
import HotColdTab from "@/components/profile/Hitter/HotCold/HotColdTab";
import PitchZoneTab from "@/components/profile/Pitcher/PitchZone/PitchZoneTab";
import HitterStatcastTab from "@/components/profile/Hitter/Statcast/HitterStatcastTab";
import PitcherStatcastTab from "@/components/profile/Pitcher/Statcast/PitcherStatcastTab";
import { TEAM_COLORS } from "@/constants/teamColors";
import {
  searchPlayersByName,
  fetchHitterStats,
  fetchPitcherStats,
  fetchHitterRadar,
  fetchPitcherRadar,
  fetchPlayerChart,
} from "@/api/playerApi";
import type {
  HitterRadar,
  PitcherRadar,
  PlayerChartResponse,
  ZoneGrid,
} from "@/api/playerApi";
import { isPitcher, fmtAvg, fmtEra, fmtWhip } from "@/utils/playerUtils";
import type { HitterStat, PitcherStat } from "@/types/playerStats";

// ─────────────────────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────────────────────
export default function PlayerProfilePage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [playerBasic, setPlayerBasic] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // ── 시즌 스탯 ────────────────────────────────────────────
  const [hitterStats, setHitterStats] = useState<HitterStat[]>([]);
  const [pitcherStats, setPitcherStats] = useState<PitcherStat[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // ── 레이더 ───────────────────────────────────────────────
  const [radarData, setRadarData] = useState<HitterRadar | PitcherRadar | null>(
    null,
  );
  const [radarLoading, setRadarLoading] = useState(false);

  // ── 차트 (HOT/COLD ZONE, 투구분포도, 타구방향) ───────────
  const [chartData, setChartData] = useState<PlayerChartResponse | null>(null);
  const [chartLoading, setChartLoading] = useState(false);

  // ── 선수 변경 시 스탯 + 레이더 + 차트 API 동시 호출 ──────
  useEffect(() => {
    if (!playerBasic) return;

    const pid = playerBasic.pid as number;
    const pitcherType = isPitcher(playerBasic.playerMPosition);

    // ── 스탯 초기화 + 로드 ──────────────────────────────
    setHitterStats([]);
    setPitcherStats([]);
    setStatsError(null);
    setStatsLoading(true);

    const statFetcher = pitcherType ? fetchPitcherStats : fetchHitterStats;
    statFetcher(pid)
      .then((data: any[]) => {
        if (pitcherType) setPitcherStats(data);
        else setHitterStats(data);
      })
      .catch((err: any) =>
        setStatsError(err?.message ?? "스탯 데이터를 불러오지 못했습니다."),
      )
      .finally(() => setStatsLoading(false));

    // ── 레이더 초기화 + 로드 ─────────────────────────────
    setRadarData(null);
    setRadarLoading(true);

    const radarFetcher = pitcherType ? fetchPitcherRadar : fetchHitterRadar;
    radarFetcher(pid)
      .then((data) => setRadarData(data))
      .catch(() => setRadarData(null))
      .finally(() => setRadarLoading(false));

    // ── 차트 초기화 + 로드 ───────────────────────────────
    setChartData(null);
    setChartLoading(true);

    fetchPlayerChart(pid)
      .then((data) => setChartData(data))
      .catch(() => setChartData(null))
      .finally(() => setChartLoading(false));
  }, [playerBasic]);

  // ── 차트 데이터 resolve: 실패 시 null ────────────────────
  const resolvedHotColdData = useMemo(() => {
    const h = chartData?.hitter;
    if (!h) return null;
    return {
      outer: h.hotCold.outer,
      inner: h.hotCold.inner,
      strikeout: {
        outer: h.strikeout.outer,
        inner: h.strikeout.inner,
      },
      hitDistrib: {
        LF: h.hitDistrib.lf,
        CF: h.hitDistrib.cf,
        RF: h.hitDistrib.rf,
      },
    };
  }, [chartData]);

  const resolvedPitchZone = useMemo<ZoneGrid | null>(() => {
    return chartData?.pitcher?.pitchZone ?? null;
  }, [chartData]);

  const resolvedStrikeoutZone = useMemo<ZoneGrid | null>(() => {
    return chartData?.pitcher?.strikeoutZone ?? null;
  }, [chartData]);

  const resolvedHitDistrib = useMemo(() => {
    const h = chartData?.hitter;
    if (!h) return undefined;
    return {
      LF: h.hitDistrib.lf,
      CF: h.hitDistrib.cf,
      RF: h.hitDistrib.rf,
    };
  }, [chartData]);

  const chartSource = chartLoading ? "loading" : chartData ? "db" : null;

  // ─────────────────────────────────────────────────────────
  // 검색 핸들러
  // ─────────────────────────────────────────────────────────
  const handleSearch = async () => {
    const name = searchInput.trim();
    if (!name) return;
    setSearchLoading(true);
    setShowResults(false);
    setError(null);
    try {
      const results = await searchPlayersByName(name);
      if (results.length === 0)
        setError(`"${name}" 에 해당하는 선수가 없습니다.`);
      else if (results.length === 1) {
        setPlayerBasic(results[0]);
      } else {
        setSearchResults(results);
        setShowResults(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectPlayer = (p: any) => {
    setPlayerBasic(p);
    setShowResults(false);
    setSearchResults([]);
    setSearchInput(p.playerName);
    setError(null);
  };

  const handleBack = () => {
    setPlayerBasic(null);
    setSearchInput("");
    setError(null);
    setShowResults(false);
    setHitterStats([]);
    setPitcherStats([]);
    setRadarData(null);
    setChartData(null);
  };

  // ─────────────────────────────────────────────────────────
  // 초기 검색 화면
  // ─────────────────────────────────────────────────────────
  if (!playerBasic) {
    return (
      <PlayerSearchBar
        searchInput={searchInput}
        searchLoading={searchLoading}
        searchResults={searchResults}
        showResults={showResults}
        error={error}
        compact={false}
        onChange={(v) => {
          setSearchInput(v);
          setShowResults(false);
        }}
        onSearch={handleSearch}
        onSelect={handleSelectPlayer}
      />
    );
  }

  // ─────────────────────────────────────────────────────────
  // 선수 정보 파싱
  // ─────────────────────────────────────────────────────────
  const tc = TEAM_COLORS[playerBasic.playerEnter] ?? {
    bg: "#1e293b",
    accent: "#64748b",
  };
  const pitcher = isPitcher(playerBasic.playerMPosition);
  const heroAccent = pitcher ? "#F97316" : "#3B82F6";

  const hwRaw = playerBasic.heightWeight ?? "";
  const hwParts = hwRaw.split("/");
  const heightNum = hwParts[0]?.replace(/[^0-9]/g, "") ?? "-";
  const weightNum = hwParts[1]?.replace(/[^0-9]/g, "") ?? "-";
  const hwStr =
    heightNum !== "-" && weightNum !== "-"
      ? `${heightNum}cm / ${weightNum}kg`
      : hwRaw || "-";
  const salaryStr = playerBasic.playerSalary
    ? `${(playerBasic.playerSalary / 100000000).toFixed(0)}억`
    : "-";
  const ageStr = playerBasic.playerBirthday
    ? `${new Date().getFullYear() - new Date(playerBasic.playerBirthday).getFullYear()}세`
    : "-";

  const latestHitter =
    hitterStats.length > 0
      ? [...hitterStats].sort((a, b) => b.season - a.season)[0]
      : null;
  const latestPitcher =
    pitcherStats.length > 0
      ? [...pitcherStats].sort((a, b) => b.season - a.season)[0]
      : null;

  const heroBadges = pitcher
    ? [
        {
          label: "ERA",
          val: latestPitcher
            ? fmtEra(latestPitcher.era)
            : statsLoading
              ? "..."
              : "-",
          color: "#F97316",
        },
        {
          label: "W-L",
          val: latestPitcher
            ? `${latestPitcher.w}-${latestPitcher.l}`
            : statsLoading
              ? "..."
              : "-",
          color: "#10B981",
        },
        {
          label: "WHIP",
          val: latestPitcher
            ? fmtWhip(latestPitcher.whip)
            : statsLoading
              ? "..."
              : "-",
          color: "#8B5CF6",
        },
      ]
    : [
        {
          label: "AVG",
          val: latestHitter
            ? fmtAvg(latestHitter.avg)
            : statsLoading
              ? "..."
              : "-",
          color: "#3B82F6",
        },
        {
          label: "HR",
          val: latestHitter
            ? String(latestHitter.hr)
            : statsLoading
              ? "..."
              : "-",
          color: "#EF4444",
        },
        {
          label: "RBI",
          val: latestHitter
            ? String(latestHitter.rbi)
            : statsLoading
              ? "..."
              : "-",
          color: "#F59E0B",
        },
      ];

  const bgGradient = `linear-gradient(160deg, ${tc.bg} 0%, ${
    tc.accent === "#000000" ? "#1e1e2e" : tc.accent
  } 55%, #0f0f1a 100%)`;

  // ─────────────────────────────────────────────────────────
  // 렌더링
  // ─────────────────────────────────────────────────────────
  return (
    <div>
      {/* 상단 검색창 */}
      <PlayerSearchBar
        searchInput={searchInput}
        searchLoading={searchLoading}
        searchResults={searchResults}
        showResults={showResults}
        compact={true}
        currentPlayerName={playerBasic.playerName}
        heroAccent={heroAccent}
        isPitcherPlayer={pitcher}
        onChange={(v) => {
          setSearchInput(v);
          setShowResults(false);
        }}
        onSearch={handleSearch}
        onSelect={handleSelectPlayer}
        onBack={handleBack}
      />

      {/* 히어로 배너 (레이더 차트 포함) */}
      <PlayerHeroBanner
        playerBasic={playerBasic}
        bgGradient={bgGradient}
        heroAccent={heroAccent}
        isPitcherPlayer={pitcher}
        hwStr={hwStr}
        ageStr={ageStr}
        salaryStr={salaryStr}
        heroBadges={heroBadges}
        radarData={radarData}
        radarLoading={radarLoading}
      />

      {/* 콘텐츠 */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-10">
        {pitcher ? (
          <>
            {/* 스탯캐스트 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-5 rounded-full bg-orange-400 inline-block" />
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  스탯캐스트
                </h2>
              </div>
              <PitcherStatcastTab stats={pitcherStats} />
            </section>

            {/* 투구존 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-5 rounded-full bg-orange-400 inline-block" />
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  투구존
                </h2>
              </div>
              {chartLoading ? (
                <div className="text-center py-16 text-gray-400 text-sm">
                  차트 로딩 중...
                </div>
              ) : resolvedPitchZone && resolvedStrikeoutZone ? (
                <PitchZoneTab
                  pitchZone={resolvedPitchZone}
                  strikeoutZone={resolvedStrikeoutZone}
                  dataSource="db"
                />
              ) : (
                <div className="text-center py-16 text-gray-300 text-sm">
                  투구존 데이터가 없습니다.
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            {/* 스탯캐스트 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-5 rounded-full bg-blue-400 inline-block" />
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  스탯캐스트
                </h2>
              </div>
              <HitterStatcastTab
                stats={hitterStats}
                hitDistrib={resolvedHitDistrib}
              />
            </section>

            {/* 핫/콜드존 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-5 rounded-full bg-blue-400 inline-block" />
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  핫/콜드존
                </h2>
              </div>
              {chartLoading ? (
                <div className="text-center py-16 text-gray-400 text-sm">
                  차트 로딩 중...
                </div>
              ) : resolvedHotColdData ? (
                <HotColdTab data={resolvedHotColdData} dataSource="db" />
              ) : (
                <div className="text-center py-16 text-gray-300 text-sm">
                  핫/콜드존 데이터가 없습니다.
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
