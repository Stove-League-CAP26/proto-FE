// src/api/teamStatsApi.ts
const BASE_URL = "http://localhost:8080/api";

export interface TeamRadar {
  ERA:  number;
  WHIP: number;
  수비: number;
  도루: number;
  OPS:  number;
  타율: number;
}

export interface TeamStats {
  season:     number;
  teamName:   string;
  // 공격
  ops:        number;
  avg:        number;
  sb:         number;
  runs:       number;
  hr:         number;
  obp:        number;
  // 투수/수비
  era:        number;
  whip:       number;
  errorCount: number;
  strikeout:  number;
  qs:         number;
  // 레이더
  radar:      TeamRadar;
}

const TEAM_ID_TO_DB: Record<string, string> = {
  lg:"LG", samsung:"삼성", lotte:"롯데", hanwha:"한화", doosan:"두산",
  nc:"NC", kia:"KIA", ssg:"SSG", kt:"KT", kiwoom:"키움",
};

export async function fetchTeamStats(teamId: string, season = 2025): Promise<TeamStats | null> {
  const dbName = TEAM_ID_TO_DB[teamId];
  if (!dbName) return null;
  const res = await fetch(`${BASE_URL}/teams/${encodeURIComponent(dbName)}/stats?season=${season}`);
  if (!res.ok) return null;
  return res.json();
}
