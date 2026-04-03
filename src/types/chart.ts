// src/types/chart.ts
export interface ZoneCell {
  val: string;
  step: number;
}

export interface ZoneGrid {
  outer: ZoneCell[]; // [TL, TR, BL, BR]
  inner: ZoneCell[]; // 9칸 3x3
}

export interface HitDirection {
  lf: string;
  cf: string;
  rf: string;
}

export interface HitterChart {
  hotCold: ZoneGrid;
  strikeout: ZoneGrid;
  hitDistrib: HitDirection;
}

export interface PitcherChart {
  pitchZone: ZoneGrid;
  strikeoutZone: ZoneGrid;
}

export interface PlayerChartResponse {
  pid: number;
  playerType: "hitter" | "pitcher";
  hitter: HitterChart | null;
  pitcher: PitcherChart | null;
}
