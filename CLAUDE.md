# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AI 메모 어플** (AI Memo App) - An intelligent memo application that automatically tags notes, visualizes relationships, and provides AI-powered insights.

The app automatically generates 1-3 tags for each memo based on content, visualizes memo relationships through graph/tree views, and offers AI suggestions based on user patterns. See [SPEC.md](SPEC.md) for detailed Korean specifications.

## Tech Stack

- **Framework**: Next.js 15 with App Router (Turbopack enabled)
- **UI**: shadcn/ui (New York style) with Tailwind CSS 4
- **Language**: TypeScript (strict mode)
- **Package Manager**: pnpm
- **Database**: Supabase (PostgreSQL)
- **Auth**: Google login
- **AI**: OpenAI API (gpt-4o-mini)
- **Icons**: Lucide React

## Development Commands

```bash
# Development
pnpm dev              # Start dev server with Turbopack

# Build & Production
pnpm build            # Build for production with Turbopack
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier
```

## Project Structure

```
app/
├── layout.tsx       # Root layout with Geist fonts
├── page.tsx         # Main page with 3-section layout (memo timeline, visualization, AI insights)
└── globals.css      # Global styles with Tailwind

lib/
└── utils.ts         # Utility functions (cn helper)

components/          # shadcn/ui components (to be added)
```

## Architecture Notes

### Three-Section Layout

The main page ([app/page.tsx](app/page.tsx)) implements a 3-column grid layout:

1. **Left Section (320px)**: Memo timeline and input
   - Chronological memo list (newest at bottom)
   - Search functionality
   - Tag suggestions (1-3 auto-generated tags)
   - Memo input with auto-tag generation

2. **Center Section (1fr)**: Visualization
   - Toggle between "관계형" (relationship graph) and "그래프" (statistics charts)
   - Tag-based node visualization
   - Tag frequency statistics (last 30 days)

3. **Right Section (340px)**: AI Insights
   - AI-generated suggestions based on memo patterns (analyzes last 100 memos)
   - Suggestions auto-generate when saving new memos or via refresh button
   - Chat interface for memo-based conversations with streaming responses
   - Chat references memo content, tags, and timestamps

### Import Order

Prettier is configured with strict import ordering ([prettier.config.cjs](prettier.config.cjs)):
1. React imports
2. Next.js imports
3. Third-party modules
4. Workspace packages
5. Types
6. Config/lib/hooks
7. Components (UI first, then others)
8. Relative imports

### Styling

- Using Tailwind CSS 4 with `@tailwindcss/postcss`
- shadcn/ui with "new-york" style and `neutral` base color
- CSS variables enabled for theming
- Custom backgrounds: radial gradient grid pattern for page background

## Path Aliases

```typescript
@/*  → ./          // Root directory
```

shadcn/ui specific aliases:
- `@/components` → components
- `@/lib` → lib
- `@/components/ui` → components/ui
- `@/hooks` → hooks

## Code Style

- **Formatting**: Prettier with 2-space indentation, double quotes, LF line endings
- **TypeScript**: Strict mode enabled, target ES2017
- **Linting**: ESLint with Next.js config
- **Font Loading**: Using next/font with Geist Sans and Geist Mono

## Environment Variables

Required environment variables in `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OpenAI API (for AI suggestions and chat)
OPENAI_API_KEY=your_openai_api_key
```

## Current State

The project has a fully functional implementation with:
- Supabase database integration for memo storage
- Google authentication for user login
- AI-powered features:
  - Automatic tag generation using local Transformers.js model
  - Title generation using OpenAI API
  - AI suggestions based on memo patterns (last 100 memos)
  - Real-time chat with streaming responses referencing memo data
