// 포지션 그룹별 선수 카드 가로 스크롤 — 라이트 테마
import { useState, useCallback, useEffect, useRef } from "react";
import PlayerCard from "@/components/team/PlayerCard";
import type { RosterPlayer, PositionGroup } from "@/mock/teamRoster";

interface RosterSectionProps {
  title: PositionGroup;
  players: RosterPlayer[];
  teamColor: string;
  teamBg: string; // 하위 호환 유지 (사용 안 함)
  season: 2024 | 2025;
  onPlayerClick: (pid: number) => void;
}

export default function RosterSection({
  title,
  players,
  teamColor,
  season,
  onPlayerClick,
}: RosterSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el.removeEventListener("scroll", checkScroll);
  }, [checkScroll, players]);

  const scroll = (dir: "left" | "right") =>
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -240 : 240,
      behavior: "smooth",
    });

  if (players.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {/* 섹션 헤더 */}
      <div className="flex items-center gap-2">
        <div
          className="w-1 h-4 rounded-full"
          style={{ background: teamColor }}
        />
        <h4 className="text-sm font-extrabold text-gray-700">{title}</h4>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: `${teamColor}15`, color: teamColor }}
        >
          {players.length}명
        </span>
      </div>

      {/* 스크롤 영역 */}
      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 z-10 w-7 h-7 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform bg-white border border-gray-200 text-gray-600"
            style={{ color: teamColor }}
          >
            ‹
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 z-10 w-7 h-7 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform bg-white border border-gray-200"
            style={{ color: teamColor }}
          >
            ›
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto py-1"
          style={{ scrollbarWidth: "none" }}
        >
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

        {/* 페이드 마스크 — 흰색 배경 기준 */}
        {canScrollLeft && (
          <div
            className="absolute left-0 top-0 bottom-0 w-10 pointer-events-none"
            style={{
              background: "linear-gradient(to right, white, transparent)",
            }}
          />
        )}
        {canScrollRight && (
          <div
            className="absolute right-0 top-0 bottom-0 w-10 pointer-events-none"
            style={{
              background: "linear-gradient(to left, white, transparent)",
            }}
          />
        )}
      </div>
    </div>
  );
}
