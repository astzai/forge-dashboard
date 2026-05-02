import type {
  CoachStyle,
  CookingFreq,
  DietStyle,
  ExperienceLevel,
  WorkType,
} from "./types";

export const DAYS = [
  "Maandag",
  "Dinsdag",
  "Woensdag",
  "Donderdag",
  "Vrijdag",
  "Zaterdag",
  "Zondag",
] as const;

export const DEFAULT_SCHEDULE: Record<
  string,
  { type: string; exercises: string; duration: number; time: string }
> = {
  Maandag: { type: "Push (Borst, Schouders, Triceps)", exercises: "Bench Press 4x8, Incline DB Press 3x10, Shoulder Press 3x10, Lateral Raises 3x12, Tricep Pushdowns 3x12", duration: 60, time: "18:00" },
  Dinsdag: { type: "Pull (Rug, Biceps)", exercises: "Deadlift 4x6, Pull-ups 4x8, Barbell Row 3x10, Face Pulls 3x12, Bicep Curls 3x12", duration: 60, time: "18:00" },
  Woensdag: { type: "Legs", exercises: "Squat 4x8, Romanian Deadlift 3x10, Leg Press 3x12, Calf Raises 4x15, Walking Lunges 3x12", duration: 60, time: "18:00" },
  Donderdag: { type: "Padel + Cardio", exercises: "1u Padel + 15min Zone 2 cardio na", duration: 75, time: "19:00" },
  Vrijdag: { type: "Upper Body", exercises: "Incline Bench 4x8, Lat Pulldown 4x10, DB Press 3x10, Cable Row 3x10, Arms Superset 3x12", duration: 60, time: "18:00" },
  Zaterdag: { type: "Legs + Core", exercises: "Front Squat 4x8, Leg Curl 3x12, Bulgarian Split Squat 3x10, Hanging Leg Raises 3x12, Plank 3x60s", duration: 60, time: "11:00" },
  Zondag: { type: "Rust", exercises: "Wandelen, stretchen, voorbereiden komende week", duration: 0, time: "-" },
};

export const SPORT_CALORIES = [
  { sport: "Krachttraining (zwaar)", perHour: 450, intensity: "Hoog" },
  { sport: "Krachttraining (matig)", perHour: 300, intensity: "Matig" },
  { sport: "Padel", perHour: 600, intensity: "Hoog" },
  { sport: "Hardlopen (10km/u)", perHour: 700, intensity: "Hoog" },
  { sport: "Hardlopen (rustig)", perHour: 500, intensity: "Matig" },
  { sport: "Fietsen (matig)", perHour: 480, intensity: "Matig" },
  { sport: "HIIT", perHour: 750, intensity: "Zeer hoog" },
  { sport: "Zwemmen", perHour: 550, intensity: "Hoog" },
  { sport: "Wandelen (stevig)", perHour: 280, intensity: "Laag" },
  { sport: "Boksen", perHour: 700, intensity: "Hoog" },
  { sport: "CrossFit", perHour: 700, intensity: "Zeer hoog" },
  { sport: "Yoga", perHour: 200, intensity: "Laag" },
];

export const CLAUDE_MODEL = "claude-sonnet-4-20250514";

// ====== Onboarding option lists ======

export const SPORTS: string[] = [
  "Krachttraining",
  "Padel",
  "Tennis",
  "Hardlopen",
  "Fietsen",
  "Zwemmen",
  "Voetbal",
  "Boksen",
  "CrossFit",
  "Yoga / Pilates",
  "Wandelen",
  "Klimmen",
];

export const COMMON_INTOLERANCES: string[] = [
  "Lactose",
  "Gluten",
  "Noten",
  "Schaaldieren",
  "Eieren",
  "Soja",
];

export const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string; desc: string }[] = [
  { value: "beginner", label: "Beginner", desc: "<1 jaar consistent trainen" },
  { value: "intermediate", label: "Intermediate", desc: "1-3 jaar consistent trainen" },
  { value: "advanced", label: "Advanced", desc: "3+ jaar consistent trainen" },
];

export const DIET_STYLES: { value: DietStyle; label: string }[] = [
  { value: "omnivore", label: "Omnivoor (alles)" },
  { value: "vegetarian", label: "Vegetarisch" },
  { value: "vegan", label: "Vegan" },
  { value: "pescatarian", label: "Pescatarisch (vis ja, vlees nee)" },
  { value: "keto", label: "Keto / low-carb" },
  { value: "other", label: "Anders" },
];

export const COOKING_FREQS: { value: CookingFreq; label: string }[] = [
  { value: "rarely", label: "Zelden — meestal afhalen / kant-en-klaar" },
  { value: "sometimes", label: "Soms — 2-3x per week" },
  { value: "often", label: "Vaak — 4-5x per week" },
  { value: "almost_always", label: "Bijna altijd zelf koken" },
];

export const WORK_TYPES: { value: WorkType; label: string }[] = [
  { value: "sedentary", label: "Zittend (kantoor, <4000 stappen)" },
  { value: "mixed", label: "Gemengd (deels staan/lopen)" },
  { value: "active", label: "Actief (op de been, bouw/zorg)" },
  { value: "very_active", label: "Zeer actief (zware fysieke arbeid)" },
];

export const COACH_STYLES: { value: CoachStyle; label: string; desc: string }[] = [
  { value: "strict", label: "Streng", desc: "Direct, no-nonsense, harde feedback" },
  { value: "motivating", label: "Motiverend", desc: "Pushen, hyped, positief" },
  { value: "educational", label: "Educatief", desc: "Uitleg + waarom, leert je principes" },
  { value: "chill", label: "Chill", desc: "Relaxt, geduldig, sustainable focus" },
];
