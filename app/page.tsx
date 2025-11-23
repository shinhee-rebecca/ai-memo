"use client";

import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { LandingPage } from "@/components/landing-page";
import { MainApp } from "@/components/main-app";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check user session on page load
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_1px_1px,#e5e7eb_1px,transparent_0)] bg-[length:20px_20px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <p className="text-sm text-slate-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return user ? <MainApp user={user} /> : <LandingPage />;
}
