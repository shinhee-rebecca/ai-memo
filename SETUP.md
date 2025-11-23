# AI Memo App - Setup Guide

## 1. Supabase Database Setup

### Step 1: Run the SQL Script

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Open the file `supabase-setup.sql` in this project
4. Copy the entire contents of the file
5. Paste it into the SQL Editor in Supabase
6. Click **Run** to execute the script

This will:
- Create the `memos` table with proper schema
- Set up indexes for fast queries
- Enable Row Level Security (RLS)
- Create RLS policies to ensure users can only access their own memos
- Add a full-text search function

### Step 2: Verify the Setup

After running the script, verify that:
- The `memos` table exists (check in **Table Editor**)
- RLS is enabled (you should see a shield icon next to the table name)
- The policies are created (click on the table → **RLS Policies** tab)

## 2. Environment Variables

Your `.env.local` file should already have the required Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

These are already configured in your project.

## 3. Running the Application

### Install Dependencies (Already Done)

```bash
pnpm install
```

### Start Development Server

```bash
pnpm dev
```

The app will be available at http://localhost:3000

## 4. How to Use the App

### Login
1. Click "구글로 시작하기" to sign in with Google
2. After successful login, your email will appear in the header

### Create a Memo
1. In the Left Section, you'll see a memo input form at the bottom
2. **Title** (optional): Enter a title or leave blank for auto-generation
3. **Content** (required): Enter your memo content
4. Click **AI 태그 생성** to generate 1-3 suggested tags based on content
5. Select up to 3 tags from suggestions (click to toggle)
6. Add 1 custom tag if needed using the custom tag input
7. Click **메모 저장** to save

**Note**: If you don't select any tags, the first suggested tag will be automatically selected when saving.

### View Memos
- Your memos appear in the timeline (center of Left Section)
- Newest memos are shown at the top
- Each memo shows: title, excerpt, tags, and time ago

### Search Memos
1. Use the search box at the top of Left Section
2. Type your query and press Enter
3. Search includes:
   - Full-text search on title and content
   - Semantic matching
   - Tag matching
4. Click the X button to clear search and show all memos

## 5. Features Overview

### AI-Powered Tag Generation
- Uses TensorFlow.js with Universal Sentence Encoder
- Analyzes memo content semantically
- Generates 1-3 relevant tags automatically
- Model loads on app startup (may take a few seconds)

### Auto Title Generation
- If you don't provide a title, one is generated automatically
- Uses the first sentence or a summary of your content

### Tag Selection Rules
- Maximum 3 tags per memo (from suggestions)
- 1 additional custom tag can be added
- If no tags selected, first suggested tag is auto-selected

### Search Capabilities
- Full-text search on title and content
- Tag-based filtering
- Semantic matching via PostgreSQL full-text search
- Results ranked by relevance

### Data Privacy
- Row Level Security (RLS) ensures users can only see their own memos
- All operations are scoped to the logged-in user
- No user can access another user's data

## 6. Architecture

### Frontend
- **Next.js 15** with App Router and Turbopack
- **React** for UI components
- **Tailwind CSS 4** for styling
- **TensorFlow.js** for AI tag generation (client-side)

### Backend
- **Supabase** for authentication and database
- **PostgreSQL** with full-text search capabilities
- **Row Level Security** for data isolation

### AI Model
- **Universal Sentence Encoder** for semantic analysis
- Runs entirely in the browser (no server required)
- Initial load time: ~3-5 seconds
- Tag generation time: ~1-2 seconds per memo

## 7. Troubleshooting

### Model Loading Issues
- If you see "AI 로딩중..." for too long, check browser console
- Try refreshing the page
- Ensure you have a stable internet connection (model downloads on first load)

### Login Issues
- Make sure Google OAuth is properly configured in Supabase
- Check that redirect URLs are set correctly in Supabase Auth settings

### Database Issues
- Verify that the SQL script ran successfully
- Check that RLS policies are enabled
- Look at browser console for any Supabase errors

### Search Not Working
- Ensure the `search_memos` function was created in the database
- Check that you're logged in (search requires authentication)
- Try using simpler search terms

## 8. Next Steps

Current implementation includes:
- ✅ User authentication (Google)
- ✅ Memo creation with title input
- ✅ AI-powered tag generation
- ✅ Tag selection (max 3 + 1 custom)
- ✅ Auto title generation
- ✅ Full-text search
- ✅ Timeline view

Future enhancements (from SPEC.md):
- 🔲 Graph visualization with real data
- 🔲 AI insights based on memo patterns
- 🔲 AI chat interface for memo exploration
- 🔲 Memo editing and deletion
- 🔲 Advanced filtering options
