// 투수 투구존 탭 — 투구 분포도 + 탈삼진 분포도
import ZoneHeatmap from "@/components/common/ZoneHeatmap";
import type { ZoneGrid } from "@/components/common/ZoneHeatmap";

interface PitchZoneTabProps {
  pitchZone: ZoneGrid;
  strikeoutZone: ZoneGrid;
  baZone?: ZoneGrid; // 구역별 피안타율 (optional, 추후 연동)
  loading?: boolean;
  dataSource?: "db" | "loading";
}

function ZoneSkeleton() {
  return (
    <div className="flex justify-center py-6">
      <div className="w-full max-w-sm h-56 bg-gray-100 rounded-lg animate-pulse" />
    </div>
  );
}

export default function PitchZoneTab({
  pitchZone,
  strikeoutZone,
  baZone,
  loading = false,
  dataSource,
}: PitchZoneTabProps) {
  const badge = dataSource === "db" && (
    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full border bg-green-50 text-green-600 border-green-200">
      DB 데이터
    </span>
  );

  const cols = baZone
    ? "grid-cols-1 lg:grid-cols-3"
    : "grid-cols-1 lg:grid-cols-2";

  return (
    <div className={`grid ${cols} gap-6`}>
      {/* 투구 분포도 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 rounded-full bg-blue-500" />
          <h3 className="font-bold text-gray-800">투구 분포도</h3>
          {badge}
        </div>
        {loading ? (
          <ZoneSkeleton />
        ) : (
          <ZoneHeatmap zone={pitchZone} footnote="투수 시점 기준" />
        )}
      </div>

      {/* 구역별 피안타율 (있을 때만) */}
      {baZone && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 rounded-full bg-emerald-500" />
            <h3 className="font-bold text-gray-800">구역별 피안타율</h3>
            {badge}
          </div>
          {loading ? (
            <ZoneSkeleton />
          ) : (
            <ZoneHeatmap zone={baZone} footnote="투수 시점 기준" />
          )}
        </div>
      )}

      {/* 탈삼진 분포도 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 rounded-full bg-orange-500" />
          <h3 className="font-bold text-gray-800">탈삼진 분포도</h3>
          {badge}
        </div>
        {loading ? (
          <ZoneSkeleton />
        ) : (
          <ZoneHeatmap zone={strikeoutZone} footnote="투수 시점 기준" />
        )}
      </div>
    </div>
  );
}
