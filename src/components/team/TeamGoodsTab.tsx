// 팀 굿즈·마스코트 탭 - 마스코트, 엠블럼 변천사, 유니폼, 공식 굿즈를 섹션별로 표시
interface TeamGoodsTabProps {
  team: {
    bg: string;
    accent: string;
    emoji: string;
  };
  data: {
    mascots: { name: string; period: string; emoji: string }[];
    logoHistory: { era: string; period: string; color: string }[];
    uniforms: string[];
  };
}

export default function TeamGoodsTab({ team, data }: TeamGoodsTabProps) {
  return (
    <div className="space-y-6">
      {/* 마스코트 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-6 rounded-full" style={{ backgroundColor: team.bg }} />
          <h3 className="font-bold text-gray-800">마스코트</h3>
        </div>
        <div className="flex flex-wrap gap-4">
          {data.mascots.map((m, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow"
              style={{ background: `${team.bg}08` }}
            >
              <span className="text-5xl">{m.emoji}</span>
              <p className="font-bold text-gray-800 text-sm">{m.name}</p>
              <p className="text-xs text-gray-400">{m.period}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 엠블럼 변천사 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-6 rounded-full" style={{ backgroundColor: team.bg }} />
          <h3 className="font-bold text-gray-800">엠블럼 변천사</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {data.logoHistory.map((l, i) => (
            <div key={i} className="flex-1 min-w-32 rounded-xl overflow-hidden border border-gray-100">
              <div
                className="h-20 flex items-center justify-center text-4xl"
                style={{ backgroundColor: l.color + "20" }}
              >
                {team.emoji}
              </div>
              <div className="p-3 text-center">
                <p className="text-xs font-bold text-gray-700">{l.era}</p>
                <p className="text-xs text-gray-400 mt-0.5">{l.period}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 유니폼 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-6 rounded-full" style={{ backgroundColor: team.bg }} />
          <h3 className="font-bold text-gray-800">2025 유니폼</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {data.uniforms.map((u, i) => {
            const colors = ["#f8fafc", "#e2e8f0", team.bg, "#111827"];
            return (
              <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div
                  className="h-28 flex items-center justify-center text-5xl"
                  style={{ backgroundColor: colors[i] + (i < 2 ? "" : "22"), border: `2px solid ${team.bg}20` }}
                >
                  👕
                </div>
                <div className="p-3 text-center">
                  <p className="text-xs font-bold text-gray-700">{u}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 공식 굿즈 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-6 rounded-full" style={{ backgroundColor: team.bg }} />
          <h3 className="font-bold text-gray-800">공식 굿즈</h3>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {["🧢 모자", "👕 티셔츠", "📱 폰케이스", "🧣 머플러", "🎒 가방", "📓 다이어리"].map((g, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-100 p-3 text-center hover:shadow-sm transition-shadow cursor-pointer hover:bg-gray-50"
            >
              <p className="text-2xl">{g.split(" ")[0]}</p>
              <p className="text-xs text-gray-600 mt-1 font-medium">{g.split(" ")[1]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}