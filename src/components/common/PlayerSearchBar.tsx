// src/components/common/PlayerSearchBar.tsx
import { useEffect, useState, useRef } from "react";
import PlayerAvatar from "@/components/common/PlayerAvatar";
import { TEAM_COLORS } from "@/constants/teamColors";
import { isPitcher } from "@/utils/playerUtils";
import { searchPlayersByName } from "@/api/playerApi";

interface SearchResult {
  pid: number;
  playerName: string;
  playerEnter: string; // 현 소속팀
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

// ── 투수 20명 풀 ──────────────────────────────────────────────────────────────
const PITCHER_POOL = [
  "양현종",
  "고영표",
  "원태인",
  "안우진",
  "김광현",
  "이의리",
  "하재훈",
  "문동주",
  "소형준",
  "박세웅",
  "김윤수",
  "최원태",
  "임기영",
  "장현식",
  "한현희",
  "레예스",
  "노경은",
  "김서현",
  "박민호",
  "최지강",
];

// ── 타자 20명 풀 ──────────────────────────────────────────────────────────────
const HITTER_POOL = [
  "양의지",
  "김도영",
  "박동원",
  "노시환",
  "최정",
  "나성범",
  "김혜성",
  "강백호",
  "이재원",
  "박성한",
  "이호준",
  "손아섭",
  "박찬호",
  "홍창기",
  "오스틴",
  "로하스",
  "에레디아",
  "전의산",
  "구자욱",
  "한유섬",
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
          const tc = TEAM_COLORS[p.playerEnter] ?? { bg: "#64748b" };
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
  const tc = TEAM_COLORS[player.playerEnter] ?? { bg: "#64748b" };
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
        {/* 현 소속팀 + 등번호 */}
        <p className="text-xs text-gray-400 mt-0.5">
          <span
            className="font-bold"
            style={{ color: tc.bg !== "#64748b" ? tc.bg : "#6b7280" }}
          >
            {player.playerEnter}
          </span>
          <span className="mx-1">·</span>
          <span>#{player.playerNumber}</span>
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

// ── 추천 선수 로드 — 투수 2명 + 타자 2명 반드시 확보 ─────────────────────────
async function loadRecommendedPlayers(): Promise<SearchResult[]> {
  const pitcherCandidates = shuffle(PITCHER_POOL);
  const hitterCandidates = shuffle(HITTER_POOL);
  const pitchers: SearchResult[] = [];
  const hitters: SearchResult[] = [];

  // 투수 2명 확보 — 실패 시 다음 후보
  for (const name of pitcherCandidates) {
    if (pitchers.length >= 2) break;
    try {
      const results = (await searchPlayersByName(name)) as SearchResult[];
      // 검색 결과 중 투수 포지션인 첫 번째 선수 선택
      const match = results.find((r) => isPitcher(r.playerMPosition));
      if (match) pitchers.push(match);
    } catch {}
  }

  // 타자 2명 확보 — 실패 시 다음 후보
  for (const name of hitterCandidates) {
    if (hitters.length >= 2) break;
    try {
      const results = (await searchPlayersByName(name)) as SearchResult[];
      // 검색 결과 중 타자 포지션인 첫 번째 선수 선택
      const match = results.find((r) => !isPitcher(r.playerMPosition));
      if (match) hitters.push(match);
    } catch {}
  }

  // 투수 2명 위 / 타자 2명 아래 순서 고정
  return [...pitchers, ...hitters];
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
  const [recLoading, setRecLoading] = useState(false);
  const loadedRef = useRef(false); // 중복 로드 방지

  useEffect(() => {
    if (compact || loadedRef.current) return;
    loadedRef.current = true;
    setRecLoading(true);
    loadRecommendedPlayers()
      .then(setRecommended)
      .finally(() => setRecLoading(false));
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
            {error && (
              <p
                className="absolute top-full left-0 mt-1 text-red-500 text-xs
                 bg-white px-3 py-1.5 rounded-lg border border-red-100 shadow-sm whitespace-nowrap z-50"
              >
                {error}
              </p>
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
          이름을 입력하면 선수의 프로필과 분석을 확인할 수 있어요
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

        {/* 추천 선수 — 투수 2명(위) + 타자 2명(아래) */}
        <div className="w-full max-w-lg mt-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-400 font-medium">추천 선수</span>
            <div className="flex gap-2 ml-auto"></div>
          </div>

          {recLoading ? (
            // 로딩 중 스켈레톤 4개
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 animate-pulse"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-16" />
                    <div className="h-2 bg-gray-100 rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : recommended.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {recommended.map((p) => (
                <RecommendCard key={p.pid} player={p} onSelect={onSelect} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
