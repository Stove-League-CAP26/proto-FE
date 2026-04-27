// 팀 상세 뷰 — 실제 2025 팀 스탯 API 연동
import { useState, useEffect } from "react";
import RosterTab from "@/components/team/RosterTab";
import HistoryTab from "@/components/team/HistoryTab";
import SongsTab from "@/components/team/SongsTab";
import TeamRadarChart from "@/components/team/TeamRadarChart";
import type { Team } from "@/mock/teamData";
import { fetchTeamStats, type TeamStats } from "@/api/teamStatsApi";

const TABS = ["홈", "로스터", "히스토리", "응원가"] as const;
type TabType = (typeof TABS)[number];

interface TeamDetailProps {
  team: Team;
  onBack: () => void;
  onSelectPlayer: (pid: number) => void;
}

export default function TeamDetail({ team, onBack, onSelectPlayer }: TeamDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>("홈");
  const [stadiumImgError, setStadiumImgError] = useState(false);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const stadiumSrc = team.stadium.imageUrl || `/images/stadium/${team.id}.png`;
  const tc      = team.colors;
  const primary = tc.primary;

  useEffect(() => {
    setStatsLoading(true);
    fetchTeamStats(team.id, 2025)
      .then(setTeamStats)
      .catch(() => setTeamStats(null))
      .finally(() => setStatsLoading(false));
  }, [team.id]);

  // 헤더 배지 (실제 or fallback)
  const badges = teamStats
    ? [
        { label: "우승",  val: `${team.championships}회`,      color: "#F59E0B" },
        { label: "ERA",   val: teamStats.era.toFixed(2),        color: primary   },
        { label: "OPS",   val: teamStats.ops.toFixed(3),        color: "#10B981" },
        { label: "홈런",  val: `${teamStats.hr}개`,             color: "#3B82F6" },
      ]
    : [
        { label: "우승",  val: `${team.championships}회`,      color: "#F59E0B" },
        { label: "ERA",   val: team.stats2024.era.toFixed(2),   color: primary   },
        { label: "OPS",   val: team.stats2024.ops.toFixed(3),   color: "#10B981" },
        { label: "AVG",   val: team.stats2024.avg.toFixed(3),   color: "#3B82F6" },
      ];

  // 우측 스탯 카드 6개 (레이더와 다른 절대 수치)
  const statCards = teamStats ? [
    { label: "득점",   sub: "팀 총 득점",    val: `${teamStats.runs}점`,            color: "#F59E0B" },
    { label: "홈런",   sub: "팀 총 홈런",    val: `${teamStats.hr}개`,              color: "#EF4444" },
    { label: "탈삼진", sub: "투수 탈삼진",   val: `${teamStats.strikeout}개`,       color: "#8B5CF6" },
    { label: "출루율", sub: "팀 출루율",     val: teamStats.obp.toFixed(3),         color: "#3B82F6" },
    { label: "실책",   sub: "팀 실책",       val: `${teamStats.errorCount}개`,      color: "#06B6D4" },
    { label: "QS",     sub: "퀄리티스타트", val: `${teamStats.qs}회`,              color: "#10B981" },
  ] : null;

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      {/* 히어로 헤더 */}
      <div className="relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${primary}18 0%, ${primary}08 40%, #f8fafc 100%)`,
          borderBottom: `1px solid ${primary}20`,
        }}>
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: `${primary}08` }} />
        <div className="relative px-4 pt-5 pb-7 max-w-6xl mx-auto">
          <button onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-semibold mb-5 px-3 py-1.5 rounded-full transition-all hover:bg-black/5 w-fit"
            style={{ color: primary }}>
            ← 팀 선택으로
          </button>
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg overflow-hidden"
              style={{
                background: team.logoUrl ? "white" : `linear-gradient(135deg, ${tc.primary}, ${tc.secondary === "#000000" ? tc.accent : tc.secondary})`,
                boxShadow: `0 8px 24px ${primary}33`,
                border: `1px solid ${primary}20`,
              }}>
              {team.logoUrl
                ? <img src={team.logoUrl} alt={team.name} className="w-16 h-16 object-contain" />
                : <span className="text-2xl font-black" style={{ color: tc.text }}>{team.shortName}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-400 text-xs font-semibold tracking-wide">{team.city} · {team.stadium.name}</p>
              <h1 className="text-gray-900 text-2xl font-black leading-tight mt-0.5">{team.name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-gray-400 text-xs">창단 {team.founded}</span>
                <span className="text-gray-300 text-xs">·</span>
                <span className="text-gray-400 text-xs">{team.mascotName}</span>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {badges.map((b) => (
                  <div key={b.label}
                    className="flex items-baseline gap-1 px-2.5 py-1.5 rounded-xl bg-white shadow-sm"
                    style={{ border: `1px solid ${b.color}25` }}>
                    <span className="text-xs font-black" style={{ color: b.color }}>{b.val}</span>
                    <span className="text-[9px] font-semibold text-gray-400">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭바 */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4"
        style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }}>
        <div className="max-w-6xl mx-auto flex gap-1">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="relative flex-shrink-0 px-4 py-3.5 text-sm font-bold transition-all"
              style={{ color: activeTab === tab ? primary : "#94a3b8" }}>
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: primary }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {activeTab === "홈" && (
          <>
            {/* 구장 카드 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {!stadiumImgError
                ? <img src={stadiumSrc} alt={team.stadium.name} className="w-full h-44 object-cover"
                    onError={() => setStadiumImgError(true)} />
                : <div className="w-full h-44 flex flex-col items-center justify-center gap-2"
                    style={{ background: `linear-gradient(135deg, ${primary}15, ${primary}05)` }}>
                    <span className="text-5xl">🏟️</span>
                    <p className="text-gray-400 text-xs">이미지 준비중</p>
                  </div>
              }
              <div className="p-5 grid grid-cols-3 gap-4">
                {[
                  { label: "구장명",   value: team.stadium.name },
                  { label: "위치",    value: team.city },
                  { label: "수용인원", value: `${team.stadium.capacity.toLocaleString()}명` },
                  { label: "개장",    value: `${team.stadium.openYear}년` },
                  { label: "그라운드", value: team.stadium.surface },
                  { label: "형태",    value: team.stadium.roofType },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-gray-400 text-[10px] font-semibold">{label}</p>
                    <p className="text-gray-800 text-sm font-bold mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 우승 연도 */}
            {team.championshipYears.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 rounded-full" style={{ background: "#F59E0B" }} />
                  <h3 className="text-gray-800 text-sm font-extrabold">
                    🏆 한국시리즈 우승
                    <span className="ml-1.5 font-black" style={{ color: "#F59E0B" }}>{team.championships}회</span>
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {team.championshipYears.map((y) => (
                    <span key={y} className="px-2.5 py-1 rounded-full text-xs font-black"
                      style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" }}>
                      {y}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 팀 스탯 레이더 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full" style={{ background: primary }} />
                <h3 className="text-gray-800 text-sm font-extrabold">2025 팀 스탯 분석</h3>
                <span className="ml-auto text-[10px] text-gray-400">
                  🛡️ ERA · WHIP · 수비 &nbsp;/&nbsp; ⚔️ 도루 · OPS · 타율
                </span>
              </div>

              {statsLoading ? (
                <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  {/* 레이더 차트 */}
                  <div className="rounded-2xl p-3" style={{ background: "#0f172a" }}>
                    <TeamRadarChart team={team} radarData={teamStats?.radar ?? null} />
                  </div>

                  {/* 우측 스탯 카드 — 레이더와 다른 절대 수치 */}
                  <div className="grid grid-cols-2 gap-2">
                    {statCards ? (
                      statCards.map((s) => (
                        <div key={s.label}
                          className="rounded-xl p-3 border border-gray-100"
                          style={{ background: `${s.color}08` }}>
                          <p className="text-[9px] text-gray-400 font-semibold">{s.sub}</p>
                          <p className="text-sm font-black mt-1" style={{ color: s.color }}>{s.val}</p>
                          <p className="text-[10px] text-gray-500 font-bold mt-0.5">{s.label}</p>
                        </div>
                      ))
                    ) : (
                      // fallback mock
                      [
                        { label:"ERA",  sub:"평균자책점",   val:team.stats2024.era.toFixed(2),  color:primary    },
                        { label:"WHIP", sub:"이닝당출루",   val:team.stats2024.whip.toFixed(2), color:"#06B6D4"  },
                        { label:"QS",   sub:"퀄리티스타트", val:`${team.stats2024.qs}회`,       color:"#8B5CF6"  },
                        { label:"AVG",  sub:"팀타율",       val:team.stats2024.avg.toFixed(3),  color:"#3B82F6"  },
                        { label:"SB",   sub:"도루",         val:`${team.stats2024.sb}개`,       color:"#10B981"  },
                        { label:"OPS",  sub:"출루+장타",    val:team.stats2024.ops.toFixed(3),  color:"#F59E0B"  },
                      ].map((s) => (
                        <div key={s.label}
                          className="rounded-xl p-3 border border-gray-100"
                          style={{ background: `${primary}08` }}>
                          <p className="text-[9px] text-gray-400 font-semibold">{s.sub}</p>
                          <p className="text-sm font-black mt-1" style={{ color: primary }}>{s.val}</p>
                          <p className="text-[10px] text-gray-500 font-bold mt-0.5">{s.label}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "로스터" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 rounded-full" style={{ background: primary }} />
              <h3 className="text-gray-800 text-sm font-extrabold">선수단</h3>
              <span className="ml-auto text-gray-400 text-xs">선수 클릭 → 선수 프로필</span>
            </div>
            <RosterTab team={team} onSelectPlayer={onSelectPlayer} />
          </div>
        )}

        {activeTab === "히스토리" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 rounded-full" style={{ background: primary }} />
              <h3 className="text-gray-800 text-sm font-extrabold">팀 역사</h3>
            </div>
            <HistoryTab history={team.history} teamColor={primary} />
          </div>
        )}

        {activeTab === "응원가" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 rounded-full" style={{ background: primary }} />
              <h3 className="text-gray-800 text-sm font-extrabold">응원가</h3>
            </div>
            <SongsTab teamId={team.id} teamColor={primary} />
          </div>
        )}
      </div>
    </div>
  );
}
