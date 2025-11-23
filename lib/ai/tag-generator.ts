import * as tf from "@tensorflow/tfjs";
import * as use from "@tensorflow-models/universal-sentence-encoder";

let model: use.UniversalSentenceEncoder | null = null;
let isLoading = false;

/**
 * Load Universal Sentence Encoder model
 * This should be called on app initialization
 */
export async function loadModel(): Promise<void> {
  if (model || isLoading) return;

  isLoading = true;
  try {
    console.log("Loading Universal Sentence Encoder model...");
    model = await use.load();
    console.log("Model loaded successfully");
  } catch (error) {
    console.error("Failed to load model:", error);
    throw error;
  } finally {
    isLoading = false;
  }
}

/**
 * Check if model is loaded
 */
export function isModelLoaded(): boolean {
  return model !== null;
}

/**
 * Preprocess Korean text for better tag extraction
 */
function preprocessText(text: string): string {
  // Remove special characters except Korean, English, numbers, and spaces
  const cleaned = text.replace(/[^\uAC00-\uD7A3a-zA-Z0-9\s]/g, " ");
  // Normalize whitespace
  return cleaned.replace(/\s+/g, " ").trim();
}

/**
 * Extract keywords from text using TF-IDF-like approach
 */
function extractKeywords(text: string, maxKeywords: number = 5): string[] {
  const processed = preprocessText(text);
  const words = processed.split(/\s+/);

  // Filter out common Korean stop words and short words
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
    "가",
    "께서",
    "도",
    "만",
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
  ]);

  const filtered = words.filter(
    (word) => word.length >= 2 && !stopWords.has(word)
  );

  // Count word frequency
  const frequency = new Map<string, number>();
  filtered.forEach((word) => {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  });

  // Sort by frequency and get top keywords
  const sorted = Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);

  return sorted;
}

/**
 * Generate 1-3 tags based on memo content using semantic analysis
 */
export async function generateTags(content: string): Promise<string[]> {
  if (!model) {
    await loadModel();
  }

  if (!model) {
    throw new Error("Model is not loaded");
  }

  try {
    // Extract candidate keywords
    const keywords = extractKeywords(content, 10);

    if (keywords.length === 0) {
      // Fallback: use first few words
      const words = preprocessText(content).split(/\s+/).slice(0, 3);
      return words.slice(0, Math.min(3, words.length));
    }

    // If we have 3 or fewer keywords, return them directly
    if (keywords.length <= 3) {
      return keywords;
    }

    // Use semantic similarity to select the most relevant tags
    // Embed the full content
    const contentEmbedding = await model.embed([content]);
    const contentVector = await contentEmbedding.array();

    // Embed each keyword
    const keywordEmbeddings = await model.embed(keywords);
    const keywordVectors = await keywordEmbeddings.array();

    // Calculate cosine similarity between content and each keyword
    const similarities = keywordVectors[0].map((_, i) => {
      const keywordVector = keywordVectors.map((kv) => kv[i]);
      const similarity = cosineSimilarity(contentVector[0], keywordVector);
      return { keyword: keywords[i], similarity };
    });

    // Sort by similarity and take top 3
    const topTags = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map((item) => item.keyword);

    // Cleanup tensors to prevent memory leaks
    contentEmbedding.dispose();
    keywordEmbeddings.dispose();

    return topTags;
  } catch (error) {
    console.error("Failed to generate tags:", error);
    // Fallback: return simple keyword extraction
    return extractKeywords(content, 3);
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Generate a title from memo content
 * Uses the first sentence or generates a summary
 */
export async function generateTitle(content: string): Promise<string> {
  if (!model) {
    await loadModel();
  }

  // Clean the content
  const cleaned = preprocessText(content);

  // Try to extract first sentence (up to 50 characters)
  const firstLine = cleaned.split(/[.\n!?]/)[0].trim();

  if (firstLine.length > 0 && firstLine.length <= 50) {
    return firstLine;
  }

  // If first sentence is too long, take first 30 characters and add ellipsis
  if (firstLine.length > 50) {
    return firstLine.substring(0, 30) + "...";
  }

  // Fallback: use first 30 characters of content
  return cleaned.substring(0, 30) + (cleaned.length > 30 ? "..." : "");
}
