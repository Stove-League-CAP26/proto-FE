// BEST 플레이어 페이지 - 타자/투수 토글로 WAR 1위 히어로 카드, 전체 순위 리스트,
// 부문별(타율/홈런 등) 카드 그리드를 표시
import { useState } from "react";
import WARHeroCard from "@/components/best/WARHeroCard";
import WARRankList from "@/components/best/WARRankList";
import CategoryCard from "@/components/best/CategoryCard";
import { MOCK_BEST } from "@/mock/bestData";

const HITTER_CATS = [
  { label: "타율", icon: "🏏", key: "AVG", color: "#3B82F6" },
  { label: "홈런", icon: "💥", key: "HR",  color: "#EF4444" },
  { label: "타점", icon: "🎯", key: "RBI", color: "#F59E0B" },
  { label: "도루", icon: "💨", key: "SB",  color: "#10B981" },
  { label: "OPS",  icon: "📈", key: "OPS", color: "#8B5CF6" },
];

const PITCHER_CATS = [
  { label: "평균자책점", icon: "🛡️", key: "ERA",  color: "#3B82F6" },
  { label: "승리",      icon: "🏆", key: "WIN",  color: "#EF4444" },
  { label: "탈삼진",    icon: "🔥", key: "KK",   color: "#F59E0B" },
  { label: "세이브",    icon: "🔒", key: "SAVE", color: "#10B981" },
  { label: "구속",      icon: "⚡", key: "SPD",  color: "#8B5CF6" },
];

export default function BestPlayerPage() {
  const [playerType, setPlayerType] = useState<"hitter" | "pitcher">("hitter");
  const data = MOCK_BEST[playerType];
  const typeLabel = playerType === "hitter" ? "타자" : "투수";
  const categories = playerType === "hitter" ? HITTER_CATS : PITCHER_CATS;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* 헤더 + 타자/투수 토글 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">BEST 플레이어</h1>
          <p className="text-sm text-gray-400 mt-0.5">2025 KBO 리그 시즌 기준</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1">
          {[{ id: "hitter", label: "타자" }, { id: "pitcher", label: "투수" }].map((t) => (
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

      {/* WAR 섹션 */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-7 rounded-full bg-amber-400" />
          <h2 className="text-lg font-black text-gray-900">종합 지표 WAR</h2>
          <span className="text-xs bg-amber-50 text-amber-600 font-bold px-2.5 py-1 rounded-full border border-amber-200">
            👑 종합 순위
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{ minHeight: 240 }}>
          <div className="lg:col-span-3">
            <WARHeroCard player={data.WAR[0]} typeLabel={typeLabel} />
          </div>
          <div className="lg:col-span-2">
            <WARRankList players={data.WAR} />
          </div>
        </div>
      </section>

      {/* 구분선 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest px-2">부문별 순위</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* 부문별 카드 그리드 */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.key}
              label={cat.label}
              icon={cat.icon}
              players={data[cat.key as keyof typeof data] as any}
              accentColor={cat.color}
            />
          ))}
        </div>
      </section>
    </div>
  );
}