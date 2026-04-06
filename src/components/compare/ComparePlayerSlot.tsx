// 선수 비교 페이지의 선수 선택 슬롯
// 검색 → 선택 → 프로필 표시 + 변경하기 버튼
import { useState } from "react";
import PlayerAvatar from "@/components/common/PlayerAvatar";
import { TEAM_COLORS } from "@/constants/teamColors";
import { searchPlayersByName } from "@/api/playerApi";
import { isPitcher } from "@/utils/playerUtils";

interface ComparePlayerSlotProps {
  player: any | null; // playerBasic object
  sideLabel: "A" | "B";
  onPlayerSelected: (playerBasic: any) => void;
  loading?: boolean;
}

export default function ComparePlayerSlot({
  player,
  sideLabel,
  onPlayerSelected,
  loading = false,
}: ComparePlayerSlotProps) {
  const [searching, setSearching] = useState(false);
  const [input, setInput] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sideColor = sideLabel === "A" ? "#3B82F6" : "#EF4444";

  const handleSearch = async () => {
    const name = input.trim();
    if (!name) return;
    setSearchLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await searchPlayersByName(name);
      if (res.length === 0) setError(`"${name}" 선수를 찾을 수 없습니다`);
      else setResults(res);
    } catch {
      setError("검색 중 오류가 발생했습니다");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelect = (p: any) => {
    onPlayerSelected(p);
    setSearching(false);
    setInput("");
    setResults([]);
    setError(null);
  };

  // ── 검색 모드 ────────────────────────────────────────────────
  if (searching) {
    return (
      <div className="flex flex-col gap-3 w-full">
        {/* 검색바 */}
        <div className="flex gap-2">
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="선수 이름 검색..."
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm
                       outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          />
          <button
            onClick={handleSearch}
            disabled={searchLoading}
            className="px-3 py-2 rounded-xl text-sm font-bold text-white transition-colors"
            style={{ background: sideColor }}
          >
            {searchLoading ? "⏳" : "🔍"}
          </button>
          <button
            onClick={() => {
              setSearching(false);
              setResults([]);
              setError(null);
            }}
            className="px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-gray-600
                       border border-gray-200 hover:bg-gray-50"
          >
            취소
          </button>
        </div>

        {/* 오류 */}
        {error && <p className="text-xs text-red-500 px-1">{error}</p>}

        {/* 검색 결과 */}
        {results.length > 0 && (
          <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm max-h-60 overflow-y-auto">
            {results.map((p) => {
              const tc = TEAM_COLORS[p.playerEnter] ?? {
                bg: "#6b7280",
                accent: "#9ca3af",
              };
              const pitcher = isPitcher(p.playerMPosition);
              return (
                <button
                  key={p.pid}
                  onClick={() => handleSelect(p)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50
                             transition-colors text-left border-b border-gray-50 last:border-0"
                >
                  <div
                    className="w-9 h-9 rounded-full overflow-hidden border-2 flex-shrink-0"
                    style={{ borderColor: tc.bg }}
                  >
                    <PlayerAvatar id={p.pid} name={p.playerName} size={36} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">
                      {p.playerName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {p.playerEnter} · {p.playerMPosition}
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-full text-white flex-shrink-0"
                    style={{ background: pitcher ? "#F97316" : "#3B82F6" }}
                  >
                    {pitcher ? "투수" : "타자"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── 로딩 상태 ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 p-4 animate-pulse">
        <div className="w-20 h-20 rounded-2xl bg-gray-200" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-3 w-16 bg-gray-100 rounded" />
      </div>
    );
  }

  // ── 선수 없음 (빈 슬롯) ──────────────────────────────────────
  if (!player) {
    return (
      <button
        onClick={() => setSearching(true)}
        className="flex flex-col items-center gap-3 p-5 w-full rounded-2xl border-2
                   border-dashed transition-all hover:scale-[1.02]"
        style={{ borderColor: `${sideColor}50`, background: `${sideColor}05` }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
          style={{ background: `${sideColor}10` }}
        >
          👤
        </div>
        <div className="text-center">
          <p className="text-sm font-bold" style={{ color: sideColor }}>
            선수 {sideLabel} 선택
          </p>
          <p className="text-xs text-gray-400 mt-0.5">클릭하여 검색</p>
        </div>
      </button>
    );
  }

  // ── 선수 선택됨 ──────────────────────────────────────────────
  const tc = TEAM_COLORS[player.playerEnter] ?? {
    bg: "#6b7280",
    accent: "#9ca3af",
  };
  const pitcher = isPitcher(player.playerMPosition);
  const typeColor = pitcher ? "#F97316" : "#3B82F6";

  return (
    <div className="flex flex-col items-center gap-2 p-3 w-full">
      {/* 선수 사진 */}
      <div
        className="w-20 h-20 rounded-2xl overflow-hidden border-4 shadow-lg"
        style={{ borderColor: sideColor + "80" }}
      >
        <PlayerAvatar id={player.pid} name={player.playerName} size={80} />
      </div>

      {/* 선수 정보 */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <span className="text-xs text-gray-400">#{player.playerNumber}</span>
          <span
            className="text-[10px] font-black px-1.5 py-0.5 rounded-full text-white"
            style={{ background: typeColor }}
          >
            {pitcher ? "투수" : "타자"}
          </span>
        </div>
        <p className="font-black text-gray-900 text-base leading-tight">
          {player.playerName}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {player.playerEnter} · {player.playerMPosition}
        </p>
      </div>

      {/* 변경하기 버튼 */}
      <button
        onClick={() => setSearching(true)}
        className="mt-1 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all
                   hover:shadow-md"
        style={{
          borderColor: sideColor,
          color: sideColor,
          background: `${sideColor}08`,
        }}
      >
        변경하기
      </button>
    </div>
  );
}
