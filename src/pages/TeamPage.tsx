// src/pages/TeamPage.tsx
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TeamLanding from "@/components/team/TeamLanding";
import TeamDetail from "@/components/team/TeamDetail";
import type { Team } from "@/mock/teamData";

export default function TeamPage() {
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const handleSelect = useCallback((t: Team) => setSelectedTeam(t), []);
  const handleBack = useCallback(() => setSelectedTeam(null), []);

  // 선수 클릭 시 pid를 state로 전달하며 /player로 이동
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
