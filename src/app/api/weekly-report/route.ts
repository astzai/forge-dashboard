import { NextResponse } from "next/server";
import { CLAUDE_MODEL, getUserAnthropic, NoApiKeyError } from "@/lib/claude";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

function mondayOf(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getUTCDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      week_start?: string;
    };

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const weekStart =
      body.week_start || mondayOf(new Date().toISOString().slice(0, 10));
    const weekEndDate = new Date(weekStart);
    weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6);
    const weekEnd = weekEndDate.toISOString().slice(0, 10);

    const { client } = await getUserAnthropic();

    const [{ data: profile }, { data: logs }, { data: latestPhotoAssessment }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select(
            "name, height, start_weight, current_weight, target_weight, age, goal, training_days, sleep_hours, stress_level, notes, body_fat_pct, waist_cm, target_weeks, experience_level, preferred_sports, diet_style, intolerances, cooking_freq, drinks, work_type, coach_style",
          )
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("daily_logs")
          .select("date, weight, steps, sport, sport_duration, calories, protein, carbs, fat")
          .eq("user_id", user.id)
          .gte("date", weekStart)
          .lte("date", weekEnd)
          .order("date", { ascending: true }),
        supabase
          .from("photo_assessments")
          .select("check_in_date, assessment")
          .eq("user_id", user.id)
          .gte("check_in_date", weekStart)
          .lte("check_in_date", weekEnd)
          .order("check_in_date", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 400 },
      );
    }

    const weekLogs = logs ?? [];
    const weights = weekLogs
      .map((l: any) => l.weight)
      .filter((w: any) => w != null);
    const weightStart = weights[0] ?? null;
    const weightEnd = weights[weights.length - 1] ?? null;
    const weightChange =
      weightStart != null && weightEnd != null
        ? Number((Number(weightEnd) - Number(weightStart)).toFixed(1))
        : null;

    const totalCalories = weekLogs
      .map((l: any) => Number(l.calories) || 0)
      .reduce((a: number, b: number) => a + b, 0);
    const calDays = weekLogs.filter((l: any) => Number(l.calories) > 0).length;
    const avgCalories = calDays > 0 ? Math.round(totalCalories / calDays) : null;

    const totalProtein = weekLogs
      .map((l: any) => Number(l.protein) || 0)
      .reduce((a: number, b: number) => a + b, 0);
    const proteinDays = weekLogs.filter((l: any) => Number(l.protein) > 0).length;
    const avgProtein =
      proteinDays > 0 ? Math.round(totalProtein / proteinDays) : null;

    const sportCount = weekLogs.filter((l: any) => l.sport).length;

    const summary = weekLogs
      .map(
        (l: any) =>
          `${l.date}: ${l.weight ?? "?"}kg, ${l.steps} stappen, ${l.sport || "rust"} ${l.sport_duration ?? 0}min, ${l.calories ?? "?"}kcal/${l.protein ?? "?"}p`,
      )
      .join("\n");

    const photoCtx = latestPhotoAssessment
      ? `\n\nFOTO-ASSESSMENT van ${latestPhotoAssessment.check_in_date}:\n- Summary: ${latestPhotoAssessment.assessment.summary}\n- Observaties: ${(latestPhotoAssessment.assessment.observations ?? []).join(" / ")}\n- Focus: ${(latestPhotoAssessment.assessment.focus_areas ?? []).join(", ")}`
      : "";

    const userMsg = `Genereer een weekrapport voor week ${weekStart} t/m ${weekEnd}.

DATA DEZE WEEK:
${summary || "Geen logs deze week."}

Gewicht: ${weightStart != null ? `${weightStart}kg → ${weightEnd}kg (${weightChange != null ? (weightChange > 0 ? "+" : "") + weightChange : "?"}kg)` : "Geen gewicht data"}
Sport sessies: ${sportCount}
Gem kcal/dag: ${avgCalories ?? "?"}
Gem eiwit/dag: ${avgProtein ?? "?"}g${photoCtx}

Antwoord ALLEEN met geldig JSON:
{
  "summary": "2-3 zinnen overall samenvatting van de week",
  "wins": ["2-4 dingen die goed gingen"],
  "misses": ["1-3 dingen die beter konden, eerlijk maar niet bestraffend"],
  "next_week_focus": "Het ENE belangrijkste focus-punt voor volgende week (max 2 zinnen)",
  "photo_observation": ${latestPhotoAssessment ? '"1 zin over de foto-progressie"' : "null"}
}`;

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
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
        summary: "Kon rapport niet parseren.",
        wins: [],
        misses: [],
        next_week_focus: "",
        photo_observation: null,
      };
    }

    const reportPayload = {
      ...parsed,
      weight_change_kg: weightChange,
      avg_calories: avgCalories,
      avg_protein: avgProtein,
      sport_count: sportCount,
      avg_sleep: null,
    };

    await supabase.from("weekly_reports").upsert(
      {
        user_id: user.id,
        week_start: weekStart,
        report: reportPayload,
      },
      { onConflict: "user_id,week_start" },
    );

    return NextResponse.json({ week_start: weekStart, report: reportPayload });
  } catch (err: any) {
    if (err instanceof NoApiKeyError) {
      return NextResponse.json({ error: "no_api_key" }, { status: 402 });
    }
    console.error("/api/weekly-report error", err);
    return NextResponse.json(
      { error: err.message ?? "internal error" },
      { status: 500 },
    );
  }
}
