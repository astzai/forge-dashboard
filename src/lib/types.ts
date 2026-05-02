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
