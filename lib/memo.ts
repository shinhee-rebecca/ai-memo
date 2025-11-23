import { SupabaseClient } from "@supabase/supabase-js";

export interface Memo {
  id: string;
  user_email: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateMemoInput {
  title: string;
  content: string;
  tags: string[];
  user_email: string;
}

export interface UpdateMemoInput {
  title?: string;
  content?: string;
  tags?: string[];
}

/**
 * Create a new memo
 */
export async function createMemo(
  supabase: SupabaseClient,
  input: CreateMemoInput
): Promise<Memo> {
  const { data, error } = await supabase
    .from("memos")
    .insert({
      user_email: input.user_email,
      title: input.title,
      content: input.content,
      tags: input.tags,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create memo:", error);
    throw new Error(`Failed to create memo: ${error.message}`);
  }

  return data;
}

/**
 * Get all memos for a user, sorted by creation time (newest first)
 */
export async function getMemos(
  supabase: SupabaseClient,
  userEmail: string
): Promise<Memo[]> {
  const { data, error } = await supabase
    .from("memos")
    .select("*")
    .eq("user_email", userEmail)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch memos:", error);
    throw new Error(`Failed to fetch memos: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single memo by ID
 */
export async function getMemo(
  supabase: SupabaseClient,
  id: string
): Promise<Memo | null> {
  const { data, error } = await supabase
    .from("memos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    console.error("Failed to fetch memo:", error);
    throw new Error(`Failed to fetch memo: ${error.message}`);
  }

  return data;
}

/**
 * Update a memo
 */
export async function updateMemo(
  supabase: SupabaseClient,
  id: string,
  updates: UpdateMemoInput
): Promise<Memo> {
  const { data, error } = await supabase
    .from("memos")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Failed to update memo:", error);
    throw new Error(`Failed to update memo: ${error.message}`);
  }

  return data;
}

/**
 * Delete a memo
 */
export async function deleteMemo(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from("memos").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete memo:", error);
    throw new Error(`Failed to delete memo: ${error.message}`);
  }
}

/**
 * Search memos using full-text search
 */
export async function searchMemos(
  supabase: SupabaseClient,
  query: string,
  userEmail: string
): Promise<Memo[]> {
  // Use the custom search function created in the database
  const { data, error } = await supabase.rpc("search_memos", {
    search_query: query,
    user_email_param: userEmail,
  });

  if (error) {
    console.error("Failed to search memos:", error);
    // Fallback to simple client-side filtering
    const allMemos = await getMemos(supabase, userEmail);
    const lowerQuery = query.toLowerCase();

    return allMemos.filter(
      (memo) =>
        memo.title.toLowerCase().includes(lowerQuery) ||
        memo.content.toLowerCase().includes(lowerQuery) ||
        memo.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  return data || [];
}

/**
 * Get memo statistics for a user
 */
export async function getMemoStats(
  supabase: SupabaseClient,
  userEmail: string
): Promise<{
  totalMemos: number;
  tagFrequency: { tag: string; count: number }[];
}> {
  const memos = await getMemos(supabase, userEmail);

  // Calculate tag frequency
  const tagCounts = new Map<string, number>();
  memos.forEach((memo) => {
    memo.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  const tagFrequency = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalMemos: memos.length,
    tagFrequency,
  };
}
