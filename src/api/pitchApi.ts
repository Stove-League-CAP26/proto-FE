// 투수 구종 데이터 API
// GET /api/stats/pitcher/pitch/{pid}

export interface PitchArsenalItem {
  abbr: string; // "FF", "SL" 등
  name: string; // "포심 패스트볼" 등
  speed: number | null; // km/h
  usage: number | null; // %
  color: string; // 차트 색상
}

// 백엔드 PitcherPitchStatDto 구조 (플랫 객체)
interface PitcherPitchStatDto {
  pid: number;
  team: string;
  player_name: string;
  FF_speed: number | null;
  FF_usage: number | null;
  FT_speed: number | null;
  FT_usage: number | null;
  SI_speed: number | null;
  SI_usage: number | null;
  FC_speed: number | null;
  FC_usage: number | null;
  SL_speed: number | null;
  SL_usage: number | null;
  SW_speed: number | null;
  SW_usage: number | null;
  CU_speed: number | null;
  CU_usage: number | null;
  CH_speed: number | null;
  CH_usage: number | null;
  FS_speed: number | null;
  FS_usage: number | null;
}

// 구종 메타 정보
const PITCH_META: Record<string, { name: string; color: string }> = {
  FF: { name: "포심 패스트볼", color: "#EF4444" },
  FT: { name: "투심 패스트볼", color: "#F97316" },
  SI: { name: "싱커", color: "#F59E0B" },
  FC: { name: "컷 패스트볼", color: "#84CC16" },
  SL: { name: "슬라이더", color: "#3B82F6" },
  SW: { name: "스위퍼", color: "#6366F1" },
  CU: { name: "커브볼", color: "#10B981" },
  CH: { name: "체인지업", color: "#8B5CF6" },
  FS: { name: "포크볼", color: "#EC4899" },
};

/**
 * 플랫 DTO → PitchArsenalItem 배열 변환
 * usage가 null이거나 0인 구종은 제외
 */
function parseArsenal(dto: PitcherPitchStatDto): PitchArsenalItem[] {
  const abbrs = ["FF", "FT", "SI", "FC", "SL", "SW", "CU", "CH", "FS"] as const;
  return abbrs
    .map((abbr) => {
      const speed = dto[`${abbr}_speed` as keyof PitcherPitchStatDto] as
        | number
        | null;
      const usage = dto[`${abbr}_usage` as keyof PitcherPitchStatDto] as
        | number
        | null;
      const meta = PITCH_META[abbr];
      const usagePct = usage != null ? Math.round(usage * 1000) / 10 : null; // 0.457 → 45.7
      return {
        abbr,
        name: meta.name,
        color: meta.color,
        speed,
        usage: usagePct,
      };
    })
    .filter((p) => p.usage != null && p.usage > 0)
    .sort((a, b) => (b.usage ?? 0) - (a.usage ?? 0));
}

export async function fetchPitchArsenal(
  pid: number,
): Promise<PitchArsenalItem[]> {
  try {
    const res = await fetch(`/api/stats/pitcher/pitch/${pid}`);
    if (!res.ok) return [];
    const dto: PitcherPitchStatDto = await res.json();
    return parseArsenal(dto);
  } catch {
    return [];
  }
}
