// 구종 구성 (Pitch Usage) 컴포넌트
// ⚠️ 현재 SAMPLE DATA — 실데이터 연동 전까지 Mock 사용

const MOCK_PITCH_ARSENAL = [
  {
    name: "포심 패스트볼",
    abbr: "FF",
    pct: 38,
    avgVelo: 153.2,
    whiff: 28,
    color: "#EF4444",
  },
  {
    name: "슬라이더",
    abbr: "SL",
    pct: 28,
    avgVelo: 141.5,
    whiff: 42,
    color: "#3B82F6",
  },
  {
    name: "포크볼",
    abbr: "FS",
    pct: 18,
    avgVelo: 143.8,
    whiff: 51,
    color: "#F59E0B",
  },
  {
    name: "커브볼",
    abbr: "CU",
    pct: 10,
    avgVelo: 129.4,
    whiff: 35,
    color: "#10B981",
  },
  {
    name: "체인지업",
    abbr: "CH",
    pct: 6,
    avgVelo: 139.7,
    whiff: 38,
    color: "#8B5CF6",
  },
];

export default function PitchArsenalCard() {
  const top = MOCK_PITCH_ARSENAL[0];
  const maxSpd = [...MOCK_PITCH_ARSENAL].sort(
    (a, b) => b.avgVelo - a.avgVelo,
  )[0];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-5 rounded-full bg-red-500" />
        <h3 className="font-bold text-gray-800 text-sm">
          구종 구성 (Pitch Usage)
        </h3>
        <span className="ml-auto text-[10px] text-amber-500 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
          SAMPLE DATA
        </span>
      </div>

      {/* 구종 바 차트 */}
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
                <span className="text-xs font-bold text-gray-700">
                  {p.name}
                </span>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="font-bold text-gray-600">
                    {p.avgVelo}km/h
                  </span>
                  <span>Whiff {p.whiff}%</span>
                </div>
              </div>
              <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full flex items-center justify-end pr-2"
                  style={{
                    width: `${p.pct}%`,
                    backgroundColor: p.color + "dd",
                  }}
                >
                  <span className="text-white text-xs font-black">
                    {p.pct}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-2 mt-5">
        <div className="rounded-xl p-3 bg-gray-50 border border-gray-100 text-center">
          <p className="text-xs text-gray-400">주구종</p>
          <p className="text-sm font-black mt-0.5" style={{ color: top.color }}>
            {top.name}
          </p>
        </div>
        <div className="rounded-xl p-3 bg-gray-50 border border-gray-100 text-center">
          <p className="text-xs text-gray-400">최고 구속</p>
          <p className="text-sm font-black mt-0.5 text-blue-600">
            {maxSpd.avgVelo}km/h
          </p>
        </div>
      </div>
    </div>
  );
}
