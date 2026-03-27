# ⚾ 스토브리그 (Stoveleague)

KBO 야구 팬을 위한 선수 프로필 · 팀 분석 플랫폼 프로토타입

---

## 기술 스택

| 분류         | 기술                              |
| ------------ | --------------------------------- |
| 프론트엔드   | React 18 + TypeScript + Vite      |
| 스타일링     | Tailwind CSS                      |
| 백엔드       | Spring Boot                       |
| 데이터베이스 | AWS RDS MySQL                     |
| 차트         | 순수 SVG (외부 라이브러리 미사용) |

---

## 파일 구조

```
src/
├── api/
│   └── playerApi.ts               # 백엔드 API 호출 함수 모음
├── components/
│   ├── best/
│   │   ├── CategoryCard.tsx        # 부문별 순위 카드 (타율/홈런 등)
│   │   ├── WARHeroCard.tsx         # WAR 1위 선수 히어로 카드
│   │   └── WARRankList.tsx         # WAR 전체 순위 리스트
│   ├── common/
│   │   ├── HotColdGrid.tsx         # 구역별 타율/삼진 존 그리드
│   │   ├── PercentileRing.tsx      # 퍼센타일 원형 게이지
│   │   ├── PlayerAvatar.tsx        # 선수 사진 (KBO 이미지 서버 연동)
│   │   ├── RadarChart.tsx          # 육각형 레이더 차트 (light/dark 테마)
│   │   └── RollingLineChart.tsx    # 롤링 ERA/OPS 라인 차트
│   ├── compare/
│   │   ├── AIAnalysisPanel.tsx     # 규칙 기반 AI 비교 분석 패널
│   │   ├── CompareModeTab.tsx      # 비교 모드별 컨텐츠 렌더링
│   │   ├── ComparePlayerCard.tsx   # 비교 선수 A/B 카드
│   │   ├── MiniZoneGrid.tsx        # 소형 존 그리드 (비교 페이지용)
│   │   ├── OverlayZoneGrid.tsx     # 타자 핫존 × 투수 투구존 오버레이
│   │   ├── PlayerSelectModal.tsx   # 선수 선택 모달
│   │   ├── StatCompareTable.tsx    # 스탯 항목별 좌우 비교 테이블
│   │   └── ZoneCompareSection.tsx  # 존 분석 섹션 (HvH/PvP/HvP)
│   ├── profile/
│   │   ├── HitterStatcastTab.tsx   # 타자 스탯캐스트 탭 (스프레이차트 · 롤링OPS · 기록)
│   │   ├── HotColdTab.tsx          # 핫/콜드존 탭 (타율존 · 삼진존 · 타구방향)
│   │   ├── PitchArsenalChart.tsx   # 투수 구종 구성 바 차트
│   │   ├── PitchZoneGrid.tsx       # 투수 투구 분포 존 그리드
│   │   ├── PitcherStandardTab.tsx  # 투수 기본 스탯 탭 (요약카드 · 시즌기록)
│   │   ├── PitcherStatcastTab.tsx  # 투수 스탯캐스트 탭 (구종 · 롤링ERA · 기록)
│   │   ├── PlayerAppLinks.tsx      # 바로가기 버튼 모음
│   │   ├── PlayerHeroBanner.tsx    # 히어로 배너 (사진 · 기본정보 · 레이더차트)
│   │   ├── PlayerPercentileBar.tsx # KBO 퍼센타일 랭킹 섹션
│   │   ├── PlayerSearchBar.tsx     # 선수 검색창 (compact/full 모드)
│   │   ├── PlayerTabBar.tsx        # 탭 바 + 연도 토글
│   │   ├── ProfileTab.tsx          # 프로필 탭 (선수카드 · 기본정보 · 커리어 · 레이더)
│   │   └── StatsTab.tsx            # 스탯 탭 (요약카드 · 기록테이블 · OPS추이)
│   └── team/
│       ├── DepthFieldChart.tsx     # 야구장 필드 위 포지션별 선수 오버레이
│       ├── HexRadar.tsx            # 팀 전용 레이더 차트 (레거시)
│       ├── TeamCheersTab.tsx       # 응원가 탭 (플레이어 UI · 목록)
│       ├── TeamDepthTab.tsx        # 뎁스 탭 (필드차트 · 포지션별 명단)
│       ├── TeamGoodsTab.tsx        # 굿즈·마스코트 탭
│       ├── TeamIntroTab.tsx        # 팀 소개 탭 (기본정보 · 성적 · 히스토리 · 레이더)
│       └── TeamPlayersTab.tsx      # 팀 선수 정보 탭 (카드 그리드)
├── constants/
│   ├── stepColors.ts               # 핫/콜드존 단계별 색상 (1~5)
│   └── teamColors.ts               # KBO 10개 구단 팀 컬러
├── mock/
│   ├── bestData.ts                 # BEST 플레이어 목업 데이터
│   ├── compareData.ts              # 선수 비교 목업 데이터
│   ├── statsData.ts                # 스탯 · 존 · 구종 목업 데이터
│   └── teamData.ts                 # 팀 정보 목업 데이터
├── pages/
│   ├── BestPlayerPage.tsx          # BEST 플레이어 페이지
│   ├── ComparePage.tsx             # 선수 비교 페이지
│   ├── PlayerProfilePage.tsx       # 선수 프로필 페이지 (상태관리 허브)
│   └── TeamPage.tsx                # 팀 목록 + 팀 상세 페이지
├── types/
│   └── playerStats.ts              # HitterStat · PitcherStat 타입 정의
└── utils/
    └── playerUtils.ts              # 유틸 함수 모음
```

---

## 주요 컴포넌트 상세

### 📄 Pages

#### `pages/`

| 파일                    | 설명                                                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PlayerProfilePage.tsx` | 선수 프로필 상태관리 허브. 검색 → 스탯 API + 레이더 API 동시 호출. `isPitcher()`로 타자/투수 탭·컴포넌트 분기. 직접 UI 렌더링 없이 하위 컴포넌트 조합만 담당 |
| `BestPlayerPage.tsx`    | WAR 기준 히어로 카드 + 전체 순위 리스트 + 부문별(타율·홈런·ERA 등) 카드 그리드. 타자/투수 토글 지원                                                          |
| `ComparePage.tsx`       | HvP·PvP·HvH 모드로 두 선수 비교. 스탯 테이블 · 존 분석 · AI 분석 패널 포함. 선수 선택 모달 관리                                                              |
| `TeamPage.tsx`          | 팀 목록 카드 그리드 + 팀 상세 페이지(`TeamDetailPage`)를 하나의 파일에서 관리. 소개·뎁스·선수·응원가·굿즈 탭                                                 |

---

### 🧩 Common Components

#### `components/common/`

| 파일                   | 설명                                                                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RadarChart.tsx`       | 육각형 레이더 차트. `theme="light"`: 어두운 배경 + 파란 그라디언트 / `theme="dark"`: 어두운 배경 + 골드/레드 그라디언트. viewBox 320×320, 반지름 110 |
| `PlayerAvatar.tsx`     | KBO 이미지 서버에서 연도별 순차 시도 (2025→2024→…→2020). 모두 실패 시 ⚾ 이모지 대체                                                                 |
| `PercentileRing.tsx`   | 퍼센타일 순위 원형 게이지. 90+: 빨강 / 70-89: 주황 / 40-69: 파랑 / -39: 회색                                                                         |
| `RollingLineChart.tsx` | ERA/OPS 추이 SVG 라인 차트. `inverse=true` 옵션으로 Y축 반전 지원 (ERA는 낮을수록 좋음)                                                              |
| `HotColdGrid.tsx`      | 구역별 타율/삼진 존 그리드. outer 4코너 + inner 3×3칸. `stepColors`로 온도 표현                                                                      |

---

### 🏆 Best Components

#### `components/best/`

| 파일               | 설명                                                                                |
| ------------------ | ----------------------------------------------------------------------------------- |
| `WARHeroCard.tsx`  | WAR 1위 선수 히어로 카드. 팀컬러 그라디언트 배경에 선수 사진과 WAR 수치를 크게 강조 |
| `WARRankList.tsx`  | WAR 전체 순위 리스트. 1~4위를 메달 이모지와 함께 표시. 팀컬러 아바타 테두리         |
| `CategoryCard.tsx` | 부문별(타율/홈런 등) 순위 카드. 1위 크게 강조 + 2~4위 리스트 + 더보기 버튼          |

---

### ⚖️ Compare Components

#### `components/compare/`

| 파일                     | 설명                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------- |
| `ComparePlayerCard.tsx`  | 비교 선수 A/B 카드. 사진·이름·팀·포지션·투타 뱃지 표시. 선택/변경 버튼                |
| `PlayerSelectModal.tsx`  | 선수 선택 모달. 이름·팀·포지션 검색 필터. 4열 카드 그리드                             |
| `CompareModeTab.tsx`     | 비교 모드별 컨텐츠 렌더링. 선수 미선택/모드 불일치 안내 처리                          |
| `StatCompareTable.tsx`   | 스탯 항목별 좌우 비교 테이블. 우위 항목 색상 강조 + 상단 종합 벤치마크 바             |
| `ZoneCompareSection.tsx` | 비교 모드에 따라 핫/콜드존 나란히(HvH/PvP) 또는 투타 오버레이 매치업 분석(HvP) 렌더링 |
| `MiniZoneGrid.tsx`       | 핫/콜드존을 작은 사이즈(130×130)로 표시. `ZoneCompareSection`에서 사용                |
| `OverlayZoneGrid.tsx`    | 타자 핫존 × 투수 투구분포 오버레이. 호버 시 공략/위험/회피/중립 전략 표시             |
| `AIAnalysisPanel.tsx`    | 규칙 기반 분석 텍스트를 600ms 간격으로 순차 표시하는 AI 분석 패널                     |

---

### 🏟️ Team Components

#### `components/team/`

| 파일                  | 설명                                                                               |
| --------------------- | ---------------------------------------------------------------------------------- |
| `TeamIntroTab.tsx`    | 팀 기본정보, 시즌 성적, 구단 히스토리, 팀 능력치 레이더(`RadarChart theme="dark"`) |
| `TeamDepthTab.tsx`    | 주전/엔트리 필드 차트(`DepthFieldChart`) + 포지션별 선수 명단 테이블               |
| `TeamPlayersTab.tsx`  | 포지션별 선수 카드 그리드. 클릭 시 선수 개인 페이지로 이동                         |
| `TeamCheersTab.tsx`   | 응원가 플레이어 UI와 응원가 목록 (목업, 실제 재생 미구현)                          |
| `TeamGoodsTab.tsx`    | 마스코트, 엠블럼 변천사, 유니폼, 공식 굿즈 섹션                                    |
| `DepthFieldChart.tsx` | SVG 야구장 필드 위에 포지션별 선수와 WAR을 오버레이로 표시하는 뎁스 차트           |
| `HexRadar.tsx`        | 팀 전용 레이더 차트 ⚠️ `RadarChart`로 대체 완료. 레거시 상태                       |

---

### 🏟️ Profile Components

#### `components/profile/`

| 파일                      | 설명                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `PlayerSearchBar.tsx`     | 선수 검색창. `compact=false`: 초기 전체화면 검색 UI / `compact=true`: 상단 고정 검색바 (현재 선수명 · 투타 뱃지 · 목록으로 버튼 포함) |
| `PlayerHeroBanner.tsx`    | 히어로 배너. 왼쪽: 선수 사진·기본정보·스탯 배지 / 오른쪽: 플레이어 스타일 뱃지 + 레이더 차트 + 항목별 수치 바 (로딩/빈상태 처리 포함) |
| `PlayerPercentileBar.tsx` | KBO 리그 전체 대비 퍼센타일 순위를 `PercentileRing`으로 가로 스크롤 표시. 타자/투수 항목 분기                                         |
| `PlayerTabBar.tsx`        | 선수 프로필 탭 바 (`sticky top-14`). 타자: 스탯캐스트·기본 스탯·핫/콜드존 / 투수: 스탯캐스트·기본 스탯·투구존. 우측 연도 토글 UI      |
| `PlayerAppLinks.tsx`      | 탭 바 상단 바로가기 버튼 모음. 타자/투수에 따라 다른 앱 목록을 pill 버튼으로 렌더링                                                   |
| `HitterStatcastTab.tsx`   | 타자 스탯캐스트 탭. 스프레이 차트(SVG 야구장 + 타구 오버레이) · 롤링 OPS 추이 · 시즌 기록 테이블                                      |
| `PitcherStatcastTab.tsx`  | 투수 스탯캐스트 탭. 구종 구성 바 차트(`PitchArsenalChart`) · 롤링 ERA 추이(`inverse=true`) · 시즌 기록 테이블                         |
| `PitcherStandardTab.tsx`  | 투수 기본 스탯 탭. 요약 카드 4개(ERA·승리·탈삼진·WHIP) + 시즌 투구 기록 전체 테이블                                                   |
| `HotColdTab.tsx`          | 타자 핫/콜드존 탭. 타율 기준 핫/콜드존 · 삼진 분포도 · 타구 방향 분포(LF/CF/RF) 3열 레이아웃                                          |
| `PitchZoneGrid.tsx`       | 투수 투구 분포도. outer 4코너 + inner 3×3 스트라이크존을 stepColors로 시각화                                                          |
| `PitchArsenalChart.tsx`   | 구종별 사용률(%)·평균 구속·헛스윙%를 수평 바 차트로 표시. `PitcherStatcastTab` 내부에서 사용                                          |
| `ProfileTab.tsx`          | 선수 카드(사진/등번호/수상), 기본정보, 커리어 히스토리, 스탯 레이더 3열 레이아웃 ⚠️ 현재 미사용                                       |
| `StatsTab.tsx`            | 주요 지표 요약 카드, 시즌별 타격 기록 테이블, OPS 연도별 추이 바 차트 ⚠️ 현재 미사용                                                  |

---

### 🔌 API (`playerApi.ts`)

| 함수                  | 엔드포인트                           | 설명               |
| --------------------- | ------------------------------------ | ------------------ |
| `searchPlayersByName` | `GET /api/players/search?name=`      | 선수 이름 검색     |
| `fetchPlayerBasic`    | `GET /api/players/{pid}`             | 선수 기본 정보     |
| `fetchHitterStats`    | `GET /api/stats/hitter/{pid}`        | 타자 시즌 스탯     |
| `fetchPitcherStats`   | `GET /api/stats/pitcher/{pid}`       | 투수 시즌 스탯     |
| `fetchHitterRadar`    | `GET /api/stats/radar/hitter/{pid}`  | 타자 레이더 데이터 |
| `fetchPitcherRadar`   | `GET /api/stats/radar/pitcher/{pid}` | 투수 레이더 데이터 |

---

### 🛠️ Utils (`playerUtils.ts`)

| 함수                   | 설명                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| `isPitcher(position)`  | 포지션 문자열로 투수 여부 판별. "투수", "선발", "불펜", "마무리", "pitcher", "P" 모두 커버 |
| `fmtAvg(v)`            | 타율 소수점 3자리 포맷 (null → "-")                                                        |
| `fmtEra(v)`            | ERA 소수점 2자리 포맷                                                                      |
| `fmtWhip(v)`           | WHIP 소수점 2자리 포맷                                                                     |
| `fmtWpct(v)`           | 승률 소수점 3자리 포맷                                                                     |
| `mapHitterRadar(raw)`  | 백엔드 타자 레이더 응답(영어 키) → 한글 키 변환. `style` 필드 제외                         |
| `mapPitcherRadar(raw)` | 백엔드 투수 레이더 응답(영어 키) → 한글 키 변환. `style` 필드 제외                         |

#### 레이더 키 매핑

| 백엔드 (영어) | 프론트 표시 (한글) |
| ------------- | ------------------ |
| `power`       | 파워               |
| `contact`     | 컨택               |
| `extra`       | 장타력             |
| `speed`       | 스피드             |
| `contrib`     | 생산성             |
| `eye`         | 선구안             |
| `strikeout`   | 삼진               |
| `eraControl`  | 구위               |
| `control`     | 제구               |
| `hrControl`   | 장타억제           |
| `stamina`     | 내구성             |
| `hitControl`  | 피안타억제         |

---

### 📊 데이터 흐름 (레이더 차트)

```
백엔드 API 응답 (영어 키)
        ↓
fetchHitterRadar / fetchPitcherRadar
        ↓
PlayerProfilePage (radarData 상태 저장)
        ↓
PlayerHeroBanner
        ↓
extractRadarValues(radarData, isPitcherPlayer)
        ↓
mapHitterRadar / mapPitcherRadar (한글 키 변환)
        ↓
RadarChart (SVG 렌더링)
```

---

### 🎨 스타일 규칙

- **팀 컬러**: `src/constants/teamColors.ts` — KBO 10개 구단 bg/accent 색상
- **존 색상**: `src/constants/stepColors.ts` — 1(파랑/차가움) ~ 5(빨강/뜨거움)
- **타자 포인트 컬러**: `#3B82F6` (파랑)
- **투수 포인트 컬러**: `#F97316` (오렌지)
