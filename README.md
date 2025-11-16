## Nextyou LinkedIn Writer (Next.js + shadcn/ui)

Modern LinkedIn content studio with AI-assisted writing, editable prompts, and a scheduling calendar. The OpenAI API key and Supabase credentials are loaded from environment variables so nothing sensitive touches the browser.

## 1. Prerequisites

- Node.js 18+ (Next.js 16 requirement)
- An OpenAI API key with access to `gpt-4o-mini`
- A Supabase project (for persisting prompts and scheduled posts)
- npm (or yarn/pnpm/bun if you prefer)

## 2. Environment Variables

Copy the example file and add your real key:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
OPENAI_API_KEY=sk-your-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_DISABLE_DEV_INDICATOR=1   # optional (hides dev overlay)
```

### Supabase schema

Run these SQL snippets once inside the Supabase SQL editor:

```sql
create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  profile text not null,
  section text not null,
  content text not null,
  updated_at timestamptz default now(),
  unique(profile, section)
);

create table if not exists scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  date text not null,
  time text not null,
  notes text,
  profile text not null,
  profile_name text not null,
  created_at timestamptz default now()
);
```

Use the **service role** key in `SUPABASE_SERVICE_ROLE_KEY` so the API routes can perform CRUD operations securely on the server.

## 3. Install & Run

```bash
npm install
npm run dev
```

Visit http://localhost:3000 to use the studio.

## 4. Quality & Production Builds

- `npm run lint` – static analysis
- `npm run build` – production build (runs lint automatically)
- `npm start` – run the compiled build locally

## 5. Deploying to Vercel

1. Push this folder to GitHub (or connect directly through the Vercel CLI).
2. In Vercel Project Settings → Environment Variables, add `OPENAI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`.
3. Deploy. The `/api/generate` route automatically proxies requests to OpenAI using the server-side key.

## 6. Project Structure

- `src/app/page.tsx` – main UI (profiles, prompts, chat, calendar)
- `src/app/api/generate/route.ts` – serverless endpoint wrapping OpenAI
- `src/app/api/prompts/route.ts` – loads/saves prompt sections in Supabase
- `src/app/api/posts/*` – CRUD endpoints for scheduled posts in Supabase
- `src/lib/prompts.ts` – shared prompt types/constants
- `src/lib/supabase.ts` – helper to instantiate the Supabase server client
- `src/components/ui/*` – shadcn/ui primitives
- `src/components/theme-provider.tsx` – theme + Sonner toast wiring

Happy shipping! 🎉
