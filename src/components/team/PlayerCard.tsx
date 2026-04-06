// PlayerCard — 그리드 친화적, 고정 너비 제거 (컨테이너가 크기 결정)
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
      className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-150
                 hover:scale-105 active:scale-95 bg-white border border-gray-100
                 hover:border-gray-200 hover:shadow-md w-full"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
    >
      {/* 선수 사진 - 정사각형 비율 */}
      <div
        className="w-full aspect-square rounded-lg overflow-hidden relative"
        style={{ background: `${teamColor}10` }}
      >
        <PlayerAvatar id={player.pid} name={player.name} size={80} />
        {/* 등번호 뱃지 */}
        <span
          className="absolute bottom-0 right-0 text-[9px] font-black px-1 py-0.5
                     rounded-tl-lg text-white leading-none"
          style={{ background: `${teamColor}ee` }}
        >
          #{player.number}
        </span>
      </div>

      {/* 포지션 뱃지 */}
      <span
        className="text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none"
        style={{ background: `${posColor}18`, color: posColor }}
      >
        {player.position}
      </span>

      {/* 선수명 */}
      <p
        className="text-gray-800 text-[11px] font-bold text-center leading-tight
                    w-full truncate px-0.5"
      >
        {player.name}
      </p>
    </button>
  );
}
