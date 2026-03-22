// 두 선수의 스탯을 항목별로 좌우 비교하는 테이블 컴포넌트
// 항목별 우위 선수를 색상으로 강조하고 상단에 종합 벤치마크 바를 표시
interface PlayerData {
  name: string;
  type: "hitter" | "pitcher";
  stats: Record<string, any>;
}

interface StatCompareTableProps {
  pA: PlayerData;
  pB: PlayerData;
}

const HITTER_COLS = ["G","PA","AB","R","H","2B","HR","RBI","SB","BB","SO","AVG","OBP","SLG","OPS","WAR"];
const PITCHER_COLS = ["G","W","L","IP","ERA","WHIP","K","BB","H","HR","FIP","WAR"];
const HIGHER_IS_BETTER = ["G","PA","AB","R","H","2B","HR","RBI","SB","BB","W","K","IP","WAR","AVG","OBP","SLG","OPS"];
const LOWER_IS_BETTER = ["SO","ERA","WHIP","BB","H","HR","FIP","L"];

export default function StatCompareTable({ pA, pB }: StatCompareTableProps) {
  let cols: string[];
  if (pA.type === "hitter" && pB.type === "hitter") cols = HITTER_COLS;
  else if (pA.type === "pitcher" && pB.type === "pitcher") cols = PITCHER_COLS;
  else cols = ["WAR"];

  let aWinCount = 0, bWinCount = 0;

  const rows = cols.map((col) => {
    const aVal = pA.stats[col], bVal = pB.stats[col];
    const aNum = parseFloat(aVal), bNum = parseFloat(bVal);
    let aWin = false, bWin = false;
    if (!isNaN(aNum) && !isNaN(bNum) && aNum !== bNum) {
      if (HIGHER_IS_BETTER.includes(col)) { aWin = aNum > bNum; bWin = !aWin; }
      else if (LOWER_IS_BETTER.includes(col)) { aWin = aNum < bNum; bWin = !aWin; }
    }
    if (aWin) aWinCount++;
    if (bWin) bWinCount++;
    return { col, aVal, bVal, aWin, bWin };
  });

  const total = rows.filter((r) => r.aWin || r.bWin).length;
  const aScore = total > 0 ? Math.round((aWinCount / total) * 100) : 50;
  const bScore = 100 - aScore;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-3">
        <span className="text-xs font-black text-blue-600 w-12 text-right">{aScore}%</span>
        <div className="flex-1 h-2.5 rounded-full overflow-hidden bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
            style={{ width: `${aScore}%` }}
          />
        </div>
        <span className="text-xs font-black text-red-500 w-12">{bScore}%</span>
        <span className="text-xs text-gray-400 ml-1">종합 벤치마크</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <td className="px-4 py-2.5 text-xs font-black text-blue-600 text-center">{pA.name}</td>
              <td className="px-4 py-2.5 text-xs font-bold text-gray-400 text-center uppercase tracking-wide">항목</td>
              <td className="px-4 py-2.5 text-xs font-black text-red-500 text-center">{pB.name}</td>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ col, aVal, bVal, aWin, bWin }) => (
              <tr key={col} className="border-t border-gray-50 hover:bg-gray-50/50">
                <td className={`px-4 py-2.5 text-center font-bold ${aWin ? "text-blue-600 bg-blue-50/60" : "text-gray-500"}`}>
                  {aWin && <span className="mr-1 text-blue-400">▶</span>}
                  {aVal ?? "-"}
                </td>
                <td className="px-4 py-2.5 text-center text-xs font-black text-gray-400 uppercase tracking-wide">{col}</td>
                <td className={`px-4 py-2.5 text-center font-bold ${bWin ? "text-red-500 bg-red-50/60" : "text-gray-500"}`}>
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