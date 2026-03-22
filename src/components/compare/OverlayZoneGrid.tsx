// 타자 핫/콜드존과 투수 투구분포를 오버레이로 합쳐서 공략포인트를 시각화하는 컴포넌트
// 마우스 호버 시 각 구역의 전략(공략/위험/회피/중립)을 색상과 아이콘으로 표시
import { useState } from "react";
import { stepColors } from "@/constants/stepColors";

interface ZoneCell {
  val: string;
  step: number;
}

interface OverlayZoneGridProps {
  hotCold: { outer: ZoneCell[]; inner: ZoneCell[] };
  pitchZone: { outer: ZoneCell[]; inner: ZoneCell[] };
  hitterName: string;
  pitcherName: string;
}

const getStrategy = (hStep: number, pStep: number) => {
  if (hStep >= 4 && pStep >= 4)
    return { label: "위험", color: "#ef4444cc", icon: "⚠️", desc: "타자 강점+투구 집중 → 피안타 위험" };
  if (hStep >= 4 && pStep <= 2)
    return { label: "회피", color: "#f97316cc", icon: "🚫", desc: "타자 강점이지만 잘 안 던지는 코스" };
  if (hStep <= 2 && pStep >= 4)
    return { label: "공략", color: "#22c55ecc", icon: "🎯", desc: "타자 약점×투구 집중 → 최적 투구 코스!" };
  if (hStep <= 2 && pStep <= 2)
    return { label: "중립", color: "#94a3b8cc", icon: "○", desc: "양쪽 모두 낮은 비중" };
  return { label: "보통", color: "#64748baa", icon: "△", desc: "일반적인 투구 구역" };
};

export default function OverlayZoneGrid({ hotCold, pitchZone }: OverlayZoneGridProps) {
  const [hovered, setHovered] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ area: string; idx: number } | null>(null);

  const SIZE = 260, OUTER = 72, INNER_START = OUTER;
  const INNER_SIZE = SIZE - OUTER * 2, CELL = INNER_SIZE / 3;

  const outerPositions = [
    { top: 0,          left: 0,          w: OUTER, h: OUTER },
    { top: 0,          left: SIZE-OUTER, w: OUTER, h: OUTER },
    { top: SIZE-OUTER, left: 0,          w: OUTER, h: OUTER },
    { top: SIZE-OUTER, left: SIZE-OUTER, w: OUTER, h: OUTER },
  ];

  const renderCell = (
    hStep: number,
    pStep: number,
    style: React.CSSProperties,
    area: string,
    idx: number,
  ) => {
    const strat = getStrategy(hStep, pStep);
    const isHov = hoveredCell?.area === area && hoveredCell?.idx === idx;
    return (
      <div
        key={idx}
        className="absolute flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
        style={{
          ...style,
          backgroundColor: hovered ? strat.color : stepColors[hStep]?.bg,
          border: isHov ? "2.5px solid #fff" : "1px solid rgba(255,255,255,0.15)",
          borderRadius: 4,
          zIndex: isHov ? 10 : 1,
          transform: isHov ? "scale(1.08)" : "scale(1)",
          boxShadow: isHov ? "0 4px 16px rgba(0,0,0,0.35)" : "none",
        }}
        onMouseEnter={() => setHoveredCell({ area, idx })}
        onMouseLeave={() => setHoveredCell(null)}
      >
        {hovered ? (
          <>
            <span style={{ fontSize: 14 }}>{strat.icon}</span>
            <span style={{ fontSize: 7, color: "#fff", fontWeight: 700, textAlign: "center", lineHeight: 1.1, marginTop: 2 }}>
              {strat.label}
            </span>
          </>
        ) : (
          <span style={{ fontSize: (style as any).w > 50 ? 10 : 8, color: stepColors[hStep]?.text, fontWeight: 700 }}>
            {area === "outer" ? hotCold.outer[idx]?.val : hotCold.inner[idx]?.val}
          </span>
        )}
      </div>
    );
  };

  const activeStrat = hoveredCell
    ? (() => {
        const hStep = hoveredCell.area === "outer"
          ? hotCold.outer[hoveredCell.idx]?.step
          : hotCold.inner[hoveredCell.idx]?.step;
        const pStep = hoveredCell.area === "outer"
          ? pitchZone.outer[hoveredCell.idx]?.step
          : pitchZone.inner[hoveredCell.idx]?.step;
        return getStrategy(hStep, pStep);
      })()
    : null;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {[
          { color: "#22c55ecc", label: "🎯 공략 포인트" },
          { color: "#ef4444cc", label: "⚠️ 위험 구역" },
          { color: "#f97316cc", label: "🚫 회피" },
          { color: "#94a3b8cc", label: "○ 중립" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
      <div
        className="relative select-none"
        style={{ width: SIZE, height: SIZE }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setHoveredCell(null); }}
      >
        {outerPositions.map((pos, i) =>
          renderCell(
            hotCold.outer[i]?.step,
            pitchZone.outer[i]?.step,
            { position: "absolute", top: pos.top, left: pos.left, width: pos.w, height: pos.h },
            "outer", i,
          ),
        )}
        {hotCold.inner.map((_, i) => {
          const row = Math.floor(i / 3), col = i % 3;
          return renderCell(
            hotCold.inner[i]?.step,
            pitchZone.inner[i]?.step,
            { position: "absolute", top: INNER_START + row * CELL, left: INNER_START + col * CELL, width: CELL - 2, height: CELL - 2 },
            "inner", i,
          );
        })}
        {!hovered && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
              마우스를 올려 분석 보기 ↗
            </div>
          </div>
        )}
      </div>
      <div className="h-8 flex items-center justify-center">
        {activeStrat ? (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white animate-pulse"
            style={{ backgroundColor: activeStrat.color }}
          >
            <span>{activeStrat.icon}</span>
            <span>{activeStrat.desc}</span>
          </div>
        ) : hovered ? (
          <p className="text-xs text-gray-400">각 구역에 마우스를 올려보세요</p>
        ) : null}
      </div>
      <p className="text-xs text-gray-400">투수 시점 기준 · 마우스를 올리면 오버레이 분석 활성화</p>
    </div>
  );
}