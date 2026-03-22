// 팀 선수 정보 탭 - 포지션별 선수 카드 그리드, 클릭 시 선수 개인 페이지로 이동
import PlayerAvatar from "@/components/common/PlayerAvatar";

interface TeamPlayersTabProps {
  team: { bg: string; accent: string };
  data: {
    roster: Record<string, { no: number; name: string; pos: string; id: number }[]>;
  };
  onSelectPlayer: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  pitcher: "투수진",
  catcher: "포수진",
  infield: "내야수",
  outfield: "외야수",
};

export default function TeamPlayersTab({ team, data, onSelectPlayer }: TeamPlayersTabProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">선수를 클릭하면 개인 페이지로 이동합니다</p>
      {["pitcher", "catcher", "infield", "outfield"].map((cat) => (
        <div key={cat}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 rounded-full" style={{ backgroundColor: team.bg }} />
            <h3 className="font-bold text-gray-700">{CATEGORY_LABELS[cat]}</h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {(data.roster[cat] || []).map((p) => (
              <button
                key={p.no}
                onClick={onSelectPlayer}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex flex-col items-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
              >
                <div
                  className="w-16 h-16 rounded-xl overflow-hidden border-2 group-hover:border-opacity-100 transition-colors"
                  style={{ borderColor: `${team.bg}40` }}
                >
                  <PlayerAvatar id={p.id} name={p.name} size={64} />
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded text-white"
                      style={{ backgroundColor: team.bg }}
                    >
                      {p.no}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-800 leading-tight">{p.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.pos}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}