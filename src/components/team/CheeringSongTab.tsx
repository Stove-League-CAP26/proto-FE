// src/components/team/CheeringSongTab.tsx
import { useEffect, useState } from "react";

// ── 타입 ─────────────────────────────────────────────────
interface CheeringSong {
  id: number;
  team: string;
  title: string;
  youtubeUrl: string;
  videoId: string;
}

// ── CSV 팀 키 매핑 (teamData.ts 의 팀 key → DB team 컬럼 값) ──
const TEAM_KEY_MAP: Record<string, string> = {
  KIA: "kia",
  Samsung: "samsung",
  LG: "lg",
  Doosan: "doosan",
  Lotte: "lotte",
  Hanwha: "hanwha",
  SSG: "ssg",
  KT: "kt",
  NC: "nc",
  Kiwoom: "kiwoom",
};

// ── API 호출 ──────────────────────────────────────────────
async function fetchCheeringSongs(teamKey: string): Promise<CheeringSong[]> {
  const dbTeam = TEAM_KEY_MAP[teamKey] ?? teamKey.toLowerCase();
  const res = await fetch(`/api/cheering-songs?team=${dbTeam}`);
  if (!res.ok) throw new Error("응원가 로드 실패");
  return res.json();
}

// ── 컴포넌트 ─────────────────────────────────────────────
interface Props {
  teamKey: string; // teamData.ts 의 팀 key (예: "KIA")
  teamColor: string; // 팀 대표색 (예: "#EA0029")
}

export default function CheeringSongTab({ teamKey, teamColor }: Props) {
  const [songs, setSongs] = useState<CheeringSong[]>([]);
  const [selected, setSelected] = useState<CheeringSong | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setSelected(null);

    fetchCheeringSongs(teamKey)
      .then((data) => {
        setSongs(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [teamKey]);

  if (loading)
    return <div className="cheering-loading">응원가 불러오는 중...</div>;
  if (error)
    return (
      <div className="cheering-error">응원가 정보를 불러올 수 없습니다.</div>
    );
  if (songs.length === 0)
    return <div className="cheering-empty">등록된 응원가가 없습니다.</div>;

  return (
    <div className="cheering-tab">
      {/* 유튜브 플레이어 */}
      {selected && (
        <div className="cheering-player">
          <div className="cheering-player__title" style={{ color: teamColor }}>
            🎵 {selected.title}
          </div>
          <div className="cheering-player__iframe-wrap">
            <iframe
              src={`https://www.youtube.com/embed/${selected.videoId}?autoplay=1`}
              title={selected.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* 응원가 목록 */}
      <ul className="cheering-list">
        {songs.map((song) => (
          <li
            key={song.id}
            className={`cheering-list__item ${selected?.id === song.id ? "active" : ""}`}
            style={
              selected?.id === song.id
                ? { borderColor: teamColor, color: teamColor }
                : {}
            }
            onClick={() => setSelected(song)}
          >
            <span className="cheering-list__icon">▶</span>
            <span className="cheering-list__title">{song.title}</span>
          </li>
        ))}
      </ul>

      <style>{`
        .cheering-tab {
          display: flex;
          gap: 24px;
          padding: 20px 0;
          align-items: flex-start;
        }
        .cheering-player {
          flex: 1;
          min-width: 0;
        }
        .cheering-player__title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .cheering-player__iframe-wrap {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          border-radius: 10px;
          overflow: hidden;
          background: #000;
        }
        .cheering-player__iframe-wrap iframe {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          border: none;
        }
        .cheering-list {
          width: 260px;
          flex-shrink: 0;
          list-style: none;
          margin: 0; padding: 0;
          max-height: 400px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .cheering-list__item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1.5px solid transparent;
          background: rgba(255,255,255,0.05);
          cursor: pointer;
          font-size: 0.875rem;
          transition: background 0.15s, border-color 0.15s;
        }
        .cheering-list__item:hover {
          background: rgba(255,255,255,0.12);
        }
        .cheering-list__item.active {
          background: rgba(255,255,255,0.08);
          font-weight: 600;
        }
        .cheering-list__icon {
          font-size: 0.65rem;
          opacity: 0.7;
        }
        .cheering-list__title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .cheering-loading,
        .cheering-error,
        .cheering-empty {
          padding: 40px;
          text-align: center;
          opacity: 0.5;
          font-size: 0.9rem;
        }
        @media (max-width: 640px) {
          .cheering-tab { flex-direction: column; }
          .cheering-list { width: 100%; max-height: 220px; }
        }
      `}</style>
    </div>
  );
}
