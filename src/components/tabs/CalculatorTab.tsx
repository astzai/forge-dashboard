"use client";

import { useState } from "react";
import { Activity, Dumbbell, Flame, Target } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import type { Profile } from "@/lib/types";

export function CalculatorTab({ profile }: { profile: Profile }) {
  const [weight, setWeight] = useState(profile.current_weight);
  const [height, setHeight] = useState(profile.height);
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState<"male" | "female">(profile.gender);
  const [activity, setActivity] = useState<keyof typeof multipliers>("moderate");
  const [goal, setGoal] = useState<"cut" | "maintain" | "bulk">("cut");

  const bmr =
    gender === "male"
      ? Math.round(10 * weight + 6.25 * height - 5 * age + 5)
      : Math.round(10 * weight + 6.25 * height - 5 * age - 161);

  const tdee = Math.round(bmr * multipliers[activity]);
  const calorieTarget =
    goal === "cut" ? tdee - 500 : goal === "bulk" ? tdee + 300 : tdee;
  const protein = Math.round(weight * 2);
  const fat = Math.round(weight * 0.8);
  const carbs = Math.round((calorieTarget - protein * 4 - fat * 9) / 4);

  return (
    <div className="space-y-6">
      <div className="border border-stone-800 bg-stone-950 p-6">
        <h3 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-mono mb-6">
          Berekening — Mifflin-St Jeor
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Input label="Gewicht (kg)" value={weight} onChange={setWeight} />
          <Input label="Lengte (cm)" value={height} onChange={setHeight} />
          <Input label="Leeftijd" value={age} onChange={setAge} />
          <div>
            <label className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
              Geslacht
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as "male" | "female")}
              className="w-full mt-1 bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono focus:outline-none focus:border-orange-500"
            >
              <option value="male">Man</option>
              <option value="female">Vrouw</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
              Activiteit
            </label>
            <select
              value={activity}
              onChange={(e) =>
                setActivity(e.target.value as keyof typeof multipliers)
              }
              className="w-full mt-1 bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono focus:outline-none focus:border-orange-500"
            >
              <option value="sedentary">Zittend (geen sport)</option>
              <option value="light">Licht (1-3x sport/week)</option>
              <option value="moderate">Matig (3-5x sport/week)</option>
              <option value="high">Hoog (6-7x sport/week)</option>
              <option value="veryHigh">Zeer hoog (2x/dag)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
              Doel
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as any)}
              className="w-full mt-1 bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono focus:outline-none focus:border-orange-500"
            >
              <option value="cut">Cut (-500 kcal)</option>
              <option value="maintain">Onderhoud</option>
              <option value="bulk">Bulk (+300 kcal)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="BMR" value={bmr} unit="kcal" icon={Flame} />
        <StatCard label="TDEE" value={tdee} unit="kcal" icon={Activity} />
        <StatCard label="Doel" value={calorieTarget} unit="kcal" icon={Target} accent />
        <StatCard label="Eiwit" value={protein} unit="g" icon={Dumbbell} />
      </div>

      <div className="border border-stone-800 bg-stone-950 p-6">
        <h3 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-mono mb-4">
          Macro verdeling
        </h3>
        <div className="space-y-4">
          <Macro
            label="Eiwit"
            grams={protein}
            kcal={protein * 4}
            target={calorieTarget}
            opacityClass=""
          />
          <Macro
            label="Vet"
            grams={fat}
            kcal={fat * 9}
            target={calorieTarget}
            opacityClass="opacity-70"
          />
          <Macro
            label="Koolhydraten"
            grams={carbs}
            kcal={carbs * 4}
            target={calorieTarget}
            opacityClass="opacity-40"
          />
        </div>
      </div>
    </div>
  );
}

const multipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  veryHigh: 1.9,
};

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full mt-1 bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono focus:outline-none focus:border-orange-500"
      />
    </div>
  );
}

function Macro({
  label,
  grams,
  kcal,
  target,
  opacityClass,
}: {
  label: string;
  grams: number;
  kcal: number;
  target: number;
  opacityClass: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2 font-mono">
        <span className="text-stone-300">{label}</span>
        <span className="text-orange-400">
          {grams}g · {kcal} kcal
        </span>
      </div>
      <div className="h-2 bg-stone-900">
        <div
          className={`h-full bg-orange-500 ${opacityClass}`}
          style={{ width: `${(kcal / target) * 100}%` }}
        />
      </div>
    </div>
  );
}
