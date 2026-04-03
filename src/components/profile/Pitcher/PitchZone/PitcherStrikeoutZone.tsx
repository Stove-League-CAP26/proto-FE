// 투수 탈삼진 분포도 — 높음=빨강, 낮음=파랑
// 투수가 해당 구역으로 던졌을 때 삼진을 많이 잡는 구역을 빨강으로 강조
import ZoneHeatmap from "@/components/common/ZoneHeatmap";
import type { ZoneGrid } from "@/components/common/ZoneHeatmap";

interface PitcherStrikeoutZoneProps {
  zone: ZoneGrid;
  dataSource?: "db" | "loading";
}

export default function PitcherStrikeoutZone({
  zone,
  dataSource,
}: PitcherStrikeoutZoneProps) {
  const badge = dataSource === "db" && (
    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full border bg-green-50 text-green-600 border-green-200">
      DB 데이터
    </span>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-5 rounded-full bg-orange-500" />
        <h3 className="font-bold text-gray-800">탈삼진 분포도</h3>
        {badge}
      </div>
      <ZoneHeatmap
        zone={zone}
        footnote="투수 시점 기준 (탈삼진 비율)"
        colorMode="hotcold"
      />
    </div>
  );
}
