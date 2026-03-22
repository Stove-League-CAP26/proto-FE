// BEST 플레이어 페이지에서 WAR 전체 순위를 리스트로 보여주는 컴포넌트
// 1~4위를 메달 이모지와 함께 표시하고 더보기 버튼 포함
import PlayerAvatar from "@/components/common/PlayerAvatar";
import { TEAM_COLORS } from "@/constants/teamColors";

interface RankPlayer {
  id: number;
  name: string;
  team: string;
  val: string;
  rank: number;
}

interface WARRankListProps {
  players: RankPlayer[];
}

export default function WARRankList({ players }: WARRankListProps) {
  const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/60">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          WAR 전체 순위
        </p>
      </div>
      <div className="flex-1">
        {players.map((p) => {
          const tc = TEAM_COLORS[p.team] || { bg: "#64748b", accent: "#94a3b8" };
          return (
            <div
              key={p.rank}
              className={`flex items-center gap-3 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${p.rank === 1 ? "bg-yellow-50/40" : ""}`}
            >
              <span className="text-xl w-7 text-center flex-shrink-0">
                {medals[p.rank] || (
                  <span className="text-sm font-bold text-gray-400">{p.rank}</span>
                )}
              </span>
              <div
                className="w-11 h-11 rounded-full overflow-hidden border-2 flex-shrink-0"
                style={{ borderColor: tc.accent }}
              >
                <PlayerAvatar id={p.id} name={p.name} size={44} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold truncate ${p.rank === 1 ? "text-gray-900 text-base" : "text-gray-700 text-sm"}`}>
                  {p.name}
                </p>
                <p className="text-xs text-gray-400">{p.team}</p>
              </div>
              <span className={`font-black ${p.rank === 1 ? "text-amber-500 text-lg" : "text-gray-600 text-sm"}`}>
                {p.val}
              </span>
            </div>
          );
        })}
      </div>
      <button className="w-full py-3 text-xs font-semibold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-100">
        더보기 →
      </button>
    </div>
  );
}