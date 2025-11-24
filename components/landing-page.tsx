"use client";

import { Sparkles, Wand2, Network, MessageCircle, ArrowRight } from "lucide-react";

import { signInWithGoogle } from "@/lib/auth";

export function LandingPage() {
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("로그인에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_1px_1px,#e5e7eb_1px,transparent_0)] bg-[length:20px_20px]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <span className="text-xl font-bold text-slate-900">AI Memo Lab</span>
          </div>
          <button
            onClick={handleGoogleLogin}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            구글로 시작하기
          </button>
        </header>

        {/* Hero Section */}
        <main className="mt-20 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            <Sparkles className="h-4 w-4 text-amber-500" />
            AI가 자동으로 정리하는 스마트 메모
          </div>

          <h1 className="mt-8 max-w-4xl text-5xl font-bold leading-tight text-slate-900">
            메모를 작성하면
            <br />
            <span className="text-slate-600">AI가 알아서 정리합니다</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-600">
            메모를 입력하는 순간 AI가 자동으로 태그를 생성하고,
            <br />
            관계를 시각화하며, 인사이트를 제안합니다.
          </p>

          <button
            onClick={handleGoogleLogin}
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            무료로 시작하기
            <ArrowRight className="h-5 w-5" />
          </button>

          {/* Feature Preview */}
          <div className="mt-20 grid w-full grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 text-left shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <Wand2 className="h-6 w-6 text-slate-700" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                자동 태그 생성
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                메모 내용을 분석해 최적의 태그를 1-3개 자동으로 제안합니다.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 text-left shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <Network className="h-6 w-6 text-slate-700" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                관계 시각화
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                메모 간의 연결고리를 그래프로 보여주어 전체 흐름을 파악합니다.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 text-left shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <MessageCircle className="h-6 w-6 text-slate-700" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                AI 인사이트
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                메모 패턴을 분석해 다음 행동을 추천하고 대화로 확장합니다.
              </p>
            </div>
          </div>

          {/* Social Proof / Stats */}
          <div className="mt-20 rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-slate-900">자동</div>
                <div className="mt-2 text-sm text-slate-600">태그 생성</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">실시간</div>
                <div className="mt-2 text-sm text-slate-600">시각화</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">AI</div>
                <div className="mt-2 text-sm text-slate-600">인사이트</div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-20 border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
          <p>© 2025 AI Memo Lab. Built with Next.js & Supabase.</p>
        </footer>
      </div>
    </div>
  );
}
