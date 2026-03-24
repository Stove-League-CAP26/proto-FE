// 앱 루트 - 네비게이션 바와 페이지 라우팅만 담당
import { useState } from "react";
import PlayerProfilePage from "@/pages/PlayerProfilePage";
import BestPlayerPage from "@/pages/BestPlayerPage";
import ComparePage from "@/pages/ComparePage";
import TeamPage from "@/pages/TeamPage";

const NAV_ITEMS = [
  { id: "player", label: "선수 정보" },
  { id: "best", label: "BEST 플레이어" },
  { id: "compare", label: "선수 비교" },
  { id: "team", label: "팀 페이지" },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState("player");

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
    >
      {/* 네비게이션 바 */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center h-14 gap-1">
          <button
            onClick={() => setCurrentPage("player")}
            className="flex items-center gap-2 mr-4 flex-shrink-0"
          >
            <span className="text-xl">⚾</span>
            <span className="font-black text-gray-900 text-lg tracking-tight">
              스토브리그
            </span>
          </button>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                currentPage === item.id
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* 페이지 라우팅 */}
      {currentPage === "player" && <PlayerProfilePage />}
      {currentPage === "best" && <BestPlayerPage />}
      {currentPage === "compare" && <ComparePage />}
      {currentPage === "team" && (
        <TeamPage onSelectPlayer={() => setCurrentPage("player")} />
      )}

      {/* 푸터 */}
      <footer className="border-t border-gray-100 bg-white mt-8">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between">
          <p className="text-xs text-gray-400">
            ⚾ 스토브리그 · KBO 야구 팬 플랫폼 프로토타입
          </p>
          <p className="text-xs text-gray-300">© 2025 Stoveleague</p>
        </div>
      </footer>
    </div>
  );
}
