// 선수 프로필 페이지 - Baseball Savant 스타일
// player_m_position 형식: "투수(좌투좌타)", "포수(우투우타)", "내야수(우투우타)" 등
// → startsWith("투수") 로 투수/타자 자동 분기
import { useState } from "react";
import PlayerAvatar from "@/components/common/PlayerAvatar";
import HotColdTab from "@/components/profile/HotColdTab";
import StatsTab from "@/components/profile/StatsTab";
import { TEAM_COLORS } from "@/constants/teamColors";
import { stepColors } from "@/constants/stepColors";
import {
  MOCK_STATS_HITTER,
  MOCK_HOT_COLD,
  MOCK_STATS_PITCHER,
  MOCK_PITCH_ARSENAL,
  MOCK_PITCHER_PERCENTILES,
  MOCK_PITCH_ZONE,
  MOCK_ROLLING_ERA,
} from "@/mock/statsData";
import { searchPlayersByName } from "@/api/playerApi";

// ─────────────────────────────────────────────────────────────
// 핵심: DB 포맷 "투수(좌투좌타)" → startsWith("투수") 로 감지
// ─────────────────────────────────────────────────────────────
function isPitcher(playerMPosition: string | undefined | null): boolean {
  if (!playerMPosition) return false;
  return playerMPosition.startsWith("투수");
}

// ─────────────────────────────────────────────────────────────
// 공통 서브컴포넌트
// ─────────────────────────────────────────────────────────────

/** 퍼센타일 원형 게이지 */
function PercentileRing({
  label,
  pct,
  val,
  inverse = false,
}: {
  label: string;
  pct: number;
  val: string;
  inverse?: boolean;
}) {
  const display = inverse ? 100 - pct : pct;
  const color =
    display >= 90
      ? "#EF4444"
      : display >= 70
        ? "#F97316"
        : display >= 40
          ? "#3B82F6"
          : "#6B7280";
  const r = 22,
    circ = 2 * Math.PI * r;
  return (
    <div
      className="flex flex-col items-center gap-1 flex-shrink-0"
      style={{ minWidth: 72 }}
    >
      <div className="relative" style={{ width: 56, height: 56 }}>
        <svg viewBox="0 0 56 56" className="w-full h-full">
          <circle
            cx="28"
            cy="28"
            r={r}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="4"
          />
          <circle
            cx="28"
            cy="28"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - display / 100)}
            strokeLinecap="round"
            transform="rotate(-90 28 28)"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-sm font-black"
          style={{ color }}
        >
          {display}
        </span>
      </div>
      <p className="text-xs font-bold text-gray-700 text-center leading-tight">
        {label}
      </p>
      <p className="text-xs text-gray-400 text-center">{val}</p>
    </div>
  );
}

/** 롤링 라인 차트 (ERA / OPS 공용) */
function RollingLineChart({
  data,
  color,
  minVal,
  maxVal,
  label,
  inverse = false,
}: {
  data: { label: string; val: number }[];
  color: string;
  minVal: number;
  maxVal: number;
  label: string;
  inverse?: boolean;
}) {
  const W = 400,
    H = 130,
    pad = { l: 36, r: 12, t: 12, b: 28 };
  const cW = W - pad.l - pad.r,
    cH = H - pad.t - pad.b;
  const toY = (v: number) =>
    inverse
      ? pad.t + ((v - minVal) / (maxVal - minVal)) * cH
      : pad.t + cH - ((v - minVal) / (maxVal - minVal)) * cH;
  const pts = data.map((d, i) => ({
    x: pad.l + (i / (data.length - 1)) * cW,
    y: toY(d.val),
    ...d,
  }));
  const pathD = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const areaD = `${pathD} L${pts[pts.length - 1].x},${pad.t + cH} L${pts[0].x},${pad.t + cH} Z`;
  const gridVals = [
    minVal,
    minVal + (maxVal - minVal) * 0.33,
    minVal + (maxVal - minVal) * 0.67,
    maxVal,
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {gridVals.map((v) => {
        const y = toY(v);
        return (
          <g key={v}>
            <line
              x1={pad.l}
              y1={y}
              x2={W - pad.r}
              y2={y}
              stroke="#E5E7EB"
              strokeWidth="0.5"
              strokeDasharray="4,3"
            />
            <text
              x={pad.l - 4}
              y={y}
              textAnchor="end"
              fontSize="8"
              fill="#9CA3AF"
              dominantBaseline="middle"
            >
              {v.toFixed(2)}
            </text>
          </g>
        );
      })}
      <path d={areaD} fill={`url(#grad-${label})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3"
          fill={color}
          stroke="white"
          strokeWidth="1.5"
        />
      ))}
      {pts
        .filter((_, i) => i % Math.floor(pts.length / 5) === 0)
        .map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={H - 6}
            textAnchor="middle"
            fontSize="7.5"
            fill="#9CA3AF"
          >
            {p.label}
          </text>
        ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// 타자 전용
// ─────────────────────────────────────────────────────────────
const MOCK_HITTER_PERCENTILES = [
  { label: "타율", pct: 62, val: ".337", inverse: false },
  { label: "OPS", pct: 78, val: ".939", inverse: false },
  { label: "장타율", pct: 71, val: ".533", inverse: false },
  { label: "출루율", pct: 80, val: ".406", inverse: false },
  { label: "홈런", pct: 55, val: "20개", inverse: false },
  { label: "도루", pct: 22, val: "4개", inverse: false },
  { label: "삼진율", pct: 75, val: "12.2%", inverse: false },
  { label: "볼넷율", pct: 68, val: "9.7%", inverse: false },
  { label: "배럴%", pct: 88, val: "11.3%", inverse: false },
  { label: "강타%", pct: 82, val: "44.8%", inverse: false },
];

const MOCK_SPRAY: { x: number; y: number; type: string }[] = [
  { x: 58, y: 92, type: "1B" },
  { x: 48, y: 108, type: "OUT" },
  { x: 72, y: 78, type: "2B" },
  { x: 53, y: 82, type: "HR" },
  { x: 63, y: 98, type: "1B" },
  { x: 68, y: 68, type: "HR" },
  { x: 128, y: 38, type: "HR" },
  { x: 150, y: 32, type: "OUT" },
  { x: 168, y: 44, type: "2B" },
  { x: 140, y: 52, type: "1B" },
  { x: 222, y: 92, type: "1B" },
  { x: 238, y: 78, type: "2B" },
  { x: 228, y: 63, type: "HR" },
  { x: 242, y: 88, type: "1B" },
  { x: 113, y: 108, type: "OUT" },
  { x: 133, y: 98, type: "1B" },
  { x: 162, y: 113, type: "OUT" },
  { x: 178, y: 100, type: "2B" },
];

const MOCK_ROLLING_OPS = [
  { label: "4/01", val: 0.82 },
  { label: "4/15", val: 0.88 },
  { label: "5/01", val: 0.91 },
  { label: "5/15", val: 0.87 },
  { label: "6/01", val: 0.94 },
  { label: "6/15", val: 0.93 },
  { label: "7/01", val: 0.89 },
  { label: "7/15", val: 0.96 },
  { label: "8/01", val: 0.92 },
  { label: "9/15", val: 0.939 },
];

// SprayChart는 HitterStatcastTab 내부에 인라인 SVG로 직접 렌더링됨

function HitterStatcastTab() {
  const s = MOCK_STATS_HITTER.season[0];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* 스프레이 차트 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 rounded-full bg-green-500" />
            <h3 className="font-bold text-gray-800 text-sm">
              타구 분포 (스프레이 차트)
            </h3>
            <span className="ml-auto text-xs text-gray-400">2025 시즌</span>
          </div>
          {/* 고정 높이 래퍼 - SVG가 아래 영역 침범 방지 */}
          <div className="relative w-full" style={{ height: 220 }}>
            <svg
              viewBox="0 0 300 260"
              className="absolute inset-0 w-full h-full max-w-xs mx-auto left-0 right-0"
            >
              <path d="M150,245 L10,90 Q150,5 290,90 Z" fill="#2d6a2d" />
              <path d="M150,183 L93,128 L150,75 L207,128 Z" fill="#c8a26a" />
              <ellipse cx="150" cy="133" rx="38" ry="38" fill="#2d6a2d" />
              <path
                d="M150,245 L10,90 Q150,5 290,90 Z"
                fill="none"
                stroke="#a07840"
                strokeWidth="8"
                strokeOpacity="0.4"
              />
              <line
                x1="150"
                y1="245"
                x2="10"
                y2="90"
                stroke="white"
                strokeWidth="1.5"
                opacity="0.4"
              />
              <line
                x1="150"
                y1="245"
                x2="290"
                y2="90"
                stroke="white"
                strokeWidth="1.5"
                opacity="0.4"
              />
              {(
                [
                  [150, 75],
                  [207, 128],
                  [150, 183],
                  [93, 128],
                ] as [number, number][]
              ).map(([x, y], i) => (
                <rect
                  key={i}
                  x={x - 5}
                  y={y - 5}
                  width="10"
                  height="10"
                  fill="white"
                  transform={`rotate(45,${x},${y})`}
                />
              ))}
              <polygon
                points="147,240 153,240 155,245 150,248 145,245"
                fill="white"
              />
              <ellipse
                cx="150"
                cy="133"
                rx="6"
                ry="6"
                fill="#c8a26a"
                stroke="#a07840"
                strokeWidth="1"
              />
              {MOCK_SPRAY.map((d, i) => {
                const tc: Record<string, string> = {
                  HR: "#EF4444",
                  "2B": "#F59E0B",
                  "1B": "#10B981",
                  OUT: "#9CA3AF",
                };
                return (
                  <circle
                    key={i}
                    cx={d.x}
                    cy={d.y}
                    r="4.5"
                    fill={tc[d.type] ?? "#9CA3AF"}
                    opacity="0.85"
                    stroke="white"
                    strokeWidth="0.8"
                  />
                );
              })}
            </svg>
          </div>
          {/* 범례 */}
          <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
            {(
              [
                ["HR", "#EF4444"],
                ["2루타", "#F59E0B"],
                ["안타", "#10B981"],
                ["아웃", "#9CA3AF"],
              ] as [string, string][]
            ).map(([t, c]) => (
              <div key={t} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: c }}
                />
                <span className="text-xs text-gray-500 font-medium">{t}</span>
              </div>
            ))}
          </div>
          {/* 방향 분포 */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              ["좌", "50.6%", "#10B981"],
              ["중", "24.7%", "#3B82F6"],
              ["우", "24.7%", "#8B5CF6"],
            ].map(([d, v, c]) => (
              <div
                key={d}
                className="text-center p-2 rounded-xl border"
                style={{ borderColor: c + "40", background: c + "10" }}
              >
                <p className="text-xs font-medium text-gray-500">{d}방향</p>
                <p className="text-base font-black" style={{ color: c }}>
                  {v}
                </p>
              </div>
            ))}
          </div>
        </div>
        {/* 롤링 OPS */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 rounded-full bg-blue-500" />
            <h3 className="font-bold text-gray-800 text-sm">롤링 OPS 추이</h3>
            <span className="ml-auto text-xl font-black text-blue-600">
              {s.OPS}
            </span>
          </div>
          <RollingLineChart
            data={MOCK_ROLLING_OPS}
            color="#3B82F6"
            minVal={0.75}
            maxVal={1.05}
            label="ops"
          />
          <p className="text-xs text-gray-400 text-center mt-1">
            14일 이동 평균
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { label: "최고 OPS", val: "0.960", sub: "7월", color: "#EF4444" },
              { label: "최저 OPS", val: "0.820", sub: "4월", color: "#6B7280" },
              { label: "전반기", val: "0.908", sub: "AVG", color: "#3B82F6" },
              { label: "후반기", val: "0.931", sub: "AVG", color: "#10B981" },
            ].map(({ label, val, sub, color }) => (
              <div
                key={label}
                className="rounded-xl p-3 bg-gray-50 border border-gray-100"
              >
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-lg font-black mt-0.5" style={{ color }}>
                  {val}
                </p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* 스탯 테이블 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-purple-500" />
          <h3 className="font-bold text-gray-800">시즌 기록</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {[
                  "연도",
                  "G",
                  "PA",
                  "H",
                  "HR",
                  "RBI",
                  "AVG",
                  "OBP",
                  "SLG",
                  "OPS",
                  "BB%",
                  "K%",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-3 py-2.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${["AVG", "OBP", "SLG", "OPS"].includes(h) ? "text-blue-600" : "text-gray-400"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_STATS_HITTER.season.map((row, i) => (
                <tr
                  key={i}
                  className={`border-t border-gray-50 ${i === 0 ? "bg-blue-50/40" : "hover:bg-gray-50"}`}
                >
                  <td className="px-3 py-3 text-center font-bold text-gray-800">
                    {row.year}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.G}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.PA}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.H}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-gray-800">
                    {row.HR}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-gray-800">
                    {row.RBI}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-blue-600">
                    {row.AVG}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-blue-600">
                    {row.OBP}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-blue-600">
                    {row.SLG}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-yellow-600">
                    {row.OPS}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">9.7%</td>
                  <td className="px-3 py-3 text-center text-gray-500">12.2%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 투수 전용
// ─────────────────────────────────────────────────────────────

function PitchArsenalChart() {
  return (
    <div className="space-y-3">
      {MOCK_PITCH_ARSENAL.map((p) => (
        <div key={p.abbr} className="flex items-center gap-3">
          <div
            className="w-8 h-6 rounded-md flex items-center justify-center text-white text-xs font-black flex-shrink-0"
            style={{ backgroundColor: p.color }}
          >
            {p.abbr}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-gray-700">{p.name}</span>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="font-bold text-gray-600">{p.avgVelo}km/h</span>
                <span>Whiff {p.whiff}%</span>
              </div>
            </div>
            <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full flex items-center justify-end pr-2"
                style={{ width: `${p.pct}%`, backgroundColor: p.color + "dd" }}
              >
                <span className="text-white text-xs font-black">{p.pct}%</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PitchZoneGrid() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 180, height: 180 }}>
        {[
          {
            d: MOCK_PITCH_ZONE.outer[0],
            style: { top: 0, left: 0, width: 50, height: 50 },
          },
          {
            d: MOCK_PITCH_ZONE.outer[1],
            style: { top: 0, right: 0, width: 50, height: 50 },
          },
          {
            d: MOCK_PITCH_ZONE.outer[2],
            style: { bottom: 0, left: 0, width: 50, height: 50 },
          },
          {
            d: MOCK_PITCH_ZONE.outer[3],
            style: { bottom: 0, right: 0, width: 50, height: 50 },
          },
        ].map(({ d, style }, i) => (
          <div
            key={i}
            className="absolute flex items-center justify-center rounded text-xs font-bold"
            style={{
              ...style,
              backgroundColor: stepColors[d.step]?.bg,
              color: stepColors[d.step]?.text,
            }}
          >
            {d.val}
          </div>
        ))}
        <div
          className="absolute grid grid-cols-3 gap-0.5"
          style={{ top: 55, left: 55, width: 70, height: 70 }}
        >
          {MOCK_PITCH_ZONE.inner.map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-center rounded font-semibold"
              style={{
                backgroundColor: stepColors[c.step]?.bg,
                color: stepColors[c.step]?.text,
                fontSize: 8,
              }}
            >
              {c.val}
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">투수 시점 기준</p>
    </div>
  );
}

function PitcherStatcastTab() {
  const s = MOCK_STATS_PITCHER.season[0];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 구종 비율 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 rounded-full bg-red-500" />
            <h3 className="font-bold text-gray-800 text-sm">
              구종 구성 (Pitch Usage)
            </h3>
            <span className="ml-auto text-xs text-gray-400">2025 시즌</span>
          </div>
          <PitchArsenalChart />
          <div className="grid grid-cols-3 gap-2 mt-5">
            {[
              { label: "주구종", val: "포심", color: "#EF4444" },
              { label: "평균 구속", val: "153km", color: "#3B82F6" },
              { label: "헛스윙%", val: "32.1%", color: "#F59E0B" },
            ].map(({ label, val, color }) => (
              <div
                key={label}
                className="rounded-xl p-3 bg-gray-50 border border-gray-100 text-center"
              >
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-black mt-0.5" style={{ color }}>
                  {val}
                </p>
              </div>
            ))}
          </div>
        </div>
        {/* 롤링 ERA */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 rounded-full bg-orange-500" />
            <h3 className="font-bold text-gray-800 text-sm">롤링 ERA 추이</h3>
            <span className="ml-auto text-xl font-black text-orange-500">
              {s.ERA}
            </span>
          </div>
          <RollingLineChart
            data={MOCK_ROLLING_ERA}
            color="#F97316"
            minVal={1.5}
            maxVal={3.5}
            label="era"
            inverse
          />
          <p className="text-xs text-gray-400 text-center mt-1">
            14일 이동 평균 · 낮을수록 좋음
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              {
                label: "시즌 최저 ERA",
                val: "1.98",
                sub: "7월",
                color: "#10B981",
              },
              {
                label: "시즌 최고 ERA",
                val: "3.20",
                sub: "4월",
                color: "#EF4444",
              },
              {
                label: "전반기 ERA",
                val: "2.54",
                sub: "AVG",
                color: "#3B82F6",
              },
              {
                label: "후반기 ERA",
                val: "2.11",
                sub: "AVG",
                color: "#F97316",
              },
            ].map(({ label, val, sub, color }) => (
              <div
                key={label}
                className="rounded-xl p-3 bg-gray-50 border border-gray-100"
              >
                <p className="text-xs text-gray-400 leading-tight">{label}</p>
                <p className="text-lg font-black mt-0.5" style={{ color }}>
                  {val}
                </p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* 투수 스탯 테이블 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-purple-500" />
          <h3 className="font-bold text-gray-800">시즌 기록</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {[
                  "연도",
                  "G",
                  "GS",
                  "W",
                  "L",
                  "IP",
                  "ERA",
                  "WHIP",
                  "K",
                  "BB",
                  "HR",
                  "FIP",
                  "WAR",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-3 py-2.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${["ERA", "WHIP", "FIP"].includes(h) ? "text-orange-500" : "text-gray-400"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_STATS_PITCHER.season.map((row, i) => (
                <tr
                  key={i}
                  className={`border-t border-gray-50 ${i === 0 ? "bg-orange-50/40" : "hover:bg-gray-50"}`}
                >
                  <td className="px-3 py-3 text-center font-bold text-gray-800">
                    {row.year}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.G}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.GS}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-green-600">
                    {row.W}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.L}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.IP}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-orange-500">
                    {row.ERA}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-orange-400">
                    {row.WHIP}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-blue-600">
                    {row.SO}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.BB}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.HR}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-orange-400">
                    {row.FIP}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-purple-600">
                    {row.WAR}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PitcherStandardTab() {
  const s = MOCK_STATS_PITCHER.season[0];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "ERA", val: s.ERA, color: "from-orange-500 to-orange-600" },
          {
            label: "승리",
            val: `${s.W}승`,
            color: "from-green-500 to-green-600",
          },
          {
            label: "탈삼진",
            val: `${s.SO}K`,
            color: "from-blue-500 to-blue-600",
          },
          {
            label: "WHIP",
            val: s.WHIP,
            color: "from-purple-500 to-purple-600",
          },
        ].map(({ label, val, color }) => (
          <div
            key={label}
            className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-white shadow-sm`}
          >
            <p className="text-white/70 text-xs font-medium">{label}</p>
            <p className="text-3xl font-black mt-0.5">{val}</p>
            <p className="text-white/60 text-xs mt-1">최근 시즌</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-800">시즌 투구 기록</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {[
                  "연도",
                  "팀",
                  "G",
                  "GS",
                  "W",
                  "L",
                  "SV",
                  "IP",
                  "H",
                  "R",
                  "ER",
                  "BB",
                  "SO",
                  "HR",
                  "ERA",
                  "WHIP",
                  "FIP",
                  "WAR",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-3 py-2.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${["ERA", "WHIP", "FIP"].includes(h) ? "text-orange-500" : "text-gray-400"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_STATS_PITCHER.season.map((row, i) => (
                <tr
                  key={i}
                  className={`border-t border-gray-50 ${i === 0 ? "bg-orange-50/40" : "hover:bg-gray-50"}`}
                >
                  <td className="px-3 py-3 text-center font-bold text-gray-800">
                    {row.year}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.team}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.G}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.GS}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-green-600">
                    {row.W}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.L}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.SV}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.IP}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.H}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.R}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.ER}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.BB}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-blue-600">
                    {row.SO}
                  </td>
                  <td className="px-3 py-3 text-center text-gray-500">
                    {row.HR}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-orange-500">
                    {row.ERA}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-orange-400">
                    {row.WHIP}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-orange-400">
                    {row.FIP}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-purple-600">
                    {row.WAR}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────────────────────
export default function PlayerProfilePage() {
  const [activeTab, setActiveTab] = useState("statcast");
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [playerBasic, setPlayerBasic] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    const name = searchInput.trim();
    if (!name) return;
    setSearchLoading(true);
    setShowResults(false);
    setError(null);
    try {
      const results = await searchPlayersByName(name);
      if (results.length === 0) {
        setError(`"${name}" 에 해당하는 선수가 없습니다.`);
      } else if (results.length === 1) {
        setPlayerBasic(results[0]);
        setActiveTab("statcast");
      } else {
        setSearchResults(results);
        setShowResults(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectPlayer = (p: any) => {
    setPlayerBasic(p);
    setShowResults(false);
    setSearchResults([]);
    setSearchInput(p.playerName);
    setError(null);
    setActiveTab("statcast");
  };

  const SearchDropdown = ({ results }: { results: any[] }) => (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden min-w-72">
      <p className="px-3 py-2 text-xs text-gray-400 border-b border-gray-100">
        {results.length}명이 검색됐어요. 선택해주세요.
      </p>
      <div className="max-h-60 overflow-y-auto">
        {results.map((p: any) => {
          const tc = TEAM_COLORS[p.playerEnter] ?? {
            bg: "#64748b",
            accent: "#94a3b8",
          };
          // DB 포맷: "투수(좌투좌타)" → isPitcher() 로 판별
          const pitcher = isPitcher(p.playerMPosition);
          return (
            <button
              key={p.pid}
              onClick={() => handleSelectPlayer(p)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
            >
              <div
                className="w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0"
                style={{ borderColor: tc.bg }}
              >
                <PlayerAvatar id={p.pid} name={p.playerName} size={40} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800">
                  {p.playerName}
                </p>
                <p className="text-xs text-gray-400">
                  {p.playerEnter} · {p.playerMPosition} · #{p.playerNumber}
                </p>
              </div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0"
                style={{ backgroundColor: pitcher ? "#F97316" : "#3B82F6" }}
              >
                {pitcher ? "투수" : "타자"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── 초기 검색 화면 ─────────────────────────────────────────
  if (!playerBasic) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex flex-col items-center gap-6">
          <p className="text-5xl">⚾</p>
          <h2 className="text-2xl font-black text-gray-800">선수 검색</h2>
          <p className="text-sm text-gray-400">
            이름을 입력하면 Statcast 스타일 프로필을 확인할 수 있어요
          </p>
          <div className="relative w-full max-w-sm">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowResults(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="선수 이름 입력 (예: 양현종, 양의지)"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
              >
                {searchLoading ? "⏳" : "🔍"} 검색
              </button>
            </div>
            {showResults && <SearchDropdown results={searchResults} />}
            {error && (
              <p className="absolute top-full left-0 mt-1 text-red-500 text-xs bg-white px-2 py-1 rounded-lg border border-red-100 shadow-sm">
                {error}
              </p>
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-3 text-center">
              자주 찾는 선수
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { name: "양의지", type: "타자" },
                { name: "김도영", type: "타자" },
                { name: "안우진", type: "투수" },
                { name: "원태인", type: "투수" },
                { name: "양현종", type: "투수" },
              ].map(({ name, type }) => (
                <button
                  key={name}
                  onClick={async () => {
                    setSearchInput(name);
                    setSearchLoading(true);
                    setError(null);
                    try {
                      const results = await searchPlayersByName(name);
                      if (results.length === 1) {
                        setPlayerBasic(results[0]);
                        setActiveTab("statcast");
                      } else if (results.length > 1) {
                        setSearchResults(results);
                        setShowResults(true);
                      } else setError(`"${name}" 선수를 찾을 수 없습니다.`);
                    } catch (err: any) {
                      setError(err.message);
                    } finally {
                      setSearchLoading(false);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  <span>{name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-white text-xs font-bold ${type === "투수" ? "bg-orange-400" : "bg-blue-400"}`}
                  >
                    {type}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 데이터 파싱 ────────────────────────────────────────────
  const tc = TEAM_COLORS[playerBasic.playerEnter] ?? {
    bg: "#1e293b",
    accent: "#64748b",
  };
  // ★ 핵심: DB 값 "투수(좌투좌타)" → startsWith("투수") → true
  const pitcher = isPitcher(playerBasic.playerMPosition);
  const hwRaw = playerBasic.heightWeight ?? "";
  const hwParts = hwRaw.split("/");
  const heightNum = hwParts[0]?.replace(/[^0-9]/g, "") ?? "-";
  const weightNum = hwParts[1]?.replace(/[^0-9]/g, "") ?? "-";
  const hwStr =
    heightNum !== "-" && weightNum !== "-"
      ? `${heightNum}cm / ${weightNum}kg`
      : hwRaw || "-";
  const salaryStr = playerBasic.playerSalary
    ? `${(playerBasic.playerSalary / 100000000).toFixed(0)}억`
    : "-";
  const ageStr = playerBasic.playerBirthday
    ? `${new Date().getFullYear() - new Date(playerBasic.playerBirthday).getFullYear()}세`
    : "-";

  // 투수/타자별 분기값
  const heroAccent = pitcher ? "#F97316" : "#3B82F6";
  const heroBadges = pitcher
    ? [
        {
          label: "ERA",
          val: MOCK_STATS_PITCHER.season[0].ERA,
          color: "#F97316",
        },
        {
          label: "W-L",
          val: `${MOCK_STATS_PITCHER.season[0].W}-${MOCK_STATS_PITCHER.season[0].L}`,
          color: "#10B981",
        },
        {
          label: "WHIP",
          val: MOCK_STATS_PITCHER.season[0].WHIP,
          color: "#8B5CF6",
        },
      ]
    : [
        {
          label: "AVG",
          val: MOCK_STATS_HITTER.season[0].AVG,
          color: "#3B82F6",
        },
        {
          label: "HR",
          val: String(MOCK_STATS_HITTER.season[0].HR),
          color: "#EF4444",
        },
        {
          label: "OPS",
          val: MOCK_STATS_HITTER.season[0].OPS,
          color: "#F59E0B",
        },
      ];

  const heroHeaders = pitcher
    ? ["W", "L", "ERA", "G", "GS", "SV", "IP", "SO", "WHIP"]
    : ["PA", "AB", "R", "H", "HR", "SB", "AVG", "OBP", "SLG", "OPS"];

  const heroRows = pitcher
    ? MOCK_STATS_PITCHER.season.map((s) => ({
        year: s.year,
        cells: [s.W, s.L, s.ERA, s.G, s.GS, s.SV, s.IP, s.SO, s.WHIP],
        highlight: [2, 8],
      }))
    : MOCK_STATS_HITTER.season.map((s) => ({
        year: s.year,
        cells: [s.PA, s.AB, s.R, s.H, s.HR, s.SB, s.AVG, s.OBP, s.SLG, s.OPS],
        highlight: [6, 7, 8, 9],
      }));

  const percentiles = pitcher
    ? MOCK_PITCHER_PERCENTILES
    : MOCK_HITTER_PERCENTILES;

  const playerApps = pitcher
    ? ["비주얼 리포트", "3D 피칭", "구종 분포", "유사 투수", "스윙 테이크"]
    : [
        "일러스트레이터",
        "선수 비교",
        "스윙 프로파일",
        "존 스윙",
        "유사 선수",
        "포지셔닝",
      ];

  const TABS = pitcher
    ? [
        { id: "statcast", label: "스탯캐스트" },
        { id: "standard", label: "기본 스탯" },
        { id: "zone", label: "투구존" },
      ]
    : [
        { id: "statcast", label: "스탯캐스트" },
        { id: "standard", label: "기본 스탯" },
        { id: "hotcold", label: "핫/콜드존" },
      ];

  return (
    <div>
      {/* 상단 검색창 */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 relative z-40">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="relative">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowResults(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="선수 이름 입력"
                className="w-48 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
              >
                {searchLoading ? "⏳" : "🔍"}
              </button>
            </div>
            {showResults && <SearchDropdown results={searchResults} />}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:block">
              현재:{" "}
              <span className="font-bold text-gray-600">
                {playerBasic.playerName}
              </span>
            </span>
            {/* 투수/타자 뱃지 - DB 포지션값 그대로 표시 */}
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: heroAccent }}
            >
              {pitcher ? "🔥 투수" : "🏏 타자"}
            </span>
          </div>
          <button
            onClick={() => {
              setPlayerBasic(null);
              setSearchInput("");
              setError(null);
              setShowResults(false);
            }}
            className="ml-auto text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            목록으로
          </button>
        </div>
      </div>

      {/* ── HERO ── */}
      <div
        style={{
          background: `linear-gradient(160deg, ${tc.bg} 0%, ${tc.accent === "#000000" ? "#1e1e2e" : tc.accent} 55%, #0f0f1a 100%)`,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* 사진 + 기본정보 */}
            <div className="lg:col-span-2 flex items-start gap-5">
              <div className="relative flex-shrink-0">
                <div
                  className="w-32 h-32 rounded-2xl overflow-hidden border-4 shadow-2xl"
                  style={{
                    borderColor: "rgba(255,255,255,0.2)",
                    background: `${tc.bg}60`,
                  }}
                >
                  <PlayerAvatar
                    id={playerBasic.pid}
                    name={playerBasic.playerName}
                    size={128}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-lg">
                  <PlayerAvatar
                    id={playerBasic.pid}
                    name={playerBasic.playerName}
                    size={44}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-white/50 text-sm font-medium">
                    #{playerBasic.playerNumber}
                  </span>
                  <span className="text-white/30 text-xs">·</span>
                  {/* DB 원본값 표시: "투수(좌투좌타)" */}
                  <span className="text-white/60 text-sm font-medium">
                    {playerBasic.playerMPosition}
                  </span>
                </div>
                <h1 className="text-3xl font-black text-white leading-tight tracking-tight">
                  {playerBasic.playerName}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                    style={{
                      backgroundColor:
                        tc.accent === "#000000" ? "#374151" : tc.accent,
                    }}
                  >
                    {playerBasic.playerEnter?.[0]}
                  </div>
                  <span className="text-white/80 text-sm font-bold">
                    {playerBasic.playerEnter}
                  </span>
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: heroAccent }}
                  >
                    {pitcher ? "🔥 투수" : "🏏 타자"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/50">
                  <span>{hwStr}</span>
                  <span>·</span>
                  <span>{ageStr}</span>
                  {salaryStr !== "-" && (
                    <>
                      <span>·</span>
                      <span>연봉 {salaryStr}</span>
                    </>
                  )}
                </div>
                {playerBasic.playerDraft && (
                  <p className="text-xs text-white/40 mt-1">
                    입단 {playerBasic.playerDraft}
                  </p>
                )}
                {/* 주요 스탯 배지 */}
                <div className="flex gap-2 mt-4 flex-wrap">
                  {heroBadges.map(({ label, val, color }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center px-3 py-1.5 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.1)" }}
                    >
                      <span className="text-white/50 text-xs font-medium">
                        {label}
                      </span>
                      <span
                        className="font-black text-base leading-tight"
                        style={{ color }}
                      >
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 시즌 기록 테이블 */}
            <div className="lg:col-span-3">
              <div
                className="rounded-2xl overflow-hidden border border-white/10"
                style={{ background: "rgba(0,0,0,0.25)" }}
              >
                <div className="px-4 py-2.5 border-b border-white/10">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    시즌 기록
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="px-3 py-2 text-left text-xs font-bold text-white/30">
                          시즌
                        </th>
                        {heroHeaders.map((h) => (
                          <th
                            key={h}
                            className={`px-2 py-2 text-center text-xs font-bold ${
                              pitcher
                                ? ["ERA", "WHIP"].includes(h)
                                  ? "text-orange-300"
                                  : "text-white/30"
                                : ["AVG", "OBP", "SLG", "OPS"].includes(h)
                                  ? "text-blue-300"
                                  : "text-white/30"
                            }`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {heroRows.map((row, i) => (
                        <tr
                          key={i}
                          className={`border-b border-white/5 ${i === 0 ? "bg-white/10" : "hover:bg-white/5"}`}
                        >
                          <td className="px-3 py-2.5 text-sm font-black text-white">
                            {row.year}
                          </td>
                          {row.cells.map((cell, ci) => (
                            <td
                              key={ci}
                              className={`px-2 py-2.5 text-center text-xs ${row.highlight.includes(ci) ? "font-black text-yellow-300" : "text-white/50"}`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PERCENTILE RANKINGS ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">
              KBO 퍼센타일 랭킹 · {pitcher ? "투수" : "타자"}
            </h2>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {(
                [
                  ["90+", "#EF4444"],
                  ["70-89", "#F97316"],
                  ["40-69", "#3B82F6"],
                  ["-39", "#6B7280"],
                ] as [string, string][]
              ).map(([l, c]) => (
                <div key={l} className="flex items-center gap-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: c }}
                  />
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {percentiles.map((p) => (
              <PercentileRing
                key={p.label}
                label={p.label}
                pct={p.pct}
                val={p.val}
                inverse={p.inverse}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── PLAYER APPS ── */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-400 mr-1">바로가기</span>
          {playerApps.map((app) => (
            <button
              key={app}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-sm"
            >
              {app}
            </button>
          ))}
        </div>
      </div>

      {/* ── 탭 바 ── */}
      <div className="bg-white border-b border-gray-100 sticky top-14 z-30">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? ""
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
                style={
                  activeTab === tab.id
                    ? { borderBottomColor: heroAccent, color: heroAccent }
                    : {}
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {["2023", "2024", "2025"].map((yr, i) => (
              <button
                key={yr}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${i === 2 ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 탭 콘텐츠 ── */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {pitcher ? (
          <>
            {activeTab === "statcast" && <PitcherStatcastTab />}
            {activeTab === "standard" && <PitcherStandardTab />}
            {activeTab === "zone" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1 h-5 rounded-full bg-blue-500" />
                  <h3 className="font-bold text-gray-800">
                    투구 분포도 (존별)
                  </h3>
                </div>
                <div className="flex justify-center">
                  <PitchZoneGrid />
                </div>
                <div className="flex items-center gap-1 mt-4 justify-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-1">
                      <div
                        className="w-8 h-4 rounded"
                        style={{ backgroundColor: stepColors[s].bg }}
                      />
                      <span className="text-xs text-gray-400">
                        {["저빈도", "", "", "", "고빈도"][s - 1]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {activeTab === "statcast" && <HitterStatcastTab />}
            {activeTab === "standard" && <StatsTab stats={MOCK_STATS_HITTER} />}
            {activeTab === "hotcold" && <HotColdTab data={MOCK_HOT_COLD} />}
          </>
        )}
      </div>
    </div>
  );
}
