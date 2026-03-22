// BEST 플레이어 페이지에서 부문별(타율/홈런/타점 등) 순위를 카드 형태로 보여주는 컴포넌트
// 1위는 크게 강조, 2~4위는 리스트로 표시
import PlayerAvatar from "@/components/common/PlayerAvatar";

interface RankPlayer {
  id: number;
  name: string;
  team: string;
  val: string;
  rank: number;
}

interface CategoryCardProps {
  label: string;
  icon: string;
  players: RankPlayer[];
  accentColor: string;
}

export default function CategoryCard({ label, icon, players, accentColor }: CategoryCardProps) {
  const medals: Record<number, string> = { 2: "🥈", 3: "🥉" };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div
        className="px-4 py-3 flex items-center gap-2 border-b-2"
        style={{ borderColor: accentColor }}
      >
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-black text-gray-800">{label}</span>
      </div>
      <div
        className="px-4 py-4 flex items-center gap-3 border-b border-gray-100"
        style={{ background: `${accentColor}10` }}
      >
        <span className="text-2xl flex-shrink-0">🥇</span>
        <div
          className="w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0"
          style={{ borderColor: accentColor }}
        >
          <PlayerAvatar id={players[0].id} name={players[0].name} size={56} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-gray-900 truncate text-base">{players[0].name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{players[0].team}</p>
          <p className="text-sm font-black mt-1" style={{ color: accentColor }}>
            {players[0].val}
          </p>
        </div>
      </div>
      <div className="flex-1">
        {players.slice(1).map((p) => (
          <div
            key={p.rank}
            className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/70 transition-colors cursor-pointer"
          >
            <span className="text-sm w-5 text-center flex-shrink-0">
              {medals[p.rank] || (
                <span className="text-xs font-bold text-gray-400">{p.rank}</span>
              )}
            </span>
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
              <PlayerAvatar id={p.id} name={p.name} size={36} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700 truncate">{p.name}</p>
              <p className="text-xs text-gray-400">{p.team}</p>
            </div>
            <span className="text-xs font-bold text-gray-500 flex-shrink-0">{p.val}</span>
          </div>
        ))}
      </div>
      <button className="w-full py-2.5 text-xs font-semibold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-100">
        더보기 →
      </button>
    </div>
  );
}