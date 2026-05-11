// 타자 HOT & COLD ZONE
// battingSide: "좌타" → hitter_left.png 배경, 범례 오른쪽
//              "우타" / 기타 → hitter_right.png 배경, 범례 왼쪽
import ZoneHeatmap from "@/components/common/ZoneHeatmap";
import type { ZoneGrid } from "@/components/common/ZoneHeatmap";
import hitterLeft from "@/assets/hitter_left.png";
import hitterRight from "@/assets/hitter_right.png";

interface HotColdZoneProps {
  zone: ZoneGrid;
  dataSource?: "db" | "loading";
  battingSide?: string;
}

export default function HotColdZone({
  zone,
  dataSource,
  battingSide,
}: HotColdZoneProps) {
  const isLeft = battingSide === "좌타";
  const hitterImg = isLeft ? hitterLeft : hitterRight;

  const badge = dataSource === "db" && (
    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full border bg-green-50 text-green-600 border-green-200">
      DB 데이터
    </span>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-6 rounded-full bg-red-500 inline-block" />
        <h3 className="font-bold text-gray-800">HOT &amp; COLD ZONE</h3>
        {battingSide && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
            {battingSide}
          </span>
        )}
        {badge}
      </div>

      {/* 배경 이미지 + 오버레이 컨테이너 */}
      <div className="relative" style={{ minHeight: 340 }}>
        {/* ① 타자 이미지 — 배경 전체에 반투명으로 깔림 */}
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

        {/* ③ HOT & COLD ZONE 히트맵 — 중앙 오버레이 */}
        <div className="relative z-10 flex justify-center items-center py-4">
          <ZoneHeatmap
            zone={zone}
            footnote="해당 차트는 투수시점으로 구현되었습니다."
            colorMode="hotcold"
          />
        </div>
      </div>
    </div>
  );
}
