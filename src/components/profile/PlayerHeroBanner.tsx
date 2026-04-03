// 선수 히어로 배너
// 왼쪽: 선수 사진 + 기본정보 + 스탯 배지
// 오른쪽: 육각형 레이더 차트 + 플레이어 스타일 (시즌 기록 테이블은 하단 탭에서 표시)
import PlayerAvatar from "@/components/common/PlayerAvatar";
import RadarChart from "@/components/common/RadarChart";
import { mapHitterRadar, mapPitcherRadar } from "@/utils/playerUtils";
import type { HitterRadar, PitcherRadar } from "@/api/playerApi";

interface HeroBadge {
  label: string;
  val: string;
  color: string;
}

interface PlayerHeroBannerProps {
  playerBasic: any;
  bgGradient: string;
  heroAccent: string;
  isPitcherPlayer: boolean;
  hwStr: string;
  ageStr: string;
  salaryStr: string;
  heroBadges: HeroBadge[];
  radarData: HitterRadar | PitcherRadar | null;
  radarLoading: boolean;
}

// 스타일 태그별 이모지/색상
const STYLE_META: Record<string, { emoji: string; color: string; bg: string }> =
  {
    // 타자
    슬러거: { emoji: "🪄", color: "#EF4444", bg: "#fef2f2" },
    스피드스터: { emoji: "⚡", color: "#3B82F6", bg: "#eff6ff" },
    클린업: { emoji: "👑", color: "#F59E0B", bg: "#fffbeb" },
    교타자: { emoji: "🎯", color: "#10B981", bg: "#f0fdf4" },
    올라운더: { emoji: "⭐", color: "#8B5CF6", bg: "#f5f3ff" },
    // 투수
    파워피처: { emoji: "🔥", color: "#EF4444", bg: "#fef2f2" },
    에이스: { emoji: "🏆", color: "#F59E0B", bg: "#fffbeb" },
    기교파: { emoji: "🎯", color: "#10B981", bg: "#f0fdf4" },
    이닝이터: { emoji: "🦣", color: "#3B82F6", bg: "#eff6ff" },
    마무리형: { emoji: "🔒", color: "#8B5CF6", bg: "#f5f3ff" },
  };

/** radar 응답에서 style 제외한 수치만 추출 */
function extractRadarValues(
  radar: HitterRadar | PitcherRadar,
  isPitcher: boolean,
): Record<string, number> {
  const raw = radar as Record<string, number | string>;
  return isPitcher ? mapPitcherRadar(raw) : mapHitterRadar(raw);
}

export default function PlayerHeroBanner({
  playerBasic,
  bgGradient,
  heroAccent,
  isPitcherPlayer,
  hwStr,
  ageStr,
  salaryStr,
  heroBadges,
  radarData,
  radarLoading,
}: PlayerHeroBannerProps) {
  const styleMeta = radarData
    ? (STYLE_META[radarData.style] ?? {
        emoji: "⚾",
        color: "#6B7280",
        bg: "#f9fafb",
      })
    : null;

  const radarValues = radarData
    ? extractRadarValues(radarData, isPitcherPlayer)
    : null;

  return (
    <div style={{ background: bgGradient }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
          {/* ── 왼쪽: 선수 사진 + 기본정보 ── */}
          <div className="lg:col-span-2 flex items-start gap-5">
            <div className="relative flex-shrink-0">
              <div
                className="w-32 h-32 rounded-2xl overflow-hidden border-4 shadow-2xl"
                style={{ borderColor: "rgba(255,255,255,0.2)" }}
              >
                <PlayerAvatar
                  id={playerBasic.pid}
                  name={playerBasic.playerName}
                  size={128}
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-lg">
                <PlayerAvatar
                  id={playerBasic.pid}
                  name={playerBasic.playerName}
                  size={44}
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-white/50 text-sm font-medium">
                  #{playerBasic.playerNumber}
                </span>
                <span className="text-white/30 text-xs">·</span>
                <span className="text-white/60 text-sm font-medium">
                  {playerBasic.playerMPosition}
                </span>
              </div>
              <h1 className="text-3xl font-black text-white leading-tight tracking-tight">
                {playerBasic.playerName}
              </h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-white/80 text-sm font-bold">
                  {playerBasic.playerEnter}
                </span>
                <span
                  className="text-xs font-black px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: heroAccent }}
                >
                  {isPitcherPlayer ? "🔥 투수" : "🏏 타자"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/50">
                <span>{hwStr}</span>
                <span>·</span>
                <span>{ageStr}</span>
                {salaryStr !== "-" && (
                  <>
                    <span>·</span>
                    <span>연봉 {salaryStr}</span>
                  </>
                )}
              </div>
              {playerBasic.playerDraft && (
                <p className="text-xs text-white/40 mt-1">
                  입단 {playerBasic.playerDraft}
                </p>
              )}

              {/* 스탯 배지 */}
              <div className="flex gap-2 mt-4 flex-wrap">
                {heroBadges.map(({ label, val, color }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center px-3 py-1.5 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    <span className="text-white/50 text-xs font-medium">
                      {label}
                    </span>
                    <span
                      className="font-black text-base leading-tight"
                      style={{ color }}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── 오른쪽: 레이더 차트 + 플레이어 스타일 ── */}
          <div className="lg:col-span-3">
            <div
              className="rounded-2xl overflow-hidden border border-white/10 p-5"
              style={{ background: "rgba(0,0,0,0.25)" }}
            >
              {radarLoading ? (
                /* 로딩 스켈레톤 */
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                  <p className="text-white/30 text-xs">능력치 분석 중...</p>
                </div>
              ) : radarValues ? (
                <>
                  {/* 플레이어 스타일 뱃지 */}
                  {styleMeta && radarData && (
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        플레이어 스타일
                      </p>
                      <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-black"
                        style={{
                          backgroundColor: styleMeta.bg,
                          color: styleMeta.color,
                        }}
                      >
                        <span>{styleMeta.emoji}</span>
                        <span>{radarData.style}</span>
                      </div>
                    </div>
                  )}

                  {/* 레이더 차트 + 항목별 수치 */}
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <div className="w-full aspect-square max-w-[225px] mx-auto">
                      <RadarChart data={radarValues} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(radarValues).map(([k, v]) => (
                        <div
                          key={k}
                          className="rounded-xl p-2.5 border border-white/10"
                          style={{ background: "rgba(255,255,255,0.06)" }}
                        >
                          <p className="text-white/50 text-xs font-medium">
                            {k}
                          </p>
                          <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${v}%`,
                                backgroundColor: heroAccent,
                              }}
                            />
                          </div>
                          <p className="text-sm font-black mt-1 text-white">
                            {v}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* 데이터 없음 */
                <div className="flex flex-col items-center justify-center h-48 gap-2">
                  <p className="text-3xl">📊</p>
                  <p className="text-white/30 text-sm">레이더 데이터 준비 중</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
