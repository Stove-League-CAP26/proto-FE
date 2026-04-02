// 응원가 탭 — 타입별 필터 + YouTube embed
import { useState, useMemo } from "react";
import type { CheeringSong, Team } from "@/mock/teamData";

interface SongsTabProps {
  songs: CheeringSong[];
  team: Team;
}

export default function SongsTab({ songs, team }: SongsTabProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("전체");
  const primary = team.colors.primary;
  const isReal = (id: string) => id !== "TO_BE_REPLACED" && id.length > 5;

  // 존재하는 타입 목록 동적 추출 (순서 고정)
  const TYPE_ORDER = [
    "전체",
    "팀가",
    "응원가",
    "2025 신곡",
    "연고지가",
    "레거시",
    "기타",
  ];
  const existingTypes = useMemo(() => {
    const types = new Set(songs.map((s) => s.type));
    return TYPE_ORDER.filter((t) => t === "전체" || types.has(t));
  }, [songs]);

  // 필터링된 곡 목록
  const filtered = useMemo(
    () =>
      activeFilter === "전체"
        ? songs
        : songs.filter((s) => s.type === activeFilter),
    [songs, activeFilter],
  );

  // 필터 변경 시 재생 중지
  const handleFilter = (type: string) => {
    setActiveFilter(type);
    setPlayingId(null);
  };

  return (
    <div className="space-y-4">
      {/* ── 타입 필터 탭 ── */}
      <div className="flex gap-2 flex-wrap">
        {existingTypes.map((type) => {
          const count =
            type === "전체"
              ? songs.length
              : songs.filter((s) => s.type === type).length;
          const isActive = activeFilter === type;
          return (
            <button
              key={type}
              onClick={() => handleFilter(type)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{
                background: isActive ? primary : `${primary}10`,
                color: isActive ? "white" : primary,
                border: `1px solid ${isActive ? primary : primary + "30"}`,
                boxShadow: isActive ? `0 2px 8px ${primary}33` : "none",
              }}
            >
              {type}
              <span
                className="text-[10px] px-1 rounded-full"
                style={{
                  background: isActive
                    ? "rgba(255,255,255,0.25)"
                    : `${primary}20`,
                  color: isActive ? "white" : primary,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 곡 목록 ── */}
      <div className="space-y-2">
        {filtered.map((song, i) => (
          <div
            key={`${song.youtubeId}-${i}`}
            className="rounded-xl overflow-hidden border transition-colors"
            style={{
              background:
                playingId === song.youtubeId ? `${primary}06` : "#fafafa",
              borderColor:
                playingId === song.youtubeId ? `${primary}30` : "#f0f0f0",
            }}
          >
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* 재생 상태 인디케이터 */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black"
                  style={{
                    background:
                      playingId === song.youtubeId ? primary : `${primary}12`,
                    color: playingId === song.youtubeId ? "white" : primary,
                  }}
                >
                  {playingId === song.youtubeId ? "♪" : i + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-gray-800 text-sm font-bold truncate">
                    {song.title}
                  </p>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full inline-block mt-0.5"
                    style={{ background: `${primary}12`, color: primary }}
                  >
                    {song.type}
                  </span>
                </div>
              </div>

              {/* 재생/정지 버튼 */}
              {isReal(song.youtubeId) ? (
                <button
                  onClick={() =>
                    setPlayingId(
                      playingId === song.youtubeId ? null : song.youtubeId,
                    )
                  }
                  className="flex-shrink-0 ml-3 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                  style={{
                    background:
                      playingId === song.youtubeId ? "#EF4444" : primary,
                    boxShadow: `0 2px 6px ${playingId === song.youtubeId ? "#EF444433" : primary + "33"}`,
                  }}
                >
                  {playingId === song.youtubeId ? "■ 정지" : "▶ 재생"}
                </button>
              ) : (
                <span className="text-gray-300 text-xs flex-shrink-0 ml-3">
                  URL 미등록
                </span>
              )}
            </div>

            {/* YouTube embed */}
            {playingId === song.youtubeId && isReal(song.youtubeId) && (
              <div className="px-3.5 pb-3.5">
                <iframe
                  className="w-full rounded-xl"
                  height="200"
                  src={`https://www.youtube.com/embed/${song.youtubeId}?autoplay=1`}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            해당 타입의 응원가가 없습니다
          </div>
        )}
      </div>

      {/* 안내 문구 */}
      <p className="text-xs text-gray-300 text-center pt-1">
        총 {songs.length}곡 · 현재 {filtered.length}곡 표시 중
      </p>
    </div>
  );
}
