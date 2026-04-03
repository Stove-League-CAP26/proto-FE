// 투수 스탯캐스트 탭 — PitcherSeasonTable + PitchArsenalCard 조합
import type { PitcherStatRaw } from "@/utils/StatsCalculator";
import PitcherSeasonTable from "@/components/profile/Pitcher/Statcast/PitcherSeasonTable";
import PitchArsenalCard from "@/components/profile/Pitcher/Statcast/PitchArsenalCard";

interface PitcherStatcastTabProps {
  pid: number;
  stats: PitcherStatRaw[];
}

export default function PitcherStatcastTab({
  pid,
  stats,
}: PitcherStatcastTabProps) {
  return (
    <div className="space-y-6">
      <PitcherSeasonTable stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PitchArsenalCard pid={pid} />
      </div>
    </div>
  );
}
