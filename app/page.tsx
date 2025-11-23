"use client";

import { useEffect, useState } from "react";

import {
  ChartPie,
  LogOut,
  MessageCircle,
  Network,
  Search,
  Send,
  Sparkles,
  Wand2,
} from "lucide-react";

import { signInWithGoogle, signOut, getCurrentUser } from "@/lib/auth";

const memoHistory = [
  {
    title: "주말 여행 아이디어",
    excerpt: "도쿄 근교 1박 2일, 교통 + 예산 체크 리스트",
    tags: ["여행", "리서치"],
    time: "방금 전",
  },
  {
    title: "팀 회의 메모",
    excerpt: "프로토타입 피드백 정리, 전환율 추적 계획",
    tags: ["업무", "제품"],
    time: "2시간 전",
  },
  {
    title: "AI 제안 실험",
    excerpt: "메모 패턴 학습시키는 프롬프트 구조 초안",
    tags: ["AI", "아이디어"],
    time: "어제",
  },
];

const tagSuggestions = ["업무", "아이디어", "리서치"];

const insights = [
  {
    title: "다음 할 일",
    body: "회의 메모 기반으로 오늘 처리하면 좋은 3가지 행동을 추천했어요.",
  },
  {
    title: "패턴 스팟",
    body: "최근 2주간 '아이디어' 태그가 가장 많이 사용됐어요.",
  },
  {
    title: "요약 카드",
    body: "방금 저장한 메모를 1줄 요약으로 묶어둘까요?",
  },
];

const chatThread = [
  { role: "ai", message: "어떤 메모를 더 확장할까요? 태그를 추천할 수도 있어요." },
  { role: "user", message: "출시 체크리스트만 빠르게 정리해줘." },
  { role: "ai", message: "기획 ✅, QA 진행 중, 출시일 확정 필요. 태그: 업무, 출시" },
];

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 페이지 로드 시 사용자 세션 확인
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("사용자 정보 가져오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      // signInWithGoogle은 자동으로 리다이렉트됨
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("로그인에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      window.location.reload();
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_1px_1px,#e5e7eb_1px,transparent_0)] bg-[length:20px_20px]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              AI Memo Lab
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              자동으로 정리되는 메모, 한눈에 보는 패턴
            </h1>
            <p className="text-sm text-slate-600">
              작성 → 태그 추천 → 시각화 → AI 제안까지 한 화면에서 확인하세요.
            </p>
          </div>
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    {user.email?.split("@")[0]}님 환영해요
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  구글로 시작하기
                </button>
              )}
            </>
          )}
        </header>

        <div className="grid min-h-[70vh] grid-cols-[320px_1fr_340px] gap-4">
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  메모 작성
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  타임라인 & 입력
                </h2>
              </div>
              <div className="relative w-32">
                <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  placeholder="검색"
                  className="w-full rounded-full border border-slate-200 bg-slate-50 px-8 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              {memoHistory.map((memo) => (
                <article
                  key={memo.title}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition hover:border-slate-200 hover:bg-white"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {memo.title}
                    </h3>
                    <span className="text-[11px] font-medium text-slate-500">
                      {memo.time}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{memo.excerpt}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {memo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-auto space-y-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-700">
                  제안된 태그
                </div>
                <button className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-white">
                  <Wand2 className="h-4 w-4" />
                  자동 생성
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tagSuggestions.map((tag) => (
                  <button
                    key={tag}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300"
                  >
                    #{tag}
                  </button>
                ))}
                <button className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-slate-400 hover:text-slate-700">
                  + 태그 추가
                </button>
              </div>
              <div className="flex items-end gap-2">
                <textarea
                  rows={4}
                  placeholder="메모를 입력하면 자동으로 태그를 제안해드려요."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                />
                <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  시각화
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  관계형 / 그래프 보기
                </h2>
                <p className="text-sm text-slate-600">
                  선택에 따라 메모를 시각화해요. 노드에 마우스를 올려 상세를 확인하세요.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 p-1 shadow-inner">
                <button className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition">
                  <Network className="h-4 w-4" />
                  관계형
                </button>
                <button className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900">
                  <ChartPie className="h-4 w-4" />
                  그래프
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-[minmax(0,1fr)_260px] gap-6">
              <div className="relative h-[380px] rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white shadow-inner">
                <svg
                  viewBox="0 0 400 320"
                  className="absolute inset-0 m-auto h-full w-full text-slate-400"
                >
                  <g
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <line x1="120" y1="170" x2="190" y2="120" />
                    <line x1="190" y1="120" x2="260" y2="170" />
                    <line x1="190" y1="120" x2="200" y2="60" />
                    <line x1="120" y1="170" x2="120" y2="240" />
                    <line x1="260" y1="170" x2="300" y2="230" />
                    <line x1="200" y1="60" x2="260" y2="90" />
                  </g>
                  <g fill="white" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="190" cy="120" r="16" className="fill-white" />
                    <circle cx="200" cy="60" r="12" className="fill-white" />
                    <circle cx="260" cy="90" r="12" className="fill-white" />
                    <circle cx="120" cy="170" r="14" className="fill-white" />
                    <circle cx="260" cy="170" r="14" className="fill-white" />
                    <circle cx="300" cy="230" r="12" className="fill-white" />
                    <circle cx="120" cy="240" r="12" className="fill-white" />
                  </g>
                </svg>
                <div className="absolute left-6 top-6 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow">
                  태그 기반 노드
                </div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                  노드를 선택하면 메모가 오른쪽에 나타납니다.
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-800">
                    태그 빈도
                  </div>
                  <div className="text-xs font-medium text-slate-500">
                    최근 30일
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="h-40 w-40 rounded-full bg-[conic-gradient(#0f172a_0deg_120deg,#1e293b_120deg_210deg,#94a3b8_210deg_360deg)] shadow-inner" />
                </div>
                <div className="space-y-2">
                  {[
                    { label: "아이디어", value: "45%", color: "bg-slate-900" },
                    { label: "업무", value: "25%", color: "bg-slate-700" },
                    { label: "리서치", value: "30%", color: "bg-slate-400" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                        />
                        {item.label}
                      </div>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  AI 제안
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  바로 실행 가능한 인사이트
                </h2>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                베타
              </div>
            </div>

            <div className="space-y-3">
              {insights.map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 px-4 py-3 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-slate-200"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    {card.title}
                  </div>
                  <p className="text-sm text-slate-600">{card.body}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-1 flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-800">
                  AI 대화
                </div>
                <MessageCircle className="h-4 w-4 text-slate-500" />
              </div>
              <div className="flex flex-1 flex-col gap-2 overflow-hidden">
                <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                  {chatThread.map((chat, index) => (
                    <div
                      key={index}
                      className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        chat.role === "ai"
                          ? "self-start bg-white text-slate-800 shadow-sm"
                          : "self-end bg-slate-900 text-white"
                      }`}
                    >
                      {chat.message}
                    </div>
                  ))}
                </div>
                <div className="flex items-end gap-2">
                  <input
                    placeholder="작성된 메모를 기반으로 AI와 대화하세요."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                  />
                  <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
