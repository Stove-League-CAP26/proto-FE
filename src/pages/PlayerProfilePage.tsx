// 선수 프로필 페이지 - 상태관리 + 컴포넌트 조합만 담당
// 차트 데이터(HOT/COLD ZONE, 투구분포도, 타구방향)는
//   GET /api/players/{pid}/chart → 실패 시 MOCK fallback 자동 적용
import { useState, useEffect, useMemo } from "react";
import PlayerSearchBar from "@/components/profile/PlayerSearchBar";
import PlayerHeroBanner from "@/components/profile/PlayerHeroBanner";
import PlayerPercentileBar from "@/components/profile/PlayerPercentileBar";
import PlayerAppLinks from "@/components/profile/PlayerAppLinks";
import PlayerTabBar from "@/components/profile/PlayerTabBar";
import HotColdTab from "@/components/profile/HotColdTab";
import PitchZoneTab from "@/components/profile/PitchZoneTab";
import HitterStatcastTab from "@/components/profile/HitterStatcastTab";
import PitcherStatcastTab from "@/components/profile/PitcherStatcastTab";
import PitcherStandardTab from "@/components/profile/PitcherStandardTab";
import { TEAM_COLORS } from "@/constants/teamColors";
import {
  MOCK_HOT_COLD,
  MOCK_PITCH_ZONE,
  MOCK_PITCHER_PERCENTILES,
} from "@/mock/statsData";
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
// 퍼센타일 MOCK (스탯 DB 연동 전까지 유지)
// ─────────────────────────────────────────────────────────────
const MOCK_HITTER_PERCENTILES = [
  { label: "타율", pct: 62, val: ".337", inverse: false },
  { label: "OPS", pct: 78, val: ".939", inverse: false },
  { label: "장타율", pct: 71, val: ".533", inverse: false },
  { label: "출루율", pct: 80, val: ".406", inverse: false },
  { label: "홈런", pct: 55, val: "20개", inverse: false },
  { label: "도루", pct: 22, val: "4개", inverse: false },
  { label: "삼진율", pct: 75, val: "12.2%", inverse: false },
  { label: "볼넷율", pct: 68, val: "9.7%", inverse: false },
  { label: "배럴%", pct: 88, val: "11.3%", inverse: false },
  { label: "강타%", pct: 82, val: "44.8%", inverse: false },
];

// ─────────────────────────────────────────────────────────────
// MOCK fallback — 차트 API 실패 시 사용
// HotColdTab 기대 포맷과 동일하게 유지
// ─────────────────────────────────────────────────────────────
const FALLBACK_HOT_COLD_DATA = {
  outer: MOCK_HOT_COLD.outer,
  inner: MOCK_HOT_COLD.inner,
  strikeout: MOCK_HOT_COLD.strikeout,
  hitDistrib: MOCK_HOT_COLD.hitDistrib, // { LF, CF, RF }
};

// 투구 분포도 fallback
const FALLBACK_PITCH_ZONE: ZoneGrid = MOCK_PITCH_ZONE;

// 탈삼진 분포도 fallback (투구존과 동일 구조, 값만 다름)
const FALLBACK_STRIKEOUT_ZONE: ZoneGrid = MOCK_PITCH_ZONE;

// ─────────────────────────────────────────────────────────────
// 탭 정의
// ─────────────────────────────────────────────────────────────
const PITCHER_TABS = [
  { id: "statcast", label: "스탯캐스트" },
  { id: "standard", label: "기본 스탯" },
  { id: "zone", label: "투구존" },
];

const HITTER_TABS = [
  { id: "statcast", label: "스탯캐스트" },
  { id: "standard", label: "기본 스탯" },
  { id: "hotcold", label: "핫/콜드존" },
];

// ─────────────────────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────────────────────
export default function PlayerProfilePage() {
  const [activeTab, setActiveTab] = useState("statcast");
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
      .catch(() => setRadarData(null)) // 실패 시 조용히 null
      .finally(() => setRadarLoading(false));

    // ── 차트 초기화 + 로드 ───────────────────────────────
    // fetchPlayerChart는 내부에서 에러 catch → null 반환하므로 .catch 불필요
    setChartData(null);
    setChartLoading(true);

    fetchPlayerChart(pid)
      .then((data) => setChartData(data))
      .finally(() => setChartLoading(false));
  }, [playerBasic]);

  // ── 차트 데이터 resolve: 실제 DB > MOCK fallback ─────────

  /** 타자 핫/콜드존 + 삼진분포 + 타구방향 */
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

  /** 투수 투구 분포도 */
  const resolvedPitchZone = useMemo<ZoneGrid>(() => {
    return chartData?.pitcher?.pitchZone ?? FALLBACK_PITCH_ZONE;
  }, [chartData]);

  /** 투수 탈삼진 분포도 */
  const resolvedStrikeoutZone = useMemo<ZoneGrid>(() => {
    return chartData?.pitcher?.strikeoutZone ?? FALLBACK_STRIKEOUT_ZONE;
  }, [chartData]);

  /** 타자 타구 방향 — HitterStatcastTab 스프레이 차트용 */
  const resolvedHitDistrib = useMemo(() => {
    const h = chartData?.hitter;
    if (!h) return MOCK_HOT_COLD.hitDistrib; // { LF, CF, RF }
    return {
      LF: h.hitDistrib.lf,
      CF: h.hitDistrib.cf,
      RF: h.hitDistrib.rf,
    };
  }, [chartData]);

  // 차트 데이터 출처 (디버깅/배지용)
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
        setActiveTab("statcast");
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
    setActiveTab("statcast");
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

  // 히어로 배너 주요 지표 배지
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

  const percentiles = pitcher
    ? MOCK_PITCHER_PERCENTILES
    : MOCK_HITTER_PERCENTILES;
  const playerApps = pitcher
    ? ["비주얼 리포트", "3D 피칭", "구종 분포", "유사 투수", "스윙 테이크"]
    : [
        "일러스트레이터",
        "선수 비교",
        "스윙 프로파일",
        "존 스윙",
        "유사 선수",
        "포지셔닝",
      ];
  const tabs = pitcher ? PITCHER_TABS : HITTER_TABS;

  const sortedHitter = [...hitterStats].sort((a, b) => b.season - a.season);
  const sortedPitcher = [...pitcherStats].sort((a, b) => b.season - a.season);

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
            color: "from-emerald-500 to-emerald-600",
          },
        ].map(({ label, val, color }) => (
          <div
            key={label}
            className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-white shadow-sm`}
          >
            <p className="text-white/70 text-xs font-medium">{label}</p>
            <p className="text-3xl font-black mt-0.5">{val}</p>
            <p className="text-white/60 text-xs mt-1">최근 시즌</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-800">시즌 타격 기록</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {[
                  "연도",
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
                    className={`px-3 py-2.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${
                      ["AVG", "HR", "RBI"].includes(h)
                        ? "text-blue-600"
                        : "text-gray-400"
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

      {/* 퍼센타일 랭킹 */}
      <PlayerPercentileBar
        percentiles={percentiles}
        isPitcherPlayer={pitcher}
      />

      {/* 탭 바 */}
      <PlayerTabBar
        tabs={tabs}
        activeTab={activeTab}
        heroAccent={heroAccent}
        onTabChange={setActiveTab}
      />

      {/* 탭 콘텐츠 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {pitcher ? (
          <>
            {/* ── 투수 탭 ── */}
            {activeTab === "statcast" && (
              <PitcherStatcastTab stats={pitcherStats} />
            )}
            {activeTab === "standard" && (
              <PitcherStandardTab stats={pitcherStats} />
            )}

            {/* ── 투구존 탭 — 실제 DB 데이터 우선, 없으면 MOCK ── */}
            {activeTab === "zone" && (
              <PitchZoneTab
                pitchZone={resolvedPitchZone}
                strikeoutZone={resolvedStrikeoutZone}
                loading={chartLoading}
                // 출처 배지: "db" | "mock" | "loading"
                dataSource={chartSource}
              />
            )}
          </>
        ) : (
          <>
            {/* ── 타자 탭 ── */}
            {activeTab === "statcast" && (
              /* hitDistrib: 스프레이 차트 LF/CF/RF 비율을 실제 DB에서 전달
                 — 컴포넌트 내부의 하드코딩 값을 override */
              <HitterStatcastTab
                stats={hitterStats}
                hitDistrib={resolvedHitDistrib}
              />
            )}
            {activeTab === "standard" && <HitterStandardContent />}

            {/* ── 핫/콜드존 탭 — 실제 DB 데이터 우선, 없으면 MOCK ── */}
            {activeTab === "hotcold" &&
              (chartLoading ? (
                /* 로딩 중 스켈레톤 */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse"
                    >
                      <div className="h-4 bg-gray-100 rounded w-1/2 mb-5" />
                      <div className="flex justify-center">
                        <div className="w-44 h-44 bg-gray-100 rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <HotColdTab
                  data={resolvedHotColdData}
                  dataSource={chartSource}
                />
              ))}
          </>
        )}
      </div>
    </div>
  );
}
