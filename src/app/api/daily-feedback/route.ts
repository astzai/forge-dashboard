import { NextResponse } from "next/server";
import { CLAUDE_MODEL, getUserAnthropic, NoApiKeyError } from "@/lib/claude";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      date: string;
      weight: number | null;
      steps: number;
      sport: string;
      sport_duration: number;
      food: string;
      calories: number;
      protein: number;
    };

    const { client } = await getUserAnthropic();
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

    // Build trend context vs 7-day average (excluding today)
    const recent = (logs ?? []).filter((l: any) => l.date !== body.date).slice(-7);
    const avg = (k: "calories" | "protein" | "steps") => {
      const vals = recent.map((l: any) => Number(l[k]) || 0).filter((v) => v > 0);
      if (vals.length === 0) return null;
      return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    };
    const avgCalories = avg("calories");
    const avgProtein = avg("protein");
    const avgSteps = avg("steps");

    const trendCtx = [
      avgCalories
        ? `7-dag gemiddelde kcal: ${avgCalories} (vandaag: ${body.calories})`
        : null,
      avgProtein
        ? `7-dag gemiddelde eiwit: ${avgProtein}g (vandaag: ${body.protein}g)`
        : null,
      avgSteps
        ? `7-dag gemiddelde stappen: ${avgSteps} (vandaag: ${body.steps})`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    const userMsg = `Geef rijke feedback voor vandaag.

Vandaag (${body.date}):
- Gewicht: ${body.weight ?? "?"}kg
- Stappen: ${body.steps}
- Sport: ${body.sport || "rust"} ${body.sport_duration}min
- Eten: ${body.food}
- Calorieën: ${body.calories} kcal, eiwit: ${body.protein}g

TREND vs 7-dag gemiddelde (exclusief vandaag):
${trendCtx || "Niet genoeg historie."}

Antwoord ALLEEN met geldig JSON met DEZE EXACTE structuur:
{
  "score": <number 0-10, overall day score>,
  "feedback": "<2-3 zinnen overall samenvatting>",
  "tomorrow": "<1 concreet ding voor morgen>",
  "sections": {
    "voeding": { "score": <0-10>, "note": "<1 zin>" },
    "training": { "score": <0-10>, "note": "<1 zin>" },
    "herstel": { "score": <0-10>, "note": "<1 zin>" },
    "consistency": { "score": <0-10>, "note": "<1 zin over of vandaag in lijn is met de week>" }
  },
  "trend_context": "<1 zin met de meest opvallende trend (bv 'eiwit 30g hoger dan week-gemiddelde')>"
}`;

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 800,
      system: buildSystemPrompt(profile as any, (logs as any) ?? []),
      messages: [{ role: "user", content: userMsg }],
    });

    const text = response.content
      .map((b: any) => (b.type === "text" ? b.text : ""))
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        score: 7,
        feedback: "Log opgeslagen.",
        tomorrow: "Blijf consistent.",
      };
    }
    return NextResponse.json(parsed);
  } catch (err: any) {
    if (err instanceof NoApiKeyError) {
      return NextResponse.json({ error: "no_api_key" }, { status: 402 });
    }
    console.error("/api/daily-feedback error", err);
    return NextResponse.json(
      { error: err.message ?? "internal error" },
      { status: 500 },
    );
  }
}
