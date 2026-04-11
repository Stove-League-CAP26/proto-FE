// src/api/authApi.ts
const BASE_URL = "/api/auth";

export interface SignupRequest {
  nickname: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
}

export async function signup(data: SignupRequest): Promise<void> {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw error;
  }
}

export async function login(data: LoginRequest): Promise<TokenResponse> {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    try {
      const error = await res.json();
      throw error;
    } catch {
      throw { error: "로그인에 실패했습니다" };
    }
  }
  return res.json();
}
