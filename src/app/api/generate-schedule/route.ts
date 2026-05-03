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

type ScheduleDay = {
  type: string;
  exercises: string;
  duration: number;
  time: string;
};

const TIME_BY_PREFERENCE: Record<string, string> = {
  morning: "07:00",
  afternoon: "13:00",
  evening: "18:00",
  flexible: "18:00",
};

/**
 * Genereert een persoonlijk 7-daags trainingsschema op basis van profile-velden
 * en schrijft het direct naar `training_schedule`. Returned het opgeslagen schema.
 */
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

    const trainingDays: string[] =
      Array.isArray(profile.training_day_names) &&
      profile.training_day_names.length > 0
        ? profile.training_day_names
        : ["Maandag", "Dinsdag", "Donderdag", "Vrijdag"];

    const sessionMin = profile.session_minutes || 60;
    const time = TIME_BY_PREFERENCE[profile.time_of_day] || "18:00";
    const prs = profile.current_prs || {};
    const prsLine = prs.unknown
      ? "PR's onbekend — coach mag conservatief starten"
      : `PR's (1RM kg): bench ${prs.bench ?? "?"}, squat ${prs.squat ?? "?"}, deadlift ${prs.deadlift ?? "?"}`;

    const userContext = `
PROFIEL
- Naam: ${profile.name}
- Leeftijd: ${profile.age}, geslacht: ${profile.gender}
- Lengte: ${profile.height}cm, gewicht: ${profile.current_weight}kg → doel ${profile.target_weight}kg
- Hoofddoel: ${profile.goal}
- Ervaring: ${profile.experience_level}
- Werk: ${profile.work_type}
- Slaap: ${profile.sleep_hours}u, stress: ${profile.stress_level}

TRAINING DOEL & STIJL
- Doel: ${profile.training_goal}
- Voorkeurs-split: ${profile.split_preference}
- Sporten: ${(profile.preferred_sports || []).join(", ") || "—"}
- Focuspunten: ${(profile.focus_areas || []).join(", ") || "geen specifieke focus"}
- Cardio voorkeur: ${profile.cardio_preference}
- Equipment: ${profile.equipment}

PRAKTISCH
- Beschikbare dagen: ${trainingDays.join(", ")}
- Tijd per sessie: ${sessionMin} min
- Tijd van de dag: ${profile.time_of_day}

BLESSURES & VOORKEUREN
- Blessures: ${(profile.injuries || []).join(", ") || "geen"}
- Toelichting blessures: ${profile.injury_notes || "—"}
- Oefeningen die ze haten: ${profile.hated_exercises || "—"}

CIJFERS
- ${prsLine}

OVERIGE ACTIVITEITEN (vrij ingevuld door user)
${profile.other_activities || "—"}

EXTRA CONTEXT
${profile.notes || "—"}
`.trim();

    const systemPrompt = `Je bent een personal trainer met 10+ jaar ervaring die persoonlijke 7-daagse trainingsschemas opstelt. Je houdt rekening met:
- Het training-doel (hypertrofie / kracht / vetverlies+behoud / sport-specifiek / fitheid)
- De voorkeurs-split, met respect voor wat realistisch past bij het aantal dagen
- Blessures en oefeningen die de user haat — die NOOIT inplannen
- Sport-specifieke training (padel, hardlopen etc) op een logische dag
- Recovery: minimaal 1 rustdag, geen 2x dezelfde spiergroep zonder 48u tussen
- Haalbaar binnen de session_minutes — geen schema's met 15 oefeningen in 45 min
- Equipment-restricties (alleen oefeningen die met beschikbaar materiaal kunnen)
- Overige activiteiten die de user al doet

Antwoord ALLEEN met geldig JSON in dit exacte formaat (geen markdown, geen uitleg):
{
  "schedule": {
    "Maandag": { "type": "Push (Borst, Schouders, Triceps)", "exercises": "Bench Press 4x8, Incline DB Press 3x10, ...", "duration": 60 },
    "Dinsdag": { "type": "Rust", "exercises": "Wandelen, stretchen", "duration": 0 },
    ...alle 7 dagen...
  },
  "rationale": "Korte uitleg in 2-3 zinnen waarom dit schema past bij deze user"
}

Regels voor type:
- Krachttraining: gebruik labels zoals "Push (Borst, Schouders, Triceps)" / "Pull (Rug, Biceps)" / "Legs" / "Upper Body" / "Lower Body" / "Full Body"
- Sport: "Padel + Cardio" / "Hardlopen Zone 2" / "Voetbal" / etc
- Rust: "Rust" of "Recovery (wandelen + mobility)"

Regels voor exercises:
- Krachttraining: altijd compound first, daarna isolaties. Format: "Naam SetsxReps, Naam SetsxReps, ..."
- Maximum 5-6 oefeningen voor 60 min, 7-8 voor 90 min
- Bij rust: korte beschrijving zoals "Wandelen 30 min, mobility, voorbereiden week"

Regels voor duration: minuten als number, 0 voor rustdagen.`;

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Maak een schema voor de komende week op basis van dit profiel:\n\n${userContext}\n\nLet op: trainingsdagen zijn ${trainingDays.join(", ")}. Andere dagen = rust (maar wel actief: wandelen, mobility).`,
        },
      ],
    });

    const text = response.content
      .map((b: any) => (b.type === "text" ? b.text : ""))
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    let parsed: { schedule: Record<string, ScheduleDay>; rationale?: string };
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Kon AI antwoord niet parseren", raw: text },
        { status: 502 },
      );
    }

    if (!parsed.schedule || typeof parsed.schedule !== "object") {
      return NextResponse.json(
        { error: "AI antwoord miste 'schedule' veld", raw: text },
        { status: 502 },
      );
    }

    // Normaliseer + schrijf naar DB
    const rows = DAYS.map((day) => {
      const entry = parsed.schedule[day] ?? {
        type: "Rust",
        exercises: "Recovery dag",
        duration: 0,
      };
      const isRest =
        !entry.type ||
        entry.type.toLowerCase().includes("rust") ||
        entry.duration === 0;
      return {
        user_id: userId,
        day,
        type: entry.type || "Rust",
        exercises: entry.exercises || "",
        duration: typeof entry.duration === "number" ? entry.duration : 0,
        time: isRest ? "-" : time,
      };
    });

    const { error: upErr } = await supabase
      .from("training_schedule")
      .upsert(rows, { onConflict: "user_id,day" });

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    await logUsage({
      userId,
      callType: "schedule",
      usedManaged,
      inputTokens: response.usage?.input_tokens ?? 0,
      outputTokens: response.usage?.output_tokens ?? 0,
    });

    return NextResponse.json({
      schedule: rows,
      rationale: parsed.rationale ?? "",
    });
  } catch (err: any) {
    if (err instanceof NoApiKeyError) {
      return NextResponse.json({ error: "no_api_key" }, { status: 402 });
    }
    console.error("/api/generate-schedule error", err);
    return NextResponse.json(
      { error: err.message ?? "internal error" },
      { status: 500 },
    );
  }
}
