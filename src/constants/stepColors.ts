// 핫/콜드존 그리드에서 사용하는 단계별 색상 상수
// step 1(파랑/차가움) ~ step 5(빨강/뜨거움)
export const stepColors: Record<number, { bg: string; text: string }> = {
  1: { bg: "#3B82F6", text: "#fff" },
  2: { bg: "#93C5FD", text: "#1e3a5f" },
  3: { bg: "#F3F4F6", text: "#374151" },
  4: { bg: "#FCA5A5", text: "#7f1d1d" },
  5: { bg: "#EF4444", text: "#fff" },
};