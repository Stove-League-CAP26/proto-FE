// 선수 비교 모드별 컨텐츠를 렌더링하는 컴포넌트
// 선수 미선택 안내, 모드 불일치 경고, 스탯테이블/존비교/AI분석을 순서대로 표시
import StatCompareTable from "@/components/compare/StatCompareTable";
import ZoneCompareSection from "@/components/compare/ZoneCompareSection";
import AIAnalysisPanel from "@/components/compare/AIAnalysisPanel";

interface ComparePlayer {
  name: string;
  type: "hitter" | "pitcher";
  stats: Record<string, any>;
  hotCold?: any;
  pitchZone?: any;
}

interface CompareModeTabProps {
  pA: ComparePlayer | null;
  pB: ComparePlayer | null;
  mode: "HvP" | "PvP" | "HvH";
}

export default function CompareModeTab({ pA, pB, mode }: CompareModeTabProps) {
  if (!pA || !pB)
    return (
      <div className="text-center py-16 text-gray-300">
        <p className="text-4xl mb-3">⚾</p>
        <p className="font-bold">선수 2명을 선택하면 비교가 시작됩니다</p>
      </div>
    );

  const modeMatch = {
    HvP: pA.type !== pB.type,
    PvP: pA.type === "pitcher" && pB.type === "pitcher",
    HvH: pA.type === "hitter" && pB.type === "hitter",
  };

  if (!modeMatch[mode])
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-center text-amber-700 text-sm font-medium">
        ⚠️ 선택한 선수 유형이 현재 비교 모드와 맞지 않습니다. 선수를 변경하거나 다른 모드를 선택해 주세요.
      </div>
    );

  return (
    <div className="space-y-5">
      <StatCompareTable pA={pA} pB={pB} />
      <ZoneCompareSection pA={pA} pB={pB} />
      <AIAnalysisPanel pA={pA} pB={pB} />
    </div>
  );
}