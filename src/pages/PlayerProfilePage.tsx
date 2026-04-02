// 선수 프로필 페이지 - 상태관리 + 컴포넌트 조합만 담당
// 차트 데이터(HOT/COLD ZONE, 투구분포도, 타구방향)는
//   GET /api/players/{pid}/chart → 실패 시 MOCK fallback 자동 적용
import { useState, useEffect, useMemo } from "react";
import PlayerSearchBar from "@/components/profile/PlayerSearchBar";
import PlayerHeroBanner from "@/components/profile/PlayerHeroBanner";
import HotColdTab from "@/components/profile/Hitter/HotColdTab";
import PitchZoneTab from "@/components/profile/Pitcher/PitchZoneTab";
import HitterStatcastTab from "@/components/profile/Hitter/HitterStatcastTab";
import PitcherStatcastTab from "@/components/profile/Pitcher/PitcherStatcastTab";
import { TEAM_COLORS } from "@/constants/teamColors";
import { MOCK_HOT_COLD, MOCK_PITCH_ZONE } from "@/mock/statsData";
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
// MOCK fallback — 차트 API 실패 시 사용
// ─────────────────────────────────────────────────────────────
const FALLBACK_HOT_COLD_DATA = {
  outer: MOCK_HOT_COLD.outer,
  inner: MOCK_HOT_COLD.inner,
  strikeout: MOCK_HOT_COLD.strikeout,
  hitDistrib: MOCK_HOT_COLD.hitDistrib,
};

const FALLBACK_PITCH_ZONE: ZoneGrid = MOCK_PITCH_ZONE;
const FALLBACK_STRIKEOUT_ZONE: ZoneGrid = MOCK_PITCH_ZONE;

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
      .catch((err: any) => setStatsError(err?.message ?? "스탯 API 호출 실패"))
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
      .finally(() => setChartLoading(false));
  }, [playerBasic]);

  // ── 차트 데이터 resolve: 실제 DB > MOCK fallback ─────────

  const resolvedHotColdData = useMemo(() => {
    const h = chartData?.hitter;
    if (!h) return FALLBACK_HOT_COLD_DATA;
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

  const resolvedPitchZone = useMemo<ZoneGrid>(() => {
    return chartData?.pitcher?.pitchZone ?? FALLBACK_PITCH_ZONE;
  }, [chartData]);

  const resolvedStrikeoutZone = useMemo<ZoneGrid>(() => {
    return chartData?.pitcher?.strikeoutZone ?? FALLBACK_STRIKEOUT_ZONE;
  }, [chartData]);

  const resolvedHitDistrib = useMemo(() => {
    const h = chartData?.hitter;
    if (!h) return MOCK_HOT_COLD.hitDistrib;
    return {
      LF: h.hitDistrib.lf,
      CF: h.hitDistrib.cf,
      RF: h.hitDistrib.rf,
    };
  }, [chartData]);

  const chartSource = chartLoading ? "loading" : chartData ? "db" : "mock";

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

  const sortedHitter = [...hitterStats].sort((a, b) => b.season - a.season);

  // ─────────────────────────────────────────────────────────
  // 타자 기본 스탯 탭 (시즌 테이블)
  // ─────────────────────────────────────────────────────────
  const HitterStandardContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "타율",
            val: latestHitter ? fmtAvg(latestHitter.avg) : "-",
            color: "from-blue-500 to-blue-600",
          },
          {
            label: "홈런",
            val: latestHitter ? String(latestHitter.hr) : "-",
            color: "from-red-500 to-red-600",
          },
          {
            label: "타점",
            val: latestHitter ? String(latestHitter.rbi) : "-",
            color: "from-amber-500 to-amber-600",
          },
          {
            label: "득점",
            val: latestHitter ? String(latestHitter.r) : "-",
            color: "from-green-500 to-green-600",
          },
        ].map(({ label, val, color }) => (
          <div
            key={label}
            className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-white`}
          >
            <p className="text-white/70 text-xs font-medium">{label}</p>
            <p className="text-2xl font-black mt-1">{val}</p>
          </div>
        ))}
      </div>

      {statsLoading && (
        <div className="text-center py-8 text-gray-400 text-sm">
          스탯 로딩 중...
        </div>
      )}
      {statsError && (
        <div className="text-center py-8 text-red-400 text-sm">
          {statsError}
        </div>
      )}

      {!statsLoading && sortedHitter.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {[
                    "시즌",
                    "팀",
                    "G",
                    "PA",
                    "AB",
                    "H",
                    "2B",
                    "3B",
                    "HR",
                    "RBI",
                    "TB",
                    "SAC",
                    "SF",
                    "AVG",
                  ].map((h) => (
                    <th
                      key={h}
                      className={`px-3 py-3 text-xs font-bold text-center ${
                        h === "AVG" ? "text-blue-600" : "text-gray-400"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedHitter.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-t border-gray-50 ${
                      i === 0 ? "bg-blue-50/40" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-3 py-3 text-center font-bold text-gray-800">
                      {row.season}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {row.team}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {row.g}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {row.pa}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {row.ab}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {row.h}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {row.b2}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {row.b3}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-gray-800">
                      {row.hr}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-gray-800">
                      {row.rbi}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {row.tb}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {row.sac}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-500">
                      {row.sf}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-blue-600">
                      {fmtAvg(row.avg)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

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
              <PitchZoneTab
                pitchZone={resolvedPitchZone}
                strikeoutZone={resolvedStrikeoutZone}
                loading={chartLoading}
                dataSource={chartSource}
              />
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
              ) : (
                <HotColdTab
                  data={resolvedHotColdData}
                  dataSource={chartSource}
                />
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
