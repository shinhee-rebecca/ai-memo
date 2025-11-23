-- AI Memo App Database Schema
-- Run this in your Supabase SQL Editor

-- Create memos table
CREATE TABLE IF NOT EXISTS public.memos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index on user_email for faster queries
CREATE INDEX IF NOT EXISTS idx_memos_user_email ON public.memos(user_email);

-- Create index on created_at for timeline sorting
CREATE INDEX IF NOT EXISTS idx_memos_created_at ON public.memos(created_at DESC);

-- Create GIN index for full-text search on content and title
CREATE INDEX IF NOT EXISTS idx_memos_fulltext ON public.memos
USING GIN (to_tsvector('english', title || ' ' || content));

-- Create GIN index for tag array search
CREATE INDEX IF NOT EXISTS idx_memos_tags ON public.memos USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE public.memos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own memos" ON public.memos;
DROP POLICY IF EXISTS "Users can insert their own memos" ON public.memos;
DROP POLICY IF EXISTS "Users can update their own memos" ON public.memos;
DROP POLICY IF EXISTS "Users can delete their own memos" ON public.memos;

-- RLS Policy: Users can only view their own memos
CREATE POLICY "Users can view their own memos"
  ON public.memos
  FOR SELECT
  USING (user_email = auth.jwt() ->> 'email');

-- RLS Policy: Users can only insert memos with their own email
CREATE POLICY "Users can insert their own memos"
  ON public.memos
  FOR INSERT
  WITH CHECK (user_email = auth.jwt() ->> 'email');

-- RLS Policy: Users can only update their own memos
CREATE POLICY "Users can update their own memos"
  ON public.memos
  FOR UPDATE
  USING (user_email = auth.jwt() ->> 'email')
  WITH CHECK (user_email = auth.jwt() ->> 'email');

-- RLS Policy: Users can only delete their own memos
CREATE POLICY "Users can delete their own memos"
  ON public.memos
  FOR DELETE
  USING (user_email = auth.jwt() ->> 'email');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_memos_updated_at ON public.memos;
CREATE TRIGGER update_memos_updated_at
  BEFORE UPDATE ON public.memos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function for full-text search with semantic and tag matching
CREATE OR REPLACE FUNCTION search_memos(
  search_query TEXT,
  user_email_param TEXT
)
RETURNS TABLE (
  id UUID,
  user_email TEXT,
  title TEXT,
  content TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.user_email,
    m.title,
    m.content,
    m.tags,
    m.created_at,
    m.updated_at,
    ts_rank(
      to_tsvector('english', m.title || ' ' || m.content),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM public.memos m
  WHERE m.user_email = user_email_param
    AND (
      -- Full-text search on title and content
      to_tsvector('english', m.title || ' ' || m.content) @@ plainto_tsquery('english', search_query)
      OR
      -- Tag matching (case-insensitive)
      EXISTS (
        SELECT 1 FROM unnest(m.tags) tag
        WHERE LOWER(tag) LIKE '%' || LOWER(search_query) || '%'
      )
      OR
      -- Simple text matching as fallback
      LOWER(m.title) LIKE '%' || LOWER(search_query) || '%'
      OR
      LOWER(m.content) LIKE '%' || LOWER(search_query) || '%'
    )
  ORDER BY rank DESC, m.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
