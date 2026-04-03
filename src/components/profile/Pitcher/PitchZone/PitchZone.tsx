// 투수 투구 분포도 — 단색 그라데이션 (높음=진빨강, 낮음=연빨강)
// 잘침/못침 기준이 없으므로 빈도를 단일 색상으로 표현
import ZoneHeatmap from "@/components/common/ZoneHeatmap";
import type { ZoneGrid } from "@/components/common/ZoneHeatmap";

interface PitchZoneProps {
  zone: ZoneGrid;
  dataSource?: "db" | "loading";
}

export default function PitchZone({ zone, dataSource }: PitchZoneProps) {
  const badge = dataSource === "db" && (
    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full border bg-green-50 text-green-600 border-green-200">
      DB 데이터
    </span>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-5 rounded-full bg-blue-500" />
        <h3 className="font-bold text-gray-800">투구 분포도</h3>
        {badge}
      </div>
      <ZoneHeatmap
        zone={zone}
        footnote="투수 시점 기준 (투구 빈도)"
        colorMode="single"
      />
    </div>
  );
}
