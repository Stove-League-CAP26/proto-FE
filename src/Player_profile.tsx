import { useState } from "react";

// ═══════════════════════════════════════════════════════════
//  목업 데이터
// ═══════════════════════════════════════════════════════════

const TEAM_COLORS = {
  두산: { bg: "#131230", accent: "#C8102E" },
  LG: { bg: "#C30452", accent: "#000000" },
  KIA: { bg: "#EA0029", accent: "#05141F" },
  삼성: { bg: "#1428A0", accent: "#C0C0C0" },
  NC: { bg: "#071D39", accent: "#BFA253" },
  SSG: { bg: "#CE0E2D", accent: "#FFB81C" },
  롯데: { bg: "#041E42", accent: "#E61E2B" },
  한화: { bg: "#FF6600", accent: "#000000" },
  키움: { bg: "#820024", accent: "#FFB81C" },
  KT: { bg: "#000000", accent: "#E40E20" },
};

const MOCK_BEST = {
  hitter: {
    WAR: [
      { rank: 1, name: "안현민", team: "LG", val: "7.22", id: 67890 },
      { rank: 2, name: "송성문", team: "키움", val: "5.84", id: 67891 },
      { rank: 3, name: "이정후", team: "키움", val: "5.23", id: 67892 },
      { rank: 4, name: "양의지", team: "두산", val: "4.78", id: 65207 },
    ],
    AVG: [
      { rank: 1, name: "양의지", team: "두산", val: "0.337", id: 65207 },
      { rank: 2, name: "이정후", team: "키움", val: "0.334", id: 67892 },
      { rank: 3, name: "김성윤", team: "삼성", val: "0.331", id: 67894 },
      { rank: 4, name: "박해민", team: "LG", val: "0.326", id: 67895 },
    ],
    HR: [
      { rank: 1, name: "호세", team: "두산", val: "50개", id: 67896 },
      { rank: 2, name: "박병호", team: "KT", val: "38개", id: 67897 },
      { rank: 3, name: "피렐라", team: "삼성", val: "36개", id: 67898 },
      { rank: 4, name: "노시환", team: "한화", val: "32개", id: 67899 },
    ],
    RBI: [
      { rank: 1, name: "호세", team: "두산", val: "118타점", id: 67896 },
      { rank: 2, name: "피렐라", team: "삼성", val: "100타점", id: 67898 },
      { rank: 3, name: "노시환", team: "한화", val: "95타점", id: 67899 },
      { rank: 4, name: "박병호", team: "KT", val: "90타점", id: 67897 },
    ],
    SB: [
      { rank: 1, name: "박찬호", team: "NC", val: "49개", id: 67901 },
      { rank: 2, name: "안주영", team: "SSG", val: "44개", id: 67902 },
      { rank: 3, name: "정수빈", team: "두산", val: "37개", id: 67903 },
      { rank: 4, name: "손주영", team: "롯데", val: "30개", id: 67904 },
    ],
    OPS: [
      { rank: 1, name: "호세", team: "두산", val: "1.025", id: 67896 },
      { rank: 2, name: "오스틴", team: "LG", val: "1.018", id: 67905 },
      { rank: 3, name: "피렐라", team: "삼성", val: "0.989", id: 67898 },
      { rank: 4, name: "양의지", team: "두산", val: "0.939", id: 65207 },
    ],
  },
  pitcher: {
    WAR: [
      { rank: 1, name: "안우진", team: "키움", val: "6.91", id: 68001 },
      { rank: 2, name: "고영표", team: "KT", val: "5.44", id: 68002 },
      { rank: 3, name: "원태인", team: "삼성", val: "5.12", id: 68003 },
      { rank: 4, name: "김광현", team: "SSG", val: "4.98", id: 68004 },
    ],
    ERA: [
      { rank: 1, name: "안우진", team: "키움", val: "2.11", id: 68001 },
      { rank: 2, name: "원태인", team: "삼성", val: "2.45", id: 68003 },
      { rank: 3, name: "고영표", team: "KT", val: "2.78", id: 68002 },
      { rank: 4, name: "김광현", team: "SSG", val: "2.91", id: 68004 },
    ],
    WIN: [
      { rank: 1, name: "원태인", team: "삼성", val: "19승", id: 68003 },
      { rank: 2, name: "안우진", team: "키움", val: "17승", id: 68001 },
      { rank: 3, name: "고영표", team: "KT", val: "16승", id: 68002 },
      { rank: 4, name: "김광현", team: "SSG", val: "15승", id: 68004 },
    ],
    KK: [
      { rank: 1, name: "안우진", team: "키움", val: "225개", id: 68001 },
      { rank: 2, name: "원태인", team: "삼성", val: "198개", id: 68003 },
      { rank: 3, name: "고영표", team: "KT", val: "187개", id: 68002 },
      { rank: 4, name: "김광현", team: "SSG", val: "175개", id: 68004 },
    ],
    SAVE: [
      { rank: 1, name: "고우석", team: "LG", val: "38세이브", id: 68005 },
      { rank: 2, name: "김원중", team: "롯데", val: "31세이브", id: 68006 },
      { rank: 3, name: "조상우", team: "키움", val: "28세이브", id: 68007 },
      { rank: 4, name: "노경은", team: "KIA", val: "25세이브", id: 68008 },
    ],
    SPD: [
      { rank: 1, name: "안우진", team: "키움", val: "157km/h", id: 68001 },
      { rank: 2, name: "고우석", team: "LG", val: "155km/h", id: 68005 },
      { rank: 3, name: "원태인", team: "삼성", val: "153km/h", id: 68003 },
      { rank: 4, name: "김서현", team: "한화", val: "152km/h", id: 68009 },
    ],
  },
};

const MOCK_PLAYER = {
  id: 65207,
  name: "양의지",
  number: 25,
  team: "두산",
  teamColor: "#131230",
  teamAccent: "#C8102E",
  position: "포수",
  bats: "우투우타",
  height: 180,
  weight: 95,
  blood: "A형",
  nation: "대한민국",
  born: "1987.06.05 (37세)",
  draft: "2006년 1차 2순위 (두산)",
  salary: "15억",
  awards: ["골든글러브 8회", "MVP 2회", "올스타 12회"],
  playstyle: "공격형",
  radarData: { 외모: 82, 성격: 75, 잠재력: 90, 자산: 85, 직업: 88, 집중: 92 },
  career: [
    { year: "2006~2017", team: "두산 베어스", note: "1군 통산" },
    { year: "2018~2019", team: "NC 다이노스", note: "FA 이적" },
    { year: "2020~현재", team: "두산 베어스", note: "복귀" },
  ],
};

const MOCK_STATS_HITTER = {
  season: [
    {
      year: 2025,
      team: "두산",
      G: 130,
      PA: 517,
      AB: 454,
      R: 56,
      H: 153,
      "2B": 27,
      "3B": 1,
      HR: 20,
      RBI: 89,
      SB: 4,
      BB: 50,
      SO: 63,
      AVG: "0.337",
      OBP: "0.406",
      SLG: "0.533",
      OPS: "0.939",
    },
    {
      year: 2024,
      team: "두산",
      G: 125,
      PA: 490,
      AB: 430,
      R: 51,
      H: 141,
      "2B": 24,
      "3B": 0,
      HR: 17,
      RBI: 78,
      SB: 2,
      BB: 46,
      SO: 58,
      AVG: "0.328",
      OBP: "0.395",
      SLG: "0.508",
      OPS: "0.903",
    },
    {
      year: 2023,
      team: "두산",
      G: 118,
      PA: 462,
      AB: 408,
      R: 44,
      H: 128,
      "2B": 20,
      "3B": 0,
      HR: 14,
      RBI: 65,
      SB: 1,
      BB: 40,
      SO: 55,
      AVG: "0.314",
      OBP: "0.380",
      SLG: "0.477",
      OPS: "0.857",
    },
  ],
};

const MOCK_HOT_COLD = {
  outer: [
    { val: "0.448", step: 5 },
    { val: "0.250", step: 3 },
    { val: "0.215", step: 3 },
    { val: "0.273", step: 3 },
  ],
  inner: [
    { val: "0.303", step: 4 },
    { val: "0.333", step: 4 },
    { val: "0.290", step: 3 },
    { val: "0.463", step: 5 },
    { val: "0.286", step: 3 },
    { val: "0.400", step: 4 },
    { val: "0.349", step: 4 },
    { val: "0.512", step: 5 },
    { val: "0.259", step: 3 },
  ],
  strikeout: {
    outer: [
      { val: "6.3%", step: 3 },
      { val: "6.3%", step: 3 },
      { val: "25.4%", step: 5 },
      { val: "14.3%", step: 5 },
    ],
    inner: [
      { val: "4.8%", step: 2 },
      { val: "1.6%", step: 1 },
      { val: "7.9%", step: 4 },
      { val: "3.2%", step: 2 },
      { val: "3.2%", step: 2 },
      { val: "1.6%", step: 1 },
      { val: "7.9%", step: 4 },
      { val: "4.8%", step: 2 },
      { val: "12.7%", step: 5 },
    ],
  },
  hitDistrib: { LF: "50.6%", CF: "24.7%", RF: "24.7%" },
};

// ═══════════════════════════════════════════════════════════
//  공통 유틸 & 컴포넌트
// ═══════════════════════════════════════════════════════════

const stepColors = {
  1: { bg: "#3B82F6", text: "#fff" },
  2: { bg: "#93C5FD", text: "#1e3a5f" },
  3: { bg: "#F3F4F6", text: "#374151" },
  4: { bg: "#FCA5A5", text: "#7f1d1d" },
  5: { bg: "#EF4444", text: "#fff" },
};

function PlayerAvatar({ id, name, size = 48 }) {
  const [err, setErr] = useState(false);
  return (
    <div
      className="rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {!err ? (
        <img
          src={`https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/kbo/2025/${id}.png`}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setErr(true)}
        />
      ) : (
        <span style={{ fontSize: size * 0.45 }}>⚾</span>
      )}
    </div>
  );
}

function RadarChart({ data }) {
  const keys = Object.keys(data),
    vals = Object.values(data),
    N = keys.length;
  const cx = 100,
    cy = 100,
    r = 70;
  const angleOf = (i) => (Math.PI * 2 * i) / N - Math.PI / 2;
  const ptOf = (i, val) => {
    const a = angleOf(i),
      d = (val / 100) * r;
    return { x: cx + d * Math.cos(a), y: cy + d * Math.sin(a) };
  };
  const dp = vals.map((v, i) => ptOf(i, v));
  const poly =
    dp.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {[20, 40, 60, 80, 100].map((lv) => (
        <polygon
          key={lv}
          points={keys
            .map((_, i) => {
              const p = ptOf(i, lv);
              return `${p.x},${p.y}`;
            })
            .join(" ")}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="0.7"
        />
      ))}
      {keys.map((_, i) => {
        const p = ptOf(i, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#e5e7eb"
            strokeWidth="0.7"
          />
        );
      })}
      <path
        d={poly}
        fill="rgba(59,130,246,0.2)"
        stroke="#3B82F6"
        strokeWidth="1.5"
      />
      {dp.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#3B82F6" />
      ))}
      {keys.map((k, i) => {
        const a = angleOf(i),
          lx = cx + (r + 18) * Math.cos(a),
          ly = cy + (r + 18) * Math.sin(a);
        return (
          <text
            key={k}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fill="#374151"
            fontWeight="600"
          >
            {k}
          </text>
        );
      })}
    </svg>
  );
}

function HotColdGrid({ outer, inner, title }) {
  return (
    <div className="flex flex-col items-center">
      {title && <p className="text-xs font-bold text-gray-500 mb-2">{title}</p>}
      <div className="relative" style={{ width: 180, height: 180 }}>
        {[
          { d: outer[0], style: { top: 0, left: 0, width: 50, height: 50 } },
          { d: outer[1], style: { top: 0, right: 0, width: 50, height: 50 } },
          { d: outer[2], style: { bottom: 0, left: 0, width: 50, height: 50 } },
          {
            d: outer[3],
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
          {inner.map((c, i) => (
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

// ═══════════════════════════════════════════════════════════
//  BEST 플레이어 페이지
// ═══════════════════════════════════════════════════════════

function WARHeroCard({ player, typeLabel }) {
  const tc = TEAM_COLORS[player.team] || { bg: "#1e293b", accent: "#64748b" };
  return (
    <div
      className="relative rounded-3xl overflow-hidden shadow-xl h-full"
      style={{
        background: `linear-gradient(140deg, ${tc.bg} 0%, ${tc.accent} 100%)`,
      }}
    >
      {/* 배경 장식 원 */}
      <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full border-8 border-white opacity-10" />
      <div className="absolute -left-6 -bottom-6 w-36 h-36 rounded-full border-4 border-white opacity-10" />

      <div className="relative p-8 flex flex-col sm:flex-row items-center gap-6 h-full">
        <div className="flex flex-col items-center gap-3">
          <span
            className="text-5xl"
            style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}
          >
            👑
          </span>
          <div className="w-32 h-32 rounded-2xl border-4 border-white/40 overflow-hidden shadow-lg">
            <PlayerAvatar id={player.id} name={player.name} size={128} />
          </div>
        </div>
        <div className="text-center sm:text-left flex-1">
          <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">
            {typeLabel} · 종합 순위 1등
          </p>
          <h2 className="text-5xl font-black text-white tracking-tight leading-none">
            {player.name}
          </h2>
          <p className="text-white/60 text-lg mt-2 font-medium">
            {player.team}
          </p>
          <div className="mt-5 inline-flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
            <div>
              <p className="text-white/50 text-xs font-medium">WAR 2025</p>
              <p className="text-4xl font-black text-white leading-none">
                {player.val}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WARRankList({ players }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/60">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          WAR 전체 순위
        </p>
      </div>
      <div className="flex-1">
        {players.map((p) => {
          const tc = TEAM_COLORS[p.team] || {
            bg: "#64748b",
            accent: "#94a3b8",
          };
          const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
          return (
            <div
              key={p.rank}
              className={`flex items-center gap-3 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${p.rank === 1 ? "bg-yellow-50/40" : ""}`}
            >
              <span className="text-xl w-7 text-center flex-shrink-0">
                {medals[p.rank] || (
                  <span className="text-sm font-bold text-gray-400">
                    {p.rank}
                  </span>
                )}
              </span>
              <div
                className="w-11 h-11 rounded-full overflow-hidden border-2 flex-shrink-0"
                style={{ borderColor: tc.accent }}
              >
                <PlayerAvatar id={p.id} name={p.name} size={44} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`font-bold truncate ${p.rank === 1 ? "text-gray-900 text-base" : "text-gray-700 text-sm"}`}
                >
                  {p.name}
                </p>
                <p className="text-xs text-gray-400">{p.team}</p>
              </div>
              <span
                className={`font-black ${p.rank === 1 ? "text-amber-500 text-lg" : "text-gray-600 text-sm"}`}
              >
                {p.val}
              </span>
            </div>
          );
        })}
      </div>
      <button className="w-full py-3 text-xs font-semibold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-100">
        더보기 →
      </button>
    </div>
  );
}

function CategoryCard({ label, icon, players, accentColor }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* 헤더 */}
      <div
        className="px-4 py-3 flex items-center gap-2 border-b-2"
        style={{ borderColor: accentColor }}
      >
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-black text-gray-800">{label}</span>
      </div>

      {/* 1위 강조 블록 */}
      <div
        className="px-4 py-4 flex items-center gap-3 border-b border-gray-100"
        style={{ background: `${accentColor}10` }}
      >
        <span className="text-2xl flex-shrink-0">🥇</span>
        <div
          className="w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0"
          style={{ borderColor: accentColor }}
        >
          <PlayerAvatar id={players[0].id} name={players[0].name} size={56} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-gray-900 truncate text-base">
            {players[0].name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{players[0].team}</p>
          <p className="text-sm font-black mt-1" style={{ color: accentColor }}>
            {players[0].val}
          </p>
        </div>
      </div>

      {/* 2~4위 */}
      <div className="flex-1">
        {players.slice(1).map((p) => {
          const medals = { 2: "🥈", 3: "🥉" };
          return (
            <div
              key={p.rank}
              className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/70 transition-colors cursor-pointer"
            >
              <span className="text-sm w-5 text-center flex-shrink-0">
                {medals[p.rank] || (
                  <span className="text-xs font-bold text-gray-400">
                    {p.rank}
                  </span>
                )}
              </span>
              <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                <PlayerAvatar id={p.id} name={p.name} size={36} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-700 truncate">
                  {p.name}
                </p>
                <p className="text-xs text-gray-400">{p.team}</p>
              </div>
              <span className="text-xs font-bold text-gray-500 flex-shrink-0">
                {p.val}
              </span>
            </div>
          );
        })}
      </div>

      <button className="w-full py-2.5 text-xs font-semibold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-100">
        더보기 →
      </button>
    </div>
  );
}

function BestPlayerPage() {
  const [playerType, setPlayerType] = useState("hitter");
  const data = MOCK_BEST[playerType];
  const typeLabel = playerType === "hitter" ? "타자" : "투수";

  const hitterCats = [
    { label: "타율", icon: "🏏", key: "AVG", color: "#3B82F6" },
    { label: "홈런", icon: "💥", key: "HR", color: "#EF4444" },
    { label: "타점", icon: "🎯", key: "RBI", color: "#F59E0B" },
    { label: "도루", icon: "💨", key: "SB", color: "#10B981" },
    { label: "OPS", icon: "📈", key: "OPS", color: "#8B5CF6" },
  ];
  const pitcherCats = [
    { label: "평균자책점", icon: "🛡️", key: "ERA", color: "#3B82F6" },
    { label: "승리", icon: "🏆", key: "WIN", color: "#EF4444" },
    { label: "탈삼진", icon: "🔥", key: "KK", color: "#F59E0B" },
    { label: "세이브", icon: "🔒", key: "SAVE", color: "#10B981" },
    { label: "구속", icon: "⚡", key: "SPD", color: "#8B5CF6" },
  ];
  const categories = playerType === "hitter" ? hitterCats : pitcherCats;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* 타자 / 투수 토글 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">BEST 플레이어</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            2025 KBO 리그 시즌 기준
          </p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1">
          {[
            { id: "hitter", label: "타자" },
            { id: "pitcher", label: "투수" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setPlayerType(t.id)}
              className={`px-7 py-2.5 rounded-xl text-sm font-black transition-all ${
                playerType === t.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── WAR 섹션 ── */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-7 rounded-full bg-amber-400" />
          <h2 className="text-lg font-black text-gray-900">종합 지표 WAR</h2>
          <span className="text-xs bg-amber-50 text-amber-600 font-bold px-2.5 py-1 rounded-full border border-amber-200">
            👑 종합 순위
          </span>
        </div>
        <div
          className="grid grid-cols-1 lg:grid-cols-5 gap-4"
          style={{ minHeight: 240 }}
        >
          {/* 1위 히어로 카드 - 넓게 */}
          <div className="lg:col-span-3">
            <WARHeroCard player={data.WAR[0]} typeLabel={typeLabel} />
          </div>
          {/* 전체 순위 리스트 */}
          <div className="lg:col-span-2">
            <WARRankList players={data.WAR} />
          </div>
        </div>
      </section>

      {/* 구분선 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest px-2">
          부문별 순위
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* ── 부문별 카드 그리드 ── */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.key}
              label={cat.label}
              icon={cat.icon}
              players={data[cat.key]}
              accentColor={cat.color}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  선수 프로필 페이지
// ═══════════════════════════════════════════════════════════

function ProfileTab({ player }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div
          className="rounded-2xl overflow-hidden shadow-lg"
          style={{
            background: `linear-gradient(160deg, ${player.teamColor} 0%, ${player.teamAccent} 100%)`,
          }}
        >
          <div className="flex flex-col items-center pt-8 pb-4 px-4">
            <span className="text-5xl font-black text-white opacity-30 mb-3">
              #{player.number}
            </span>
            <div className="w-32 h-32 rounded-full bg-white/20 border-4 border-white/40 overflow-hidden mb-3">
              <PlayerAvatar id={player.id} name={player.name} size={128} />
            </div>
            <h2 className="text-2xl font-black text-white">{player.name}</h2>
            <p className="text-white/70 text-sm mt-1">
              {player.team} · {player.position} · {player.bats}
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {player.awards.map((a) => (
                <span
                  key={a}
                  className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white"
                >
                  🏆 {a}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-white/10 mx-4 mb-4 rounded-xl px-4 py-2 text-center">
            <p className="text-white/60 text-xs">플레이 스타일</p>
            <p className="text-white font-bold text-lg">{player.playstyle}</p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            선수 정보
          </h3>
          {[
            ["생년월일", player.born],
            ["신장/체중", `${player.height}cm / ${player.weight}kg`],
            ["혈액형", player.blood],
            ["출신국", player.nation],
            ["입단", player.draft],
            ["연봉", player.salary],
            ["포지션", player.position],
          ].map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between py-2.5 border-b border-gray-50 last:border-0"
            >
              <span className="text-sm text-gray-400 font-medium">{k}</span>
              <span className="text-sm text-gray-800 font-semibold">{v}</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            커리어 히스토리
          </h3>
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-100" />
            {player.career.map((c, i) => (
              <div key={i} className="flex gap-4 mb-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center z-10 mt-0.5 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{c.team}</p>
                  <p className="text-xs text-gray-400">
                    {c.year} · {c.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            스탯 레이더
          </h3>
          <div className="w-full aspect-square max-w-xs mx-auto">
            <RadarChart data={player.radarData} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {Object.keys(player.radarData).map((k) => (
              <div
                key={k}
                className="bg-gray-50 rounded-lg px-2 py-1.5 text-center"
              >
                <p className="text-xs text-gray-400">{k}</p>
                <p className="text-sm font-bold text-gray-800">
                  {player.radarData[k]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HotColdTab({ data }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-6 rounded-full bg-red-500 inline-block" />
          <h3 className="font-bold text-gray-800">HOT &amp; COLD ZONE</h3>
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-6 rounded-full bg-yellow-400 inline-block" />
          <h3 className="font-bold text-gray-800">삼진 분포도</h3>
        </div>
        <div className="flex justify-center">
          <HotColdGrid
            outer={data.strikeout.outer}
            inner={data.strikeout.inner}
            title="삼진 비율"
          />
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-6 rounded-full bg-green-500 inline-block" />
          <h3 className="font-bold text-gray-800">타구 분포도</h3>
        </div>
        <div className="flex justify-center">
          <svg viewBox="0 0 200 180" className="w-48 h-44">
            <path d="M100,170 L10,80 Q100,10 190,80 Z" fill="#2d6a2d" />
            <path d="M100,150 L60,110 L100,70 L140,110 Z" fill="#c8a26a" />
            <ellipse cx="100" cy="112" rx="28" ry="28" fill="#2d6a2d" />
            {[
              [100, 70],
              [140, 110],
              [100, 150],
              [60, 110],
            ].map(([x, y], i) => (
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

function StatsTab({ stats }) {
  const cols = [
    "year",
    "team",
    "G",
    "PA",
    "AB",
    "R",
    "H",
    "2B",
    "3B",
    "HR",
    "RBI",
    "SB",
    "BB",
    "SO",
    "AVG",
    "OBP",
    "SLG",
    "OPS",
  ];
  const highlight = ["AVG", "OBP", "SLG", "OPS", "HR", "RBI"];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "타율",
            val: stats.season[0].AVG,
            color: "from-blue-500 to-blue-600",
          },
          {
            label: "홈런",
            val: stats.season[0].HR,
            color: "from-red-500 to-red-600",
          },
          {
            label: "타점",
            val: stats.season[0].RBI,
            color: "from-amber-500 to-amber-600",
          },
          {
            label: "OPS",
            val: stats.season[0].OPS,
            color: "from-emerald-500 to-emerald-600",
          },
        ].map(({ label, val, color }) => (
          <div
            key={label}
            className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-white shadow-sm`}
          >
            <p className="text-white/70 text-xs font-medium">{label}</p>
            <p className="text-3xl font-black mt-0.5">{val}</p>
            <p className="text-white/60 text-xs mt-1">2025 시즌</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-800">시즌 타격 기록</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {cols.map((c) => (
                  <th
                    key={c}
                    className={`px-3 py-2.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap ${highlight.includes(c) ? "text-blue-600" : "text-gray-400"}`}
                  >
                    {c === "year" ? "연도" : c === "team" ? "팀" : c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.season.map((row, i) => (
                <tr
                  key={i}
                  className={`border-t border-gray-50 ${i === 0 ? "bg-blue-50/40" : "hover:bg-gray-50"}`}
                >
                  {cols.map((c) => (
                    <td
                      key={c}
                      className={`px-3 py-3 text-center whitespace-nowrap ${highlight.includes(c) ? "font-bold text-gray-800" : "text-gray-500"}`}
                    >
                      {row[c]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-800 mb-4">OPS 연도별 추이</h3>
        <div className="space-y-3">
          {stats.season.map((row) => {
            const pct = (parseFloat(row.OPS) / 1.2) * 100;
            return (
              <div key={row.year} className="flex items-center gap-3">
                <span className="w-10 text-sm font-bold text-gray-500">
                  {row.year}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center justify-end pr-2"
                    style={{
                      width: `${pct}%`,
                      background: "linear-gradient(90deg,#3b82f6,#06b6d4)",
                    }}
                  >
                    <span className="text-xs font-bold text-white">
                      {row.OPS}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const PLAYER_TABS = [
  { id: "profile", label: "프로필", icon: "👤" },
  { id: "hotcold", label: "핫/콜드 존", icon: "🔥" },
  { id: "stats", label: "선수 스탯", icon: "📊" },
];

function PlayerProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const player = MOCK_PLAYER;
  return (
    <div>
      {/* 선수 배너 */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${player.teamColor} 0%, ${player.teamAccent} 60%, #1e1e2e 100%)`,
        }}
      >
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full border-4 border-white opacity-10" />
        <div className="max-w-6xl mx-auto px-4 py-6 relative">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 overflow-hidden flex-shrink-0">
              <PlayerAvatar id={player.id} name={player.name} size={80} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  #{player.number}
                </span>
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {player.position}
                </span>
                <span className="bg-yellow-400/80 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  🏆 골든글러브
                </span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                {player.name}
              </h1>
              <p className="text-white/60 text-sm">
                {player.team} · {player.bats}
              </p>
            </div>
            <div className="ml-auto hidden sm:flex gap-6">
              {[
                ["타율", "0.337"],
                ["홈런", "20"],
                ["OPS", "0.939"],
              ].map(([k, v]) => (
                <div key={k} className="text-center">
                  <p className="text-white/50 text-xs">{k}</p>
                  <p className="text-white text-xl font-black">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="bg-white border-b border-gray-100 sticky top-14 z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex">
            {PLAYER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === "profile" && <ProfileTab player={player} />}
        {activeTab === "hotcold" && <HotColdTab data={MOCK_HOT_COLD} />}
        {activeTab === "stats" && <StatsTab stats={MOCK_STATS_HITTER} />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  팀 목업 데이터
// ═══════════════════════════════════════════════════════════

const TEAMS_LIST = [
  {
    id: "KIA",
    name: "KIA 타이거즈",
    short: "KIA",
    city: "광주",
    emoji: "🐯",
    bg: "#EA0029",
    accent: "#05141F",
    stadium: "광주-기아 챔피언스 필드",
  },
  {
    id: "두산",
    name: "두산 베어스",
    short: "두산",
    city: "서울",
    emoji: "🐻",
    bg: "#131230",
    accent: "#C8102E",
    stadium: "잠실 야구장",
  },
  {
    id: "LG",
    name: "LG 트윈스",
    short: "LG",
    city: "서울",
    emoji: "⚡",
    bg: "#C30452",
    accent: "#000000",
    stadium: "잠실 야구장",
  },
  {
    id: "삼성",
    name: "삼성 라이온즈",
    short: "삼성",
    city: "대구",
    emoji: "🦁",
    bg: "#1428A0",
    accent: "#C0C0C0",
    stadium: "대구 삼성 라이온즈 파크",
  },
  {
    id: "NC",
    name: "NC 다이노스",
    short: "NC",
    city: "창원",
    emoji: "🦕",
    bg: "#071D39",
    accent: "#BFA253",
    stadium: "창원 NC 파크",
  },
  {
    id: "SSG",
    name: "SSG 랜더스",
    short: "SSG",
    city: "인천",
    emoji: "🚀",
    bg: "#CE0E2D",
    accent: "#FFB81C",
    stadium: "인천 SSG 랜더스필드",
  },
  {
    id: "롯데",
    name: "롯데 자이언츠",
    short: "롯데",
    city: "부산",
    emoji: "🌊",
    bg: "#041E42",
    accent: "#E61E2B",
    stadium: "사직 야구장",
  },
  {
    id: "한화",
    name: "한화 이글스",
    short: "한화",
    city: "대전",
    emoji: "🦅",
    bg: "#FF6600",
    accent: "#000000",
    stadium: "한화생명 이글스파크",
  },
  {
    id: "키움",
    name: "키움 히어로즈",
    short: "키움",
    city: "서울",
    emoji: "🦸",
    bg: "#820024",
    accent: "#FFB81C",
    stadium: "고척 스카이돔",
  },
  {
    id: "KT",
    name: "KT 위즈",
    short: "KT",
    city: "수원",
    emoji: "🧙",
    bg: "#000000",
    accent: "#E40E20",
    stadium: "수원 KT 위즈파크",
  },
];

const MOCK_TEAM_DATA = {
  KIA: {
    founded: "1982년",
    championship: "11회 (최다)",
    manager: "이범호",
    ranking2025: "1위",
    wins: 88,
    losses: 55,
    draws: 1,
    radar: { 타격: 88, 투구: 82, 수비: 79, 주루: 85, 불펜: 76, 팀결속: 90 },
    history: [
      { year: "1982", event: "해태 타이거즈 창단" },
      { year: "1986~1989", event: "4연패 달성 (KBO 최초)" },
      { year: "2001", event: "KIA 자동차 인수 → KIA 타이거즈" },
      { year: "2009", event: "통합우승 달성" },
      { year: "2017", event: "11번째 한국시리즈 우승" },
      { year: "2024", event: "통합우승 달성" },
    ],
    roster: {
      pitcher: [
        { no: 34, name: "양현종", pos: "선발", id: 63762 },
        { no: 47, name: "네일", pos: "선발", id: 64001 },
        { no: 21, name: "윤영철", pos: "선발", id: 68100 },
        { no: 29, name: "변우혁", pos: "불펜", id: 68101 },
        { no: 52, name: "정해영", pos: "마무리", id: 68102 },
      ],
      catcher: [
        { no: 2, name: "한승택", pos: "포수", id: 68103 },
        { no: 35, name: "김태군", pos: "포수", id: 63507 },
      ],
      infield: [
        { no: 5, name: "김도영", pos: "유격수", id: 76232 },
        { no: 8, name: "이창진", pos: "2루수", id: 68104 },
        { no: 25, name: "최원준", pos: "1루수", id: 68105 },
        { no: 36, name: "박찬호", pos: "3루수", id: 68106 },
      ],
      outfield: [
        { no: 1, name: "나성범", pos: "우익수", id: 64300 },
        { no: 10, name: "이우성", pos: "좌익수", id: 68107 },
        { no: 14, name: "소크라테스", pos: "중견수", id: 68108 },
      ],
    },
    depthMap: {
      // position: [선수명, WAR]
      좌익수: [
        ["이우성", "2.1"],
        ["김성윤", "1.4"],
      ],
      중견수: [
        ["소크라테스", "3.2"],
        ["이창진", "1.1"],
      ],
      우익수: [
        ["나성범", "2.8"],
        ["김호령", "0.9"],
      ],
      유격수: [
        ["김도영", "6.2"],
        ["이형종", "0.5"],
      ],
      "2루수": [
        ["박찬호", "3.1"],
        ["김선빈", "1.2"],
      ],
      "1루수": [
        ["최원준", "2.0"],
        ["윤도현", "0.8"],
      ],
      "3루수": [
        ["위즈덤", "2.4"],
        ["오선우", "1.0"],
      ],
      포수: [
        ["한승택", "1.8"],
        ["김태군", "1.1"],
      ],
      지명타자: [
        ["전상현", "1.5"],
        ["황대인", "0.7"],
      ],
    },
    cheers: [
      { title: "KIA 있지는 것 같아", type: "응원가" },
      { title: "라이언킹", type: "응원가" },
      { title: "사랑한다 KIA", type: "응원가" },
      { title: "광주의 명성 승리의 이름", type: "구장송" },
      { title: "범벅송", type: "응원가" },
      { title: "KIA를 응원하여", type: "응원가" },
    ],
    players_notable: [
      { no: 5, name: "김도영", pos: "유격수", id: 76232 },
      { no: 34, name: "양현종", pos: "투수", id: 63762 },
      { no: 1, name: "나성범", pos: "외야수", id: 64300 },
      { no: 2, name: "한승택", pos: "포수", id: 68103 },
      { no: 47, name: "네일", pos: "투수", id: 64001 },
      { no: 21, name: "윤영철", pos: "투수", id: 68100 },
    ],
    mascots: [
      { name: "호걸이", period: "2017~", emoji: "🐯" },
      { name: "호연이", period: "2017~", emoji: "🐯" },
      { name: "하랑이", period: "2024~", emoji: "🐯" },
      { name: "호돌이", period: "1996~2016", emoji: "🐯" },
      { name: "이름불명", period: "2001~2009", emoji: "🐯" },
    ],
    logoHistory: [
      { era: "해태 타이거즈", period: "1982~2001", color: "#f59e0b" },
      { era: "KIA 타이거즈 초기", period: "2001~2016", color: "#EA0029" },
      { era: "KIA 타이거즈 현재", period: "2017~", color: "#EA0029" },
    ],
    uniforms: ["홈 (흰색)", "원정 (회색)", "대안 (빨강)", "특별판 (검정)"],
  },
};

// 다른 팀은 KIA 데이터 복사 후 이름만 변경 (프로토타입)
TEAMS_LIST.forEach((t) => {
  if (!MOCK_TEAM_DATA[t.id]) {
    MOCK_TEAM_DATA[t.id] = {
      ...MOCK_TEAM_DATA["KIA"],
      radar: {
        타격: Math.floor(70 + Math.random() * 20),
        투구: Math.floor(70 + Math.random() * 20),
        수비: Math.floor(70 + Math.random() * 20),
        주루: Math.floor(70 + Math.random() * 20),
        불펜: Math.floor(70 + Math.random() * 20),
        팀결속: Math.floor(70 + Math.random() * 20),
      },
    };
  }
});

// ── 육각형 레이더 (팀용) ──────────────────────────────────────
function HexRadar({ data }) {
  const keys = Object.keys(data),
    vals = Object.values(data),
    N = keys.length;
  const cx = 120,
    cy = 120,
    r = 85;
  const angleOf = (i) => (Math.PI * 2 * i) / N - Math.PI / 2;
  const ptOf = (i, val) => {
    const a = angleOf(i),
      d = (val / 100) * r;
    return { x: cx + d * Math.cos(a), y: cy + d * Math.sin(a) };
  };
  const dp = vals.map((v, i) => ptOf(i, v));
  const poly =
    dp.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
  // 황금색 육각형 (이미지 참고)
  const hexLevels = [20, 40, 60, 80, 100];
  return (
    <svg viewBox="0 0 240 240" className="w-full h-full">
      <defs>
        <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {/* 배경 다크 */}
      <rect width="240" height="240" fill="#1a1a2e" rx="12" />
      {/* 그리드 */}
      {hexLevels.map((lv) => (
        <polygon
          key={lv}
          points={keys
            .map((_, i) => {
              const p = ptOf(i, lv);
              return `${p.x},${p.y}`;
            })
            .join(" ")}
          fill="none"
          stroke="#ffffff20"
          strokeWidth="1"
        />
      ))}
      {/* 축 */}
      {keys.map((_, i) => {
        const p = ptOf(i, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#ffffff15"
            strokeWidth="1"
          />
        );
      })}
      {/* 데이터 */}
      <path
        d={poly}
        fill="url(#hexGrad)"
        stroke="#f59e0b"
        strokeWidth="2"
        opacity="0.9"
      />
      {dp.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#f59e0b" />
      ))}
      {/* 라벨 */}
      {keys.map((k, i) => {
        const a = angleOf(i),
          lx = cx + (r + 22) * Math.cos(a),
          ly = cy + (r + 22) * Math.sin(a);
        return (
          <g key={k}>
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fill="#fbbf24"
              fontWeight="700"
            >
              {k}
            </text>
            <text
              x={lx}
              y={ly + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="8"
              fill="#ffffff60"
            >
              {vals[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── 야구장 뎁스 차트 ─────────────────────────────────────────
function DepthFieldChart({ depthMap, teamColor }) {
  // 포지션별 위치 (SVG 200x180 기준)
  const positions = {
    좌익수: { x: 42, y: 60 },
    중견수: { x: 100, y: 32 },
    우익수: { x: 158, y: 60 },
    유격수: { x: 72, y: 95 },
    "2루수": { x: 118, y: 88 },
    "1루수": { x: 138, y: 108 },
    "3루수": { x: 62, y: 108 },
    포수: { x: 100, y: 148 },
    지명타자: { x: 100, y: 168 },
  };
  return (
    <div
      className="relative"
      style={{
        background: "#2d6a2d",
        borderRadius: 12,
        overflow: "hidden",
        paddingBottom: "60%",
      }}
    >
      <div className="absolute inset-0">
        {/* 야구장 SVG 배경 */}
        <svg viewBox="0 0 200 180" className="w-full h-full">
          <path d="M100,175 L5,85 Q100,5 195,85 Z" fill="#2d6a2d" />
          <path d="M100,155 L50,105 L100,58 L150,105 Z" fill="#c8a26a" />
          <ellipse cx="100" cy="108" rx="30" ry="30" fill="#2d6a2d" />
          {[
            [100, 58],
            [150, 105],
            [100, 155],
            [50, 105],
          ].map(([x, y], i) => (
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
            points="97,163 103,163 106,170 100,175 94,170"
            fill="white"
          />
          <line
            x1="100"
            y1="175"
            x2="5"
            y2="85"
            stroke="white"
            strokeWidth="1"
            opacity="0.4"
          />
          <line
            x1="100"
            y1="175"
            x2="195"
            y2="85"
            stroke="white"
            strokeWidth="1"
            opacity="0.4"
          />
        </svg>
        {/* 포지션 카드 */}
        {Object.entries(positions).map(([pos, coord]) => {
          const players = depthMap[pos] || [];
          return (
            <div
              key={pos}
              className="absolute"
              style={{
                left: `${(coord.x / 200) * 100}%`,
                top: `${(coord.y / 180) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className="rounded px-1.5 py-1 text-center shadow-lg"
                style={{ backgroundColor: teamColor, minWidth: 52 }}
              >
                {players.map((p, i) => (
                  <p
                    key={i}
                    className="text-white font-bold leading-tight"
                    style={{
                      fontSize: i === 0 ? 8 : 7,
                      opacity: i === 0 ? 1 : 0.75,
                    }}
                  >
                    {p[0]}
                    <span className="opacity-60 ml-0.5">{p[1]}</span>
                  </p>
                ))}
              </div>
            </div>
          );
        })}
        <p className="absolute bottom-1 right-2 text-white/40 text-xs">
          *시즌 WAR/144
        </p>
      </div>
    </div>
  );
}

// ── 팀 내부 탭들 ─────────────────────────────────────────────

function TeamIntroTab({ team, data }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 로고 + 기본정보 */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center gap-4">
          <div
            className="w-28 h-28 rounded-2xl flex items-center justify-center text-7xl shadow-inner"
            style={{
              background: `linear-gradient(135deg, ${team.bg}22, ${team.accent}22)`,
            }}
          >
            {team.emoji}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black text-gray-900">{team.name}</h2>
            <p className="text-gray-400 text-sm mt-1">
              {team.city} · {team.stadium}
            </p>
          </div>
          <div className="w-full grid grid-cols-3 gap-2 mt-2">
            {[
              { label: "창단", val: data.founded },
              { label: "우승", val: data.championship },
              { label: "감독", val: data.manager },
            ].map(({ label, val }) => (
              <div
                key={label}
                className="bg-gray-50 rounded-xl p-2.5 text-center"
              >
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-xs font-bold text-gray-800 mt-0.5 leading-tight">
                  {val}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 2025 시즌 성적 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            2025 시즌
          </h3>
          <div className="flex items-center justify-center gap-6">
            {[
              { label: "승", val: data.wins, color: "text-blue-600" },
              { label: "패", val: data.losses, color: "text-red-500" },
              { label: "무", val: data.draws, color: "text-gray-400" },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center">
                <p className={`text-3xl font-black ${color}`}>{val}</p>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 text-center">
            <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full border border-yellow-200">
              🏆 {data.ranking2025}
            </span>
          </div>
        </div>

        {/* 구단 히스토리 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            구단 히스토리
          </h3>
          <div className="relative">
            <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gray-100" />
            {data.history.map((h, i) => (
              <div key={i} className="flex gap-3 mb-3 relative">
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 z-10 mt-0.5 border-2"
                  style={{ backgroundColor: team.bg, borderColor: team.accent }}
                />
                <div>
                  <p className="text-xs font-black text-gray-500">{h.year}</p>
                  <p className="text-sm text-gray-700">{h.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 육각형 레이더 */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            팀 능력치
          </h3>
          <div className="w-full aspect-square max-w-sm mx-auto">
            <HexRadar data={data.radar} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {Object.entries(data.radar).map(([k, v]) => (
              <div
                key={k}
                className="rounded-xl p-2.5 text-center"
                style={{ background: `${team.bg}15` }}
              >
                <p className="text-xs text-gray-500 font-medium">{k}</p>
                <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${v}%`, backgroundColor: team.bg }}
                  />
                </div>
                <p
                  className="text-xs font-bold mt-1"
                  style={{ color: team.bg }}
                >
                  {v}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamDepthTab({ team, data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 주전 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div
            className="px-5 py-3 border-b border-gray-100 flex items-center gap-2"
            style={{ borderLeftWidth: 4, borderLeftColor: team.bg }}
          >
            <span className="font-black text-gray-800">주전</span>
            <span className="text-xs text-gray-400">2025 시즌 기준</span>
          </div>
          <div className="p-4">
            <DepthFieldChart depthMap={data.depthMap} teamColor={team.bg} />
          </div>
        </div>
        {/* 엔트리 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div
            className="px-5 py-3 border-b border-gray-100 flex items-center gap-2"
            style={{ borderLeftWidth: 4, borderLeftColor: team.accent }}
          >
            <span className="font-black text-gray-800">엔트리</span>
            <span className="text-xs text-gray-400">2025 시즌 기준</span>
          </div>
          <div className="p-4">
            <DepthFieldChart
              depthMap={data.depthMap}
              teamColor={team.accent === "#000000" ? "#444" : team.accent}
            />
          </div>
        </div>
      </div>

      {/* 포지션별 명단 테이블 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-800">포지션별 선수 명단</h3>
        </div>
        {["pitcher", "catcher", "infield", "outfield"].map((cat) => {
          const labels = {
            pitcher: "투수",
            catcher: "포수",
            infield: "내야수",
            outfield: "외야수",
          };
          return (
            <div key={cat} className="border-b border-gray-50 last:border-0">
              <div className="px-5 py-2 bg-gray-50">
                <span className="text-xs font-bold text-gray-500 uppercase">
                  {labels[cat]}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {(data.roster[cat] || []).map((p) => (
                  <div
                    key={p.no}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                      <PlayerAvatar id={p.id} name={p.name} size={36} />
                    </div>
                    <span className="w-8 text-xs font-bold text-gray-400">
                      #{p.no}
                    </span>
                    <span className="flex-1 text-sm font-semibold text-gray-800">
                      {p.name}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {p.pos}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TeamPlayersTab({ team, data, onSelectPlayer }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          선수를 클릭하면 개인 페이지로 이동합니다
        </p>
      </div>
      {["pitcher", "catcher", "infield", "outfield"].map((cat) => {
        const labels = {
          pitcher: "투수진",
          catcher: "포수진",
          infield: "내야수",
          outfield: "외야수",
        };
        const players = data.roster[cat] || [];
        return (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-1 h-5 rounded-full"
                style={{ backgroundColor: team.bg }}
              />
              <h3 className="font-bold text-gray-700">{labels[cat]}</h3>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {players.map((p) => (
                <button
                  key={p.no}
                  onClick={onSelectPlayer}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex flex-col items-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
                >
                  <div
                    className="w-16 h-16 rounded-xl overflow-hidden border-2 group-hover:border-opacity-100 transition-colors"
                    style={{ borderColor: `${team.bg}40` }}
                  >
                    <PlayerAvatar id={p.id} name={p.name} size={64} />
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded text-white"
                        style={{ backgroundColor: team.bg }}
                      >
                        {p.no}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-800 leading-tight">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.pos}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TeamCheersTab({ team, data }) {
  const [playing, setPlaying] = useState(null);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 뮤직 플레이어 UI */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">
          응원가 플레이어
        </h3>
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            background: `linear-gradient(135deg, ${team.bg}, ${team.accent === "#000000" ? "#333" : team.accent})`,
          }}
        >
          <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center mx-auto mb-4 text-4xl">
            {playing !== null ? "🎵" : "🎶"}
          </div>
          <p className="text-white font-black text-lg">
            {playing !== null
              ? data.cheers[playing].title
              : "재생할 응원가 선택"}
          </p>
          <p className="text-white/60 text-sm mt-1">{team.name}</p>
          {/* 가상 progress bar */}
          <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/70 rounded-full"
              style={{ width: playing !== null ? "45%" : "0%" }}
            />
          </div>
          <div className="flex items-center justify-center gap-4 mt-5">
            {["⏮", playing !== null ? "⏸" : "▶", "⏭"].map((btn, i) => (
              <button
                key={i}
                onClick={() =>
                  i === 1 && setPlaying(playing !== null ? null : 0)
                }
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-lg transition-colors"
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 응원가 목록 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-800">응원가 목록</h3>
          <p className="text-xs text-gray-400 mt-0.5">클릭하여 재생</p>
        </div>
        <div className="divide-y divide-gray-50">
          {data.cheers.map((c, i) => (
            <button
              key={i}
              onClick={() => setPlaying(i)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left ${playing === i ? "bg-blue-50/50" : ""}`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                style={{
                  backgroundColor: playing === i ? team.bg : "#f3f4f6",
                  color: playing === i ? "#fff" : "#6b7280",
                }}
              >
                {playing === i ? "♪" : i + 1}
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${playing === i ? "text-blue-600" : "text-gray-800"}`}
                >
                  {c.title}
                </p>
                <p className="text-xs text-gray-400">{c.type}</p>
              </div>
              <span className="text-gray-300 text-xs">▶</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamGoodsTab({ team, data }) {
  return (
    <div className="space-y-6">
      {/* 마스코트 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div
            className="w-1 h-6 rounded-full"
            style={{ backgroundColor: team.bg }}
          />
          <h3 className="font-bold text-gray-800">마스코트</h3>
        </div>
        <div className="flex flex-wrap gap-4">
          {data.mascots.map((m, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow"
              style={{ background: `${team.bg}08` }}
            >
              <span className="text-5xl">{m.emoji}</span>
              <p className="font-bold text-gray-800 text-sm">{m.name}</p>
              <p className="text-xs text-gray-400">{m.period}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 로고 변천사 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div
            className="w-1 h-6 rounded-full"
            style={{ backgroundColor: team.bg }}
          />
          <h3 className="font-bold text-gray-800">엠블럼 변천사</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {data.logoHistory.map((l, i) => (
            <div
              key={i}
              className="flex-1 min-w-32 rounded-xl overflow-hidden border border-gray-100"
            >
              <div
                className="h-20 flex items-center justify-center text-4xl"
                style={{ backgroundColor: l.color + "20" }}
              >
                {team.emoji}
              </div>
              <div className="p-3 text-center">
                <p className="text-xs font-bold text-gray-700">{l.era}</p>
                <p className="text-xs text-gray-400 mt-0.5">{l.period}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 유니폼 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div
            className="w-1 h-6 rounded-full"
            style={{ backgroundColor: team.bg }}
          />
          <h3 className="font-bold text-gray-800">2025 유니폼</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {data.uniforms.map((u, i) => {
            const colors = ["#f8fafc", "#e2e8f0", team.bg, "#111827"];
            return (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div
                  className="h-28 flex items-center justify-center text-5xl"
                  style={{
                    backgroundColor: colors[i] + (i < 2 ? "" : "22"),
                    border: `2px solid ${team.bg}20`,
                  }}
                >
                  👕
                </div>
                <div className="p-3 text-center">
                  <p className="text-xs font-bold text-gray-700">{u}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 굿즈 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div
            className="w-1 h-6 rounded-full"
            style={{ backgroundColor: team.bg }}
          />
          <h3 className="font-bold text-gray-800">공식 굿즈</h3>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            "🧢 모자",
            "👕 티셔츠",
            "📱 폰케이스",
            "🧣 머플러",
            "🎒 가방",
            "📓 다이어리",
          ].map((g, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-100 p-3 text-center hover:shadow-sm transition-shadow cursor-pointer hover:bg-gray-50"
            >
              <p className="text-2xl">{g.split(" ")[0]}</p>
              <p className="text-xs text-gray-600 mt-1 font-medium">
                {g.split(" ")[1]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 팀 상세 페이지 ────────────────────────────────────────────
const TEAM_INNER_TABS = [
  { id: "intro", label: "팀 소개", icon: "ℹ️" },
  { id: "depth", label: "뎁스", icon: "🏟️" },
  { id: "players", label: "선수 정보", icon: "👥" },
  { id: "cheers", label: "응원가", icon: "🎵" },
  { id: "goods", label: "굿즈·마스코트", icon: "💎" },
];

function TeamDetailPage({ team, onBack, onSelectPlayer }) {
  const [activeTab, setActiveTab] = useState("intro");
  const data = MOCK_TEAM_DATA[team.id] || MOCK_TEAM_DATA["KIA"];
  return (
    <div>
      {/* 팀 배너 */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${team.bg} 0%, ${team.accent === "#000000" ? "#333" : team.accent} 100%)`,
        }}
      >
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full border-8 border-white opacity-10" />
        <div className="max-w-6xl mx-auto px-4 py-5 relative">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-white/60 hover:text-white text-sm flex items-center gap-1 transition-colors"
            >
              ← 팀 목록
            </button>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-4xl flex-shrink-0">
              {team.emoji}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{team.name}</h1>
              <p className="text-white/60 text-sm">
                {team.city} · {team.stadium}
              </p>
            </div>
            <div className="ml-auto hidden sm:flex gap-5">
              {[
                ["창단", data.founded],
                ["우승", data.championship],
                ["2025", data.ranking2025],
              ].map(([k, v]) => (
                <div key={k} className="text-center">
                  <p className="text-white/50 text-xs">{k}</p>
                  <p className="text-white font-black text-base">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 시즌 선택 탭 (24|25) */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex">
            {TEAM_INNER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
          {/* 시즌 토글 */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {["24", "25"].map((s, i) => (
              <button
                key={s}
                className={`px-3 py-1 rounded-lg text-sm font-black transition-all ${
                  i === 1 ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === "intro" && <TeamIntroTab team={team} data={data} />}
        {activeTab === "depth" && <TeamDepthTab team={team} data={data} />}
        {activeTab === "players" && (
          <TeamPlayersTab
            team={team}
            data={data}
            onSelectPlayer={onSelectPlayer}
          />
        )}
        {activeTab === "cheers" && <TeamCheersTab team={team} data={data} />}
        {activeTab === "goods" && <TeamGoodsTab team={team} data={data} />}
      </div>
    </div>
  );
}

// ── 팀 선택 페이지 ────────────────────────────────────────────
function TeamPage({ onSelectPlayer }) {
  const [selectedTeam, setSelectedTeam] = useState(null);

  if (selectedTeam) {
    return (
      <TeamDetailPage
        team={selectedTeam}
        onBack={() => setSelectedTeam(null)}
        onSelectPlayer={onSelectPlayer}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">팀 페이지</h1>
        <p className="text-sm text-gray-400 mt-1">응원하는 팀을 선택하세요</p>
      </div>

      {/* 한국 지도 힌트 텍스트 */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">KBO 10개 구단</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* 팀 카드 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {TEAMS_LIST.map((team) => {
          const data = MOCK_TEAM_DATA[team.id] || MOCK_TEAM_DATA["KIA"];
          return (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(team)}
              className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border border-gray-100"
            >
              {/* 팀 컬러 배경 */}
              <div
                className="h-24 flex items-center justify-center text-5xl relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${team.bg}, ${team.accent === "#000000" ? "#333" : team.accent})`,
                }}
              >
                <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white opacity-10" />
                <span
                  style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}
                >
                  {team.emoji}
                </span>
              </div>
              {/* 팀 정보 */}
              <div className="bg-white p-3 text-center">
                <p className="font-black text-gray-900 text-sm leading-tight">
                  {team.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{team.city}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <span
                    className="text-xs font-bold"
                    style={{ color: team.bg }}
                  >
                    {data.wins}승
                  </span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs font-bold text-gray-400">
                    {data.losses}패
                  </span>
                </div>
              </div>
              {/* 호버 오버레이 */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                style={{ background: `${team.bg}cc` }}
              >
                <p className="text-white font-black text-sm">자세히 보기 →</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 연고지 안내 */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-2">
        {TEAMS_LIST.map((team) => (
          <div
            key={team.id}
            className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-100 shadow-sm"
          >
            <span className="text-lg">{team.emoji}</span>
            <div>
              <p className="text-xs font-bold text-gray-700">{team.short}</p>
              <p className="text-xs text-gray-400">{team.city}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  선수 비교 목업 데이터
// ═══════════════════════════════════════════════════════════

const COMPARE_PLAYERS = [
  {
    id: 65207,
    name: "양의지",
    team: "두산",
    pos: "포수",
    type: "hitter",
    no: 25,
    img: 65207,
    stats: {
      G: 130,
      PA: 517,
      AB: 454,
      R: 56,
      H: 153,
      "2B": 27,
      HR: 20,
      RBI: 89,
      SB: 4,
      BB: 50,
      SO: 63,
      AVG: "0.337",
      OBP: "0.406",
      SLG: "0.533",
      OPS: "0.939",
      WAR: "4.78",
    },
    hotCold: {
      outer: [
        { val: "0.448", step: 5 },
        { val: "0.250", step: 3 },
        { val: "0.215", step: 3 },
        { val: "0.273", step: 3 },
      ],
      inner: [
        { val: "0.303", step: 4 },
        { val: "0.333", step: 4 },
        { val: "0.290", step: 3 },
        { val: "0.463", step: 5 },
        { val: "0.286", step: 3 },
        { val: "0.400", step: 4 },
        { val: "0.349", step: 4 },
        { val: "0.512", step: 5 },
        { val: "0.259", step: 3 },
      ],
    },
  },
  {
    id: 76232,
    name: "김도영",
    team: "KIA",
    pos: "유격수",
    type: "hitter",
    no: 5,
    img: 76232,
    stats: {
      G: 140,
      PA: 582,
      AB: 510,
      R: 88,
      H: 162,
      "2B": 32,
      HR: 23,
      RBI: 97,
      SB: 38,
      BB: 60,
      SO: 89,
      AVG: "0.318",
      OBP: "0.395",
      SLG: "0.541",
      OPS: "0.936",
      WAR: "6.22",
    },
    hotCold: {
      outer: [
        { val: "0.380", step: 4 },
        { val: "0.290", step: 3 },
        { val: "0.245", step: 3 },
        { val: "0.310", step: 4 },
      ],
      inner: [
        { val: "0.350", step: 4 },
        { val: "0.420", step: 5 },
        { val: "0.270", step: 3 },
        { val: "0.390", step: 4 },
        { val: "0.310", step: 4 },
        { val: "0.440", step: 5 },
        { val: "0.280", step: 3 },
        { val: "0.480", step: 5 },
        { val: "0.240", step: 2 },
      ],
    },
  },
  {
    id: 68001,
    name: "안우진",
    team: "키움",
    pos: "투수",
    type: "pitcher",
    no: 15,
    img: 68001,
    stats: {
      G: 30,
      W: 17,
      L: 7,
      SV: 0,
      IP: "195.1",
      ERA: "2.11",
      WHIP: "1.01",
      K: 225,
      BB: 52,
      H: 152,
      HR: 12,
      FIP: "2.34",
      WAR: "6.91",
    },
    pitchZone: {
      outer: [
        { val: "9.5%", step: 5 },
        { val: "12.1%", step: 5 },
        { val: "22.7%", step: 5 },
        { val: "6.8%", step: 4 },
      ],
      inner: [
        { val: "5.8%", step: 3 },
        { val: "5.6%", step: 3 },
        { val: "5.6%", step: 3 },
        { val: "5.9%", step: 3 },
        { val: "4.5%", step: 3 },
        { val: "4.6%", step: 3 },
        { val: "7.3%", step: 4 },
        { val: "4.7%", step: 3 },
        { val: "4.9%", step: 3 },
      ],
    },
  },
  {
    id: 68003,
    name: "원태인",
    team: "삼성",
    pos: "투수",
    type: "pitcher",
    no: 21,
    img: 68003,
    stats: {
      G: 32,
      W: 19,
      L: 6,
      SV: 0,
      IP: "201.2",
      ERA: "2.45",
      WHIP: "1.08",
      K: 198,
      BB: 48,
      H: 168,
      HR: 15,
      FIP: "2.67",
      WAR: "5.12",
    },
    pitchZone: {
      outer: [
        { val: "8.2%", step: 4 },
        { val: "10.4%", step: 5 },
        { val: "19.3%", step: 5 },
        { val: "7.1%", step: 4 },
      ],
      inner: [
        { val: "6.1%", step: 3 },
        { val: "5.2%", step: 3 },
        { val: "6.0%", step: 3 },
        { val: "5.5%", step: 3 },
        { val: "5.0%", step: 3 },
        { val: "5.3%", step: 3 },
        { val: "6.8%", step: 4 },
        { val: "5.1%", step: 3 },
        { val: "5.5%", step: 3 },
      ],
    },
  },
  {
    id: 64300,
    name: "나성범",
    team: "KIA",
    pos: "외야수",
    type: "hitter",
    no: 1,
    img: 64300,
    stats: {
      G: 125,
      PA: 498,
      AB: 438,
      R: 61,
      H: 138,
      "2B": 28,
      HR: 18,
      RBI: 82,
      SB: 5,
      BB: 48,
      SO: 77,
      AVG: "0.315",
      OBP: "0.385",
      SLG: "0.498",
      OPS: "0.883",
      WAR: "3.41",
    },
    hotCold: {
      outer: [
        { val: "0.350", step: 4 },
        { val: "0.280", step: 3 },
        { val: "0.230", step: 3 },
        { val: "0.295", step: 3 },
      ],
      inner: [
        { val: "0.320", step: 4 },
        { val: "0.380", step: 4 },
        { val: "0.260", step: 3 },
        { val: "0.410", step: 5 },
        { val: "0.270", step: 3 },
        { val: "0.370", step: 4 },
        { val: "0.300", step: 4 },
        { val: "0.450", step: 5 },
        { val: "0.240", step: 2 },
      ],
    },
  },
  {
    id: 63762,
    name: "양현종",
    team: "KIA",
    pos: "투수",
    type: "pitcher",
    no: 34,
    img: 63762,
    stats: {
      G: 28,
      W: 15,
      L: 8,
      SV: 0,
      IP: "182.0",
      ERA: "2.91",
      WHIP: "1.14",
      K: 175,
      BB: 44,
      H: 172,
      HR: 14,
      FIP: "2.88",
      WAR: "4.33",
    },
    pitchZone: {
      outer: [
        { val: "7.8%", step: 4 },
        { val: "9.9%", step: 5 },
        { val: "18.1%", step: 5 },
        { val: "6.2%", step: 4 },
      ],
      inner: [
        { val: "5.5%", step: 3 },
        { val: "5.0%", step: 3 },
        { val: "5.8%", step: 3 },
        { val: "5.2%", step: 3 },
        { val: "4.8%", step: 3 },
        { val: "5.1%", step: 3 },
        { val: "6.5%", step: 4 },
        { val: "4.9%", step: 3 },
        { val: "5.3%", step: 3 },
      ],
    },
  },
];

// AI 분석 텍스트 생성 (목업)
function generateAIAnalysis(pA, pB) {
  const typeMap = { hitter: "타자", pitcher: "투수" };
  const aType = typeMap[pA.type],
    bType = typeMap[pB.type];

  if (pA.type === "hitter" && pB.type === "hitter") {
    const aWAR = parseFloat(pA.stats.WAR),
      bWAR = parseFloat(pB.stats.WAR);
    const leader = aWAR >= bWAR ? pA : pB;
    return [
      `📊 **플레이 스타일**: ${pA.name}은 안정적인 컨택 능력(타율 ${pA.stats.AVG})과 출루율(${pA.stats.OBP})이 강점인 정통파 타자입니다. 반면 ${pB.name}은 장타력(SLG ${pB.stats.SLG})과 주루(도루 ${pB.stats.SB}개)를 겸비한 멀티툴 타자입니다.`,
      `⚖️ **약점 및 강점**: ${pA.name}은 삼진이 ${pA.stats.SO}개로 상대적으로 적어 꾸준한 컨택이 장점이며, ${pB.name}은 홈런(${pB.stats.HR}개)과 타점(${pB.stats.RBI})에서 앞서 있어 클러치 상황에 강합니다.`,
      `🏆 **종합 평가**: WAR 기준으로 ${leader.name}(${leader.stats.WAR})이 이번 시즌 더 높은 기여도를 보이고 있습니다. 그러나 포지션과 팀 기여도를 고려하면 두 선수 모두 각 팀의 핵심 타자임은 분명합니다.`,
    ];
  } else if (pA.type === "pitcher" && pB.type === "pitcher") {
    const aERA = parseFloat(pA.stats.ERA),
      bERA = parseFloat(pB.stats.ERA);
    const leader = aERA <= bERA ? pA : pB;
    return [
      `📊 **플레이 스타일**: ${pA.name}은 압도적인 탈삼진(${pA.stats.K}개)과 낮은 WHIP(${pA.stats.WHIP})으로 타자를 제압하는 파워 피처입니다. ${pB.name}은 제구력(BB ${pB.stats.BB}개)과 이닝 소화력(${pB.stats.IP}이닝)으로 승부하는 스타일입니다.`,
      `⚖️ **약점 및 강점**: ${pA.name}은 ERA ${pA.stats.ERA}로 득점 억제 능력이 탁월하고, ${pB.name}은 ${pB.stats.W}승을 거두며 팀 승리에 기여하고 있습니다.`,
      `🏆 **종합 평가**: ERA 기준 ${leader.name}(${leader.stats.ERA})이 이번 시즌 더 안정적인 투구를 보여주고 있습니다. WAR로는 ${parseFloat(pA.stats.WAR) >= parseFloat(pB.stats.WAR) ? pA.name : pB.name}이 앞서 있어 팀 기여도 면에서 우위에 있습니다.`,
    ];
  } else {
    const pitcher = pA.type === "pitcher" ? pA : pB;
    const hitter = pA.type === "hitter" ? pA : pB;
    return [
      `⚔️ **타자 vs 투수 매치업**: ${hitter.name}의 타율(${hitter.stats.AVG})과 핫존 분포를 고려하면, ${pitcher.name}의 주요 투구 구역과의 겹침 여부가 승부의 핵심입니다.`,
      `📊 **핫/콜드존 분석**: ${hitter.name}의 내각 높은 코스 강점을 볼 때, ${pitcher.name}의 바깥쪽 낮은 투구 분포와 맞물려 외각 낮은 코스 승부가 될 것으로 예상됩니다.`,
      `🏆 **종합 평가**: WAR 기준 ${parseFloat(pitcher.stats.WAR) >= parseFloat(hitter.stats.WAR) ? pitcher.name : hitter.name}이 시즌 기여도 면에서 앞서 있습니다. 직접 대결 시에는 투수의 제구력과 타자의 선구안이 승부를 결정짓는 요소가 될 것입니다.`,
    ];
  }
}

// ── 선수 선택 모달 ────────────────────────────────────────────
function PlayerSelectModal({ onSelect, onClose, excludeId }) {
  const [search, setSearch] = useState("");
  const filtered = COMPARE_PLAYERS.filter(
    (p) =>
      p.id !== excludeId &&
      (p.name.includes(search) ||
        p.team.includes(search) ||
        p.pos.includes(search)),
  );
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b border-gray-100"
          style={{ background: "#1a1a2e" }}
        >
          <h3 className="font-black text-white text-base">선수 찾기</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5">
              <span className="text-white/50 text-sm">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="이름, 팀, 포지션 검색..."
                className="bg-transparent text-white text-sm outline-none placeholder-white/30 w-36"
              />
            </div>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white text-lg font-bold transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        {/* 선수 그리드 */}
        <div className="p-4 grid grid-cols-4 gap-3 max-h-72 overflow-y-auto">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-blue-400 transition-colors">
                <PlayerAvatar id={p.img} name={p.name} size={56} />
              </div>
              <p className="text-xs font-bold text-gray-800 text-center leading-tight">
                {p.name}
              </p>
              <p className="text-xs text-gray-400">{p.team}</p>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: p.type === "pitcher" ? "#dbeafe" : "#fef3c7",
                  color: p.type === "pitcher" ? "#1d4ed8" : "#92400e",
                }}
              >
                {p.type === "pitcher" ? "투수" : "타자"}
              </span>
              <button className="w-full mt-0.5 text-xs font-bold py-1 rounded-lg bg-gray-100 group-hover:bg-blue-500 group-hover:text-white text-gray-500 transition-all">
                선택하기
              </button>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 스탯 비교 테이블 ─────────────────────────────────────────
function StatCompareTable({ pA, pB }) {
  const hitterCols = [
    "G",
    "PA",
    "AB",
    "R",
    "H",
    "2B",
    "HR",
    "RBI",
    "SB",
    "BB",
    "SO",
    "AVG",
    "OBP",
    "SLG",
    "OPS",
    "WAR",
  ];
  const pitcherCols = [
    "G",
    "W",
    "L",
    "IP",
    "ERA",
    "WHIP",
    "K",
    "BB",
    "H",
    "HR",
    "FIP",
    "WAR",
  ];
  const higherIsBetter = [
    "G",
    "PA",
    "AB",
    "R",
    "H",
    "2B",
    "HR",
    "RBI",
    "SB",
    "BB",
    "W",
    "K",
    "IP",
    "WAR",
    "AVG",
    "OBP",
    "SLG",
    "OPS",
  ];
  const lowerIsBetter = ["SO", "ERA", "WHIP", "BB", "H", "HR", "FIP", "L"];

  // 양쪽 다 같은 타입이면 해당 컬럼, 아니면 공통 컬럼
  let cols;
  if (pA.type === "hitter" && pB.type === "hitter") cols = hitterCols;
  else if (pA.type === "pitcher" && pB.type === "pitcher") cols = pitcherCols;
  else cols = ["WAR"]; // 투타 비교는 WAR만

  const aWins = { count: 0 },
    bWins = { count: 0 };

  const rows = cols.map((col) => {
    const aVal = pA.stats[col],
      bVal = pB.stats[col];
    const aNum = parseFloat(aVal),
      bNum = parseFloat(bVal);
    let aWin = false,
      bWin = false;
    if (!isNaN(aNum) && !isNaN(bNum) && aNum !== bNum) {
      if (higherIsBetter.includes(col)) {
        aWin = aNum > bNum;
        bWin = !aWin;
      } else if (lowerIsBetter.includes(col)) {
        aWin = aNum < bNum;
        bWin = !aWin;
      }
    }
    if (aWin) aWins.count++;
    if (bWin) bWins.count++;
    return { col, aVal, bVal, aWin, bWin };
  });

  // 벤치마크 점수
  const total = rows.filter((r) => r.aWin || r.bWin).length;
  const aScore = total > 0 ? Math.round((aWins.count / total) * 100) : 50;
  const bScore = 100 - aScore;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 승리 바 */}
      <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-3">
        <span className="text-xs font-black text-blue-600 w-12 text-right">
          {aScore}%
        </span>
        <div className="flex-1 h-2.5 rounded-full overflow-hidden bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
            style={{ width: `${aScore}%` }}
          />
        </div>
        <span className="text-xs font-black text-red-500 w-12">{bScore}%</span>
        <span className="text-xs text-gray-400 ml-1">종합 벤치마크</span>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <td className="px-4 py-2.5 text-xs font-black text-blue-600 text-center">
                {pA.name}
              </td>
              <td className="px-4 py-2.5 text-xs font-bold text-gray-400 text-center uppercase tracking-wide">
                항목
              </td>
              <td className="px-4 py-2.5 text-xs font-black text-red-500 text-center">
                {pB.name}
              </td>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ col, aVal, bVal, aWin, bWin }) => (
              <tr
                key={col}
                className="border-t border-gray-50 hover:bg-gray-50/50"
              >
                <td
                  className={`px-4 py-2.5 text-center font-bold transition-colors ${
                    aWin ? "text-blue-600 bg-blue-50/60" : "text-gray-500"
                  }`}
                >
                  {aWin && <span className="mr-1 text-blue-400">▶</span>}
                  {aVal ?? "-"}
                </td>
                <td className="px-4 py-2.5 text-center text-xs font-black text-gray-400 uppercase tracking-wide">
                  {col}
                </td>
                <td
                  className={`px-4 py-2.5 text-center font-bold transition-colors ${
                    bWin ? "text-red-500 bg-red-50/60" : "text-gray-500"
                  }`}
                >
                  {bVal ?? "-"}
                  {bWin && <span className="ml-1 text-red-400">◀</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 존 비교 (핫콜드존 or 투구분포) ───────────────────────────
function MiniZoneGrid({ outer, inner }) {
  return (
    <div className="relative mx-auto" style={{ width: 130, height: 130 }}>
      {[
        { d: outer[0], s: { top: 0, left: 0, width: 36, height: 36 } },
        { d: outer[1], s: { top: 0, right: 0, width: 36, height: 36 } },
        { d: outer[2], s: { bottom: 0, left: 0, width: 36, height: 36 } },
        { d: outer[3], s: { bottom: 0, right: 0, width: 36, height: 36 } },
      ].map(({ d, s }, i) => (
        <div
          key={i}
          className="absolute flex items-center justify-center rounded text-center font-bold"
          style={{
            ...s,
            backgroundColor: stepColors[d.step]?.bg,
            color: stepColors[d.step]?.text,
            fontSize: 7,
          }}
        >
          {d.val}
        </div>
      ))}
      <div
        className="absolute grid grid-cols-3 gap-px"
        style={{ top: 40, left: 40, width: 50, height: 50 }}
      >
        {inner.map((c, i) => (
          <div
            key={i}
            className="flex items-center justify-center rounded font-bold"
            style={{
              backgroundColor: stepColors[c.step]?.bg,
              color: stepColors[c.step]?.text,
              fontSize: 6,
            }}
          >
            {c.val}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 투타 오버레이 존 (핵심 신기능) ──────────────────────────
function OverlayZoneGrid({ hotCold, pitchZone, hitterName, pitcherName }) {
  const [hovered, setHovered] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null); // { area: "outer"|"inner", idx: number }

  // 각 구역별 공략 판정
  // hitStep 높음(4,5) + pitchStep 높음(4,5) → 위험 (투수 불리)
  // hitStep 낮음(1,2) + pitchStep 높음(4,5) → 공략 포인트 (투수 유리)
  // hitStep 낮음    + pitchStep 낮음         → 비추 (잘 안 던지는 코스)
  const getStrategy = (hStep, pStep) => {
    if (hStep >= 4 && pStep >= 4)
      return {
        label: "위험",
        color: "#ef4444cc",
        icon: "⚠️",
        desc: "타자 강점+투구 집중 → 피안타 위험",
      };
    if (hStep >= 4 && pStep <= 2)
      return {
        label: "회피",
        color: "#f97316cc",
        icon: "🚫",
        desc: "타자 강점이지만 잘 안 던지는 코스",
      };
    if (hStep <= 2 && pStep >= 4)
      return {
        label: "공략",
        color: "#22c55ecc",
        icon: "🎯",
        desc: "타자 약점×투구 집중 → 최적 투구 코스!",
      };
    if (hStep <= 2 && pStep <= 2)
      return {
        label: "중립",
        color: "#94a3b8cc",
        icon: "○",
        desc: "양쪽 모두 낮은 비중",
      };
    return {
      label: "보통",
      color: "#64748baa",
      icon: "△",
      desc: "일반적인 투구 구역",
    };
  };

  const SIZE = 260; // 전체 그리드 크기
  const OUTER = 72; // 외곽 셀 크기
  const INNER_START = OUTER;
  const INNER_SIZE = SIZE - OUTER * 2; // 내부 3x3 전체 크기
  const CELL = INNER_SIZE / 3;

  const outerPositions = [
    { top: 0, left: 0, w: OUTER, h: OUTER },
    { top: 0, left: SIZE - OUTER, w: OUTER, h: OUTER },
    { top: SIZE - OUTER, left: 0, w: OUTER, h: OUTER },
    { top: SIZE - OUTER, left: SIZE - OUTER, w: OUTER, h: OUTER },
  ];

  const renderCell = (hStep, pStep, style, area, idx) => {
    const strat = getStrategy(hStep, pStep);
    const isHov = hoveredCell?.area === area && hoveredCell?.idx === idx;

    return (
      <div
        key={idx}
        className="absolute flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
        style={{
          ...style,
          backgroundColor: hovered ? strat.color : stepColors[hStep]?.bg,
          border: isHov
            ? "2.5px solid #fff"
            : "1px solid rgba(255,255,255,0.15)",
          borderRadius: 4,
          zIndex: isHov ? 10 : 1,
          transform: isHov ? "scale(1.08)" : "scale(1)",
          boxShadow: isHov ? "0 4px 16px rgba(0,0,0,0.35)" : "none",
        }}
        onMouseEnter={() => setHoveredCell({ area, idx })}
        onMouseLeave={() => setHoveredCell(null)}
      >
        {hovered ? (
          <>
            <span style={{ fontSize: 14 }}>{strat.icon}</span>
            <span
              style={{
                fontSize: 7,
                color: "#fff",
                fontWeight: 700,
                textAlign: "center",
                lineHeight: 1.1,
                marginTop: 2,
              }}
            >
              {strat.label}
            </span>
          </>
        ) : (
          <span
            style={{
              fontSize: style.w > 50 ? 10 : 8,
              color: stepColors[hStep]?.text,
              fontWeight: 700,
            }}
          >
            {hotCold.outer
              ? area === "outer"
                ? hotCold.outer[idx]?.val
                : hotCold.inner[idx]?.val
              : ""}
          </span>
        )}
      </div>
    );
  };

  // 호버된 셀의 전략 설명
  const activeStrat = hoveredCell
    ? (() => {
        const hStep =
          hoveredCell.area === "outer"
            ? hotCold.outer[hoveredCell.idx]?.step
            : hotCold.inner[hoveredCell.idx]?.step;
        const pStep =
          hoveredCell.area === "outer"
            ? pitchZone.outer[hoveredCell.idx]?.step
            : pitchZone.inner[hoveredCell.idx]?.step;
        return getStrategy(hStep, pStep);
      })()
    : null;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* 범례 + 토글 힌트 */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {[
          { color: "#22c55ecc", label: "🎯 공략 포인트" },
          { color: "#ef4444cc", label: "⚠️ 위험 구역" },
          { color: "#f97316cc", label: "🚫 회피" },
          { color: "#94a3b8cc", label: "○ 중립" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* 존 그리드 */}
      <div
        className="relative select-none"
        style={{ width: SIZE, height: SIZE }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setHoveredCell(null);
        }}
      >
        {/* 외곽 4개 */}
        {outerPositions.map((pos, i) =>
          renderCell(
            hotCold.outer[i]?.step,
            pitchZone.outer[i]?.step,
            {
              position: "absolute",
              top: pos.top,
              left: pos.left,
              width: pos.w,
              height: pos.h,
            },
            "outer",
            i,
          ),
        )}

        {/* 내부 3x3 */}
        {hotCold.inner.map((_, i) => {
          const row = Math.floor(i / 3),
            col = i % 3;
          return renderCell(
            hotCold.inner[i]?.step,
            pitchZone.inner[i]?.step,
            {
              position: "absolute",
              top: INNER_START + row * CELL,
              left: INNER_START + col * CELL,
              width: CELL - 2,
              height: CELL - 2,
            },
            "inner",
            i,
          );
        })}

        {/* 호버 전 중앙 안내 */}
        {!hovered && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
              마우스를 올려 분석 보기 ↗
            </div>
          </div>
        )}
      </div>

      {/* 셀 호버 시 상세 설명 */}
      <div className="h-8 flex items-center justify-center">
        {activeStrat ? (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white animate-pulse"
            style={{ backgroundColor: activeStrat.color }}
          >
            <span>{activeStrat.icon}</span>
            <span>{activeStrat.desc}</span>
          </div>
        ) : hovered ? (
          <p className="text-xs text-gray-400">각 구역에 마우스를 올려보세요</p>
        ) : null}
      </div>

      <p className="text-xs text-gray-400">
        투수 시점 기준 · 마우스를 올리면 오버레이 분석 활성화
      </p>
    </div>
  );
}

function ZoneCompareSection({ pA, pB }) {
  const isPvP = pA.type === "pitcher" && pB.type === "pitcher";
  const isHvH = pA.type === "hitter" && pB.type === "hitter";
  const isPvH = !isPvP && !isHvH;

  const getZone = (p) => (p.type === "pitcher" ? p.pitchZone : p.hotCold);
  const label = (p) =>
    p.type === "pitcher" ? "투구 분포도" : "HOT & COLD ZONE";

  if (isPvH) {
    const pitcher = pA.type === "pitcher" ? pA : pB;
    const hitter = pA.type === "hitter" ? pA : pB;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-black text-gray-800">존 매치업 분석</h3>
          <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-100">
            투타 오버레이
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          그리드에 마우스를 올리면 타자 핫존 × 투수 투구분포가 겹쳐져 공략
          포인트를 예측합니다
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* 왼쪽: 타자 핫존 (소형) */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <p className="text-xs font-black text-gray-700">
                {hitter.name} 핫/콜드존
              </p>
            </div>
            <MiniZoneGrid
              outer={hitter.hotCold.outer}
              inner={hitter.hotCold.inner}
            />
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className="w-5 h-3 rounded-sm"
                  style={{ backgroundColor: stepColors[s].bg }}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400">냉 ← 타율 → 열</p>
          </div>

          {/* 가운데: 오버레이 대형 */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <p className="text-xs font-black text-gray-700">
                오버레이 (호버 활성화)
              </p>
            </div>
            <OverlayZoneGrid
              hotCold={hitter.hotCold}
              pitchZone={pitcher.pitchZone}
              hitterName={hitter.name}
              pitcherName={pitcher.name}
            />
          </div>

          {/* 오른쪽: 투수 투구분포 (소형) */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <p className="text-xs font-black text-gray-700">
                {pitcher.name} 투구 분포도
              </p>
            </div>
            <MiniZoneGrid
              outer={pitcher.pitchZone.outer}
              inner={pitcher.pitchZone.inner}
            />
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className="w-5 h-3 rounded-sm"
                  style={{ backgroundColor: stepColors[s].bg }}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400">저빈도 ← 투구 → 고빈도</p>
          </div>
        </div>

        {/* 전략 요약 카드 */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              icon: "🎯",
              label: "공략 포인트",
              desc: `타자 약점 + 투구 집중`,
              color: "#22c55e",
              bg: "#f0fdf4",
            },
            {
              icon: "⚠️",
              label: "위험 구역",
              desc: `타자 강점 + 투구 집중`,
              color: "#ef4444",
              bg: "#fef2f2",
            },
            {
              icon: "🚫",
              label: "회피 구역",
              desc: `타자 강점 + 투구 희박`,
              color: "#f97316",
              bg: "#fff7ed",
            },
            {
              icon: "○",
              label: "중립 구역",
              desc: `양쪽 모두 낮은 비중`,
              color: "#94a3b8",
              bg: "#f8fafc",
            },
          ].map(({ icon, label, desc, color, bg }) => (
            <div
              key={label}
              className="rounded-xl p-3 border"
              style={{ backgroundColor: bg, borderColor: color + "40" }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span>{icon}</span>
                <span className="text-xs font-black" style={{ color }}>
                  {label}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-tight">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
        {isHvH ? "핫/콜드 존 비교" : "투구 분포도 비교"}
      </h3>
      <div className="grid grid-cols-2 gap-6">
        {[pA, pB].map((p, i) => {
          const zone = getZone(p);
          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <p
                className={`text-xs font-bold ${i === 0 ? "text-blue-600" : "text-red-500"}`}
              >
                {p.name}
              </p>
              <MiniZoneGrid outer={zone.outer} inner={zone.inner} />
              <p className="text-xs text-gray-400">{label(p)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── AI 분석 패널 ─────────────────────────────────────────────
function AIAnalysisPanel({ pA, pB }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lines, setLines] = useState([]);

  const runAnalysis = () => {
    setLoading(true);
    setLines([]);
    // 타이핑 효과 시뮬레이션
    const analysis = generateAIAnalysis(pA, pB);
    let i = 0;
    const interval = setInterval(() => {
      if (i < analysis.length) {
        setLines((prev) => [...prev, analysis[i]]);
        i++;
      } else {
        clearInterval(interval);
        setLoading(false);
      }
    }, 600);
    setExpanded(true);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm border border-gray-200"
      style={{ background: "#0f0f1a" }}
    >
      <button
        onClick={runAnalysis}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm flex-shrink-0">
          🤖
        </div>
        <div className="flex-1 text-left">
          <p className="text-white font-bold text-sm">AI 비교 분석 실행</p>
          <p className="text-white/40 text-xs">
            두 선수의 스탯을 기반으로 AI가 분석합니다
          </p>
        </div>
        {loading ? (
          <span className="text-blue-400 text-xs animate-pulse">
            분석 중...
          </span>
        ) : (
          <span className="text-white/30 text-sm">▶</span>
        )}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-white/10">
          {lines.map((line, i) => {
            const parts = line.split("**");
            return (
              <div key={i} className="flex gap-3 pt-3">
                <div
                  className="w-1 rounded-full flex-shrink-0 mt-1"
                  style={{
                    backgroundColor: ["#3b82f6", "#f59e0b", "#10b981"][i % 3],
                    minHeight: 40,
                  }}
                />
                <p className="text-sm text-white/80 leading-relaxed">
                  {parts.map((part, j) =>
                    j % 2 === 1 ? (
                      <span key={j} className="font-bold text-white">
                        {part}
                      </span>
                    ) : (
                      <span key={j}>{part}</span>
                    ),
                  )}
                </p>
              </div>
            );
          })}
          {loading && (
            <div className="flex gap-1 pt-2 pl-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── 선수 카드 (비교 화면 상단) ────────────────────────────────
function ComparePlayerCard({ player, side, onChangClick }) {
  const tc = TEAM_COLORS[player?.team] || { bg: "#374151", accent: "#6b7280" };
  const isEmpty = !player;

  return (
    <div
      className={`flex flex-col items-center gap-3 ${side === "B" ? "items-end sm:items-center" : ""}`}
    >
      {/* 아바타 */}
      <div className="relative">
        <div
          className="w-24 h-24 rounded-2xl overflow-hidden border-4 flex items-center justify-center"
          style={{
            borderColor: isEmpty ? "#e5e7eb" : tc.bg,
            background: isEmpty ? "#f9fafb" : `${tc.bg}20`,
          }}
        >
          {isEmpty ? (
            <span className="text-4xl text-gray-300">👤</span>
          ) : (
            <PlayerAvatar id={player.img} name={player.name} size={96} />
          )}
        </div>
        {/* 팀컬러 뱃지 */}
        {!isEmpty && (
          <div
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-black text-white"
            style={{ backgroundColor: tc.bg }}
          >
            {player.no}
          </div>
        )}
      </div>

      {/* 이름 */}
      <div className="text-center">
        <p className="font-black text-gray-900 text-lg">
          {player?.name ?? "선수 없음"}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {player ? `${player.team} · ${player.pos}` : "선수를 선택하세요"}
        </p>
        {player && (
          <span
            className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-bold"
            style={{
              background: player.type === "pitcher" ? "#dbeafe" : "#fef3c7",
              color: player.type === "pitcher" ? "#1d4ed8" : "#92400e",
            }}
          >
            {player.type === "pitcher" ? "투수" : "타자"}
          </span>
        )}
      </div>

      {/* 변경 버튼 */}
      <button
        onClick={onChangClick}
        className="px-4 py-1.5 rounded-xl text-xs font-bold border-2 transition-all hover:shadow-md"
        style={{
          borderColor: isEmpty ? "#d1d5db" : tc.bg,
          color: isEmpty ? "#6b7280" : tc.bg,
          background: isEmpty ? "#f9fafb" : `${tc.bg}10`,
        }}
      >
        {isEmpty ? "선택하기" : "변경하기"}
      </button>
    </div>
  );
}

// ── 비교 모드 탭 ─────────────────────────────────────────────
function CompareModeTab({ pA, pB, mode }) {
  if (!pA || !pB)
    return (
      <div className="text-center py-16 text-gray-300">
        <p className="text-4xl mb-3">⚾</p>
        <p className="font-bold">선수 2명을 선택하면 비교가 시작됩니다</p>
      </div>
    );

  const aType = pA.type,
    bType = pB.type;
  // 모드와 선수 타입이 맞는지 확인
  const modeMatch = {
    HvP: aType !== bType,
    PvP: aType === "pitcher" && bType === "pitcher",
    HvH: aType === "hitter" && bType === "hitter",
  };

  if (!modeMatch[mode])
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-center text-amber-700 text-sm font-medium">
        ⚠️ 선택한 선수 유형이 현재 비교 모드와 맞지 않습니다. 선수를 변경하거나
        다른 모드를 선택해 주세요.
      </div>
    );

  return (
    <div className="space-y-5">
      <StatCompareTable pA={pA} pB={pB} />
      <ZoneCompareSection pA={pA} pB={pB} />
      <AIAnalysisPanel pA={pA} pB={pB} />
    </div>
  );
}

// ── 메인 비교 페이지 ─────────────────────────────────────────
function ComparePage() {
  const [playerA, setPlayerA] = useState(COMPARE_PLAYERS[0]);
  const [playerB, setPlayerB] = useState(COMPARE_PLAYERS[2]);
  const [modal, setModal] = useState(null); // "A" | "B" | null
  const [mode, setMode] = useState("HvP"); // "HvP" | "PvP" | "HvH"

  const MODES = [
    { id: "HvP", label: "타자 vs 투수" },
    { id: "PvP", label: "투수 vs 투수" },
    { id: "HvH", label: "타자 vs 타자" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 모달 */}
      {modal && (
        <PlayerSelectModal
          excludeId={modal === "A" ? playerB?.id : playerA?.id}
          onSelect={(p) => {
            modal === "A" ? setPlayerA(p) : setPlayerB(p);
            setModal(null);
          }}
          onClose={() => setModal(null)}
        />
      )}

      {/* 비교 모드 탭 */}
      <div className="flex items-center justify-center gap-1 bg-gray-100 rounded-2xl p-1 mb-8 w-fit mx-auto">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              mode === m.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* 선수 2명 + VS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-3 items-center gap-4">
          {/* 선수 A */}
          <ComparePlayerCard
            player={playerA}
            side="A"
            onChangClick={() => setModal("A")}
          />

          {/* VS + 바 */}
          <div className="flex flex-col items-center gap-3">
            {/* 실루엣 이미지 */}
            <div className="flex items-end gap-1">
              <div
                className="text-4xl"
                style={{
                  filter: "grayscale(1) opacity(0.7)",
                  color: "#3b82f6",
                }}
              >
                🧍
              </div>
              <span className="text-2xl font-black text-gray-300 pb-1">VS</span>
              <div
                className="text-4xl"
                style={{ filter: "grayscale(1) opacity(0.4)" }}
              >
                🧍
              </div>
            </div>
            {/* 진행 바 */}
            {playerA &&
              playerB &&
              (() => {
                const aWAR = parseFloat(playerA.stats.WAR),
                  bWAR = parseFloat(playerB.stats.WAR);
                const total = aWAR + bWAR;
                const pct = total > 0 ? Math.round((aWAR / total) * 100) : 50;
                return (
                  <div className="w-full">
                    <div className="h-2.5 rounded-full overflow-hidden bg-red-200">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs font-black text-blue-500">
                        WAR {playerA.stats.WAR}
                      </span>
                      <span className="text-xs font-black text-red-500">
                        WAR {playerB.stats.WAR}
                      </span>
                    </div>
                  </div>
                );
              })()}
            {/* 선수명 */}
            <div className="w-full text-center space-y-0.5">
              <p className="text-xs text-blue-600 font-bold">
                {playerA?.name ?? "선수A"}
              </p>
              <p className="text-xs text-red-500 font-bold">
                {playerB?.name ?? "선수B"}
              </p>
            </div>
          </div>

          {/* 선수 B */}
          <ComparePlayerCard
            player={playerB}
            side="B"
            onChangClick={() => setModal("B")}
          />
        </div>
      </div>

      {/* 비교 내용 */}
      <CompareModeTab pA={playerA} pB={playerB} mode={mode} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════

const NAV_ITEMS = [
  { id: "player", label: "선수 정보" },
  { id: "best", label: "BEST 플레이어" },
  { id: "compare", label: "선수 비교" },
  { id: "team", label: "팀 페이지" },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState("player");

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
    >
      {/* 글로벌 네비게이션 */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center h-14 gap-1">
          <button
            onClick={() => setCurrentPage("player")}
            className="flex items-center gap-2 mr-4 flex-shrink-0"
          >
            <span className="text-xl">⚾</span>
            <span className="font-black text-gray-900 text-lg tracking-tight">
              스토브리그
            </span>
          </button>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                currentPage === item.id
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* 페이지 라우팅 */}
      {currentPage === "player" && <PlayerProfilePage />}
      {currentPage === "best" && <BestPlayerPage />}
      {currentPage === "compare" && <ComparePage />}
      {currentPage === "team" && (
        <TeamPage onSelectPlayer={() => setCurrentPage("player")} />
      )}

      <footer className="border-t border-gray-100 bg-white mt-8">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between">
          <p className="text-xs text-gray-400">
            ⚾ 스토브리그 · KBO 야구 팬 플랫폼 프로토타입
          </p>
          <p className="text-xs text-gray-300">© 2025 Stoveleague</p>
        </div>
      </footer>
    </div>
  );
}
