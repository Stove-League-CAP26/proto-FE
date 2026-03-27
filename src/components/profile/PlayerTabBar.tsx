// 선수 프로필 탭 바 - 탭 목록 + 연도 토글
// sticky 포지션으로 스크롤 시에도 상단에 고정

interface Tab {
  id: string;
  label: string;
}

interface PlayerTabBarProps {
  tabs: Tab[];
  activeTab: string;
  heroAccent: string;
  onTabChange: (id: string) => void;
}

export default function PlayerTabBar({
  tabs,
  activeTab,
  heroAccent,
  onTabChange,
}: PlayerTabBarProps) {
  return (
    <div className="bg-white border-b border-gray-100 sticky top-14 z-30">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.id ? "" : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
              style={
                activeTab === tab.id
                  ? { borderBottomColor: heroAccent, color: heroAccent }
                  : {}
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* 연도 토글 (현재는 UI만) */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {["2023", "2024", "2025"].map((yr, i) => (
            <button
              key={yr}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                i === 2 ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
