"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DAYS, DEFAULT_SCHEDULE } from "@/lib/constants";

type Step = 0 | 1 | 2;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile fields
  const [name, setName] = useState("");
  const [height, setHeight] = useState(180);
  const [startWeight, setStartWeight] = useState(80);
  const [targetWeight, setTargetWeight] = useState(75);
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [goal, setGoal] = useState("Vetverlies + spiermassa behouden");
  const [trainingDays, setTrainingDays] = useState(4);
  const [sleepHours, setSleepHours] = useState(7);
  const [stressLevel, setStressLevel] = useState("medium");
  const [notes, setNotes] = useState("");

  // API key
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      const meta = data.user.user_metadata as any;
      if (meta?.name) setName(meta.name);
    })();
  }, [router]);

  const saveProfile = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      router.replace("/login");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        height,
        start_weight: startWeight,
        current_weight: startWeight,
        target_weight: targetWeight,
        age,
        gender,
        goal,
        training_days: trainingDays,
        sleep_hours: sleepHours,
        stress_level: stressLevel,
        notes,
        onboarded: true,
      })
      .eq("user_id", auth.user.id);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Seed default schedule
    const rows = DAYS.map((day) => ({
      user_id: auth.user!.id,
      day,
      type: DEFAULT_SCHEDULE[day]?.type ?? "",
      exercises: DEFAULT_SCHEDULE[day]?.exercises ?? "",
      duration: DEFAULT_SCHEDULE[day]?.duration ?? 0,
      time: DEFAULT_SCHEDULE[day]?.time ?? "-",
    }));
    await supabase
      .from("training_schedule")
      .upsert(rows, { onConflict: "user_id,day" });

    setLoading(false);
    setStep(2);
  };

  const saveApiKey = async () => {
    setLoading(true);
    setError(null);
    if (!apiKey.trim()) {
      router.push("/dashboard");
      return;
    }
    const res = await fetch("/api/api-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: apiKey.trim() }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Kon key niet opslaan");
      return;
    }
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-stone-950 text-stone-200 py-10 px-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-orange-500 flex items-center justify-center">
            <Zap size={18} className="text-stone-950" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-display font-bold tracking-tight uppercase">
            FORGE
          </h1>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {[0, 1, 2].map((s) => (
            <div
              key={s}
              className={`w-10 h-1 ${
                step >= s ? "bg-orange-500" : "bg-stone-800"
              }`}
            />
          ))}
        </div>

        <div className="border border-stone-800 bg-stone-950 p-6">
          {step === 0 && (
            <>
              <h2 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-mono mb-2">
                Stap 1 — Wie ben je
              </h2>
              <p className="text-sm text-stone-400 mb-6">
                Basisinfo voor je profiel. Pas later altijd aan in settings.
              </p>
              <div className="space-y-4">
                <Field
                  label="Naam"
                  value={name}
                  onChange={(v) => setName(v as string)}
                  type="text"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Lengte (cm)"
                    value={height}
                    onChange={(v) => setHeight(+v)}
                    type="number"
                  />
                  <Field
                    label="Leeftijd"
                    value={age}
                    onChange={(v) => setAge(+v)}
                    type="number"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
                    Geslacht
                  </label>
                  <select
                    value={gender}
                    onChange={(e) =>
                      setGender(e.target.value as "male" | "female")
                    }
                    className="w-full mt-1 bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono focus:outline-none focus:border-orange-500"
                  >
                    <option value="male">Man</option>
                    <option value="female">Vrouw</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => setStep(1)}
                disabled={!name}
                className="w-full mt-6 bg-orange-500 text-stone-950 py-3 font-mono uppercase tracking-[0.2em] text-xs hover:bg-orange-400 disabled:opacity-30"
              >
                Volgende →
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-mono mb-2">
                Stap 2 — Doel & training
              </h2>
              <p className="text-sm text-stone-400 mb-6">
                Wat wil je bereiken en hoe traint hij/zij nu.
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Start gewicht (kg)"
                    value={startWeight}
                    onChange={(v) => setStartWeight(+v)}
                    type="number"
                  />
                  <Field
                    label="Doel gewicht (kg)"
                    value={targetWeight}
                    onChange={(v) => setTargetWeight(+v)}
                    type="number"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
                    Doel
                  </label>
                  <textarea
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    rows={2}
                    className="w-full mt-1 bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field
                    label="Training/week"
                    value={trainingDays}
                    onChange={(v) => setTrainingDays(+v)}
                    type="number"
                  />
                  <Field
                    label="Slaap (u)"
                    value={sleepHours}
                    onChange={(v) => setSleepHours(+v)}
                    type="number"
                  />
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
                      Stress
                    </label>
                    <select
                      value={stressLevel}
                      onChange={(e) => setStressLevel(e.target.value)}
                      className="w-full mt-1 bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono focus:outline-none focus:border-orange-500"
                    >
                      <option value="low">Laag</option>
                      <option value="medium">Middel</option>
                      <option value="medium-high">Middel-hoog</option>
                      <option value="high">Hoog</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
                    Notes (voor AI coach context)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Bijv: zit veel, padel 1x/week, drinkt regelmatig Monster Zero..."
                    className="w-full mt-1 bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              {error && (
                <p className="text-xs text-orange-400 font-mono mt-3">{error}</p>
              )}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setStep(0)}
                  className="px-5 border border-stone-800 text-stone-400 font-mono uppercase tracking-[0.2em] text-xs hover:border-orange-500/50"
                >
                  ← Terug
                </button>
                <button
                  onClick={saveProfile}
                  disabled={loading}
                  className="flex-1 bg-orange-500 text-stone-950 py-3 font-mono uppercase tracking-[0.2em] text-xs hover:bg-orange-400 disabled:opacity-30"
                >
                  {loading ? "..." : "Opslaan & door →"}
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-mono mb-2">
                Stap 3 — AI coach key (optioneel)
              </h2>
              <p className="text-sm text-stone-400 mb-4 leading-relaxed">
                Voor de AI coach en voedingsanalyse heb je een eigen Anthropic API
                key nodig. Vul nu in of later via{" "}
                <span className="text-orange-400">Settings</span>.
              </p>
              <div className="border border-stone-800 bg-stone-900/50 p-4 mb-4 text-xs text-stone-400 leading-relaxed font-mono">
                Pak je key op{" "}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange-400 underline"
                >
                  console.anthropic.com
                </a>{" "}
                → Settings → API Keys → Create Key. Plak hier. Wij slaan 'm
                versleuteld op (AES-256-GCM) en gebruiken 'm alleen voor jouw AI
                calls.
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
                  API Key (begint met sk-ant-)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full mt-1 bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              {error && (
                <p className="text-xs text-orange-400 font-mono mt-3">{error}</p>
              )}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-5 border border-stone-800 text-stone-400 font-mono uppercase tracking-[0.2em] text-xs hover:border-orange-500/50"
                >
                  Sla over
                </button>
                <button
                  onClick={saveApiKey}
                  disabled={loading}
                  className="flex-1 bg-orange-500 text-stone-950 py-3 font-mono uppercase tracking-[0.2em] text-xs hover:bg-orange-400 disabled:opacity-30"
                >
                  {loading ? "..." : "Naar dashboard →"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
}: {
  label: string;
  value: string | number;
  onChange: (v: string | number) => void;
  type: "text" | "number";
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono focus:outline-none focus:border-orange-500"
      />
    </div>
  );
}
