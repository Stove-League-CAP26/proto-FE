// src/pages/ComparePage.tsx — HvH / PvP / HvP 3모드 + 시즌 선택 (HvH/PvP)
import { useState, useCallback } from "react";
import ComparePlayerSlot from "@/components/compare/ComparePlayerSlot";
import CompareStatPanel from "@/components/compare/CompareStatPanel";
import CompareZonePanel from "@/components/compare/CompareZonePanel";
import HvPZoneSection from "@/components/compare/HvPZoneSection";
import VsHitterTable from "@/components/compare/VsHitterTable";
import CompareRadarChart from "@/components/compare/CompareRadarChart";
import {
  fetchHitterStats,
  fetchPitcherStats,
  fetchHitterRadar,
  fetchPitcherRadar,
} from "@/api/playerApi";
import {
  fetchHotColdZone,
  fetchStrikeoutZone,
  fetchKsZone,
  fetchPitchZone,
} from "@/api/chartApi";
import type { ZoneGrid } from "@/api/chartApi";
import type { HitterRadar, PitcherRadar } from "@/api/playerApi";
import {
  isPitcher,
  mapHitterRadar,
  mapPitcherRadar,
} from "@/utils/playerUtils";
import { MOCK_HVP_HITTER_HOTCOLD } from "@/mock/hvpData";

type Mode = "HvH" | "PvP" | "HvP";

const SEASONS = [2024, 2025, 2026] as const;

interface PlayerSlot {
  basic: any | null;
  stats: any[];
  latestStat: any | null;
  season: number;
  radar: HitterRadar | PitcherRadar | null;
  zone: ZoneGrid | null;
  strikeoutZone: ZoneGrid | null;
  loading: boolean;
  radarLoading: boolean;
}

const empty = (): PlayerSlot => ({
  basic: null,
  stats: [],
  latestStat: null,
  season: 2025,
  radar: null,
  zone: null,
  strikeoutZone: null,
  loading: false,
  radarLoading: false,
});

const MODES = [
  { id: "HvH" as Mode, label: "타자 vs 타자" },
  { id: "PvP" as Mode, label: "투수 vs 투수" },
  { id: "HvP" as Mode, label: "타자 vs 투수" },
];

function SeasonTabs({
  stats,
  selectedSeason,
  accentColor,
  onChange,
}: {
  stats: any[];
  selectedSeason: number;
  accentColor: string;
  onChange: (s: number) => void;
}) {
  const availableSeasons = SEASONS.filter((s) =>
    stats.some((st: any) => st.season === s),
  );

  return (
    <div className="flex gap-1 mt-2 justify-center">
      {SEASONS.map((s) => {
        const available = availableSeasons.includes(s);
        const active = selectedSeason === s;
        return (
          <button
            key={s}
            onClick={() => available && onChange(s)}
            disabled={!available}
            title={!available ? `${s}시즌 기록 없음` : `${s}시즌`}
            className="relative px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
            style={
              active
                ? { background: accentColor, color: "#fff" }
                : available
                  ? { background: "#f3f4f6", color: "#6b7280" }
                  : {
                      background: "#f9fafb",
                      color: "#d1d5db",
                      cursor: "not-allowed",
                    }
            }
          >
            {s}
            {!available && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gray-300" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function SlotWithSeason({
  slot,
  side,
  mode,
  accentColor,
  onPlayerSelected,
  onSeasonChange,
}: {
  slot: PlayerSlot;
  side: "A" | "B";
  mode: Mode;
  accentColor: string;
  onPlayerSelected: (p: any) => void;
  onSeasonChange: (s: number) => void;
}) {
  const hasStats = slot.basic && slot.stats.length > 0;
  const noSeasonStat =
    hasStats && !slot.stats.some((st: any) => st.season === slot.season);

  return (
    <div className="flex flex-col gap-1">
      {mode === "HvP" && (
        <p
          className={`text-xs font-black text-center mb-1 ${side === "A" ? "text-blue-500" : "text-red-500"}`}
        >
          {side === "A" ? "타자 선택" : "투수 선택"}
        </p>
      )}

      <ComparePlayerSlot
        key={`${side}-${mode}`}
        player={slot.basic}
        sideLabel={side}
        onPlayerSelected={onPlayerSelected}
        loading={slot.loading}
        filterType={
          mode === "HvP"
            ? side === "A"
              ? "hitter"
              : "pitcher"
            : mode === "HvH"
              ? "hitter"
              : "pitcher"
        }
      />

      {slot.basic && mode !== "HvP" && (
        <SeasonTabs
          stats={slot.stats}
          selectedSeason={slot.season}
          accentColor={accentColor}
          onChange={onSeasonChange}
        />
      )}

      {noSeasonStat && (
        <p className="text-[10px] text-center text-amber-500 font-medium mt-0.5">
          {slot.season}시즌 기록이 없습니다
        </p>
      )}

      {slot.basic && slot.radarLoading && (
        <p className="text-[10px] text-center text-gray-400 mt-0.5">
          레이더 불러오는 중...
        </p>
      )}
    </div>
  );
}

export default function ComparePage() {
  const [mode, setMode] = useState<Mode>("HvH");
  const [slotA, setSlotA] = useState<PlayerSlot>(empty());
  const [slotB, setSlotB] = useState<PlayerSlot>(empty());

  const loadPlayer = useCallback(
    async (playerBasic: any, side: "A" | "B") => {
      const pid: number = playerBasic.pid;
      const pitcher = isPitcher(playerBasic.playerMPosition);

      if (mode === "HvH" && pitcher) {
        alert("타자를 선택해주세요.");
        return;
      }
      if (mode === "PvP" && !pitcher) {
        alert("투수를 선택해주세요.");
        return;
      }
      if (mode === "HvP" && side === "A" && pitcher) {
        alert("타자 슬롯입니다.");
        return;
      }
      if (mode === "HvP" && side === "B" && !pitcher) {
        alert("투수 슬롯입니다.");
        return;
      }

      const set = side === "A" ? setSlotA : setSlotB;
      set((p) => ({
        ...p,
        basic: playerBasic,
        loading: true,
        stats: [],
        latestStat: null,
        radar: null,
        zone: null,
        strikeoutZone: null,
      }));

      const [stats, zone, strikeoutZone] = await Promise.all([
        pitcher
          ? fetchPitcherStats(pid).catch(() => [])
          : fetchHitterStats(pid).catch(() => []),
        pitcher
          ? fetchPitchZone(pid).catch(() => null)
          : fetchHotColdZone(pid).catch(() => null),
        pitcher
          ? fetchKsZone(pid).catch(() => null)
          : fetchStrikeoutZone(pid).catch(() => null),
      ]);

      const allStats = stats as any[];
      const latestSeason =
        allStats.length > 0
          ? Math.max(...allStats.map((s: any) => s.season))
          : 2025;
      const latestStat =
        allStats.find((s: any) => s.season === latestSeason) ?? null;

      set((prev) => ({
        ...prev,
        basic: playerBasic,
        stats: allStats,
        latestStat,
        season: latestSeason,
        zone: zone as ZoneGrid | null,
        strikeoutZone: strikeoutZone as ZoneGrid | null,
        loading: false,
        radarLoading: true,
      }));

      const radarFetch = pitcher ? fetchPitcherRadar : fetchHitterRadar;
      const radar = await radarFetch(pid, latestSeason).catch(() => null);
      set((prev) => ({ ...prev, radar: radar as any, radarLoading: false }));
    },
    [mode],
  );

  const changeSeason = useCallback(
    async (side: "A" | "B", season: number) => {
      const slot = side === "A" ? slotA : slotB;
      const set = side === "A" ? setSlotA : setSlotB;
      if (!slot.basic) return;

      const stat = slot.stats.find((s: any) => s.season === season) ?? null;
      set((prev) => ({
        ...prev,
        season,
        latestStat: stat,
        radarLoading: true,
      }));

      const pitcher = isPitcher(slot.basic.playerMPosition);
      const radarFetch = pitcher ? fetchPitcherRadar : fetchHitterRadar;
      const radar = await radarFetch(slot.basic.pid, season).catch(() => null);
      set((prev) => ({ ...prev, radar: radar as any, radarLoading: false }));
    },
    [slotA, slotB],
  );

  const changeMode = (m: Mode) => {
    if (m === mode) return;
    setMode(m);
    setSlotA(empty());
    setSlotB(empty());
  };

  const radarA = slotA.radar
    ? mode === "PvP"
      ? mapPitcherRadar(slotA.radar as any)
      : mapHitterRadar(slotA.radar as any)
    : null;
  const radarB = slotB.radar
    ? mode !== "HvH"
      ? mapPitcherRadar(slotB.radar as any)
      : mapHitterRadar(slotB.radar as any)
    : null;

  const hasBoth = !!(
    slotA.basic &&
    slotB.basic &&
    !slotA.loading &&
    !slotB.loading
  );
  const eitherSelected = !!(slotA.basic || slotB.basic);

  const hvpBatterPid =
    hasBoth && mode === "HvP" ? (slotA.basic?.pid as number) : null;
  const hvpPitcherPid =
    hasBoth && mode === "HvP" ? (slotB.basic?.pid as number) : null;
  const hvpHitHot =
    hasBoth && mode === "HvP" ? (slotA.zone ?? MOCK_HVP_HITTER_HOTCOLD) : null;
  const hvpHitSo =
    hasBoth && mode === "HvP" ? (slotA.strikeoutZone ?? null) : null;
  const hvpPitSo =
    hasBoth && mode === "HvP" ? (slotB.strikeoutZone ?? null) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">선수 비교</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          스탯·존 데이터를 실시간으로 비교합니다
        </p>
      </div>

      {/* 모드 탭 */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => changeMode(m.id)}
            className="px-5 py-2.5 rounded-xl text-sm font-black transition-all"
            style={
              mode === m.id
                ? {
                    background: "white",
                    color: "#111827",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  }
                : { color: "#9CA3AF" }
            }
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* 선수 선택 카드 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-3 items-start gap-4">
          <SlotWithSeason
            slot={slotA}
            side="A"
            mode={mode}
            accentColor="#3B82F6"
            onPlayerSelected={(p) => loadPlayer(p, "A")}
            onSeasonChange={(s) => changeSeason("A", s)}
          />

          {/* 중앙 VS */}
          <div className="flex flex-col items-center justify-center gap-3 pt-2">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-black text-white shadow-xl"
              style={{
                background: "linear-gradient(135deg,#3B82F6,#7C3AED,#EF4444)",
              }}
            >
              {mode === "HvP" ? "vs" : "VS"}
            </div>

            {hasBoth && mode !== "HvP" && (
              <div className="text-center">
                <p className="text-[10px] text-gray-400 font-medium">
                  {slotA.season}
                  <span className="mx-1 text-gray-300">vs</span>
                  {slotB.season}
                </p>
                {slotA.season !== slotB.season && (
                  <p className="text-[9px] text-amber-500 mt-0.5">
                    시즌이 다릅니다
                  </p>
                )}
              </div>
            )}

            {hasBoth &&
              slotA.latestStat &&
              slotB.latestStat &&
              mode !== "HvP" && (
                <div className="w-full space-y-1.5 px-2">
                  {(mode === "HvH"
                    ? [
                        {
                          l: "타율",
                          vA: slotA.latestStat.avg,
                          vB: slotB.latestStat.avg,
                          low: false,
                          f: (v: number) => v?.toFixed(3) ?? "−",
                        },
                        {
                          l: "홈런",
                          vA: slotA.latestStat.hr,
                          vB: slotB.latestStat.hr,
                          low: false,
                          f: (v: number) => String(v ?? "-"),
                        },
                        {
                          l: "타점",
                          vA: slotA.latestStat.rbi,
                          vB: slotB.latestStat.rbi,
                          low: false,
                          f: (v: number) => String(v ?? "-"),
                        },
                      ]
                    : [
                        {
                          l: "ERA",
                          vA: slotA.latestStat.era,
                          vB: slotB.latestStat.era,
                          low: true,
                          f: (v: number) => v?.toFixed(2) ?? "−",
                        },
                        {
                          l: "K",
                          vA: slotA.latestStat.so,
                          vB: slotB.latestStat.so,
                          low: false,
                          f: (v: number) => String(v ?? "-"),
                        },
                        {
                          l: "WHIP",
                          vA: slotA.latestStat.whip,
                          vB: slotB.latestStat.whip,
                          low: true,
                          f: (v: number) => v?.toFixed(2) ?? "−",
                        },
                      ]
                  ).map((s) => {
                    const nA = parseFloat(String(s.vA ?? 0));
                    const nB = parseFloat(String(s.vB ?? 0));
                    const raw = nA + nB > 0 ? (nA / (nA + nB)) * 100 : 50;
                    const pct = s.low ? 100 - raw : raw;
                    return (
                      <div key={s.l} className="space-y-0.5">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-blue-500">{s.f(s.vA)}</span>
                          <span className="text-gray-400">{s.l}</span>
                          <span className="text-red-500">{s.f(s.vB)}</span>
                        </div>
                        <div className="h-1.5 bg-red-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            {mode === "HvP" && !hasBoth && (
              <p className="text-xs text-gray-400 text-center px-3">
                타자와 투수를
                <br />
                모두 선택하세요
              </p>
            )}
          </div>

          <SlotWithSeason
            slot={slotB}
            side="B"
            mode={mode}
            accentColor="#EF4444"
            onPlayerSelected={(p) => loadPlayer(p, "B")}
            onSeasonChange={(s) => changeSeason("B", s)}
          />
        </div>
      </div>

      {/* 비교 콘텐츠 */}
      {hasBoth && (
        <>
          {(mode === "HvH" || mode === "PvP") && (
            <>
              <CompareZonePanel
                mode={mode}
                zoneA={slotA.zone}
                zoneB={slotB.zone}
                playerNameA={slotA.basic?.playerName ?? ""}
                playerNameB={slotB.basic?.playerName ?? ""}
                loadingA={slotA.loading}
                loadingB={slotB.loading}
              />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <CompareStatPanel
                    mode={mode}
                    statsA={slotA.latestStat}
                    statsB={slotB.latestStat}
                    playerNameA={`${slotA.basic?.playerName ?? "선수 A"} (${slotA.season})`}
                    playerNameB={`${slotB.basic?.playerName ?? "선수 B"} (${slotB.season})`}
                  />
                </div>

                {/* 레이더 차트 — 하나로 합침 */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-blue-400" />
                      <p className="text-xs font-black text-gray-700">
                        {slotA.basic?.playerName} ({slotA.season})
                      </p>
                    </div>
                    <span className="text-gray-300 text-xs">vs</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <p className="text-xs font-black text-gray-700">
                        {slotB.basic?.playerName} ({slotB.season})
                      </p>
                    </div>
                  </div>
                  {slotA.radarLoading || slotB.radarLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
                    </div>
                  ) : radarA && radarB ? (
                    <div className="w-full aspect-square max-w-[280px] mx-auto">
                      <CompareRadarChart
                        dataA={radarA}
                        dataB={radarB}
                        nameA={`${slotA.basic?.playerName} (${slotA.season})`}
                        nameB={`${slotB.basic?.playerName} (${slotB.season})`}
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-6">
                      레이더 데이터가 없습니다
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {mode === "HvP" && (
            <div className="space-y-6">
              {hvpBatterPid && hvpPitcherPid && (
                <VsHitterTable
                  pitcherPid={hvpPitcherPid}
                  batterPid={hvpBatterPid}
                  pitcherName={slotB.basic?.playerName ?? ""}
                  batterName={slotA.basic?.playerName ?? ""}
                />
              )}
              <HvPZoneSection
                hitterName={slotA.basic?.playerName ?? "타자"}
                pitcherName={slotB.basic?.playerName ?? "투수"}
                hitterHotCold={hvpHitHot}
                hitterStrikeout={hvpHitSo}
                pitcherStrikeout={hvpPitSo}
              />
            </div>
          )}
        </>
      )}

      {eitherSelected && !hasBoth && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-400">
            상대 선수를 선택하면 비교가 시작됩니다
          </p>
        </div>
      )}

      {!eitherSelected && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center gap-4">
          <div className="text-center">
            <p className="font-black text-gray-900 text-lg mb-1">
              {MODES.find((m) => m.id === mode)?.label}
            </p>
            <p className="text-sm text-gray-400">
              {mode === "HvP"
                ? "좌측에 타자, 우측에 투수를 선택하면 매치업 분석이 시작됩니다"
                : "선수를 선택하면 실시간으로 비교가 시작됩니다"}
            </p>
          </div>
          <div className="flex gap-8 mt-2">
            {(mode === "HvP"
              ? [
                  { text: "상대전적" },
                  { text: "공략 가이드" },
                  { text: "핫콜드존" },
                ]
              : [
                  { text: "스탯 비교" },
                  { text: "존 분석" },
                  { text: "레이더 차트" },
                ]
            ).map((item) => (
              <div key={item.text} className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-gray-300">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
