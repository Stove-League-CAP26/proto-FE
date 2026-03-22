// 선수 프로필 탭 - 선수 카드(사진/등번호/수상), 기본정보, 커리어 히스토리, 스탯 레이더를 3열 그리드로 표시
import PlayerAvatar from "@/components/common/PlayerAvatar";
import RadarChart from "@/components/common/RadarChart";

interface CareerEntry {
  year: string;
  team: string;
  note: string;
}

interface ProfileTabProps {
  player: {
    id: number;
    name: string;
    number: number;
    team: string;
    teamColor: string;
    teamAccent: string;
    position: string;
    bats: string;
    born: string;
    draft: string;
    salary: string;
    heightWeight: string;
    blood: string;
    nation: string;
    awards: string[];
    playstyle: string;
    career: CareerEntry[];
    radarData: Record<string, number>;
  };
}

export default function ProfileTab({ player }: ProfileTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 선수 카드 */}
      <div className="lg:col-span-1">
        <div
          className="rounded-2xl overflow-hidden shadow-lg"
          style={{
            background: `linear-gradient(160deg, ${player.teamColor} 0%, ${player.teamAccent} 100%)`,
          }}
        >
          <div className="flex flex-col items-center pt-8 pb-4 px-4">
            <span className="text-5xl font-black text-white opacity-30 mb-3">
              #{player.number}
            </span>
            <div className="w-32 h-32 rounded-full bg-white/20 border-4 border-white/40 overflow-hidden mb-3">
              <PlayerAvatar id={player.id} name={player.name} size={128} />
            </div>
            <h2 className="text-2xl font-black text-white">{player.name}</h2>
            <p className="text-white/70 text-sm mt-1">
              {player.team} · {player.position} · {player.bats}
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {player.awards.length > 0 ? (
                player.awards.map((a) => (
                  <span key={a} className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
                    🏆 {a}
                  </span>
                ))
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white/60">
                  수상 정보 준비 중
                </span>
              )}
            </div>
          </div>
          <div className="bg-white/10 mx-4 mb-4 rounded-xl px-4 py-2 text-center">
            <p className="text-white/60 text-xs">플레이 스타일</p>
            <p className="text-white font-bold text-lg">{player.playstyle}</p>
          </div>
        </div>
      </div>

      {/* 기본정보 + 커리어 */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            선수 정보
          </h3>
          {[
            ["생년월일", player.born],
            ["신장/체중", player.heightWeight],
            ["혈액형", player.blood],
            ["출신국", player.nation],
            ["입단", player.draft],
            ["연봉", player.salary],
            ["포지션", player.position],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-400 font-medium">{k}</span>
              <span className="text-sm text-gray-800 font-semibold">{v}</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            커리어 히스토리
          </h3>
          {player.career.length > 0 ? (
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-100" />
              {player.career.map((c, i) => (
                <div key={i} className="flex gap-4 mb-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center z-10 mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{c.team}</p>
                    <p className="text-xs text-gray-400">
                      {c.year} {c.note && `· ${c.note}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">커리어 정보 준비 중</p>
          )}
        </div>
      </div>

      {/* 스탯 레이더 */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            스탯 레이더
          </h3>
          <div className="w-full aspect-square max-w-xs mx-auto">
            <RadarChart data={player.radarData} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {Object.keys(player.radarData).map((k) => (
              <div key={k} className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
                <p className="text-xs text-gray-400">{k}</p>
                <p className="text-sm font-bold text-gray-800">{player.radarData[k]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}