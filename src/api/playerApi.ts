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
