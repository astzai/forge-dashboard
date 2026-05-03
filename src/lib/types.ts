export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type DietStyle =
  | "omnivore"
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "keto"
  | "other";
export type CookingFreq = "rarely" | "sometimes" | "often" | "almost_always";
export type WorkType = "sedentary" | "mixed" | "active" | "very_active";
export type CoachStyle = "strict" | "motivating" | "educational" | "chill";

// Training-specifieke types
export type TrainingGoal =
  | "muscle_gain"
  | "strength"
  | "fatloss_keep_muscle"
  | "sport_performance"
  | "general_fitness";
export type SplitPreference =
  | "ppl"
  | "upper_lower"
  | "full_body"
  | "bro_split"
  | "no_preference";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "flexible";
export type CardioPreference =
  | "hiit"
  | "zone2"
  | "steady"
  | "minimal"
  | "sport_is_cardio"
  | "mixed";
export type Equipment =
  | "full_gym"
  | "home_gym"
  | "dumbbells_only"
  | "bodyweight"
  | "outdoor";
export type CurrentPRs = {
  bench?: number | null;
  squat?: number | null;
  deadlift?: number | null;
  unknown?: boolean;
};

export type Profile = {
  user_id: string;
  name: string;
  height: number;
  start_weight: number;
  current_weight: number;
  target_weight: number;
  age: number;
  gender: "male" | "female";
  goal: string;
  training_days: number;
  sleep_hours: number;
  stress_level: string;
  notes: string;

  // New extended fields (all optional / sane defaults)
  body_fat_pct: number | null;
  waist_cm: number | null;
  target_weeks: number | null;
  experience_level: ExperienceLevel;
  preferred_sports: string[];
  diet_style: DietStyle;
  intolerances: string[];
  cooking_freq: CookingFreq;
  drinks: string;
  work_type: WorkType;
  coach_style: CoachStyle;

  // Trainings-detail (uitgebreid voor AI schema-generatie)
  training_goal: TrainingGoal;
  split_preference: SplitPreference;
  training_day_names: string[];
  session_minutes: number;
  time_of_day: TimeOfDay;
  focus_areas: string[];
  cardio_preference: CardioPreference;
  equipment: Equipment;
  injuries: string[];
  injury_notes: string;
  hated_exercises: string;
  current_prs: CurrentPRs;
  other_activities: string;

  has_anthropic_key: boolean;
  onboarded?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type FoodItem = {
  name: string;
  kcal: number;
  protein: number;
};

export type Feedback = {
  score: number;
  feedback: string;
  tomorrow: string;
};

export type DailyLog = {
  id?: string;
  user_id?: string;
  date: string;
  weight: number | null;
  steps: number;
  sport: string;
  sport_duration: number;
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  food_items: FoodItem[];
  feedback: Feedback | null;
  created_at?: string;
};

export type ScheduleEntry = {
  id?: string;
  user_id?: string;
  day: string;
  type: string;
  exercises: string;
  duration: number;
  time: string;
};

export type ChatMessage = {
  id?: string;
  user_id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
};

export type PhotoAngle = "front" | "side" | "back";

export type ProgressPhoto = {
  id?: string;
  user_id?: string;
  check_in_date: string;
  angle: PhotoAngle;
  storage_path: string;
  created_at?: string;
};

export type PhotoAssessment = {
  id?: string;
  user_id?: string;
  check_in_date: string;
  assessment: {
    summary: string;
    observations: string[];
    focus_areas: string[];
    motivation: string;
  };
  created_at?: string;
};

// Richer daily feedback structure (replaces simple Feedback above for new logs)
export type RichFeedback = {
  // Backwards-compat fields:
  score: number;
  feedback: string;
  tomorrow: string;
  // New fields:
  sections?: {
    voeding: { score: number; note: string };
    training: { score: number; note: string };
    herstel: { score: number; note: string };
    consistency: { score: number; note: string };
  };
  trend_context?: string;
};

export type WeeklyReport = {
  id?: string;
  user_id?: string;
  week_start: string;
  report: {
    summary: string;
    weight_change_kg: number | null;
    avg_calories: number | null;
    avg_protein: number | null;
    sport_count: number;
    avg_sleep: number | null;
    wins: string[];
    misses: string[];
    next_week_focus: string;
    photo_observation?: string;
  };
  created_at?: string;
};
