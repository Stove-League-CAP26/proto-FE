// src/components/team/TeamLanding.tsx
import { useState, useCallback } from "react";
import { KBO_TEAMS, LEFT_TEAMS, RIGHT_TEAMS, type Team } from "@/mock/teamData";

interface TeamLandingProps {
  onSelect: (t: Team) => void;
}

const stadiumUrl = (id: string) => `/images/stadium/${id}.png`;
const logoUrl = (id: string) => `/images/teams/${id}.png`;

// ── 위도경도 → SVG % 좌표 ────────────────────────────────────────────────────
// SVG viewBox 800×1200 기준
const SCALE_X = 156.7;
const SCALE_Y = -215.0;
const REF_LNG = 126.693; // SSG 인천 기준
const REF_LAT = 37.437;

// 실측 보정값 — 스크린샷 기준으로 미세 조정
const OFFSET_X = 218;
const OFFSET_Y = 248;

function lngLatToPct(lng: number, lat: number) {
  const x = OFFSET_X + (lng - REF_LNG) * SCALE_X;
  const y = OFFSET_Y + (lat - REF_LAT) * SCALE_Y;
  return { xPct: (x / 800) * 100, yPct: (y / 1200) * 100 };
}

// ── 팀 구장 좌표 ─────────────────────────────────────────────────────────────
const STADIUM_COORDS: Record<string, { lat: number; lng: number }> = {
  ssg: { lat: 37.45, lng: 126.58 }, // 인천 문학
  kt: { lat: 37.299, lng: 127.01 }, // 수원
  hanwha: { lat: 36.317, lng: 127.43 }, // 대전
  kia: { lat: 35.168, lng: 126.889 }, // 광주
  samsung: { lat: 35.841, lng: 128.681 }, // 대구
  nc: { lat: 35.223, lng: 128.583 }, // 창원
  lotte: { lat: 35.194, lng: 129.061 }, // 부산
};

// 서울 클러스터 중심 — 잠실·고척 중간
const SEOUL_CENTER = lngLatToPct(127.02, 37.545);
const PCT: Record<string, { xPct: number; yPct: number }> = Object.fromEntries(
  Object.entries(STADIUM_COORDS).map(([id, { lat, lng }]) => [
    id,
    lngLatToPct(lng, lat),
  ]),
);

// 서울 3팀
const SEOUL_TEAMS = ["lg", "doosan", "kiwoom"] as const;

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

// ── 팀 카드 (좌/우 리스트) ───────────────────────────────────────────────────
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

// ── 단일 팀 마커 ─────────────────────────────────────────────────────────────
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
  const pct = PCT[team.id];
  if (!pct) return null;
  return (
    <div
      className="absolute cursor-pointer"
      style={{
        left: `${pct.xPct}%`,
        top: `${pct.yPct}%`,
        transform: "translate(-50%,-50%)",
        opacity: isDimmed ? 0.2 : 1,
        transition: "opacity 0.2s",
        zIndex: isActive ? 20 : 10,
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {/* 외부 광채 링 */}
      {isActive && (
        <div
          className="absolute rounded-full animate-ping"
          style={{
            width: 72,
            height: 72,
            left: -8,
            top: -8,
            background: team.colors.primary,
            opacity: 0.12,
          }}
        />
      )}
      <div
        className="absolute rounded-full"
        style={{
          width: 66,
          height: 66,
          left: -5,
          top: -5,
          background: team.colors.primary,
          opacity: isActive ? 0.15 : 0,
          transition: "opacity 0.2s",
        }}
      />
      {/* 마커 본체 w-14 = 56px */}
      <div
        className="w-14 h-14 rounded-full bg-white flex items-center justify-center overflow-hidden"
        style={{
          border: `${isActive ? 3.5 : 2.5}px solid ${team.colors.primary}`,
          boxShadow: isActive
            ? `0 6px 20px ${team.colors.primary}70, 0 2px 8px rgba(0,0,0,0.15)`
            : "0 3px 10px rgba(0,0,0,0.20)",
          transition: "all 0.15s",
        }}
      >
        <img
          src={logoUrl(team.id)}
          alt={team.shortName}
          className="w-10 h-10 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
      {isActive && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 rounded-lg text-white text-xs font-black whitespace-nowrap shadow-lg"
          style={{ background: team.colors.primary }}
        >
          {team.shortName}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
            style={{
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: `5px solid ${team.colors.primary}`,
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── 서울 클러스터 마커 (LG·두산·키움) ───────────────────────────────────────
function SeoulClusterMarker({
  isActive,
  isDimmed,
}: {
  isActive: boolean;
  isDimmed: boolean;
}) {
  const teams = SEOUL_TEAMS.map((id) => KBO_TEAMS.find((t) => t.id === id)!);
  return (
    <div
      className="absolute cursor-pointer"
      style={{
        left: `${SEOUL_CENTER.xPct}%`,
        top: `${SEOUL_CENTER.yPct}%`,
        transform: "translate(-50%,-50%)",
        opacity: isDimmed ? 0.2 : 1,
        transition: "opacity 0.2s",
        zIndex: isActive ? 20 : 10,
        pointerEvents: "auto",
      }}
    >
      {/* 배경 광채 */}
      {isActive && (
        <div
          className="absolute rounded-full animate-ping"
          style={{
            width: 90,
            height: 90,
            left: -14,
            top: -14,
            background: "#7C3AED",
            opacity: 0.12,
          }}
        />
      )}
      <div
        className="absolute rounded-full"
        style={{
          width: 90,
          height: 90,
          left: -14,
          top: -14,
          background: isActive ? "#7C3AED" : "transparent",
          opacity: isActive ? 0.12 : 0,
          transition: "opacity 0.2s",
        }}
      />

      {/* 3개 로고 원형 배치 */}
      {/* 서울 클러스터 — 삼각 배치 w-12 = 48px */}
      <div className="relative" style={{ width: 64, height: 68 }}>
        {/* LG — 좌상 */}
        <div
          className="absolute rounded-full bg-white overflow-hidden flex items-center justify-center"
          style={{
            width: 40,
            height: 40,
            left: 0,
            top: 0,
            border: `${isActive ? 3 : 2.5}px solid ${teams[0]?.colors.primary}`,
            boxShadow: isActive
              ? `0 4px 14px ${teams[0]?.colors.primary}60`
              : "0 2px 8px rgba(0,0,0,0.22)",
            zIndex: 3,
          }}
        >
          <img
            src={logoUrl("lg")}
            alt="LG"
            className="w-7 h-7 object-contain"
          />
        </div>
        {/* 두산 — 우상 */}
        <div
          className="absolute rounded-full bg-white overflow-hidden flex items-center justify-center"
          style={{
            width: 40,
            height: 40,
            right: 0,
            top: 0,
            border: `${isActive ? 3 : 2.5}px solid ${teams[1]?.colors.primary}`,
            boxShadow: isActive
              ? `0 4px 14px ${teams[1]?.colors.primary}60`
              : "0 2px 8px rgba(0,0,0,0.22)",
            zIndex: 2,
          }}
        >
          <img
            src={logoUrl("doosan")}
            alt="두산"
            className="w-7 h-7 object-contain"
          />
        </div>
        {/* 키움 — 하단 중앙 */}
        <div
          className="absolute rounded-full bg-white overflow-hidden flex items-center justify-center"
          style={{
            width: 40,
            height: 40,
            left: "50%",
            transform: "translateX(-50%)",
            bottom: 0,
            border: `${isActive ? 3 : 2.5}px solid ${teams[2]?.colors.primary}`,
            boxShadow: isActive
              ? `0 4px 14px ${teams[2]?.colors.primary}60`
              : "0 2px 8px rgba(0,0,0,0.22)",
            zIndex: 1,
          }}
        >
          <img
            src={logoUrl("kiwoom")}
            alt="키움"
            className="w-7 h-7 object-contain"
          />
        </div>
      </div>

      {/* 라벨 */}
      {isActive && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 rounded-lg text-white text-xs font-black whitespace-nowrap shadow-lg bg-violet-600">
          서울 3팀
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
            style={{
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderTop: "4px solid #7C3AED",
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── 서울 3팀 선택 팝업 ───────────────────────────────────────────────────────
function SeoulPicker({ onSelect }: { onSelect: (t: Team) => void }) {
  const teams = SEOUL_TEAMS.map((id) => KBO_TEAMS.find((t) => t.id === id)!);
  return (
    <div
      className="absolute z-50 bg-white rounded-2xl shadow-2xl border border-violet-100 p-3"
      style={{
        left: `${SEOUL_CENTER.xPct}%`,
        top: `${SEOUL_CENTER.yPct}%`,
        transform: "translate(-50%, calc(-100% - 44px))",
        animation: "stFadeIn 0.15s ease-out",
        width: 200,
        pointerEvents: "auto",
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
      <p className="text-[10px] font-black text-violet-500 text-center mb-2.5 tracking-widest">
        서울 팀 선택
      </p>
      <div className="flex gap-2">
        {teams.map((team) => (
          <button
            key={team.id}
            onClick={() => onSelect(team)}
            className="flex-1 flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all hover:scale-105 active:scale-95"
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
              className="text-[10px] font-black leading-tight text-center"
              style={{ color: team.colors.primary }}
            >
              {team.shortName}
            </p>
            <p className="text-[9px] text-gray-400">{team.stadium.name}</p>
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
  const [seoulHovered, setSeoulHovered] = useState(false);

  const globalActiveId = cardHoveredId ?? (seoulHovered ? null : mapHoveredId);
  const activeTeam = KBO_TEAMS.find((t) => t.id === globalActiveId);

  const seoulActive =
    seoulHovered ||
    globalActiveId === "lg" ||
    globalActiveId === "doosan" ||
    globalActiveId === "kiwoom";

  // 서울 제외 단독 팀
  const soloTeams = KBO_TEAMS.filter((t) => !SEOUL_TEAMS.includes(t.id as any));

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      <div className="bg-white border-b border-gray-100 px-4 py-5 text-center">
        <h1 className="text-xl font-black text-gray-900">KBO 팀 선택</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          팀을 클릭하면 상세 정보를 확인할 수 있습니다
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: "190px 1fr 190px" }}
        >
          {/* 좌측 팀 카드 */}
          <div className="flex flex-col gap-2 justify-center">
            {LEFT_TEAMS.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                globalActiveId={globalActiveId}
                onCardHover={setCardHoveredId}
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
              {/* 남한 SVG 지도 */}
              <img
                src="/images/south-korea.svg"
                alt="대한민국 지도"
                className="absolute inset-0 w-full h-full object-contain p-2"
                style={{
                  filter: "drop-shadow(0 2px 8px rgba(59,130,246,0.10))",
                  objectPosition: "center top",
                }}
                draggable={false}
              />

              {/* 마커 오버레이 */}
              <div className="absolute inset-0">
                {/* 단독 팀 마커 */}
                {soloTeams.map((team) => (
                  <TeamMarker
                    key={team.id}
                    team={team}
                    isActive={globalActiveId === team.id}
                    isDimmed={
                      (globalActiveId !== null || seoulHovered) &&
                      globalActiveId !== team.id
                    }
                    onEnter={() => setMapHoveredId(team.id)}
                    onLeave={() => setMapHoveredId(null)}
                    onClick={() => onSelect(team)}
                  />
                ))}

                {/* 서울 클러스터 + 팝업 — wrapper로 묶어 hover 유지 */}
                <div
                  onMouseEnter={() => setSeoulHovered(true)}
                  onMouseLeave={() => setSeoulHovered(false)}
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                  }}
                >
                  <SeoulClusterMarker
                    isActive={seoulActive}
                    isDimmed={globalActiveId !== null && !seoulActive}
                  />
                  {seoulHovered && <SeoulPicker onSelect={onSelect} />}
                </div>
              </div>
            </div>

            {/* 하단 안내 */}
            <div className="h-8 flex items-center">
              {seoulHovered ? (
                <div className="px-5 py-1.5 rounded-full text-sm font-black text-white bg-violet-500">
                  서울 — LG · 두산 · 키움 선택
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

          {/* 우측 팀 카드 */}
          <div className="flex flex-col gap-2 justify-center">
            {RIGHT_TEAMS.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                globalActiveId={globalActiveId}
                onCardHover={setCardHoveredId}
                onSelect={onSelect}
                side="right"
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes stFadeIn {
          from { opacity:0; transform:translate(-50%, calc(-100% - 40px)); }
          to   { opacity:1; transform:translate(-50%, calc(-100% - 44px)); }
        }
      `}</style>
    </div>
  );
}
