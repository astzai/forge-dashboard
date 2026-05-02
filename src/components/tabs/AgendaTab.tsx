"use client";

import { useState } from "react";
import { Calendar, ChevronRight } from "lucide-react";
import type { DailyLog } from "@/lib/types";

export function AgendaTab({ logs }: { logs: DailyLog[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) {
    return (
      <div className="border border-stone-800 bg-stone-950 p-12 text-center">
        <Calendar size={32} className="text-stone-700 mx-auto mb-3" />
        <p className="text-stone-500 font-mono text-sm">
          Nog geen logs. Vul je dagelijkse log in om hier te zien.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((log) => {
        const isOpen = expanded === log.date;
        const dateObj = new Date(log.date);
        const dayName = dateObj.toLocaleDateString("nl-NL", { weekday: "long" });
        const dateFmt = dateObj.toLocaleDateString("nl-NL", {
          day: "numeric",
          month: "short",
        });
        return (
          <div key={log.date} className="border border-stone-800 bg-stone-950">
            <button
              onClick={() => setExpanded(isOpen ? null : log.date)}
              className="w-full p-4 flex items-center justify-between hover:bg-stone-900/50 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-stone-600 font-mono">
                    {dayName}
                  </div>
                  <div className="text-sm text-stone-200 font-light">{dateFmt}</div>
                </div>
                <div className="hidden md:flex gap-4 text-xs font-mono">
                  {log.weight && (
                    <span className="text-stone-400">{log.weight}kg</span>
                  )}
                  {log.sport && (
                    <span className="text-orange-400">{log.sport}</span>
                  )}
                  {log.calories > 0 && (
                    <span className="text-stone-500">{log.calories} kcal</span>
                  )}
                  {log.protein > 0 && (
                    <span className="text-stone-500">{log.protein}g eiwit</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {log.feedback && (
                  <div className="text-xs font-mono text-orange-400">
                    {log.feedback.score}/10
                  </div>
                )}
                <ChevronRight
                  size={14}
                  className={`text-stone-600 transition-transform ${
                    isOpen ? "rotate-90" : ""
                  }`}
                />
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-stone-800 p-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                  <Cell label="Gewicht" value={log.weight ? `${log.weight} kg` : "—"} />
                  <Cell label="Stappen" value={log.steps || "—"} />
                  <Cell label="Calorieën" value={log.calories || "—"} />
                  <Cell label="Eiwit" value={log.protein ? `${log.protein}g` : "—"} />
                </div>
                {log.sport && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
                      Training
                    </div>
                    <div className="text-stone-300">
                      {log.sport}
                      {log.sport_duration ? ` · ${log.sport_duration}min` : ""}
                    </div>
                  </div>
                )}
                {log.food && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
                      Voeding
                    </div>
                    <div className="text-stone-400 leading-relaxed text-xs whitespace-pre-wrap">
                      {log.food}
                    </div>
                  </div>
                )}
                {log.feedback && (
                  <div className="border-l-2 border-orange-500 pl-3 mt-2">
                    <div className="text-[10px] uppercase tracking-wider text-orange-400 font-mono">
                      Coach feedback
                    </div>
                    <p className="text-stone-300 mt-1 text-xs leading-relaxed">
                      {log.feedback.feedback}
                    </p>
                    {log.feedback.tomorrow && (
                      <p className="text-orange-300 mt-1 text-xs leading-relaxed">
                        → {log.feedback.tomorrow}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-stone-600">
        {label}
      </div>
      <div className="text-stone-200">{value}</div>
    </div>
  );
}
