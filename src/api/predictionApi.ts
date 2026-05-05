// src/api/predictionApi.ts
const BASE_URL = "/api/predictions";

// ── 타입 정의 ──────────────────────────────────────────────────

export interface RecentResult {
  gameScheduleId: number;
  naverGameId: string;
  gameDate: string;
  homeTeam: string;
  awayTeam: string;
  statusCode: string; // BEFORE / LIVE / RESULT
  isCorrect: boolean | null;
}

export interface AiRankingItem {
  rank: number;
  provider: string;
  providerLabel: string;
  recentResults: RecentResult[];
  correctCount: number;
  totalCount: number;
  winRate: number;
}

export interface TodayPrediction {
  gameScheduleId: number;
  naverGameId: string;
  gameDate: string;
  gameTime: string;
  homeTeam: string;
  awayTeam: string;
  homeStarter: string;
  awayStarter: string;
  stadium: string;
  statusCode: string;
  actualWinner: string | null;
  homeScore: number | null;
  awayScore: number | null;
  predictions: {
    provider: string;
    winner: string;
    homeScorePred: number;
    awayScorePred: number;
    homeWinProb: number;
    awayWinProb: number;
    reason: string;
    isCorrect: boolean | null;
  }[];
}

export interface PredictionItem {
  gameScheduleId: number;
  naverGameId: string;
  gameDate: string;
  gameTime: string;
  homeTeam: string;
  awayTeam: string;
  homeStarter: string;
  awayStarter: string;
  stadium: string;
  statusCode: string;
  winner: string;
  homeScorePred: number;
  awayScorePred: number;
  homeWinProb: number;
  awayWinProb: number;
  reason: string;
  isCorrect: boolean | null;
  actualWinner: string | null;
  homeScore: number | null;
  awayScore: number | null;
}

export interface AiProviderHistory {
  provider: string;
  providerLabel: string;
  totalCount: number;
  predictions: PredictionItem[];
}

// ── API 함수 ────────────────────────────────────────────────────

export async function fetchAiRanking(): Promise<AiRankingItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/ai-ranking`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchTodayPredictions(): Promise<TodayPrediction[]> {
  try {
    const res = await fetch(`${BASE_URL}/today`);
    if (res.status === 204) return [];
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchProviderHistory(
  provider: string,
  size = 5,
): Promise<AiProviderHistory | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/ai-ranking/${provider}?page=0&size=${size}`,
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── 유틸 ────────────────────────────────────────────────────────

export function getProviderIcon(provider: string): string {
  switch (provider) {
    case "openai":
      return "🤖";
    case "gemini":
      return "✨";
    case "anthropic":
      return "🧠";
    default:
      return "🤖";
  }
}

export function getProviderColor(provider: string): string {
  switch (provider) {
    case "openai":
      return "#10a37f";
    case "gemini":
      return "#4285f4";
    case "anthropic":
      return "#d4a96a";
    default:
      return "#6b7280";
  }
}
