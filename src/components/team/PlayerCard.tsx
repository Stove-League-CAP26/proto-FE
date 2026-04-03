// PlayerHeroBanner와 동일하게 PlayerAvatar 컴포넌트 사용
import {} from "react";
import PlayerAvatar from "@/components/common/PlayerAvatar";
import type { RosterPlayer } from "@/mock/teamRoster";
import { POS_COLORS } from "@/constants/teamConstants";

interface PlayerCardProps {
  player: RosterPlayer;
  season: 2024 | 2025;
  teamColor: string;
  onClick: () => void;
}

export default function PlayerCard({
  player,
  season,
  teamColor,
  onClick,
}: PlayerCardProps) {
  const posColor = POS_COLORS[player.position] ?? "#6B7280";

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-28 flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-150 hover:scale-105 active:scale-95 bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
    >
      {/* PlayerHeroBanner와 동일한 방식: PlayerAvatar 사용 */}
      <div
        className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative"
        style={{ background: `${teamColor}12` }}
      >
        <PlayerAvatar id={player.pid} name={player.name} size={80} />
        {/* 등번호 뱃지 */}
        <span
          className="absolute bottom-0 right-0 text-[9px] font-black px-1.5 py-0.5 rounded-tl-xl text-white"
          style={{ background: teamColor + "ee" }}
        >
          #{player.number}
        </span>
      </div>

      {/* 포지션 뱃지 */}
      <span
        className="text-[10px] font-black px-2 py-0.5 rounded-full"
        style={{ background: posColor + "18", color: posColor }}
      >
        {player.position}
      </span>

      {/* 선수명 */}
      <p className="text-gray-800 text-[11px] font-bold text-center leading-tight line-clamp-2 w-full">
        {player.name}
      </p>
    </button>
  );
}
