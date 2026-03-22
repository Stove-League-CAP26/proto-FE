// 팀 목록 페이지 + 팀 상세 페이지를 관리하는 컴포넌트
// 팀 선택 전: 10개 구단 카드 그리드 표시
// 팀 선택 후: TeamDetailPage로 전환 (소개/뎁스/선수/응원가/굿즈 탭)
import { useState } from "react";
import TeamIntroTab from "@/components/team/TeamIntroTab";
import TeamDepthTab from "@/components/team/TeamDepthTab";
import TeamPlayersTab from "@/components/team/TeamPlayersTab";
import TeamCheersTab from "@/components/team/TeamCheersTab";
import TeamGoodsTab from "@/components/team/TeamGoodsTab";
import { TEAMS_LIST, MOCK_TEAM_DATA } from "@/mock/teamData";

const TEAM_INNER_TABS = [
  { id: "intro",   label: "팀 소개",     icon: "ℹ️" },
  { id: "depth",   label: "뎁스",        icon: "🏟️" },
  { id: "players", label: "선수 정보",   icon: "👥" },
  { id: "cheers",  label: "응원가",      icon: "🎵" },
  { id: "goods",   label: "굿즈·마스코트", icon: "💎" },
];

interface Team {
  id: string;
  name: string;
  short: string;
  city: string;
  emoji: string;
  bg: string;
  accent: string;
  stadium: string;
}

function TeamDetailPage({
  team,
  onBack,
  onSelectPlayer,
}: {
  team: Team;
  onBack: () => void;
  onSelectPlayer: () => void;
}) {
  const [activeTab, setActiveTab] = useState("intro");
  const data = MOCK_TEAM_DATA[team.id] || MOCK_TEAM_DATA["KIA"];

  return (
    <div>
      {/* 팀 배너 */}
      <div
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${team.bg} 0%, ${team.accent === "#000000" ? "#333" : team.accent} 100%)` }}
      >
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full border-8 border-white opacity-10" />
        <div className="max-w-6xl mx-auto px-4 py-5 relative">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-white/60 hover:text-white text-sm flex items-center gap-1 transition-colors">
              ← 팀 목록
            </button>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-4xl flex-shrink-0">
              {team.emoji}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{team.name}</h1>
              <p className="text-white/60 text-sm">{team.city} · {team.stadium}</p>
            </div>
            <div className="ml-auto hidden sm:flex gap-5">
              {[["창단", data.founded], ["우승", data.championship], ["2025", data.ranking2025]].map(([k, v]) => (
                <div key={k} className="text-center">
                  <p className="text-white/50 text-xs">{k}</p>
                  <p className="text-white font-black text-base">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex">
            {TEAM_INNER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {["24", "25"].map((s, i) => (
              <button
                key={s}
                className={`px-3 py-1 rounded-lg text-sm font-black transition-all ${i === 1 ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === "intro"   && <TeamIntroTab   team={team} data={data} />}
        {activeTab === "depth"   && <TeamDepthTab   team={team} data={data} />}
        {activeTab === "players" && <TeamPlayersTab team={team} data={data} onSelectPlayer={onSelectPlayer} />}
        {activeTab === "cheers"  && <TeamCheersTab  team={team} data={data} />}
        {activeTab === "goods"   && <TeamGoodsTab   team={team} data={data} />}
      </div>
    </div>
  );
}

export default function TeamPage({ onSelectPlayer }: { onSelectPlayer: () => void }) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  if (selectedTeam) {
    return (
      <TeamDetailPage
        team={selectedTeam}
        onBack={() => setSelectedTeam(null)}
        onSelectPlayer={onSelectPlayer}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">팀 페이지</h1>
        <p className="text-sm text-gray-400 mt-1">응원하는 팀을 선택하세요</p>
      </div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">KBO 10개 구단</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* 팀 카드 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {TEAMS_LIST.map((team) => {
          const data = MOCK_TEAM_DATA[team.id] || MOCK_TEAM_DATA["KIA"];
          return (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(team)}
              className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border border-gray-100"
            >
              <div
                className="h-24 flex items-center justify-center text-5xl relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${team.bg}, ${team.accent === "#000000" ? "#333" : team.accent})` }}
              >
                <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white opacity-10" />
                <span style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}>{team.emoji}</span>
              </div>
              <div className="bg-white p-3 text-center">
                <p className="font-black text-gray-900 text-sm leading-tight">{team.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{team.city}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <span className="text-xs font-bold" style={{ color: team.bg }}>{data.wins}승</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs font-bold text-gray-400">{data.losses}패</span>
                </div>
              </div>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                style={{ background: `${team.bg}cc` }}
              >
                <p className="text-white font-black text-sm">자세히 보기 →</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 팀 간략 목록 */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-2">
        {TEAMS_LIST.map((team) => (
          <div key={team.id} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-100 shadow-sm">
            <span className="text-lg">{team.emoji}</span>
            <div>
              <p className="text-xs font-bold text-gray-700">{team.short}</p>
              <p className="text-xs text-gray-400">{team.city}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}