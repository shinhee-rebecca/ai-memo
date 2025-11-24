/**
 * Client-side tag generator that calls API route
 */

/**
 * Generate 1-3 tags based on memo content using API
 */
export async function generateTags(content: string): Promise<string[]> {
  try {
    const response = await fetch("/api/generate-tags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate tags");
    }

    const data = await response.json();
    return data.tags || ["메모"];
  } catch (error) {
    console.error("Failed to generate tags:", error);
    return ["메모"];
  }
}

/**
 * Check if API is available
 */
export function isModelLoaded(): boolean {
  return true; // API is always available
}

/**
 * Placeholder function for compatibility
 */
export async function loadModel(): Promise<void> {
  console.log("Using API for tag generation");
}
