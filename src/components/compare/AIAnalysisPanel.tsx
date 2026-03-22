// 두 선수의 스탯을 기반으로 AI 분석 텍스트를 순차적으로 보여주는 패널
// 실제 AI 호출 없이 generateAIAnalysis 함수로 규칙 기반 분석 텍스트를 생성
import { useState } from "react";

interface PlayerData {
  name: string;
  type: "hitter" | "pitcher";
  stats: Record<string, any>;
}

interface AIAnalysisPanelProps {
  pA: PlayerData;
  pB: PlayerData;
}

function generateAIAnalysis(pA: PlayerData, pB: PlayerData): string[] {
  if (pA.type === "hitter" && pB.type === "hitter") {
    const leader = parseFloat(pA.stats.WAR) >= parseFloat(pB.stats.WAR) ? pA : pB;
    return [
      `📊 **플레이 스타일**: ${pA.name}은 안정적인 컨택 능력(타율 ${pA.stats.AVG})과 출루율(${pA.stats.OBP})이 강점인 정통파 타자입니다. 반면 ${pB.name}은 장타력(SLG ${pB.stats.SLG})과 주루(도루 ${pB.stats.SB}개)를 겸비한 멀티툴 타자입니다.`,
      `⚖️ **약점 및 강점**: ${pA.name}은 삼진이 ${pA.stats.SO}개로 상대적으로 적어 꾸준한 컨택이 장점이며, ${pB.name}은 홈런(${pB.stats.HR}개)과 타점(${pB.stats.RBI})에서 앞서 있어 클러치 상황에 강합니다.`,
      `🏆 **종합 평가**: WAR 기준으로 ${leader.name}(${leader.stats.WAR})이 이번 시즌 더 높은 기여도를 보이고 있습니다.`,
    ];
  } else if (pA.type === "pitcher" && pB.type === "pitcher") {
    const leader = parseFloat(pA.stats.ERA) <= parseFloat(pB.stats.ERA) ? pA : pB;
    return [
      `📊 **플레이 스타일**: ${pA.name}은 압도적인 탈삼진(${pA.stats.K}개)과 낮은 WHIP(${pA.stats.WHIP})으로 타자를 제압하는 파워 피처입니다. ${pB.name}은 제구력(BB ${pB.stats.BB}개)과 이닝 소화력(${pB.stats.IP}이닝)으로 승부하는 스타일입니다.`,
      `⚖️ **약점 및 강점**: ${pA.name}은 ERA ${pA.stats.ERA}로 득점 억제 능력이 탁월하고, ${pB.name}은 ${pB.stats.W}승을 거두며 팀 승리에 기여하고 있습니다.`,
      `🏆 **종합 평가**: ERA 기준 ${leader.name}(${leader.stats.ERA})이 이번 시즌 더 안정적인 투구를 보여주고 있습니다.`,
    ];
  } else {
    const pitcher = pA.type === "pitcher" ? pA : pB;
    const hitter = pA.type === "hitter" ? pA : pB;
    return [
      `⚔️ **타자 vs 투수 매치업**: ${hitter.name}의 타율(${hitter.stats.AVG})과 핫존 분포를 고려하면, ${pitcher.name}의 주요 투구 구역과의 겹침 여부가 승부의 핵심입니다.`,
      `📊 **핫/콜드존 분석**: ${hitter.name}의 내각 높은 코스 강점을 볼 때, ${pitcher.name}의 바깥쪽 낮은 투구 분포와 맞물려 외각 낮은 코스 승부가 될 것으로 예상됩니다.`,
      `🏆 **종합 평가**: WAR 기준 ${parseFloat(pitcher.stats.WAR) >= parseFloat(hitter.stats.WAR) ? pitcher.name : hitter.name}이 시즌 기여도 면에서 앞서 있습니다.`,
    ];
  }
}

export default function AIAnalysisPanel({ pA, pB }: AIAnalysisPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lines, setLines] = useState<string[]>([]);

  const runAnalysis = () => {
    setLoading(true);
    setLines([]);
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
    <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200" style={{ background: "#0f0f1a" }}>
      <button
        onClick={runAnalysis}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm flex-shrink-0">
          🤖
        </div>
        <div className="flex-1 text-left">
          <p className="text-white font-bold text-sm">AI 비교 분석 실행</p>
          <p className="text-white/40 text-xs">두 선수의 스탯을 기반으로 AI가 분석합니다</p>
        </div>
        {loading
          ? <span className="text-blue-400 text-xs animate-pulse">분석 중...</span>
          : <span className="text-white/30 text-sm">▶</span>
        }
      </button>
      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-white/10">
          {lines.map((line, i) => {
            const parts = line.split("**");
            return (
              <div key={i} className="flex gap-3 pt-3">
                <div
                  className="w-1 rounded-full flex-shrink-0 mt-1"
                  style={{ backgroundColor: ["#3b82f6", "#f59e0b", "#10b981"][i % 3], minHeight: 40 }}
                />
                <p className="text-sm text-white/80 leading-relaxed">
                  {parts.map((part, j) =>
                    j % 2 === 1
                      ? <span key={j} className="font-bold text-white">{part}</span>
                      : <span key={j}>{part}</span>
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