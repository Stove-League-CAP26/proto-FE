// BEST 플레이어 페이지에서 WAR 1위 선수를 크게 강조해서 보여주는 히어로 카드
// 팀 컬러 그라디언트 배경에 선수 사진과 WAR 수치를 표시
import PlayerAvatar from "@/components/common/PlayerAvatar";
import { TEAM_COLORS } from "@/constants/teamColors";

interface WARHeroCardProps {
  player: {
    id: number;
    name: string;
    team: string;
    val: string;
    rank: number;
  };
  typeLabel: string;
}

export default function WARHeroCard({ player, typeLabel }: WARHeroCardProps) {
  const tc = TEAM_COLORS[player.team] || { bg: "#1e293b", accent: "#64748b" };

  return (
    <div
      className="relative rounded-3xl overflow-hidden shadow-xl h-full"
      style={{
        background: `linear-gradient(140deg, ${tc.bg} 0%, ${tc.accent} 100%)`,
      }}
    >
      <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full border-8 border-white opacity-10" />
      <div className="absolute -left-6 -bottom-6 w-36 h-36 rounded-full border-4 border-white opacity-10" />
      <div className="relative p-8 flex flex-col sm:flex-row items-center gap-6 h-full">
        <div className="flex flex-col items-center gap-3">
          <span className="text-5xl" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}>
            👑
          </span>
          <div className="w-32 h-32 rounded-2xl border-4 border-white/40 overflow-hidden shadow-lg">
            <PlayerAvatar id={player.id} name={player.name} size={128} />
          </div>
        </div>
        <div className="text-center sm:text-left flex-1">
          <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
            {typeLabel} · 종합 순위 1등
          </p>
          <h2 className="text-5xl font-black text-white tracking-tight leading-none">
            {player.name}
          </h2>
          <p className="text-white/60 text-lg mt-2 font-medium">{player.team}</p>
          <div className="mt-5 inline-flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
            <div>
              <p className="text-white/50 text-xs font-medium">WAR 2025</p>
              <p className="text-4xl font-black text-white leading-none">{player.val}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}