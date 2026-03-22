// 선수 비교의 존 분석 섹션 - 타자vs타자면 핫콜드존 나란히, 투수vs투수면 투구분포 나란히,
// 타자vs투수면 오버레이 매치업 분석을 표시
import MiniZoneGrid from "@/components/compare/MiniZoneGrid";
import OverlayZoneGrid from "@/components/compare/OverlayZoneGrid";
import { stepColors } from "@/constants/stepColors";

interface ZoneCell { val: string; step: number }
interface PlayerData {
  name: string;
  type: "hitter" | "pitcher";
  hotCold?: { outer: ZoneCell[]; inner: ZoneCell[] };
  pitchZone?: { outer: ZoneCell[]; inner: ZoneCell[] };
}

interface ZoneCompareSectionProps {
  pA: PlayerData;
  pB: PlayerData;
}

export default function ZoneCompareSection({ pA, pB }: ZoneCompareSectionProps) {
  const isPvP = pA.type === "pitcher" && pB.type === "pitcher";
  const isHvH = pA.type === "hitter" && pB.type === "hitter";
  const getZone = (p: PlayerData) => p.type === "pitcher" ? p.pitchZone! : p.hotCold!;
  const label = (p: PlayerData) => p.type === "pitcher" ? "투구 분포도" : "HOT & COLD ZONE";

  // 타자 vs 투수 오버레이
  if (!isPvP && !isHvH) {
    const pitcher = pA.type === "pitcher" ? pA : pB;
    const hitter = pA.type === "hitter" ? pA : pB;
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-black text-gray-800">존 매치업 분석</h3>
          <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-100">
            투타 오버레이
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          그리드에 마우스를 올리면 타자 핫존 × 투수 투구분포가 겹쳐져 공략 포인트를 예측합니다
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <p className="text-xs font-black text-gray-700">{hitter.name} 핫/콜드존</p>
            </div>
            <MiniZoneGrid outer={hitter.hotCold!.outer} inner={hitter.hotCold!.inner} />
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="w-5 h-3 rounded-sm" style={{ backgroundColor: stepColors[s].bg }} />
              ))}
            </div>
            <p className="text-xs text-gray-400">냉 ← 타율 → 열</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <p className="text-xs font-black text-gray-700">오버레이 (호버 활성화)</p>
            </div>
            <OverlayZoneGrid
              hotCold={hitter.hotCold!}
              pitchZone={pitcher.pitchZone!}
              hitterName={hitter.name}
              pitcherName={pitcher.name}
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <p className="text-xs font-black text-gray-700">{pitcher.name} 투구 분포도</p>
            </div>
            <MiniZoneGrid outer={pitcher.pitchZone!.outer} inner={pitcher.pitchZone!.inner} />
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="w-5 h-3 rounded-sm" style={{ backgroundColor: stepColors[s].bg }} />
              ))}
            </div>
            <p className="text-xs text-gray-400">저빈도 ← 투구 → 고빈도</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: "🎯", label: "공략 포인트", desc: "타자 약점 + 투구 집중", color: "#22c55e", bg: "#f0fdf4" },
            { icon: "⚠️", label: "위험 구역",   desc: "타자 강점 + 투구 집중", color: "#ef4444", bg: "#fef2f2" },
            { icon: "🚫", label: "회피 구역",   desc: "타자 강점 + 투구 희박", color: "#f97316", bg: "#fff7ed" },
            { icon: "○",  label: "중립 구역",   desc: "양쪽 모두 낮은 비중",   color: "#94a3b8", bg: "#f8fafc" },
          ].map(({ icon, label, desc, color, bg }) => (
            <div key={label} className="rounded-xl p-3 border" style={{ backgroundColor: bg, borderColor: color + "40" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <span>{icon}</span>
                <span className="text-xs font-black" style={{ color }}>{label}</span>
              </div>
              <p className="text-xs text-gray-500 leading-tight">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 타자vs타자 or 투수vs투수
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
        {isHvH ? "핫/콜드 존 비교" : "투구 분포도 비교"}
      </h3>
      <div className="grid grid-cols-2 gap-6">
        {[pA, pB].map((p, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <p className={`text-xs font-bold ${i === 0 ? "text-blue-600" : "text-red-500"}`}>{p.name}</p>
            <MiniZoneGrid outer={getZone(p).outer} inner={getZone(p).inner} />
            <p className="text-xs text-gray-400">{label(p)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}