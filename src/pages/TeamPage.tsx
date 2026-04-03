/**
 * src/pages/TeamPage.tsx
 * KBO 팀 페이지 — props 기반 네비게이션 (react-router-dom 미사용)
 *
 * 선수 클릭 플로우:
 *   TeamPage → TeamDetail → RosterTab → RosterSection → PlayerCard
 *   → onSelectPlayer(pid) 호출 → App 레벨에서 PlayerProfilePage({ initialPid: pid }) 렌더링
 */
import { useState, useCallback } from "react";
import TeamLanding from "@/components/team/TeamLanding";
import TeamDetail from "@/components/team/TeamDetail";
import type { Team } from "@/mock/teamData";

export default function TeamPage({
  onSelectPlayer,
}: {
  onSelectPlayer: (pid: number) => void;
}) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const handleSelect = useCallback((t: Team) => setSelectedTeam(t), []);
  const handleBack = useCallback(() => setSelectedTeam(null), []);

  return selectedTeam ? (
    <TeamDetail
      team={selectedTeam}
      onBack={handleBack}
      onSelectPlayer={onSelectPlayer}
    />
  ) : (
    <TeamLanding onSelect={handleSelect} />
  );
}
