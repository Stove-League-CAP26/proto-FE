// src/components/common/Navbar.tsx
import { useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/", label: "홈" },
  { path: "/player", label: "선수 정보" },
  { path: "/best", label: "BEST 플레이어" },
  { path: "/compare", label: "선수 비교" },
  { path: "/team", label: "팀 페이지" },
];

interface NavbarProps {
  isLoggedIn: boolean;
  dropdownOpen: boolean;
  isAuthPage: boolean;
  onLogoClick: () => void;
  onNavigate: (path: string) => void;
  onGoLogin: () => void;
  onGoSignup: () => void;
  onLogout: () => void;
  onDropdownToggle: () => void;
  onLoginStateChange: (v: boolean) => void;
}

export default function Navbar({
  isLoggedIn,
  dropdownOpen,
  isAuthPage,
  onLogoClick,
  onNavigate,
  onGoLogin,
  onGoSignup,
  onLogout,
  onDropdownToggle,
}: NavbarProps) {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center h-14 gap-1">
        {/* 로고 */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 mr-4 flex-shrink-0"
        >
          <span className="text-xl">⚾</span>
          <span className="font-black text-gray-900 text-lg tracking-tight">
            스토브리그
          </span>
        </button>

        {/* 메뉴 - 인증 페이지에서는 숨김 */}
        {!isAuthPage &&
          NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                location.pathname === item.path
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </button>
          ))}

        {/* 우측 프로필 */}
        <div className="ml-auto relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onDropdownToggle}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors border border-gray-200"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              {isLoggedIn ? (
                <>
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-xs text-gray-400">로그인됨</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-base">🚪</span>
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-xs font-bold text-gray-500">
                      ⚾ 스토브리그
                    </p>
                  </div>
                  <button
                    onClick={onGoLogin}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-base">🔑</span>
                    로그인
                  </button>
                  <button
                    onClick={onGoSignup}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-50"
                  >
                    <span className="text-base">✏️</span>
                    회원가입
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
