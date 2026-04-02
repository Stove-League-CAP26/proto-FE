// 팀 히스토리 타임라인 — 라이트 테마
import type { HistoryEvent } from "@/mock/teamData";
import { HISTORY_META } from "@/constants/teamConstants";

interface HistoryTabProps {
  history: HistoryEvent[];
  teamColor: string;
}

export default function HistoryTab({ history, teamColor }: HistoryTabProps) {
  const sorted = [...history].sort((a, b) => a.year - b.year);

  return (
    <div className="relative pl-5 space-y-5">
      <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-100" />
      {sorted.map((ev, i) => {
        const m = HISTORY_META[ev.type];
        return (
          <div key={i} className="relative flex gap-3">
            <div
              className="absolute -left-[13px] w-[10px] h-[10px] rounded-full mt-1 flex-shrink-0"
              style={{
                backgroundColor: m.color,
                boxShadow: `0 0 6px ${m.color}66`,
              }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className="text-xs font-black px-2 py-0.5 rounded-full"
                  style={{
                    background: m.color + "15",
                    color: m.color,
                    border: `1px solid ${m.color}30`,
                  }}
                >
                  {ev.year}
                </span>
                <span className="text-[11px]">{m.icon}</span>
                <span className="text-gray-800 text-xs font-bold">
                  {ev.title}
                </span>
              </div>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                {ev.description}
              </p>
              {ev.playerName && (
                <span
                  className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: teamColor + "15", color: teamColor }}
                >
                  #{ev.number} {ev.playerName}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
