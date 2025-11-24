import { NextRequest } from "next/server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, memos, chatHistory } = body;

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400 }
      );
    }

    if (!memos || !Array.isArray(memos)) {
      return new Response(
        JSON.stringify({ error: "Memos array is required" }),
        { status: 400 }
      );
    }

    // Take last 100 memos
    const recentMemos = memos.slice(-100);

    // Prepare memo context
    const memoContext = recentMemos
      .map(
        (memo: any) =>
          `[${new Date(memo.created_at).toLocaleDateString("ko-KR")} ${new Date(memo.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}] ${memo.title}\n태그: ${memo.tags.join(", ")}\n내용: ${memo.content}`
      )
      .join("\n\n");

    // Build messages array with chat history
    const messages: any[] = [
      {
        role: "system",
        content: `당신은 사용자의 메모를 분석하여 유용한 대화를 제공하는 AI 어시스턴트입니다.

사용자의 최근 메모 ${recentMemos.length}개가 제공됩니다. 메모의 제목, 태그, 내용, 작성 시간을 모두 참고하여 답변하세요.

대화할 때:
- 메모의 내용을 기반으로 구체적이고 실용적인 답변을 제공하세요
- 태그를 활용하여 관련 메모들을 연결하세요
- 작성 시간을 고려하여 최근 동향이나 변화를 파악하세요
- 간결하고 친근하게 답변하세요
- 필요하다면 메모의 특정 부분을 인용하세요

메모 데이터:
${memoContext}`,
      },
    ];

    // Add chat history if available
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((chat: any) => {
        messages.push({
          role: chat.role === "user" ? "user" : "assistant",
          content: chat.message,
        });
      });
    }

    // Add current user message
    messages.push({
      role: "user",
      content: message,
    });

    // Create streaming response
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 800,
      stream: true,
    });

    // Create a TransformStream to convert OpenAI stream to response
    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(customStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500 }
    );
  }
}
