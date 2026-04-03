// 타자 삼진 분포도 — 삼진 많음=파랑, 적음=빨강 (반전)
// 타자 입장에서 삼진을 많이 당하는 구역이므로 파랑(위험)으로 표현
import ZoneHeatmap from "@/components/common/ZoneHeatmap";
import type { ZoneGrid } from "@/components/common/ZoneHeatmap";

interface HitterStrikeoutZoneProps {
  zone: ZoneGrid;
  dataSource?: "db" | "loading";
}

export default function HitterStrikeoutZone({
  zone,
  dataSource,
}: HitterStrikeoutZoneProps) {
  const badge = dataSource === "db" && (
    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full border bg-green-50 text-green-600 border-green-200">
      DB 데이터
    </span>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-2 h-6 rounded-full bg-yellow-400 inline-block" />
        <h3 className="font-bold text-gray-800">삼진 분포도</h3>
        {badge}
      </div>
      <ZoneHeatmap
        zone={zone}
        footnote="타자 시점 기준 (삼진비율)"
        colorMode="inverted"
      />
    </div>
  );
}
