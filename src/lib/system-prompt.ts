import type {
  Profile,
  DailyLog,
  CoachStyle,
  WeeklyReport,
} from "./types";

const COACH_STYLE_INSTRUCTIONS: Record<CoachStyle, string> = {
  strict:
    "Je toon: streng, direct, no-nonsense. Geen complimenten tenzij echt verdiend. Hard maar fair.",
  motivating:
    "Je toon: motiverend, hyped, positief. Push de athlete vooruit. Vier kleine wins.",
  educational:
    "Je toon: educatief. Leg altijd het waarom achter advies uit. Onderwijs principes, niet alleen recepten.",
  chill:
    "Je toon: chill, geduldig, sustainable focus. Niet pushen op korte termijn, focus op lange termijn gewoontes.",
};

function fmtDietStyle(p: Profile): string {
  const map: Record<string, string> = {
    omnivore: "omnivoor",
    vegetarian: "vegetarisch",
    vegan: "vegan",
    pescatarian: "pescatarisch",
    keto: "keto/low-carb",
    other: "anders",
  };
  return map[p.diet_style] ?? p.diet_style;
}

function fmtCookingFreq(p: Profile): string {
  const map: Record<string, string> = {
    rarely: "kookt zelden zelf (afhalen/kant-en-klaar)",
    sometimes: "kookt 2-3x/week zelf",
    often: "kookt 4-5x/week zelf",
    almost_always: "kookt bijna altijd zelf",
  };
  return map[p.cooking_freq] ?? p.cooking_freq;
}

function fmtWorkType(p: Profile): string {
  const map: Record<string, string> = {
    sedentary: "zittend kantoorwerk",
    mixed: "deels zittend, deels actief werk",
    active: "actief werk (op de been)",
    very_active: "zwaar fysiek werk",
  };
  return map[p.work_type] ?? p.work_type;
}

function avg(nums: number[]): number | null {
  const valid = nums.filter((n) => typeof n === "number" && !isNaN(n) && n > 0);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function trend(nums: number[]): "up" | "down" | "flat" | null {
  const valid = nums.filter((n) => typeof n === "number" && !isNaN(n));
  if (valid.length < 4) return null;
  const half = Math.floor(valid.length / 2);
  const first = valid.slice(0, half);
  const second = valid.slice(half);
  const a = first.reduce((s, x) => s + x, 0) / first.length;
  const b = second.reduce((s, x) => s + x, 0) / second.length;
  const diff = b - a;
  if (Math.abs(diff) < 0.15) return "flat";
  return diff > 0 ? "up" : "down";
}

/**
 * Compute aggregate stats over the last N days of logs.
 */
function computeTrends(logs: DailyLog[]) {
  if (logs.length === 0) return null;

  // Sort ascending by date
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const last30 = sorted.slice(-30);
  const last7 = sorted.slice(-7);

  const weights = last30.map((l) => l.weight as number).filter((n) => !!n);
  const weightsLast7 = last7.map((l) => l.weight as number).filter((n) => !!n);
  const cals = last7.map((l) => l.calories || 0);
  const proteins = last7.map((l) => l.protein || 0);
  const steps = last7.map((l) => l.steps || 0);

  const sportSessions7 = last7.filter(
    (l) => l.sport && l.sport.toLowerCase() !== "rust" && l.sport.length > 0,
  ).length;
  const loggedDays7 = last7.filter(
    (l) => (l.calories || 0) > 0 || l.weight !== null,
  ).length;

  return {
    weightTrend: trend(weights),
    weightDelta30:
      weights.length >= 2
        ? Math.round((weights[weights.length - 1] - weights[0]) * 10) / 10
        : null,
    weightAvg7:
      weightsLast7.length > 0
        ? Math.round((avg(weightsLast7) ?? 0) * 10) / 10
        : null,
    avgCals7: cals.some((c) => c > 0) ? Math.round(avg(cals) ?? 0) : null,
    avgProtein7: proteins.some((p) => p > 0)
      ? Math.round(avg(proteins) ?? 0)
      : null,
    avgSteps7: steps.some((s) => s > 0) ? Math.round(avg(steps) ?? 0) : null,
    sportSessions7,
    loggedDays7,
    consistency7: Math.round((loggedDays7 / 7) * 100),
  };
}

export function buildSystemPrompt(
  profile: Profile,
  recentLogs: DailyLog[],
  weeklyReports: WeeklyReport[] = [],
) {
  const tone =
    COACH_STYLE_INSTRUCTIONS[profile.coach_style] ??
    COACH_STYLE_INSTRUCTIONS.motivating;

  // ====== PROFILE-derived strings ======
  const sportsList = profile.preferred_sports?.length
    ? profile.preferred_sports.join(", ")
    : "geen specifieke voorkeur";
  const intolerancesList = profile.intolerances?.length
    ? profile.intolerances.join(", ")
    : "geen";
  const timelineLine = profile.target_weeks
    ? `Tijdslijn doel: binnen ${profile.target_weeks} weken`
    : "Tijdslijn doel: niet gespecificeerd";
  const bodyLine = [
    profile.body_fat_pct ? `vetpercentage ~${profile.body_fat_pct}%` : null,
    profile.waist_cm ? `taille ${profile.waist_cm}cm` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const focusList = profile.focus_areas?.length
    ? profile.focus_areas.join(", ")
    : "geen specifieke focus";
  const injuryList = profile.injuries?.length
    ? profile.injuries.join(", ")
    : "geen";
  const trainingDayList = profile.training_day_names?.length
    ? profile.training_day_names.join(", ")
    : `${profile.training_days}x/week (dagen niet gespecificeerd)`;
  const prs = profile.current_prs ?? {};
  const prsLine = prs.unknown
    ? "PR's onbekend"
    : `bench ${prs.bench ?? "?"} / squat ${prs.squat ?? "?"} / deadlift ${prs.deadlift ?? "?"} kg`;

  // ====== TRENDS over de laatste 30 / 7 dagen ======
  const trends = computeTrends(recentLogs);
  const trendArrow = (t: "up" | "down" | "flat" | null) =>
    t === "up" ? "↗" : t === "down" ? "↘" : t === "flat" ? "→" : "—";

  const trendBlock = trends
    ? `
TRENDS (laatste 7 dagen tenzij anders):
- Gewichts-trend ${trendArrow(trends.weightTrend)} ${trends.weightTrend ?? "te weinig data"} (delta laatste 30d: ${trends.weightDelta30 !== null ? `${trends.weightDelta30 > 0 ? "+" : ""}${trends.weightDelta30}kg` : "—"})
- Gewicht 7-daags gemiddelde: ${trends.weightAvg7 ? `${trends.weightAvg7}kg` : "—"}
- Calorieën avg: ${trends.avgCals7 ?? "—"} kcal/dag
- Eiwit avg: ${trends.avgProtein7 ?? "—"}g/dag (doel ~${Math.round(profile.current_weight * 1.8)}g voor ${profile.current_weight}kg)
- Stappen avg: ${trends.avgSteps7 ?? "—"}/dag
- Sport-sessies: ${trends.sportSessions7}/7 dagen
- Logging-consistency: ${trends.consistency7}% (${trends.loggedDays7}/7 dagen ingevuld)
`.trim()
    : "TRENDS: nog geen logs om uit te rekenen.";

  // ====== Laatste 30 dagen — compacte regels ======
  const last30 = [...recentLogs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  const logLines = last30
    .map((l) => {
      const parts = [
        l.date,
        l.weight ? `${l.weight}kg` : null,
        l.steps ? `${l.steps}st` : null,
        l.sport
          ? `sport: ${l.sport}${l.sport_duration ? ` ${l.sport_duration}min` : ""}`
          : "rust",
        l.calories ? `${l.calories}kcal` : null,
        l.protein ? `${l.protein}gE` : null,
        l.carbs ? `${l.carbs}gK` : null,
        l.fat ? `${l.fat}gV` : null,
      ]
        .filter(Boolean)
        .join(" · ");
      return `  ${parts}${l.food ? ` — voeding: ${l.food.slice(0, 80)}` : ""}`;
    })
    .join("\n");

  // ====== Vorige feedback van coach (voor zelf-continuïteit) ======
  const recentFeedback = last30
    .filter((l) => l.feedback && l.feedback.feedback)
    .slice(-5)
    .map((l) => {
      const f = l.feedback!;
      return `  ${l.date} (score ${f.score}/10): "${f.feedback}" → morgen: ${f.tomorrow}`;
    })
    .join("\n");

  // ====== Weekly reports — laatste 4 ======
  const recentReports = [...weeklyReports]
    .sort((a, b) => a.week_start.localeCompare(b.week_start))
    .slice(-4)
    .map((r) => {
      const rpt = r.report;
      const wins = (rpt.wins || []).slice(0, 2).join("; ");
      const misses = (rpt.misses || []).slice(0, 2).join("; ");
      return `  Week ${r.week_start}: ${rpt.summary?.slice(0, 120) || ""} | wins: ${wins || "—"} | misses: ${misses || "—"} | next focus: ${rpt.next_week_focus?.slice(0, 80) || "—"}`;
    })
    .join("\n");

  return `Je bent een persoonlijke fitness coach voor ${profile.name}. Antwoord ALTIJD in het Nederlands. Hou antwoorden kort en concreet (max 6-8 zinnen tenzij het echt moet). Verwijs naar concrete getallen uit de data hieronder als dat past — dan voelt advies persoonlijk en geloofwaardig.

${tone}

PROFIEL:
- Lengte: ${profile.height}cm, Gewicht nu: ${profile.current_weight}kg, Doel: ${profile.target_weight}kg. Start was ${profile.start_weight}kg.
- ${timelineLine}
${bodyLine ? `- Lichaam: ${bodyLine}` : ""}
- Hoofddoel: ${profile.goal}
- Werk: ${fmtWorkType(profile)}
- Slaap: ${profile.sleep_hours}u gemiddeld, stress: ${profile.stress_level}

TRAINING:
- Ervaring: ${profile.experience_level}
- Training-doel: ${profile.training_goal ?? "niet gespecificeerd"}
- Voorkeurs-split: ${profile.split_preference ?? "geen voorkeur"}
- Sporten: ${sportsList}
- Focuspunten: ${focusList}
- Cardio: ${profile.cardio_preference ?? "—"}
- Equipment: ${profile.equipment ?? "—"}
- Trainingsdagen: ${trainingDayList}, ${profile.session_minutes ?? 60} min per sessie, voorkeur ${profile.time_of_day ?? "flexibel"}
- Blessures: ${injuryList}${profile.injury_notes ? ` (${profile.injury_notes})` : ""}
- Haat: ${profile.hated_exercises || "—"}
- Huidige PR's: ${prsLine}
- Andere activiteiten: ${profile.other_activities || "—"}

VOEDING:
- ${fmtDietStyle(profile)}, ${fmtCookingFreq(profile)}
- Intoleranties: ${intolerancesList}
- Drinkt: ${profile.drinks || "niet gespecificeerd"}

EXTRA NOTES: ${profile.notes || "—"}

${trendBlock}

LOGS LAATSTE 30 DAGEN (st=stappen, gE=eiwit, gK=koolh, gV=vet):
${logLines || "  (nog geen logs)"}

VORIGE COACH-FEEDBACK (jouw eigen woorden — wees consistent, herhaal niet zonder reden):
${recentFeedback || "  (nog geen feedback gegeven)"}

VORIGE WEEKRAPPORTEN:
${recentReports || "  (nog geen weekrapporten)"}

REGELS:
- Wees concreet met getallen uit bovenstaande data.
- Vermijd oefeningen die de athlete haat of die conflicteren met blessures.
- Houd rekening met dieet/intoleranties bij voedingstips.
- Als de gebruiker iets vraagt over voortgang ("hoe ga ik?"), ankerpunt = trend + delta30 + consistency.
- Spreek jezelf niet tegen met eerdere feedback — bouw daarop voort of leg uit waarom advies verandert.`;
}
