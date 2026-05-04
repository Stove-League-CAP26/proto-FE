// src/pages/AiTestPage.tsx
import { useState } from "react";

type Provider = "gemini" | "openai" | "anthropic";

interface ResultItem {
  provider: Provider;
  response: string;
  success: boolean;
  timestamp: string;
}

const PROVIDER_LABELS: Record<
  Provider,
  { label: string; color: string; active: string }
> = {
  gemini: {
    label: "🔵 Gemini",
    color: "bg-blue-100 text-blue-600",
    active: "bg-blue-500 text-white",
  },
  openai: {
    label: "🟢 OpenAI",
    color: "bg-green-100 text-green-600",
    active: "bg-green-500 text-white",
  },
  anthropic: {
    label: "🟠 Anthropic",
    color: "bg-orange-100 text-orange-600",
    active: "bg-orange-500 text-white",
  },
};

export default function AiTestPage() {
  const [prompt, setPrompt] = useState("");
  const [providers, setProviders] = useState<Provider[]>(["gemini"]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleProvider = (p: Provider) => {
    setProviders((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  };

  const handleSubmit = async () => {
    if (!prompt.trim() || providers.length === 0 || loading) return;

    setLoading(true);
    setResults([]);

    // 선택된 AI 전부 동시 요청
    const requests = providers.map((provider) =>
      fetch("/api/ai-test/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, provider }),
      })
        .then((res) => res.json())
        .then((data) => ({
          provider,
          response: data.response ?? data.error ?? "알 수 없는 오류",
          success: data.status === "success",
          timestamp: new Date().toLocaleTimeString("ko-KR"),
        }))
        .catch(() => ({
          provider,
          response: "네트워크 오류 — 서버 연결을 확인해주세요.",
          success: false,
          timestamp: new Date().toLocaleTimeString("ko-KR"),
        })),
    );

    const responses = await Promise.all(requests);
    setResults(responses);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter 또는 Cmd+Enter로 전송
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">🤖 AI 테스트</h1>
        <p className="text-sm text-gray-400 mt-1">
          AI 모델에 직접 프롬프트를 전송하고 결과를 비교해보세요.
        </p>
      </div>

      {/* AI 선택 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <p className="text-sm font-bold text-gray-600">
          AI 선택{" "}
          <span className="text-gray-400 font-normal">(복수 선택 가능)</span>
        </p>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(PROVIDER_LABELS) as Provider[]).map((p) => {
            const isSelected = providers.includes(p);
            return (
              <button
                key={p}
                onClick={() => toggleProvider(p)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isSelected
                    ? PROVIDER_LABELS[p].active
                    : PROVIDER_LABELS[p].color + " hover:opacity-80"
                }`}
              >
                {PROVIDER_LABELS[p].label}
              </button>
            );
          })}
        </div>
        {providers.length === 0 && (
          <p className="text-xs text-red-400">AI를 한 개 이상 선택해주세요.</p>
        )}
      </div>

      {/* 프롬프트 입력 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <p className="text-sm font-bold text-gray-600">프롬프트 입력</p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="AI에게 보낼 프롬프트를 입력하세요...&#10;(Ctrl+Enter 로 전송)"
          className="w-full h-40 border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 leading-relaxed"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || providers.length === 0 || !prompt.trim()}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
        >
          {loading
            ? `⏳ ${providers.length}개 AI에 요청 중...`
            : `전송 (${providers.length}개 AI)`}
        </button>
      </div>

      {/* 결과 출력 */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-gray-400 text-sm animate-pulse">
            AI 응답을 기다리는 중...
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-bold text-gray-600">
            결과{" "}
            <span className="text-gray-400 font-normal">
              ({results.filter((r) => r.success).length}/{results.length} 성공)
            </span>
          </p>
          {results.map((r) => (
            <div
              key={r.provider}
              className={`rounded-2xl border p-5 space-y-2 ${
                r.success
                  ? "border-gray-100 bg-white"
                  : "border-red-100 bg-red-50"
              }`}
            >
              {/* 헤더 */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    r.success
                      ? PROVIDER_LABELS[r.provider].color
                      : "bg-red-100 text-red-500"
                  }`}
                >
                  {PROVIDER_LABELS[r.provider].label}
                  {!r.success && " — 실패"}
                </span>
                <span className="text-xs text-gray-400">{r.timestamp}</span>
              </div>

              {/* 응답 내용 */}
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {r.response}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
