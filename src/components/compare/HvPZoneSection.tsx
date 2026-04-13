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
  hitterStrikeout?: ZoneGrid | null; // 타자 삼진 분포
  pitcherStrikeout?: ZoneGrid | null; // 투수 탈삼진 분포 ← NEW
  pitcherPitchZone: ZoneGrid | null;
}

type ZoneType = "제구금지" | "위험제구" | "공략" | "중립";

// 3D 입체 효과 — 오버레이 방식 (텍스트 가림 방지, transform 없음 → 셀 겹침 방지)
// 베벨 테두리만으로 3D 착시, 물리적 이동 없음
const ELEVATION: Record<
  ZoneType,
  {
    overlayBorderTop: string;
    overlayBorderLeft: string;
    overlayBorderBottom: string;
    overlayBorderRight: string;
    outerGlow: string;
    lift: string; // 항상 "none" — transform 기반 이동 사용 안 함
    label: string;
    labelBg: string;
    labelText: string;
  }
> = {
  제구금지: {
    overlayBorderTop: "3px solid rgba(255,130,130,0.65)",
    overlayBorderLeft: "3px solid rgba(255,130,130,0.55)",
    overlayBorderBottom: "4px solid rgba(80,0,0,0.60)",
    overlayBorderRight: "4px solid rgba(80,0,0,0.50)",
    outerGlow:
      "0 0 0 2.5px rgba(220,38,38,0.55), 0 4px 12px rgba(220,38,38,0.35)",
    lift: "none",
    label: "제구금지",
    labelBg: "#991B1B",
    labelText: "#fff",
  },
  위험제구: {
    overlayBorderTop: "2.5px solid rgba(255,150,150,0.55)",
    overlayBorderLeft: "2.5px solid rgba(255,150,150,0.45)",
    overlayBorderBottom: "3.5px solid rgba(80,0,0,0.50)",
    overlayBorderRight: "3.5px solid rgba(80,0,0,0.40)",
    outerGlow: "0 0 0 2px rgba(220,38,38,0.40), 0 3px 8px rgba(220,38,38,0.25)",
    lift: "none",
    label: "위험 제구",
    labelBg: "#DC2626",
    labelText: "#fff",
  },
  공략: {
    overlayBorderTop: "2.5px solid rgba(147,197,253,0.65)",
    overlayBorderLeft: "2.5px solid rgba(147,197,253,0.55)",
    overlayBorderBottom: "3.5px solid rgba(0,40,130,0.48)",
    overlayBorderRight: "3.5px solid rgba(0,40,130,0.38)",
    outerGlow: "0 0 0 2px rgba(29,78,216,0.40), 0 3px 8px rgba(29,78,216,0.22)",
    lift: "none",
    label: "공략",
    labelBg: "#1D4ED8",
    labelText: "#fff",
  },
  중립: {
    overlayBorderTop: "none",
    overlayBorderLeft: "none",
    overlayBorderBottom: "none",
    overlayBorderRight: "none",
    outerGlow: "none",
    lift: "none",
    label: "중립",
    labelBg: "#E5E7EB",
    labelText: "#9CA3AF",
  },
};

// ── 바깥 코너 셀 방향별 베벨 (ㄱ자 형태) ─────────────────────
// 각 코너가 향하는 바깥 방향 2면을 강조, 안쪽 방향 2면은 약하게
// TL(0): 상·좌 강조  TR(1): 상·우 강조  BL(2): 하·좌 강조  BR(3): 하·우 강조
const OUTER_BEVEL: Record<
  number,
  { hi1: string; hi2: string; lo1: string; lo2: string }
> = {
  0: { hi1: "top", hi2: "left", lo1: "bottom", lo2: "right" }, // TL
  1: { hi1: "top", hi2: "right", lo1: "bottom", lo2: "left" }, // TR
  2: { hi1: "bottom", hi2: "left", lo1: "top", lo2: "right" }, // BL
  3: { hi1: "bottom", hi2: "right", lo1: "top", lo2: "left" }, // BR
};

function outerOverlayStyle(
  cornerIdx: number,
  type: ZoneType | "k-attack" | "k-neutral",
): React.CSSProperties {
  const bevel = OUTER_BEVEL[cornerIdx];
  if (!bevel) return {};

  // 위험/공략 타입별 하이라이트/섀도 색상
  let hiColor: string;
  let loColor: string;
  if (type === "제구금지") {
    hiColor = "rgba(255,140,140,0.65)";
    loColor = "rgba(80,0,0,0.58)";
  } else if (type === "위험제구") {
    hiColor = "rgba(255,160,160,0.55)";
    loColor = "rgba(80,0,0,0.48)";
  } else if (type === "공략") {
    hiColor = "rgba(160,200,255,0.65)";
    loColor = "rgba(0,40,130,0.48)";
  } else if (type === "k-attack") {
    hiColor = "rgba(160,200,255,0.65)";
    loColor = "rgba(0,40,130,0.48)";
  } else {
    return {};
  }

  const W_HI = "4px solid ";
  const W_LO = "2px solid ";
  return {
    [`border${bevel.hi1.charAt(0).toUpperCase()}${bevel.hi1.slice(1)}`]:
      W_HI + hiColor,
    [`border${bevel.hi2.charAt(0).toUpperCase()}${bevel.hi2.slice(1)}`]:
      W_HI + hiColor,
    [`border${bevel.lo1.charAt(0).toUpperCase()}${bevel.lo1.slice(1)}`]:
      W_LO + loColor,
    [`border${bevel.lo2.charAt(0).toUpperCase()}${bevel.lo2.slice(1)}`]:
      W_LO + loColor,
  };
}

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
    const isAttack = cell.type === "공략";
    const showOverlay = isDanger || isAttack;
    const isHov = hovKey === key;

    const step = cell.hAvgStep ?? 3;
    const palette = PALETTE_HOTCOLD[Math.min(5, Math.max(1, step))];

    // 셀 자체: background + 외부 glow + lift transform
    // overflow: visible 로 scale 시 클리핑 없음
    const cellStyle: React.CSSProperties = {
      ...posStyle,
      background: palette.bg,
      boxShadow: showOverlay || isHov ? ev.outerGlow : "none",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      transition: "box-shadow 0.15s",
      cursor: "default",
      overflow: "visible",
      position: "absolute" as const,
      zIndex: isDanger ? 12 : isAttack ? 11 : isInner ? 10 : 2,
    };

    // 오버레이 div: position:absolute + inset:0 + 베벨 테두리
    // pointer-events:none, z-index:1 → 항상 텍스트 아래
    // 바깥 셀: 코너 방향별 ㄱ자, 안쪽 셀: 균등 4면
    const getBevelStyle = (): React.CSSProperties => {
      if (!showOverlay) return {};
      if (posStyle && (posStyle as any).__cornerIdx !== undefined) {
        return outerOverlayStyle(
          (posStyle as any).__cornerIdx,
          cell.type as ZoneType,
        );
      }
      return {
        borderTop: ev.overlayBorderTop,
        borderLeft: ev.overlayBorderLeft,
        borderBottom: ev.overlayBorderBottom,
        borderRight: ev.overlayBorderRight,
      };
    };
    const overlayStyle: React.CSSProperties = {
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: "inherit",
      pointerEvents: "none" as const,
      zIndex: 1,
      ...getBevelStyle(),
    };

    // 콘텐츠 wrapper: z-index:2 → 오버레이 위에 항상 표시
    const contentStyle: React.CSSProperties = {
      position: "relative" as const,
      zIndex: 2,
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      width: "100%",
      height: "100%",
    };

    return (
      <div
        key={key}
        style={cellStyle}
        onMouseEnter={() => setHovKey(key)}
        onMouseLeave={() => setHovKey(null)}
      >
        {/* ── 3D 베벨 오버레이 (텍스트 아래 z:1) ── */}
        {showOverlay && <div style={overlayStyle} />}

        {/* ── 콘텐츠 (오버레이 위 z:2) ── */}
        <div style={contentStyle}>
          {/* 위험/공략 라벨 */}
          {showOverlay && (
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

          {/* 타자 타율 수치 */}
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

          {/* 투수 투구빈도 (위험 구역만) */}
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
              padding: 8,
              __cornerIdx: i, // 코너 방향 베벨용 마커
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

// ── 반전 팔레트 (삼진 분포도용 — 높은 K율 = 파랑 = 공략) ───────
// hotcold 와 완전히 동일한 색상 체계, step 방향만 반전
const PALETTE_INVERTED: Record<number, { bg: string; text: string }> = {
  1: { bg: "#DC2626", text: "#ffffff" }, // K율 낮음
  2: { bg: "#FCA5A5", text: "#7f1d1d" },
  3: { bg: "#F3F4F6", text: "#6B7280" }, // 중립
  4: { bg: "#93C5FD", text: "#1e3a8a" },
  5: { bg: "#1D4ED8", text: "#ffffff" }, // K율 높음 = 공략
};

// ── 듀얼 존 그리드 (13칸, hotcold 디자인 완전 동일) ───────────────
// colorMode:
//   "hotcold"  — 타율+투구빈도 (빨강=위험, 파랑=공략)
//   "inverted" — 탈삼진+삼진   (파랑=공략, hotcold 반전)
interface DualZoneGridProps {
  zoneA: ZoneGrid; // 주 데이터 (상단 수치)
  zoneB: ZoneGrid | null; // 보조 데이터 (하단 수치, 없으면 생략)
  labelA: string;
  labelB: string;
  colorMode: "hotcold" | "inverted";
}

function DualZoneGrid({
  zoneA,
  zoneB,
  labelA,
  labelB,
  colorMode,
}: DualZoneGridProps) {
  const [hovKey, setHovKey] = useState<string | null>(null);

  const getPalette = (step: number) =>
    colorMode === "inverted"
      ? PALETTE_INVERTED[Math.min(5, Math.max(1, step))]
      : PALETTE_HOTCOLD[Math.min(5, Math.max(1, step))];

  const classifyDual = (stepA: number, stepB: number): ZoneType => {
    if (colorMode === "hotcold") {
      if (stepA === 5) return "제구금지";
      if (stepA >= 4 && stepB >= 3) return "위험제구";
      if (stepA <= 2) return "공략";
      return "중립";
    }
    if (stepA >= 4 || stepB >= 4) return "공략";
    return "중립";
  };

  // ── ㄱ/ㄴ 형태 clip-path 상수 ─────────────────────────────────
  // 각 L-셀은 50%×50% 쿼드런트를 차지하되, 안쪽 코너를 C% 지점에서 잘라냄
  // → 실제 ㄱ/ㄴ/ㄱ반전/ㄴ반전 형태의 L-shape
  const C = 46; // L-컷 위치 (% of 50%-quadrant cell)
  const L_CLIPS: Record<0 | 1 | 2 | 3, string> = {
    // TL — ㄱ 반전 (상단 + 좌측 팔)
    0: `polygon(0% 0%,100% 0%,100% ${C}%,${C}% ${C}%,${C}% 100%,0% 100%)`,
    // TR — ㄱ (상단 + 우측 팔)
    1: `polygon(0% 0%,100% 0%,100% 100%,${100 - C}% 100%,${100 - C}% ${C}%,0% ${C}%)`,
    // BL — ㄴ (하단 + 좌측 팔)
    2: `polygon(0% 0%,${C}% 0%,${C}% ${100 - C}%,100% ${100 - C}%,100% 100%,0% 100%)`,
    // BR — ㄴ 반전 (하단 + 우측 팔)
    3: `polygon(${100 - C}% 0%,100% 0%,100% 100%,0% 100%,0% ${100 - C}%,${100 - C}% ${100 - C}%)`,
  };

  // 각 코너 셀의 절대 위치 (50%×50% 쿼드런트)
  const L_POS: Record<0 | 1 | 2 | 3, React.CSSProperties> = {
    0: { top: 0, left: 0 },
    1: { top: 0, right: 0 },
    2: { bottom: 0, left: 0 },
    3: { bottom: 0, right: 0 },
  };

  // L-shape 내 텍스트 정렬 — L의 두꺼운 모서리 방향으로 정렬
  const L_ALIGN: Record<0 | 1 | 2 | 3, React.CSSProperties> = {
    0: { justifyContent: "flex-start", alignItems: "flex-start" },
    1: { justifyContent: "flex-start", alignItems: "flex-end" },
    2: { justifyContent: "flex-end", alignItems: "flex-start" },
    3: { justifyContent: "flex-end", alignItems: "flex-end" },
  };

  // ── 안쪽 9칸 셀 렌더러 ─────────────────────────────────────
  const renderInner = (
    cellA: { val: string; step: number } | undefined,
    cellB: { val: string; step: number } | undefined,
    idx: number,
  ) => {
    const stepA = cellA?.step ?? 3;
    const valA = cellA?.val ?? "-";
    const stepB = cellB?.step ?? 3;
    const valB = cellB?.val ?? "-";
    const type = classifyDual(stepA, stepB);
    const ev = ELEVATION[type];
    const showOverlay = type !== "중립";
    const pal = getPalette(stepA);
    const key = `n${idx}`;
    const isHov = hovKey === key;

    return (
      <div
        key={key}
        onMouseEnter={() => setHovKey(key)}
        onMouseLeave={() => setHovKey(null)}
        style={{
          background: pal.bg,
          borderRadius: 4,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          boxShadow: showOverlay || isHov ? ev.outerGlow : "none",
          transition: "box-shadow 0.15s",
          overflow: "hidden",
          cursor: "default",
          minHeight: 0,
        }}
      >
        {showOverlay && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              pointerEvents: "none",
              zIndex: 1,
              borderTop: ev.overlayBorderTop,
              borderLeft: ev.overlayBorderLeft,
              borderBottom: ev.overlayBorderBottom,
              borderRight: ev.overlayBorderRight,
            }}
          />
        )}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            width: "100%",
          }}
        >
          {showOverlay && (
            <span
              style={{
                fontSize: 7,
                fontWeight: 900,
                background: ev.labelBg,
                color: ev.labelText,
                padding: "1px 3px",
                borderRadius: 2,
                lineHeight: 1.4,
              }}
            >
              {ev.label}
            </span>
          )}
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: pal.text,
              lineHeight: 1,
            }}
          >
            {valA}
          </span>
          {zoneB && valB !== "-" && (
            <span
              style={{
                fontSize: 8,
                fontWeight: 600,
                color: pal.text,
                opacity: 0.72,
                lineHeight: 1,
              }}
            >
              {valB}
            </span>
          )}
        </div>
      </div>
    );
  };

  const attackCount = [...zoneA.outer, ...zoneA.inner].filter((c, i) => {
    const bStep = zoneB ? ([...zoneB.outer, ...zoneB.inner][i]?.step ?? 3) : 3;
    return classifyDual(c.step, bStep) !== "중립";
  }).length;

  const zoneBorderColor = colorMode === "inverted" ? "#3B82F6" : "#E53935";

  // inner zone 위치 — CUT=46%이므로 46%×50% = 23% of total
  const INNER_START = 23;
  const INNER_SIZE = 54; // = 100 - 2×23

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* 헤더 */}
      <div className="flex items-center gap-2 text-[10px] text-gray-400 self-stretch">
        <span>▲ {labelA}</span>
        {zoneB && (
          <>
            <span className="text-gray-200">/</span>
            <span>▼ {labelB}</span>
          </>
        )}
        {attackCount > 0 && (
          <span className="ml-auto font-bold" style={{ color: "#1D4ED8" }}>
            공략 {attackCount}구역
          </span>
        )}
      </div>

      {/*
        position:relative 컨테이너
        ┌──────────────────────────────┐
        │ ┌───┐         ┌───┐         │
        │ │TL │  inner  │ TR│         │
        │ │(ㄱ│  3×3   │(ㄱ│         │
        │ │반)│  zone  │)  │         │
        │ └───┘         └───┘         │
        │ ┌───┐         ┌───┐         │
        │ │BL │         │ BR│         │
        │ │(ㄴ│         │(ㄴ│         │
        │ │)  │         │반)│         │
        │ └───┘         └───┘         │
        └──────────────────────────────┘
        clip-path으로 각 셀을 실제 L-shape으로 절단
      */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "1" }}>
        {/* ── 바깥 4칸 (ㄱ/ㄴ/반전 L-shape) ── */}
        {zoneA.outer.map((cellA, i) => {
          const idx = i as 0 | 1 | 2 | 3;
          const stepA = cellA.step;
          const valA = cellA.val;
          const stepB = zoneB?.outer[i]?.step ?? 3;
          const valB = zoneB?.outer[i]?.val ?? "-";
          const type = classifyDual(stepA, stepB);
          const ev = ELEVATION[type];
          const showOverlay = type !== "중립";
          const pal = getPalette(stepA);
          const isHov = hovKey === `o${idx}`;

          return (
            <div
              key={`o${idx}`}
              onMouseEnter={() => setHovKey(`o${idx}`)}
              onMouseLeave={() => setHovKey(null)}
              style={{
                position: "absolute",
                ...L_POS[idx],
                width: "50%",
                height: "50%",
                clipPath: L_CLIPS[idx],
                background: pal.bg,
                // drop-shadow는 clip-path 형태를 따름 → L-shape shadow
                filter:
                  showOverlay || isHov
                    ? `drop-shadow(0 3px 8px ${ev.labelBg}66)`
                    : "none",
                transition: "filter 0.15s",
                display: "flex",
                flexDirection: "column",
                padding: 10,
                gap: 2,
                cursor: "default",
                ...L_ALIGN[idx],
              }}
            >
              {/* 베벨 오버레이 — clip-path에 의해 L-shape 경계에서 자연스럽게 절단 */}
              {showOverlay && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 1,
                    ...outerOverlayStyle(idx, type),
                  }}
                />
              )}
              {/* 콘텐츠 z:2 */}
              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                {showOverlay && (
                  <span
                    style={{
                      fontSize: 7,
                      fontWeight: 900,
                      background: ev.labelBg,
                      color: ev.labelText,
                      padding: "1px 4px",
                      borderRadius: 3,
                      lineHeight: 1.4,
                    }}
                  >
                    {ev.label}
                  </span>
                )}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: pal.text,
                    lineHeight: 1,
                  }}
                >
                  {valA}
                </span>
                {zoneB && valB !== "-" && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      color: pal.text,
                      opacity: 0.72,
                      lineHeight: 1,
                    }}
                  >
                    {valB}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* ── 스트라이크존 inner 3×3 ── */}
        <div
          style={{
            position: "absolute",
            top: `${INNER_START}%`,
            left: `${INNER_START}%`,
            width: `${INNER_SIZE}%`,
            height: `${INNER_SIZE}%`,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gridTemplateRows: "1fr 1fr 1fr",
            gap: 2,
            border: `2.5px solid ${zoneBorderColor}`,
            borderRadius: 6,
            padding: 2,
            background: `${zoneBorderColor}10`,
            zIndex: 5,
          }}
        >
          {zoneA.inner.map((cellA, i) =>
            renderInner(cellA, zoneB?.inner[i], i),
          )}
        </div>
      </div>

      <p className="text-[9px] text-gray-400">투수 시점 기준</p>
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
  pitcherStrikeout,
  pitcherPitchZone,
}: HvPZoneSectionProps) {
  const canOverlay = !!(hitterHotCold && pitcherPitchZone);
  const canAvgPitch = !!(hitterHotCold && pitcherPitchZone);
  const canKZone = !!(pitcherStrikeout || hitterStrikeout);
  const pitcherLabel = pitcherName || "투수";
  const hitterLabel = hitterName || "타자";

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
                          boxShadow: isDanger ? ev.outerGlow : "none",
                          borderTop:
                            isDanger || type === "공략"
                              ? ev.overlayBorderTop
                              : "1px solid rgba(0,0,0,0.08)",
                          borderLeft:
                            isDanger || type === "공략"
                              ? ev.overlayBorderLeft
                              : "1px solid rgba(0,0,0,0.08)",
                          borderBottom:
                            isDanger || type === "공략"
                              ? ev.overlayBorderBottom
                              : "1px solid rgba(0,0,0,0.08)",
                          borderRight:
                            isDanger || type === "공략"
                              ? ev.overlayBorderRight
                              : "1px solid rgba(0,0,0,0.08)",
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

      {/* ── 타율 + 투구 분포도 / 탈삼진 + 삼진 분포도 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 패널 1: 타율 + 투구 분포도 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full inline-block bg-red-500" />
            <h3 className="font-bold text-gray-800 text-sm">
              타율 + 투구 분포도
            </h3>
            <span className="ml-auto text-[10px] text-gray-400">
              공략 = 타율 낮은 구역
            </span>
          </div>
          <div className="px-5 py-5 flex justify-center">
            {canAvgPitch ? (
              <DualZoneGrid
                zoneA={hitterHotCold!}
                zoneB={pitcherPitchZone}
                labelA={`${hitterLabel} 타율`}
                labelB={`${pitcherLabel} 투구빈도`}
                colorMode="hotcold"
              />
            ) : (
              <div
                className="rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 flex items-center justify-center"
                style={{ width: TOTAL, height: TOTAL }}
              >
                <p className="text-xs text-gray-300">
                  양 선수를 선택하면 표시됩니다
                </p>
              </div>
            )}
          </div>
          {/* avg-pitch 범례 */}
          <div className="px-5 pb-4 flex flex-wrap gap-2">
            {[
              { type: "제구금지" as ZoneType, step: 5, color: "#DC2626" },
              { type: "위험제구" as ZoneType, step: 4, color: "#EF4444" },
              { type: "공략" as ZoneType, step: 2, color: "#1D4ED8" },
              { type: "중립" as ZoneType, step: 3, color: "#9CA3AF" },
            ].map(({ type, step, color }) => {
              const ev = ELEVATION[type];
              const pal = PALETTE_HOTCOLD[step];
              const show = type !== "중립";
              return (
                <div key={type} className="flex items-center gap-1.5">
                  <div
                    style={{
                      width: 22,
                      height: 11,
                      borderRadius: 3,
                      background: pal.bg,
                      borderTop: show
                        ? ev.overlayBorderTop
                        : "1px solid rgba(0,0,0,0.08)",
                      borderLeft: show
                        ? ev.overlayBorderLeft
                        : "1px solid rgba(0,0,0,0.08)",
                      borderBottom: show
                        ? ev.overlayBorderBottom
                        : "1px solid rgba(0,0,0,0.08)",
                      borderRight: show
                        ? ev.overlayBorderRight
                        : "1px solid rgba(0,0,0,0.08)",
                    }}
                  />
                  <span className="text-[9px]" style={{ color }}>
                    {ev.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 패널 2: 탈삼진 + 삼진 분포도 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full inline-block bg-green-500" />
            <h3 className="font-bold text-gray-800 text-sm">
              탈삼진 + 삼진 분포도
            </h3>
            <span className="ml-auto text-[10px] text-gray-400">
              공략 = K율 높은 구역
            </span>
          </div>
          <div className="px-5 py-5 flex justify-center">
            {canKZone ? (
              <DualZoneGrid
                zoneA={pitcherStrikeout ?? hitterStrikeout!}
                zoneB={pitcherStrikeout ? (hitterStrikeout ?? null) : null}
                labelA={
                  pitcherStrikeout
                    ? `${pitcherLabel} 탈삼진`
                    : `${hitterLabel} 삼진`
                }
                labelB={
                  pitcherStrikeout && hitterStrikeout
                    ? `${hitterLabel} 삼진`
                    : ""
                }
                colorMode="inverted"
              />
            ) : (
              <div
                className="rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 flex items-center justify-center"
                style={{ width: TOTAL, height: TOTAL }}
              >
                <p className="text-xs text-gray-300">삼진 데이터 없음</p>
              </div>
            )}
          </div>
          {/* k-zone 범례 */}
          <div className="px-5 pb-4 flex flex-wrap gap-2">
            {[
              { label: "공략 (K율 높음)", step: 5, evType: "공략" as ZoneType },
              { label: "중립", step: 3, evType: "중립" as ZoneType },
            ].map(({ label, step, evType }) => {
              const pal = PALETTE_INVERTED[step];
              const ev = ELEVATION[evType];
              const show = evType !== "중립";
              return (
                <div key={label} className="flex items-center gap-1.5">
                  <div
                    style={{
                      width: 22,
                      height: 11,
                      borderRadius: 3,
                      background: pal.bg,
                      borderTop: show
                        ? ev.overlayBorderTop
                        : "1px solid rgba(0,0,0,0.08)",
                      borderLeft: show
                        ? ev.overlayBorderLeft
                        : "1px solid rgba(0,0,0,0.08)",
                      borderBottom: show
                        ? ev.overlayBorderBottom
                        : "1px solid rgba(0,0,0,0.08)",
                      borderRight: show
                        ? ev.overlayBorderRight
                        : "1px solid rgba(0,0,0,0.08)",
                    }}
                  />
                  <span
                    className="text-[9px]"
                    style={{ color: show ? "#1D4ED8" : "#9CA3AF" }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
