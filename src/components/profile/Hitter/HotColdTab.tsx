// 타자 핫/콜드존 탭 — HOT&COLD ZONE + 삼진 분포도
// 타구 방향 분포는 HitterStatcastTab으로 이동
import ZoneHeatmap from "@/components/common/ZoneHeatmap";
import type { ZoneGrid } from "@/components/common/ZoneHeatmap";

interface HotColdTabData {
  outer: ZoneGrid["outer"];
  inner: ZoneGrid["inner"];
  strikeout: ZoneGrid;
  hitDistrib: { LF: string; CF: string; RF: string }; // HitterStatcastTab에서 사용, 여기선 미사용
}

interface HotColdTabProps {
  data: HotColdTabData;
  dataSource?: "db" | "loading";
}

export default function HotColdTab({ data, dataSource }: HotColdTabProps) {
  const badge = dataSource === "db" && (
    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full border bg-green-50 text-green-600 border-green-200">
      DB 데이터
    </span>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* HOT & COLD ZONE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-6 rounded-full bg-red-500 inline-block" />
          <h3 className="font-bold text-gray-800">HOT &amp; COLD ZONE</h3>
          {badge}
        </div>
        <ZoneHeatmap
          zone={{ outer: data.outer, inner: data.inner }}
          footnote="타자 시점 기준 (타율)"
        />
      </div>

      {/* 삼진 분포도 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-6 rounded-full bg-yellow-400 inline-block" />
          <h3 className="font-bold text-gray-800">삼진 분포도</h3>
          {badge}
        </div>
        <ZoneHeatmap
          zone={data.strikeout}
          footnote="타자 시점 기준 (삼진비율)"
        />
      </div>
    </div>
  );
}
