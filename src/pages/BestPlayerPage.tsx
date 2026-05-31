// BEST 플레이어 페이지 - 타자/투수 토글로 WAR 1위 히어로 카드, 전체 순위 리스트,
// 부문별 카드 그리드를 표시
// ✅ 백엔드 API 연동 완료 (MOCK 제거)
// ✅ 2026 시즌 기본값 + 진행률 비례 규정이닝/타석 안내 추가
// ✅ 더보기 모달 + 선수 클릭 라우팅 추가
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import WARHeroCard from "@/components/best/WARHeroCard";
import WARRankList from "@/components/best/WARRankList";
import CategoryCard from "@/components/best/CategoryCard";
import PlayerAvatar from "@/components/common/PlayerAvatar";
import { fetchHitterBest, fetchPitcherBest } from "@/api/playerApi";
import type {
  HitterBestResponse,
  PitcherBestResponse,
  BestRankItem,
} from "@/api/playerApi";

// ── 카테고리 정의 ─────────────────────────────────────────────
const HITTER_CATS = [
  { label: "타율", icon: "", key: "AVG", color: "#3B82F6" },
  { label: "홈런", icon: "", key: "HR", color: "#EF4444" },
  { label: "타점", icon: "", key: "RBI", color: "#F59E0B" },
  { label: "안타", icon: "", key: "H", color: "#10B981" },
  { label: "루타", icon: "", key: "TB", color: "#8B5CF6" },
];

const PITCHER_CATS = [
  { label: "평균자책점", icon: "", key: "ERA", color: "#3B82F6" },
  { label: "승리", icon: "", key: "WIN", color: "#EF4444" },
  { label: "탈삼진", icon: "", key: "KK", color: "#F59E0B" },
  { label: "세이브", icon: "", key: "SAVE", color: "#10B981" },
  { label: "WHIP", icon: "", key: "WHIP", color: "#8B5CF6" },
];

// ── 시즌 목록 ─────────────────────────────────────────────────
const SEASONS = [2026, 2025, 2024] as const;
type SeasonType = (typeof SEASONS)[number];
const CURRENT_YEAR = new Date().getFullYear() as SeasonType;

// ── 모달용 선수 타입 ──────────────────────────────────────────
interface ModalPlayer {
  id: number;
  name: string;
  team: string;
  val: string;
  rank: number;
}

interface ModalState {
  label: string;
  color: string;
  players: ModalPlayer[];
  loading: boolean;
}

// ── val 포맷 ─────────────────────────────────────────────────
function formatVal(key: string, val: number): string {
  switch (key) {
    case "AVG":
      return val.toFixed(3);
    case "ERA":
      return val.toFixed(2);
    case "WHIP":
      return val.toFixed(2);
    case "HR":
      return `${Math.round(val)}홈런`;
    case "RBI":
      return `${Math.round(val)}타점`;
    case "H":
      return `${Math.round(val)}안타`;
    case "TB":
      return `${Math.round(val)}루타`;
    case "WIN":
      return `${Math.round(val)}승`;
    case "KK":
      return `${Math.round(val)}K`;
    case "SAVE":
      return `${Math.round(val)}세이브`;
    default:
      return String(val);
  }
}

function toCardPlayers(items: BestRankItem[], key: string): ModalPlayer[] {
  return items.map((item) => ({
    id: item.pid,
    name: item.name,
    team: item.team,
    rank: item.rank,
    val: formatVal(key, item.val),
  }));
}

// ── 로딩 스켈레톤 ─────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 h-56 bg-gray-200 rounded-3xl animate-pulse" />
        <div className="lg:col-span-2 h-56 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function ErrorView({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-400 text-sm mb-4">
        데이터를 불러오지 못했습니다.
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-500 text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-colors"
      >
        다시 시도
      </button>
    </div>
  );
}

function SeasonProgressBadge({ season }: { season: SeasonType }) {
  if (season !== CURRENT_YEAR) return null;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
        ⏳ 시즌 진행 중
      </span>
      <span className="text-xs text-gray-400">
        규정이닝 · 규정타석 기준을 현재 시즌 진행률에 맞게 완화 적용 중
      </span>
    </div>
  );
}

// ── 전체 순위 모달 ────────────────────────────────────────────
function RankingModal({
  modal,
  onClose,
  onPlayerClick,
}: {
  modal: ModalState;
  onClose: () => void;
  onPlayerClick: (pid: number) => void;
}) {
  const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
        style={{ maxHeight: "80vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div
          className="px-5 py-4 flex items-center justify-between border-b-2"
          style={{ borderColor: modal.color }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-6 rounded-full"
              style={{ backgroundColor: modal.color }}
            />
            <h2 className="font-black text-gray-900">
              {modal.label} 전체 순위
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* 모달 바디 */}
        <div className="overflow-y-auto flex-1">
          {modal.loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-7 h-7 border-2 border-gray-200 border-t-blue-400 rounded-full animate-spin" />
              <p className="text-xs text-gray-400">순위 불러오는 중...</p>
            </div>
          ) : modal.players.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-gray-300">데이터가 없습니다</p>
            </div>
          ) : (
            <div>
              {modal.players.map((p) => (
                <div
                  key={p.rank}
                  className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    onPlayerClick(p.id);
                    onClose();
                  }}
                >
                  {/* 순위 */}
                  <span className="text-xl w-8 text-center flex-shrink-0">
                    {medals[p.rank] ?? (
                      <span className="text-sm font-bold text-gray-400">
                        {p.rank}
                      </span>
                    )}
                  </span>

                  {/* 아바타 */}
                  <div
                    className="w-11 h-11 rounded-full overflow-hidden border-2 flex-shrink-0"
                    style={{
                      borderColor: p.rank <= 3 ? modal.color : "#e5e7eb",
                    }}
                  >
                    <PlayerAvatar id={p.id} name={p.name} size={44} />
                  </div>

                  {/* 이름 + 팀 */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold truncate"
                      style={{
                        color: p.rank === 1 ? modal.color : "#374151",
                        fontSize: p.rank === 1 ? "15px" : "14px",
                      }}
                    >
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-400">{p.team}</p>
                  </div>

                  {/* 수치 */}
                  <span
                    className="font-black flex-shrink-0"
                    style={{
                      color: p.rank === 1 ? modal.color : "#6b7280",
                      fontSize: p.rank === 1 ? "16px" : "14px",
                    }}
                  >
                    {p.val}
                  </span>

                  {/* 이동 화살표 */}
                  <span className="text-gray-300 text-xs flex-shrink-0">›</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 모달 푸터 */}
        {!modal.loading && modal.players.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-[11px] text-gray-400 text-center">
              선수를 클릭하면 프로필 페이지로 이동합니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function BestPlayerPage() {
  const navigate = useNavigate();

  const [playerType, setPlayerType] = useState<"hitter" | "pitcher">("hitter");
  const [season, setSeason] = useState<SeasonType>(CURRENT_YEAR);
  const [hitterData, setHitterData] = useState<HitterBestResponse | null>(null);
  const [pitcherData, setPitcherData] = useState<PitcherBestResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modal, setModal] = useState<ModalState | null>(null);

  const loadData = async (targetSeason: SeasonType) => {
    setLoading(true);
    setError(false);
    setHitterData(null);
    setPitcherData(null);
    try {
      const [hitter, pitcher] = await Promise.all([
        fetchHitterBest(targetSeason),
        fetchPitcherBest(targetSeason),
      ]);
      if (!hitter || !pitcher) {
        setError(true);
      } else {
        setHitterData(hitter);
        setPitcherData(pitcher);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(season);
  }, [season]);

  // 선수 프로필 라우팅
  const handlePlayerClick = useCallback(
    (pid: number) => {
      navigate("/player", { state: { pid } });
    },
    [navigate],
  );

  // 더보기 → 전체 순위 모달
  const handleMoreClick = useCallback(
    async (cat: { label: string; key: string; color: string }) => {
      setModal({
        label: cat.label,
        color: cat.color,
        players: [],
        loading: true,
      });

      try {
        const type = playerType === "hitter" ? "hitter" : "pitcher";
        const res = await fetch(
          `/api/ranking/${type}/${cat.key}?season=${season}`,
        );
        if (!res.ok) throw new Error("조회 실패");
        const data = await res.json();
        setModal({
          label: cat.label,
          color: cat.color,
          players: toCardPlayers(data.players ?? [], cat.key),
          loading: false,
        });
      } catch {
        setModal({
          label: cat.label,
          color: cat.color,
          players: [],
          loading: false,
        });
      }
    },
    [playerType, season],
  );

  if (loading) return <LoadingSkeleton />;
  if (error || !hitterData || !pitcherData)
    return <ErrorView onRetry={() => loadData(season)} />;

  const isHitter = playerType === "hitter";
  const typeLabel = isHitter ? "타자" : "투수";
  const categories = isHitter ? HITTER_CATS : PITCHER_CATS;
  const isCurrentSeason = season === CURRENT_YEAR;

  const activeData = isHitter
    ? (hitterData as Record<string, any>)
    : (pitcherData as Record<string, any>);

  const heroKey = isHitter ? "AVG" : "ERA";
  const heroItems = toCardPlayers(activeData[heroKey] ?? [], heroKey);

  const seasonSubtitle = isCurrentSeason
    ? `${season} KBO 리그 시즌 진행 중 · 현재 기준 상위권`
    : `${season} KBO 리그 시즌 최종 기록`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* 전체 순위 모달 */}
      {modal && (
        <RankingModal
          modal={modal}
          onClose={() => setModal(null)}
          onPlayerClick={handlePlayerClick}
        />
      )}

      {/* 헤더 + 컨트롤 */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-gray-900">BEST 플레이어</h1>
          <p className="text-sm text-gray-400">{seasonSubtitle}</p>
          <SeasonProgressBadge season={season} />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* 시즌 토글 */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1">
            {SEASONS.map((s) => (
              <button
                key={s}
                onClick={() => setSeason(s)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all relative"
                style={
                  season === s
                    ? {
                        background: "white",
                        color: "#111827",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      }
                    : { color: "#9ca3af" }
                }
              >
                {s}
                {s === CURRENT_YEAR && (
                  <span
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400"
                    title="진행 중인 시즌"
                  />
                )}
              </button>
            ))}
          </div>

          {/* 타자/투수 토글 */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1">
            {[
              { id: "hitter", label: "타자" },
              { id: "pitcher", label: "투수" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setPlayerType(t.id as "hitter" | "pitcher")}
                className="px-7 py-2.5 rounded-xl text-sm font-black transition-all"
                style={
                  playerType === t.id
                    ? {
                        background: "white",
                        color: "#111827",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      }
                    : { color: "#9ca3af" }
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 히어로 섹션 */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-7 rounded-full bg-amber-400" />
          <h2 className="text-lg font-black text-gray-900">
            {isHitter ? "타율" : "평균자책점"} 1위
          </h2>
          <span className="text-xs bg-amber-50 text-amber-600 font-bold px-2.5 py-1 rounded-full border border-amber-200">
            {isHitter ? "타율" : "ERA"} 순위
          </span>
          {isCurrentSeason && (
            <span className="text-xs text-gray-400 ml-1">
              · 규정{isHitter ? "타석" : "이닝"} 완화 기준 적용
            </span>
          )}
        </div>
        <div
          className="grid grid-cols-1 lg:grid-cols-5 gap-4"
          style={{ minHeight: 240 }}
        >
          <div className="lg:col-span-3">
            {heroItems[0] && (
              <div
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handlePlayerClick(heroItems[0].id)}
              >
                <WARHeroCard player={heroItems[0]} typeLabel={typeLabel} />
              </div>
            )}
          </div>
          <div className="lg:col-span-2">
            <WARRankList
              players={heroItems}
              onPlayerClick={handlePlayerClick}
            />
          </div>
        </div>
      </section>

      {/* 구분선 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest px-2">
          부문별 순위
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* 부문별 카드 그리드 */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const items = toCardPlayers(activeData[cat.key] ?? [], cat.key);
            if (items.length === 0) return null;
            return (
              <CategoryCard
                key={cat.key}
                label={cat.label}
                icon={cat.icon}
                players={items}
                accentColor={cat.color}
                onMoreClick={() => handleMoreClick(cat)}
                onPlayerClick={handlePlayerClick}
              />
            );
          })}
        </div>
      </section>

      {/* 시즌 진행 중 안내 */}
      {isCurrentSeason && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg flex-shrink-0">ℹ️</span>
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-800">
                {season} 시즌 진행 중 · 규정 기준 안내
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                현재 시즌이 진행 중이어서 정규 규정이닝(144이닝) ·
                규정타석(446타석)을 충족하는 선수가 없을 수 있습니다. 이를
                보완하기 위해 현재 시즌 진행률에 비례한 완화 기준을 적용하고
                있습니다. 시즌이 종료되면 정규 기준으로 전환됩니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
