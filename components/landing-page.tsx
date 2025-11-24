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
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500 md:h-6 md:w-6" />
            <span className="text-lg font-bold text-slate-900 md:text-xl">AI Memo Lab</span>
          </div>
          <button
            onClick={handleGoogleLogin}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:gap-2 md:px-4 md:py-2 md:text-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500 md:h-4 md:w-4" />
            <span className="hidden sm:inline">구글로 시작하기</span>
            <span className="sm:hidden">시작하기</span>
          </button>
        </header>

        {/* Hero Section */}
        <main className="mt-12 flex flex-col items-center text-center md:mt-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm md:px-4 md:py-2 md:text-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 md:h-4 md:w-4" />
            AI가 자동으로 정리하는 스마트 메모
          </div>

          <h1 className="mt-6 max-w-4xl px-4 text-3xl font-bold leading-tight text-slate-900 md:mt-8 md:text-5xl">
            메모를 작성하면
            <br />
            <span className="text-slate-600">AI가 알아서 정리합니다</span>
          </h1>

          <p className="mt-4 max-w-2xl px-4 text-base text-slate-600 md:mt-6 md:text-lg">
            메모를 입력하는 순간 AI가 자동으로 태그를 생성하고,
            <br className="hidden sm:inline" />
            관계를 시각화하며, 인사이트를 제안합니다.
          </p>

          <button
            onClick={handleGoogleLogin}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl md:mt-10 md:px-8 md:py-4 md:text-base"
          >
            무료로 시작하기
            <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
          </button>

          {/* Feature Preview */}
          <div className="mt-12 grid w-full grid-cols-1 gap-4 md:mt-20 md:grid-cols-3 md:gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 text-left shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md md:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 md:h-12 md:w-12">
                <Wand2 className="h-5 w-5 text-slate-700 md:h-6 md:w-6" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900 md:mt-4 md:text-lg">
                자동 태그 생성
              </h3>
              <p className="mt-1.5 text-sm text-slate-600 md:mt-2">
                메모 내용을 분석해 최적의 태그를 1-3개 자동으로 제안합니다.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 text-left shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md md:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 md:h-12 md:w-12">
                <Network className="h-5 w-5 text-slate-700 md:h-6 md:w-6" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900 md:mt-4 md:text-lg">
                관계 시각화
              </h3>
              <p className="mt-1.5 text-sm text-slate-600 md:mt-2">
                메모 간의 연결고리를 그래프로 보여주어 전체 흐름을 파악합니다.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 text-left shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md md:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 md:h-12 md:w-12">
                <MessageCircle className="h-5 w-5 text-slate-700 md:h-6 md:w-6" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900 md:mt-4 md:text-lg">
                AI 인사이트
              </h3>
              <p className="mt-1.5 text-sm text-slate-600 md:mt-2">
                메모 패턴을 분석해 다음 행동을 추천하고 대화로 확장합니다.
              </p>
            </div>
          </div>

          {/* Social Proof / Stats */}
          <div className="mt-12 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur md:mt-20 md:p-8">
            <div className="grid grid-cols-3 gap-4 text-center md:gap-8">
              <div>
                <div className="text-2xl font-bold text-slate-900 md:text-3xl">자동</div>
                <div className="mt-1 text-xs text-slate-600 md:mt-2 md:text-sm">태그 생성</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 md:text-3xl">실시간</div>
                <div className="mt-1 text-xs text-slate-600 md:mt-2 md:text-sm">시각화</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 md:text-3xl">AI</div>
                <div className="mt-1 text-xs text-slate-600 md:mt-2 md:text-sm">인사이트</div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-500 md:mt-20 md:pt-8 md:text-sm">
          <p>© 2025 AI Memo Lab. Built with Next.js & Supabase.</p>
        </footer>
      </div>
    </div>
  );
}
