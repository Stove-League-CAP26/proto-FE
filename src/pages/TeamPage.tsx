// src/pages/TeamPage.tsx
import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TeamLanding from "@/components/team/TeamLanding";
import TeamDetail from "@/components/team/TeamDetail";
import type { Team } from "@/mock/teamData";

interface TeamPageProps {
  onTeamChange?: (team: Team | null) => void; // Navbar 드롭다운용
}

export default function TeamPage({ onTeamChange }: TeamPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Navbar에서 /team 클릭 시 → location.state.reset = true로 랜딩 복귀
  useEffect(() => {
    if ((location.state as any)?.reset) {
      setSelectedTeam(null);
      onTeamChange?.(null);
      // state 초기화
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  // Navbar 드롭다운에서 팀 직접 선택 시
  useEffect(() => {
    const selected = (location.state as any)?.team as Team | undefined;
    if (selected) {
      setSelectedTeam(selected);
      onTeamChange?.(selected);
      window.history.replaceState({}, "");
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
