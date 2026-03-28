// 선수 프로필의 핫/콜드존 탭
// - outer 코너 4칸 + inner 3×3 구역의 타율·삼진·타구 방향을 렌더링
// - dataSource: "db" | "mock" | "loading" — 우상단 배지로 표시
import HotColdGrid from "@/components/common/HotColdGrid";
import { stepColors } from "@/constants/stepColors";

interface ZoneCell {
  val: string;
  step: number;
}

interface HotColdTabData {
  outer: ZoneCell[];
  inner: ZoneCell[];
  strikeout: {
    outer: ZoneCell[];
    inner: ZoneCell[];
  };
  hitDistrib: {
    LF: string;
    CF: string;
    RF: string;
  };
}

interface HotColdTabProps {
  data: HotColdTabData;
  dataSource?: "db" | "mock" | "loading"; // 출처 배지
}

export default function HotColdTab({ data, dataSource }: HotColdTabProps) {
  const sourceBadge =
    dataSource === "db"
      ? {
          label: "DB 데이터",
          cls: "bg-green-50 text-green-600 border-green-200",
        }
      : dataSource === "mock"
        ? {
            label: "샘플 데이터",
            cls: "bg-gray-50 text-gray-400 border-gray-200",
          }
        : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── HOT & COLD ZONE ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-6 rounded-full bg-red-500 inline-block" />
          <h3 className="font-bold text-gray-800">HOT &amp; COLD ZONE</h3>
          {sourceBadge && (
            <span
              className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full border ${sourceBadge.cls}`}
            >
              {sourceBadge.label}
            </span>
          )}
        </div>
        <div className="flex justify-center">
          <HotColdGrid
            outer={data.outer}
            inner={data.inner}
            title="타율 기준"
          />
        </div>
        <div className="flex items-center gap-1 mt-5 justify-center">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-4 rounded"
                style={{ backgroundColor: stepColors[s].bg }}
              />
              <span className="text-xs text-gray-400">
                {["못침", "", "", "", "잘침"][s - 1]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 삼진 분포도 ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-6 rounded-full bg-yellow-400 inline-block" />
          <h3 className="font-bold text-gray-800">삼진 분포도</h3>
          {sourceBadge && (
            <span
              className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full border ${sourceBadge.cls}`}
            >
              {sourceBadge.label}
            </span>
          )}
        </div>
        <div className="flex justify-center">
          <HotColdGrid
            outer={data.strikeout.outer}
            inner={data.strikeout.inner}
            title="삼진 비율"
          />
        </div>
      </div>

      {/* ── 타구 방향 분포 ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-6 rounded-full bg-green-500 inline-block" />
          <h3 className="font-bold text-gray-800">타구 분포도</h3>
          {sourceBadge && (
            <span
              className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full border ${sourceBadge.cls}`}
            >
              {sourceBadge.label}
            </span>
          )}
        </div>
        <div className="flex justify-center">
          <svg viewBox="0 0 200 180" className="w-48 h-44">
            <path d="M100,170 L10,80 Q100,10 190,80 Z" fill="#2d6a2d" />
            <path d="M100,150 L60,110 L100,70 L140,110 Z" fill="#c8a26a" />
            <ellipse cx="100" cy="112" rx="28" ry="28" fill="#2d6a2d" />
            {(
              [
                [100, 70],
                [140, 110],
                [100, 150],
                [60, 110],
              ] as [number, number][]
            ).map(([x, y], i) => (
              <rect
                key={i}
                x={x - 4}
                y={y - 4}
                width="8"
                height="8"
                fill="white"
                transform={`rotate(45,${x},${y})`}
              />
            ))}
            <polygon
              points="97,160 103,160 105,166 100,170 95,166"
              fill="white"
            />
            <line
              x1="100"
              y1="170"
              x2="10"
              y2="80"
              stroke="white"
              strokeWidth="1"
              opacity="0.5"
            />
            <line
              x1="100"
              y1="170"
              x2="190"
              y2="80"
              stroke="white"
              strokeWidth="1"
              opacity="0.5"
            />
            {/* 방향 라벨 */}
            <text
              x="45"
              y="70"
              fill="white"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
            >
              LF
            </text>
            <text
              x="100"
              y="38"
              fill="white"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
            >
              CF
            </text>
            <text
              x="155"
              y="70"
              fill="white"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
            >
              RF
            </text>
            {/* 실제 비율 값 */}
            <text
              x="45"
              y="83"
              fill="#fbbf24"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
            >
              {data.hitDistrib.LF}
            </text>
            <text
              x="100"
              y="52"
              fill="#fbbf24"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
            >
              {data.hitDistrib.CF}
            </text>
            <text
              x="155"
              y="83"
              fill="#fbbf24"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
            >
              {data.hitDistrib.RF}
            </text>
          </svg>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            ["LF", data.hitDistrib.LF, "bg-green-50 text-green-700"],
            ["CF", data.hitDistrib.CF, "bg-blue-50 text-blue-700"],
            ["RF", data.hitDistrib.RF, "bg-purple-50 text-purple-700"],
          ].map(([k, v, cls]) => (
            <div key={k} className={`rounded-xl p-3 text-center ${cls}`}>
              <p className="text-xs font-medium">{k}</p>
              <p className="text-xl font-black">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
