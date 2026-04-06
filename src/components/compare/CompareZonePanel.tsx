// 선수 비교 존 패널 — 핫/콜드존(타자) 또는 투구분포(투수) 나란히 표시
// ZoneHeatmap 컴포넌트를 그대로 사용, CSS scale로 크기 조절
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

// ZoneHeatmap은 280×280px 고정이므로 CSS scale로 축소
const SCALE = 0.72;
const ZONE_SIZE = 280 * SCALE; // ≈ 202px

function ScaledZone({
  zone,
  colorMode,
  loading,
  label,
}: {
  zone: ZoneGrid | null;
  colorMode: "hotcold" | "single";
  loading: boolean;
  label: string;
}) {
  if (loading) {
    return (
      <div
        className="flex items-center justify-center rounded-xl"
        style={{ width: ZONE_SIZE + 40, height: ZONE_SIZE + 60 }}
      >
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 border-gray-200 border-t-blue-400 rounded-full
                          animate-spin mx-auto mb-2"
          />
          <p className="text-xs text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!zone) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl bg-gray-50 border
                   border-gray-100"
        style={{ width: ZONE_SIZE + 40, height: ZONE_SIZE + 60 }}
      >
        <p className="text-2xl mb-1">📭</p>
        <p className="text-xs text-gray-400">데이터 없음</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-xs font-bold text-gray-500 mb-1">{label}</p>
      {/* 고정 크기 컨테이너 + CSS scale */}
      <div
        style={{
          width: ZONE_SIZE,
          height: ZONE_SIZE,
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
  const zoneTitle = isHitter ? "핫/콜드존" : "투구 분포도";
  const footnote = isHitter
    ? "타자 시점 기준 (타율)"
    : "투수 시점 기준 (투구 빈도)";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
        <span
          className="w-1.5 h-6 rounded-full inline-block"
          style={{ background: isHitter ? "#EF4444" : "#3B82F6" }}
        />
        <h3 className="font-bold text-gray-800">{zoneTitle} 비교</h3>
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
          {isHitter ? "🏏 타자 vs 타자" : "⚾ 투수 vs 투수"}
        </span>
      </div>

      {/* 존 나란히 표시 */}
      <div className="p-6">
        {/* 배경 그래픽 — 반투명 야구장 느낌 */}
        <div className="relative flex justify-center items-start gap-6 lg:gap-12">
          {/* 중앙 배경 — 스트라이크존 실루엣 */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5"
            style={{ zIndex: 0 }}
          >
            <svg viewBox="0 0 300 300" className="w-64 h-64">
              {/* 타자 실루엣 (단순화) */}
              <ellipse cx="150" cy="270" rx="80" ry="15" fill="#374151" />
              <rect
                x="120"
                y="200"
                width="60"
                height="70"
                rx="8"
                fill="#374151"
              />
              <circle cx="150" cy="175" r="30" fill="#374151" />
              {/* 스트라이크존 */}
              <rect
                x="110"
                y="100"
                width="80"
                height="90"
                rx="4"
                fill="none"
                stroke="#374151"
                strokeWidth="4"
                strokeDasharray="8,4"
              />
            </svg>
          </div>

          {/* 선수 A 존 */}
          <div className="flex flex-col items-center gap-3 relative z-10">
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black text-white"
              style={{ background: "#3B82F6" }}
            >
              <span>▶</span>
              <span>{playerNameA || "선수 A"}</span>
            </div>
            <ScaledZone
              zone={zoneA}
              colorMode={colorMode}
              loading={loadingA}
              label={zoneTitle}
            />
          </div>

          {/* 중앙 VS 구분선 */}
          <div className="flex flex-col items-center gap-2 pt-10 relative z-10">
            <div className="w-px h-40 bg-gradient-to-b from-transparent via-gray-200 to-transparent" />
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xs
                         font-black text-white shadow-lg"
              style={{
                background: "linear-gradient(135deg, #3B82F6, #EF4444)",
              }}
            >
              VS
            </div>
            <div className="w-px h-40 bg-gradient-to-b from-transparent via-gray-200 to-transparent" />
          </div>

          {/* 선수 B 존 */}
          <div className="flex flex-col items-center gap-3 relative z-10">
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black text-white"
              style={{ background: "#EF4444" }}
            >
              <span>{playerNameB || "선수 B"}</span>
              <span>◀</span>
            </div>
            <ScaledZone
              zone={zoneB}
              colorMode={colorMode}
              loading={loadingB}
              label={zoneTitle}
            />
          </div>
        </div>

        {/* 범례 */}
        <div className="mt-4 flex items-center justify-center gap-6">
          {isHitter ? (
            <>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {["#5B9BD5", "#92C0E8", "#E8E8E8", "#E07878", "#CC4444"].map(
                    (c, i) => (
                      <div
                        key={i}
                        className="w-5 h-3 rounded-sm"
                        style={{ background: c }}
                      />
                    ),
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  낮음 ← 타율 → 높음
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {["#d3eed3", "#a3d6a3", "#6abd6a", "#359435", "#145214"].map(
                    (c, i) => (
                      <div
                        key={i}
                        className="w-5 h-3 rounded-sm"
                        style={{ background: c }}
                      />
                    ),
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  저빈도 ← 투구 → 고빈도
                </span>
              </div>
            </>
          )}
        </div>
        <p className="text-center text-xs text-gray-300 mt-2">{footnote}</p>
      </div>
    </div>
  );
}
