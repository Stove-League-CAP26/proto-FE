// 선수 프로필 페이지 - 이름 검색으로 선수를 찾고 프로필/핫콜드존/스탯 탭을 표시
// 백엔드 API(searchPlayersByName)와 연동되어 실제 선수 데이터를 불러옴
import { useState } from "react";
import ProfileTab from "@/components/profile/ProfileTab";
import HotColdTab from "@/components/profile/HotColdTab";
import StatsTab from "@/components/profile/StatsTab";
import PlayerAvatar from "@/components/common/PlayerAvatar";
import { TEAM_COLORS } from "@/constants/teamColors";
import { MOCK_STATS_HITTER, MOCK_HOT_COLD } from "@/mock/statsData";
import { searchPlayersByName } from "@/api/playerApi";

const PLAYER_TABS = [
  { id: "profile", label: "프로필", icon: "👤" },
  { id: "hotcold", label: "핫/콜드 존", icon: "🔥" },
  { id: "stats", label: "선수 스탯", icon: "📊" },
];

export default function PlayerProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");

  // 검색 상태
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // 선수 데이터 상태
  const [playerBasic, setPlayerBasic] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 이름 검색
  const handleSearch = async () => {
    const name = searchInput.trim();
    if (!name) return;
    setSearchLoading(true);
    setShowResults(false);
    setError(null);
    try {
      const results = await searchPlayersByName(name);
      if (results.length === 0) {
        setError(`"${name}" 에 해당하는 선수가 없습니다.`);
        setSearchResults([]);
      } else if (results.length === 1) {
        setPlayerBasic(results[0]);
        setSearchResults([]);
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

  // 검색 결과에서 선수 선택
  const handleSelectPlayer = (p: any) => {
    setPlayerBasic(p);
    setShowResults(false);
    setSearchResults([]);
    setSearchInput(p.playerName);
    setError(null);
  };

  // 검색창 (compact: 상단바용)
  const SearchDropdown = ({ results }: { results: any[] }) => (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden min-w-[280px]">
      <p className="px-3 py-2 text-xs text-gray-400 border-b border-gray-100">
        {results.length}명의 선수가 검색됐어요. 선택해주세요.
      </p>
      <div className="max-h-60 overflow-y-auto">
        {results.map((p: any) => {
          const tc = TEAM_COLORS[p.playerEnter] ?? {
            bg: "#64748b",
            accent: "#94a3b8",
          };
          return (
            <button
              key={p.pid}
              onClick={() => handleSelectPlayer(p)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
            >
              <div
                className="w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0"
                style={{ borderColor: tc.bg }}
              >
                <PlayerAvatar id={p.pid} name={p.playerName} size={40} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800">
                  {p.playerName}
                </p>
                <p className="text-xs text-gray-400">
                  {p.playerEnter} · {p.playerMPosition} · #{p.playerNumber}
                </p>
              </div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0"
                style={{ backgroundColor: tc.bg }}
              >
                {p.playerEnter}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── 초기 검색 화면 ──────────────────────────────────────
  if (!playerBasic) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex flex-col items-center gap-6">
          <p className="text-5xl">⚾</p>
          <h2 className="text-2xl font-black text-gray-800">선수 검색</h2>
          <p className="text-sm text-gray-400">
            선수 이름을 입력하면 프로필을 확인할 수 있어요
          </p>
          <div className="relative w-full max-w-sm">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowResults(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="선수 이름 입력 (예: 양의지)"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
              >
                {searchLoading ? "⏳" : "🔍"} 검색
              </button>
            </div>
            {showResults && searchResults.length > 0 && (
              <SearchDropdown results={searchResults} />
            )}
            {error && !playerBasic && (
              <p className="absolute top-full left-0 mt-1 text-red-500 text-xs font-medium bg-white px-2 py-1 rounded-lg border border-red-100 shadow-sm">
                {error}
              </p>
            )}
          </div>

          {/* 자주 찾는 선수 */}
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-3 text-center">
              자주 찾는 선수
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["양의지", "김도영", "안우진", "원태인", "양현종"].map(
                (name) => (
                  <button
                    key={name}
                    onClick={async () => {
                      setSearchInput(name);
                      setSearchLoading(true);
                      setError(null);
                      try {
                        const results = await searchPlayersByName(name);
                        if (results.length === 1) setPlayerBasic(results[0]);
                        else if (results.length > 1) {
                          setSearchResults(results);
                          setShowResults(true);
                        } else setError(`"${name}" 선수를 찾을 수 없습니다.`);
                      } catch (err: any) {
                        setError(err.message);
                      } finally {
                        setSearchLoading(false);
                      }
                    }}
                    className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    {name}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── API 데이터 → 프론트 포맷 변환 ──────────────────────
  const tc = TEAM_COLORS[playerBasic.playerEnter] ?? {
    bg: "#1e293b",
    accent: "#64748b",
  };
  const hwRaw = playerBasic.heightWeight ?? "";
  const hwParts = hwRaw.split("/");
  const heightNum = hwParts[0]?.replace(/[^0-9]/g, "") ?? "-";
  const weightNum = hwParts[1]?.replace(/[^0-9]/g, "") ?? "-";
  const heightWeightStr =
    heightNum !== "-" && weightNum !== "-"
      ? `${heightNum}cm / ${weightNum}kg`
      : hwRaw || "-";
  const salaryStr = playerBasic.playerSalary
    ? `${(playerBasic.playerSalary / 100000000).toFixed(0)}억`
    : "-";
  const careerList = playerBasic.playerHistory
    ? playerBasic.playerHistory
        .split("\n")
        .filter((line: string) => line.trim())
        .map((line: string) => ({ year: "", team: line.trim(), note: "" }))
    : [];

  const player = {
    id: playerBasic.pid,
    name: playerBasic.playerName ?? "-",
    number: playerBasic.playerNumber ?? 0,
    team: playerBasic.playerEnter ?? "-",
    teamColor: tc.bg,
    teamAccent: tc.accent,
    position: playerBasic.playerMPosition ?? "-",
    born: playerBasic.playerBirthday ? String(playerBasic.playerBirthday) : "-",
    draft: playerBasic.playerDraft ?? "-",
    salary: salaryStr,
    heightWeight: heightWeightStr,
    career: careerList,
    bats: "-",
    blood: "-",
    nation: "대한민국",
    awards: [] as string[],
    playstyle: "-",
    radarData: { 공격: 0, 수비: 0, 타격: 0, 주루: 0, 잠재력: 0, 집중: 0 },
  };

  const statsData = MOCK_STATS_HITTER;
  const latestStat = statsData.season[0];

  // ── 프로필 화면 렌더링 ──────────────────────────────────
  return (
    <div>
      {/* 상단 검색창 */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 relative z-40">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="relative">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowResults(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="선수 이름 입력"
                className="w-48 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
              >
                {searchLoading ? "⏳" : "🔍"}
              </button>
            </div>
            {showResults && searchResults.length > 0 && (
              <SearchDropdown results={searchResults} />
            )}
          </div>
          <span className="text-xs text-gray-400 hidden sm:block">
            현재: <span className="font-bold text-gray-600">{player.name}</span>
          </span>
          <button
            onClick={() => {
              setPlayerBasic(null);
              setSearchInput("");
              setError(null);
              setShowResults(false);
            }}
            className="ml-auto text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            목록으로
          </button>
        </div>
      </div>

      {/* 선수 배너 */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${player.teamColor} 0%, ${player.teamAccent} 60%, #1e1e2e 100%)`,
        }}
      >
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full border-4 border-white opacity-10" />
        <div className="max-w-6xl mx-auto px-4 py-6 relative">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 overflow-hidden flex-shrink-0">
              <PlayerAvatar id={player.id} name={player.name} size={80} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  #{player.number}
                </span>
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {player.position}
                </span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                {player.name}
              </h1>
              <p className="text-white/60 text-sm">
                {player.team} · {player.bats}
              </p>
            </div>
            <div className="ml-auto hidden sm:flex gap-6">
              {[
                ["타율", latestStat?.AVG ?? "-"],
                ["홈런", String(latestStat?.HR ?? "-")],
                ["OPS", latestStat?.OPS ?? "-"],
              ].map(([k, v]) => (
                <div key={k} className="text-center">
                  <p className="text-white/50 text-xs">{k}</p>
                  <p className="text-white text-xl font-black">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="bg-white border-b border-gray-100 sticky top-14 z-30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex">
            {PLAYER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === "profile" && <ProfileTab player={player} />}
        {activeTab === "hotcold" && <HotColdTab data={MOCK_HOT_COLD} />}
        {activeTab === "stats" && <StatsTab stats={statsData} />}
      </div>
    </div>
  );
}
