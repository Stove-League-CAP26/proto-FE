// src/components/common/Layout.tsx
import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("accessToken"),
  );

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    setDropdownOpen(false);
  };

  // LoginPage에서 로그인 성공 시 호출 — Layout이 isLoggedIn 상태를 관리하므로
  // LoginPage는 이 함수를 context 없이 받을 수 없음
  // → LoginPage 자체에서 localStorage 저장 후 navigate('/') 처리
  // → Layout은 pathname 변경 시 localStorage 재확인
  // 단순하게: Navbar에 로그인 상태 전달하고, 로그인/로그아웃 시 setIsLoggedIn 호출

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
      onClick={() => setDropdownOpen(false)}
    >
      <Navbar
        isLoggedIn={isLoggedIn}
        dropdownOpen={dropdownOpen}
        isAuthPage={isAuthPage}
        onLogoClick={() => navigate("/")}
        onNavigate={(path) => navigate(path)}
        onGoLogin={() => {
          navigate("/login");
          setDropdownOpen(false);
        }}
        onGoSignup={() => {
          navigate("/signup");
          setDropdownOpen(false);
        }}
        onLogout={handleLogout}
        onDropdownToggle={() => setDropdownOpen((prev) => !prev)}
        onLoginStateChange={setIsLoggedIn}
      />

      <Outlet />

      {!isAuthPage && (
        <footer className="border-t border-gray-100 bg-white mt-8">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between">
            <p className="text-xs text-gray-400">
              ⚾ 스토브리그 · KBO 야구 팬 플랫폼 프로토타입
            </p>
            <p className="text-xs text-gray-300">© 2025 Stoveleague</p>
          </div>
        </footer>
      )}
    </div>
  );
}
