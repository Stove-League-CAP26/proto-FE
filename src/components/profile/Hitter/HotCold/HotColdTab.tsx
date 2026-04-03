// 타자 핫/콜드존 탭 — HotColdZone + HitterStrikeoutZone 조합
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
  dataSource?: "db" | "loading";
}

export default function HotColdTab({ data, dataSource }: HotColdTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <HotColdZone
        zone={{ outer: data.outer, inner: data.inner }}
        dataSource={dataSource}
      />
      <HitterStrikeoutZone zone={data.strikeout} dataSource={dataSource} />
    </div>
  );
}
