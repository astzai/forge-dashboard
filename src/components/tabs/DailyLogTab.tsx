"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Sparkles } from "lucide-react";
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

  // Food photo recognition (CalAI-style)
  const [snappingFood, setSnappingFood] = useState(false);
  const [snapResult, setSnapResult] = useState<null | {
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence?: string;
  }>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const onSnapFood = async (file: File) => {
    setError(null);
    setSnappingFood(true);
    setSnapResult(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/analyze-food-photo", {
        method: "POST",
        body: fd,
      });
      if (res.status === 402) {
        setNeedsKey(true);
        return;
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "AI kon foto niet analyseren");
      }
      const data = await res.json();
      setSnapResult(data);
      // Append AI description to existing food field (or replace if empty)
      setFood((prev) =>
        prev.trim()
          ? `${prev}\n+ ${data.description} (~${data.calories} kcal, ${data.protein}g eiwit)`
          : `${data.description} (~${data.calories} kcal, ${data.protein}g eiwit)`,
      );
    } catch (e: any) {
      setError(`Foto analyse mislukt: ${e.message}`);
    } finally {
      setSnappingFood(false);
    }
  };

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
      if (false) {
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
    {
      // Always try AI feedback — server falls back to managed mode if no user key
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
        <div className="mb-4 space-y-3">
          {/* Food photo capture (CalAI-style) */}
          <div className="border border-orange-500/30 bg-orange-500/5 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h4 className="text-sm font-semibold text-stone-100 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-orange-400" /> Snap je
                  maaltijd
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  Maak een foto van je eten — AI herkent en schat kcal/macros.
                </p>
              </div>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={snappingFood}
                className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-stone-950 font-medium text-sm px-4 py-2 rounded-md flex items-center gap-1.5 flex-shrink-0"
              >
                <Camera size={14} />
                {snappingFood ? "Analyseren..." : "Foto"}
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onSnapFood(f);
                  e.target.value = "";
                }}
              />
            </div>
            {snapResult && (
              <div className="border-t border-orange-500/20 pt-3 mt-3">
                <p className="text-sm text-stone-100 font-medium mb-2">
                  {snapResult.description}
                  {snapResult.confidence && (
                    <span className="ml-2 text-xs text-stone-500">
                      ({snapResult.confidence} confidence)
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <MacroBadge label="Kcal" v={snapResult.calories} />
                  <MacroBadge label="Eiwit" v={snapResult.protein} unit="g" />
                  <MacroBadge label="Carbs" v={snapResult.carbs} unit="g" />
                  <MacroBadge label="Vet" v={snapResult.fat} unit="g" />
                </div>
                <p className="text-[11px] text-stone-500 mt-2">
                  ✓ Toegevoegd aan je voedingstekst hieronder. Pas aan als nodig.
                </p>
              </div>
            )}
          </div>

          <Field label="Wat heb je vandaag gegeten? (zo specifiek mogelijk)">
            <textarea
              value={food}
              onChange={(e) => setFood(e.target.value)}
              rows={5}
              placeholder="Bijv: ontbijt - 4 eieren met 2 sneetjes brood. lunch - kipfilet 200g met rijst 150g. Of klik 'Foto' hierboven om AI te laten analyseren."
              className="w-full bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono text-sm focus:outline-none focus:border-orange-500 leading-relaxed"
            />
          </Field>
        </div>

        {false && (
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

      {feedback && <FeedbackCard feedback={feedback as any} />}
    </div>
  );
}

function FeedbackCard({ feedback }: { feedback: any }) {
  const sections = feedback.sections;
  return (
    <div className="space-y-4">
      <div className="border border-orange-500 bg-stone-950 rounded-lg p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1 h-full bg-orange-500" />
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center justify-center w-16 h-16 border-2 border-orange-500 bg-orange-500/10 rounded-md">
            <span className="text-2xl num font-medium text-orange-400">
              {feedback.score}
            </span>
          </div>
          <div>
            <div className="text-xs text-stone-500 font-medium">
              Cijfer voor vandaag
            </div>
            <div className="text-xs text-stone-500 mt-0.5">/ 10</div>
          </div>
        </div>
        <p className="text-stone-200 leading-relaxed mb-3">
          {feedback.feedback}
        </p>
        {feedback.trend_context && (
          <p className="text-sm text-stone-400 italic mb-3">
            {feedback.trend_context}
          </p>
        )}
        <div className="border-l-2 border-orange-500 pl-3 mt-3">
          <div className="text-xs text-stone-500 font-medium mb-1">
            Voor morgen
          </div>
          <p className="text-orange-300 leading-relaxed">
            → {feedback.tomorrow}
          </p>
        </div>
      </div>

      {sections && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["voeding", "training", "herstel", "consistency"] as const).map(
            (k) => {
              const s = sections[k];
              if (!s) return null;
              const score = Number(s.score) || 0;
              const color =
                score >= 8
                  ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/5"
                  : score >= 5
                    ? "text-orange-400 border-orange-500/40 bg-orange-500/5"
                    : "text-red-400 border-red-500/40 bg-red-500/5";
              return (
                <div
                  key={k}
                  className={`border rounded-lg p-4 ${color.split(" ").slice(1).join(" ")}`}
                >
                  <div className="flex items-baseline justify-between mb-1.5">
                    <div className="text-xs text-stone-300 font-medium capitalize">
                      {k}
                    </div>
                    <div className={`num text-lg font-medium ${color.split(" ")[0]}`}>
                      {score}
                    </div>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {s.note}
                  </p>
                </div>
              );
            },
          )}
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

function MacroBadge({
  label,
  v,
  unit,
}: {
  label: string;
  v: number;
  unit?: string;
}) {
  return (
    <div className="bg-stone-900/60 border border-white/5 rounded-md px-2 py-1.5">
      <div className="text-[10px] text-stone-500">{label}</div>
      <div className="hero-num text-base text-stone-100">
        {v}
        {unit && <span className="text-[10px] text-stone-500 ml-0.5">{unit}</span>}
      </div>
    </div>
  );
}
