"use client";

import { useEffect, useState } from "react";
import { upsertLog } from "@/lib/db";
import { NoApiKeyBanner } from "@/components/NoApiKeyBanner";
import type { DailyLog, Feedback, Profile } from "@/lib/types";

export function DailyLogTab({
  logs,
  onSaved,
  profile,
}: {
  logs: DailyLog[];
  onSaved: (log: DailyLog) => void;
  profile: Profile;
}) {
  const today = new Date().toISOString().split("T")[0];
  const existing = logs.find((l) => l.date === today);

  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState<string>(
    existing?.weight ? String(existing.weight) : "",
  );
  const [steps, setSteps] = useState<string>(
    existing?.steps ? String(existing.steps) : "",
  );
  const [sport, setSport] = useState(existing?.sport ?? "");
  const [sportDuration, setSportDuration] = useState<string>(
    existing?.sport_duration ? String(existing.sport_duration) : "",
  );
  const [food, setFood] = useState(existing?.food ?? "");
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(
    existing?.feedback ?? null,
  );
  const [analyzingFeedback, setAnalyzingFeedback] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const e = logs.find((l) => l.date === date);
    if (!e) {
      setWeight("");
      setSteps("");
      setSport("");
      setSportDuration("");
      setFood("");
      setFeedback(null);
      return;
    }
    setWeight(e.weight ? String(e.weight) : "");
    setSteps(e.steps ? String(e.steps) : "");
    setSport(e.sport ?? "");
    setSportDuration(e.sport_duration ? String(e.sport_duration) : "");
    setFood(e.food ?? "");
    setFeedback(e.feedback ?? null);
  }, [date, logs]);

  const submitLog = async () => {
    setError(null);
    let nutrition: any = null;

    if (food.trim()) {
      if (!profile.has_anthropic_key) {
        setNeedsKey(true);
        return;
      }
      setAnalyzing(true);
      try {
        const res = await fetch("/api/analyze-food", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ food }),
        });
        if (res.status === 402) {
          setNeedsKey(true);
          setAnalyzing(false);
          return;
        }
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || "Voedinganalyse mislukt");
        }
        nutrition = await res.json();
      } catch (e: any) {
        setError(e.message);
        setAnalyzing(false);
        return;
      }
      setAnalyzing(false);
    }

    const calories = nutrition?.calories || 0;
    const protein = nutrition?.protein || 0;

    let fb: Feedback | null = null;
    if (profile.has_anthropic_key) {
      setAnalyzingFeedback(true);
      try {
        const res = await fetch("/api/daily-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date,
            weight: weight ? parseFloat(weight) : null,
            steps: steps ? parseInt(steps) : 0,
            sport,
            sport_duration: sportDuration ? parseInt(sportDuration) : 0,
            food,
            calories,
            protein,
          }),
        });
        if (res.status === 402) {
          setNeedsKey(true);
          setAnalyzingFeedback(false);
          return;
        }
        if (res.ok) {
          fb = (await res.json()) as Feedback;
        }
      } catch {
        /* non-fatal */
      }
      setAnalyzingFeedback(false);
    }

    const newLog: DailyLog = {
      date,
      weight: weight ? parseFloat(weight) : null,
      steps: steps ? parseInt(steps) : 0,
      sport,
      sport_duration: sportDuration ? parseInt(sportDuration) : 0,
      food,
      calories,
      protein,
      carbs: nutrition?.carbs || 0,
      fat: nutrition?.fat || 0,
      food_items: nutrition?.items || [],
      feedback: fb,
    };

    try {
      await upsertLog(newLog);
      setFeedback(fb);
      onSaved(newLog);
    } catch (e: any) {
      setError(`Opslaan mislukt: ${e.message}`);
    }
  };

  if (needsKey) return <NoApiKeyBanner />;

  return (
    <div className="space-y-6">
      <div className="border border-stone-800 bg-stone-950 p-6">
        <h3 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-mono mb-6">
          Dagelijkse log
        </h3>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <Field label="Datum">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono focus:outline-none focus:border-orange-500"
            />
          </Field>
          <Field label="Ochtendgewicht (kg)">
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="105.0"
              className="w-full bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono focus:outline-none focus:border-orange-500"
            />
          </Field>
          <Field label="Stappen">
            <input
              type="number"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder="3500"
              className="w-full bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono focus:outline-none focus:border-orange-500"
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Sport">
              <input
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                placeholder="Push, Padel..."
                className="w-full bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono focus:outline-none focus:border-orange-500"
              />
            </Field>
            <Field label="Min">
              <input
                type="number"
                value={sportDuration}
                onChange={(e) => setSportDuration(e.target.value)}
                placeholder="60"
                className="w-full bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono focus:outline-none focus:border-orange-500"
              />
            </Field>
          </div>
        </div>
        <div className="mb-4">
          <Field label="Wat heb je vandaag gegeten? (zo specifiek mogelijk)">
            <textarea
              value={food}
              onChange={(e) => setFood(e.target.value)}
              rows={5}
              placeholder="Bijv: ontbijt - 4 eieren met 2 sneetjes brood. lunch - kipfilet 200g met rijst 150g. diner - pasta bolognese met 200g rundergehakt. snacks - 1 banaan, 30g amandelen, 2 monster zero"
              className="w-full bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono text-sm focus:outline-none focus:border-orange-500 leading-relaxed"
            />
          </Field>
        </div>

        {!profile.has_anthropic_key && (
          <p className="text-xs text-stone-500 font-mono mb-3">
            Geen API key — log wordt zonder voedingsanalyse en feedback opgeslagen.
          </p>
        )}

        {error && (
          <p className="text-xs text-orange-400 font-mono mb-3">{error}</p>
        )}

        <button
          onClick={submitLog}
          disabled={analyzing || analyzingFeedback}
          className="w-full bg-orange-500 text-stone-950 py-3 font-mono uppercase tracking-[0.2em] text-xs hover:bg-orange-400 transition-colors disabled:opacity-50"
        >
          {analyzing
            ? "Eten analyseren..."
            : analyzingFeedback
              ? "Feedback genereren..."
              : "Log opslaan & feedback krijgen"}
        </button>
      </div>

      {feedback && (
        <div className="border border-orange-500 bg-stone-950 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 h-full bg-orange-500" />
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-16 h-16 border-2 border-orange-500 bg-orange-500/10">
              <span className="text-2xl font-light text-orange-400">
                {feedback.score}
              </span>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-mono">
                Cijfer voor vandaag
              </div>
              <div className="text-xs text-stone-400 font-mono mt-1">/ 10</div>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-600 font-mono mb-1">
                Feedback
              </div>
              <p className="text-stone-200 leading-relaxed">{feedback.feedback}</p>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-600 font-mono mb-1">
                Voor morgen
              </div>
              <p className="text-orange-300 leading-relaxed">
                → {feedback.tomorrow}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
