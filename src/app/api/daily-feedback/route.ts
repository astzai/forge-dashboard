import { NextResponse } from "next/server";
import { CLAUDE_MODEL, getUserAnthropic, NoApiKeyError } from "@/lib/claude";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

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
          "name, height, current_weight, target_weight, goal, training_days, sleep_hours, stress_level, notes",
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

    const userMsg = `Geef vandaag een cijfer (0-10) en directe feedback voor morgen.

Vandaag (${body.date}):
- Gewicht: ${body.weight ?? "?"}kg
- Stappen: ${body.steps}
- Sport: ${body.sport} ${body.sport_duration}min
- Eten: ${body.food}
- Calorieën: ${body.calories} kcal
- Eiwit: ${body.protein}g

Antwoord ALLEEN met geldige JSON:
{"score": number 0-10, "feedback": "korte feedback max 4 zinnen", "tomorrow": "1 concreet ding voor morgen"}`;

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 512,
      system,
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
