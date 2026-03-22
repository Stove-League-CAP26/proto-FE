// 팀 응원가 탭 - 응원가 플레이어 UI와 응원가 목록을 좌우로 표시
// 실제 재생 기능은 없고 UI만 구현된 목업 상태
import { useState } from "react";

interface TeamCheersTabProps {
  team: { bg: string; accent: string; name: string };
  data: {
    cheers: { title: string; type: string }[];
  };
}

export default function TeamCheersTab({ team, data }: TeamCheersTabProps) {
  const [playing, setPlaying] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 응원가 플레이어 */}
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
            {playing !== null ? data.cheers[playing].title : "재생할 응원가 선택"}
          </p>
          <p className="text-white/60 text-sm mt-1">{team.name}</p>
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
                onClick={() => i === 1 && setPlaying(playing !== null ? null : 0)}
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
                <p className={`text-sm font-semibold ${playing === i ? "text-blue-600" : "text-gray-800"}`}>
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