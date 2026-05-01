// 포지션 그룹별 선수 카드 아코디언 — 펼치기/접기 방식
// 좌우 스크롤 제거, 그리드 레이아웃으로 변경
import { useState } from "react";
import PlayerCard from "@/components/team/PlayerCard";
import type { RosterPlayer, PositionGroup } from "@/mock/teamRoster";

interface RosterSectionProps {
  title: PositionGroup;
  players: RosterPlayer[];
  teamColor: string;
  teamBg: string;
  season: 2024 | 2025 | 2026;
  onPlayerClick: (pid: number) => void;
  defaultExpanded?: boolean;
}

export default function RosterSection({
  title,
  players,
  teamColor,
  season,
  onPlayerClick,
  defaultExpanded = true,
}: RosterSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (players.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
      {/* 섹션 헤더 — 클릭으로 토글 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/70 transition-colors"
      >
        <div
          className="w-1.5 h-6 rounded-full flex-shrink-0"
          style={{ background: teamColor }}
        />
        <h4 className="text-sm font-extrabold text-gray-800">{title}</h4>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full ml-0.5"
          style={{ background: `${teamColor}18`, color: teamColor }}
        >
          {players.length}명
        </span>
        <span
          className="ml-auto text-sm font-bold transition-transform duration-200"
          style={{
            color: teamColor,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            display: "inline-block",
          }}
        >
          ▼
        </span>
      </button>

      {/* 선수 카드 그리드 — 펼쳐졌을 때 */}
      {expanded && (
        <div className="px-4 pb-4 pt-1">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
            {players.map((p) => (
              <PlayerCard
                key={p.pid}
                player={p}
                season={season}
                teamColor={teamColor}
                onClick={() => onPlayerClick(p.pid)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
