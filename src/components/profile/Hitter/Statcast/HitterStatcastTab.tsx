// src/components/profile/Hitter/Statcast/HitterStatcastTab.tsx
// 타구 분포 옆에 AI 분석 임시 하드코딩 박스 추가
import type { HitterCombinedStat } from "@/utils/StatsCalculator";
import HitterSeasonTable from "@/components/profile/Hitter/Statcast/HitterSeasonTable";
import HitDirectionChart from "@/components/profile/Hitter/Statcast/HitDirectionChart";

interface HitterStatcastTabProps {
  stats: HitterCombinedStat[];
  hitDistrib?: { LF: string; CF: string; RF: string };
}

// ── 임시 AI 분석 박스 ─────────────────────────────────────────────────────────
function AiAnalysisBox({
  hitDistrib,
}: {
  hitDistrib?: { LF: string; CF: string; RF: string };
}) {
  const lf = parseFloat(hitDistrib?.LF ?? "0") || 0;
  const cf = parseFloat(hitDistrib?.CF ?? "0") || 0;
  const rf = parseFloat(hitDistrib?.RF ?? "0") || 0;
  const dominant =
    lf > cf && lf > rf
      ? "좌측(LF)"
      : rf > cf && rf > lf
        ? "우측(RF)"
        : "중앙(CF)";

  return (
    <div
      className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 flex flex-col gap-3"
      style={{ minHeight: 200 }}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          AI 타격 분석
        </p>
        <span className="ml-auto text-[10px] text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
          Beta
        </span>
      </div>

      {/* 임시 분석 텍스트 */}
      <div className="space-y-2">
        <p className="text-sm font-bold text-gray-700">타구 방향 분석</p>
        {lf + cf + rf > 0 ? (
          <p className="text-xs text-gray-500 leading-relaxed">
            타구 분포 데이터 기준으로 이 타자는{" "}
            <span className="font-semibold text-gray-700">{dominant}</span> 방향
            타구 비율이 가장 높습니다. 풀히팅 또는 푸시히팅 성향, 구종별 대응
            방향, 수비 쉬프트 대응 전략 등의 세부 분석이 제공될 예정입니다.
          </p>
        ) : (
          <p className="text-xs text-gray-500 leading-relaxed">
            타구 방향 패턴, 풀히팅·푸시히팅 성향, 구종별 반응 방향 등의 세부
            분석이 제공될 예정입니다.
          </p>
        )}
        <div className="border-t border-gray-200 pt-2 space-y-1.5">
          {[
            "타구 방향 성향 분석",
            "구종별 대응 방향 패턴",
            "수비 쉬프트 취약 구역",
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

export default function HitterStatcastTab({
  stats,
  hitDistrib,
}: HitterStatcastTabProps) {
  return (
    <div className="space-y-6">
      <HitterSeasonTable stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hitDistrib && <HitDirectionChart hitDistrib={hitDistrib} />}
        {/* AI 분석 임시 박스 */}
        <AiAnalysisBox hitDistrib={hitDistrib} />
      </div>
    </div>
  );
}
