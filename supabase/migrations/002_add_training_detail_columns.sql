-- ============================================================
-- FORGE — extra trainingsdetails voor AI schema-generatie
-- Run via Supabase Dashboard → SQL → New query
-- ============================================================

alter table profiles
  add column if not exists training_goal text default 'general_fitness',
  add column if not exists split_preference text default 'no_preference',
  add column if not exists training_day_names text[] default '{}',
  add column if not exists session_minutes int default 60,
  add column if not exists time_of_day text default 'flexible',
  add column if not exists focus_areas text[] default '{}',
  add column if not exists cardio_preference text default 'mixed',
  add column if not exists equipment text default 'full_gym',
  add column if not exists injuries text[] default '{}',
  add column if not exists injury_notes text default '',
  add column if not exists hated_exercises text default '',
  add column if not exists current_prs jsonb default '{}'::jsonb,
  add column if not exists other_activities text default '';
