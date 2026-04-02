// 투수 구종 구성(Pitch Usage)을 수평 바 차트로 표시하는 컴포넌트
import { MOCK_PITCH_ARSENAL } from "@/mock/statsData";

export default function PitchArsenalChart() {
  return (
    <div className="space-y-3">
      {MOCK_PITCH_ARSENAL.map((p) => (
        <div key={p.abbr} className="flex items-center gap-3">
          <div
            className="w-8 h-6 rounded-md flex items-center justify-center text-white text-xs font-black flex-shrink-0"
            style={{ backgroundColor: p.color }}
          >
            {p.abbr}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-gray-700">{p.name}</span>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="font-bold text-gray-600">{p.avgVelo}km/h</span>
                <span>Whiff {p.whiff}%</span>
              </div>
            </div>
            <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full flex items-center justify-end pr-2"
                style={{ width: `${p.pct}%`, backgroundColor: p.color + "dd" }}
              >
                <span className="text-white text-xs font-black">{p.pct}%</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
