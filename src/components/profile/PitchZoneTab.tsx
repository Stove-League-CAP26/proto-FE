// 투수 투구존 탭
// - 투구 분포도 + 탈삼진 분포도를 2칼럼으로 표시
// - pitchZone / strikeoutZone은 PlayerProfilePage에서 DB 데이터 또는 MOCK fallback으로 전달됨
import { stepColors } from "@/constants/stepColors";

interface ZoneCell {
  val: string;
  step: number;
}

interface ZoneGrid {
  outer: ZoneCell[]; // 4칸 [TL, TR, BL, BR]
  inner: ZoneCell[]; // 9칸 3×3
}

interface PitchZoneTabProps {
  pitchZone: ZoneGrid;
  strikeoutZone: ZoneGrid;
  loading?: boolean;
  dataSource?: "db" | "mock" | "loading";
}

function ZoneGrid({ zone }: { zone: ZoneGrid }) {
  return (
    <div className="relative mx-auto" style={{ width: 180, height: 180 }}>
      {/* Outer 코너 4칸 */}
      {[
        { d: zone.outer[0], style: { top: 0, left: 0, width: 50, height: 50 } },
        {
          d: zone.outer[1],
          style: { top: 0, right: 0, width: 50, height: 50 },
        },
        {
          d: zone.outer[2],
          style: { bottom: 0, left: 0, width: 50, height: 50 },
        },
        {
          d: zone.outer[3],
          style: { bottom: 0, right: 0, width: 50, height: 50 },
        },
      ].map(({ d, style }, i) => (
        <div
          key={i}
          className="absolute flex items-center justify-center rounded text-xs font-bold"
          style={{
            ...style,
            backgroundColor: stepColors[d?.step ?? 3]?.bg,
            color: stepColors[d?.step ?? 3]?.text,
          }}
        >
          {d?.val ?? "-"}
        </div>
      ))}

      {/* Inner 3×3 */}
      <div
        className="absolute grid grid-cols-3 gap-0.5"
        style={{ top: 55, left: 55, width: 70, height: 70 }}
      >
        {zone.inner.map((c, i) => (
          <div
            key={i}
            className="flex items-center justify-center rounded font-semibold"
            style={{
              backgroundColor: stepColors[c?.step ?? 3]?.bg,
              color: stepColors[c?.step ?? 3]?.text,
              fontSize: 8,
            }}
          >
            {c?.val ?? "-"}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScaleLegend({ labels }: { labels: string[] }) {
  return (
    <div className="flex items-center gap-1 mt-4 justify-center">
      {[1, 2, 3, 4, 5].map((s, i) => (
        <div key={s} className="flex flex-col items-center gap-1">
          <div
            className="w-8 h-4 rounded"
            style={{ backgroundColor: stepColors[s].bg }}
          />
          <span className="text-xs text-gray-400">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function PitchZoneTab({
  pitchZone,
  strikeoutZone,
  loading = false,
  dataSource,
}: PitchZoneTabProps) {
  const sourceBadge =
    dataSource === "db"
      ? {
          label: "DB 데이터",
          cls: "bg-green-50 text-green-600 border-green-200",
        }
      : dataSource === "mock"
        ? {
            label: "샘플 데이터",
            cls: "bg-gray-50 text-gray-400 border-gray-200",
          }
        : null;

  const skeleton = (
    <div className="flex justify-center py-8">
      <div className="w-44 h-44 bg-gray-100 rounded-xl animate-pulse" />
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── 투구 분포도 ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 rounded-full bg-blue-500" />
          <h3 className="font-bold text-gray-800">투구 분포도 (존별)</h3>
          {sourceBadge && (
            <span
              className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full border ${sourceBadge.cls}`}
            >
              {sourceBadge.label}
            </span>
          )}
        </div>

        {loading ? (
          skeleton
        ) : (
          <div className="flex justify-center">
            <ZoneGrid zone={pitchZone} />
          </div>
        )}

        <ScaleLegend labels={["저빈도", "", "", "", "고빈도"]} />
        <p className="text-xs text-gray-400 text-center mt-2">투수 시점 기준</p>
      </div>

      {/* ── 탈삼진 분포도 ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 rounded-full bg-orange-500" />
          <h3 className="font-bold text-gray-800">탈삼진 분포도</h3>
          {sourceBadge && (
            <span
              className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full border ${sourceBadge.cls}`}
            >
              {sourceBadge.label}
            </span>
          )}
        </div>

        {loading ? (
          skeleton
        ) : (
          <div className="flex justify-center">
            <ZoneGrid zone={strikeoutZone} />
          </div>
        )}

        <ScaleLegend labels={["저빈도", "", "", "", "고빈도"]} />
        <p className="text-xs text-gray-400 text-center mt-2">투수 시점 기준</p>
      </div>
    </div>
  );
}
