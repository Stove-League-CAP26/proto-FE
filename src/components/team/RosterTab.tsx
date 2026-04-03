// 로스터 탭 — API 우선, 실패 시 mock fallback
// pitcher_stats2 + hitter_stats2 → /api/teams/{teamName}/roster?season=YYYY
// 선수 클릭 → onSelectPlayer(pid) → App 레벨에서 PlayerProfilePage 렌더링
import { useState, useEffect } from "react";
import RosterSection from "@/components/team/RosterSection";
import { fetchTeamRoster, type TeamRosterPlayer } from "@/api/teamApi";
import {
  getTeamRoster,
  groupByPosition,
  type RosterPlayer,
  type PositionGroup,
} from "@/mock/teamRoster";
import type { Team } from "@/mock/teamData";

interface RosterTabProps {
  team: Team;
  onSelectPlayer: (pid: number) => void;
}

const SECTION_ORDER: PositionGroup[] = ["투수", "포수", "내야수", "외야수"];

function cleanPosition(pos: string, type: "pitcher" | "hitter"): string {
  if (type === "pitcher") return "P";
  if (pos.includes("포수")) return "C";
  if (pos.includes("유격") || pos.includes("SS")) return "SS";
  if (pos.includes("1루") || pos.includes("1B")) return "1B";
  if (pos.includes("2루") || pos.includes("2B")) return "2B";
  if (pos.includes("3루") || pos.includes("3B")) return "3B";
  if (pos.includes("좌익") || pos.includes("LF")) return "LF";
  if (pos.includes("중견") || pos.includes("CF")) return "CF";
  if (pos.includes("우익") || pos.includes("RF")) return "RF";
  if (pos.includes("지명") || pos.includes("DH")) return "DH";
  return pos.split("(")[0]; // 괄호 앞부분만 추출
}
function toRosterPlayer(p: TeamRosterPlayer): RosterPlayer {
  const positionGroup = resolveGroup(p.playerMPosition ?? "", p.playerType);
  return {
    pid: p.pid,
    name: p.playerName,
    number: p.playerNumber ?? 0,
    position: cleanPosition(p.playerMPosition ?? "", p.playerType), // ← 수정
    positionGroup,
    bats: "R",
    throws: "R",
  };
}

// playerMPosition 값으로 포지션 그룹 결정
function resolveGroup(pos: string, type: "pitcher" | "hitter"): PositionGroup {
  if (type === "pitcher") return "투수";
  const upper = pos.toUpperCase();
  if (upper.includes("포수") || upper === "C") return "포수";
  if (
    ["1B", "2B", "3B", "SS", "유격", "1루", "2루", "3루", "내야"].some((k) =>
      upper.includes(k),
    )
  )
    return "내야수";
  return "외야수";
}

function groupApiRoster(
  players: TeamRosterPlayer[],
): Record<PositionGroup, RosterPlayer[]> {
  const groups: Record<PositionGroup, RosterPlayer[]> = {
    투수: [],
    포수: [],
    내야수: [],
    외야수: [],
  };
  players.forEach((p) => {
    const group = resolveGroup(p.playerMPosition ?? "", p.playerType);
    groups[group].push(toRosterPlayer(p));
  });
  return groups;
}

export default function RosterTab({ team, onSelectPlayer }: RosterTabProps) {
  const [season, setSeason] = useState<2024 | 2025>(2025);
  const [apiPlayers, setApiPlayers] = useState<TeamRosterPlayer[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [usingMock, setUsingMock] = useState(false);

  // teamData.ts의 team.name → DB team 컬럼값 매핑
  const TEAM_DB_NAME: Record<string, string> = {
    "KIA 타이거즈": "KIA",
    "KT 위즈": "KT",
    "LG 트윈스": "LG",
    "NC 다이노스": "NC",
    "SSG 랜더스": "SSG",
    "두산 베어스": "두산",
    "롯데 자이언츠": "롯데",
    "삼성 라이온즈": "삼성",
    "키움 히어로즈": "키움",
    "한화 이글스": "한화",
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setApiPlayers(null);
    setUsingMock(false);

    // team.name → DB 약칭으로 변환
    const dbTeamName = TEAM_DB_NAME[team.name] ?? team.name;

    fetchTeamRoster(dbTeamName, season).then((data) => {
      if (cancelled) return;
      if (data && data.length > 0) {
        setApiPlayers(data);
        setUsingMock(false);
      } else {
        setUsingMock(true);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [team.name, season]);

  // 최종 그룹 결정: API 데이터 우선, 없으면 mock
  const groups = apiPlayers
    ? groupApiRoster(apiPlayers)
    : groupByPosition(getTeamRoster(team.id, season));

  return (
    <div className="space-y-6">
      {/* 시즌 토글 */}
      <div className="flex items-center gap-2">
        {([2025, 2024] as const).map((yr) => (
          <button
            key={yr}
            onClick={() => setSeason(yr)}
            className="px-5 py-2 rounded-full text-sm font-black transition-all"
            style={
              season === yr
                ? { background: team.colors.primary, color: team.colors.text }
                : { background: "rgba(255,255,255,0.07)", color: "#64748b" }
            }
          >
            {yr} 시즌
          </button>
        ))}
        {/* 데이터 출처 배지 */}
        {!loading && (
          <span className="ml-auto text-[10px] text-slate-600">
            {usingMock ? "📋 mock 데이터" : "🔗 DB 연동"}
          </span>
        )}
      </div>

      {/* 로딩 스켈레톤 */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="w-24 h-28 rounded-2xl bg-white/5" />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* 포지션별 선수 카드 */}
      {!loading &&
        SECTION_ORDER.map((group) => (
          <RosterSection
            key={group}
            title={group}
            players={groups[group]}
            teamColor={team.colors.primary}
            teamBg={team.colors.bg}
            season={season}
            onPlayerClick={onSelectPlayer}
          />
        ))}

      {!loading && Object.values(groups).every((g) => g.length === 0) && (
        <div className="text-center py-10 text-slate-500 text-sm">
          로스터 데이터가 없습니다
        </div>
      )}
    </div>
  );
}
