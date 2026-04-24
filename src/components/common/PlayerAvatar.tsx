// 선수 사진을 보여주는 공통 아바타 컴포넌트
// season 연도부터 순차 시도, 모두 실패하면 ⚾ 이모지로 대체
import { useState, useEffect } from "react";

interface PlayerAvatarProps {
  id: number;
  name: string;
  size?: number;
  season?: number; // 시작 연도 (기본값: 현재 연도)
}

const BASE_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

export default function PlayerAvatar({
  id,
  name,
  size = 48,
  season = 2026,
}: PlayerAvatarProps) {
  // season부터 시작하는 fallback 배열 생성
  // ex) season=2024 → [2024, 2023, 2022, 2021, 2020]
  const years = BASE_YEARS.filter((y) => y <= season);

  const [yearIdx, setYearIdx] = useState(0);
  const [err, setErr] = useState(false);

  // id 또는 season이 바뀌면 처음부터 재시도
  useEffect(() => {
    setYearIdx(0);
    setErr(false);
  }, [id, season]);

  const handleError = () => {
    if (yearIdx < years.length - 1) {
      setYearIdx((prev) => prev + 1);
    } else {
      setErr(true);
    }
  };

  return (
    <div
      className="rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {!err ? (
        <img
          src={`https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/kbo/${years[yearIdx]}/${id}.png`}
          alt={name}
          className="w-full h-full object-cover"
          onError={handleError}
        />
      ) : (
        <span style={{ fontSize: size * 0.45 }}>⚾</span>
      )}
    </div>
  );
}
