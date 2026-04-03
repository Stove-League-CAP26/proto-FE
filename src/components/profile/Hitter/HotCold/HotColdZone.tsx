// 타자 HOT & COLD ZONE — 높음=빨강, 낮음=파랑
import ZoneHeatmap from "@/components/common/ZoneHeatmap";
import type { ZoneGrid } from "@/components/common/ZoneHeatmap";

interface HotColdZoneProps {
  zone: ZoneGrid;
  dataSource?: "db" | "loading";
}

export default function HotColdZone({ zone, dataSource }: HotColdZoneProps) {
  const badge = dataSource === "db" && (
    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full border bg-green-50 text-green-600 border-green-200">
      DB 데이터
    </span>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-2 h-6 rounded-full bg-red-500 inline-block" />
        <h3 className="font-bold text-gray-800">HOT &amp; COLD ZONE</h3>
        {badge}
      </div>
      <ZoneHeatmap
        zone={zone}
        footnote="타자 시점 기준 (타율)"
        colorMode="hotcold"
      />
    </div>
  );
}
