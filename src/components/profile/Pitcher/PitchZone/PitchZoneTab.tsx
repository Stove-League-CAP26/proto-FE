// src/components/profile/Pitcher/PitchZone/PitchZoneTab.tsx
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
      {/* dataSource="db" 명시 — 하위 컴포넌트의 조건부 렌더링 보장 */}
      <PitchZone zone={pitchZone} dataSource="db" />
      <PitcherStrikeoutZone zone={strikeoutZone} dataSource="db" />
    </div>
  );
}
