// src/components/team/teamDetail.tsx
import { useState, useEffect } from "react";
import RosterTab from "@/components/team/RosterTab";
import HistoryTab from "@/components/team/HistoryTab";
import SongsTab from "@/components/team/SongsTab";
import TeamRadarChart from "@/components/team/TeamRadarChart";
import TeamDepthTab from "@/components/team/TeamDepthTab";
import type { Team } from "@/mock/teamData";
import {
  fetchTeamStats,
  fetchTeamRadar,
  fetchLeagueAverageRadar,
  type TeamStats,
  type TeamRadarData,
} from "@/api/teamStatsApi";

const TABS = ["홈", "로스터", "포지션", "응원가"] as const;
type TabType = (typeof TABS)[number];

interface TeamDetailProps {
  team: Team;
  onBack: () => void;
  onSelectPlayer: (pid: number) => void;
}

// ── 전체 스탯 테이블 ──────────────────────────────────────────
function TeamFullStatTable({
  stats,
  primary,
}: {
  stats: TeamStats;
  primary: string;
}) {
  const [tab, setTab] = useState<"batting" | "pitching">("batting");

  const battingRows = [
    { label: "경기", val: stats.g, unit: "G" },
    { label: "타석", val: stats.pa, unit: "PA" },
    { label: "타수", val: stats.ab, unit: "AB" },
    { label: "득점", val: stats.r, unit: "R" },
    { label: "안타", val: stats.h, unit: "H" },
    { label: "2루타", val: stats.b2, unit: "2B" },
    { label: "3루타", val: stats.b3, unit: "3B" },
    { label: "홈런", val: stats.hr, unit: "HR" },
    { label: "루타", val: stats.tb, unit: "TB" },
    { label: "타점", val: stats.rbi, unit: "RBI" },
    { label: "희생번트", val: stats.sac, unit: "SAC" },
    { label: "희생플라이", val: stats.sf, unit: "SF" },
    { label: "볼넷", val: stats.bb, unit: "BB" },
    { label: "고의사구", val: stats.ibb, unit: "IBB" },
    { label: "사구", val: stats.hbp, unit: "HBP" },
    { label: "삼진", val: stats.so, unit: "SO" },
    { label: "병살", val: stats.gdp, unit: "GDP" },
    { label: "멀티히트", val: stats.mh, unit: "MH" },
    { label: "도루", val: stats.sb, unit: "SB" },
    { label: "타율", val: stats.avg?.toFixed(3), unit: "AVG", highlight: true },
    {
      label: "출루율",
      val: stats.obp?.toFixed(3),
      unit: "OBP",
      highlight: true,
    },
    {
      label: "장타율",
      val: stats.slg?.toFixed(3),
      unit: "SLG",
      highlight: true,
    },
    { label: "OPS", val: stats.ops?.toFixed(3), unit: "OPS", highlight: true },
    {
      label: "득점권타율",
      val: stats.risp?.toFixed(3),
      unit: "RISP",
      highlight: true,
    },
    { label: "대타타율", val: stats.phBa?.toFixed(3), unit: "PH" },
  ];

  const pitchingRows = [
    { label: "ERA", val: stats.era?.toFixed(2), unit: "ERA", highlight: true },
    { label: "경기", val: stats.g, unit: "G" },
    { label: "승", val: stats.w, unit: "W" },
    { label: "패", val: stats.l, unit: "L" },
    { label: "세이브", val: stats.sv, unit: "SV" },
    { label: "홀드", val: stats.hld, unit: "HLD" },
    { label: "승률", val: stats.wpct?.toFixed(3), unit: "W%", highlight: true },
    { label: "이닝", val: stats.ip, unit: "IP" },
    { label: "피안타", val: stats.pitchH, unit: "H" },
    { label: "피홈런", val: stats.pitchHr, unit: "HR" },
    { label: "볼넷", val: stats.pitchBb, unit: "BB" },
    { label: "사구", val: stats.pitchHbp, unit: "HBP" },
    { label: "탈삼진", val: stats.pitchSo, unit: "K" },
    { label: "실점", val: stats.pitchR, unit: "R" },
    { label: "자책점", val: stats.er, unit: "ER" },
    {
      label: "WHIP",
      val: stats.whip?.toFixed(2),
      unit: "WHIP",
      highlight: true,
    },
    { label: "완투", val: stats.cg, unit: "CG" },
    { label: "완봉", val: stats.sho, unit: "SHO" },
    { label: "QS", val: stats.qs, unit: "QS", highlight: true },
    { label: "블론세이브", val: stats.bsv, unit: "BSV" },
    { label: "피타자", val: stats.tbf, unit: "TBF" },
    { label: "투구수", val: stats.np, unit: "NP" },
    {
      label: "피타율",
      val: stats.pitchAvg?.toFixed(3),
      unit: "AVG",
      highlight: true,
    },
    { label: "폭투", val: stats.wp, unit: "WP" },
    { label: "보크", val: stats.bk, unit: "BK" },
    { label: "실책", val: stats.e, unit: "E" },
  ];

  const rows = tab === "batting" ? battingRows : pitchingRows;

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100">
      {/* 탭 */}
      <div className="flex">
        {(["batting", "pitching"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-3 text-xs font-bold transition-all border-b-2"
            style={{
              color: tab === t ? primary : "#94a3b8",
              borderBottomColor: tab === t ? primary : "transparent",
              background: tab === t ? `${primary}06` : "#f8fafc",
            }}
          >
            {t === "batting" ? "공격 팀 타격" : "수비 팀 투수"}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: `${primary}08` }}>
              {rows.map((row) => (
                <th
                  key={row.unit}
                  className="px-3 py-2 text-center whitespace-nowrap border-b border-gray-100"
                  style={{
                    color: row.highlight ? primary : "#64748b",
                    fontSize: "10px",
                    fontWeight: row.highlight ? 900 : 700,
                    letterSpacing: "0.04em",
                  }}
                >
                  {row.unit}
                </th>
              ))}
            </tr>
            <tr style={{ background: "#f8fafc" }}>
              {rows.map((row) => (
                <th
                  key={row.unit}
                  className="px-3 py-1.5 text-center whitespace-nowrap border-b border-gray-100 text-[10px] text-gray-400 font-medium"
                >
                  {row.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50 transition-colors">
              {rows.map((row) => (
                <td
                  key={row.unit}
                  className="px-3 py-3 text-center whitespace-nowrap"
                  style={{
                    color: row.highlight ? primary : "#1e293b",
                    fontWeight: row.highlight ? 800 : 600,
                    fontSize: row.highlight ? "14px" : "13px",
                  }}
                >
                  {row.val ?? "-"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function TeamDetail({
  team,
  onBack,
  onSelectPlayer,
}: TeamDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>("홈");
  const [stadiumImgError, setStadiumImgError] = useState(false);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [teamRadar, setTeamRadar] = useState<TeamRadarData | null>(null);
  const [leagueAvgRadar, setLeagueAvgRadar] = useState<TeamRadarData | null>(
    null,
  );
  const [statsLoading, setStatsLoading] = useState(true);

  const stadiumSrc = team.stadium.imageUrl || `/images/stadium/${team.id}.png`;
  const tc = team.colors;
  const primary = tc.primary;

  useEffect(() => {
    setStatsLoading(true);
    setTeamStats(null);
    setTeamRadar(null);

    Promise.all([
      fetchTeamStats(team.id, 2025).catch(() => null),
      fetchTeamRadar(team.id, 2025).catch(() => null),
      fetchLeagueAverageRadar(2025).catch(() => null),
    ])
      .then(([stats, radar, avgRadar]) => {
        setTeamStats(stats);
        setTeamRadar(radar);
        setLeagueAvgRadar(avgRadar);
      })
      .finally(() => setStatsLoading(false));
  }, [team.id]);

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      {/* 히어로 헤더 */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${primary}18 0%, ${primary}08 40%, #f8fafc 100%)`,
          borderBottom: `1px solid ${primary}20`,
        }}
      >
        <div
          className="absolute -right-20 -top-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: `${primary}08` }}
        />
        <div className="relative px-4 pt-5 pb-7 max-w-6xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-semibold mb-5 px-3 py-1.5 rounded-full transition-all hover:bg-black/5 w-fit"
            style={{ color: primary }}
          >
            ← 팀 선택으로
          </button>
          <div className="flex items-start gap-5">
            <div
              className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg overflow-hidden"
              style={{
                background: team.logoUrl
                  ? "white"
                  : `linear-gradient(135deg, ${tc.primary}, ${tc.secondary === "#000000" ? tc.accent : tc.secondary})`,
                boxShadow: `0 8px 24px ${primary}33`,
                border: `1px solid ${primary}20`,
              }}
            >
              {team.logoUrl ? (
                <img
                  src={team.logoUrl}
                  alt={team.name}
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <span
                  className="text-2xl font-black"
                  style={{ color: tc.text }}
                >
                  {team.shortName}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-400 text-xs font-semibold tracking-wide">
                {team.city} · {team.stadium.name}
              </p>
              <h1 className="text-gray-900 text-2xl font-black leading-tight mt-0.5">
                {team.name}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-gray-400 text-xs">
                  창단 {team.founded}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭바 */}
      <div
        className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4"
        style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }}
      >
        <div className="max-w-6xl mx-auto flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative flex-shrink-0 px-4 py-3.5 text-sm font-bold transition-all"
              style={{ color: activeTab === tab ? primary : "#94a3b8" }}
            >
              {tab}
              {activeTab === tab && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: primary }}
                />
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
              {!stadiumImgError ? (
                <img
                  src={stadiumSrc}
                  alt={team.stadium.name}
                  className="w-full h-44 object-cover"
                  onError={() => setStadiumImgError(true)}
                />
              ) : (
                <div
                  className="w-full h-44 flex flex-col items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${primary}15, ${primary}05)`,
                  }}
                >
                  <span className="text-5xl">🏟️</span>
                  <p className="text-gray-400 text-xs">이미지 준비중</p>
                </div>
              )}
              <div className="p-5 gap-4">
                {/* 구장 정보, 팀 역사 */}
                <div className="p-5 grid grid-cols-2 gap-4">
                  <div className="bg-withe rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-5">
                      <div
                        className="w-1 h-5 rounded-full"
                        style={{ background: primary }}
                      />
                      <h3 className="text-gray-800 text-sm font-extrabold">
                        구장 정보
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "구장명", value: team.stadium.name },
                        { label: "위치", value: team.city },
                        {
                          label: "수용인원",
                          value: `${team.stadium.capacity.toLocaleString()}명`,
                        },
                        { label: "개장", value: `${team.stadium.openYear}년` },
                        { label: "그라운드", value: team.stadium.surface },
                        { label: "형태", value: team.stadium.roofType },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-gray-400 text-[10px] font-semibold">
                            {label}
                          </p>
                          <p className="text-gray-800 text-sm font-bold mt-0.5">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-withe rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-5">
                      <div
                        className="w-1 h-5 rounded-full"
                        style={{ background: primary }}
                      />
                      <h3 className="text-gray-800 text-sm font-extrabold">
                        팀 역사
                      </h3>
                    </div>
                    <HistoryTab history={team.history} teamColor={primary} />
                  </div>
                </div>
                {/* 우승 연도 */}
                {team.championshipYears.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-1 h-5 rounded-full"
                        style={{ background: "#F59E0B" }}
                      />
                      <h3 className="text-gray-800 text-sm font-extrabold">
                        🏆 한국시리즈 우승
                        <span
                          className="ml-1.5 font-black"
                          style={{ color: "#F59E0B" }}
                        >
                          {team.championships}회
                        </span>
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {team.championshipYears.map((y) => (
                        <span
                          key={y}
                          className="px-2.5 py-1 rounded-full text-xs font-black"
                          style={{
                            background: "#FEF3C7",
                            color: "#92400E",
                            border: "1px solid #FDE68A",
                          }}
                        >
                          {y}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 팀 스탯 분석 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="w-1 h-5 rounded-full"
                  style={{ background: primary }}
                />
                <h3 className="text-gray-800 text-sm font-extrabold">
                  2025 팀 스탯 분석
                </h3>
                <span className="ml-auto text-[10px] text-gray-400">
                  🛡️ ERA · WHIP · 수비 &nbsp;/&nbsp; ⚔️ 도루 · OPS · 타율
                </span>
              </div>

              {statsLoading ? (
                <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
              ) : (
                <>
                  {/* ── 상단: 레이더 + 6개 주요 스탯 ── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start mb-6">
                    <div
                      className="rounded-2xl p-3 flex justify-center"
                      style={{ background: "#0f172a" }}
                    >
                      <div className="w-full max-w-[400px]">
                        <TeamRadarChart
                          team={team}
                          radarData={teamRadar}
                          avgData={leagueAvgRadar}
                        />
                      </div>
                    </div>

                    {/* 6개 주요 스탯 */}
                    <div>
                      <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-2.5">
                        주요 스탯
                      </p>
                      <div className="grid grid-cols-2 gap-3 gap-y-8">
                        {[
                          {
                            label: "ERA",
                            sub: "평균자책점",
                            val:
                              teamStats?.era != null
                                ? teamStats.era.toFixed(2)
                                : team.stats2024.era.toFixed(2),
                            desc: "낮을수록 좋음",
                          },
                          {
                            label: "WHIP",
                            sub: "이닝당 출루허용",
                            val:
                              teamStats?.whip != null
                                ? teamStats.whip.toFixed(2)
                                : team.stats2024.whip.toFixed(2),
                            desc: "낮을수록 좋음",
                          },
                          {
                            label: "OPS",
                            sub: "출루율 + 장타율",
                            val:
                              teamStats?.ops != null
                                ? teamStats.ops.toFixed(3)
                                : team.stats2024.ops.toFixed(3),
                            desc: "높을수록 좋음",
                          },
                          {
                            label: "타율",
                            sub: "팀 타율",
                            val:
                              teamStats?.avg != null
                                ? teamStats.avg.toFixed(3)
                                : team.stats2024.avg.toFixed(3),
                            desc: "높을수록 좋음",
                          },
                          {
                            label: "도루",
                            sub: "팀 도루",
                            val:
                              teamStats?.sb != null
                                ? `${teamStats.sb}개`
                                : `${team.stats2024.sb}개`,
                            desc: "시즌 누적",
                          },
                          {
                            label: "QS",
                            sub: "퀄리티스타트",
                            val:
                              teamStats?.qs != null
                                ? `${teamStats.qs}회`
                                : `${team.stats2024.qs}회`,
                            desc: "시즌 누적",
                          },
                        ].map((s) => (
                          <div
                            key={s.label}
                            className="rounded-xl p-3 border"
                            style={{
                              background: `${primary}08`,
                              borderColor: `${primary}20`,
                            }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[10px] text-gray-400 font-semibold">
                                {s.sub}
                              </p>
                              <span
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{
                                  background: `${primary}15`,
                                  color: primary,
                                }}
                              >
                                {s.desc}
                              </span>
                            </div>
                            <p
                              className="text-xl font-black mt-0.5"
                              style={{ color: primary }}
                            >
                              {s.val}
                            </p>
                            <p className="text-[10px] text-gray-500 font-bold mt-0.5">
                              {s.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── 하단: 전체 스탯 테이블 ── */}
                  {teamStats && (
                    <TeamFullStatTable stats={teamStats} primary={primary} />
                  )}
                </>
              )}
            </div>
          </>
        )}

        {activeTab === "로스터" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-1 h-5 rounded-full"
                style={{ background: primary }}
              />
              <h3 className="text-gray-800 text-sm font-extrabold">선수단</h3>
            </div>
            <RosterTab team={team} onSelectPlayer={onSelectPlayer} />
          </div>
        )}

        {/* 뎁스 탭 — fetch·캐시·시즌토글 모두 TeamDepthTab 내부에서 처리 */}
        {activeTab === "포지션" && (
          <TeamDepthTab
            teamId={team.id}
            primary={primary}
            accent={tc.accent}
            onSelectPlayer={onSelectPlayer}
          />
        )}

        {activeTab === "응원가" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-1 h-5 rounded-full"
                style={{ background: primary }}
              />
              <h3 className="text-gray-800 text-sm font-extrabold">응원가</h3>
            </div>
            <SongsTab teamId={team.id} teamColor={primary} />
          </div>
        )}
      </div>
    </div>
  );
}
