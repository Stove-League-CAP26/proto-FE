// 선수 비교 페이지에서 핫/콜드존을 작은 사이즈로 표시하는 컴포넌트
// ZoneCompareSection에서 타자와 투수 각각의 존을 나란히 보여줄 때 사용
import { stepColors } from "@/constants/stepColors";

interface ZoneCell {
  val: string;
  step: number;
}

interface MiniZoneGridProps {
  outer: ZoneCell[];
  inner: ZoneCell[];
}

export default function MiniZoneGrid({ outer, inner }: MiniZoneGridProps) {
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