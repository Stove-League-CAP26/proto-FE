// src/pages/SignupPage.tsx
import { useState } from "react";
import { signup } from "@/api/authApi";

interface SignupPageProps {
  onSignupSuccess: () => void;
  onGoLogin: () => void;
}

export default function SignupPage({
  onSignupSuccess,
  onGoLogin,
}: SignupPageProps) {
  const [form, setForm] = useState({
    nickname: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.nickname) newErrors.nickname = "닉네임을 입력해주세요";
    if (!form.email) newErrors.email = "이메일을 입력해주세요";
    if (!form.password) newErrors.password = "비밀번호를 입력해주세요";
    if (form.password !== form.passwordConfirm) {
      newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다";
    }
    const pwPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/;
    if (form.password && !pwPattern.test(form.password)) {
      newErrors.password = "비밀번호는 6~16자, 영문과 숫자를 포함해야 합니다";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signup({
        nickname: form.nickname,
        email: form.email,
        password: form.password,
      });
      alert("회원가입이 완료되었습니다!");
      onSignupSuccess();
    } catch (err: any) {
      setErrors(err);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      key: "nickname",
      label: "닉네임",
      type: "text",
      placeholder: "닉네임",
      icon: "👤",
      hint: "",
    },
    {
      key: "email",
      label: "아이디(email)",
      type: "email",
      placeholder: "아이디(email)",
      icon: "📧",
      hint: "",
    },
    {
      key: "password",
      label: "비밀번호",
      type: "password",
      placeholder: "6~16자, 영문·숫자 포함",
      icon: "🔒",
      hint: "6~16자의 하나 이상의 영문, 숫자를 포함해야함",
    },
    {
      key: "passwordConfirm",
      label: "비밀번호 확인",
      type: "password",
      placeholder: "비밀번호 확인",
      icon: "🔒",
      hint: "",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <span className="font-black text-gray-900 text-lg">⚾ 스토브리그</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
          <h2 className="text-xl font-black text-gray-900 mb-6">회원가입</h2>

          {fields.map((f) => (
            <div key={f.key} className="mb-4">
              <div className="flex items-center gap-2 mb-1.5">
                <label className="text-sm font-bold text-gray-600">
                  {f.label}
                </label>
                {f.hint && (
                  <span className="text-xs text-gray-400">{f.hint}</span>
                )}
              </div>
              <div className="relative">
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => set(f.key, e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder={f.placeholder}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">
                  {f.icon}
                </span>
              </div>
              {errors[f.key] && (
                <p className="text-xs text-red-500 mt-1">{errors[f.key]}</p>
              )}
            </div>
          ))}

          {/* 서버 에러 */}
          {errors.error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-xs text-red-500">{errors.error}</p>
            </div>
          )}

          {/* 회원가입 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-black text-white transition-all mt-2"
            style={{ background: loading ? "#f9a8b8" : "#E91E8C" }}
          >
            {loading ? "처리 중..." : "회원가입"}
          </button>

          <div className="mt-4 text-center">
            <button
              onClick={onGoLogin}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              이미 계정이 있으신가요? 로그인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
