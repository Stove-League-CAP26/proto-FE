// src/components/team/TeamLanding.tsx
// · SVG 한반도 지도 — 실제 위도경도 기반 정확한 마커 배치
// · 잠실(LG+두산) 공동구장: 호버 시 팀 선택 팝업
// · 좌우 5팀 카드 리스트 유지

import { useState, useCallback } from "react";
import { KBO_TEAMS, LEFT_TEAMS, RIGHT_TEAMS, type Team } from "@/mock/teamData";
import { KOREA_PATH } from "@/constants/teamConstants";

interface TeamLandingProps {
  onSelect: (t: Team) => void;
}

const stadiumUrl = (id: string) => `/images/stadium/${id}.png`;
const logoUrl = (id: string) => `/images/teams/${id}.png`;

// ── 위도경도 → SVG 좌표 변환 ─────────────────────────────────
// viewBox: 320 × 390, 경로 transform: scale(1.3) translate(-31,-7)
// 기준점 보정: SSG 인천(NW) ↔ 롯데 부산(SE) 두 점으로 캘리브레이션
//   lng 126.693 → x 104  /  lng 129.061 → x 198   scale_x ≈ 40.4 px/°
//   lat 37.437  → y 143  /  lat 35.194  → y 278    scale_y ≈ -60.0 px/°

function lngLatToSVG(lng: number, lat: number): { x: number; y: number } {
  const SCALE_X = 40.4;
  const SCALE_Y = -60.0;
  const REF_LNG = 126.693;
  const REF_X = 104;
  const REF_LAT = 37.437;
  const REF_Y = 143;
  return {
    x: Math.round(REF_X + (lng - REF_LNG) * SCALE_X),
    y: Math.round(REF_Y + (lat - REF_LAT) * SCALE_Y),
  };
}

// ── 각 팀 구장 위도경도 ──────────────────────────────────────
const STADIUM_LATLON: Record<string, { lat: number; lng: number }> = {
  ssg: { lat: 37.437, lng: 126.693 }, // 인천 SSG 랜더스필드
  kiwoom: { lat: 37.4985, lng: 126.8672 }, // 서울 고척 스카이돔
  lg: { lat: 37.5122, lng: 127.0719 }, // 서울 잠실야구장
  doosan: { lat: 37.5122, lng: 127.0719 }, // 서울 잠실야구장 (공동)
  kt: { lat: 37.299, lng: 127.0097 }, // 수원 KT 위즈파크
  hanwha: { lat: 36.3172, lng: 127.4295 }, // 대전 한화생명이글스파크
  kia: { lat: 35.168, lng: 126.8891 }, // 광주 기아 챔피언스필드
  samsung: { lat: 35.8412, lng: 128.6814 }, // 대구 삼성 라이온즈파크
  nc: { lat: 35.2225, lng: 128.5826 }, // 창원 NC 파크
  lotte: { lat: 35.1938, lng: 129.0611 }, // 부산 사직야구장
};

// 사전 계산된 SVG 좌표 (런타임에 계산되지만 상수로 캐싱)
const MAP_COORDS: Record<string, { x: number; y: number }> = Object.fromEntries(
  Object.entries(STADIUM_LATLON).map(([id, { lat, lng }]) => [
    id,
    lngLatToSVG(lng, lat),
  ]),
);

// 잠실 공동 좌표 (LG=Doosan 이므로 하나만)
const JAMSIL = MAP_COORDS["lg"]; // { x:≈125, y:≈131 }

// ── 구장 툴팁 (카드 옆 표시) ─────────────────────────────────
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

// ── 팀 카드 (좌/우 리스트) ────────────────────────────────────
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

// ── SVG 지도 ─────────────────────────────────────────────────
function KoreaMap({
  globalActiveId,
  jamsilHovered,
  onMapHover,
  onJamsilHover,
  onSelect,
}: {
  globalActiveId: string | null;
  jamsilHovered: boolean;
  onMapHover: (id: string | null) => void;
  onJamsilHover: (v: boolean) => void;
  onSelect: (t: Team) => void;
}) {
  // 잠실 제외 단독 팀
  const soloTeams = KBO_TEAMS.filter((t) => t.id !== "lg" && t.id !== "doosan");
  const lgTeam = KBO_TEAMS.find((t) => t.id === "lg")!;
  const doosanTeam = KBO_TEAMS.find((t) => t.id === "doosan")!;

  const jamsilActive =
    jamsilHovered || globalActiveId === "lg" || globalActiveId === "doosan";

  return (
    <svg
      viewBox="0 0 320 390"
      className="w-full h-full"
      style={{ filter: "drop-shadow(0 4px 20px rgba(59,130,246,0.10))" }}
    >
      <defs>
        <linearGradient id="lg-land" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EFF6FF" />
          <stop offset="100%" stopColor="#DBEAFE" />
        </linearGradient>
        <pattern
          id="pg-sea"
          x="0"
          y="0"
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 6 Q3 4 6 6 Q9 8 12 6"
            fill="none"
            stroke="#BFDBFE"
            strokeWidth="0.6"
            opacity="0.5"
          />
        </pattern>
        {/* 잠실 클립 */}
        <clipPath id="clip-m-jamsil">
          <circle cx={JAMSIL.x} cy={JAMSIL.y} r="14" />
        </clipPath>
        {/* 단독팀 클립 */}
        {soloTeams.map((t) => {
          const c = MAP_COORDS[t.id];
          return (
            <clipPath key={t.id} id={`clip-m-${t.id}`}>
              <circle cx={c.x} cy={c.y} r="12" />
            </clipPath>
          );
        })}
      </defs>

      {/* 바다 */}
      <rect width="320" height="390" fill="url(#pg-sea)" rx="18" />
      <rect width="320" height="390" fill="#F0F9FF" opacity="0.55" rx="18" />

      {/* 한반도 */}
      <g transform="scale(1.3) translate(-31, -7)">
        <path
          d={KOREA_PATH}
          fill="url(#lg-land)"
          stroke="#93C5FD"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </g>

      {/* ── 단독팀 마커 ── */}
      {soloTeams.map((team) => {
        const c = MAP_COORDS[team.id];
        const isActive = globalActiveId === team.id;
        const isDimmed =
          (globalActiveId !== null || jamsilHovered) && !isActive;
        return (
          <g
            key={team.id}
            style={{
              cursor: "pointer",
              opacity: isDimmed ? 0.2 : 1,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={() => onMapHover(team.id)}
            onMouseLeave={() => onMapHover(null)}
            onClick={() => onSelect(team)}
          >
            {isActive && (
              <circle
                cx={c.x}
                cy={c.y}
                r="21"
                fill={team.colors.primary}
                opacity="0.13"
              />
            )}
            <circle
              cx={c.x}
              cy={c.y}
              r="14"
              fill="white"
              stroke={team.colors.primary}
              strokeWidth={isActive ? 2.5 : 1.5}
              style={{
                filter: isActive
                  ? `drop-shadow(0 2px 8px ${team.colors.primary}55)`
                  : "none",
                transition: "stroke-width 0.15s",
              }}
            />
            <image
              href={logoUrl(team.id)}
              x={c.x - 10}
              y={c.y - 10}
              width="20"
              height="20"
              clipPath={`url(#clip-m-${team.id})`}
              preserveAspectRatio="xMidYMid meet"
            />
            {isActive && (
              <g>
                <rect
                  x={c.x - 27}
                  y={c.y - 34}
                  width="54"
                  height="15"
                  rx="5"
                  fill={team.colors.primary}
                />
                <text
                  x={c.x}
                  y={c.y - 26}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="7"
                  fontWeight="800"
                  fill="white"
                  style={{ userSelect: "none" }}
                >
                  {team.shortName}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* ── 잠실 공동 마커 (LG + 두산) ── */}
      <g
        style={{
          cursor: "pointer",
          opacity: globalActiveId !== null && !jamsilActive ? 0.2 : 1,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={() => onJamsilHover(true)}
        onMouseLeave={() => onJamsilHover(false)}
      >
        {/* 광채 */}
        {jamsilActive && (
          <circle
            cx={JAMSIL.x}
            cy={JAMSIL.y}
            r="24"
            fill="#8B5CF6"
            opacity="0.12"
          />
        )}
        {/* 바깥 원 — 두산 색 */}
        <circle
          cx={JAMSIL.x}
          cy={JAMSIL.y}
          r="17"
          fill="white"
          stroke={jamsilActive ? "#8B5CF6" : "#CBD5E1"}
          strokeWidth={jamsilActive ? 2.5 : 1.5}
          style={{
            filter: jamsilActive
              ? "drop-shadow(0 2px 10px rgba(139,92,246,0.4))"
              : "none",
          }}
        />
        {/* 반반 로고 영역 */}
        {/* LG 로고 - 왼쪽 절반 */}
        <clipPath id="clip-jamsil-lg">
          <rect x={JAMSIL.x - 14} y={JAMSIL.y - 14} width="14" height="28" />
        </clipPath>
        <image
          href={logoUrl("lg")}
          x={JAMSIL.x - 13}
          y={JAMSIL.y - 13}
          width="26"
          height="26"
          clipPath="url(#clip-jamsil-lg)"
          preserveAspectRatio="xMidYMid meet"
        />
        {/* 두산 로고 - 오른쪽 절반 */}
        <clipPath id="clip-jamsil-doosan">
          <rect x={JAMSIL.x} y={JAMSIL.y - 14} width="14" height="28" />
        </clipPath>
        <image
          href={logoUrl("doosan")}
          x={JAMSIL.x - 13}
          y={JAMSIL.y - 13}
          width="26"
          height="26"
          clipPath="url(#clip-jamsil-doosan)"
          preserveAspectRatio="xMidYMid meet"
        />
        {/* 중앙 구분선 */}
        <line
          x1={JAMSIL.x}
          y1={JAMSIL.y - 13}
          x2={JAMSIL.x}
          y2={JAMSIL.y + 13}
          stroke="white"
          strokeWidth="1.5"
        />
        {/* 호버 라벨 */}
        {jamsilActive && !jamsilHovered && (
          <g>
            <rect
              x={JAMSIL.x - 32}
              y={JAMSIL.y - 35}
              width="64"
              height="15"
              rx="5"
              fill="#8B5CF6"
            />
            <text
              x={JAMSIL.x}
              y={JAMSIL.y - 27}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="6.5"
              fontWeight="800"
              fill="white"
              style={{ userSelect: "none" }}
            >
              LG · 두산 (잠실)
            </text>
          </g>
        )}
      </g>

      <rect
        width="320"
        height="390"
        fill="none"
        stroke="#BFDBFE"
        strokeWidth="1"
        rx="18"
      />
    </svg>
  );
}

// ── 잠실 팀 선택 팝업 ─────────────────────────────────────────
function JamsilPicker({ onSelect }: { onSelect: (t: Team) => void }) {
  const lgTeam = KBO_TEAMS.find((t) => t.id === "lg")!;
  const doosanTeam = KBO_TEAMS.find((t) => t.id === "doosan")!;

  return (
    <div
      className="absolute z-50 bg-white rounded-2xl shadow-2xl border border-purple-100 p-3 w-52"
      style={{
        left: `${(JAMSIL.x / 320) * 100}%`,
        top: `${(JAMSIL.y / 390) * 100}%`,
        transform: "translate(-50%, calc(-100% - 30px))",
        animation: "stFadeIn 0.15s ease-out",
      }}
    >
      {/* 말풍선 꼭짓점 */}
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

// ── 메인 ─────────────────────────────────────────────────────
export default function TeamLanding({ onSelect }: TeamLandingProps) {
  const [cardHoveredId, setCardHoveredId] = useState<string | null>(null);
  const [mapHoveredId, setMapHoveredId] = useState<string | null>(null);
  const [jamsilHovered, setJamsilHovered] = useState(false);

  // 잠실 호버 중에는 카드 dimming 없음 (globalActiveId=null)
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
  const handleJamsilHover = useCallback(
    (v: boolean) => setJamsilHovered(v),
    [],
  );

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
              className="w-full rounded-3xl bg-white border border-blue-100 relative"
              style={{
                boxShadow:
                  "0 8px 40px rgba(59,130,246,0.08), 0 2px 8px rgba(0,0,0,0.04)",
                aspectRatio: "320 / 390",
                minHeight: 440,
              }}
            >
              <KoreaMap
                globalActiveId={globalActiveId}
                jamsilHovered={jamsilHovered}
                onMapHover={handleMapHover}
                onJamsilHover={handleJamsilHover}
                onSelect={onSelect}
              />
              {/* 잠실 팀 선택 팝업 */}
              {jamsilHovered && <JamsilPicker onSelect={onSelect} />}
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
          from { opacity: 0; transform: translateY(4px) translate(-50%, calc(-100% - 30px)); }
          to   { opacity: 1; transform: translateY(0)   translate(-50%, calc(-100% - 30px)); }
        }
      `}</style>
    </div>
  );
}
