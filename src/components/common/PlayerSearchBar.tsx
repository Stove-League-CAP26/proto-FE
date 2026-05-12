// src/components/common/PlayerSearchBar.tsx
// 이모티콘 제거 + 검색창 아래 추천 선수 4명(투수 2, 타자 2) 표시
import { useEffect, useState } from "react";
import PlayerAvatar from "@/components/common/PlayerAvatar";
import { TEAM_COLORS } from "@/constants/teamColors";
import { isPitcher } from "@/utils/playerUtils";
import { searchPlayersByName } from "@/api/playerApi";

interface SearchResult {
  pid: number;
  playerName: string;
  playerEnter: string;
  playerMPosition: string;
  playerNumber: number;
}

interface PlayerSearchBarProps {
  searchInput: string;
  searchLoading: boolean;
  searchResults: SearchResult[];
  showResults: boolean;
  error?: string | null;
  compact?: boolean;
  currentPlayerName?: string;
  heroAccent?: string;
  isPitcherPlayer?: boolean;
  onChange: (val: string) => void;
  onSearch: () => void;
  onSelect: (p: SearchResult) => void;
  onBack?: () => void;
}

// ── 추천 선수 풀 (랜덤 선택용) ──────────────────────────────────────────────
const PITCHER_POOL = [
  "양현종",
  "고영표",
  "원태인",
  "안우진",
  "김광현",
  "류현진",
];
const HITTER_POOL = [
  "양의지",
  "이정후",
  "김도영",
  "박동원",
  "오스틴",
  "노시환",
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ── 드롭다운 ──────────────────────────────────────────────────────────────────
function Dropdown({
  results,
  onSelect,
}: {
  results: SearchResult[];
  onSelect: (p: SearchResult) => void;
}) {
  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden min-w-72">
      <p className="px-3 py-2 text-xs text-gray-400 border-b border-gray-100">
        {results.length}명이 검색됐어요. 선택해주세요.
      </p>
      <div className="max-h-60 overflow-y-auto">
        {results.map((p) => {
          const tc = TEAM_COLORS[p.playerEnter] ?? {
            bg: "#64748b",
            accent: "#94a3b8",
          };
          const pitcher = isPitcher(p.playerMPosition);
          return (
            <button
              key={p.pid}
              onClick={() => onSelect(p)}
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
                style={{ backgroundColor: pitcher ? "#F97316" : "#3B82F6" }}
              >
                {pitcher ? "투수" : "타자"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── 추천 선수 카드 ────────────────────────────────────────────────────────────
function RecommendCard({
  player,
  onSelect,
}: {
  player: SearchResult;
  onSelect: (p: SearchResult) => void;
}) {
  const tc = TEAM_COLORS[player.playerEnter] ?? {
    bg: "#64748b",
    accent: "#94a3b8",
  };
  const pitcher = isPitcher(player.playerMPosition);
  return (
    <button
      onClick={() => onSelect(player)}
      className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 hover:shadow-md hover:border-gray-200 transition-all text-left w-full"
    >
      <div
        className="w-12 h-12 rounded-full overflow-hidden border-2 flex-shrink-0"
        style={{ borderColor: tc.bg }}
      >
        <PlayerAvatar id={player.pid} name={player.playerName} size={48} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800">{player.playerName}</p>
        <p className="text-xs text-gray-400">
          {player.playerEnter} · #{player.playerNumber}
        </p>
      </div>
      <span
        className="text-xs font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0"
        style={{ backgroundColor: pitcher ? "#F97316" : "#3B82F6" }}
      >
        {pitcher ? "투수" : "타자"}
      </span>
    </button>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export default function PlayerSearchBar({
  searchInput,
  searchLoading,
  searchResults,
  showResults,
  error,
  compact = false,
  currentPlayerName,
  heroAccent,
  isPitcherPlayer,
  onChange,
  onSearch,
  onSelect,
  onBack,
}: PlayerSearchBarProps) {
  const [recommended, setRecommended] = useState<SearchResult[]>([]);

  // 초기 화면에서만 추천 선수 로드
  useEffect(() => {
    if (compact) return;
    const pitcherNames = shuffle(PITCHER_POOL).slice(0, 2);
    const hitterNames = shuffle(HITTER_POOL).slice(0, 2);
    const names = [...pitcherNames, ...hitterNames];

    Promise.all(names.map((n) => searchPlayersByName(n).catch(() => [])))
      .then((results) => {
        const flat = results
          .map((r) => (Array.isArray(r) ? r[0] : null))
          .filter(Boolean) as SearchResult[];
        setRecommended(flat);
      })
      .catch(() => {});
  }, [compact]);

  const inputEl = (width: string) => (
    <input
      type="text"
      value={searchInput}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onSearch()}
      placeholder={
        compact ? "선수 이름 입력" : "선수 이름 입력 (예: 양현종, 양의지)"
      }
      className={`${width} border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100`}
    />
  );

  const searchBtn = (
    <button
      onClick={onSearch}
      disabled={searchLoading}
      className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
    >
      {searchLoading ? "검색 중" : "검색"}
    </button>
  );

  // compact: 상단바
  if (compact) {
    return (
      <div className="bg-white border-b border-gray-100 px-4 py-3 relative z-40">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="relative">
            <div className="flex gap-2">
              {inputEl("w-48")}
              {searchBtn}
            </div>
            {showResults && (
              <Dropdown results={searchResults} onSelect={onSelect} />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:block">
              현재:{" "}
              <span className="font-bold text-gray-600">
                {currentPlayerName}
              </span>
            </span>
            {heroAccent && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: heroAccent }}
              >
                {isPitcherPlayer ? "투수" : "타자"}
              </span>
            )}
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="ml-auto text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
            >
              목록으로
            </button>
          )}
        </div>
      </div>
    );
  }

  // full: 초기 검색 화면
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-2xl font-black text-gray-800">선수 검색</h2>
        <p className="text-sm text-gray-400">
          이름을 입력하면 Statcast 스타일 프로필을 확인할 수 있어요
        </p>
        <div className="relative w-full max-w-sm">
          <div className="flex gap-2">
            {inputEl("flex-1")}
            {searchBtn}
          </div>
          {showResults && (
            <Dropdown results={searchResults} onSelect={onSelect} />
          )}
          {error && (
            <p className="absolute top-full left-0 mt-1 text-red-500 text-xs bg-white px-2 py-1 rounded-lg border border-red-100 shadow-sm">
              {error}
            </p>
          )}
        </div>

        {/* 추천 선수 4명 (투수 2 + 타자 2) */}
        {recommended.length > 0 && (
          <div className="w-full max-w-lg mt-2">
            <p className="text-xs text-gray-400 mb-3 text-center font-medium">
              추천 선수
            </p>
            <div className="grid grid-cols-2 gap-3">
              {recommended.map((p) => (
                <RecommendCard key={p.pid} player={p} onSelect={onSelect} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
