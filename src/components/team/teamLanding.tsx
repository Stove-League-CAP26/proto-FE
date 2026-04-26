// src/components/team/TeamLanding.tsx
// · 남한 SVG 지도 (public/images/south-korea.svg) — img + 절대좌표 마커 오버레이
// · 잠실(LG+두산) 공동구장: 호버 시 팀 선택 팝업
// · 좌우 5팀 카드 리스트 유지

import { useState, useCallback, useRef } from "react";
import { KBO_TEAMS, LEFT_TEAMS, RIGHT_TEAMS, type Team } from "@/mock/teamData";

interface TeamLandingProps {
  onSelect: (t: Team) => void;
}

const stadiumUrl = (id: string) => `/images/stadium/${id}.png`;
const logoUrl = (id: string) => `/images/teams/${id}.png`;

// ── 위도경도 → SVG px 좌표 (viewBox 800×1200, translate 106.96 19.46) ───────
// 캘리브레이션: SSG 인천(126.693, 37.437) → (226, 242)
//               롯데 부산(129.061, 35.194) → (597, 719)
function lngLatToSVG(lng: number, lat: number): { x: number; y: number } {
  const SCALE_X = 156.7; // px/°
  const SCALE_Y = -212.7; // px/° (북위 증가 → y 감소)
  const REF_LNG = 126.693;
  const REF_X = 226;
  const REF_LAT = 37.437;
  const REF_Y = 242;
  return {
    x: REF_X + (lng - REF_LNG) * SCALE_X,
    y: REF_Y + (lat - REF_LAT) * SCALE_Y,
  };
}

// SVG px → 컨테이너 % (img는 800×1200 비율로 표시)
function svgToPercent(x: number, y: number) {
  return { xPct: (x / 800) * 100, yPct: (y / 1200) * 100 };
}

// ── 구장 위도경도 ────────────────────────────────────────────────────────────
const STADIUM_LATLON: Record<string, { lat: number; lng: number }> = {
  ssg: { lat: 37.437, lng: 126.693 }, // 인천 SSG 랜더스필드
  kiwoom: { lat: 37.499, lng: 126.867 }, // 서울 고척 스카이돔
  lg: { lat: 37.512, lng: 127.072 }, // 서울 잠실 (공동)
  doosan: { lat: 37.512, lng: 127.072 }, // 서울 잠실 (공동)
  kt: { lat: 37.299, lng: 127.01 }, // 수원 KT 위즈파크
  hanwha: { lat: 36.317, lng: 127.43 }, // 대전 한화생명이글스파크
  kia: { lat: 35.168, lng: 126.889 }, // 광주 기아 챔피언스필드
  samsung: { lat: 35.841, lng: 128.681 }, // 대구 삼성 라이온즈파크
  nc: { lat: 35.223, lng: 128.583 }, // 창원 NC 파크
  lotte: { lat: 35.194, lng: 129.061 }, // 부산 사직야구장
};

// 사전 계산 좌표
const MAP_SVG: Record<string, { x: number; y: number }> = Object.fromEntries(
  Object.entries(STADIUM_LATLON).map(([id, { lat, lng }]) => [
    id,
    lngLatToSVG(lng, lat),
  ]),
);
const MAP_PCT: Record<string, { xPct: number; yPct: number }> =
  Object.fromEntries(
    Object.entries(MAP_SVG).map(([id, { x, y }]) => [id, svgToPercent(x, y)]),
  );

const JAMSIL_PCT = MAP_PCT["lg"];

// ── 구장 툴팁 ────────────────────────────────────────────────────────────────
function StadiumTooltip({
  team,
  side,
}: {
  team: Team;
  side: "left" | "right";
}) {
  const [err, setErr] = useState(false);
  const pos =
    side === "left"
      ? "left-full top-1/2 -translate-y-1/2 ml-3"
      : "right-full top-1/2 -translate-y-1/2 mr-3";
  return (
    <div
      className={`absolute ${pos} z-50 w-52 rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-white pointer-events-none`}
      style={{ animation: "stFadeIn 0.15s ease-out" }}
    >
      {!err ? (
        <img
          src={stadiumUrl(team.id)}
          alt={team.stadium.name}
          className="w-full h-28 object-cover"
          onError={() => setErr(true)}
        />
      ) : (
        <div
          className="w-full h-28 flex flex-col items-center justify-center gap-1"
          style={{ background: `${team.colors.primary}12` }}
        >
          <span className="text-4xl">🏟️</span>
          <span className="text-xs text-gray-400">{team.stadium.name}</span>
        </div>
      )}
      <div className="px-3 py-2.5">
        <p
          className="font-black text-sm"
          style={{ color: team.colors.primary }}
        >
          {team.name}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{team.stadium.name}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {team.stadium.capacity.toLocaleString()}명 · {team.stadium.roofType}
        </p>
      </div>
    </div>
  );
}

// ── 팀 카드 (좌/우) ──────────────────────────────────────────────────────────
function TeamCard({
  team,
  globalActiveId,
  onCardHover,
  onSelect,
  side,
}: {
  team: Team;
  globalActiveId: string | null;
  onCardHover: (id: string | null) => void;
  onSelect: (t: Team) => void;
  side: "left" | "right";
}) {
  const isActive = globalActiveId === team.id;
  const isDimmed = globalActiveId !== null && !isActive;
  return (
    <div className="relative">
      <button
        onMouseEnter={() => onCardHover(team.id)}
        onMouseLeave={() => onCardHover(null)}
        onClick={() => onSelect(team)}
        className="w-full px-3 py-2.5 rounded-xl border transition-all duration-200"
        style={{
          background: isActive ? `${team.colors.primary}08` : "white",
          borderColor: isActive ? `${team.colors.primary}50` : "#f1f5f9",
          boxShadow: isActive
            ? `0 4px 16px ${team.colors.primary}18`
            : "0 1px 3px rgba(0,0,0,0.04)",
          opacity: isDimmed ? 0.3 : 1,
          transform: isActive ? "scale(1.03)" : "scale(1)",
        }}
      >
        <div
          className={`flex items-center gap-2.5 ${side === "right" ? "flex-row-reverse" : ""}`}
        >
          <div
            className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden border-2 flex items-center justify-center"
            style={{
              borderColor: isActive
                ? team.colors.primary
                : `${team.colors.primary}40`,
              background: "white",
              boxShadow: isActive
                ? `0 0 0 3px ${team.colors.primary}20`
                : "none",
            }}
          >
            <img
              src={logoUrl(team.id)}
              alt={team.shortName}
              className="w-7 h-7 object-contain"
              onError={(e) => {
                const el = e.currentTarget;
                el.style.display = "none";
                const p = el.parentElement;
                if (p) {
                  p.style.background = team.colors.primary;
                  p.innerHTML = `<span style="font-size:10px;font-weight:900;color:${team.colors.text}">${team.shortName.slice(0, 2)}</span>`;
                }
              }}
            />
          </div>
          <div
            className={`flex-1 min-w-0 ${side === "right" ? "text-right" : ""}`}
          >
            <p
              className="text-sm font-black leading-tight"
              style={{ color: isActive ? team.colors.primary : "#1e293b" }}
            >
              {team.shortName}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-none">
              {team.city}
            </p>
          </div>
        </div>
      </button>
      {isActive && <StadiumTooltip team={team} side={side} />}
    </div>
  );
}

// ── 지도 마커 (단일팀) ────────────────────────────────────────────────────────
function TeamMarker({
  team,
  isActive,
  isDimmed,
  onEnter,
  onLeave,
  onClick,
}: {
  team: Team;
  isActive: boolean;
  isDimmed: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const pct = MAP_PCT[team.id];
  return (
    <div
      className="absolute cursor-pointer"
      style={{
        left: `${pct.xPct}%`,
        top: `${pct.yPct}%`,
        transform: "translate(-50%, -50%)",
        opacity: isDimmed ? 0.2 : 1,
        transition: "opacity 0.2s",
        zIndex: isActive ? 20 : 10,
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {/* 광채 */}
      {isActive && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            width: 42,
            height: 42,
            left: -7,
            top: -7,
            background: team.colors.primary,
            opacity: 0.15,
          }}
        />
      )}
      {/* 원 */}
      <div
        className="w-7 h-7 rounded-full bg-white flex items-center justify-center overflow-hidden"
        style={{
          border: `${isActive ? 2.5 : 1.5}px solid ${team.colors.primary}`,
          boxShadow: isActive
            ? `0 2px 8px ${team.colors.primary}55`
            : "0 1px 4px rgba(0,0,0,0.15)",
          transition: "border-width 0.15s",
        }}
      >
        <img
          src={logoUrl(team.id)}
          alt={team.shortName}
          className="w-5 h-5 object-contain"
          onError={(e) => {
            const img = e.currentTarget;
            img.style.display = "none";
          }}
        />
      </div>
      {/* 팝업 라벨 */}
      {isActive && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-0.5 rounded-md text-white text-[9px] font-black whitespace-nowrap"
          style={{ background: team.colors.primary }}
        >
          {team.shortName}
        </div>
      )}
    </div>
  );
}

// ── 잠실 공동 마커 ────────────────────────────────────────────────────────────
function JamsilMarker({
  jamsilActive,
  isDimmed,
  onEnter,
  onLeave,
}: {
  jamsilActive: boolean;
  isDimmed: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <div
      className="absolute cursor-pointer"
      style={{
        left: `${JAMSIL_PCT.xPct}%`,
        top: `${JAMSIL_PCT.yPct}%`,
        transform: "translate(-50%, -50%)",
        opacity: isDimmed ? 0.2 : 1,
        transition: "opacity 0.2s",
        zIndex: jamsilActive ? 20 : 10,
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {jamsilActive && (
        <div
          className="absolute rounded-full"
          style={{
            width: 46,
            height: 46,
            left: -8,
            top: -8,
            background: "#8B5CF6",
            opacity: 0.12,
          }}
        />
      )}
      {/* 반반 로고 원 */}
      <div
        className="w-8 h-8 rounded-full bg-white overflow-hidden flex items-center justify-center relative"
        style={{
          border: `${jamsilActive ? 2.5 : 1.5}px solid ${jamsilActive ? "#8B5CF6" : "#CBD5E1"}`,
          boxShadow: jamsilActive
            ? "0 2px 10px rgba(139,92,246,0.4)"
            : "0 1px 4px rgba(0,0,0,0.15)",
        }}
      >
        {/* LG 좌측 */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: "inset(0 50% 0 0)" }}
        >
          <img
            src={logoUrl("lg")}
            alt="LG"
            className="w-6 h-6 object-contain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </div>
        {/* 두산 우측 */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: "inset(0 0 0 50%)" }}
        >
          <img
            src={logoUrl("doosan")}
            alt="두산"
            className="w-6 h-6 object-contain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </div>
        {/* 중앙선 */}
        <div className="absolute top-0 bottom-0 w-px bg-white left-1/2" />
      </div>
      {/* 팝업 라벨 */}
      {jamsilActive && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-0.5 rounded-md bg-purple-500 text-white text-[9px] font-black whitespace-nowrap">
          LG · 두산 (잠실)
        </div>
      )}
    </div>
  );
}

// ── 잠실 팀 선택 팝업 ────────────────────────────────────────────────────────
function JamsilPicker({ onSelect }: { onSelect: (t: Team) => void }) {
  const lgTeam = KBO_TEAMS.find((t) => t.id === "lg")!;
  const doosanTeam = KBO_TEAMS.find((t) => t.id === "doosan")!;
  return (
    <div
      className="absolute z-50 bg-white rounded-2xl shadow-2xl border border-purple-100 p-3 w-52"
      style={{
        left: `${JAMSIL_PCT.xPct}%`,
        top: `${JAMSIL_PCT.yPct}%`,
        transform: "translate(-50%, calc(-100% - 36px))",
        animation: "stFadeIn 0.15s ease-out",
      }}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
        style={{
          borderLeft: "7px solid transparent",
          borderRight: "7px solid transparent",
          borderTop: "8px solid white",
        }}
      />
      <p className="text-[10px] font-black text-purple-400 text-center mb-2.5 tracking-widest">
        잠실야구장 — 팀 선택
      </p>
      <div className="flex gap-2">
        {[lgTeam, doosanTeam].map((team) => (
          <button
            key={team.id}
            onClick={() => onSelect(team)}
            className="flex-1 flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95"
            style={{
              borderColor: `${team.colors.primary}30`,
              background: `${team.colors.primary}06`,
            }}
          >
            <div
              className="w-9 h-9 rounded-full overflow-hidden border-2 flex items-center justify-center bg-white"
              style={{ borderColor: team.colors.primary }}
            >
              <img
                src={logoUrl(team.id)}
                alt={team.shortName}
                className="w-7 h-7 object-contain"
              />
            </div>
            <p
              className="text-[11px] font-black"
              style={{ color: team.colors.primary }}
            >
              {team.shortName}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
export default function TeamLanding({ onSelect }: TeamLandingProps) {
  const [cardHoveredId, setCardHoveredId] = useState<string | null>(null);
  const [mapHoveredId, setMapHoveredId] = useState<string | null>(null);
  const [jamsilHovered, setJamsilHovered] = useState(false);

  const globalActiveId = cardHoveredId ?? (jamsilHovered ? null : mapHoveredId);
  const activeTeam = KBO_TEAMS.find((t) => t.id === globalActiveId);

  const handleCardHover = useCallback(
    (id: string | null) => setCardHoveredId(id),
    [],
  );
  const handleMapHover = useCallback(
    (id: string | null) => setMapHoveredId(id),
    [],
  );
  const handleJamsilEnter = useCallback(() => setJamsilHovered(true), []);
  const handleJamsilLeave = useCallback(() => setJamsilHovered(false), []);

  // 잠실 제외 단독팀
  const soloTeams = KBO_TEAMS.filter((t) => t.id !== "lg" && t.id !== "doosan");

  const jamsilActive =
    jamsilHovered || globalActiveId === "lg" || globalActiveId === "doosan";
  const jamsilDimmed =
    (globalActiveId !== null || jamsilHovered) && !jamsilActive;

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-4 py-5 text-center">
        <h1 className="text-xl font-black text-gray-900">KBO 팀 선택</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          팀을 클릭하면 상세 정보를 확인할 수 있습니다
        </p>
      </div>

      {/* 3열 레이아웃 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: "190px 1fr 190px" }}
        >
          {/* 좌측 5팀 */}
          <div className="flex flex-col gap-2 justify-center">
            {LEFT_TEAMS.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                globalActiveId={globalActiveId}
                onCardHover={handleCardHover}
                onSelect={onSelect}
                side="left"
              />
            ))}
          </div>

          {/* 중앙 지도 */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-full rounded-3xl bg-white border border-blue-100 relative overflow-hidden"
              style={{
                boxShadow:
                  "0 8px 40px rgba(59,130,246,0.08), 0 2px 8px rgba(0,0,0,0.04)",
                aspectRatio: "800 / 1100",
              }}
            >
              {/* 남한 지도 img */}
              <img
                src="/images/south-korea.svg"
                alt="대한민국 지도"
                className="absolute inset-0 w-full h-full object-contain p-2"
                style={{
                  filter: "drop-shadow(0 2px 8px rgba(59,130,246,0.12))",
                  objectPosition: "center top",
                }}
                draggable={false}
              />

              {/* 마커 오버레이 레이어 */}
              <div className="absolute inset-0">
                {/* 단독팀 마커 */}
                {soloTeams.map((team) => (
                  <TeamMarker
                    key={team.id}
                    team={team}
                    isActive={globalActiveId === team.id}
                    isDimmed={
                      (globalActiveId !== null || jamsilHovered) &&
                      globalActiveId !== team.id
                    }
                    onEnter={() => handleMapHover(team.id)}
                    onLeave={() => handleMapHover(null)}
                    onClick={() => onSelect(team)}
                  />
                ))}

                {/* 잠실 마커 */}
                <JamsilMarker
                  jamsilActive={jamsilActive}
                  isDimmed={jamsilDimmed}
                  onEnter={handleJamsilEnter}
                  onLeave={handleJamsilLeave}
                />

                {/* 잠실 팀 선택 팝업 */}
                {jamsilHovered && <JamsilPicker onSelect={onSelect} />}
              </div>
            </div>

            {/* 하단 팀명 표시 */}
            <div className="h-8 flex items-center">
              {jamsilHovered ? (
                <div className="px-5 py-1.5 rounded-full text-sm font-black text-white bg-purple-500">
                  잠실야구장 — LG 또는 두산 선택
                </div>
              ) : activeTeam ? (
                <div
                  className="px-5 py-1.5 rounded-full text-sm font-black text-white"
                  style={{ background: activeTeam.colors.primary }}
                >
                  {activeTeam.name} — 클릭하여 상세보기
                </div>
              ) : (
                <p className="text-xs text-gray-400">
                  지도 마커 또는 팀 카드를 클릭하세요
                </p>
              )}
            </div>
          </div>

          {/* 우측 5팀 */}
          <div className="flex flex-col gap-2 justify-center">
            {RIGHT_TEAMS.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                globalActiveId={globalActiveId}
                onCardHover={handleCardHover}
                onSelect={onSelect}
                side="right"
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes stFadeIn {
          from { opacity: 0; transform: translate(-50%, calc(-100% - 32px)); }
          to   { opacity: 1; transform: translate(-50%, calc(-100% - 36px)); }
        }
      `}</style>
    </div>
  );
}
