// ── 팀 페이지 공용 상수 ──────────────────────────────────────────

export const KOREA_PATH =
  "M 77,54 L 95,46 L 112,36 L 130,30 L 150,30 L 170,33 L 188,38 " +
  "L 205,48 L 210,62 L 215,80 L 218,100 L 224,120 L 229,140 L 231,160 " +
  "L 231,175 L 231,190 L 228,205 L 224,218 L 218,228 L 208,237 " +
  "L 194,238 L 180,240 L 167,243 L 155,248 L 142,254 L 130,255 " +
  "L 118,258 L 106,260 L 100,243 L 95,228 L 90,210 L 82,185 " +
  "L 78,165 L 82,145 L 88,123 L 92,100 L 97,83 L 102,66 L 95,58 Z";

export const RADAR_AXES = [
  { key: "ERA", label: "ERA", sub: "평균자책점" },
  { key: "WHIP", label: "WHIP", sub: "이닝당출루" },
  { key: "QS", label: "QS", sub: "퀄리티스타트" },
  { key: "AVG", label: "타율", sub: "팀타율" },
  { key: "SB", label: "도루", sub: "도루" },
  { key: "OPS", label: "OPS", sub: "OPS" },
] as const;

export const HISTORY_META: Record<string, { icon: string; color: string }> = {
  founded: { icon: "🏟️", color: "#10B981" },
  rename: { icon: "📋", color: "#6366F1" },
  championship: { icon: "🏆", color: "#F59E0B" },
  retired: { icon: "🔒", color: "#EC4899" },
  stadium: { icon: "🏗️", color: "#3B82F6" },
  relocation: { icon: "📍", color: "#8B5CF6" },
};

export const POS_COLORS: Record<string, string> = {
  SP: "#3B82F6",
  RP: "#6366F1",
  CL: "#8B5CF6",
  C: "#10B981",
  "1B": "#F59E0B",
  "2B": "#F59E0B",
  "3B": "#F59E0B",
  SS: "#F59E0B",
  LF: "#EF4444",
  CF: "#EF4444",
  RF: "#EF4444",
  DH: "#EC4899",
};
