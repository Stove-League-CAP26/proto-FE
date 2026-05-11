// src/components/compare/HvPZoneSection.tsx
// 타자 삼진분포 + 투수 탈삼진분포 side-by-side
// hover → inner(3×3) + outer(4셀) 합산 공략 가이드
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

const BIG_PX = 280;
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

type Grade = "공략" | "주의공략" | "중립" | "주의" | "제구금지";
interface GradeInfo {
  grade: Grade;
  bg: string;
  text: string;
  border: string;
}

function getGrade(norm: number): GradeInfo {
  if (norm >= 0.8)
    return {
      grade: "공략",
      bg: "#16a34a",
      text: "#fff",
      border: "rgba(255,255,255,0.45)",
    };
  if (norm >= 0.6)
    return {
      grade: "주의공략",
      bg: "#65a30d",
      text: "#fff",
      border: "transparent",
    };
  if (norm >= 0.38)
    return {
      grade: "중립",
      bg: "#ca8a04",
      text: "#fff",
      border: "transparent",
    };
  if (norm >= 0.18)
    return {
      grade: "주의",
      bg: "#dc2626",
      text: "#fff",
      border: "transparent",
    };
  return {
    grade: "제구금지",
    bg: "#7f1d1d",
    text: "#fca5a5",
    border: "rgba(252,165,165,0.45)",
  };
}

function GradeCell({
  info,
  label,
  isTop,
  isBot,
}: {
  info: GradeInfo;
  label: string;
  isTop: boolean;
  isBot: boolean;
}) {
  return (
    <div
      style={{
        background: info.bg,
        borderRadius: 8,
        border: `2px solid ${info.border}`,
        padding: "6px 4px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        minHeight: 52,
        boxShadow: isTop
          ? "0 0 10px rgba(22,163,74,0.5)"
          : isBot
            ? "0 0 10px rgba(127,29,29,0.5)"
            : undefined,
        transition: "transform 0.12s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1.06)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 800,
          color: info.text,
          lineHeight: 1,
        }}
      >
        {info.grade}
      </span>
      <span
        style={{
          fontSize: 8,
          color: "rgba(255,255,255,0.72)",
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function AttackGuideGrid({
  hitVals,
  pitVals,
  hitterName,
  pitcherName,
}: {
  hitVals: ZoneValues;
  pitVals: ZoneValues;
  hitterName: string;
  pitcherName: string;
}) {
  const innerLen = Math.max(hitVals.inner.length, pitVals.inner.length);
  const outerLen = Math.max(hitVals.outer.length, pitVals.outer.length);

  if (innerLen === 0 && outerLen === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-xs text-gray-400">
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
  const innerNorm = normAll.slice(0, innerLen);
  const outerNorm = normAll.slice(innerLen);

  const innerInfos = innerNorm.map(getGrade);
  const outerInfos = outerNorm.map(getGrade);

  const topIdx = normAll.indexOf(Math.max(...normAll));
  const botIdx = normAll.indexOf(Math.min(...normAll));
  const allLabels = [
    ...INNER_LABELS.slice(0, innerLen),
    ...OUTER_LABELS.slice(0, outerLen),
  ];

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* 요약 배너 */}
      <div className="flex gap-3 w-full">
        <div
          className="flex-1 rounded-xl px-3 py-2 text-center"
          style={{ background: "#14532d" }}
        >
          <p className="text-[9px] text-green-300 mb-0.5">최우선 공략</p>
          <p className="text-xs font-black text-green-200">
            {allLabels[topIdx] ?? "-"}
          </p>
        </div>
        <div
          className="flex-1 rounded-xl px-3 py-2 text-center"
          style={{ background: "#450a0a" }}
        >
          <p className="text-[9px] text-red-300 mb-0.5">제구 금지</p>
          <p className="text-xs font-black text-red-300">
            {allLabels[botIdx] ?? "-"}
          </p>
        </div>
      </div>

      {/* inner 3x3 */}
      <p className="text-[9px] text-gray-400 self-start font-semibold">
        스트라이크 존
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 5,
          width: "100%",
          maxWidth: 300,
        }}
      >
        {innerInfos.map((info, i) => (
          <GradeCell
            key={`in-${i}`}
            info={info}
            label={INNER_LABELS[i] ?? `내부 ${i + 1}`}
            isTop={topIdx === i}
            isBot={botIdx === i}
          />
        ))}
      </div>

      {/* outer 4셀 */}
      {outerInfos.length > 0 && (
        <>
          <p className="text-[9px] text-gray-400 self-start font-semibold">
            외곽 존
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 5,
              width: "100%",
              maxWidth: 300,
            }}
          >
            {outerInfos.map((info, i) => (
              <GradeCell
                key={`out-${i}`}
                info={info}
                label={OUTER_LABELS[i] ?? `외곽 ${i + 1}`}
                isTop={topIdx === innerLen + i}
                isBot={botIdx === innerLen + i}
              />
            ))}
          </div>
        </>
      )}

      {/* 범례 */}
      <div className="flex gap-2 flex-wrap justify-center">
        {(["공략", "주의공략", "중립", "주의", "제구금지"] as Grade[]).map(
          (g, i) => {
            const colors = [
              "#16a34a",
              "#65a30d",
              "#ca8a04",
              "#dc2626",
              "#7f1d1d",
            ];
            return (
              <div key={g} className="flex items-center gap-1">
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: colors[i],
                    flexShrink: 0,
                  }}
                />
                <span className="text-[9px] text-gray-500">{g}</span>
              </div>
            );
          },
        )}
      </div>

      <p className="text-[9px] text-gray-400 text-center">
        타자 삼진 + 투수 탈삼진 합산 기준 · 투수 시점
      </p>
    </div>
  );
}

function BigZone({ zone, name }: { zone: ZoneGrid | null; name: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 self-start">
        <span
          className="px-3 py-1 rounded-full text-xs font-black text-white"
          style={{ background: "#3B82F6" }}
        >
          🏏 {name || "타자"}
        </span>
        <span className="text-[10px] text-gray-400">핫/콜드존</span>
      </div>
      {zone ? (
        <div style={{ width: BIG_PX, height: BIG_PX, flexShrink: 0 }}>
          <ZoneHeatmap zone={zone} colorMode="hotcold" />
        </div>
      ) : (
        <div
          className="rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 flex items-center justify-center flex-shrink-0"
          style={{ width: BIG_PX, height: BIG_PX }}
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
          style={{ minHeight: 420 }}
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
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-black text-gray-800">
                🎯 투수 공략 가이드
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

            {hasData ? (
              <AttackGuideGrid
                hitVals={hitVals}
                pitVals={pitVals}
                hitterName={hitterName}
                pitcherName={pitcherName}
              />
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
