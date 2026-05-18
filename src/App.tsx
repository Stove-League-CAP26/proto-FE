// src/App.tsx
import { useState } from "react";
import Navbar from "@/components/common/Navbar";
import PlayerProfilePage from "@/pages/PlayerProfilePage";
import BestPlayerPage from "@/pages/BestPlayerPage";
import ComparePage from "@/pages/ComparePage";
import TeamPage from "@/pages/TeamPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import MainPage from "@/pages/MainPage";
import AiTestPage from "@/pages/AiTestPage"; //ai 연동 테스트 페이지

type Page =
  | "main"
  | "player"
  | "best"
  | "compare"
  | "team"
  | "login"
  | "signup";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("main");
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("accessToken"),
  );

  const isAuthPage = currentPage === "login" || currentPage === "signup";

  const handleSelectPlayer = (pid: number) => {
    setSelectedPid(pid);
    setCurrentPage("player");
  };

  const goToLogin = () => {
    setCurrentPage("login");
    setDropdownOpen(false);
  };

  const goToSignup = () => {
    setCurrentPage("signup");
    setDropdownOpen(false);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentPage("main");
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    setDropdownOpen(false);
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
      onClick={() => setDropdownOpen(false)}
    >
      <Navbar
        currentPage={currentPage}
        isLoggedIn={isLoggedIn}
        dropdownOpen={dropdownOpen}
        isAuthPage={isAuthPage}
        onNavigate={setCurrentPage}
        onLogoClick={() => setCurrentPage("main")}
        onGoLogin={goToLogin}
        onGoSignup={goToSignup}
        onLogout={handleLogout}
        onDropdownToggle={() => setDropdownOpen((prev) => !prev)}
        onDropdownClose={() => setDropdownOpen(false)}
      />

      {/* 페이지 라우팅 */}
      {currentPage === "main" && (
        <MainPage onSelectPlayer={handleSelectPlayer} />
      )}
      {currentPage === "login" && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onGoSignup={goToSignup}
        />
      )}
      {currentPage === "signup" && (
        <SignupPage onSignupSuccess={goToLogin} onGoLogin={goToLogin} />
      )}
      {currentPage === "player" && (
        <PlayerProfilePage
          initialPid={selectedPid}
          onPidConsumed={() => setSelectedPid(null)}
        />
      )}
      {currentPage === "best" && <BestPlayerPage />}
      {currentPage === "compare" && <ComparePage />}
      {currentPage === "team" && (
        <TeamPage onSelectPlayer={handleSelectPlayer} />
      )}
      {currentPage === "ai-test" && <AiTestPage />}
    </div>
  );
}
