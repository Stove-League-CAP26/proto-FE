// src/components/profile/PlayerHeroBanner.tsx
// 프로필 사진: rounded-full (원형) 적용, 사이즈 조정
// 이모티콘 제거
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
              {/* 프로필 사진: rounded-full(원형), 140×140 */}
              <div
                className="overflow-hidden border-4 shadow-2xl"
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: "50%",
                  borderColor: "rgba(255,255,255,0.25)",
                }}
              >
                <PlayerAvatar
                  id={playerBasic.pid}
                  name={playerBasic.playerName}
                  size={140}
                />
              </div>
              {/* 등번호 뱃지 */}
              <div
                className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                style={{ backgroundColor: heroAccent }}
              >
                <span className="text-white font-black text-xs leading-none">
                  #{playerBasic.playerNumber}
                </span>
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
                  {isPitcherPlayer ? "투수" : "타자"}
                </span>
                {playerBasic.retired && (
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/20">
                    은퇴
                  </span>
                )}
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

          {/* ── 오른쪽: 레이더 차트 + 항목별 수치 ── */}
          <div className="lg:col-span-3">
            <div
              className="rounded-2xl overflow-hidden border border-white/10 p-5"
              style={{ background: "rgba(0,0,0,0.25)" }}
            >
              {radarLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                  <p className="text-white/30 text-xs">능력치 분석 중...</p>
                </div>
              ) : radarValues ? (
                <>
                  <p className="text-[10px] text-white/30 text-right mb-3">
                    2025 KBO 리그 기준
                  </p>
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <div className="w-full aspect-square max-w-[225px] mx-auto">
                      <RadarChart data={radarValues} accentColor={heroAccent} />
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
                <div className="flex flex-col items-center justify-center h-48 gap-2">
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
