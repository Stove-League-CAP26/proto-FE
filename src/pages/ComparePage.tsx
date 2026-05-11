// src/pages/ComparePage.tsx — HvH / PvP / HvP 3모드 지원
import { useState, useCallback } from "react";
import ComparePlayerSlot from "@/components/compare/ComparePlayerSlot";
import CompareStatPanel from "@/components/compare/CompareStatPanel";
import CompareZonePanel from "@/components/compare/CompareZonePanel";
import HvPZoneSection from "@/components/compare/HvPZoneSection";
import VsHitterTable from "@/components/compare/VsHitterTable";
import RadarChart from "@/components/common/RadarChart";
import {
  fetchHitterStats,
  fetchPitcherStats,
  fetchHitterRadar,
  fetchPitcherRadar,
} from "@/api/playerApi";
import {
  fetchHotColdZone,
  fetchStrikeoutZone,
  fetchPitchZone,
  fetchKsZone,
} from "@/api/chartApi";
import type { ZoneGrid } from "@/api/chartApi";
import type { HitterRadar, PitcherRadar } from "@/api/playerApi";
import {
  isPitcher,
  mapHitterRadar,
  mapPitcherRadar,
} from "@/utils/playerUtils";
import {
  MOCK_HVP_HITTER_HOTCOLD,
  MOCK_HVP_PITCHER_PITCHZONE,
} from "@/mock/hvpData";

type Mode = "HvH" | "PvP" | "HvP";

interface PlayerSlot {
  basic: any | null;
  stats: any[];
  latestStat: any | null;
  radar: HitterRadar | PitcherRadar | null;
  zone: ZoneGrid | null;
  strikeoutZone: ZoneGrid | null;
  loading: boolean;
}

const empty = (): PlayerSlot => ({
  basic: null,
  stats: [],
  latestStat: null,
  radar: null,
  zone: null,
  strikeoutZone: null,
  loading: false,
});

const MODES = [
  { id: "HvH" as Mode, label: "타자 vs 타자" },
  { id: "PvP" as Mode, label: "투수 vs 투수" },
  { id: "HvP" as Mode, label: "타자 vs 투수" },
];

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

      const [stats, radar, zone, strikeoutZone] = await Promise.all([
        pitcher
          ? fetchPitcherStats(pid).catch(() => [])
          : fetchHitterStats(pid).catch(() => []),
        pitcher
          ? fetchPitcherRadar(pid).catch(() => null)
          : fetchHitterRadar(pid).catch(() => null),
        pitcher
          ? fetchPitchZone(pid).catch(() => null)
          : fetchHotColdZone(pid).catch(() => null),
        pitcher
          ? fetchKsZone(pid).catch(() => null)
          : fetchStrikeoutZone(pid).catch(() => null),
      ]);

      const latestStat =
        (stats as any[]).length > 0
          ? [...(stats as any[])].sort((a, b) => b.season - a.season)[0]
          : null;

      set({
        basic: playerBasic,
        stats: stats as any[],
        latestStat,
        radar: radar as any,
        zone: zone as ZoneGrid | null,
        strikeoutZone: strikeoutZone as ZoneGrid | null,
        loading: false,
      });
    },
    [mode],
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

  // 두 선수 모두 선택 + 로딩 완료 시에만 비교 콘텐츠 표시
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
  const hvpPitPitch =
    hasBoth && mode === "HvP"
      ? (slotB.zone ?? MOCK_HVP_PITCHER_PITCHZONE)
      : null;

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
        <div className="grid grid-cols-3 items-stretch gap-4">
          {/* 슬롯 A */}
          <div>
            {mode === "HvP" && (
              <p className="text-xs font-black text-blue-500 text-center mb-2">
                타자 선택
              </p>
            )}
            <ComparePlayerSlot
              player={slotA.basic}
              sideLabel="A"
              onPlayerSelected={(p) => loadPlayer(p, "A")}
              loading={slotA.loading}
              filterType={
                mode === "HvP"
                  ? "hitter"
                  : mode === "HvH"
                    ? "hitter"
                    : "pitcher"
              }
            />
          </div>

          {/* 중앙 */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-sm
                           font-black text-white shadow-xl"
              style={{
                background: "linear-gradient(135deg,#3B82F6,#7C3AED,#EF4444)",
              }}
            >
              {mode === "HvP" ? "vs" : "VS"}
            </div>

            {/* 간략 비교 바 (HvH / PvP, 두 선수 모두 선택 시) */}
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
                    const nA = parseFloat(String(s.vA ?? 0)),
                      nB = parseFloat(String(s.vB ?? 0));
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

          {/* 슬롯 B */}
          <div>
            {mode === "HvP" && (
              <p className="text-xs font-black text-red-500 text-center mb-2">
                투수 선택
              </p>
            )}
            <ComparePlayerSlot
              player={slotB.basic}
              sideLabel="B"
              onPlayerSelected={(p) => loadPlayer(p, "B")}
              loading={slotB.loading}
              filterType={
                mode === "HvP"
                  ? "pitcher"
                  : mode === "HvH"
                    ? "hitter"
                    : "pitcher"
              }
            />
          </div>
        </div>
      </div>

      {/* ── 비교 콘텐츠 — 두 선수 모두 선택 시에만 표시 ── */}
      {hasBoth && (
        <>
          {/* HvH / PvP */}
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
                    playerNameA={slotA.basic?.playerName ?? "선수 A"}
                    playerNameB={slotB.basic?.playerName ?? "선수 B"}
                  />
                </div>
                <div className="space-y-4">
                  {[
                    {
                      r: radarA,
                      t: "light",
                      n: slotA.basic?.playerName,
                      c: "blue",
                    },
                    {
                      r: radarB,
                      t: "dark",
                      n: slotB.basic?.playerName,
                      c: "red",
                    },
                  ]
                    .filter((x) => x.r)
                    .map((x, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              background:
                                x.c === "blue" ? "#3B82F6" : "#EF4444",
                            }}
                          />
                          <p className="text-xs font-black text-gray-700">
                            {x.n}
                          </p>
                        </div>
                        <div className="w-full aspect-square max-w-[200px] mx-auto">
                          <RadarChart
                            data={x.r!}
                            theme={x.t as "light" | "dark"}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}

          {/* HvP */}
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
                pitcherStrikeout={
                  hasBoth && mode === "HvP"
                    ? (slotB.strikeoutZone ?? null)
                    : null
                }
                pitcherPitchZone={hvpPitPitch}
              />
            </div>
          )}
        </>
      )}

      {/* 한 명만 선택됐을 때 안내 */}
      {eitherSelected && !hasBoth && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-400">
            상대 선수를 선택하면 비교가 시작됩니다
          </p>
        </div>
      )}

      {/* 아무도 선택 안 됐을 때 */}
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
                  { icon: "📊", text: "상대전적" },
                  { icon: "🎯", text: "제구 전략" },
                  { icon: "분석", text: "매치업 인사이트" },
                ]
              : [
                  { icon: "📊", text: "스탯 비교" },
                  { icon: "🎯", text: "존 분석" },
                  { icon: "📡", text: "레이더 차트" },
                ]
            ).map((item) => (
              <div key={item.text} className="flex flex-col items-center gap-1">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs text-gray-400 font-medium">
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
