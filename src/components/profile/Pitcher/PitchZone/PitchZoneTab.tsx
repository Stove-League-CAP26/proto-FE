// src/components/profile/Pitcher/PitchZone/PitchZoneTab.tsx
// dataSource prop 제거 — "DB데이터" 라벨 하위 컴포넌트에 전달 안 함
import PitchZone from "@/components/profile/Pitcher/PitchZone/PitchZone";
import PitcherStrikeoutZone from "@/components/profile/Pitcher/PitchZone/PitcherStrikeoutZone";
import type { ZoneGrid } from "@/components/common/ZoneHeatmap";

interface PitchZoneTabProps {
  pitchZone: ZoneGrid;
  strikeoutZone: ZoneGrid;
  baZone?: ZoneGrid;
}

export default function PitchZoneTab({
  pitchZone,
  strikeoutZone,
  baZone,
}: PitchZoneTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <PitchZone zone={pitchZone} />
      <PitcherStrikeoutZone zone={strikeoutZone} />
    </div>
  );
}
