import { NextResponse } from "next/server";
import {
  CLAUDE_MODEL,
  getUserAnthropic,
  logUsage,
  NoApiKeyError,
} from "@/lib/claude";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

function getMonday(d = new Date()): string {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().slice(0, 10);
}

/**
 * Genereert een gecategoriseerde boodschappenlijst + meal-prep planning
 * uit het meal plan van de huidige week.
 */
export async function POST() {
  try {
    const { client, userId, usedManaged } = await getUserAnthropic();
    const supabase = createClient();

    const weekStart = getMonday();

    const { data: mealPlan } = await supabase
      .from("meal_plans")
      .select("plan, daily_targets")
      .eq("user_id", userId)
      .eq("week_start", weekStart)
      .maybeSingle();

    if (!mealPlan?.plan) {
      return NextResponse.json(
        {
          error:
            "Nog geen eetschema voor deze week — genereer eerst een eetschema.",
        },
        { status: 400 },
      );
    }

    // Verzamel alle ingrediënten (compact)
    const flat: Array<{ day: string; meal: string; ing: any }> = [];
    Object.entries(mealPlan.plan as Record<string, any[]>).forEach(
      ([day, meals]) => {
        meals.forEach((m: any) => {
          (m.ingredients || []).forEach((ing: any) => {
            flat.push({ day, meal: m.name, ing });
          });
        });
      },
    );

    const { data: profile } = await supabase
      .from("profiles")
      .select("cooking_freq, training_day_names")
      .eq("user_id", userId)
      .single();

    const cookingFreq = profile?.cooking_freq ?? "sometimes";
    const trainingDays = profile?.training_day_names ?? [];

    const systemPrompt = `Je bent een Nederlandse meal-prep expert. Je krijgt een lijst met ingrediënten voor 7 dagen aan maaltijden. Doe twee dingen:

1. CONSOLIDEER de boodschappenlijst:
   - Tel hetzelfde ingrediënt op (bv 100g kip ma + 150g kip wo = 250g kip totaal)
   - Categoriseer: "Groente & fruit" / "Vlees & vis" / "Zuivel & ei" / "Brood & granen" / "Droogwaren" / "Diepvries" / "Overig"
   - Rond af op makkelijke supermarkt-eenheden (bv 380g rijst → 500g rijst, 1 banaan dagelijks → 7 bananen, 200g kip → "kipfilet 200g")
   - Voeg basics toe die altijd in huis moeten zijn (zout, peper, olijfolie) ALLEEN als ze duidelijk gebruikt worden

2. MAAK een MEAL PREP planning (1-3 prep-blokken in de week):
   - Voorstellen welke dagen handig zijn om te preppen (zondag = klassiek, woensdag = mid-week refresh)
   - Welke maaltijden samen prep-baar zijn (bv kip + rijst + groente voor 3 lunches)
   - Hoeveel minuten dat ongeveer kost
   - Korte note waarom

Antwoord ALLEEN met geldig JSON in deze structuur (geen markdown):
{
  "items": [
    {"category": "Groente & fruit", "item": "broccoli", "amount": 600, "unit": "g"},
    {"category": "Vlees & vis", "item": "kipfilet", "amount": 800, "unit": "g"},
    ...
  ],
  "prep_plan": [
    {
      "day": "Zondag",
      "meals": ["Kip & rijst lunch", "Quinoa salade"],
      "minutes": 45,
      "note": "Bereid 3 lunches voor de week tegelijk."
    },
    ...
  ]
}

Regels:
- amount altijd een getal, geen text
- unit: g / ml / stuks / blikje / pak / krop
- items GEsorteerd per category
- prep_plan: 1-3 items, niet meer (anders is het geen prep maar dagelijks koken)
- Voor mensen die "rarely" koken: max 1 prep-blok van max 30 min, focus op kant-en-klaar/airfryer
- Voor "almost_always" koken: 2-3 prep-blokken kan, kunnen complexer`;

    const userMsg = `INGREDIËNTEN VOOR DE WEEK (${flat.length} items totaal):
${flat.map((f) => `${f.day} (${f.meal}): ${f.ing.amount}${f.ing.unit} ${f.ing.item}`).join("\n")}

CONTEXT:
- Kook-frequentie: ${cookingFreq}
- Trainingsdagen: ${trainingDays.join(", ") || "wisselend"}

Maak een efficiënte boodschappenlijst + prep planning.`;

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2500,
      system: systemPrompt,
      messages: [{ role: "user", content: userMsg }],
    });

    const text = response.content
      .map((b: any) => (b.type === "text" ? b.text : ""))
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    let parsed: { items: any[]; prep_plan: any[] };
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "AI antwoord onparsebaar", raw: text.slice(0, 500) },
        { status: 502 },
      );
    }

    const items = (parsed.items || []).map((i: any) => ({
      category: i.category || "Overig",
      item: i.item,
      amount: typeof i.amount === "number" ? i.amount : parseFloat(i.amount) || 1,
      unit: i.unit || "stuks",
      checked: false,
    }));

    const prepPlan = (parsed.prep_plan || []).map((p: any) => ({
      day: p.day,
      meals: Array.isArray(p.meals) ? p.meals : [],
      minutes: typeof p.minutes === "number" ? p.minutes : 30,
      note: p.note || "",
    }));

    const { error: upErr } = await supabase.from("shopping_lists").upsert(
      {
        user_id: userId,
        week_start: weekStart,
        items,
        prep_plan: prepPlan,
      },
      { onConflict: "user_id,week_start" },
    );

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    await logUsage({
      userId,
      callType: "shopping",
      usedManaged,
      inputTokens: response.usage?.input_tokens ?? 0,
      outputTokens: response.usage?.output_tokens ?? 0,
    });

    return NextResponse.json({
      week_start: weekStart,
      items,
      prep_plan: prepPlan,
    });
  } catch (err: any) {
    if (err instanceof NoApiKeyError) {
      return NextResponse.json({ error: "no_api_key" }, { status: 402 });
    }
    console.error("/api/generate-shopping-list error", err);
    return NextResponse.json(
      { error: err.message ?? "internal error" },
      { status: 500 },
    );
  }
}
