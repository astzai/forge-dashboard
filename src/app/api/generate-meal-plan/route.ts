import { NextResponse } from "next/server";
import {
  CLAUDE_MODEL,
  getUserAnthropic,
  logUsage,
  NoApiKeyError,
} from "@/lib/claude";
import { createClient } from "@/lib/supabase/server";
import { DAYS } from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Berekent BMR (Mifflin-St Jeor), TDEE (op basis van activity-multiplier
 * uit work_type + sport-frequentie) en daily kcal target afhankelijk van
 * doel (cut/bulk/recomp).
 */
function computeTargets(profile: any): {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  const bmr =
    profile.gender === "female"
      ? 10 * profile.current_weight + 6.25 * profile.height - 5 * profile.age - 161
      : 10 * profile.current_weight + 6.25 * profile.height - 5 * profile.age + 5;

  const workMult: Record<string, number> = {
    sedentary: 1.3,
    mixed: 1.45,
    active: 1.6,
    very_active: 1.75,
  };
  const trainingDays = profile.training_day_names?.length ?? profile.training_days ?? 4;
  const trainingBonus = (trainingDays / 7) * 0.15;
  const tdee = bmr * ((workMult[profile.work_type] ?? 1.4) + trainingBonus);

  // Cut/bulk/recomp op basis van doel
  let kcal = tdee;
  if (profile.target_weight < profile.current_weight - 1) {
    // Cut — bereken zo dat target binnen target_weeks haalbaar is, max 0.8% van bw/wk
    const totalDeficitKg = profile.current_weight - profile.target_weight;
    const weeks = profile.target_weeks ?? 16;
    const safeKgPerWeek = Math.min(0.008 * profile.current_weight, totalDeficitKg / weeks);
    const dailyDeficit = (safeKgPerWeek * 7700) / 7;
    kcal = tdee - dailyDeficit;
  } else if (profile.target_weight > profile.current_weight + 1) {
    kcal = tdee + 250; // Lean bulk
  }
  // anders recomp: kcal = tdee

  const protein = Math.round(profile.current_weight * 1.8);
  const fat = Math.round((kcal * 0.28) / 9);
  const carbs = Math.max(
    50,
    Math.round((kcal - protein * 4 - fat * 9) / 4),
  );

  return { kcal: Math.round(kcal), protein, carbs, fat };
}

function getMonday(d = new Date()): string {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().slice(0, 10);
}

export async function POST() {
  try {
    const { client, userId, usedManaged } = await getUserAnthropic();
    const supabase = createClient();

    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profErr || !profile) {
      return NextResponse.json(
        { error: "profile niet gevonden" },
        { status: 404 },
      );
    }

    const targets = computeTargets(profile);
    const weekStart = getMonday();

    const dietMap: Record<string, string> = {
      omnivore: "alles eet, voorkeur voor eiwitrijke bronnen",
      vegetarian: "vegetarisch (geen vlees/vis, wel zuivel + ei)",
      vegan: "vegan (geen dierlijke producten)",
      pescatarian: "pescatarisch (vis ja, vlees nee)",
      keto: "keto / low-carb (max 50g koolhydraten/dag)",
      other: "anders",
    };

    const cookingMap: Record<string, string> = {
      rarely: "kookt zelden — voorkeur voor snelle, gemaks-maaltijden (max 15 min) en restaurant/afhaal-vriendelijke opties",
      sometimes: "kookt 2-3x/week — combineer simpele gerechten met restjes en kant-en-klare basis",
      often: "kookt 4-5x/week — kan iets meer tijd investeren (20-30 min)",
      almost_always: "kookt bijna altijd zelf — kan complexere gerechten aan (30-45 min) en houdt van variatie",
    };

    const userContext = `
PROFIEL:
- Naam: ${profile.name}, ${profile.age}j, ${profile.gender}, ${profile.height}cm, ${profile.current_weight}kg
- Doel: ${profile.target_weight}kg in ${profile.target_weeks ?? "?"} weken — ${profile.goal}
- Dieet: ${dietMap[profile.diet_style] ?? profile.diet_style}
- Intoleranties: ${(profile.intolerances || []).join(", ") || "geen"}
- Kook-frequentie: ${cookingMap[profile.cooking_freq] ?? profile.cooking_freq}
- Drinkt: ${profile.drinks || "niet gespecificeerd"}
- Trainingsdagen: ${(profile.training_day_names || []).join(", ") || "wisselend"}

DAGELIJKSE TARGETS (door FORGE berekend op basis van BMR/TDEE):
- Calorieën: ${targets.kcal} kcal
- Eiwit: ${targets.protein}g (1.8g/kg lichaamsgewicht)
- Koolhydraten: ${targets.carbs}g
- Vet: ${targets.fat}g
`.trim();

    const systemPrompt = `Je bent een Nederlandse sport-diëtist die 7-daagse eetschema's maakt voor sport-georiënteerde mensen. Je schema's zijn:
- Praktisch en niet snobistisch (geen quinoa-bowls als de user kant-en-klaar gewend is)
- Boodschappen-efficiënt: maaltijden delen ingrediënten waar mogelijk
- Calorisch correct: dagelijkse totalen ±5% van het kcal-target
- Eiwit-prioriteit: ALTIJD het eiwitdoel halen, ook als kcal iets afwijkt
- Smakelijk en realistisch — Nederlandse keuken, geen exotische ingrediënten tenzij ze passen
- Variatie in de week, maar wel 2-3 maaltijden die terugkomen (efficiënt voor meal prep)
- Op trainingsdagen meer koolhydraten rond de training; rustdagen iets minder

Antwoord ALLEEN met geldig JSON in deze structuur (geen markdown):
{
  "plan": {
    "Maandag": [
      {
        "moment": "ontbijt",
        "name": "Havermout met banaan en kwark",
        "kcal": 520, "protein": 35, "carbs": 65, "fat": 12,
        "ingredients": [
          {"item": "havermout", "amount": 80, "unit": "g"},
          {"item": "banaan", "amount": 1, "unit": "stuk"},
          {"item": "magere kwark", "amount": 200, "unit": "g"}
        ],
        "prep": "Havermout met water koken, kwark + banaan erover.",
        "prep_minutes": 5
      },
      { "moment": "lunch", ... },
      { "moment": "diner", ... },
      { "moment": "snack", ... }
    ],
    "Dinsdag": [...],
    ...alle 7 dagen, telkens 4 maaltijden (ontbijt, lunch, diner, snack)
  }
}

Belangrijke regels:
- Exact 4 maaltijden per dag in deze volgorde: ontbijt → lunch → diner → snack
- Alle 7 dagen (Maandag t/m Zondag) verplicht
- ingredients: gebruik standaard supermarkt-units (g, ml, stuks, eetlepel, theelepel, blikje)
- prep: 1-2 zinnen, kort en dummy-proof
- prep_minutes: getal, geen text
- Geen ingrediënten die conflicteren met intoleranties
- Hou rekening met kook-frequentie: rarely = veel airfryer/quick-meals, often = wat meer fancy`;

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Maak een 7-daags eetschema voor de week startende ${weekStart}.\n\n${userContext}\n\nFocus op haalbaarheid en boodschappen-efficiëntie.`,
        },
      ],
    });

    const text = response.content
      .map((b: any) => (b.type === "text" ? b.text : ""))
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    let parsed: { plan: Record<string, any[]> };
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "AI antwoord onparsebaar", raw: text.slice(0, 500) },
        { status: 502 },
      );
    }

    if (!parsed.plan || typeof parsed.plan !== "object") {
      return NextResponse.json(
        { error: "AI antwoord miste 'plan' veld" },
        { status: 502 },
      );
    }

    // Normaliseer: zorg dat alle 7 dagen aanwezig zijn
    const normalized: Record<string, any[]> = {};
    for (const d of DAYS) {
      normalized[d] = Array.isArray(parsed.plan[d]) ? parsed.plan[d] : [];
    }

    const { error: upErr } = await supabase
      .from("meal_plans")
      .upsert(
        {
          user_id: userId,
          week_start: weekStart,
          plan: normalized,
          daily_targets: targets,
        },
        { onConflict: "user_id,week_start" },
      );

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    // Zodra we een nieuw plan hebben, oude shopping list voor deze week wegblazen
    await supabase
      .from("shopping_lists")
      .delete()
      .eq("user_id", userId)
      .eq("week_start", weekStart);

    await logUsage({
      userId,
      callType: "meal_plan",
      usedManaged,
      inputTokens: response.usage?.input_tokens ?? 0,
      outputTokens: response.usage?.output_tokens ?? 0,
    });

    return NextResponse.json({
      week_start: weekStart,
      plan: normalized,
      daily_targets: targets,
    });
  } catch (err: any) {
    if (err instanceof NoApiKeyError) {
      return NextResponse.json({ error: "no_api_key" }, { status: 402 });
    }
    console.error("/api/generate-meal-plan error", err);
    return NextResponse.json(
      { error: err.message ?? "internal error" },
      { status: 500 },
    );
  }
}
