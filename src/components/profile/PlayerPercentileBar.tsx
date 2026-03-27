// KBO 퍼센타일 랭킹 섹션 - 원형 게이지 가로 스크롤 표시
import PercentileRing from "@/components/common/PercentileRing";

interface PercentileItem {
  label: string;
  pct: number;
  val: string;
  inverse: boolean;
}

interface PlayerPercentileBarProps {
  percentiles: PercentileItem[];
  isPitcherPlayer: boolean;
}

export default function PlayerPercentileBar({
  percentiles,
  isPitcherPlayer,
}: PlayerPercentileBarProps) {
  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-5">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">
            KBO 퍼센타일 랭킹 · {isPitcherPlayer ? "투수" : "타자"}
          </h2>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {([ ["90+","#EF4444"], ["70-89","#F97316"], ["40-69","#3B82F6"], ["-39","#6B7280"] ] as [string,string][]).map(([l,c]) => (
              <div key={l} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {percentiles.map((p) => (
            <PercentileRing key={p.label} label={p.label} pct={p.pct} val={p.val} inverse={p.inverse} />
          ))}
        </div>
      </div>
    </div>
  );
}
