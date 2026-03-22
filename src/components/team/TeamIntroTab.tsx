// 팀 상세 페이지의 팀 소개 탭 - 팀 기본정보, 시즌 성적, 구단 히스토리, 팀 능력치 레이더를 표시
import HexRadar from "@/components/team/HexRadar";

interface TeamIntroTabProps {
  team: {
    id: string;
    name: string;
    city: string;
    emoji: string;
    stadium: string;
    bg: string;
    accent: string;
  };
  data: {
    founded: string;
    championship: string;
    manager: string;
    ranking2025: string;
    wins: number;
    losses: number;
    draws: number;
    radar: Record<string, number>;
    history: { year: string; event: string }[];
  };
}

export default function TeamIntroTab({ team, data }: TeamIntroTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        {/* 팀 기본 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center gap-4">
          <div
            className="w-28 h-28 rounded-2xl flex items-center justify-center text-7xl shadow-inner"
            style={{ background: `linear-gradient(135deg, ${team.bg}22, ${team.accent}22)` }}
          >
            {team.emoji}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black text-gray-900">{team.name}</h2>
            <p className="text-gray-400 text-sm mt-1">{team.city} · {team.stadium}</p>
          </div>
          <div className="w-full grid grid-cols-3 gap-2 mt-2">
            {[
              { label: "창단", val: data.founded },
              { label: "우승", val: data.championship },
              { label: "감독", val: data.manager },
            ].map(({ label, val }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-xs font-bold text-gray-800 mt-0.5 leading-tight">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 2025 시즌 성적 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            2025 시즌
          </h3>
          <div className="flex items-center justify-center gap-6">
            {[
              { label: "승", val: data.wins, color: "text-blue-600" },
              { label: "패", val: data.losses, color: "text-red-500" },
              { label: "무", val: data.draws, color: "text-gray-400" },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center">
                <p className={`text-3xl font-black ${color}`}>{val}</p>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 text-center">
            <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full border border-yellow-200">
              🏆 {data.ranking2025}
            </span>
          </div>
        </div>

        {/* 구단 히스토리 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            구단 히스토리
          </h3>
          <div className="relative">
            <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gray-100" />
            {data.history.map((h, i) => (
              <div key={i} className="flex gap-3 mb-3 relative">
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 z-10 mt-0.5 border-2"
                  style={{ backgroundColor: team.bg, borderColor: team.accent }}
                />
                <div>
                  <p className="text-xs font-black text-gray-500">{h.year}</p>
                  <p className="text-sm text-gray-700">{h.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 팀 능력치 레이더 */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            팀 능력치
          </h3>
          <div className="w-full aspect-square max-w-sm mx-auto">
            <HexRadar data={data.radar} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {Object.entries(data.radar).map(([k, v]) => (
              <div
                key={k}
                className="rounded-xl p-2.5 text-center"
                style={{ background: `${team.bg}15` }}
              >
                <p className="text-xs text-gray-500 font-medium">{k}</p>
                <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${v}%`, backgroundColor: team.bg }} />
                </div>
                <p className="text-xs font-bold mt-1" style={{ color: team.bg }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}