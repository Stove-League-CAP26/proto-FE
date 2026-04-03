export interface TeamRosterPlayer {
  pid: number;
  playerName: string;
  playerNumber: number | null;
  playerMPosition: string;
  team: string;
  playerType: "pitcher" | "hitter";
  season: number;
}

export async function fetchTeamRoster(
  teamName: string,
  season: number = 2025,
): Promise<TeamRosterPlayer[] | null> {
  try {
    const res = await fetch(
      `/api/teams/roster/${encodeURIComponent(teamName)}?season=${season}`,
    );
    if (res.status === 204) return null;
    if (!res.ok) return null;
    return (await res.json()) as TeamRosterPlayer[];
  } catch {
    return null;
  }
}
