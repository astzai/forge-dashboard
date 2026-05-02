-- ============================================================
-- FORGE — initial schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query)
-- ============================================================

-- =========== PROFILES ===========
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Athlete',
  height numeric not null default 180,
  start_weight numeric not null default 80,
  current_weight numeric not null default 80,
  target_weight numeric not null default 75,
  age int not null default 30,
  gender text not null default 'male' check (gender in ('male','female')),
  goal text not null default '',
  training_days int not null default 4,
  sleep_hours numeric not null default 7,
  stress_level text not null default 'medium',
  notes text not null default '',
  encrypted_anthropic_key text,           -- encrypted (aes-256-gcm), never sent to client
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========== DAILY LOGS ===========
create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight numeric,
  steps int not null default 0,
  sport text not null default '',
  sport_duration int not null default 0,
  food text not null default '',
  calories int not null default 0,
  protein int not null default 0,
  carbs int not null default 0,
  fat int not null default 0,
  food_items jsonb not null default '[]'::jsonb,
  feedback jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists daily_logs_user_date_idx on public.daily_logs (user_id, date desc);

alter table public.daily_logs enable row level security;

drop policy if exists "daily_logs_select_own" on public.daily_logs;
create policy "daily_logs_select_own" on public.daily_logs
  for select using (auth.uid() = user_id);

drop policy if exists "daily_logs_insert_own" on public.daily_logs;
create policy "daily_logs_insert_own" on public.daily_logs
  for insert with check (auth.uid() = user_id);

drop policy if exists "daily_logs_update_own" on public.daily_logs;
create policy "daily_logs_update_own" on public.daily_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "daily_logs_delete_own" on public.daily_logs;
create policy "daily_logs_delete_own" on public.daily_logs
  for delete using (auth.uid() = user_id);

-- =========== TRAINING SCHEDULE ===========
create table if not exists public.training_schedule (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day text not null,
  type text not null default '',
  exercises text not null default '',
  duration int not null default 0,
  time text not null default '-',
  unique (user_id, day)
);

alter table public.training_schedule enable row level security;

drop policy if exists "schedule_select_own" on public.training_schedule;
create policy "schedule_select_own" on public.training_schedule
  for select using (auth.uid() = user_id);

drop policy if exists "schedule_insert_own" on public.training_schedule;
create policy "schedule_insert_own" on public.training_schedule
  for insert with check (auth.uid() = user_id);

drop policy if exists "schedule_update_own" on public.training_schedule;
create policy "schedule_update_own" on public.training_schedule
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "schedule_delete_own" on public.training_schedule;
create policy "schedule_delete_own" on public.training_schedule
  for delete using (auth.uid() = user_id);

-- =========== CHAT MESSAGES ===========
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_user_created_idx on public.chat_messages (user_id, created_at);

alter table public.chat_messages enable row level security;

drop policy if exists "chat_select_own" on public.chat_messages;
create policy "chat_select_own" on public.chat_messages
  for select using (auth.uid() = user_id);

drop policy if exists "chat_insert_own" on public.chat_messages;
create policy "chat_insert_own" on public.chat_messages
  for insert with check (auth.uid() = user_id);

drop policy if exists "chat_delete_own" on public.chat_messages;
create policy "chat_delete_own" on public.chat_messages
  for delete using (auth.uid() = user_id);

-- =========== AUTO-CREATE PROFILE ON SIGNUP ===========
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========== updated_at TRIGGER FOR profiles ===========
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();
