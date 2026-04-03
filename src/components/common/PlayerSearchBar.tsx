// 선수 검색창 + 검색 결과 드롭다운
// 상단 검색바 모드(compact=true)와 초기 검색 화면(compact=false) 모두 지원
import PlayerAvatar from "@/components/common/PlayerAvatar";
import { TEAM_COLORS } from "@/constants/teamColors";
import { isPitcher } from "@/utils/playerUtils";

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
  compact?: boolean; // true: 상단바용, false: 초기 화면용
  currentPlayerName?: string; // compact 모드에서 현재 선수 표시
  heroAccent?: string; // compact 모드 뱃지 색상
  isPitcherPlayer?: boolean; // compact 모드 투수/타자 뱃지
  onChange: (val: string) => void;
  onSearch: () => void;
  onSelect: (p: SearchResult) => void;
  onBack?: () => void; // compact 모드 "목록으로" 버튼
}

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
  const Dropdown = () => (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden min-w-72">
      <p className="px-3 py-2 text-xs text-gray-400 border-b border-gray-100">
        {searchResults.length}명이 검색됐어요. 선택해주세요.
      </p>
      <div className="max-h-60 overflow-y-auto">
        {searchResults.map((p) => {
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
      {searchLoading ? "⏳" : "🔍"}
      {!compact && " 검색"}
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
            {showResults && <Dropdown />}
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
                {isPitcherPlayer ? "🔥 투수" : "🏏 타자"}
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
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="flex flex-col items-center gap-6">
        <p className="text-5xl">⚾</p>
        <h2 className="text-2xl font-black text-gray-800">선수 검색</h2>
        <p className="text-sm text-gray-400">
          이름을 입력하면 Statcast 스타일 프로필을 확인할 수 있어요
        </p>
        <div className="relative w-full max-w-sm">
          <div className="flex gap-2">
            {inputEl("flex-1")}
            {searchBtn}
          </div>
          {showResults && <Dropdown />}
          {error && (
            <p className="absolute top-full left-0 mt-1 text-red-500 text-xs bg-white px-2 py-1 rounded-lg border border-red-100 shadow-sm">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
