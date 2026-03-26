const BASE_URL = "/api";

// pid로 단일 선수 조회
export async function fetchPlayerBasic(pid: number) {
  const res = await fetch(`${BASE_URL}/players/${pid}`);
  if (!res.ok) {
    throw new Error(`선수 정보 로드 실패 (pid: ${pid}, status: ${res.status})`);
  }
  return res.json();
}

// 이름으로 선수 검색 (목록 반환)
export async function searchPlayersByName(name: string) {
  const res = await fetch(
    `/api/players/search?name=${encodeURIComponent(name)}`,
  );
  if (!res.ok) {
    throw new Error(`검색 실패 (status: ${res.status})`);
  }
  return res.json();
}

// 타자 시즌 스탯 조회
// 응답: [{ pid, season, team, g, pa, ab, r, h, b2, b3, hr, rbi, tb, sac, sf, avg, hitterRank }]
export async function fetchHitterStats(pid: number) {
  const res = await fetch(`${BASE_URL}/stats/hitter/${pid}`);
  if (!res.ok) {
    throw new Error(`타자 스탯 로드 실패 (pid: ${pid}, status: ${res.status})`);
  }
  return res.json();
}

// 투수 시즌 스탯 조회
// 응답: [{ pid, season, team, g, w, l, sv, hld, ip, h, hr, hbp, r, er, so, era, whip, wpct, pitcherRank }]
export async function fetchPitcherStats(pid: number) {
  const res = await fetch(`${BASE_URL}/stats/pitcher/${pid}`);
  if (!res.ok) {
    throw new Error(`투수 스탯 로드 실패 (pid: ${pid}, status: ${res.status})`);
  }
  return res.json();
}
