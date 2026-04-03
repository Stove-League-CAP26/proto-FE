// 선수 프로필 페이지 - 상태관리 + 컴포넌트 조합만 담당
import { useState, useEffect } from "react";
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
} from "@/api/playerApi";
import {
  fetchHotColdZone,
  fetchStrikeoutZone,
  fetchHitDirection,
  fetchPitchZone,
  fetchKsZone,
  fetchBaZone,
} from "@/api/chartApi";
import type { ZoneGrid, HitDirection } from "@/api/chartApi";
import type { HitterRadar, PitcherRadar } from "@/api/playerApi";
import { isPitcher, fmtAvg, fmtEra, fmtWhip } from "@/utils/playerUtils";
import type { HitterStat, PitcherStat } from "@/types/playerStats";

export default function PlayerProfilePage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [playerBasic, setPlayerBasic] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // ── 시즌 스탯 ────────────────────────────────────────────────────────────
  const [hitterStats, setHitterStats] = useState<HitterStat[]>([]);
  const [pitcherStats, setPitcherStats] = useState<PitcherStat[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── 레이더 ───────────────────────────────────────────────────────────────
  const [radarData, setRadarData] = useState<HitterRadar | PitcherRadar | null>(
    null,
  );
  const [radarLoading, setRadarLoading] = useState(false);

  // ── 차트 (존별 개별 상태) ────────────────────────────────────────────────
  const [hotColdZone, setHotColdZone] = useState<ZoneGrid | null>(null);
  const [strikeoutZone, setStrikeoutZone] = useState<ZoneGrid | null>(null);
  const [hitDirection, setHitDirection] = useState<HitDirection | null>(null);
  const [pitchZone, setPitchZone] = useState<ZoneGrid | null>(null);
  const [ksZone, setKsZone] = useState<ZoneGrid | null>(null);
  const [baZone, setBaZone] = useState<ZoneGrid | null>(null);
  const [chartLoading, setChartLoading] = useState(false);

  // ── 선수 변경 시 API 동시 호출 ───────────────────────────────────────────
  useEffect(() => {
    if (!playerBasic) return;

    const pid = playerBasic.pid as number;
    const pitcherType = isPitcher(playerBasic.playerMPosition);

    // 스탯
    setHitterStats([]);
    setPitcherStats([]);
    setStatsLoading(true);
    const statFetcher = pitcherType ? fetchPitcherStats : fetchHitterStats;
    statFetcher(pid)
      .then((data: any[]) => {
        if (pitcherType) setPitcherStats(data);
        else setHitterStats(data);
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));

    // 레이더
    setRadarData(null);
    setRadarLoading(true);
    const radarFetcher = pitcherType ? fetchPitcherRadar : fetchHitterRadar;
    radarFetcher(pid)
      .then(setRadarData)
      .catch(() => setRadarData(null))
      .finally(() => setRadarLoading(false));

    // 차트 — 타자/투수에 따라 필요한 존만 호출
    setHotColdZone(null);
    setStrikeoutZone(null);
    setHitDirection(null);
    setPitchZone(null);
    setKsZone(null);
    setBaZone(null);
    setChartLoading(true);

    if (pitcherType) {
      Promise.all([fetchPitchZone(pid), fetchKsZone(pid), fetchBaZone(pid)])
        .then(([pitch, ks, ba]) => {
          setPitchZone(pitch);
          setKsZone(ks);
          setBaZone(ba);
        })
        .finally(() => setChartLoading(false));
    } else {
      Promise.all([
        fetchHotColdZone(pid),
        fetchStrikeoutZone(pid),
        fetchHitDirection(pid),
      ])
        .then(([hc, so, dir]) => {
          setHotColdZone(hc);
          setStrikeoutZone(so);
          setHitDirection(dir);
        })
        .finally(() => setChartLoading(false));
    }
  }, [playerBasic]);

  // ── 검색 핸들러 ──────────────────────────────────────────────────────────
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
      else if (results.length === 1) setPlayerBasic(results[0]);
      else {
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
    setHotColdZone(null);
    setStrikeoutZone(null);
    setHitDirection(null);
    setPitchZone(null);
    setKsZone(null);
    setBaZone(null);
  };

  // ── 초기 검색 화면 ───────────────────────────────────────────────────────
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

  // ── 선수 정보 파싱 ───────────────────────────────────────────────────────
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

  // HotColdTab용 data 조합
  const hotColdTabData =
    hotColdZone && strikeoutZone
      ? {
          outer: hotColdZone.outer,
          inner: hotColdZone.inner,
          strikeout: strikeoutZone,
          hitDistrib: hitDirection
            ? { LF: hitDirection.lf, CF: hitDirection.cf, RF: hitDirection.rf }
            : { LF: "-", CF: "-", RF: "-" },
        }
      : null;

  // HitterStatcastTab용 hitDistrib
  const resolvedHitDistrib = hitDirection
    ? { LF: hitDirection.lf, CF: hitDirection.cf, RF: hitDirection.rf }
    : undefined;

  // ── 렌더링 ───────────────────────────────────────────────────────────────
  return (
    <div>
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

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-10">
        {pitcher ? (
          <>
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-5 rounded-full bg-orange-400 inline-block" />
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  스탯캐스트
                </h2>
              </div>
              <PitcherStatcastTab pid={playerBasic.pid} stats={pitcherStats} />
            </section>

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
              ) : pitchZone && ksZone ? (
                <PitchZoneTab
                  pitchZone={pitchZone}
                  strikeoutZone={ksZone}
                  baZone={baZone ?? undefined}
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
              ) : hotColdTabData ? (
                <HotColdTab data={hotColdTabData} dataSource="db" />
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
