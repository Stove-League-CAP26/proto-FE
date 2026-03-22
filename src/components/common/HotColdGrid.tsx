// 타자의 구역별 타율 또는 삼진 비율을 그리드로 시각화하는 컴포넌트
// outer: 코너 4칸, inner: 중앙 3x3칸, stepColors로 온도 표현
import { stepColors } from "@/constants/stepColors";

interface ZoneCell {
  val: string;
  step: number;
}

interface HotColdGridProps {
  outer: ZoneCell[];
  inner: ZoneCell[];
  title?: string;
}

export default function HotColdGrid({ outer, inner, title }: HotColdGridProps) {
  return (
    <div className="flex flex-col items-center">
      {title && <p className="text-xs font-bold text-gray-500 mb-2">{title}</p>}
      <div className="relative" style={{ width: 180, height: 180 }}>
        {[
          { d: outer[0], style: { top: 0, left: 0, width: 50, height: 50 } },
          { d: outer[1], style: { top: 0, right: 0, width: 50, height: 50 } },
          { d: outer[2], style: { bottom: 0, left: 0, width: 50, height: 50 } },
          { d: outer[3], style: { bottom: 0, right: 0, width: 50, height: 50 } },
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