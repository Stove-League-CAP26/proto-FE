// src/pages/TeamPage.tsx
import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TeamLanding from "@/components/team/TeamLanding";
import TeamDetail from "@/components/team/TeamDetail";
import { KBO_TEAMS, type Team } from "@/mock/teamData";

interface TeamPageProps {
  onTeamChange?: (team: Team | null) => void;
}

export default function TeamPage({ onTeamChange }: TeamPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  useEffect(() => {
    const state = location.state as any;
    if (!state) return;

    // 랜딩 복귀
    if (state.reset) {
      setSelectedTeam(null);
      onTeamChange?.(null);
      window.history.replaceState({}, "");
      return;
    }

    // Navbar 드롭다운에서 Team 객체 직접 전달
    if (state.team) {
      setSelectedTeam(state.team as Team);
      onTeamChange?.(state.team as Team);
      window.history.replaceState({}, "");
      return;
    }

    // 메인 페이지 순위표 클릭 — teamId 문자열로 전달
    if (state.teamId) {
      const found = KBO_TEAMS.find((t) => t.id === state.teamId) ?? null;
      if (found) {
        setSelectedTeam(found);
        onTeamChange?.(found);
      }
      window.history.replaceState({}, "");
      return;
    }
  }, [location.state]);

  const handleSelect = useCallback(
    (t: Team) => {
      setSelectedTeam(t);
      onTeamChange?.(t);
    },
    [onTeamChange],
  );

  const handleBack = useCallback(() => {
    setSelectedTeam(null);
    onTeamChange?.(null);
  }, [onTeamChange]);

  const handleSelectPlayer = useCallback(
    (pid: number) => {
      navigate("/player", { state: { pid } });
    },
    [navigate],
  );

  return selectedTeam ? (
    <TeamDetail
      team={selectedTeam}
      onBack={handleBack}
      onSelectPlayer={handleSelectPlayer}
    />
  ) : (
    <TeamLanding onSelect={handleSelect} />
  );
}
