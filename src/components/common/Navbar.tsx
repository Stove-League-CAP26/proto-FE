// src/components/common/Navbar.tsx
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { KBO_TEAMS, type Team } from "@/mock/teamData";

const NAV_ITEMS = [
  { path: "/", label: "홈" },
  { path: "/player", label: "선수 정보" },
  { path: "/best", label: "BEST 플레이어" },
  { path: "/compare", label: "선수 비교" },
  { path: "/team", label: "팀 페이지" },
  { path: "/ai-test", label: "AI 테스트" }, // AI 테스트
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

const logoUrl = (id: string) => `/images/teams/${id}.png`;

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
  const navigate = useNavigate();
  const [teamDropOpen, setTeamDropOpen] = useState(false);
  const teamBtnRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 팀 드롭다운 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        teamBtnRef.current &&
        !teamBtnRef.current.contains(e.target as Node)
      ) {
        setTeamDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleTeamNavClick = () => {
    if (location.pathname === "/team") {
      // 이미 팀 페이지 → state.reset으로 랜딩 복귀
      navigate("/team", { state: { reset: true } });
    } else {
      navigate("/team");
    }
    setTeamDropOpen(false);
  };

  const handleTeamSelect = (team: Team) => {
    navigate("/team", { state: { team } });
    setTeamDropOpen(false);
  };

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

        {/* 메뉴 */}
        {!isAuthPage &&
          NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;

            // 팀 페이지 탭 — 드롭다운 포함
            if (item.path === "/team") {
              return (
                <div key={item.path} className="relative" ref={teamBtnRef}>
                  <div className="flex items-center">
                    {/* 탭 버튼 */}
                    <button
                      onClick={handleTeamNavClick}
                      className={`px-3 py-1.5 text-sm font-semibold rounded-l-lg transition-all ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      {item.label}
                    </button>

                    {/* 드롭다운 토글 화살표 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTeamDropOpen((v) => !v);
                      }}
                      className={`px-1.5 py-1.5 text-xs rounded-r-lg transition-all border-l ${
                        isActive
                          ? "bg-blue-50 text-blue-400 border-blue-100"
                          : "text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-gray-100"
                      }`}
                    >
                      {teamDropOpen ? "▲" : "▼"}
                    </button>
                  </div>

                  {/* 팀 드롭다운 */}
                  {teamDropOpen && (
                    <div
                      className="absolute left-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* 헤더 */}
                      <div className="px-3 py-2.5 border-b border-gray-50 flex items-center justify-between">
                        <p className="text-xs font-black text-gray-500">
                          ⚾ 팀 선택
                        </p>
                        <button
                          onClick={handleTeamNavClick}
                          className="text-[10px] text-blue-500 font-bold hover:underline"
                        >
                          전체 보기
                        </button>
                      </div>

                      {/* 팀 목록 */}
                      <div className="py-1 max-h-72 overflow-y-auto">
                        {KBO_TEAMS.map((team) => (
                          <button
                            key={team.id}
                            onClick={() => handleTeamSelect(team)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                          >
                            {/* 팀 로고 */}
                            <div
                              className="w-7 h-7 rounded-full overflow-hidden border flex-shrink-0 flex items-center justify-center bg-white"
                              style={{
                                borderColor: `${team.colors.primary}40`,
                              }}
                            >
                              <img
                                src={logoUrl(team.id)}
                                alt={team.shortName}
                                className="w-5 h-5 object-contain"
                                onError={(e) => {
                                  const el = e.currentTarget;
                                  el.style.display = "none";
                                  const p = el.parentElement;
                                  if (p) {
                                    p.style.background = team.colors.primary;
                                    p.innerHTML = `<span style="font-size:8px;font-weight:900;color:${team.colors.text}">${team.shortName.slice(0, 2)}</span>`;
                                  }
                                }}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 truncate">
                                {team.name}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {team.city}
                              </p>
                            </div>

                            {/* 팀 컬러 인디케이터 */}
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: team.colors.primary }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // 일반 탭
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </button>
            );
          })}

        {/* 우측 프로필 */}
        {/* <div className="ml-auto relative" onClick={(e) => e.stopPropagation()}>
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
        </div> */}
      </div>
    </nav>
  );
}
