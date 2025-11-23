import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(new URL("/?error=auth_failed", requestUrl.origin));
    }
  }

  // 로그인 성공 후 홈으로 리다이렉트
  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
