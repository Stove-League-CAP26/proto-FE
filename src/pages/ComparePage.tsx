// 선수 비교 페이지 - 타자vs투수/투수vs투수/타자vs타자 모드로 두 선수를 비교
// 스탯 테이블, 존 분석, AI 분석 패널을 포함
import { useState } from "react";
import ComparePlayerCard from "@/components/compare/ComparePlayerCard";
import CompareModeTab from "@/components/compare/CompareModeTab";
import PlayerSelectModal from "@/components/compare/PlayerSelectModal";
import { COMPARE_PLAYERS } from "@/mock/compareData";

const MODES = [
  { id: "HvP", label: "타자 vs 투수" },
  { id: "PvP", label: "투수 vs 투수" },
  { id: "HvH", label: "타자 vs 타자" },
];

export default function ComparePage() {
  const [playerA, setPlayerA] = useState<any>(COMPARE_PLAYERS[0]);
  const [playerB, setPlayerB] = useState<any>(COMPARE_PLAYERS[2]);
  const [modal, setModal]     = useState<"A" | "B" | null>(null);
  const [mode, setMode]       = useState<"HvP" | "PvP" | "HvH">("HvP");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 선수 선택 모달 */}
      {modal && (
        <PlayerSelectModal
          excludeId={modal === "A" ? playerB?.id : playerA?.id}
          onSelect={(p) => { modal === "A" ? setPlayerA(p) : setPlayerB(p); setModal(null); }}
          onClose={() => setModal(null)}
        />
      )}

      {/* 모드 토글 */}
      <div className="flex items-center justify-center gap-1 bg-gray-100 rounded-2xl p-1 mb-8 w-fit mx-auto">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as "HvP" | "PvP" | "HvH")}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              mode === m.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* 선수 카드 + WAR 바 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-3 items-center gap-4">
          <ComparePlayerCard player={playerA} side="A" onChangClick={() => setModal("A")} />
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-end gap-1">
              <div className="text-4xl" style={{ filter: "grayscale(1) opacity(0.7)", color: "#3b82f6" }}>🧍</div>
              <span className="text-2xl font-black text-gray-300 pb-1">VS</span>
              <div className="text-4xl" style={{ filter: "grayscale(1) opacity(0.4)" }}>🧍</div>
            </div>
            {playerA && playerB && (() => {
              const aWAR = parseFloat(playerA.stats.WAR);
              const bWAR = parseFloat(playerB.stats.WAR);
              const pct = aWAR + bWAR > 0 ? Math.round((aWAR / (aWAR + bWAR)) * 100) : 50;
              return (
                <div className="w-full">
                  <div className="h-2.5 rounded-full overflow-hidden bg-red-200">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs font-black text-blue-500">WAR {playerA.stats.WAR}</span>
                    <span className="text-xs font-black text-red-500">WAR {playerB.stats.WAR}</span>
                  </div>
                </div>
              );
            })()}
            <div className="w-full text-center space-y-0.5">
              <p className="text-xs text-blue-600 font-bold">{playerA?.name ?? "선수A"}</p>
              <p className="text-xs text-red-500 font-bold">{playerB?.name ?? "선수B"}</p>
            </div>
          </div>
          <ComparePlayerCard player={playerB} side="B" onChangClick={() => setModal("B")} />
        </div>
      </div>

      {/* 비교 컨텐츠 */}
      <CompareModeTab pA={playerA} pB={playerB} mode={mode} />
    </div>
  );
}