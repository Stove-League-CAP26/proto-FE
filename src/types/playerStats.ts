// 선수 스탯 API 응답 타입 정의

export interface HitterStat {
  pid: number;
  season: number;
  team: string;
  g: number;
  pa: number;
  ab: number;
  r: number;
  h: number;
  b2: number;
  b3: number;
  hr: number;
  rbi: number;
  tb: number;
  sac: number;
  sf: number;
  avg: number;
  hitterRank?: number;
}

export interface PitcherStat {
  pid: number;
  season: number;
  team: string;
  g: number;
  w: number;
  l: number;
  sv: number;
  hld: number;
  ip: number;
  h: number;
  hr: number;
  hbp: number;
  r: number;
  er: number;
  so: number;
  era: number;
  whip: number;
  wpct: number;
  pitcherRank?: number;
}
