const BASE_URL = "/api";

// pid로 단일 선수 조회
export async function fetchPlayerBasic(pid: number) {
  const res = await fetch(`${BASE_URL}/players/${pid}`);
  if (!res.ok)
    throw new Error(`선수 정보 로드 실패 (pid: ${pid}, status: ${res.status})`);
  return res.json();
}

// 이름으로 선수 검색 (목록 반환)
export async function searchPlayersByName(name: string) {
  const res = await fetch(
    `/api/players/search?name=${encodeURIComponent(name)}`,
  );
  if (!res.ok) throw new Error(`검색 실패 (status: ${res.status})`);
  return res.json();
}

// 타자 시즌 스탯 조회
export async function fetchHitterStats(pid: number) {
  const res = await fetch(`${BASE_URL}/stats/hitter/${pid}`);
  if (!res.ok)
    throw new Error(`타자 스탯 로드 실패 (pid: ${pid}, status: ${res.status})`);
  return res.json();
}

// 투수 시즌 스탯 조회
export async function fetchPitcherStats(pid: number) {
  const res = await fetch(`${BASE_URL}/stats/pitcher/${pid}`);
  if (!res.ok)
    throw new Error(`투수 스탯 로드 실패 (pid: ${pid}, status: ${res.status})`);
  return res.json();
}

// ── 레이더 차트 타입 ──────────────────────────────────────────

// 타자 레이더 응답
// 실제 지표: 파워(HR/AB), 컨택(H/AB), 장타(TB/AB), 스피드((2B+3B*3)/H), 팀기여(RBI/G), 선구안((PA-AB)/PA)
export interface HitterRadar {
  파워: number;
  컨택: number;
  장타: number;
  스피드: number;
  팀기여: number;
  선구안: number;
  style: string; // 슬러거 | 스피드스터 | 클린업 | 교타자 | 올라운더
}

// 투수 레이더 응답
// 실제 지표: 삼진(SO/IP), 실점억제(역수ERA), 제구(역수HBP/IP), 장타억제(역수HR/IP), 체력(IP/G), 안타억제(역수H/IP)
export interface PitcherRadar {
  삼진: number;
  실점억제: number;
  제구: number;
  장타억제: number;
  체력: number;
  안타억제: number;
  style: string; // 파워피처 | 에이스 | 기교파 | 이닝이터 | 마무리형
}

// 타자 레이더 조회
export async function fetchHitterRadar(pid: number): Promise<HitterRadar> {
  const res = await fetch(`${BASE_URL}/stats/radar/hitter/${pid}`);
  if (!res.ok)
    throw new Error(
      `타자 레이더 로드 실패 (pid: ${pid}, status: ${res.status})`,
    );
  return res.json();
}

// 투수 레이더 조회
export async function fetchPitcherRadar(pid: number): Promise<PitcherRadar> {
  const res = await fetch(`${BASE_URL}/stats/radar/pitcher/${pid}`);
  if (!res.ok)
    throw new Error(
      `투수 레이더 로드 실패 (pid: ${pid}, status: ${res.status})`,
    );
  return res.json();
}
