// 팀 랜딩 좌우 패널의 팀 엠블럼 카드
// hover 시 구장 이미지 말풍선 표시
import { useState } from "react";
import type { Team } from "@/mock/teamData";

interface EmblemCardProps {
  team: Team;
  isHovered: boolean;
  isAnyHovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (t: Team) => void;
  side: "left" | "right";
}

export default function EmblemCard({
  team,
  isHovered,
  isAnyHovered,
  onHover,
  onSelect,
  side,
}: EmblemCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => onHover(team.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* 구장 말풍선 — imageUrl 있을 때만 */}
      {isHovered && team.stadium.imageUrl && (
        <div
          className="absolute z-50 w-52"
          style={{
            bottom: "calc(100% + 8px)",
            left: side === "left" ? "0" : "auto",
            right: side === "right" ? "0" : "auto",
            animation: "fadeInUp 0.15s ease-out",
          }}
        >
          <div
            className="rounded-xl overflow-hidden shadow-2xl border border-white/10"
            style={{ background: "#0f1829" }}
          >
            {!imgError ? (
              <img
                src={team.stadium.imageUrl}
                alt={team.stadium.name}
                className="w-full h-28 object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className="w-full h-28 flex items-center justify-center text-4xl"
                style={{
                  background: `linear-gradient(135deg, ${team.colors.bg}, ${team.colors.accent}44)`,
                }}
              >
                🏟️
              </div>
            )}
            <div className="px-3 py-2">
              <p className="text-white text-xs font-bold truncate">
                {team.stadium.name}
              </p>
              <p className="text-slate-400 text-[10px] mt-0.5">
                수용 {team.stadium.capacity.toLocaleString()}명 ·{" "}
                {team.stadium.roofType}
              </p>
            </div>
          </div>
          <div
            className="absolute -bottom-1.5 h-3 w-3 rotate-45 border-r border-b border-white/10"
            style={{
              background: "#0f1829",
              left: side === "left" ? "20px" : "auto",
              right: side === "right" ? "20px" : "auto",
            }}
          />
        </div>
      )}

      <button
        onClick={() => onSelect(team)}
        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all duration-200"
        style={{
          flexDirection: side === "left" ? "row" : "row-reverse",
          background: isHovered
            ? `linear-gradient(135deg, ${team.colors.primary}22, ${team.colors.secondary === "#000000" ? "#ffffff11" : team.colors.secondary + "11"})`
            : "rgba(255,255,255,0.03)",
          border: `1px solid ${isHovered ? team.colors.primary + "66" : "rgba(255,255,255,0.06)"}`,
          opacity: isAnyHovered && !isHovered ? 0.3 : 1,
          transform: isHovered ? "scale(1.04)" : "scale(1)",
          boxShadow: isHovered ? `0 0 20px ${team.colors.primary}33` : "none",
        }}
      >
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-black"
          style={{
            background: `linear-gradient(135deg, ${team.colors.primary}, ${team.colors.secondary === "#000000" ? team.colors.accent : team.colors.secondary})`,
            color: team.colors.text,
            boxShadow: isHovered ? `0 0 14px ${team.colors.primary}88` : "none",
          }}
        >
          {team.shortName.slice(0, 2)}
        </div>
        <div
          className={side === "left" ? "text-left" : "text-right"}
          style={{ flex: 1, minWidth: 0 }}
        >
          <p className="text-white text-[11px] font-bold leading-tight truncate">
            {team.name}
          </p>
          <div
            className="flex items-center gap-1 mt-0.5"
            style={{
              justifyContent: side === "right" ? "flex-end" : "flex-start",
            }}
          >
            {team.championships > 0 && (
              <span className="text-amber-400 text-[9px]">
                🏆{team.championships}
              </span>
            )}
            <span className="text-slate-500 text-[9px]">{team.city}</span>
          </div>
        </div>
      </button>
    </div>
  );
}
