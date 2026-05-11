// 구종 구성 (Pitch Usage) 컴포넌트 — 좌: 구종 리스트 / 우: 세로 스택바
// 우측 상단 ⓘ 버튼 호버 시 구종 설명 이미지 팝업 (fixed 포지션, 클리핑 없음)
import { useState, useEffect, useRef } from "react";
import { fetchPitchArsenal } from "@/api/pitchApi";
import type { PitchArsenalItem } from "@/api/pitchApi";
import pitchGuideImage from "@/assets/pitch-guide.png";

interface PitchArsenalCardProps {
  pid: number;
}

const MIN_BAR_PCT = 8;

function calcBarWidth(pctNorm: number, items: number): number {
  const totalMin = MIN_BAR_PCT * items;
  if (totalMin >= 100) return 100 / items;
  const remaining = 100 - totalMin;
  return MIN_BAR_PCT + (pctNorm / 100) * remaining;
}

export default function PitchArsenalCard({ pid }: PitchArsenalCardProps) {
  const [arsenal, setArsenal] = useState<PitchArsenalItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, right: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!pid) return;
    setLoading(true);
    setArsenal([]);
    fetchPitchArsenal(pid)
      .then(setArsenal)
      .finally(() => setLoading(false));
  }, [pid]);

  const total = arsenal.reduce((s, p) => s + (p.usage ?? 0), 0);
  const normalized = arsenal.map((p) => ({
    ...p,
    pctNorm: total > 0 ? Math.round(((p.usage ?? 0) / total) * 1000) / 10 : 0,
  }));

  const handleMouseEnter = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    // fixed는 뷰포트 기준 → scrollY/scrollX 더하지 않음
    setPopupPos({
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
      left: rect.left,
    });
    setShowGuide(true);
  };

  const handleMouseLeave = () => setShowGuide(false);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* ── 헤더 ── */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
          <div className="w-1 h-5 rounded-full bg-red-500" />
          <h3 className="font-bold text-gray-800 text-sm">
            구종 구성 (Pitch Usage)
          </h3>

          {/* ⓘ 정보 버튼 */}
          {!imgError && (
            <button
              ref={btnRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="ml-auto w-5 h-5 rounded-full border-2 border-orange-300 bg-orange-50 hover:bg-orange-100 flex items-center justify-center transition-colors text-orange-400 hover:text-orange-600"
              aria-label="구종 설명 보기"
            >
              <span className="text-[10px] font-black leading-none">i</span>
            </button>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center h-36 text-gray-300 text-sm">
            로딩 중...
          </div>
        )}

        {!loading && arsenal.length === 0 && (
          <div className="flex items-center justify-center h-36 text-gray-300 text-sm">
            구종 데이터가 없습니다.
          </div>
        )}

        {!loading && normalized.length > 0 && (
          <div className="flex gap-4 px-5 py-4">
            {/* ── 좌측: 구종 리스트 ── */}
            <div className="flex-1 space-y-2.5 min-w-0">
              {normalized.map((p) => {
                const barW = calcBarWidth(p.pctNorm, normalized.length);
                return (
                  <div key={p.abbr} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 w-28 flex-shrink-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-black text-gray-700 block leading-none">
                          {p.abbr}
                        </span>
                        <span className="text-[10px] text-gray-400 truncate block leading-tight mt-0.5">
                          {p.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${barW}%`,
                          backgroundColor: p.color,
                        }}
                      />
                    </div>

                    <span className="text-[11px] text-gray-400 w-14 text-right flex-shrink-0">
                      {p.speed != null ? `${p.speed}km/h` : "—"}
                    </span>

                    <span
                      className="text-sm font-black w-10 text-right flex-shrink-0"
                      style={{ color: p.color }}
                    >
                      {p.pctNorm}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* ── 우측: 세로 스택바 ── */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0 w-10">
              <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide text-center leading-tight">
                비율
              </span>
              <div
                className="flex-1 w-7 rounded-full overflow-hidden flex flex-col-reverse"
                style={{ minHeight: 120 }}
              >
                {[...normalized].reverse().map((p) => {
                  const segH = calcBarWidth(p.pctNorm, normalized.length);
                  return (
                    <div
                      key={p.abbr}
                      className="w-full transition-all duration-500"
                      style={{
                        height: `${segH}%`,
                        backgroundColor: p.color,
                      }}
                      title={`${p.abbr} ${p.pctNorm}%`}
                    />
                  );
                })}
              </div>
              <span className="text-[9px] text-gray-300 font-bold">100%</span>
            </div>
          </div>
        )}
      </div>

      {/* ── 팝업: fixed 뷰포트 기준 좌표 ── */}
      {showGuide && !imgError && (
        <div
          className="fixed z-[9999] rounded-xl overflow-hidden shadow-2xl border border-gray-200 bg-white"
          style={{
            top: popupPos.top,
            left: popupPos.left,
            width: "clamp(260px, 30vw, 480px)",
            animation: "pitchGuideFadeIn 0.15s ease-out",
            pointerEvents: "none",
          }}
        >
          <img
            src={pitchGuideImage}
            alt="구종 설명"
            className="w-full h-auto block"
            onError={() => setImgError(true)}
          />
        </div>
      )}

      <style>{`
        @keyframes pitchGuideFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
