// 선수 사진을 보여주는 공통 아바타 컴포넌트
// KBO 이미지 서버에서 연도별로 순차 시도하고 모두 실패하면 ⚾ 이모지로 대체
import { useState, useEffect } from "react";

interface PlayerAvatarProps {
  id: number;
  name: string;
  size?: number;
}

const YEARS = [2025, 2024, 2023, 2022, 2021, 2020];

export default function PlayerAvatar({ id, name, size = 48 }: PlayerAvatarProps) {
  const [yearIdx, setYearIdx] = useState(0);
  const [err, setErr] = useState(false);

  useEffect(() => {
    setYearIdx(0);
    setErr(false);
  }, [id]);

  const handleError = () => {
    if (yearIdx < YEARS.length - 1) {
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
          src={`https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/kbo/${YEARS[yearIdx]}/${id}.png`}
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