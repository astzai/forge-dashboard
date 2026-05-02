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
  has_anthropic_key: boolean;
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
