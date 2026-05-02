# FORGE — Sport Journey OS

Personal fitness, training & nutrition dashboard with an AI coach. Multi-user, privacy-first: every user has their own account, their own data (RLS-isolated), and their own Anthropic API key.

Stack: **Next.js 14 (App Router) · TypeScript · Tailwind · Supabase (auth + Postgres + RLS) · Anthropic Claude API · Vercel**.

---

## 1. Local setup

```bash
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ENCRYPTION_KEY
npm run dev
# → http://localhost:3000
```

### Environment variables

| Var | Where | Why |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | Browser + server use it to talk to Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same page → `anon public` key | Public-safe key; RLS enforces per-user access |
| `ENCRYPTION_KEY` | local: generate yourself | 32-byte hex string used to encrypt each user's Anthropic API key at rest |

Generate `ENCRYPTION_KEY`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> ⚠️ Never change `ENCRYPTION_KEY` after users have stored keys — existing encrypted keys will become unreadable.

---

## 2. Supabase setup

1. Create a project at <https://supabase.com> → **New project** (free tier is fine; pick the EU-West/Frankfurt region for Dutch users).
2. Wait for it to provision (~2 min).
3. Open **SQL Editor** → **New query** → paste the contents of `supabase/migrations/001_initial_schema.sql` → **Run**.
4. (Optional, recommended for friends/family use) **Authentication → Providers → Email** → turn **Confirm email** OFF so signups are instant. If you leave it ON, users will need to click a verification link in their inbox before logging in.
5. Grab your **URL** and **anon key** from **Settings → API** and put them in `.env.local`.

That's it — the SQL creates all four tables (`profiles`, `daily_logs`, `training_schedule`, `chat_messages`) with Row Level Security so users can only see their own data, plus a trigger that auto-creates a profile row on signup.

---

## 3. Deploy to Vercel

The project is set up for GitHub-based auto-deploy.

```bash
# from project root, after creating an empty repo at github.com/<you>/forge-dashboard
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin git@github.com:<you>/forge-dashboard.git
git push -u origin main
```

Then on Vercel:

1. <https://vercel.com/new> → **Import** the `forge-dashboard` repo.
2. Framework preset: **Next.js** (auto-detected).
3. **Environment Variables**: add the same three vars from `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ENCRYPTION_KEY`). Generate a fresh `ENCRYPTION_KEY` for production — don't reuse your local one.
4. **Deploy.**

Subsequent `git push origin main` triggers an auto-deploy. PRs get preview deploys.

---

## 4. Inviting friends

Share the live URL. Each friend:

1. Goes to `/register` → email + password + display name.
2. Onboarding asks for height/weight/goal/etc. (skippable later via Settings).
3. Optionally pastes their own Anthropic API key from <https://console.anthropic.com/settings/keys>.
4. Lands on `/dashboard`.

Users **cannot** see each other — there's no user list, no admin view, no social features. RLS policies make every query auto-filter to `auth.uid() = user_id`.

---

## 5. Project structure

```
src/
├── app/
│   ├── page.tsx              # landing
│   ├── login/                # email+password login
│   ├── register/             # signup (uses Supabase auth)
│   ├── onboarding/           # 3-step profile setup
│   ├── dashboard/            # main app (server-protected)
│   ├── settings/             # profile + API key management
│   ├── auth/signout/         # POST → clears session
│   └── api/
│       ├── chat/             # Claude messages proxy
│       ├── analyze-food/     # Claude nutrition JSON
│       ├── daily-feedback/   # Claude daily score JSON
│       └── api-key/          # POST/DELETE encrypted key
├── components/
│   ├── DashboardShell.tsx    # main app frame
│   ├── NoApiKeyBanner.tsx    # shown when AI features need a key
│   ├── ui/                   # primitives (StatCard, NavTab)
│   └── tabs/                 # one file per tab
├── lib/
│   ├── supabase/             # browser/server/middleware clients
│   ├── claude.ts             # server-side Anthropic SDK helper
│   ├── crypto.ts             # AES-256-GCM for API keys
│   ├── db.ts                 # client-side Supabase queries
│   ├── system-prompt.ts      # AI coach personality
│   ├── constants.ts          # default schedule, sport calories
│   └── types.ts
├── middleware.ts             # auth-protects non-public routes
supabase/
└── migrations/001_initial_schema.sql
```

---

## 6. Security notes

- **API keys** are encrypted at rest (AES-256-GCM with a server-side `ENCRYPTION_KEY`). They are never sent to the browser; the `getProfile()` helper exposes only a `has_anthropic_key: boolean` derived field.
- **Row Level Security** is on for every table. Every policy is `auth.uid() = user_id`. The anon key is safe to ship to the browser because RLS does the gatekeeping.
- **All Claude calls** go through `/api/*` Node routes, which decrypt the user's key server-side and proxy. The browser never touches the key.
- The `/api/api-key` POST validates that the key starts with `sk-ant-` (cheap sanity check; the real validation happens on the next AI call).
