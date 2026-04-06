// 팀 선택 랜딩
// · 좌우 카드에 팀 로고 표시
// · 지도 마커 호버 → 해당 카드가 활성화되면서 카드 옆에 툴팁 표시 (지도 위 툴팁 없음)
import { useState, useCallback } from "react";
import { KBO_TEAMS, LEFT_TEAMS, RIGHT_TEAMS, type Team } from "@/mock/teamData";
import { KOREA_PATH } from "@/constants/teamConstants";

interface TeamLandingProps {
  onSelect: (t: Team) => void;
}

const stadiumUrl = (id: string) => `/images/stadium/${id}.png`;
const logoUrl = (id: string) => `/images/teams/${id}.png`;

// ── 지도 마커 커스텀 좌표 (viewBox 320×390, scale 1.3 기준) ──
const MAP_COORDS: Record<string, { x: number; y: number }> = {
  ssg: { x: 110, y: 140 },
  kiwoom: { x: 132, y: 150 },
  lg: { x: 157, y: 145 },
  doosan: { x: 178, y: 160 },
  kt: { x: 146, y: 172 },
  hanwha: { x: 126, y: 192 },
  kia: { x: 107, y: 272 },
  samsung: { x: 167, y: 228 },
  nc: { x: 178, y: 260 },
  lotte: { x: 200, y: 276 },
};

// ── 구장 이미지 툴팁 (카드 옆에만 표시) ─────────────────────
function StadiumTooltip({
  team,
  side,
}: {
  team: Team;
  side: "left" | "right";
}) {
  const [err, setErr] = useState(false);

  const posClass =
    side === "left"
      ? "left-full top-1/2 -translate-y-1/2 ml-3"
      : "right-full top-1/2 -translate-y-1/2 mr-3";

  return (
    <div
      className={`absolute ${posClass} z-50 w-52 rounded-2xl overflow-hidden
                  shadow-2xl border border-gray-100 bg-white pointer-events-none`}
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

// ── 좌우 팀 카드 (로고 + 텍스트) ───────────────────────────────
// globalActiveId가 이 팀이면 → 카드 호버 or 지도 마커 호버 모두 활성화
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
          {/* 팀 로고 */}
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
                // 로고 없으면 팀컬러 배경 + 약칭
                const el = e.currentTarget;
                el.style.display = "none";
                const parent = el.parentElement;
                if (parent) {
                  parent.style.background = team.colors.primary;
                  parent.innerHTML = `<span style="font-size:10px;font-weight:900;color:${team.colors.text}">${team.shortName.slice(0, 2)}</span>`;
                }
              }}
            />
          </div>

          {/* 팀 이름 + 도시 */}
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

      {/* 구장 툴팁 — isActive일 때 표시 (카드 호버 OR 지도 마커 호버) */}
      {isActive && <StadiumTooltip team={team} side={side} />}
    </div>
  );
}

// ── 한반도 지도 ───────────────────────────────────────────────
function KoreaMap({
  globalActiveId,
  onMapHover,
  onSelect,
}: {
  globalActiveId: string | null;
  onMapHover: (id: string | null) => void;
  onSelect: (t: Team) => void;
}) {
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
        {KBO_TEAMS.map((t) => {
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

      {/* 한반도 (제주도 제외, 중앙 정렬) */}
      <g transform="scale(1.3) translate(-31, -7)">
        <path
          d={KOREA_PATH}
          fill="url(#lg-land)"
          stroke="#93C5FD"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </g>

      {/* 팀 마커 */}
      {KBO_TEAMS.map((team) => {
        const c = MAP_COORDS[team.id];
        const isActive = globalActiveId === team.id;
        const isDimmed = globalActiveId !== null && !isActive;

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
            {/* 광채 */}
            {isActive && (
              <circle
                cx={c.x}
                cy={c.y}
                r="21"
                fill={team.colors.primary}
                opacity="0.13"
              />
            )}
            {/* 흰 원 */}
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
            {/* 팀 로고 */}
            <image
              href={logoUrl(team.id)}
              x={c.x - 10}
              y={c.y - 10}
              width="20"
              height="20"
              clipPath={`url(#clip-m-${team.id})`}
              preserveAspectRatio="xMidYMid meet"
            />
            {/* 호버 라벨 */}
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

// ── 메인 ─────────────────────────────────────────────────────
export default function TeamLanding({ onSelect }: TeamLandingProps) {
  // 카드 직접 호버 ID
  const [cardHoveredId, setCardHoveredId] = useState<string | null>(null);
  // 지도 마커 호버 ID
  const [mapHoveredId, setMapHoveredId] = useState<string | null>(null);

  // 통합 active ID: 카드 or 지도 호버 어느 쪽이든 같은 팀 카드 활성화
  const globalActiveId = cardHoveredId ?? mapHoveredId;
  const activeTeam = KBO_TEAMS.find((t) => t.id === globalActiveId);

  const handleCardHover = useCallback(
    (id: string | null) => setCardHoveredId(id),
    [],
  );
  const handleMapHover = useCallback(
    (id: string | null) => setMapHoveredId(id),
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
              className="w-full rounded-3xl bg-white border border-blue-100"
              style={{
                boxShadow:
                  "0 8px 40px rgba(59,130,246,0.08), 0 2px 8px rgba(0,0,0,0.04)",
                aspectRatio: "320 / 390",
                minHeight: 440,
              }}
            >
              <KoreaMap
                globalActiveId={globalActiveId}
                onMapHover={handleMapHover}
                onSelect={onSelect}
              />
            </div>

            {/* 팀명 표시줄 */}
            <div className="h-8 flex items-center">
              {activeTeam ? (
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
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
