// 투수 투구존 탭 — PitchZone + PitcherStrikeoutZone 조합
import PitchZone from "@/components/profile/Pitcher/PitchZone/PitchZone";
import PitcherStrikeoutZone from "@/components/profile/Pitcher/PitchZone/PitcherStrikeoutZone";
import type { ZoneGrid } from "@/components/common/ZoneHeatmap";

interface PitchZoneTabProps {
  pitchZone: ZoneGrid;
  strikeoutZone: ZoneGrid;
  dataSource?: "db" | "loading";
}

export default function PitchZoneTab({
  pitchZone,
  strikeoutZone,
  dataSource,
}: PitchZoneTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <PitchZone zone={pitchZone} dataSource={dataSource} />
      <PitcherStrikeoutZone zone={strikeoutZone} dataSource={dataSource} />
    </div>
  );
}
