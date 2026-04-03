// 팀 상세 뷰 — 화이트 기반 + 팀 컬러 포인트 디자인
// · 배경: 흰색 + 상단 팀 컬러 워시 그라디언트
// · 카드: bg-white, border-gray-100, shadow-sm
// · 팀 컬러: 헤더 강조 / 탭 액티브 / 뱃지 포인트 용도로만 사용
import { useState } from "react";
import RosterTab from "@/components/team/RosterTab";
import HistoryTab from "@/components/team/HistoryTab";
import SongsTab from "@/components/team/SongsTab";
import TeamRadarChart from "@/components/team/TeamRadarChart";
import type { Team } from "@/mock/teamData";
import { RADAR_AXES } from "@/constants/teamConstants";

const TABS = ["홈", "로스터", "히스토리", "응원가"] as const;
type TabType = (typeof TABS)[number];

interface TeamDetailProps {
  team: Team;
  onBack: () => void;
  onSelectPlayer: (pid: number) => void;
}

export default function TeamDetail({
  team,
  onBack,
  onSelectPlayer,
}: TeamDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>("홈");
  const [stadiumImgError, setStadiumImgError] = useState(
    !team.stadium.imageUrl,
  );

  const tc = team.colors;
  const primary = tc.primary;

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      {/* ── 히어로 헤더 ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${primary}18 0%, ${primary}08 40%, #f8fafc 100%)`,
          borderBottom: `1px solid ${primary}20`,
        }}
      >
        {/* 우측 장식 원 */}
        <div
          className="absolute -right-20 -top-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: `${primary}08` }}
        />

        <div className="relative px-5 pt-5 pb-7 max-w-4xl mx-auto">
          {/* 뒤로 가기 */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-semibold mb-5 px-3 py-1.5 rounded-full transition-all hover:bg-black/5 w-fit"
            style={{ color: primary }}
          >
            ← 팀 선택으로
          </button>

          <div className="flex items-start gap-5">
            {/* 팀 엠블럼 */}
            <div
              className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg overflow-hidden"
              style={{
                background: team.logoUrl
                  ? "white"
                  : `linear-gradient(135deg, ${tc.primary}, ${
                      tc.secondary === "#000000" ? tc.accent : tc.secondary
                    })`,
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
                <span className="text-gray-300 text-xs">·</span>
                <span className="text-gray-400 text-xs">{team.mascotName}</span>
              </div>

              {/* 스탯 뱃지 */}
              <div className="flex gap-2 mt-3 flex-wrap">
                {[
                  {
                    label: "우승",
                    val: `${team.championships}회`,
                    color: "#F59E0B",
                  },
                  {
                    label: "ERA",
                    val: team.stats2024.era.toFixed(2),
                    color: primary,
                  },
                  {
                    label: "OPS",
                    val: team.stats2024.ops.toFixed(3),
                    color: "#10B981",
                  },
                  {
                    label: "AVG",
                    val: team.stats2024.avg.toFixed(3),
                    color: "#3B82F6",
                  },
                ].map((b) => (
                  <div
                    key={b.label}
                    className="flex items-baseline gap-1 px-2.5 py-1.5 rounded-xl bg-white shadow-sm"
                    style={{ border: `1px solid ${b.color}25` }}
                  >
                    <span
                      className="text-xs font-black"
                      style={{ color: b.color }}
                    >
                      {b.val}
                    </span>
                    <span className="text-[9px] font-semibold text-gray-400">
                      {b.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 탭바 ── */}
      <div
        className="sticky top-0 z-20 bg-white border-b border-gray-100 px-5"
        style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }}
      >
        <div className="max-w-4xl mx-auto flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative flex-shrink-0 px-4 py-3.5 text-sm font-bold transition-all"
              style={{
                color: activeTab === tab ? primary : "#94a3b8",
              }}
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

      {/* ── 탭 콘텐츠 ── */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* ──── 홈 탭 ──── */}
        {activeTab === "홈" && (
          <>
            {/* 구장 카드 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {!stadiumImgError ? (
                <img
                  src={team.stadium.imageUrl}
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
              <div className="p-5 grid grid-cols-3 gap-4">
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

            {/* 팀 스탯 레이더 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-1 h-5 rounded-full"
                  style={{ background: primary }}
                />
                <h3 className="text-gray-800 text-sm font-extrabold">
                  2024 팀 스탯 분석
                </h3>
                <span className="ml-auto text-gray-400 text-xs">
                  🛡️ 수비 / ⚔️ 공격
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* 레이더 차트 — 다크 배경 그대로 유지 (가독성 ↑) */}
                <div
                  className="rounded-2xl p-3"
                  style={{ background: "#0f172a" }}
                >
                  <TeamRadarChart team={team} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {RADAR_AXES.map((ax) => (
                    <div
                      key={ax.key}
                      className="rounded-xl p-3 text-center border border-gray-100"
                      style={{ background: `${primary}08` }}
                    >
                      <p className="text-[9px] text-gray-500 font-semibold">
                        {ax.sub}
                      </p>
                      <p
                        className="text-sm font-black mt-0.5"
                        style={{ color: primary }}
                      >
                        {ax.key === "ERA"
                          ? team.stats2024.era.toFixed(2)
                          : ax.key === "WHIP"
                            ? team.stats2024.whip.toFixed(2)
                            : ax.key === "QS"
                              ? `${team.stats2024.qs}회`
                              : ax.key === "AVG"
                                ? team.stats2024.avg.toFixed(3)
                                : ax.key === "SB"
                                  ? `${team.stats2024.sb}개`
                                  : team.stats2024.ops.toFixed(3)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ──── 로스터 탭 ──── */}
        {activeTab === "로스터" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-1 h-5 rounded-full"
                style={{ background: primary }}
              />
              <h3 className="text-gray-800 text-sm font-extrabold">선수단</h3>
              <span className="ml-auto text-gray-400 text-xs">
                선수 클릭 → 선수 프로필
              </span>
            </div>
            <RosterTab team={team} onSelectPlayer={onSelectPlayer} />
          </div>
        )}

        {/* ──── 히스토리 탭 ──── */}
        {activeTab === "히스토리" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-1 h-5 rounded-full"
                style={{ background: primary }}
              />
              <h3 className="text-gray-800 text-sm font-extrabold">팀 역사</h3>
            </div>
            <HistoryTab history={team.history} teamColor={primary} />
          </div>
        )}

        {/* ──── 응원가 탭 ──── */}
        {activeTab === "응원가" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-1 h-5 rounded-full"
                style={{ background: primary }}
              />
              <h3 className="text-gray-800 text-sm font-extrabold">응원가</h3>
            </div>
            <SongsTab songs={team.songs} team={team} />
          </div>
        )}
      </div>
    </div>
  );
}
