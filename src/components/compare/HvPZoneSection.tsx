// src/components/compare/HvPZoneSection.tsx
// hover -> ZoneHeatmap 동일 레이아웃, 공략/제구금지 두 곳만 강조
import { useState, useMemo } from "react";
import ZoneHeatmap from "@/components/common/ZoneHeatmap";
import type { ZoneGrid } from "@/components/common/ZoneHeatmap";

interface HvPZoneSectionProps {
  hitterName: string;
  pitcherName: string;
  hitterHotCold: ZoneGrid | null;
  hitterStrikeout?: ZoneGrid | null;
  pitcherStrikeout?: ZoneGrid | null;
}

// ZoneHeatmap.tsx 와 동일한 레이아웃 상수
const TOTAL = 280;
const OUTER = 139;
const INNER = 168;
const INNER_OFFSET = OUTER - 85;
const CELL_SIZE = INNER / 3;
const STRIKE_PADDING = 6;
const STRIKE_LEFT = INNER_OFFSET - STRIKE_PADDING;
const STRIKE_TOP = INNER_OFFSET - STRIKE_PADDING;
const STRIKE_SIZE = INNER + STRIKE_PADDING * 2;
const BALL_PADDING = 4;

const MINI_PX = 174;
const MINI_SCALE = 0.62;

const INNER_LABELS = [
  "높은 내각",
  "높은 중앙",
  "높은 외각",
  "중간 내각",
  "중  앙",
  "중간 외각",
  "낮은 내각",
  "낮은 중앙",
  "낮은 외각",
];
const OUTER_LABELS = ["상단 외곽", "우측 외곽", "하단 외곽", "좌측 외곽"];

interface ZoneValues {
  inner: number[];
  outer: number[];
}

function extractValues(zone: ZoneGrid | null): ZoneValues {
  if (!zone) return { inner: [], outer: [] };
  const z = zone as any;
  if (z.inner && z.outer) {
    return {
      inner: (z.inner as any[]).map((c) => parseFloat(c.val ?? "0")),
      outer: (z.outer as any[]).map((c) => parseFloat(c.val ?? "0")),
    };
  }
  if (Array.isArray(z.cells)) return { inner: z.cells.map(Number), outer: [] };
  if (Array.isArray(z.values))
    return { inner: z.values.map(Number), outer: [] };
  return { inner: [], outer: [] };
}

function normalize(arr: number[]): number[] {
  const max = Math.max(...arr, 0.0001);
  const min = Math.min(...arr);
  if (max === min) return arr.map(() => 0.5);
  return arr.map((v) => (v - min) / (max - min));
}

function getCellStyle(isTop: boolean, isBot: boolean): React.CSSProperties {
  if (isTop)
    return {
      backgroundColor: "#14532d",
      border: "2.5px solid #22c55e",
      boxShadow: "0 0 12px rgba(34,197,94,0.5)",
      color: "#86efac",
      fontWeight: 800,
      fontSize: 12,
    };
  if (isBot)
    return {
      backgroundColor: "#450a0a",
      border: "2px solid #ef4444",
      boxShadow: "0 0 12px rgba(239,68,68,0.4)",
      color: "#fca5a5",
      fontWeight: 800,
      fontSize: 11,
    };
  return {
    backgroundColor: "#e5e7eb",
    border: "1.5px solid #d1d5db",
    color: "transparent",
  };
}

// ZoneHeatmap 과 동일한 레이아웃 — 색만 두 곳 강조
function AttackZoneMap({
  hitVals,
  pitVals,
}: {
  hitVals: ZoneValues;
  pitVals: ZoneValues;
}) {
  const innerLen = Math.max(hitVals.inner.length, pitVals.inner.length);
  const outerLen = Math.max(hitVals.outer.length, pitVals.outer.length);

  if (innerLen === 0 && outerLen === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs text-gray-400"
        style={{ width: TOTAL, height: TOTAL }}
      >
        존 데이터가 없습니다
      </div>
    );
  }

  const innerSum = Array.from(
    { length: innerLen },
    (_, i) => (hitVals.inner[i] ?? 0) + (pitVals.inner[i] ?? 0),
  );
  const outerSum = Array.from(
    { length: outerLen },
    (_, i) => (hitVals.outer[i] ?? 0) + (pitVals.outer[i] ?? 0),
  );

  const allSum = [...innerSum, ...outerSum];
  const normAll = normalize(allSum);

  const topIdx = normAll.indexOf(Math.max(...normAll));
  const botIdx = normAll.indexOf(Math.min(...normAll));

  const topInnerIdx = topIdx < innerLen ? topIdx : -1;
  const botInnerIdx = botIdx < innerLen ? botIdx : -1;
  const topOuterIdx = topIdx >= innerLen ? topIdx - innerLen : -1;
  const botOuterIdx = botIdx >= innerLen ? botIdx - innerLen : -1;

  // 외곽 4칸 위치 (ZoneHeatmap 과 동일)
  const outerPos = [
    { top: 0, left: 0, ai: "flex-start", jc: "flex-start" },
    { top: 0, left: TOTAL - OUTER, ai: "flex-start", jc: "flex-end" },
    { top: TOTAL - OUTER, left: 0, ai: "flex-end", jc: "flex-start" },
    { top: TOTAL - OUTER, left: TOTAL - OUTER, ai: "flex-end", jc: "flex-end" },
  ] as const;

  return (
    <div className="flex flex-col items-center w-full">
      <div
        style={{
          width: TOTAL,
          textAlign: "left",
          fontSize: 12,
          fontWeight: 700,
          color: "#555",
          letterSpacing: "0.05em",
          marginBottom: 4,
        }}
      >
        볼존
      </div>

      <div style={{ position: "relative", width: TOTAL, height: TOTAL }}>
        {/* 볼존 테두리 */}
        <div
          style={{
            position: "absolute",
            top: -BALL_PADDING,
            left: -BALL_PADDING,
            width: TOTAL + BALL_PADDING * 2,
            height: TOTAL + BALL_PADDING * 2,
            border: "3px solid #555",
            borderRadius: 8,
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* 외곽 코너 4칸 */}
        {outerPos.slice(0, outerLen).map((pos, i) => {
          const isTop = i === topOuterIdx;
          const isBot = i === botOuterIdx;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: pos.top,
                left: pos.left,
                width: OUTER,
                height: OUTER,
                borderRadius: 4,
                display: "flex",
                alignItems: pos.ai,
                justifyContent: pos.jc,
                padding: 8,
                zIndex: 2,
                ...getCellStyle(isTop, isBot),
              }}
            >
              {isTop && "공략"}
              {isBot && "제구금지"}
            </div>
          );
        })}

        {/* 스트라이크존 빨간 테두리 */}
        <div
          style={{
            position: "absolute",
            top: STRIKE_TOP + 2,
            left: STRIKE_LEFT + 2,
            width: STRIKE_SIZE,
            height: STRIKE_SIZE,
            border: "3px solid #ff0000",
            borderRadius: 6,
            zIndex: 9,
            pointerEvents: "none",
          }}
        />

        {/* 스트라이크존 라벨 */}
        <div
          style={{
            position: "absolute",
            top: STRIKE_TOP - 15,
            left: STRIKE_LEFT,
            width: STRIKE_SIZE,
            textAlign: "left",
            fontSize: 12,
            fontWeight: 700,
            color: "#ff0000",
            letterSpacing: "0.05em",
            zIndex: 11,
            pointerEvents: "none",
          }}
        >
          스트라이크존
        </div>

        {/* 내부 3x3 */}
        <div
          style={{
            position: "absolute",
            top: INNER_OFFSET,
            left: INNER_OFFSET,
            width: INNER,
            height: INNER,
            display: "grid",
            gridTemplateColumns: `repeat(3, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(3, ${CELL_SIZE}px)`,
            gap: 2,
            zIndex: 10,
          }}
        >
          {Array.from({ length: innerLen }, (_, i) => {
            const isTop = i === topInnerIdx;
            const isBot = i === botInnerIdx;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 3,
                  border: "1.5px solid rgba(255,255,255,0.6)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                  ...getCellStyle(isTop, isBot),
                }}
              >
                {isTop && "공략"}
                {isBot && "제구금지"}
              </div>
            );
          })}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex gap-4 mt-4 justify-center">
        {[
          { bg: "#14532d", border: "#22c55e", label: "공략" },
          { bg: "#450a0a", border: "#ef4444", label: "제구금지" },
          { bg: "#e5e7eb", border: "#d1d5db", label: "일반" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                backgroundColor: item.bg,
                border: `1.5px solid ${item.border}`,
                flexShrink: 0,
              }}
            />
            <span className="text-[10px] text-gray-500 font-medium">
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-gray-400 mt-1.5 text-center">
        타자 삼진 + 투수 탈삼진 합산 기준 · 투수 시점
      </p>
    </div>
  );
}

// 좌측 BigZone
function BigZone({ zone, name }: { zone: ZoneGrid | null; name: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 self-start">
        <span
          className="px-3 py-1 rounded-full text-xs font-black text-white"
          style={{ background: "#3B82F6" }}
        >
          {name || "타자"}
        </span>
        <span className="text-[10px] text-gray-400">핫/콜드존</span>
      </div>
      {zone ? (
        <div style={{ width: 280, height: 280, flexShrink: 0 }}>
          <ZoneHeatmap zone={zone} colorMode="hotcold" />
        </div>
      ) : (
        <div
          className="rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50
             flex items-center justify-center flex-shrink-0"
          style={{ width: 280, height: 280 }}
        >
          <p className="text-xs text-gray-300">선수 선택 후 표시</p>
        </div>
      )}
      <p className="text-[9px] text-gray-400">
        투수 시점 기준 · 색상 = 구역별 상대값
      </p>
    </div>
  );
}

// split 뷰용 MiniZone
function MiniZone({
  zone,
  colorMode,
  name,
  accentColor,
  label,
  footnote,
}: {
  zone: ZoneGrid | null;
  colorMode: "hotcold" | "single" | "inverted";
  name: string;
  accentColor: string;
  label: string;
  footnote?: string;
}) {
  return (
    <div className="bg-gray-50/60 rounded-2xl p-3 flex flex-col items-center gap-2 border border-gray-100">
      <div className="flex items-center gap-2 self-stretch">
        <div
          className="w-1 h-4 rounded-full flex-shrink-0"
          style={{ background: accentColor }}
        />
        <p className="text-[11px] font-bold text-gray-700 truncate">{name}</p>
        <span className="text-[9px] text-gray-400 ml-auto whitespace-nowrap">
          {label}
        </span>
      </div>
      {zone ? (
        <div
          style={{
            width: MINI_PX,
            height: MINI_PX,
            position: "relative",
            overflow: "visible",
            flexShrink: 0,
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
          className="rounded-xl border border-dashed border-gray-200 bg-white flex items-center justify-center flex-shrink-0"
          style={{ width: MINI_PX, height: MINI_PX }}
        >
          <p className="text-[10px] text-gray-300">데이터 없음</p>
        </div>
      )}
      {footnote && (
        <p className="text-[9px] text-gray-400 text-center">{footnote}</p>
      )}
    </div>
  );
}

// 메인 컴포넌트
export default function HvPZoneSection({
  hitterName,
  pitcherName,
  hitterHotCold,
  hitterStrikeout,
  pitcherStrikeout,
}: HvPZoneSectionProps) {
  const [hovered, setHovered] = useState(false);

  const hitVals = useMemo(
    () => extractValues(hitterStrikeout ?? null),
    [hitterStrikeout],
  );
  const pitVals = useMemo(
    () => extractValues(pitcherStrikeout ?? null),
    [pitcherStrikeout],
  );
  const hasData = hitVals.inner.length > 0 || pitVals.inner.length > 0;

  // 배너 레이블 계산
  const innerLen = Math.max(hitVals.inner.length, pitVals.inner.length);
  const outerLen = Math.max(hitVals.outer.length, pitVals.outer.length);
  const innerSum = Array.from(
    { length: innerLen },
    (_, i) => (hitVals.inner[i] ?? 0) + (pitVals.inner[i] ?? 0),
  );
  const outerSum = Array.from(
    { length: outerLen },
    (_, i) => (hitVals.outer[i] ?? 0) + (pitVals.outer[i] ?? 0),
  );
  const allSum = [...innerSum, ...outerSum];
  const normAll = hasData ? normalize(allSum) : [];
  const allLabels = [
    ...INNER_LABELS.slice(0, innerLen),
    ...OUTER_LABELS.slice(0, outerLen),
  ];
  const topIdx =
    normAll.length > 0 ? normAll.indexOf(Math.max(...normAll)) : -1;
  const botIdx =
    normAll.length > 0 ? normAll.indexOf(Math.min(...normAll)) : -1;
  const topLabel = topIdx >= 0 ? (allLabels[topIdx] ?? "-") : "-";
  const botLabel = botIdx >= 0 ? (allLabels[botIdx] ?? "-") : "-";

  const T = "opacity 0.32s ease, transform 0.32s ease";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2 flex-wrap">
        <span className="w-1.5 h-5 rounded-full inline-block bg-purple-500" />
        <h3 className="font-bold text-gray-800 text-sm">존 분석</h3>
        <span className="text-[10px] text-gray-400 ml-auto">
          투수 시점 기준
        </span>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <BigZone zone={hitterHotCold} name={hitterName} />

        <div
          className="relative"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ minHeight: 400 }}
        >
          {/* split 뷰 */}
          <div
            style={{
              opacity: hovered ? 0 : 1,
              transform: hovered ? "scale(0.96)" : "scale(1)",
              transition: T,
              pointerEvents: hovered ? "none" : "auto",
              position: hovered ? "absolute" : "static",
              inset: 0,
            }}
          >
            <div className="flex flex-col gap-3">
              <p className="text-[10px] text-gray-400 text-center">
                마우스를 올리면 투수 공략 가이드를 확인할 수 있습니다
              </p>
              <MiniZone
                zone={hitterStrikeout ?? null}
                colorMode="single"
                name={hitterName}
                accentColor="#3B82F6"
                label="삼진 분포"
                footnote="타자가 삼진당한 구역 (해당 구역 취약)"
              />
              <MiniZone
                zone={pitcherStrikeout ?? null}
                colorMode="inverted"
                name={pitcherName}
                accentColor="#F97316"
                label="탈삼진 분포"
                footnote="투수가 삼진을 잡아낸 구역 (해당 구역 강점)"
              />
            </div>
          </div>

          {/* merged 뷰 */}
          <div
            style={{
              opacity: hovered ? 1 : 0,
              transform: hovered ? "scale(1)" : "scale(1.03)",
              transition: T,
              pointerEvents: hovered ? "auto" : "none",
              position: hovered ? "static" : "absolute",
              inset: 0,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black text-gray-800">
                투수 공략 가이드
              </p>
              <div className="flex gap-1.5 items-center">
                <span
                  className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white"
                  style={{ background: "#3B82F6" }}
                >
                  {hitterName}
                </span>
                <span className="text-[9px] text-gray-400">vs</span>
                <span
                  className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white"
                  style={{ background: "#F97316" }}
                >
                  {pitcherName}
                </span>
              </div>
            </div>

            {hasData && (
              <div className="flex gap-2 mb-3">
                <div
                  className="flex-1 rounded-xl px-3 py-2 text-center"
                  style={{
                    background: "#14532d",
                    border: "1px solid #22c55e44",
                  }}
                >
                  <p className="text-[9px] text-green-400 mb-0.5">
                    최우선 공략
                  </p>
                  <p className="text-xs font-black text-green-300">
                    {topLabel}
                  </p>
                </div>
                <div
                  className="flex-1 rounded-xl px-3 py-2 text-center"
                  style={{
                    background: "#450a0a",
                    border: "1px solid #ef444444",
                  }}
                >
                  <p className="text-[9px] text-red-400 mb-0.5">제구 금지</p>
                  <p className="text-xs font-black text-red-300">{botLabel}</p>
                </div>
              </div>
            )}

            {hasData ? (
              <AttackZoneMap hitVals={hitVals} pitVals={pitVals} />
            ) : (
              <div className="flex items-center justify-center h-48">
                <p className="text-xs text-gray-400">
                  존 데이터를 불러오는 중입니다
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
