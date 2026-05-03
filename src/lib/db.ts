"use client";

import { createClient } from "@/lib/supabase/client";
import type {
  DailyLog,
  Profile,
  ScheduleEntry,
  ChatMessage,
  MealPlan,
  ShoppingList,
} from "./types";
import { DEFAULT_SCHEDULE, DAYS } from "./constants";

const PROFILE_COLUMNS =
  "user_id, name, height, start_weight, current_weight, target_weight, age, gender, goal, training_days, sleep_hours, stress_level, notes, body_fat_pct, waist_cm, target_weeks, experience_level, preferred_sports, diet_style, intolerances, cooking_freq, drinks, work_type, coach_style, training_goal, split_preference, training_day_names, session_minutes, time_of_day, focus_areas, cardio_preference, equipment, injuries, injury_notes, hated_exercises, current_prs, other_activities, encrypted_anthropic_key, onboarded, created_at, updated_at";

function getMonday(d = new Date()): string {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().slice(0, 10);
}

export async function getCurrentMealPlan(): Promise<MealPlan | null> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("user_id", auth.user.id)
    .eq("week_start", getMonday())
    .maybeSingle();
  return (data as MealPlan) ?? null;
}

export async function getCurrentShoppingList(): Promise<ShoppingList | null> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase
    .from("shopping_lists")
    .select("*")
    .eq("user_id", auth.user.id)
    .eq("week_start", getMonday())
    .maybeSingle();
  return (data as ShoppingList) ?? null;
}

export async function updateShoppingList(
  weekStart: string,
  items: ShoppingList["items"],
): Promise<void> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("not signed in");
  const { error } = await supabase
    .from("shopping_lists")
    .update({ items })
    .eq("user_id", auth.user.id)
    .eq("week_start", weekStart);
  if (error) throw error;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("user_id", auth.user.id)
    .single();

  if (error) {
    console.error("getProfile error", error);
    return null;
  }
  if (!data) return null;
  return {
    ...data,
    has_anthropic_key: !!(data as any).encrypted_anthropic_key,
  } as unknown as Profile;
}

export async function updateProfile(patch: Partial<Profile>) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not signed in");

  const { has_anthropic_key, user_id, created_at, updated_at, ...payload } =
    patch as any;

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("user_id", auth.user.id);

  if (error) throw error;
}

export async function listLogs(): Promise<DailyLog[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("daily_logs")
    .select("*")
    .order("date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DailyLog[];
}

export async function upsertLog(log: DailyLog) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not signed in");
  const payload = { ...log, user_id: auth.user.id };
  delete (payload as any).id;
  const { error } = await supabase
    .from("daily_logs")
    .upsert(payload, { onConflict: "user_id,date" });
  if (error) throw error;
}

export async function listSchedule(): Promise<Record<string, ScheduleEntry>> {
  const supabase = createClient();
  const { data, error } = await supabase.from("training_schedule").select("*");
  if (error) throw error;

  const map: Record<string, ScheduleEntry> = {};
  (data ?? []).forEach((entry: any) => {
    map[entry.day] = entry as ScheduleEntry;
  });

  for (const day of DAYS) {
    if (!map[day]) {
      map[day] = {
        day,
        type: DEFAULT_SCHEDULE[day]?.type ?? "",
        exercises: DEFAULT_SCHEDULE[day]?.exercises ?? "",
        duration: DEFAULT_SCHEDULE[day]?.duration ?? 0,
        time: DEFAULT_SCHEDULE[day]?.time ?? "-",
      };
    }
  }
  return map;
}

export async function upsertScheduleDay(entry: ScheduleEntry) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not signed in");
  const { error } = await supabase.from("training_schedule").upsert(
    {
      user_id: auth.user.id,
      day: entry.day,
      type: entry.type,
      exercises: entry.exercises,
      duration: entry.duration,
      time: entry.time,
    },
    { onConflict: "user_id,day" },
  );
  if (error) throw error;
}

export async function listChat(): Promise<ChatMessage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ChatMessage[];
}

export async function appendChat(role: "user" | "assistant", content: string) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not signed in");
  const { error } = await supabase
    .from("chat_messages")
    .insert({ user_id: auth.user.id, role, content });
  if (error) throw error;
}

export async function clearChat() {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not signed in");
  const { error } = await supabase
    .from("chat_messages")
    .delete()
    .eq("user_id", auth.user.id);
  if (error) throw error;
}
