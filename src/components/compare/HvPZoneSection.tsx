// src/components/compare/HvP/HvPZoneSection.tsx
// 레이아웃:
//   [오버레이 카드 — 전체 너비, 풀 280px 구조]
//   [타자 핫/콜드존]  [투수 투구분포도]
// 삼진 교차분석 제거
// 오버레이: ZoneHeatmap과 완전히 동일한 280px outer+inner 구조
import { useState } from "react";
import ZoneHeatmap from "@/components/common/ZoneHeatmap";
import type { ZoneGrid } from "@/components/common/ZoneHeatmap";

interface HvPZoneSectionProps {
  hitterName: string;
  pitcherName: string;
  hitterHotCold: ZoneGrid | null;
  pitcherPitchZone: ZoneGrid | null;
}

// ── 전략 3단계 — ZoneHeatmap 팔레트 톤 동일 ─────────────────
type Strategy = "공략" | "위험" | "안전";

function getStrategy(hStep: number, pStep: number): Strategy {
  if (hStep <= 2 && pStep >= 4) return "공략";
  if (hStep >= 4 && pStep >= 4) return "위험";
  return "안전";
}

const STRAT: Record<
  Strategy,
  { bg: string; text: string; sub: string; border: string }
> = {
  공략: {
    bg: "#22C55E",
    text: "#fff",
    sub: "rgba(255,255,255,0.80)",
    border: "rgba(255,255,255,0.30)",
  },
  위험: {
    bg: "#CC4444",
    text: "#fff",
    sub: "rgba(255,255,255,0.80)",
    border: "rgba(255,255,255,0.30)",
  },
  안전: {
    bg: "#E5E7EB",
    text: "#6B7280",
    sub: "#9CA3AF",
    border: "rgba(0,0,0,0.06)",
  },
};

// ── ZoneHeatmap과 완전히 동일한 280px 레이아웃 상수 ──────────
const TOTAL = 280;
const OUTER_SIZE = 139;
const GAP = 2;
const INNER_OFFSET = 54;
const INNER_TOTAL = 168;
const CELL = Math.floor(INNER_TOTAL / 3); // 56

const OUTER_POS = [
  { top: 0, left: 0 },
  { top: 0, left: OUTER_SIZE + GAP },
  { top: OUTER_SIZE + GAP, left: 0 },
  { top: OUTER_SIZE + GAP, left: OUTER_SIZE + GAP },
];

// ── 풀사이즈 오버레이 ──────────────────────────────────────────
function OverlayZone({
  hitterZone,
  pitcherZone,
  hitterName,
  pitcherName,
}: {
  hitterZone: ZoneGrid;
  pitcherZone: ZoneGrid;
  hitterName: string;
  pitcherName: string;
}) {
  const [hovKey, setHovKey] = useState<string | null>(null);

  const outerPairs = hitterZone.outer.map((h, i) => ({
    h,
    p: pitcherZone.outer[i],
    strat: getStrategy(h.step, pitcherZone.outer[i]?.step ?? 3),
  }));
  const innerPairs = hitterZone.inner.map((h, i) => ({
    h,
    p: pitcherZone.inner[i],
    strat: getStrategy(h.step, pitcherZone.inner[i]?.step ?? 3),
  }));

  const hovStrat: Strategy | null = hovKey
    ? hovKey.startsWith("o")
      ? outerPairs[+hovKey.slice(1)]?.strat
      : innerPairs[+hovKey.slice(1)]?.strat
    : null;

  return (
    <div
      style={{
        position: "relative",
        width: TOTAL,
        height: TOTAL,
        margin: "0 auto",
      }}
    >
      {/* 외곽 4코너 */}
      {outerPairs.map(({ h, p, strat }, i) => {
        const s = STRAT[strat];
        const key = `o${i}`;
        const isHov = hovKey === key;
        return (
          <div
            key={key}
            onMouseEnter={() => setHovKey(key)}
            onMouseLeave={() => setHovKey(null)}
            style={{
              position: "absolute",
              top: OUTER_POS[i].top,
              left: OUTER_POS[i].left,
              width: OUTER_SIZE,
              height: OUTER_SIZE,
              borderRadius: 4,
              background: s.bg,
              display: "flex",
              flexDirection: "column",
              alignItems: i % 2 === 0 ? "flex-start" : "flex-end",
              justifyContent: i < 2 ? "flex-start" : "flex-end",
              padding: 10,
              border: isHov
                ? "2px solid rgba(0,0,0,0.15)"
                : `1px solid ${s.border}`,
              filter: isHov ? "brightness(0.90)" : "none",
              transition: "filter 0.12s",
              cursor: "default",
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: 900,
                color: s.text,
                lineHeight: 1.1,
              }}
            >
              {strat}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: s.sub,
                lineHeight: 1.4,
              }}
            >
              {h.val}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: s.sub,
                lineHeight: 1.1,
              }}
            >
              {p?.val ?? "-"}
            </span>
          </div>
        );
      })}

      {/* 내부 3×3 */}
      {innerPairs.map(({ h, p, strat }, i) => {
        const s = STRAT[strat];
        const row = Math.floor(i / 3);
        const col = i % 3;
        const key = `n${i}`;
        const isHov = hovKey === key;
        return (
          <div
            key={key}
            onMouseEnter={() => setHovKey(key)}
            onMouseLeave={() => setHovKey(null)}
            style={{
              position: "absolute",
              top: INNER_OFFSET + row * CELL,
              left: INNER_OFFSET + col * CELL,
              width: CELL - 2,
              height: CELL - 2,
              borderRadius: 3,
              background: s.bg,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: `1.5px solid ${s.border}`,
              boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
              filter: isHov ? "brightness(0.87)" : "none",
              transition: "filter 0.12s",
              cursor: "default",
              zIndex: 10,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 900,
                color: s.text,
                lineHeight: 1.1,
              }}
            >
              {strat}
            </span>
            <span
              style={{
                fontSize: 8,
                fontWeight: 700,
                color: s.sub,
                lineHeight: 1.3,
              }}
            >
              {h.val}
            </span>
            <span
              style={{
                fontSize: 8,
                fontWeight: 600,
                color: s.sub,
                lineHeight: 1.1,
              }}
            >
              {p?.val ?? "-"}
            </span>
          </div>
        );
      })}

      {/* 호버 툴팁 */}
      {hovStrat && (
        <div
          style={{
            position: "absolute",
            bottom: -30,
            left: "50%",
            transform: "translateX(-50%)",
            background: STRAT[hovStrat].bg,
            color: STRAT[hovStrat].text,
            fontSize: 10,
            fontWeight: 900,
            padding: "2px 12px",
            borderRadius: 20,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          {hovStrat === "공략" &&
            `${pitcherName || "투수"} 공략 구역 — 타자 약점 + 투구 집중`}
          {hovStrat === "위험" &&
            `${hitterName || "타자"} 강점 + 투구 집중 — 회피 권장`}
          {hovStrat === "안전" && "중립 구역 — 투구 빈도 낮음 또는 균형"}
        </div>
      )}
    </div>
  );
}

// ── 소형 ZoneHeatmap (scale 0.65) ────────────────────────────
const MINI_SCALE = 0.65;
const MINI_PX = Math.round(280 * MINI_SCALE); // 182

function MiniZone({
  zone,
  colorMode,
  title,
  badge,
  footnote,
}: {
  zone: ZoneGrid | null;
  colorMode: "hotcold" | "single";
  title: string;
  badge: { text: string; color: string };
  footnote: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 self-stretch">
        <div
          className="w-1.5 h-5 rounded-full"
          style={{ background: badge.color }}
        />
        <p className="text-sm font-bold text-gray-700">{title}</p>
        <span
          className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-white ml-auto"
          style={{ background: badge.color }}
        >
          {badge.text}
        </span>
      </div>

      {zone ? (
        <div
          style={{
            width: MINI_PX,
            height: MINI_PX,
            position: "relative",
            overflow: "visible",
          }}
        >
          <div
            style={{
              transform: `scale(${MINI_SCALE})`,
              transformOrigin: "top left",
              width: 280,
              height: 280,
              position: "absolute",
            }}
          >
            <ZoneHeatmap zone={zone} colorMode={colorMode} />
          </div>
        </div>
      ) : (
        <div
          className="flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100"
          style={{ width: MINI_PX, height: MINI_PX }}
        >
          <p className="text-xs text-gray-400">선수 선택 후 표시</p>
        </div>
      )}

      <p className="text-[9px] text-gray-400 text-center">{footnote}</p>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────
export default function HvPZoneSection({
  hitterName,
  pitcherName,
  hitterHotCold,
  pitcherPitchZone,
}: HvPZoneSectionProps) {
  const canOverlay = !!(hitterHotCold && pitcherPitchZone);

  return (
    <div className="space-y-4">
      {/* ── 1. 오버레이 카드 — 전체 너비, 풀사이즈 ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2 flex-wrap">
          <span className="w-1.5 h-5 rounded-full inline-block bg-indigo-500" />
          <h3 className="font-bold text-gray-800 text-sm">
            핫존 x 투구분포 오버레이
          </h3>
          <div className="flex items-center gap-3 ml-auto text-[10px] text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              {hitterName || "타자"} 핫존 (타율)
            </div>
            <span className="text-gray-200">×</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              {pitcherName || "투수"} 투구빈도
            </div>
          </div>
        </div>

        <div className="px-6 py-6 flex flex-col items-center gap-4">
          {canOverlay ? (
            <>
              {/* 축 레이블 */}
              <div
                className="flex items-center justify-between text-[9px] text-gray-400"
                style={{ width: TOTAL }}
              >
                <span>몸쪽</span>
                <span className="text-gray-300">스트라이크존 · 투수 시점</span>
                <span>바깥쪽</span>
              </div>

              {/* 오버레이 — 하단 툴팁 여백 확보 */}
              <div style={{ paddingBottom: 38 }}>
                <OverlayZone
                  hitterZone={hitterHotCold!}
                  pitcherZone={pitcherPitchZone!}
                  hitterName={hitterName}
                  pitcherName={pitcherName}
                />
              </div>

              {/* 범례 — ZoneHeatmap 동일 포맷 */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-5">
                  {(["공략", "안전", "위험"] as Strategy[]).map((s) => (
                    <div key={s} className="flex items-center gap-1.5">
                      <div
                        className="w-9 h-3.5 rounded-sm"
                        style={{ background: STRAT[s].bg }}
                      />
                      <span className="text-xs text-gray-400 font-medium">
                        {s}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-[9px] text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                  <span>
                    <b className="text-blue-500">상단값</b> ={" "}
                    {hitterName || "타자"} 타율
                  </span>
                  <span className="text-gray-300">/</span>
                  <span>
                    <b className="text-red-400">하단값</b> ={" "}
                    {pitcherName || "투수"} 투구빈도
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-300">
                양 선수를 선택하면 오버레이가 표시됩니다
              </p>
              <div
                className="mt-5 mx-auto rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50"
                style={{ width: TOTAL, height: TOTAL }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── 2. 개별 존 분석 — 2열 ── */}
      <div className="flex items-center gap-2 px-1">
        <span className="w-1 h-4 rounded-full inline-block bg-gray-300" />
        <p className="text-xs font-bold text-gray-500">개별 존 분석</p>
        <span className="text-[9px] text-gray-400 ml-auto">투수 시점 기준</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MiniZone
          zone={hitterHotCold}
          colorMode="hotcold"
          title={`${hitterName || "타자"} — 핫/콜드존`}
          badge={{ text: "타율", color: "#3B82F6" }}
          footnote="빨강=높은 타율 / 파랑=낮은 타율"
        />
        <MiniZone
          zone={pitcherPitchZone}
          colorMode="single"
          title={`${pitcherName || "투수"} — 투구 분포도`}
          badge={{ text: "투구빈도", color: "#EF4444" }}
          footnote="진초록=고빈도 / 연초록=저빈도"
        />
      </div>
    </div>
  );
}
