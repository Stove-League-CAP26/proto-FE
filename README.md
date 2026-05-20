# ⚾ 스토브리그 (Stoveleague) — Frontend

KBO 야구 팬을 위한 선수 프로필 · 팀 분석 플랫폼의 프론트엔드 클라이언트입니다.

---

## 전체 구조

```
프로젝트/
├── backend/    (Spring Boot, 포트 8080)
└── frontend/   ← 현재 위치 (React + Vite + TypeScript, 포트 5173)
```

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React 18 + TypeScript |
| 빌드 도구 | Vite |
| 스타일링 | Tailwind CSS |
| 차트 | 순수 SVG (외부 라이브러리 미사용) |

---

## 사전 설치 요건

| 도구 | 버전 | 확인 명령어 |
|------|------|-------------|
| Git | - | `git --version` |
| Node.js | 18 이상 | `node -v` |
| npm | 9 이상 | `npm -v` |

> **백엔드 서버(`localhost:8080`)가 먼저 실행되어 있어야 합니다.**  
> 백엔드 실행 방법은 `README-BE.md` 참고

---

## 실행 방법

### 1단계 — 레포지토리 클론

```bash
git clone https://github.com/Stove-League-CAP26/proto-FE.git
cd proto-FE
```

### 2단계 — 의존성 설치

```bash
npm install
```

### 3단계 — 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 으로 접속합니다.

### 빌드 (배포용)

```bash
npm run build
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.

---

## 프로젝트 구조

```
src/
├── api/
│   ├── playerApi.ts        # 선수 정보 API 호출
│   ├── authApi.ts          # 회원가입, 로그인 API
│   ├── gameApi.ts          # 경기 일정, 순위 API
│   ├── newsApi.ts          # 뉴스 API
│   └── predictionApi.ts    # AI 경기 예측 API
├── components/
│   ├── common/             # 공통 컴포넌트 (RadarChart, PlayerAvatar 등)
│   ├── best/               # BEST 플레이어 관련 컴포넌트
│   ├── compare/            # 선수 비교 관련 컴포넌트
│   ├── profile/            # 선수 프로필 관련 컴포넌트
│   └── team/               # 팀 관련 컴포넌트
├── constants/
│   ├── teamColors.ts       # KBO 10개 구단 팀 컬러
│   └── stepColors.ts       # 핫/콜드존 단계별 색상
├── mock/                   # 목업 데이터 (개발용)
├── pages/
│   ├── MainPage.tsx        # 메인 (경기 일정, 순위, 뉴스, AI 예측)
│   ├── PlayerProfilePage.tsx  # 선수 프로필
│   ├── BestPlayerPage.tsx     # BEST 플레이어 랭킹
│   ├── ComparePage.tsx        # 선수 비교
│   ├── TeamPage.tsx           # 팀 목록 + 상세
│   ├── LoginPage.tsx          # 로그인
│   └── SignupPage.tsx         # 회원가입
├── types/
│   └── playerStats.ts      # HitterStat, PitcherStat 타입 정의
├── utils/
│   └── playerUtils.ts      # 포맷 함수, 레이더 키 매핑 등
└── router.tsx              # 클라이언트 사이드 라우팅
```

---

## 주요 컴포넌트

### Pages

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 메인 | `/` | 경기 일정, 팀 순위, 뉴스, AI 예측 |
| 선수 프로필 | `/player` | 선수 검색 → 스탯, 레이더, 존 분석 |
| BEST | `/best` | WAR 기준 히어로 카드 + 부문별 순위 |
| 선수 비교 | `/compare` | HvH / PvP / HvP 모드 비교 |
| 팀 | `/team` | 팀 목록 + 소개, 뎁스, 선수, 응원가, 굿즈 탭 |
| 로그인 | `/login` | JWT 기반 로그인 |
| 회원가입 | `/signup` | 이메일/닉네임/비밀번호 |

### Common Components

| 컴포넌트 | 설명 |
|----------|------|
| `RadarChart` | 육각형 레이더 차트 (light/dark 테마) |
| `PlayerAvatar` | KBO 이미지 서버 연동, 실패 시 이모지 대체 |
| `PercentileRing` | 퍼센타일 원형 게이지 |
| `RollingLineChart` | ERA/OPS 추이 SVG 라인 차트 |
| `HotColdGrid` | 구역별 타율/삼진 존 그리드 |

---

## 백엔드 API 연동

프론트는 `/api/**` 경로로 요청을 보내며, Vite 개발 서버가 이를 `localhost:8080`으로 프록시합니다.

| 함수 | 엔드포인트 | 설명 |
|------|-----------|------|
| `searchPlayersByName` | `GET /api/players/search?name=` | 선수 이름 검색 |
| `fetchPlayerBasic` | `GET /api/players/{pid}` | 선수 기본 정보 |
| `fetchHitterStats` | `GET /api/stats/hitter/{pid}` | 타자 시즌 스탯 |
| `fetchPitcherStats` | `GET /api/stats/pitcher/{pid}` | 투수 시즌 스탯 |
| `fetchHitterRadar` | `GET /api/stats/radar/hitter/{pid}` | 타자 레이더 |
| `fetchPitcherRadar` | `GET /api/stats/radar/pitcher/{pid}` | 투수 레이더 |

---

## 트러블슈팅

**`npm install` 후 실행 오류**
→ Node.js 버전이 18 이상인지 확인 (`node -v`)

**API 요청이 모두 실패하는 경우**
→ 백엔드 서버(`localhost:8080`)가 실행 중인지 먼저 확인

**화면에 데이터가 안 뜨는 경우**
→ 브라우저 개발자 도구 콘솔에서 네트워크 오류 메시지 확인
