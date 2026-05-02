"use client";

import { useState } from "react";
import { SPORT_CALORIES } from "@/lib/constants";
import type { Profile } from "@/lib/types";

export function SportBurnTab({ profile }: { profile: Profile }) {
  const [duration, setDuration] = useState(60);
  const weightFactor = profile.current_weight / 75;

  return (
    <div className="space-y-6">
      <div className="border border-stone-800 bg-stone-950 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-mono">
              Calorieverbruik per sport
            </h3>
            <p className="text-xs text-stone-600 mt-1 font-mono">
              Aangepast aan jouw {profile.current_weight}kg
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
              Duur
            </span>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(+e.target.value)}
              className="w-20 bg-stone-900 border border-stone-800 px-3 py-1.5 text-stone-200 font-mono text-sm focus:outline-none focus:border-orange-500"
            />
            <span className="text-xs text-stone-500 font-mono">min</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-800">
                <th className="text-left text-[10px] uppercase tracking-wider text-stone-600 font-mono py-3">
                  Sport
                </th>
                <th className="text-left text-[10px] uppercase tracking-wider text-stone-600 font-mono py-3">
                  Intensiteit
                </th>
                <th className="text-right text-[10px] uppercase tracking-wider text-stone-600 font-mono py-3">
                  Per uur
                </th>
                <th className="text-right text-[10px] uppercase tracking-wider text-stone-600 font-mono py-3">
                  Jouw {duration}min
                </th>
              </tr>
            </thead>
            <tbody>
              {SPORT_CALORIES.map((s, i) => {
                const adjusted = Math.round(
                  s.perHour * weightFactor * (duration / 60),
                );
                return (
                  <tr
                    key={i}
                    className="border-b border-stone-900 hover:bg-stone-900/50 transition-colors"
                  >
                    <td className="py-3 text-stone-200 text-sm">{s.sport}</td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 ${
                          s.intensity === "Zeer hoog"
                            ? "bg-orange-500/20 text-orange-400"
                            : s.intensity === "Hoog"
                              ? "bg-orange-500/10 text-orange-400"
                              : s.intensity === "Matig"
                                ? "bg-stone-800 text-stone-400"
                                : "bg-stone-900 text-stone-500"
                        }`}
                      >
                        {s.intensity}
                      </span>
                    </td>
                    <td className="py-3 text-right text-stone-400 font-mono text-sm">
                      {Math.round(s.perHour * weightFactor)} kcal
                    </td>
                    <td className="py-3 text-right text-orange-400 font-mono text-sm font-medium">
                      {adjusted} kcal
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
