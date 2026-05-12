// src/components/profile/Pitcher/Statcast/PitcherStatcastTab.tsx
// 구종 구성 옆에 AI 분석 임시 하드코딩 박스 추가
import type { PitcherStatRaw } from "@/utils/StatsCalculator";
import PitcherSeasonTable from "@/components/profile/Pitcher/Statcast/PitcherSeasonTable";
import PitchArsenalCard from "@/components/profile/Pitcher/Statcast/PitchArsenalCard";

interface PitcherStatcastTabProps {
  pid: number;
  stats: PitcherStatRaw[];
}

// ── 임시 AI 분석 박스 ─────────────────────────────────────────────────────────
function AiAnalysisBox() {
  return (
    <div
      className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 flex flex-col gap-3"
      style={{ minHeight: 200 }}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          AI 투구 분석
        </p>
        <span className="ml-auto text-[10px] text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
          Beta
        </span>
      </div>

      {/* 임시 분석 텍스트 */}
      <div className="space-y-2">
        <p className="text-sm font-bold text-gray-700">구종 구성 분석</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          이 투수의 주력 구종 구성과 배합 전략을 분석합니다. 상대 타자 유형에
          따라 직구·변화구 비율이 어떻게 조정되는지, 카운트별 선택 구종 패턴
          등의 세부 분석이 제공될 예정입니다.
        </p>
        <div className="border-t border-gray-200 pt-2 space-y-1.5">
          {[
            "주력 구종 의존도 분석",
            "카운트별 구종 배합 전략",
            "좌우 타자 대비 구종 변화",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
              <p className="text-xs text-gray-400">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-gray-400 mt-auto pt-2 border-t border-gray-200">
        AI 분석은 추후 실제 프롬프트 연동 후 자동 생성됩니다.
      </p>
    </div>
  );
}

export default function PitcherStatcastTab({
  pid,
  stats,
}: PitcherStatcastTabProps) {
  return (
    <div className="space-y-6">
      <PitcherSeasonTable stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 구종 구성 */}
        <PitchArsenalCard pid={pid} />
        {/* AI 분석 임시 박스 */}
        <AiAnalysisBox />
      </div>
    </div>
  );
}
