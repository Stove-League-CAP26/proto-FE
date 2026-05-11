// src/pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/api/authApi";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setErrors({});
    setLoading(true);
    try {
      const res = await login({ email, password });
      localStorage.setItem("accessToken", res.accessToken);
      navigate("/");
    } catch (err: any) {
      setErrors(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <h2 className="text-xl font-black text-gray-900 mb-6">로그인</h2>

        <div className="mb-4">
          <label className="text-sm font-bold text-gray-600 block mb-1.5">
            아이디(email)
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="아이디(email)"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">
              📧
            </span>
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="text-sm font-bold text-gray-600 block mb-1.5">
            비밀번호
          </label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="비밀번호"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">
              🔒
            </span>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password}</p>
          )}
        </div>

        {errors.error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-xs text-red-500">{errors.error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-black text-white transition-all mt-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>

        <div className="flex items-center justify-between mt-5 text-xs text-gray-400">
          <button
            onClick={() => navigate("/signup")}
            className="hover:text-gray-600 transition-colors"
          >
            회원가입
          </button>
          <span>·</span>
          <button className="hover:text-gray-600 transition-colors">
            아이디찾기
          </button>
          <span>·</span>
          <button className="hover:text-gray-600 transition-colors">
            비밀번호찾기
          </button>
        </div>
      </div>
    </div>
  );
}
