/**
 * Client-side title generator that calls API route
 */

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

/**
 * Generate title from memo content using API
 */
export async function generateTitle(content: string): Promise<string> {
  try {
    const response = await fetch("/api/generate-title", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate title");
    }

    const data = await response.json();
    return data.title || generateFallbackTitle(content);
  } catch (error) {
    console.error("Failed to generate title:", error);
    return generateFallbackTitle(content);
  }
}

/**
 * Check if API is available
 */
export function isModelLoaded(): boolean {
  return true; // API is always available
}
