// 선수 비교 존 패널 — 두 선수 존 나란히 표시
// ZoneHeatmap을 CSS scale로 축소 표시
import ZoneHeatmap from "@/components/common/ZoneHeatmap";
import type { ZoneGrid } from "@/components/common/ZoneHeatmap";

interface CompareZonePanelProps {
  mode: "HvH" | "PvP";
  zoneA: ZoneGrid | null;
  zoneB: ZoneGrid | null;
  playerNameA: string;
  playerNameB: string;
  loadingA?: boolean;
  loadingB?: boolean;
}

const SCALE = 0.78;
const ZONE_SIZE = Math.round(280 * SCALE); // ≈ 218px

function ScaledZone({
  zone,
  colorMode,
  loading,
}: {
  zone: ZoneGrid | null;
  colorMode: "hotcold" | "single";
  loading: boolean;
}) {
  if (loading) {
    return (
      <div
        className="flex items-center justify-center rounded-xl"
        style={{ width: ZONE_SIZE, height: ZONE_SIZE + 40 }}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-400 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-400">불러오는 중</p>
        </div>
      </div>
    );
  }
  if (!zone) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl bg-gray-50 border border-dashed border-gray-200"
        style={{ width: ZONE_SIZE, height: ZONE_SIZE + 40 }}
      >
        <p className="text-gray-300 text-xs">데이터 없음</p>
      </div>
    );
  }
  return (
    <div
      style={{
        width: ZONE_SIZE,
        height: ZONE_SIZE + 40,
        overflow: "visible",
        position: "relative",
      }}
    >
      <div
        style={{
          transform: `scale(${SCALE})`,
          transformOrigin: "top left",
          width: 280,
          height: 280,
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <ZoneHeatmap zone={zone} colorMode={colorMode} />
      </div>
    </div>
  );
}

export default function CompareZonePanel({
  mode,
  zoneA,
  zoneB,
  playerNameA,
  playerNameB,
  loadingA = false,
  loadingB = false,
}: CompareZonePanelProps) {
  const isHitter = mode === "HvH";
  const colorMode = isHitter ? "hotcold" : "single";
  const zoneTitle = isHitter ? "핫/콜드존 비교" : "투구 분포도 비교";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
        <span
          className="w-1.5 h-6 rounded-full inline-block"
          style={{ background: isHitter ? "#EF4444" : "#3B82F6" }}
        />
        <h3 className="font-bold text-gray-800">{zoneTitle}</h3>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full border ml-auto"
          style={
            isHitter
              ? {
                  background: "#fef2f2",
                  color: "#ef4444",
                  borderColor: "#fecaca",
                }
              : {
                  background: "#eff6ff",
                  color: "#3b82f6",
                  borderColor: "#bfdbfe",
                }
          }
        >
          {isHitter ? "타자 vs 타자" : "투수 vs 투수"}
        </span>
      </div>

      <div className="p-6">
        <div className="flex justify-center items-start gap-8">
          {/* 선수 A */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="px-4 py-1.5 rounded-full text-xs font-black text-white"
              style={{ background: "#3B82F6" }}
            >
              {playerNameA || "선수 A"}
            </div>
            <ScaledZone zone={zoneA} colorMode={colorMode} loading={loadingA} />
          </div>

          {/* 구분 */}
          <div className="flex flex-col items-center justify-center pt-10 gap-2 flex-shrink-0">
            <div className="w-px h-32 bg-gradient-to-b from-transparent via-gray-200 to-transparent" />
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xs
                           font-black text-white shadow-lg flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#3B82F6,#EF4444)" }}
            >
              VS
            </div>
            <div className="w-px h-32 bg-gradient-to-b from-transparent via-gray-200 to-transparent" />
          </div>

          {/* 선수 B */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="px-4 py-1.5 rounded-full text-xs font-black text-white"
              style={{ background: "#EF4444" }}
            >
              {playerNameB || "선수 B"}
            </div>
            <ScaledZone zone={zoneB} colorMode={colorMode} loading={loadingB} />
          </div>
        </div>

        <p className="text-center text-xs text-gray-300 mt-3">
          {isHitter
            ? "투수 시점 기준 · 색상은 선수별 상대값 기준"
            : "투수 시점 기준 · 색상은 선수별 상대값 기준"}
        </p>
      </div>
    </div>
  );
}
