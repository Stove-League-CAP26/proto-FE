// 선수 비교 페이지에서 비교할 선수를 검색/선택하는 모달
// 이름, 팀, 포지션으로 필터링 가능하고 선택 시 onSelect 콜백 호출
import { useState } from "react";
import PlayerAvatar from "@/components/common/PlayerAvatar";
import { TEAM_COLORS } from "@/constants/teamColors";
import { COMPARE_PLAYERS } from "@/mock/compareData";

interface ComparePlayer {
  id: number;
  name: string;
  team: string;
  pos: string;
  type: "hitter" | "pitcher";
  no: number;
  img: number;
  stats: Record<string, any>;
}

interface PlayerSelectModalProps {
  onSelect: (player: ComparePlayer) => void;
  onClose: () => void;
  excludeId: number | null;
}

export default function PlayerSelectModal({ onSelect, onClose, excludeId }: PlayerSelectModalProps) {
  const [search, setSearch] = useState("");

  const filtered = COMPARE_PLAYERS.filter(
    (p) =>
      p.id !== excludeId &&
      (p.name.includes(search) || p.team.includes(search) || p.pos.includes(search)),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100" style={{ background: "#1a1a2e" }}>
          <h3 className="font-black text-white text-base">선수 찾기</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5">
              <span className="text-white/50 text-sm">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="이름, 팀, 포지션 검색..."
                className="bg-transparent text-white text-sm outline-none placeholder-white/30 w-36"
              />
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white text-lg font-bold transition-colors">
              ✕
            </button>
          </div>
        </div>
        <div className="p-4 grid grid-cols-4 gap-3 max-h-72 overflow-y-auto">
          {filtered.map((p) => {
            const tc = TEAM_COLORS[p.team] || { bg: "#64748b", accent: "#94a3b8" };
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p as ComparePlayer)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-blue-400 transition-colors">
                  <PlayerAvatar id={p.img} name={p.name} size={56} />
                </div>
                <p className="text-xs font-bold text-gray-800 text-center leading-tight">{p.name}</p>
                <p className="text-xs text-gray-400">{p.team}</p>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: p.type === "pitcher" ? "#dbeafe" : "#fef3c7",
                    color: p.type === "pitcher" ? "#1d4ed8" : "#92400e",
                  }}
                >
                  {p.type === "pitcher" ? "투수" : "타자"}
                </span>
                <button
                  className="w-full mt-0.5 text-xs font-bold py-1 rounded-lg bg-gray-100 group-hover:bg-blue-500 group-hover:text-white text-gray-500 transition-all"
                  style={{ borderColor: tc.bg }}
                >
                  선택하기
                </button>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}