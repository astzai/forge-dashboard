"use client";

import { CalculatorTab } from "@/components/tabs/CalculatorTab";
import { SportBurnTab } from "@/components/tabs/SportBurnTab";
import type { Profile } from "@/lib/types";

/**
 * Combined calorieën-tab: BMR/TDEE calculator + sport-burn tabel.
 */
export function CalorieenTab({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-1">
          Calorieën calculator
        </h2>
        <p className="text-sm text-stone-400 mb-5">
          Bereken je BMR, TDEE en macro-doelen.
        </p>
        <CalculatorTab profile={profile} />
      </div>

      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-1">
          Sport calorieën
        </h2>
        <p className="text-sm text-stone-400 mb-5">
          Verbruik per sport, aangepast aan jouw gewicht.
        </p>
        <SportBurnTab profile={profile} />
      </div>
    </div>
  );
}
