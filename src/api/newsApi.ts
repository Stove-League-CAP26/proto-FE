// src/api/newsApi.ts

const BASE_URL = "http://localhost:8080/api";

export interface NewsItem {
  title: string;
  link: string;
  originallink: string;
  description: string;
  pubDate: string;
  category: string;
}

export const NEWS_CATEGORIES = [
  "전체",
  "경기결과",
  "투수",
  "타자",
  "홈런",
  "트레이드",
  "FA",
  "부상",
  "팀소식",
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

// 카테고리별 클라이언트 필터링

export function filterNewsByCategory(
  news: NewsItem[],
  category: NewsCategory,
): NewsItem[] {
  if (category === "전체") return news;
  return news.filter((n) => n.category === category);
}

// 한 번만 fetch — 카테고리 필터링은 클라이언트에서
export async function fetchNews(): Promise<NewsItem[]> {
  const res = await fetch(`${BASE_URL}/news`);
  if (!res.ok) throw new Error("뉴스 조회 실패");
  return res.json();
}

// pubDate → "4시간 전" 형식
export function formatNewsDate(pubDate: string): string {
  const date = new Date(pubDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "방금";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;

  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${m}/${d}`;
}
