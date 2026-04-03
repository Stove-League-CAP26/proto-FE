// 팀 선택 랜딩
// · 지도: 화면 가득 채운 메인 인터랙션
// · 하단: 팀 카드 가로 슬라이드 레일
// · 호버: 해당 팀 컬러로 배경 글로우 전환
import { useState, useCallback, useRef } from "react";
import KoreaMap from "@/components/team/KoreaMap";
import { KBO_TEAMS, type Team } from "@/mock/teamData";

interface TeamLandingProps {
  onSelect: (t: Team) => void;
}

// 하단 레일 팀 카드
function TeamRailCard({
  team,
  isHovered,
  isAnyHovered,
  onHover,
  onSelect,
}: {
  team: Team;
  isHovered: boolean;
  isAnyHovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (t: Team) => void;
}) {
  return (
    <button
      onMouseEnter={() => onHover(team.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(team)}
      className="flex-shrink-0 flex flex-col items-center gap-2 px-4 py-3 rounded-2xl transition-all duration-200"
      style={{
        opacity: isAnyHovered && !isHovered ? 0.35 : 1,
        transform: isHovered
          ? "translateY(-6px) scale(1.06)"
          : "translateY(0) scale(1)",
        background: isHovered
          ? `${team.colors.primary}18`
          : "rgba(255,255,255,0.06)",
        border: `1.5px solid ${isHovered ? team.colors.primary + "60" : "rgba(255,255,255,0.1)"}`,
        boxShadow: isHovered ? `0 8px 24px ${team.colors.primary}33` : "none",
        minWidth: 80,
      }}
    >
      {/* 팀 엠블럼 원 */}

      <div
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all overflow-hidden"
        style={{
          background: team.logoUrl
            ? "white"
            : `linear-gradient(135deg, ${team.colors.primary}, ${
                team.colors.secondary === "#000000"
                  ? team.colors.accent
                  : team.colors.secondary
              })`,
          boxShadow: isHovered
            ? `0 0 18px ${team.colors.primary}77`
            : `0 2px 8px ${team.colors.primary}33`,
        }}
      >
        {team.logoUrl ? (
          <img
            src={team.logoUrl}
            alt={team.name}
            className="w-10 h-10 object-contain"
          />
        ) : (
          <span
            className="text-sm font-black"
            style={{ color: team.colors.text }}
          >
            {team.shortName.length <= 2
              ? team.shortName
              : team.shortName.slice(0, 2)}
          </span>
        )}
      </div>
      {/* 팀명 */}
      <p
        className="text-[11px] font-bold leading-tight text-center transition-colors whitespace-nowrap"
        style={{
          color: isHovered ? team.colors.primary : "rgba(255,255,255,0.7)",
        }}
      >
        {team.shortName}
      </p>
      {/* 우승 횟수 */}
      {team.championships > 0 && (
        <span
          className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
          style={{
            background: isHovered ? "#F59E0B22" : "rgba(255,255,255,0.08)",
            color: isHovered ? "#F59E0B" : "rgba(255,255,255,0.3)",
            border: isHovered ? "1px solid #F59E0B44" : "1px solid transparent",
          }}
        >
          🏆 {team.championships}
        </span>
      )}
    </button>
  );
}

export default function TeamLanding({ onSelect }: TeamLandingProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const isAnyHovered = hoveredId !== null;
  const hoveredTeam = KBO_TEAMS.find((t) => t.id === hoveredId) ?? null;

  const handleHover = useCallback((id: string | null) => setHoveredId(id), []);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden relative"
      style={{
        background:
          "linear-gradient(160deg, #070b14 0%, #0d1525 60%, #070b14 100%)",
        transition: "background 0.4s ease",
      }}
    >
      {/* 팀 컬러 배경 글로우 — 호버 시 반응 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: hoveredTeam
            ? `radial-gradient(ellipse 70% 60% at 50% 45%, ${hoveredTeam.colors.primary}28, transparent 70%)`
            : "none",
          transition: "background 0.35s ease",
        }}
      />

      {/* 상단 헤더 */}
      <div className="relative z-10 flex-shrink-0 pt-5 pb-2 text-center">
        <h1 className="text-2xl font-black text-white tracking-tight">
          KBO 팀 선택
        </h1>
        {/* 호버 시 팀명 표시 */}
        <div className="h-5 mt-1">
          {hoveredTeam ? (
            <p
              className="text-sm font-bold transition-all"
              style={{ color: hoveredTeam.colors.primary }}
            >
              {hoveredTeam.name} — 클릭하여 상세보기
            </p>
          ) : (
            <p className="text-white/20 text-xs">
              지도 마커 또는 하단 팀 카드를 클릭하세요
            </p>
          )}
        </div>
      </div>

      {/* 지도 영역 — 풀 확장 */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 min-h-0">
        {/* 지도 외곽 글로우 링 */}
        <div
          className="relative w-full flex items-center justify-center"
          style={{ maxWidth: 420, height: "100%" }}
        >
          {hoveredTeam && (
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                boxShadow: `0 0 80px ${hoveredTeam.colors.primary}22`,
                transition: "box-shadow 0.3s ease",
              }}
            />
          )}
          <div
            className="w-full rounded-3xl overflow-hidden shadow-2xl"
            style={{
              maxHeight: "calc(100vh - 220px)",
              aspectRatio: "7/9",
              border: `1px solid ${hoveredTeam ? hoveredTeam.colors.primary + "30" : "rgba(255,255,255,0.06)"}`,
              transition: "border-color 0.3s ease",
            }}
          >
            <KoreaMap
              hoveredId={hoveredId}
              onHover={handleHover}
              onSelect={onSelect}
            />
          </div>
        </div>
      </div>

      {/* 하단 팀 카드 레일 */}
      <div className="relative z-10 flex-shrink-0 pb-5 pt-2">
        {/* 좌우 페이드 마스크 */}
        <div className="relative">
          <div
            className="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
            style={{
              background: "linear-gradient(to right, #070b14, transparent)",
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
            style={{
              background: "linear-gradient(to left, #070b14, transparent)",
            }}
          />

          <div
            ref={railRef}
            className="flex gap-2.5 overflow-x-auto px-6 pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {KBO_TEAMS.map((team) => (
              <TeamRailCard
                key={team.id}
                team={team}
                isHovered={hoveredId === team.id}
                isAnyHovered={isAnyHovered}
                onHover={handleHover}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
