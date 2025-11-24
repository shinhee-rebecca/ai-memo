import { NextRequest, NextResponse } from "next/server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Preprocess Korean text for better tag extraction
 */
function preprocessText(text: string): string {
  const cleaned = text.replace(/[^\uAC00-\uD7A3a-zA-Z0-9\s]/g, " ");
  return cleaned.replace(/\s+/g, " ").trim();
}

/**
 * Fallback tag generation (when API fails or returns invalid data)
 */
function extractKeywordsFallback(
  text: string,
  maxKeywords: number = 3
): string[] {
  const processed = preprocessText(text);
  const words = processed.split(/\s+/);

  const stopWords = new Set([
    "그",
    "이",
    "저",
    "것",
    "수",
    "등",
    "들",
    "및",
    "좀",
    "더",
    "잘",
    "안",
    "또",
    "한",
    "와",
    "과",
    "의",
    "가",
    "을",
    "를",
    "에",
    "에서",
    "로",
    "으로",
    "는",
    "은",
    "이",
    "께서",
    "도",
    "만",
    "있",
    "없",
    "하",
    "되",
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "is",
    "are",
    "was",
    "were",
  ]);

  const filtered = words.filter(
    (word) => word.length >= 2 && !stopWords.has(word.toLowerCase())
  );

  const frequency = new Map<string, number>();
  filtered.forEach((word, index) => {
    const positionWeight = 1 + (filtered.length - index) / filtered.length;
    const currentScore = frequency.get(word) || 0;
    frequency.set(word, currentScore + positionWeight);
  });

  const sorted = Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);

  return sorted.length > 0 ? sorted : ["메모"];
}

export async function POST(request: NextRequest) {
  let content = "";

  try {
    const body = await request.json();
    content = body.content;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const cleaned = content.trim();

    // If content is too short, use fallback
    if (cleaned.length < 5) {
      return NextResponse.json({ tags: extractKeywordsFallback(content, 3) });
    }

    // Call OpenAI API to generate tags with timeout
    const response = await Promise.race([
      openai.chat.completions.create(
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "당신은 메모의 내용을 분석하여 적절한 태그를 생성하는 AI입니다. 메모의 핵심 키워드나 주제를 나타내는 태그 1-3개를 생성하세요. 각 태그는 한 단어로 간결하게 작성하며, 쉼표로 구분합니다. 예시: 업무, 아이디어, 회의",
            },
            {
              role: "user",
              content: `다음 메모에 적합한 태그 1-3개를 생성해주세요. 태그는 쉼표로 구분하여 응답하세요:\n\n${cleaned}`,
            },
          ],
          temperature: 0.5,
          max_tokens: 50,
        },
        {
          timeout: 20000, // 20 second timeout
        }
      ),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 25000)
      ),
    ]);

    const generatedTags = (response as any).choices[0]?.message?.content?.trim();

    if (!generatedTags) {
      console.warn("OpenAI returned empty result, using fallback");
      return NextResponse.json({ tags: extractKeywordsFallback(content, 3) });
    }

    // Parse tags from response (comma or space separated)
    const tags = generatedTags
      .split(/[,\s]+/)
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0)
      .slice(0, 3);

    if (tags.length === 0) {
      console.warn("Failed to parse tags, using fallback");
      return NextResponse.json({ tags: extractKeywordsFallback(content, 3) });
    }

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Failed to generate tags with OpenAI:", error);
    // Use the content variable that was already read
    return NextResponse.json({
      tags: content ? extractKeywordsFallback(content, 3) : ["메모"],
    });
  }
}
