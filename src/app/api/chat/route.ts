import { NextResponse } from "next/server";
import {
  CLAUDE_MODEL,
  getUserAnthropic,
  logUsage,
  NoApiKeyError,
} from "@/lib/claude";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as {
      messages: { role: "user" | "assistant"; content: string }[];
    };
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const { client, userId, usedManaged } = await getUserAnthropic();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const [{ data: profile }, { data: logs }] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "name, height, start_weight, current_weight, target_weight, age, goal, training_days, sleep_hours, stress_level, notes, body_fat_pct, waist_cm, target_weeks, experience_level, preferred_sports, diet_style, intolerances, cooking_freq, drinks, work_type, coach_style",
        )
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("daily_logs")
        .select("date, weight, steps, sport, calories, protein")
        .eq("user_id", user.id)
        .order("date", { ascending: true })
        .limit(14),
    ]);

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found — complete onboarding first." },
        { status: 400 },
      );
    }

    const system = buildSystemPrompt(profile as any, (logs as any) ?? []);

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system,
      messages,
    });

    const text = response.content
      .map((b: any) => (b.type === "text" ? b.text : ""))
      .join("");

    await logUsage({
      userId,
      callType: "chat",
      usedManaged,
      inputTokens: response.usage?.input_tokens ?? 0,
      outputTokens: response.usage?.output_tokens ?? 0,
    });

    return NextResponse.json({ reply: text });
  } catch (err: any) {
    if (err instanceof NoApiKeyError) {
      return NextResponse.json({ error: "no_api_key" }, { status: 402 });
    }
    console.error("/api/chat error", err);
    return NextResponse.json(
      { error: err.message ?? "internal error" },
      { status: 500 },
    );
  }
}
