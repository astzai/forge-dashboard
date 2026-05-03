-- ============================================================
-- FORGE — eetschema's + boodschappenlijst
-- ============================================================

create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  plan jsonb not null default '{}'::jsonb,
  daily_targets jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

alter table public.meal_plans enable row level security;

drop policy if exists "meal_plans owner all" on public.meal_plans;
create policy "meal_plans owner all"
  on public.meal_plans
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  items jsonb not null default '[]'::jsonb,
  prep_plan jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

alter table public.shopping_lists enable row level security;

drop policy if exists "shopping_lists owner all" on public.shopping_lists;
create policy "shopping_lists owner all"
  on public.shopping_lists
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
