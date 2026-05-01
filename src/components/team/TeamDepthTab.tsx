// src/components/team/TeamDepthTab.tsx
// 주전(is_starter=1) → 좌측 필드 차트
// 뎁스(is_depth=1)  → 우측 필드 차트 (주전+백업 전체)
// 시즌 토글: 24 / 25 / 26 — 탭 클릭 시 해당 시즌 fetch (1회 캐시)

import { useState, useEffect } from "react";
import {
  fetchTeamDepth,
  type TeamDepthResponse,
  type DepthPlayerEntry,
} from "@/api/teamDepthApi";

// ── 포지션 → 필드 좌표 (SVG viewBox 0 0 220 200 기준) ──────────
const FIELD_POSITIONS: Record<string, { x: number; y: number }> = {
  LF: { x: 44, y: 68 },
  CF: { x: 110, y: 36 },
  RF: { x: 176, y: 68 },
  SS: { x: 78, y: 102 },
  "2B": { x: 138, y: 96 },
  "1B": { x: 158, y: 118 },
  "3B": { x: 62, y: 118 },
  C: { x: 110, y: 158 },
  DH: { x: 110, y: 182 },
  P: { x: 110, y: 110 }, // 마운드
};

const POS_KO: Record<string, string> = {
  LF: "좌익수",
  CF: "중견수",
  RF: "우익수",
  SS: "유격수",
  "2B": "2루수",
  "1B": "1루수",
  "3B": "3루수",
  C: "포수",
  DH: "지명타자",
  P: "투수",
};

// 필드에 표시할 포지션 (투수 포함 전체)
const ALL_FIELD_POSITIONS = [
  "CF",
  "LF",
  "RF",
  "SS",
  "2B",
  "1B",
  "3B",
  "C",
  "DH",
  "P",
];

const SEASONS = ["26", "25", "24"] as const;
type Season = (typeof SEASONS)[number];

const SEASON_LABEL: Record<Season, string> = {
  "26": "2026",
  "25": "2025",
  "24": "2024",
};

interface TeamDepthTabProps {
  teamId: string;
  primary: string;
  accent: string;
  onSelectPlayer: (pid: number) => void;
}

// ── 선수 아바타 ───────────────────────────────────────────────
function PlayerAvatar({
  pid,
  name,
  size = 32,
}: {
  pid: number | null;
  name: string;
  size?: number;
}) {
  const YEARS = [2026, 2025, 2024];
  const [yearIdx, setYearIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  if (!pid || failed) {
    return (
      <div
        className="rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold flex-shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {name.slice(0, 1)}
      </div>
    );
  }

  return (
    <img
      src={`https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/kbo/${YEARS[yearIdx]}/${pid}.png`}
      alt={name}
      style={{ width: size, height: size }}
      className="rounded-full object-cover flex-shrink-0"
      onError={() => {
        if (yearIdx < YEARS.length - 1) setYearIdx((i) => i + 1);
        else setFailed(true);
      }}
    />
  );
}

// ── 필드 차트 ─────────────────────────────────────────────────
function FieldChart({
  posMap,
  primary,
  label,
  season,
  onSelectPlayer,
}: {
  posMap: Record<string, DepthPlayerEntry[]>;
  primary: string;
  label: string;
  season: Season;
  onSelectPlayer: (pid: number) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderLeft: `4px solid ${primary}` }}
      >
        <span className="font-black text-gray-800 text-sm">{label}</span>
        <span className="text-xs text-gray-400">
          {SEASON_LABEL[season]} 시즌
        </span>
      </div>

      <div className="relative w-full" style={{ paddingBottom: "82%" }}>
        <div className="absolute inset-0">
          <svg
            viewBox="0 0 220 210"
            className="w-full h-full"
            style={{ display: "block" }}
          >
            {/* 외야 잔디 */}
            <path d="M110,206 L6,92 Q110,4 214,92 Z" fill="#3a7d3a" />
            {/* 내야 흙 */}
            <path d="M110,160 L56,110 L110,62 L164,110 Z" fill="#c8a26a" />
            {/* 내야 잔디 원 */}
            <circle cx="110" cy="110" r="32" fill="#3a7d3a" />
            {/* 파울라인 */}
            <line
              x1="110"
              y1="206"
              x2="6"
              y2="92"
              stroke="white"
              strokeWidth="1"
              opacity="0.3"
            />
            <line
              x1="110"
              y1="206"
              x2="214"
              y2="92"
              stroke="white"
              strokeWidth="1"
              opacity="0.3"
            />
            {/* 베이스 */}
            {(
              [
                [110, 62],
                [164, 110],
                [110, 160],
                [56, 110],
              ] as [number, number][]
            ).map(([x, y], i) => (
              <rect
                key={i}
                x={x - 5}
                y={y - 5}
                width="10"
                height="10"
                fill="white"
                transform={`rotate(45,${x},${y})`}
              />
            ))}
            {/* 홈플레이트 */}
            <polygon
              points="107,169 113,169 116,175 110,180 104,175"
              fill="white"
            />
            {/* 마운드 */}
            <ellipse cx="110" cy="110" rx="6" ry="5" fill="#c8a26a" />
          </svg>

          {/* 선수 오버레이 — 투수 포함 전체 포지션 */}
          {ALL_FIELD_POSITIONS.map((pos) => {
            const coord = FIELD_POSITIONS[pos];
            if (!coord) return null;
            const players = posMap[pos] ?? [];
            if (players.length === 0) return null;

            // 투수는 마운드 위에 작게 표시
            const isPitcher = pos === "P";

            return (
              <div
                key={pos}
                className="absolute flex flex-col items-center gap-0.5"
                style={{
                  left: `${(coord.x / 220) * 100}%`,
                  top: `${(coord.y / 210) * 100}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: isPitcher ? 5 : 10,
                }}
              >
                <div
                  className="rounded-lg px-2 py-1 text-center shadow-lg"
                  style={{
                    backgroundColor: primary,
                    minWidth: isPitcher ? 48 : 56,
                    maxWidth: isPitcher ? 64 : 72,
                    opacity: isPitcher ? 0.92 : 1,
                  }}
                >
                  {/* 투수는 첫 번째 선수만 표시 (마운드 공간 협소) */}
                  {(isPitcher ? players.slice(0, 1) : players).map((p, i) => (
                    <p
                      key={i}
                      className="text-white font-bold leading-tight whitespace-nowrap cursor-pointer hover:underline"
                      style={{
                        fontSize: isPitcher ? 8 : i === 0 ? 9 : 7.5,
                        opacity: i === 0 ? 1 : 0.72,
                      }}
                      onClick={() => p.pid && onSelectPlayer(p.pid)}
                    >
                      {p.playerName}
                    </p>
                  ))}
                </div>
                <span
                  className="font-semibold drop-shadow"
                  style={{ fontSize: 7, color: "rgba(255,255,255,0.7)" }}
                >
                  {POS_KO[pos] ?? pos}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── 선수 카드 ────────────────────────────────────────────────
function PlayerCard({
  p,
  primary,
  onSelectPlayer,
}: {
  p: DepthPlayerEntry;
  primary: string;
  onSelectPlayer: (pid: number) => void;
}) {
  return (
    <button
      onClick={() => p.pid && onSelectPlayer(p.pid)}
      disabled={!p.pid}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl border transition-all hover:shadow-sm hover:-translate-y-0.5 disabled:cursor-default disabled:hover:translate-y-0 disabled:hover:shadow-none"
      style={{
        background: p.isStarter ? `${primary}10` : "#f8fafc",
        borderColor: p.isStarter ? `${primary}30` : "#e2e8f0",
      }}
    >
      <PlayerAvatar pid={p.pid} name={p.playerName} size={24} />
      <div className="text-left min-w-0">
        <p
          className="text-xs font-bold leading-tight truncate"
          style={{ color: p.isStarter ? primary : "#374151" }}
        >
          {p.playerName}
        </p>
        <p className="text-[9px] text-gray-400 font-semibold leading-tight">
          {p.position}
        </p>
      </div>
    </button>
  );
}

// ── 포지션 행 하나 (포지션명 + 가로 나열 선수들) ──────────────
function PosRow({
  pos,
  players,
  primary,
  onSelectPlayer,
}: {
  pos: string;
  players: DepthPlayerEntry[];
  primary: string;
  onSelectPlayer: (pid: number) => void;
}) {
  if (players.length === 0) return null;
  return (
    <div className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
      {/* 포지션 라벨 */}
      <div className="w-14 flex-shrink-0 pt-1">
        <span
          className="text-[10px] font-black px-1.5 py-0.5 rounded"
          style={{ background: `${primary}15`, color: primary }}
        >
          {pos}
        </span>
        <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">
          {POS_KO[pos] ?? pos}
        </p>
      </div>
      {/* 선수 카드 가로 나열 */}
      <div className="flex flex-wrap gap-1.5 flex-1">
        {players.map((p, i) => (
          <PlayerCard
            key={i}
            p={p}
            primary={primary}
            onSelectPlayer={onSelectPlayer}
          />
        ))}
      </div>
    </div>
  );
}

// ── 주전 or 뎁스 열 전체 ─────────────────────────────────────
function DepthColumn({
  label,
  posMap,
  primary,
  onSelectPlayer,
}: {
  label: string;
  posMap: Record<string, DepthPlayerEntry[]>;
  primary: string;
  onSelectPlayer: (pid: number) => void;
}) {
  const POSITION_ORDER = [
    "P",
    "C",
    "1B",
    "2B",
    "3B",
    "SS",
    "LF",
    "CF",
    "RF",
    "DH",
  ];
  const hasAny = POSITION_ORDER.some((pos) => (posMap[pos]?.length ?? 0) > 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* 열 헤더 */}
      <div
        className="px-4 py-3 flex items-center gap-2 border-b border-gray-100"
        style={{ borderLeft: `4px solid ${primary}` }}
      >
        <span className="font-black text-gray-800 text-sm">{label}</span>
      </div>

      {/* 포지션별 행 */}
      <div className="px-4 py-1">
        {!hasAny ? (
          <p className="text-xs text-gray-400 py-4 text-center">데이터 없음</p>
        ) : (
          POSITION_ORDER.map((pos) => (
            <PosRow
              key={pos}
              pos={pos}
              players={posMap[pos] ?? []}
              primary={primary}
              onSelectPlayer={onSelectPlayer}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── 로딩 스켈레톤 ─────────────────────────────────────────────
function DepthSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          >
            <div className="h-10 bg-gray-100" />
            <div
              className="w-full bg-gray-50"
              style={{ paddingBottom: "82%" }}
            />
          </div>
        ))}
      </div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 h-32"
        />
      ))}
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function TeamDepthTab({
  teamId,
  primary,
  accent,
  onSelectPlayer,
}: TeamDepthTabProps) {
  const [season, setSeason] = useState<Season>("26");
  const [cache, setCache] = useState<
    Partial<Record<Season, TeamDepthResponse | null>>
  >({});
  const [loading, setLoading] = useState(false);

  const depthColor = accent === "#000000" ? primary : accent;

  useEffect(() => {
    if (season in cache) return;
    setLoading(true);
    fetchTeamDepth(teamId, season)
      .then((res) => setCache((prev) => ({ ...prev, [season]: res })))
      .finally(() => setLoading(false));
  }, [season, teamId]);

  const data = cache[season];

  return (
    <div className="space-y-4">
      {/* ── 시즌 토글 ── */}
      <div className="flex items-center gap-2">
        {SEASONS.map((s) => (
          <button
            key={s}
            onClick={() => setSeason(s)}
            className="px-5 py-2 rounded-full text-sm font-black transition-all"
            style={
              season === s
                ? { background: primary, color: "#ffffff" }
                : { background: "#f1f5f9", color: "#64748b" }
            }
          >
            {SEASON_LABEL[s]} 시즌
          </button>
        ))}
      </div>

      {/* ── 콘텐츠 ── */}
      {loading ? (
        <DepthSkeleton />
      ) : !data ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-gray-400 text-sm">
            뎁스 데이터를 불러올 수 없습니다.
          </p>
        </div>
      ) : (
        <>
          {/* 필드 차트 2열 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldChart
              posMap={data.starters}
              primary={primary}
              label="주전"
              season={season}
              onSelectPlayer={onSelectPlayer}
            />
            <FieldChart
              posMap={data.depth}
              primary={depthColor}
              label="뎁스"
              season={season}
              onSelectPlayer={onSelectPlayer}
            />
          </div>

          {/* ── 포지션별 선수 리스트: 주전(좌) | 뎁스(우) 2열 ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DepthColumn
              label="주전"
              posMap={data.starters}
              primary={primary}
              onSelectPlayer={onSelectPlayer}
            />
            <DepthColumn
              label="뎁스"
              posMap={data.depth}
              primary={depthColor}
              onSelectPlayer={onSelectPlayer}
            />
          </div>
        </>
      )}
    </div>
  );
}
