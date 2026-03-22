import { TEAM_COLORS } from "@/constants/teamColors";

export const TEAMS_LIST = [ {
    id: "KIA",
    name: "KIA 타이거즈",
    short: "KIA",
    city: "광주",
    emoji: "🐯",
    bg: "#EA0029",
    accent: "#05141F",
    stadium: "광주-기아 챔피언스 필드",
  },
  {
    id: "두산",
    name: "두산 베어스",
    short: "두산",
    city: "서울",
    emoji: "🐻",
    bg: "#131230",
    accent: "#C8102E",
    stadium: "잠실 야구장",
  },
  {
    id: "LG",
    name: "LG 트윈스",
    short: "LG",
    city: "서울",
    emoji: "⚡",
    bg: "#C30452",
    accent: "#000000",
    stadium: "잠실 야구장",
  },
  {
    id: "삼성",
    name: "삼성 라이온즈",
    short: "삼성",
    city: "대구",
    emoji: "🦁",
    bg: "#1428A0",
    accent: "#C0C0C0",
    stadium: "대구 삼성 라이온즈 파크",
  },
  {
    id: "NC",
    name: "NC 다이노스",
    short: "NC",
    city: "창원",
    emoji: "🦕",
    bg: "#071D39",
    accent: "#BFA253",
    stadium: "창원 NC 파크",
  },
  {
    id: "SSG",
    name: "SSG 랜더스",
    short: "SSG",
    city: "인천",
    emoji: "🚀",
    bg: "#CE0E2D",
    accent: "#FFB81C",
    stadium: "인천 SSG 랜더스필드",
  },
  {
    id: "롯데",
    name: "롯데 자이언츠",
    short: "롯데",
    city: "부산",
    emoji: "🌊",
    bg: "#041E42",
    accent: "#E61E2B",
    stadium: "사직 야구장",
  },
  {
    id: "한화",
    name: "한화 이글스",
    short: "한화",
    city: "대전",
    emoji: "🦅",
    bg: "#FF6600",
    accent: "#000000",
    stadium: "한화생명 이글스파크",
  },
  {
    id: "키움",
    name: "키움 히어로즈",
    short: "키움",
    city: "서울",
    emoji: "🦸",
    bg: "#820024",
    accent: "#FFB81C",
    stadium: "고척 스카이돔",
  },
  {
    id: "KT",
    name: "KT 위즈",
    short: "KT",
    city: "수원",
    emoji: "🧙",
    bg: "#000000",
    accent: "#E40E20",
    stadium: "수원 KT 위즈파크",
  },];
export const MOCK_TEAM_DATA = {  KIA: {
    founded: "1982년",
    championship: "11회 (최다)",
    manager: "이범호",
    ranking2025: "1위",
    wins: 88,
    losses: 55,
    draws: 1,
    radar: { 타격: 88, 투구: 82, 수비: 79, 주루: 85, 불펜: 76, 팀결속: 90 },
    history: [
      { year: "1982", event: "해태 타이거즈 창단" },
      { year: "1986~1989", event: "4연패 달성 (KBO 최초)" },
      { year: "2001", event: "KIA 자동차 인수 → KIA 타이거즈" },
      { year: "2009", event: "통합우승 달성" },
      { year: "2017", event: "11번째 한국시리즈 우승" },
      { year: "2024", event: "통합우승 달성" },
    ],
    roster: {
      pitcher: [
        { no: 34, name: "양현종", pos: "선발", id: 63762 },
        { no: 47, name: "네일", pos: "선발", id: 64001 },
        { no: 21, name: "윤영철", pos: "선발", id: 68100 },
        { no: 29, name: "변우혁", pos: "불펜", id: 68101 },
        { no: 52, name: "정해영", pos: "마무리", id: 68102 },
      ],
      catcher: [
        { no: 2, name: "한승택", pos: "포수", id: 68103 },
        { no: 35, name: "김태군", pos: "포수", id: 63507 },
      ],
      infield: [
        { no: 5, name: "김도영", pos: "유격수", id: 76232 },
        { no: 8, name: "이창진", pos: "2루수", id: 68104 },
        { no: 25, name: "최원준", pos: "1루수", id: 68105 },
        { no: 36, name: "박찬호", pos: "3루수", id: 68106 },
      ],
      outfield: [
        { no: 1, name: "나성범", pos: "우익수", id: 64300 },
        { no: 10, name: "이우성", pos: "좌익수", id: 68107 },
        { no: 14, name: "소크라테스", pos: "중견수", id: 68108 },
      ],
    },
    depthMap: {
      좌익수: [
        ["이우성", "2.1"],
        ["김성윤", "1.4"],
      ],
      중견수: [
        ["소크라테스", "3.2"],
        ["이창진", "1.1"],
      ],
      우익수: [
        ["나성범", "2.8"],
        ["김호령", "0.9"],
      ],
      유격수: [
        ["김도영", "6.2"],
        ["이형종", "0.5"],
      ],
      "2루수": [
        ["박찬호", "3.1"],
        ["김선빈", "1.2"],
      ],
      "1루수": [
        ["최원준", "2.0"],
        ["윤도현", "0.8"],
      ],
      "3루수": [
        ["위즈덤", "2.4"],
        ["오선우", "1.0"],
      ],
      포수: [
        ["한승택", "1.8"],
        ["김태군", "1.1"],
      ],
      지명타자: [
        ["전상현", "1.5"],
        ["황대인", "0.7"],
      ],
    },
    cheers: [
      { title: "KIA 있지는 것 같아", type: "응원가" },
      { title: "라이언킹", type: "응원가" },
      { title: "사랑한다 KIA", type: "응원가" },
      { title: "광주의 명성 승리의 이름", type: "구장송" },
      { title: "범벅송", type: "응원가" },
      { title: "KIA를 응원하여", type: "응원가" },
    ],
    players_notable: [
      { no: 5, name: "김도영", pos: "유격수", id: 76232 },
      { no: 34, name: "양현종", pos: "투수", id: 63762 },
      { no: 1, name: "나성범", pos: "외야수", id: 64300 },
      { no: 2, name: "한승택", pos: "포수", id: 68103 },
      { no: 47, name: "네일", pos: "투수", id: 64001 },
      { no: 21, name: "윤영철", pos: "투수", id: 68100 },
    ],
    mascots: [
      { name: "호걸이", period: "2017~", emoji: "🐯" },
      { name: "호연이", period: "2017~", emoji: "🐯" },
      { name: "하랑이", period: "2024~", emoji: "🐯" },
      { name: "호돌이", period: "1996~2016", emoji: "🐯" },
      { name: "이름불명", period: "2001~2009", emoji: "🐯" },
    ],
    logoHistory: [
      { era: "해태 타이거즈", period: "1982~2001", color: "#f59e0b" },
      { era: "KIA 타이거즈 초기", period: "2001~2016", color: "#EA0029" },
      { era: "KIA 타이거즈 현재", period: "2017~", color: "#EA0029" },
    ],
    uniforms: ["홈 (흰색)", "원정 (회색)", "대안 (빨강)", "특별판 (검정)"],
  }, };

// 기존 파일 하단에 있던 이 코드도 여기로
TEAMS_LIST.forEach((t) => {
  if (!MOCK_TEAM_DATA[t.id]) {
    MOCK_TEAM_DATA[t.id] = {
      ...MOCK_TEAM_DATA["KIA"],
      radar: {
        타격: Math.floor(70 + Math.random() * 20),
        // ...
      },
    };
  }
});