// src/components/profile/VsPlayerSection.tsx
// 네이버 API 기반 상대 전적 섹션
// - initialVsPlayerId: 선수 비교 페이지에서 상대방 pid 자동 선택용
import { useState, useEffect } from "react";
import {
  fetchPlayerStats,
  fetchVsTeamPlayers,
  fetchVsStats,
} from "@/api/playerStatsApi";
import type { VsTeam, VsPlayer, SeasonStatRow } from "@/api/playerStatsApi";

interface Props {
  pid: number;
  playerType: "hitter" | "pitcher";
  accentColor?: string;
  initialVsPlayerId?: number | null; // 비교 페이지에서 상대방 pid 자동 선택
}

export default function VsPlayerSection({
  pid,
  playerType,
  accentColor = "#3B82F6",
  initialVsPlayerId,
}: Props) {
  const [teams, setTeams] = useState<VsTeam[]>([]);
  const [players, setPlayers] = useState<VsPlayer[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [vsRows, setVsRows] = useState<SeasonStatRow[]>([]);
  const [vsHeaders, setVsHeaders] = useState<string[]>([]);
  const [vsNote, setVsNote] = useState("");

  const [initLoading, setInitLoading] = useState(true);
  const [teamLoading, setTeamLoading] = useState(false);
  const [vsLoading, setVsLoading] = useState(false);
  const [error, setError] = useState(false);

  // 초기 로드 — 팀 목록 + 첫 선수 목록
  useEffect(() => {
    setInitLoading(true);
    setError(false);
    fetchPlayerStats(pid, playerType)
      .then((data) => {
        setTeams(data.vsTeams);
        setPlayers(data.vsPlayers);

        if (initialVsPlayerId) {
          // 비교 페이지: 상대방 pid로 자동 선택 시도
          const found = data.vsPlayers.find(
            (p) => p.playerId === String(initialVsPlayerId),
          );
          if (found) {
            setSelectedPlayer(found.playerId);
          } else if (data.vsTeams.length > 0) {
            setSelectedTeam(data.vsTeams[0].code);
            if (data.vsPlayers.length > 0)
              setSelectedPlayer(data.vsPlayers[0].playerId);
          }
        } else {
          if (data.vsTeams.length > 0) setSelectedTeam(data.vsTeams[0].code);
          if (data.vsPlayers.length > 0)
            setSelectedPlayer(data.vsPlayers[0].playerId);
        }
      })
      .catch(() => setError(true))
      .finally(() => setInitLoading(false));
  }, [pid, playerType, initialVsPlayerId]);

  // 팀 변경 → 선수 목록 갱신
  const handleTeamChange = async (teamCode: string) => {
    setSelectedTeam(teamCode);
    setSelectedPlayer("");
    setVsRows([]);
    setTeamLoading(true);
    try {
      const data = await fetchVsTeamPlayers(pid, teamCode, playerType);
      setPlayers(data.players);
      if (data.players.length > 0) setSelectedPlayer(data.players[0].playerId);
    } catch {
    } finally {
      setTeamLoading(false);
    }
  };

  // 선수 선택 → VS 전적 조회
  useEffect(() => {
    if (!selectedPlayer) return;
    setVsLoading(true);
    setVsRows([]);
    fetchVsStats(pid, selectedPlayer, playerType)
      .then((data) => {
        setVsHeaders(data.headers);
        setVsRows(data.stats);
        setVsNote(data.note);
      })
      .catch(() => {})
      .finally(() => setVsLoading(false));
  }, [selectedPlayer]);

  if (initLoading)
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="h-4 w-40 bg-gray-100 rounded animate-pulse mb-4" />
        <div className="h-24 bg-gray-50 rounded animate-pulse" />
      </div>
    );
  if (error) return null;

  const vsLabel = playerType === "hitter" ? "상대 투수 전적" : "상대 타자 전적";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2 flex-wrap">
        <span
          className="w-1.5 h-5 rounded-full"
          style={{ background: accentColor }}
        />
        <h3 className="font-bold text-gray-800 text-sm">{vsLabel}</h3>
        <span className="ml-auto text-[10px] text-gray-400">
          최근 3시즌 기준 · 네이버 스포츠
        </span>
      </div>

      <div className="p-5">
        {/* 팀 + 선수 드롭다운 */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">팀</span>
            <select
              value={selectedTeam}
              onChange={(e) => handleTeamChange(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 font-bold focus:outline-none focus:border-blue-400"
              disabled={teamLoading}
            >
              {teams.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">선수</span>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 font-bold focus:outline-none focus:border-blue-400"
              disabled={teamLoading || players.length === 0}
            >
              {players.map((p) => (
                <option key={p.playerId} value={p.playerId}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          {(teamLoading || vsLoading) && (
            <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-400 rounded-full animate-spin" />
          )}
        </div>

        {/* VS 전적 테이블 */}
        {vsLoading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-50 rounded animate-pulse" />
            ))}
          </div>
        ) : vsRows.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-300">
            선수를 선택하면 전적이 표시됩니다
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-3 py-2 text-left font-bold text-gray-500 min-w-[52px]">
                      시즌
                    </th>
                    {vsHeaders.map((h) => (
                      <th
                        key={h}
                        className="px-2.5 py-2 font-bold text-gray-400 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vsRows.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-t border-gray-50 ${row.isLatest ? "bg-blue-50/40" : "hover:bg-gray-50/50"}`}
                    >
                      <td
                        className={`px-3 py-2.5 text-left font-bold ${row.isLatest ? "text-blue-600" : "text-gray-500"}`}
                      >
                        {row.season as string}
                        {row.isLatest && (
                          <span className="ml-1 text-[8px] bg-blue-500 text-white px-1 py-0.5 rounded">
                            최신
                          </span>
                        )}
                      </td>
                      {vsHeaders.map((h) => {
                        const val = row[h] as string;
                        const isKey = [
                          "타율",
                          "OPS",
                          "출루율",
                          "장타율",
                        ].includes(h);
                        return (
                          <td
                            key={h}
                            className={`px-2.5 py-2.5 ${isKey ? "font-black text-gray-800" : "text-gray-500"}`}
                          >
                            {val ?? "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {vsNote && (
              <p className="text-[10px] text-gray-300 mt-2 text-right">
                {vsNote}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
