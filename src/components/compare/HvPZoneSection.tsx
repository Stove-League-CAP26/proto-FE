// src/components/compare/HvPZoneSection.tsx
// 오버레이 분류:
//   위험제구 — 타자 HOT + 투수 자주 던짐  → 즉시 수정 (짙은 입체 빨강, 가장 강조)
//   제구금지 — 타율 최고(step 5) 구역      → 절대 금지, 가장 강한 입체 강조
//   공략     — 타자 COLD or 삼진율 高     → 공략 권장 (입체 파랑)
//   중립     — 나머지                    → 납작 회색

import { useState } from "react";
import ZoneHeatmap from "@/components/common/ZoneHeatmap";
import type { ZoneGrid } from "@/components/common/ZoneHeatmap";

// 기존 hotcold 팔레트 색상 그대로 사용
const PALETTE_HOTCOLD: Record<number, { bg: string; text: string }> = {
  1: { bg: "#1D4ED8", text: "#ffffff" }, // 진파랑
  2: { bg: "#93C5FD", text: "#1e3a8a" }, // 연파랑
  3: { bg: "#F3F4F6", text: "#6B7280" }, // 중립
  4: { bg: "#FCA5A5", text: "#7f1d1d" }, // 연빨강
  5: { bg: "#DC2626", text: "#ffffff" }, // 진빨강
};

interface HvPZoneSectionProps {
  hitterName: string;
  pitcherName: string;
  hitterHotCold: ZoneGrid | null;
  hitterStrikeout?: ZoneGrid | null;
  pitcherPitchZone: ZoneGrid | null;
}

type ZoneType = "제구금지" | "위험제구" | "공략" | "중립";

// 3D 입체 효과 — 위험 구역에만 적용, 기본 색상은 PALETTE_HOTCOLD 그대로 유지
const ELEVATION: Record<
  ZoneType,
  {
    boxShadow: string;
    border: string;
    scale: string;
    label: string;
    labelBg: string;
    labelText: string;
  }
> = {
  // 가장 타율 높은 구역(step 5) — 절대 금지, 가장 강한 입체감
  제구금지: {
    boxShadow: [
      "inset 0 1px 0 rgba(255,255,255,0.25)",
      "inset -1px -1px 0 rgba(0,0,0,0.20)",
      "0 6px 18px rgba(220,38,38,0.55)",
      "0 2px 6px rgba(0,0,0,0.25)",
    ].join(","),
    border: "2.5px solid #DC2626",
    scale: "scale(1.05)",
    label: "제구금지",
    labelBg: "#991B1B",
    labelText: "#fff",
  },
  // 타율 high + 투수가 이미 자주 던지는 중 — 현재 진행형 위험
  위험제구: {
    boxShadow: [
      "inset 0 1px 0 rgba(255,255,255,0.18)",
      "inset -1px -1px 0 rgba(0,0,0,0.15)",
      "0 4px 12px rgba(220,38,38,0.40)",
      "0 1px 4px rgba(0,0,0,0.18)",
    ].join(","),
    border: "2px solid #EF4444",
    scale: "scale(1.02)",
    label: "위험 제구",
    labelBg: "#DC2626",
    labelText: "#fff",
  },
  공략: {
    boxShadow: "none",
    border: "1.5px solid #93C5FD",
    scale: "scale(1)",
    label: "공략",
    labelBg: "#1D4ED8",
    labelText: "#fff",
  },
  중립: {
    boxShadow: "none",
    border: "1px solid rgba(0,0,0,0.07)",
    scale: "scale(1)",
    label: "중립",
    labelBg: "#E5E7EB",
    labelText: "#9CA3AF",
  },
};

// ── 분류 함수 ─────────────────────────────────────────────────
function classify(
  hAvgStep: number,
  hSoStep: number,
  pPitchStep: number,
): ZoneType {
  const hitterTop = hAvgStep === 5; // 가장 타율 높은 구역 — 제구금지 전용
  const hitterHot = hAvgStep === 4; // 타율 high — 투구빈도 함께 보면 위험제구
  const hitterCold = hAvgStep <= 2;
  const highKRate = hSoStep >= 4;
  const pitcherFreq = pPitchStep >= 3;

  if (hitterTop) return "제구금지"; // 타율 최고 → 절대 금지
  if (hitterHot && pitcherFreq) return "위험제구"; // 타율 high + 자주 던짐 → 현재 위험
  if (hitterCold || highKRate) return "공략";
  return "중립";
}

// ── 레이아웃 상수 (ZoneHeatmap 동일) ──────────────────────────
const TOTAL = 280;
const OUTER_SIZE = 139;
const GAP = 2;
const INNER_OFFSET = 54;
const CELL = 56;

const OUTER_POS = [
  { top: 0, left: 0 },
  { top: 0, left: OUTER_SIZE + GAP },
  { top: OUTER_SIZE + GAP, left: 0 },
  { top: OUTER_SIZE + GAP, left: OUTER_SIZE + GAP },
];

// ── 오버레이 그리드 ───────────────────────────────────────────
function OverlayGrid({
  hitterZone,
  hitterSoZone,
  pitcherZone,
  hitterName,
  pitcherName,
}: {
  hitterZone: ZoneGrid;
  hitterSoZone: ZoneGrid | null;
  pitcherZone: ZoneGrid;
  hitterName: string;
  pitcherName: string;
}) {
  const [hovKey, setHovKey] = useState<string | null>(null);

  const makeCell = (
    hCell: { val: string; step: number } | undefined,
    soCell: { val: string; step: number } | undefined,
    pCell: { val: string; step: number } | undefined,
  ) => ({
    type: classify(hCell?.step ?? 3, soCell?.step ?? 3, pCell?.step ?? 3),
    hVal: hCell?.val ?? "-",
    pVal: pCell?.val ?? "-",
    hAvgStep: hCell?.step ?? 3, // 색상 팔레트용
  });

  const outerCells = hitterZone.outer.map((h, i) =>
    makeCell(h, hitterSoZone?.outer[i], pitcherZone.outer[i]),
  );
  const innerCells = hitterZone.inner.map((h, i) =>
    makeCell(h, hitterSoZone?.inner[i], pitcherZone.inner[i]),
  );

  // 위험 현황 집계
  const dangerCount = [...outerCells, ...innerCells].filter(
    (c) => c.type === "위험제구",
  ).length;
  const avoidCount = [...outerCells, ...innerCells].filter(
    (c) => c.type === "제구금지",
  ).length;
  const targetCount = [...outerCells, ...innerCells].filter(
    (c) => c.type === "공략",
  ).length;

  const renderCell = (
    cell: ReturnType<typeof makeCell>,
    isInner: boolean,
    posStyle: React.CSSProperties,
    key: string,
  ) => {
    const ev = ELEVATION[cell.type];
    const isDanger = cell.type === "제구금지" || cell.type === "위험제구";
    const isHov = hovKey === key;

    // 기존 hotcold 팔레트 색상 그대로 사용
    const step = cell.hAvgStep ?? 3;
    const palette = PALETTE_HOTCOLD[Math.min(5, Math.max(1, step))];

    return (
      <div
        key={key}
        onMouseEnter={() => setHovKey(key)}
        onMouseLeave={() => setHovKey(null)}
        style={{
          ...posStyle,
          background: palette.bg,
          boxShadow: isHov
            ? ev.boxShadow + (isDanger ? ", 0 0 0 2px rgba(0,0,0,0.15)" : "")
            : ev.boxShadow,
          border: ev.border,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          transform: isHov ? "scale(1.07)" : ev.scale,
          transition: "transform 0.13s, box-shadow 0.13s",
          cursor: "default",
          overflow: "hidden",
          zIndex: isDanger ? 12 : isInner ? 10 : 2,
        }}
      >
        {/* 위험 라벨 — 위험/금지 구역만 표시 */}
        {isDanger && (
          <span
            style={{
              fontSize: isInner ? 8 : 7,
              fontWeight: 900,
              background: ev.labelBg,
              color: ev.labelText,
              padding: "1px 4px",
              borderRadius: 3,
              lineHeight: 1.4,
              letterSpacing: "-0.01em",
              flexShrink: 0,
            }}
          >
            {ev.label}
          </span>
        )}
        {/* 타자 타율 */}
        <span
          style={{
            fontSize: isInner ? 12 : 11,
            fontWeight: 800,
            color: palette.text,
            lineHeight: 1,
          }}
        >
          {cell.hVal}
        </span>
        {/* 투수 투구빈도 (작게, 위험 구역만) */}
        {isDanger && (
          <span
            style={{
              fontSize: 8,
              fontWeight: 600,
              color: palette.text,
              opacity: 0.75,
              lineHeight: 1,
            }}
          >
            {cell.pVal}
          </span>
        )}
      </div>
    );
  };

  const hovType = hovKey
    ? hovKey.startsWith("o")
      ? outerCells[+hovKey.slice(1)]?.type
      : innerCells[+hovKey.slice(1)]?.type
    : null;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 위험 현황 요약 */}
      <div className="flex items-center gap-3 text-[11px]">
        <span style={{ color: "#7F1D1D", fontWeight: 800 }}>
          위험 제구 {dangerCount}구역
        </span>
        <span className="text-gray-200">|</span>
        <span style={{ color: "#DC2626", fontWeight: 700 }}>
          제구금지 {avoidCount}구역
        </span>
        <span className="text-gray-200">|</span>
        <span style={{ color: "#1D4ED8", fontWeight: 700 }}>
          공략 {targetCount}구역
        </span>
      </div>

      {/* 그리드 */}
      <div style={{ position: "relative", width: TOTAL, height: TOTAL }}>
        {outerCells.map((cell, i) =>
          renderCell(
            cell,
            false,
            {
              position: "absolute",
              top: OUTER_POS[i].top,
              left: OUTER_POS[i].left,
              width: OUTER_SIZE,
              height: OUTER_SIZE,
              borderRadius: 6,
              padding: (isInner) => (isInner ? 0 : 10),
            } as any,
            `o${i}`,
          ),
        )}
        {innerCells.map((cell, i) =>
          renderCell(
            cell,
            true,
            {
              position: "absolute",
              top: INNER_OFFSET + Math.floor(i / 3) * CELL,
              left: INNER_OFFSET + (i % 3) * CELL,
              width: CELL - 2,
              height: CELL - 2,
              borderRadius: 5,
            },
            `n${i}`,
          ),
        )}

        {/* 호버 툴팁 */}
        {hovType && (
          <div
            style={{
              position: "absolute",
              top: -38,
              left: "50%",
              transform: "translateX(-50%)",
              background: ELEVATION[hovType].labelBg,
              boxShadow: ELEVATION[hovType].boxShadow,
              color: ELEVATION[hovType].labelText,
              fontSize: 10,
              fontWeight: 900,
              padding: "4px 16px",
              borderRadius: 20,
              whiteSpace: "nowrap",
              pointerEvents: "none",
              zIndex: 30,
              border: ELEVATION[hovType].border,
            }}
          >
            {hovType === "위험제구" &&
              `현재 ${pitcherName || "투수"}가 ${hitterName || "타자"} 강점 구역에 투구 — 즉시 수정`}
            {hovType === "제구금지" &&
              `${hitterName || "타자"} 강점 구역 — 절대 피할 것`}
            {hovType === "공략" &&
              `${hitterName || "타자"} 약점 구역 — 적극 공략 권장`}
            {hovType === "중립" && "중립 구역 — 큰 위험 없음"}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 소형 존 카드 ──────────────────────────────────────────────
const MINI_SCALE = 0.62;
const MINI_PX = Math.round(280 * MINI_SCALE);

function MiniZone({
  zone,
  colorMode,
  title,
  accentColor,
  footnote,
}: {
  zone: ZoneGrid | null;
  colorMode: "hotcold" | "inverted" | "single";
  title: string;
  accentColor: string;
  footnote: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 self-stretch">
        <div
          className="w-1 h-4 rounded-full"
          style={{ background: accentColor }}
        />
        <p className="text-xs font-bold text-gray-700">{title}</p>
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

// ── 범례 ─────────────────────────────────────────────────────
const LEGEND: { type: ZoneType; desc: string; sampleStep: number }[] = [
  { type: "제구금지", desc: "타율 최고 구역 — 절대 피할 것", sampleStep: 5 },
  {
    type: "위험제구",
    desc: "타율 high + 투수가 이미 자주 던지는 중",
    sampleStep: 4,
  },
  { type: "공략", desc: "타자 약점 or 삼진율 高 — 공략 권장", sampleStep: 2 },
  { type: "중립", desc: "큰 위험 없는 중립 구역", sampleStep: 3 },
];

// ── 메인 ─────────────────────────────────────────────────────
export default function HvPZoneSection({
  hitterName,
  pitcherName,
  hitterHotCold,
  hitterStrikeout,
  pitcherPitchZone,
}: HvPZoneSectionProps) {
  const canOverlay = !!(hitterHotCold && pitcherPitchZone);

  return (
    <div className="space-y-4">
      {/* 오버레이 카드 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2 flex-wrap">
          <span className="w-1.5 h-5 rounded-full inline-block bg-indigo-500" />
          <h3 className="font-bold text-gray-800 text-sm">
            제구 전략 오버레이
          </h3>
          <div className="ml-auto flex items-center gap-3 text-[10px] text-gray-400">
            <span>상단 = {hitterName || "타자"} 타율</span>
            <span className="text-gray-200">/</span>
            <span>하단 = {pitcherName || "투수"} 투구빈도</span>
          </div>
        </div>

        <div className="px-6 py-6 flex flex-col items-center gap-5">
          {canOverlay ? (
            <>
              {/* 축 라벨 */}
              <div
                className="flex justify-between text-[9px] text-gray-400"
                style={{ width: TOTAL }}
              >
                <span>몸쪽</span>
                <span className="text-gray-300">투수 시점</span>
                <span>바깥쪽</span>
              </div>

              {/* 오버레이 (위에서 툴팁 공간 확보) */}
              <div style={{ paddingTop: 44 }}>
                <OverlayGrid
                  hitterZone={hitterHotCold!}
                  hitterSoZone={hitterStrikeout ?? null}
                  pitcherZone={pitcherPitchZone!}
                  hitterName={hitterName}
                  pitcherName={pitcherName}
                />
              </div>

              {/* 범례 */}
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {LEGEND.map(({ type, desc, sampleStep }) => {
                  const ev = ELEVATION[type];
                  const pal = PALETTE_HOTCOLD[sampleStep];
                  const isDanger = type === "제구금지" || type === "위험제구";
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <div
                        style={{
                          width: 28,
                          height: 14,
                          borderRadius: 4,
                          background: pal.bg,
                          boxShadow: isDanger
                            ? "0 3px 7px rgba(0,0,0,0.22)"
                            : "none",
                          border: ev.border,
                          flexShrink: 0,
                        }}
                      />
                      <span className="text-[10px] text-gray-500">
                        <b
                          style={{
                            color: isDanger
                              ? "#DC2626"
                              : type === "공략"
                                ? "#1D4ED8"
                                : "#9CA3AF",
                          }}
                        >
                          {ev.label}
                        </b>{" "}
                        — {desc}
                      </span>
                    </div>
                  );
                })}
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

      {/* 개별 존 분석 */}
      <div className="flex items-center gap-2 px-1">
        <span className="w-1 h-4 rounded-full inline-block bg-gray-300" />
        <p className="text-xs font-bold text-gray-500">개별 존 분석</p>
        <span className="text-[9px] text-gray-400 ml-auto">투수 시점 기준</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MiniZone
          zone={hitterHotCold}
          colorMode="hotcold"
          title={`${hitterName || "타자"} — 타율 분포`}
          accentColor="#DC2626"
          footnote="빨강(높은 타율) = 제구금지 구역 근거"
        />
        {hitterStrikeout ? (
          <MiniZone
            zone={hitterStrikeout}
            colorMode="inverted"
            title={`${hitterName || "타자"} — 삼진 분포`}
            accentColor="#1D4ED8"
            footnote="파랑(높은 삼진율) = 공략 구역 근거"
          />
        ) : (
          <MiniZone
            zone={pitcherPitchZone}
            colorMode="single"
            title={`${pitcherName || "투수"} — 투구 분포`}
            accentColor="#10B981"
            footnote="진초록(고빈도) = 주요 투구 구역"
          />
        )}
      </div>
    </div>
  );
}
