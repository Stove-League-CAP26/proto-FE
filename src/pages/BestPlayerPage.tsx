// BEST 플레이어 페이지 - 타자/투수 토글로 WAR 1위 히어로 카드, 전체 순위 리스트,
// 부문별 카드 그리드를 표시
// ✅ 백엔드 API 연동 완료 (MOCK 제거)
import { useState, useEffect } from "react";
import WARHeroCard from "@/components/best/WARHeroCard";
import WARRankList from "@/components/best/WARRankList";
import CategoryCard from "@/components/best/CategoryCard";
import { fetchHitterBest, fetchPitcherBest } from "@/api/playerApi";
import type {
  HitterBestResponse,
  PitcherBestResponse,
  BestRankItem,
} from "@/api/playerApi";

// ── 카테고리 정의 ─────────────────────────────────────────────
// 백엔드 응답 키와 정확히 일치해야 함
const HITTER_CATS = [
  { label: "타율", icon: "🏏", key: "AVG", color: "#3B82F6" },
  { label: "홈런", icon: "💥", key: "HR", color: "#EF4444" },
  { label: "타점", icon: "🎯", key: "RBI", color: "#F59E0B" },
  { label: "안타", icon: "🎯", key: "H", color: "#10B981" },
  { label: "루타", icon: "📈", key: "TB", color: "#8B5CF6" },
];

const PITCHER_CATS = [
  { label: "평균자책점", icon: "🛡️", key: "ERA", color: "#3B82F6" },
  { label: "승리", icon: "🏆", key: "WIN", color: "#EF4444" },
  { label: "탈삼진", icon: "🔥", key: "KK", color: "#F59E0B" },
  { label: "세이브", icon: "🔒", key: "SAVE", color: "#10B981" },
  { label: "WHIP", icon: "⚡", key: "WHIP", color: "#8B5CF6" },
];

// ── val 숫자 → 표시용 문자열 포맷 ────────────────────────────
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

// BestRankItem(pid, val: number) → 하위 컴포넌트가 기대하는 형태로 변환
function toCardPlayers(items: BestRankItem[], key: string) {
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
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
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

// ── 에러 UI ──────────────────────────────────────────────────
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

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function BestPlayerPage() {
  const [playerType, setPlayerType] = useState<"hitter" | "pitcher">("hitter");
  const [hitterData, setHitterData] = useState<HitterBestResponse | null>(null);
  const [pitcherData, setPitcherData] = useState<PitcherBestResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [hitter, pitcher] = await Promise.all([
        fetchHitterBest(2025),
        fetchPitcherBest(2025),
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
    loadData();
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error || !hitterData || !pitcherData)
    return <ErrorView onRetry={loadData} />;

  // 현재 선택된 타입 데이터
  const isHitter = playerType === "hitter";
  const typeLabel = isHitter ? "타자" : "투수";
  const categories = isHitter ? HITTER_CATS : PITCHER_CATS;

  // 타입별 데이터 접근
  const activeData = isHitter
    ? (hitterData as Record<string, any>)
    : (pitcherData as Record<string, any>);

  // WAR이 없으므로 첫 번째 카테고리(타율/ERA)를 히어로 카드에 사용
  const heroKey = isHitter ? "AVG" : "ERA";
  const heroItems = toCardPlayers(activeData[heroKey] ?? [], heroKey);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* 헤더 + 타자/투수 토글 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">BEST 플레이어</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            2025 KBO 리그 시즌 기준
          </p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1">
          {[
            { id: "hitter", label: "타자" },
            { id: "pitcher", label: "투수" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setPlayerType(t.id as "hitter" | "pitcher")}
              className={`px-7 py-2.5 rounded-xl text-sm font-black transition-all ${
                playerType === t.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 히어로 섹션 - 타자: 타율 1위 / 투수: ERA 1위 */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-7 rounded-full bg-amber-400" />
          <h2 className="text-lg font-black text-gray-900">
            {isHitter ? "타율" : "평균자책점"} 1위
          </h2>
          <span className="text-xs bg-amber-50 text-amber-600 font-bold px-2.5 py-1 rounded-full border border-amber-200">
            👑 {isHitter ? "타율" : "ERA"} 순위
          </span>
        </div>
        <div
          className="grid grid-cols-1 lg:grid-cols-5 gap-4"
          style={{ minHeight: 240 }}
        >
          <div className="lg:col-span-3">
            {heroItems[0] && (
              <WARHeroCard player={heroItems[0]} typeLabel={typeLabel} />
            )}
          </div>
          <div className="lg:col-span-2">
            <WARRankList players={heroItems} />
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
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
