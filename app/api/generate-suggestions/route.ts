import { NextRequest, NextResponse } from "next/server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memos } = body;

    if (!memos || !Array.isArray(memos)) {
      return NextResponse.json(
        { error: "Memos array is required" },
        { status: 400 }
      );
    }

    if (memos.length === 0) {
      return NextResponse.json({
        suggestions: [
          {
            title: "시작하기",
            body: "첫 메모를 작성하면 AI가 패턴을 분석하고 제안을 드릴게요.",
          },
        ],
      });
    }

    // Take last 100 memos
    const recentMemos = memos.slice(-100);

    // Prepare memo context
    const memoContext = recentMemos
      .map(
        (memo: any) =>
          `[${new Date(memo.created_at).toLocaleDateString("ko-KR")}] ${memo.title}\n태그: ${memo.tags.join(", ")}\n내용: ${memo.content}`
      )
      .join("\n\n");

    const response = await Promise.race([
      openai.chat.completions.create(
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `당신은 사용자의 메모 패턴을 분석하여 실용적인 인사이트를 제공하는 AI입니다.

최근 메모들을 분석하여 다음과 같은 제안을 1-3개 생성하세요:
1. 패턴 발견: 자주 사용되는 태그나 주제 패턴
2. 행동 제안: 메모를 기반으로 추천할 수 있는 다음 행동
3. 빈틈 발견: 최근 작성되지 않은 주제나 사라진 패턴
4. 요약 제안: 여러 메모를 묶어 요약하거나 정리할 제안

각 제안은 다음 JSON 형식으로 작성하세요:
{
  "suggestions": [
    {
      "title": "제목 (짧게, 10자 이내)",
      "body": "구체적인 설명 (한두 문장)"
    }
  ]
}

제안은 실용적이고 구체적이어야 하며, 사용자가 바로 실행할 수 있는 내용이어야 합니다.`,
            },
            {
              role: "user",
              content: `다음은 사용자의 최근 메모 ${recentMemos.length}개입니다:\n\n${memoContext}`,
            },
          ],
          temperature: 0.8,
          max_tokens: 500,
          response_format: { type: "json_object" },
        },
        {
          timeout: 25000,
        }
      ),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 30000)
      ),
    ]);

    const content = (response as any).choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    const parsed = JSON.parse(content);

    return NextResponse.json({
      suggestions: parsed.suggestions || [],
    });
  } catch (error) {
    console.error("Failed to generate suggestions:", error);

    // Fallback suggestions
    return NextResponse.json({
      suggestions: [
        {
          title: "계속 작성하기",
          body: "메모를 더 작성하면 더 정확한 패턴 분석이 가능해요.",
        },
      ],
    });
  }
}
