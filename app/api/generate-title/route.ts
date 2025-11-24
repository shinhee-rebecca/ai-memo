import { NextRequest, NextResponse } from "next/server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Fallback title generation (when API fails or content is too short)
 */
function generateFallbackTitle(content: string): string {
  const cleaned = content.trim();

  if (cleaned.length <= 30) {
    return cleaned;
  }

  const sentences = cleaned.split(/[.\n!?]/);
  const firstSentence = sentences[0].trim();

  if (firstSentence.length > 0 && firstSentence.length <= 50) {
    return firstSentence;
  }

  if (firstSentence.length > 50) {
    return firstSentence.substring(0, 30) + "...";
  }

  return cleaned.substring(0, 30) + (cleaned.length > 30 ? "..." : "");
}

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const cleaned = content.trim();

    // If content is too short, use fallback
    if (cleaned.length < 10) {
      return NextResponse.json({ title: generateFallbackTitle(content) });
    }

    // Call OpenAI API to generate title
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "당신은 메모의 내용을 분석하여 간결하고 명확한 제목을 생성하는 AI입니다. 제목은 30자 이내로 작성하며, 메모의 핵심 내용을 담아야 합니다. 존댓말을 사용하지 않고 자연스러운 명사형이나 동사원형으로 작성하세요.",
        },
        {
          role: "user",
          content: `다음 메모의 제목을 생성해주세요:\n\n${cleaned}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const generatedTitle = response.choices[0]?.message?.content?.trim();

    if (!generatedTitle || generatedTitle.length === 0) {
      console.warn("OpenAI returned empty result, using fallback");
      return NextResponse.json({ title: generateFallbackTitle(content) });
    }

    // Ensure title is not too long
    const finalTitle =
      generatedTitle.length > 50
        ? generatedTitle.substring(0, 47) + "..."
        : generatedTitle;

    return NextResponse.json({ title: finalTitle });
  } catch (error) {
    console.error("Failed to generate title with OpenAI:", error);
    const { content } = await request.json();
    return NextResponse.json({ title: generateFallbackTitle(content) });
  }
}
