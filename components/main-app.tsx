"use client";

import { useEffect, useState } from "react";

import {
  ChartPie,
  Loader2,
  LogOut,
  MessageCircle,
  Network,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";

import { signOut } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import {
  createMemo,
  getMemos,
  searchMemos as searchMemosAPI,
  type Memo,
} from "@/lib/memo";
import { generateTags, isModelLoaded } from "@/lib/ai/tag-generator";
import { generateTitle } from "@/lib/ai/title-generator";
import { RelationshipView } from "@/components/relationship-view";
import { ChartView } from "@/components/chart-view";

interface Suggestion {
  title: string;
  body: string;
}

interface ChatMessage {
  role: "user" | "ai";
  message: string;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "방금 전";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  return date.toLocaleDateString("ko-KR");
}

interface MainAppProps {
  user: any;
}

export function MainApp({ user }: MainAppProps) {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Memo input states
  const [memoTitle, setMemoTitle] = useState("");
  const [memoContent, setMemoContent] = useState("");
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Visualization toggle state
  const [viewMode, setViewMode] = useState<"relationship" | "chart">(
    "relationship"
  );

  // AI Suggestions state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");

  useEffect(() => {
    if (user?.email) {
      loadMemos(user.email);
    }
  }, [user]);

  const loadMemos = async (userEmail: string) => {
    try {
      const supabase = createClient();
      const fetchedMemos = await getMemos(supabase, userEmail);
      setMemos(fetchedMemos);
    } catch (error) {
      console.error("Failed to load memos:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleGenerateTags = async () => {
    if (!memoContent.trim() || !isModelLoaded()) {
      alert("메모 내용을 입력하고 AI 모델이 로드될 때까지 기다려주세요.");
      return;
    }

    setIsGeneratingTags(true);
    try {
      const tags = await generateTags(memoContent);
      setSuggestedTags(tags);
      // Auto-select first tag if no tags are selected
      if (selectedTags.length === 0 && tags.length > 0) {
        setSelectedTags([tags[0]]);
      }
    } catch (error) {
      console.error("Failed to generate tags:", error);
      alert("태그 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      alert("최대 3개의 태그만 선택할 수 있습니다.");
    }
  };

  const handleAddCustomTag = () => {
    if (!customTag.trim()) return;

    if (selectedTags.length >= 3) {
      alert("태그는 최대 3개까지만 추가할 수 있습니다.");
      return;
    }

    if (selectedTags.includes(customTag.trim())) {
      alert("이미 추가된 태그입니다.");
      return;
    }

    setSelectedTags([...selectedTags, customTag.trim()]);
    setCustomTag("");
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleSaveMemo = async () => {
    if (!user?.email) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!memoContent.trim()) {
      alert("메모 내용을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      // Generate title if not provided
      let finalTitle = memoTitle.trim();
      if (!finalTitle) {
        finalTitle = await generateTitle(memoContent);
      }

      // If no tags selected, use first suggested tag or generate new tags
      let finalTags = [...selectedTags];
      if (finalTags.length === 0) {
        if (suggestedTags.length > 0) {
          finalTags = [suggestedTags[0]];
        } else {
          const generatedTags = await generateTags(memoContent);
          finalTags = generatedTags.length > 0 ? [generatedTags[0]] : ["메모"];
        }
      }

      const supabase = createClient();
      await createMemo(supabase, {
        title: finalTitle,
        content: memoContent,
        tags: finalTags,
        user_email: user.email,
      });

      // Reset form
      setMemoTitle("");
      setMemoContent("");
      setSuggestedTags([]);
      setSelectedTags([]);
      setCustomTag("");

      // Reload memos
      await loadMemos(user.email);

      // Generate new AI suggestions after saving memo
      handleGenerateSuggestions();

      alert("메모가 저장되었습니다!");
    } catch (error) {
      console.error("Failed to save memo:", error);
      alert("메모 저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = async () => {
    if (!user?.email || !searchQuery.trim()) {
      return;
    }

    setIsSearching(true);
    try {
      const supabase = createClient();
      const results = await searchMemosAPI(supabase, searchQuery, user.email);
      setMemos(results);
    } catch (error) {
      console.error("Failed to search memos:", error);
      alert("검색에 실패했습니다.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = async () => {
    setSearchQuery("");
    if (user?.email) {
      await loadMemos(user.email);
    }
  };

  const handleGenerateSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch("/api/generate-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memos }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate suggestions");
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
      setSuggestions([
        {
          title: "오류 발생",
          body: "제안 생성에 실패했습니다. 다시 시도해주세요.",
        },
      ]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || isSendingChat) {
      return;
    }

    const userMessage = chatInput.trim();
    setChatInput("");

    // Add user message to chat history
    const newChatHistory: ChatMessage[] = [
      ...chatHistory,
      { role: "user", message: userMessage },
    ];
    setChatHistory(newChatHistory);

    setIsSendingChat(true);
    setStreamingMessage("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          memos,
          chatHistory,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send chat message");
      }

      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let fullMessage = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value);
        fullMessage += chunk;
        setStreamingMessage(fullMessage);
      }

      // Add AI message to chat history
      setChatHistory([
        ...newChatHistory,
        { role: "ai", message: fullMessage },
      ]);
      setStreamingMessage("");
    } catch (error) {
      console.error("Failed to send chat:", error);
      // Add error message
      setChatHistory([
        ...newChatHistory,
        {
          role: "ai",
          message: "죄송합니다. 메시지 전송에 실패했습니다. 다시 시도해주세요.",
        },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_1px_1px,#e5e7eb_1px,transparent_0)] bg-[length:20px_20px] py-8">
      <div className="mx-auto flex h-[1000px] flex-col gap-6 px-6">
        <header className="flex flex-shrink-0 flex-wrap items-start justify-between gap-4">
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
        </header>

        <div className="grid flex-1 grid-cols-[1fr_2fr_1fr] gap-4 overflow-hidden">
          {/* Left Section - Memo Input */}
          <section className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  className="w-full rounded-full border border-slate-200 bg-slate-50 px-8 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Memo Timeline */}
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : memos.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-center text-sm text-slate-500">
                  아직 메모가 없습니다. 첫 메모를 작성해보세요!
                </div>
              ) : (
                memos.map((memo) => (
                  <article
                    key={memo.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition hover:border-slate-200 hover:bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {memo.title}
                      </h3>
                      <span className="text-[11px] font-medium text-slate-500">
                        {formatTimeAgo(memo.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {memo.content}
                    </p>
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
                ))
              )}
            </div>

            {/* Memo Input Form */}
            <div className="flex-shrink-0 space-y-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-700">
                  새 메모 작성
                </div>
              </div>

              {/* Title Input */}
              <input
                type="text"
                placeholder="제목 (선택사항, 비워두면 자동 생성)"
                value={memoTitle}
                onChange={(e) => setMemoTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
              />

              {/* Content Input */}
              <textarea
                rows={4}
                placeholder="메모를 입력하면 자동으로 태그를 제안해드려요."
                value={memoContent}
                onChange={(e) => setMemoContent(e.target.value)}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
              />

              {/* Tag Generation Button */}
              <button
                onClick={handleGenerateTags}
                disabled={!memoContent.trim() || isGeneratingTags}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-800 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700 disabled:bg-slate-300"
              >
                {isGeneratingTags ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    태그 생성 중...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    AI 태그 생성
                  </>
                )}
              </button>

              {/* Suggested Tags */}
              {suggestedTags.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-700">
                    제안된 태그 (최대 3개 선택)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          selectedTags.includes(tag)
                            ? "border-slate-800 bg-slate-800 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-slate-300"
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-700">
                    선택된 태그
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-800 px-3 py-1 text-xs font-semibold text-white"
                      >
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-slate-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Tag Input */}
              {selectedTags.length < 3 && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="커스텀 태그 추가"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddCustomTag();
                      }
                    }}
                    className="flex-1 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 outline-none transition focus:border-slate-400"
                  />
                  <button
                    onClick={handleAddCustomTag}
                    disabled={!customTag.trim()}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    추가
                  </button>
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSaveMemo}
                disabled={!memoContent.trim() || isSaving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg disabled:bg-slate-300"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    메모 저장
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Center Section - Visualization */}
          <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {viewMode === "relationship" ? "Relational" : "Graph"}
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  {viewMode === "relationship"
                    ? "관계형 보기"
                    : "그래프 보기"}
                </h2>
                <p className="text-sm text-slate-600">
                  {viewMode === "relationship"
                    ? "관계에 따라 메모를 시각화해요. 노드에 마우스를 올려 상세를 확인하세요."
                    : "태그의 빈도에 따라 메모를 시각화해요. 그래프에 마우스를 올려 상세를 확인하세요."}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 p-1 shadow-inner">
                <button
                  onClick={() => setViewMode("relationship")}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    viewMode === "relationship"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Network className="h-4 w-4" />
                  관계형
                </button>
                <button
                  onClick={() => setViewMode("chart")}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    viewMode === "chart"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ChartPie className="h-4 w-4" />
                  그래프
                </button>
              </div>
            </div>

            <div className="mt-6 h-[480px]">
              {viewMode === "relationship" ? (
                <RelationshipView memos={memos} />
              ) : (
                <ChartView memos={memos} />
              )}
            </div>
          </section>

          {/* Right Section - AI Insights */}
          <section className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  AI 제안
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  바로 실행 가능한 인사이트
                </h2>
              </div>
              <button
                onClick={handleGenerateSuggestions}
                disabled={isLoadingSuggestions || memos.length === 0}
                className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <RefreshCw
                  className={`h-3 w-3 ${isLoadingSuggestions ? "animate-spin" : ""}`}
                />
                {isLoadingSuggestions ? "생성 중" : "새로고침"}
              </button>
            </div>

            <div className="flex-shrink-0 space-y-3">
              {isLoadingSuggestions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : suggestions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-center text-sm text-slate-500">
                  새로고침 버튼을 눌러 AI 제안을 받아보세요!
                </div>
              ) : (
                suggestions.map((card, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 px-4 py-3 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-slate-200"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      {card.title}
                    </div>
                    <p className="text-sm text-slate-600">{card.body}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-800">
                  AI 대화
                </div>
                <MessageCircle className="h-4 w-4 text-slate-500" />
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                  {chatHistory.length === 0 && !streamingMessage ? (
                    <div className="flex h-full items-center justify-center text-center text-sm text-slate-400">
                      메모를 기반으로 AI와 대화해보세요
                    </div>
                  ) : (
                    <>
                      {chatHistory.map((chat, index) => (
                        <div
                          key={index}
                          className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                            chat.role === "ai"
                              ? "self-start bg-white text-slate-800 shadow-sm"
                              : "ml-auto bg-slate-900 text-white"
                          }`}
                        >
                          {chat.message}
                        </div>
                      ))}
                      {streamingMessage && (
                        <div className="max-w-[90%] self-start rounded-2xl bg-white px-3 py-2 text-sm leading-relaxed text-slate-800 shadow-sm">
                          {streamingMessage}
                        </div>
                      )}
                      {isSendingChat && !streamingMessage && (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          AI가 생각하는 중...
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex flex-shrink-0 items-end gap-2">
                  <input
                    placeholder="작성된 메모를 기반으로 AI와 대화하세요."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChat();
                      }
                    }}
                    disabled={isSendingChat || memos.length === 0}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] disabled:bg-slate-50 disabled:text-slate-400"
                  />
                  <button
                    onClick={handleSendChat}
                    disabled={
                      !chatInput.trim() || isSendingChat || memos.length === 0
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg disabled:bg-slate-300"
                  >
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
