// 타자 스탯캐스트 탭 — HitterSeasonTable + HitDirectionChart 조합
import type { HitterCombinedStat } from "@/utils/StatsCalculator";
import HitterSeasonTable from "@/components/profile/Hitter/Statcast/HitterSeasonTable";
import HitDirectionChart from "@/components/profile/Hitter/Statcast/HitDirectionChart";

interface HitterStatcastTabProps {
  stats: HitterCombinedStat[];
  hitDistrib?: { LF: string; CF: string; RF: string };
}

export default function HitterStatcastTab({
  stats,
  hitDistrib,
}: HitterStatcastTabProps) {
  return (
    <div className="space-y-6">
      <HitterSeasonTable stats={stats} />
      {hitDistrib && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HitDirectionChart hitDistrib={hitDistrib} />
        </div>
      )}
    </div>
  );
}
