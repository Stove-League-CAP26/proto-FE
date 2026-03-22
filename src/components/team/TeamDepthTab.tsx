// 팀 뎁스 탭 - 주전/엔트리 필드 차트와 포지션별 선수 명단 테이블을 표시
import PlayerAvatar from "@/components/common/PlayerAvatar";
import DepthFieldChart from "@/components/team/DepthFieldChart";

interface TeamDepthTabProps {
  team: { bg: string; accent: string };
  data: {
    depthMap: Record<string, [string, string][]>;
    roster: Record<string, { no: number; name: string; pos: string; id: number }[]>;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  pitcher: "투수",
  catcher: "포수",
  infield: "내야수",
  outfield: "외야수",
};

export default function TeamDepthTab({ team, data }: TeamDepthTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 주전 필드 차트 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div
            className="px-5 py-3 border-b border-gray-100 flex items-center gap-2"
            style={{ borderLeftWidth: 4, borderLeftColor: team.bg }}
          >
            <span className="font-black text-gray-800">주전</span>
            <span className="text-xs text-gray-400">2025 시즌 기준</span>
          </div>
          <div className="p-4">
            <DepthFieldChart depthMap={data.depthMap} teamColor={team.bg} />
          </div>
        </div>

        {/* 엔트리 필드 차트 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div
            className="px-5 py-3 border-b border-gray-100 flex items-center gap-2"
            style={{ borderLeftWidth: 4, borderLeftColor: team.accent }}
          >
            <span className="font-black text-gray-800">엔트리</span>
            <span className="text-xs text-gray-400">2025 시즌 기준</span>
          </div>
          <div className="p-4">
            <DepthFieldChart
              depthMap={data.depthMap}
              teamColor={team.accent === "#000000" ? "#444" : team.accent}
            />
          </div>
        </div>
      </div>

      {/* 포지션별 선수 명단 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-800">포지션별 선수 명단</h3>
        </div>
        {["pitcher", "catcher", "infield", "outfield"].map((cat) => (
          <div key={cat} className="border-b border-gray-50 last:border-0">
            <div className="px-5 py-2 bg-gray-50">
              <span className="text-xs font-bold text-gray-500 uppercase">
                {CATEGORY_LABELS[cat]}
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {(data.roster[cat] || []).map((p) => (
                <div
                  key={p.no}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                    <PlayerAvatar id={p.id} name={p.name} size={36} />
                  </div>
                  <span className="w-8 text-xs font-bold text-gray-400">#{p.no}</span>
                  <span className="flex-1 text-sm font-semibold text-gray-800">{p.name}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {p.pos}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}