// 선수 프로필 페이지 - 상태관리 + 컴포넌트 조합만 담당
import { useState, useEffect } from "react";
import PlayerSearchBar from "@/components/profile/PlayerSearchBar";
import PlayerHeroBanner from "@/components/profile/PlayerHeroBanner";
import PlayerPercentileBar from "@/components/profile/PlayerPercentileBar";
import PlayerAppLinks from "@/components/profile/PlayerAppLinks";
import PlayerTabBar from "@/components/profile/PlayerTabBar";
import HotColdTab from "@/components/profile/HotColdTab";
import PitchZoneGrid from "@/components/profile/PitchZoneGrid";
import HitterStatcastTab from "@/components/profile/HitterStatcastTab";
import PitcherStatcastTab from "@/components/profile/PitcherStatcastTab";
import PitcherStandardTab from "@/components/profile/PitcherStandardTab";
import { TEAM_COLORS } from "@/constants/teamColors";
import { stepColors } from "@/constants/stepColors";
import { MOCK_HOT_COLD, MOCK_PITCHER_PERCENTILES } from "@/mock/statsData";
import {
  searchPlayersByName,
  fetchHitterStats,
  fetchPitcherStats,
  fetchHitterRadar,
  fetchPitcherRadar,
} from "@/api/playerApi";
import type { HitterRadar, PitcherRadar } from "@/api/playerApi";
import { isPitcher, fmtAvg, fmtEra, fmtWhip } from "@/utils/playerUtils";
import type { HitterStat, PitcherStat } from "@/types/playerStats";

// ── 상수 ──────────────────────────────────────────────────────
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

// ── 메인 페이지 ───────────────────────────────────────────────
export default function PlayerProfilePage() {
  const [activeTab, setActiveTab] = useState("statcast");
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [playerBasic, setPlayerBasic] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 스탯
  const [hitterStats, setHitterStats] = useState<HitterStat[]>([]);
  const [pitcherStats, setPitcherStats] = useState<PitcherStat[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // 레이더
  const [radarData, setRadarData] = useState<HitterRadar | PitcherRadar | null>(
    null,
  );
  const [radarLoading, setRadarLoading] = useState(false);

  // 선수 변경 시 스탯 + 레이더 API 동시 호출
  useEffect(() => {
    if (!playerBasic) return;
    const pid = playerBasic.pid as number;
    const pitcherType = isPitcher(playerBasic.playerMPosition);

    // 스탯 초기화
    setHitterStats([]);
    setPitcherStats([]);
    setStatsError(null);
    setStatsLoading(true);

    // 레이더 초기화
    setRadarData(null);
    setRadarLoading(true);

    // 스탯 API
    const statFetcher = pitcherType ? fetchPitcherStats : fetchHitterStats;
    statFetcher(pid)
      .then((data: any[]) => {
        if (pitcherType) setPitcherStats(data);
        else setHitterStats(data);
      })
      .catch((err: any) => setStatsError(err?.message ?? "스탯 API 호출 실패"))
      .finally(() => setStatsLoading(false));

    // 레이더 API
    const radarFetcher = pitcherType ? fetchPitcherRadar : fetchHitterRadar;
    radarFetcher(pid)
      .then((data) => setRadarData(data))
      .catch(() => setRadarData(null)) // 레이더 실패는 조용히 처리
      .finally(() => setRadarLoading(false));
  }, [playerBasic]);

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
  };

  // ── 초기 검색 화면 ─────────────────────────────────────────
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

  // ── 데이터 파싱 ────────────────────────────────────────────
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

  const bgGradient = `linear-gradient(160deg, ${tc.bg} 0%, ${tc.accent === "#000000" ? "#1e1e2e" : tc.accent} 55%, #0f0f1a 100%)`;
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

  // ── 타자 기본 스탯 탭 ─────────────────────────────────────
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
                    className={`px-3 py-2.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${["AVG", "HR", "RBI"].includes(h) ? "text-blue-600" : "text-gray-400"}`}
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
                  className={`border-t border-gray-50 ${i === 0 ? "bg-blue-50/40" : "hover:bg-gray-50"}`}
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

  // ── 렌더링 ─────────────────────────────────────────────────
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

      {/* 바로가기 */}
      <PlayerAppLinks apps={playerApps} />

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
            {activeTab === "statcast" && (
              <PitcherStatcastTab stats={pitcherStats} />
            )}
            {activeTab === "standard" && (
              <PitcherStandardTab stats={pitcherStats} />
            )}
            {activeTab === "zone" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1 h-5 rounded-full bg-blue-500" />
                  <h3 className="font-bold text-gray-800">
                    투구 분포도 (존별)
                  </h3>
                </div>
                <div className="flex justify-center">
                  <PitchZoneGrid />
                </div>
                <div className="flex items-center gap-1 mt-4 justify-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-1">
                      <div
                        className="w-8 h-4 rounded"
                        style={{ backgroundColor: stepColors[s].bg }}
                      />
                      <span className="text-xs text-gray-400">
                        {["저빈도", "", "", "", "고빈도"][s - 1]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {activeTab === "statcast" && (
              <HitterStatcastTab stats={hitterStats} />
            )}
            {activeTab === "standard" && <HitterStandardContent />}
            {activeTab === "hotcold" && <HotColdTab data={MOCK_HOT_COLD} />}
          </>
        )}
      </div>
    </div>
  );
}
