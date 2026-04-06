// 타자 삼진 분포도 — 삼진 많음=파랑, 적음=빨강 (반전)
// 타자 입장에서 삼진을 많이 당하는 구역이므로 파랑(위험)으로 표현
import ZoneHeatmap from "@/components/common/ZoneHeatmap";
import type { ZoneGrid } from "@/components/common/ZoneHeatmap";
import hitterLeft from "@/assets/hitter_left.png";
import hitterRight from "@/assets/hitter_right.png";

interface HitterStrikeoutZoneProps {
  zone: ZoneGrid;
  dataSource?: "db" | "loading";
  battingSide?: string;
}

export default function HitterStrikeoutZone({
  zone,
  dataSource,
  battingSide,
}: HitterStrikeoutZoneProps) {
  const isLeft = battingSide === "좌타";
  const hitterImg = isLeft ? hitterLeft : hitterRight;

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

      {/* 배경 이미지 + 오버레이 컨테이너 */}
      <div className="relative" style={{ minHeight: 340 }}>
        {/* ① 타자 이미지  */}
        <img
          src={hitterImg}
          alt={isLeft ? "좌타 타자" : "우타 타자"}
          className="absolute pointer-events-none select-none"
          style={{
            width: "75%",
            bottom: "30%",
            [isLeft ? "left" : "right"]: "0",
          }}
        />

        {/* ③ 삼진분포도 — 중앙 오버레이 */}
        <div className="relative z-10 flex justify-center items-center py-4">
          <ZoneHeatmap
            zone={zone}
            footnote="타자 시점 기준 (삼진비율)"
            colorMode="inverted"
          />
        </div>
      </div>
    </div>
  );
}
