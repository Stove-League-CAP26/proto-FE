// src/mock/homeData.ts
// 뉴스 / 유튜브 / 중계 목업 데이터

export const MOCK_NEWS = [
  {
    id: 1,
    title: "KIA 타이거즈, 3연승으로 단독 선두 굳히기",
    source: "스포츠조선",
    date: "2025-04-13",
    url: "https://sports.chosun.com",
    thumbnail: "",
    category: "경기결과",
  },
  {
    id: 2,
    title: "이의리, 시즌 첫 완투승... 투수 행진 어디까지?",
    source: "MK스포츠",
    date: "2025-04-13",
    url: "https://mksports.co.kr",
    thumbnail: "",
    category: "선수",
  },
  {
    id: 3,
    title: "두산 베어스, 불펜 보강 위해 트레이드 검토 중",
    source: "스포츠서울",
    date: "2025-04-12",
    url: "https://sportsseoul.com",
    thumbnail: "",
    category: "팀소식",
  },
  {
    id: 4,
    title: "[오늘의 선발] 4월 13일 KBO 5경기 선발 라인업",
    source: "KBO 공식",
    date: "2025-04-13",
    url: "https://www.koreabaseball.com",
    thumbnail: "",
    category: "예고",
  },
  {
    id: 5,
    title: "류현진 복귀 후 3연속 퀄리티스타트 달성",
    source: "일간스포츠",
    date: "2025-04-12",
    url: "https://ilgan.co.kr",
    thumbnail: "",
    category: "선수",
  },
  {
    id: 6,
    title: "2025 KBO 관중 수, 작년 대비 15% 증가",
    source: "연합뉴스",
    date: "2025-04-11",
    url: "https://yna.co.kr",
    thumbnail: "",
    category: "리그",
  },
];

export const YOUTUBE_CHANNELS = [
  {
    name: "KBO 공식 채널",
    handle: "@KBO_League",
    url: "https://www.youtube.com/@KBO_League",
    emoji: "⚾",
    desc: "KBO 공식 하이라이트 & 영상",
    color: "#CC0000",
  },
  {
    name: "야구왕 TV",
    handle: "@baseballking",
    url: "https://youtube.com",
    emoji: "👑",
    desc: "KBO 분석 & 리뷰",
    color: "#FF6B35",
  },
  {
    name: "스포츠 서울",
    handle: "@sportsseoul",
    url: "https://youtube.com",
    emoji: "📰",
    desc: "야구 뉴스 & 인터뷰",
    color: "#1A73E8",
  },
  {
    name: "베이스볼 라이브",
    handle: "@baseballlive",
    url: "https://youtube.com",
    emoji: "🎙️",
    desc: "실시간 야구 이야기",
    color: "#34A853",
  },
];

export const TEAM_FAN_CHANNELS: Record<string, { name: string; url: string; emoji: string }> = {
  KIA:  { name: "타이거즈 팬TV",   url: "https://youtube.com", emoji: "🐯" },
  삼성:  { name: "라이온즈 팬채널", url: "https://youtube.com", emoji: "🦁" },
  LG:   { name: "트윈스 팬TV",     url: "https://youtube.com", emoji: "🐻" },
  두산:  { name: "베어스 팬채널",   url: "https://youtube.com", emoji: "🐻" },
  SSG:  { name: "랜더스 팬TV",     url: "https://youtube.com", emoji: "🚀" },
  KT:   { name: "위즈 팬채널",     url: "https://youtube.com", emoji: "🧙" },
  한화:  { name: "이글스 팬TV",    url: "https://youtube.com", emoji: "🦅" },
  NC:   { name: "다이노스 팬채널", url: "https://youtube.com", emoji: "🦕" },
  키움:  { name: "히어로즈 팬TV",  url: "https://youtube.com", emoji: "⚡" },
  롯데:  { name: "자이언츠 팬채널", url: "https://youtube.com", emoji: "🎡" },
};

export const BROADCAST_SITES = [
  {
    name: "TVING",
    url: "https://tving.com",
    emoji: "📺",
    desc: "KBO 공식 중계 파트너",
    badge: "공식",
    badgeColor: "#E50914",
  },
  {
    name: "KBO 공식 홈페이지",
    url: "https://www.koreabaseball.com",
    emoji: "⚾",
    desc: "경기 일정, 기록, 티켓",
    badge: "공식",
    badgeColor: "#004EA2",
  },
  {
    name: "네이버 스포츠",
    url: "https://sports.naver.com/kbaseball",
    emoji: "🟢",
    desc: "실시간 문자 중계",
    badge: "무료",
    badgeColor: "#03C75A",
  },
  {
    name: "스포티비",
    url: "https://spotv.net",
    emoji: "🎬",
    desc: "스포티비 나우 KBO 중계",
    badge: "유료",
    badgeColor: "#FF6B35",
  },
  {
    name: "카카오TV",
    url: "https://tv.kakao.com",
    emoji: "💛",
    desc: "일부 경기 무료 중계",
    badge: "일부무료",
    badgeColor: "#FEE500",
  },
];

export const COMMUNITY_LINKS = [
  { name: "에펨코리아", url: "https://www.fmkorea.com/baseball", emoji: "💬" },
  { name: "야구 갤러리", url: "https://gall.dcinside.com/board/lists/?id=baseball", emoji: "⚾" },
  { name: "MLB파크", url: "https://mlbpark.donga.com", emoji: "🏟️" },
  { name: "KBO 공카 모음", url: "https://www.koreabaseball.com", emoji: "📱" },
];
