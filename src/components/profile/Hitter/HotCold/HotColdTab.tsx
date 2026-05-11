// src/components/profile/Hitter/HotCold/HotColdTab.tsx
// dataSource prop 제거 — "DB데이터" 라벨 하위 컴포넌트에 전달 안 함
import HotColdZone from "@/components/profile/Hitter/HotCold/HotColdZone";
import HitterStrikeoutZone from "@/components/profile/Hitter/HotCold/HitterStrikeoutZone";
import type { ZoneGrid } from "@/components/common/ZoneHeatmap";

interface HotColdTabData {
  outer: ZoneGrid["outer"];
  inner: ZoneGrid["inner"];
  strikeout: ZoneGrid;
  hitDistrib: { LF: string; CF: string; RF: string };
}

interface HotColdTabProps {
  data: HotColdTabData;
  battingSide?: string;
}

export default function HotColdTab({ data, battingSide }: HotColdTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <HotColdZone
        zone={{ outer: data.outer, inner: data.inner }}
        battingSide={battingSide}
      />
      <HitterStrikeoutZone zone={data.strikeout} battingSide={battingSide} />
    </div>
  );
}
