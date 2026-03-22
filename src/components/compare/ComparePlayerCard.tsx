// 선수 비교 페이지 상단에서 비교할 선수 A/B를 표시하고 변경 버튼을 제공하는 카드
import PlayerAvatar from "@/components/common/PlayerAvatar";
import { TEAM_COLORS } from "@/constants/teamColors";

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

interface ComparePlayerCardProps {
  player: ComparePlayer | null;
  side: "A" | "B";
  onChangClick: () => void;
}

export default function ComparePlayerCard({ player, side, onChangClick }: ComparePlayerCardProps) {
  const tc = TEAM_COLORS[player?.team ?? ""] || { bg: "#374151", accent: "#6b7280" };
  const isEmpty = !player;

  return (
    <div className={`flex flex-col items-center gap-3 ${side === "B" ? "items-end sm:items-center" : ""}`}>
      <div className="relative">
        <div
          className="w-24 h-24 rounded-2xl overflow-hidden border-4 flex items-center justify-center"
          style={{
            borderColor: isEmpty ? "#e5e7eb" : tc.bg,
            background: isEmpty ? "#f9fafb" : `${tc.bg}20`,
          }}
        >
          {isEmpty
            ? <span className="text-4xl text-gray-300">👤</span>
            : <PlayerAvatar id={player.img} name={player.name} size={96} />
          }
        </div>
        {!isEmpty && (
          <div
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-black text-white"
            style={{ backgroundColor: tc.bg }}
          >
            {player.no}
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="font-black text-gray-900 text-lg">{player?.name ?? "선수 없음"}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {player ? `${player.team} · ${player.pos}` : "선수를 선택하세요"}
        </p>
        {player && (
          <span
            className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-bold"
            style={{
              background: player.type === "pitcher" ? "#dbeafe" : "#fef3c7",
              color: player.type === "pitcher" ? "#1d4ed8" : "#92400e",
            }}
          >
            {player.type === "pitcher" ? "투수" : "타자"}
          </span>
        )}
      </div>
      <button
        onClick={onChangClick}
        className="px-4 py-1.5 rounded-xl text-xs font-bold border-2 transition-all hover:shadow-md"
        style={{
          borderColor: isEmpty ? "#d1d5db" : tc.bg,
          color: isEmpty ? "#6b7280" : tc.bg,
          background: isEmpty ? "#f9fafb" : `${tc.bg}10`,
        }}
      >
        {isEmpty ? "선택하기" : "변경하기"}
      </button>
    </div>
  );
}