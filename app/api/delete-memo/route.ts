import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function DELETE(request: NextRequest) {
  try {
    const { memoId } = await request.json();

    if (!memoId) {
      return NextResponse.json(
        { error: "메모 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Delete the memo
    const { error } = await supabase.from("memos").delete().eq("id", memoId);

    if (error) {
      console.error("Failed to delete memo:", error);
      return NextResponse.json(
        { error: "메모 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting memo:", error);
    return NextResponse.json(
      { error: "메모 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
