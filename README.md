# 스토브리그 FE 프로젝트 파일 구조

## 전체 구조

```
src/
├── api/
│   └── playerApi.ts
├── constants/
│   ├── teamColors.ts
│   └── stepColors.ts
├── mock/
│   ├── bestData.ts
│   ├── statsData.ts
│   ├── teamData.ts
│   └── compareData.ts
├── components/
│   ├── common/
│   │   ├── PlayerAvatar.tsx
│   │   ├── RadarChart.tsx
│   │   └── HotColdGrid.tsx
│   ├── best/
│   │   ├── WARHeroCard.tsx
│   │   ├── WARRankList.tsx
│   │   └── CategoryCard.tsx
│   ├── profile/
│   │   ├── ProfileTab.tsx
│   │   ├── HotColdTab.tsx
│   │   └── StatsTab.tsx
│   ├── team/
│   │   ├── HexRadar.tsx
│   │   ├── DepthFieldChart.tsx
│   │   ├── TeamIntroTab.tsx
│   │   ├── TeamDepthTab.tsx
│   │   ├── TeamPlayersTab.tsx
│   │   ├── TeamCheersTab.tsx
│   │   └── TeamGoodsTab.tsx
│   └── compare/
│       ├── MiniZoneGrid.tsx
│       ├── OverlayZoneGrid.tsx
│       ├── ZoneCompareSection.tsx
│       ├── StatCompareTable.tsx
│       ├── AIAnalysisPanel.tsx
│       ├── ComparePlayerCard.tsx
│       ├── PlayerSelectModal.tsx
│       └── CompareModeTab.tsx
├── pages/
│   ├── PlayerProfilePage.tsx
│   ├── BestPlayerPage.tsx
│   ├── TeamPage.tsx
│   └── ComparePage.tsx
├── App.tsx
├── main.tsx
└── index.css
```

---

## 폴더별 역할

### `api/`
| 파일 | 설명 |
|------|------|
| `playerApi.ts` | 백엔드 API 호출 함수 모음. pid로 선수 조회, 이름으로 선수 검색 |

### `constants/`
| 파일 | 설명 |
|------|------|
| `teamColors.ts` | KBO 10개 구단 메인/포인트 색상 상수 |
| `stepColors.ts` | 핫/콜드존 단계별(1~5) 색상 상수 |

### `mock/`
| 파일 | 설명 |
|------|------|
| `bestData.ts` | BEST 플레이어 페이지용 타자/투수 순위 목업 데이터 |
| `statsData.ts` | 선수 시즌 타격 기록 및 핫/콜드존 목업 데이터 |
| `teamData.ts` | KBO 10개 구단 정보 및 팀 상세 목업 데이터 |
| `compareData.ts` | 선수 비교 페이지용 선수 목업 데이터 |

### `components/common/`
| 파일 | 설명 |
|------|------|
| `PlayerAvatar.tsx` | 선수 사진 아바타. KBO 이미지 서버에서 연도별 순차 시도, 실패 시 ⚾ 표시 |
| `RadarChart.tsx` | 선수 능력치 레이더 차트 (SVG 기반, 0~100 스케일) |
| `HotColdGrid.tsx` | 타자 구역별 타율/삼진 비율을 outer 4칸 + inner 3×3 그리드로 시각화 |

### `components/best/`
| 파일 | 설명 |
|------|------|
| `WARHeroCard.tsx` | WAR 1위 선수를 팀 컬러 그라디언트 배경으로 크게 강조하는 히어로 카드 |
| `WARRankList.tsx` | WAR 전체 순위를 메달 이모지와 함께 리스트로 표시 |
| `CategoryCard.tsx` | 부문별(타율/홈런/타점 등) 순위를 1위 강조 + 2~4위 리스트 카드로 표시 |

### `components/profile/`
| 파일 | 설명 |
|------|------|
| `ProfileTab.tsx` | 선수 카드(사진/등번호/수상), 기본정보, 커리어 히스토리, 스탯 레이더 3열 레이아웃 |
| `HotColdTab.tsx` | 타율 기준 핫/콜드존, 삼진 분포도, 타구 방향 분포(LF/CF/RF) 3열 레이아웃 |
| `StatsTab.tsx` | 주요 지표 요약 카드, 시즌별 타격 기록 테이블, OPS 연도별 추이 바 차트 |

### `components/team/`
| 파일 | 설명 |
|------|------|
| `HexRadar.tsx` | 팀 능력치를 어두운 배경에 골드/레드 그라디언트로 표현하는 육각형 레이더 차트 |
| `DepthFieldChart.tsx` | 야구장 필드 위에 포지션별 선수와 WAR을 오버레이로 표시하는 뎁스 차트 |
| `TeamIntroTab.tsx` | 팀 기본정보, 시즌 성적, 구단 히스토리, 팀 능력치 레이더 |
| `TeamDepthTab.tsx` | 주전/엔트리 필드 차트와 포지션별 선수 명단 테이블 |
| `TeamPlayersTab.tsx` | 포지션별 선수 카드 그리드, 클릭 시 선수 개인 페이지로 이동 |
| `TeamCheersTab.tsx` | 응원가 플레이어 UI와 응원가 목록 (목업, 실제 재생 미구현) |
| `TeamGoodsTab.tsx` | 마스코트, 엠블럼 변천사, 유니폼, 공식 굿즈 섹션 |

### `components/compare/`
| 파일 | 설명 |
|------|------|
| `MiniZoneGrid.tsx` | 핫/콜드존을 작은 사이즈(130×130)로 표시, ZoneCompareSection에서 사용 |
| `OverlayZoneGrid.tsx` | 타자 핫존 × 투수 투구분포 오버레이, 호버 시 공략/위험/회피/중립 전략 표시 |
| `ZoneCompareSection.tsx` | 비교 모드에 따라 핫콜드존 나란히 또는 투타 오버레이 매치업 분석 렌더링 |
| `StatCompareTable.tsx` | 두 선수 스탯 항목별 좌우 비교 테이블 + 상단 종합 벤치마크 바 |
| `AIAnalysisPanel.tsx` | 규칙 기반 분석 텍스트를 순차적으로 보여주는 AI 분석 패널 |
| `ComparePlayerCard.tsx` | 비교 선수 A/B 카드, 사진/이름/팀/포지션 표시 및 변경 버튼 |
| `PlayerSelectModal.tsx` | 비교할 선수를 이름/팀/포지션으로 검색·선택하는 모달 |
| `CompareModeTab.tsx` | 모드별 컨텐츠 렌더링 (미선택 안내 / 모드 불일치 경고 / 비교 컨텐츠) |

### `pages/`
| 파일 | 설명 |
|------|------|
| `PlayerProfilePage.tsx` | 선수 이름 검색 → API 호출 → 프로필/핫콜드존/스탯 탭 표시 |
| `BestPlayerPage.tsx` | 타자/투수 토글로 WAR 히어로 카드 + 부문별 순위 카드 그리드 표시 |
| `TeamPage.tsx` | 10개 구단 카드 그리드 → 팀 선택 시 팀 상세 페이지(5개 탭)로 전환 |
| `ComparePage.tsx` | 타자vs투수/투수vs투수/타자vs타자 모드로 두 선수 비교 |

### 루트
| 파일 | 설명 |
|------|------|
| `App.tsx` | 네비게이션 바 + 페이지 라우팅만 담당 |
| `main.tsx` | React 앱 진입점 |
| `index.css` | Tailwind CSS 전역 스타일 (`@import "tailwindcss"`) |