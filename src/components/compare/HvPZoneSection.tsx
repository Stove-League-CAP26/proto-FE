// src/components/compare/HvPZoneSection.tsx
// 레이아웃: 좌(타자 핫콜드존 크게) / 우(타자 탈삼진 + 투수 삼진 분포도)
import ZoneHeatmap from "@/components/common/ZoneHeatmap";
import type { ZoneGrid } from "@/components/common/ZoneHeatmap";

interface HvPZoneSectionProps {
  hitterName: string;
  pitcherName: string;
  hitterHotCold: ZoneGrid | null;
  hitterStrikeout?: ZoneGrid | null;
  pitcherStrikeout?: ZoneGrid | null;
  pitcherPitchZone: ZoneGrid | null;
}

// ── 크기 상수 ─────────────────────────────────────────────────────────────────
const BIG_SCALE = 1.0; // 좌측 핫콜드존 — 원본 크기
const MINI_SCALE = 0.62; // 우측 소형존
const BIG_PX = Math.round(280 * BIG_SCALE);
const MINI_PX = Math.round(280 * MINI_SCALE);

function BigZone({
  zone,
  colorMode,
  name,
  accentColor,
  label,
}: {
  zone: ZoneGrid | null;
  colorMode: "hotcold" | "single" | "inverted";
  name: string;
  accentColor: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* 선수명 뱃지 */}
      <div
        className="px-4 py-1.5 rounded-full text-xs font-black text-white self-start"
        style={{ background: accentColor }}
      >
        🏏 {name || "타자"}
      </div>
      <p className="text-[10px] text-gray-400 self-start -mt-2">{label}</p>

      {zone ? (
        <div
          style={{
            width: BIG_PX,
            height: BIG_PX,
            position: "relative",
            overflow: "visible",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              transform: `scale(${BIG_SCALE})`,
              transformOrigin: "top left",
              width: 280,
              height: 280,
              position: "absolute",
            }}
          >
            <ZoneHeatmap zone={zone} colorMode={colorMode} />
          </div>
        </div>
      ) : (
        <div
          className="rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50
                     flex items-center justify-center flex-shrink-0"
          style={{ width: BIG_PX, height: BIG_PX }}
        >
          <p className="text-xs text-gray-300">선수 선택 후 표시</p>
        </div>
      )}
      <p className="text-[9px] text-gray-400">
        투수 시점 기준 · 색상 = 구역별 상대값
      </p>
    </div>
  );
}

function MiniZone({
  zone,
  colorMode,
  name,
  accentColor,
  label,
  footnote,
}: {
  zone: ZoneGrid | null;
  colorMode: "hotcold" | "single" | "inverted";
  name: string;
  accentColor: string;
  label: string;
  footnote?: string;
}) {
  return (
    <div className="bg-gray-50/60 rounded-2xl p-3 flex flex-col items-center gap-2 border border-gray-100">
      {/* 헤더 */}
      <div className="flex items-center gap-2 self-stretch">
        <div
          className="w-1 h-4 rounded-full flex-shrink-0"
          style={{ background: accentColor }}
        />
        <p className="text-[11px] font-bold text-gray-700 truncate">{name}</p>
        <span className="text-[9px] text-gray-400 ml-auto whitespace-nowrap">
          {label}
        </span>
      </div>

      {zone ? (
        <div
          style={{
            width: MINI_PX,
            height: MINI_PX,
            position: "relative",
            overflow: "visible",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              transform: `scale(${MINI_SCALE})`,
              transformOrigin: "top left",
              width: 280,
              height: 280,
              position: "absolute",
            }}
          >
            <ZoneHeatmap zone={zone} colorMode={colorMode} />
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl border border-dashed border-gray-200 bg-white
                     flex items-center justify-center flex-shrink-0"
          style={{ width: MINI_PX, height: MINI_PX }}
        >
          <p className="text-[10px] text-gray-300">데이터 없음</p>
        </div>
      )}
      {footnote && (
        <p className="text-[9px] text-gray-400 text-center">{footnote}</p>
      )}
    </div>
  );
}

export default function HvPZoneSection({
  hitterName,
  pitcherName,
  hitterHotCold,
  hitterStrikeout,
  pitcherStrikeout,
  pitcherPitchZone,
}: HvPZoneSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 헤더 */}
      <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2 flex-wrap">
        <span className="w-1.5 h-5 rounded-full inline-block bg-purple-500" />
        <h3 className="font-bold text-gray-800 text-sm">존 분석</h3>
        <span className="ml-auto text-[10px] text-gray-400">
          투수 시점 기준
        </span>
      </div>

      {/* 본문 — 2컬럼 */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* 좌: 타자 핫/콜드존 (크게) */}
        <BigZone
          zone={hitterHotCold}
          colorMode="hotcold"
          name={hitterName}
          accentColor="#3B82F6"
          label="핫/콜드존"
        />

        {/* 우: 타자 탈삼진 + 투수 삼진 분포도 (스택) */}
        <div className="flex flex-col gap-4">
          <MiniZone
            zone={hitterStrikeout ?? null}
            colorMode="single"
            name={hitterName}
            accentColor="#3B82F6"
            label="탈삼진 분포"
            footnote="타자 삼진당한 구역"
          />
          <MiniZone
            zone={pitcherStrikeout ?? null}
            colorMode="inverted"
            name={pitcherName}
            accentColor="#F97316"
            label="삼진 분포"
            footnote="투수 탈삼진 구역"
          />
          <MiniZone
            zone={pitcherPitchZone}
            colorMode="single"
            name={pitcherName}
            accentColor="#F97316"
            label="투구 분포"
            footnote="투수가 자주 던지는 구역"
          />
        </div>
      </div>
    </div>
  );
}
