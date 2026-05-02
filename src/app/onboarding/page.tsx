"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  COACH_STYLES,
  COMMON_INTOLERANCES,
  COOKING_FREQS,
  DAYS,
  DEFAULT_SCHEDULE,
  DIET_STYLES,
  EXPERIENCE_LEVELS,
  SPORTS,
  WORK_TYPES,
} from "@/lib/constants";
import {
  Field,
  TextInput,
  TextArea,
  Select,
  Chip,
  RadioCard,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/Field";
import type {
  CoachStyle,
  CookingFreq,
  DietStyle,
  ExperienceLevel,
  WorkType,
} from "@/lib/types";

const STEPS = [
  { n: 1, title: "Wie ben je", subtitle: "Korte basisinfo" },
  { n: 2, title: "Lichaam", subtitle: "Lengte, gewicht, lichaamssamenstelling" },
  { n: 3, title: "Je doel", subtitle: "Wat wil je bereiken en wanneer" },
  { n: 4, title: "Training", subtitle: "Hoe en wat train je" },
  { n: 5, title: "Voeding", subtitle: "Dieet, koken, drinkgewoonten" },
  { n: 6, title: "Leefstijl", subtitle: "Slaap, stress, werk" },
  { n: 7, title: "AI Coach", subtitle: "Coach-stijl + Anthropic key" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 — basics
  const [name, setName] = useState("");
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState<"male" | "female">("male");

  // Step 2 — body
  const [height, setHeight] = useState(180);
  const [startWeight, setStartWeight] = useState(80);
  const [bodyFatPct, setBodyFatPct] = useState<string>("");
  const [waistCm, setWaistCm] = useState<string>("");

  // Step 3 — goal
  const [targetWeight, setTargetWeight] = useState(75);
  const [targetWeeks, setTargetWeeks] = useState<string>("16");
  const [goal, setGoal] = useState("Vetverlies + spiermassa behouden");

  // Step 4 — training
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel>("intermediate");
  const [trainingDays, setTrainingDays] = useState(4);
  const [preferredSports, setPreferredSports] = useState<string[]>([
    "Krachttraining",
  ]);

  // Step 5 — nutrition
  const [dietStyle, setDietStyle] = useState<DietStyle>("omnivore");
  const [intolerances, setIntolerances] = useState<string[]>([]);
  const [cookingFreq, setCookingFreq] = useState<CookingFreq>("sometimes");
  const [drinks, setDrinks] = useState("");

  // Step 6 — lifestyle
  const [sleepHours, setSleepHours] = useState(7);
  const [stressLevel, setStressLevel] = useState("medium");
  const [workType, setWorkType] = useState<WorkType>("sedentary");
  const [notes, setNotes] = useState("");

  // Step 7 — coach + key
  const [coachStyle, setCoachStyle] = useState<CoachStyle>("motivating");
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

  const toggle = (
    arr: string[],
    setArr: (a: string[]) => void,
    item: string,
  ) => {
    setArr(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  };

  const next = () => setStep((s) => Math.min(STEPS.length, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const finish = async () => {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      router.replace("/login");
      return;
    }

    const profilePayload: Record<string, any> = {
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
      body_fat_pct: bodyFatPct ? parseFloat(bodyFatPct) : null,
      waist_cm: waistCm ? parseFloat(waistCm) : null,
      target_weeks: targetWeeks ? parseInt(targetWeeks) : null,
      experience_level: experienceLevel,
      preferred_sports: preferredSports,
      diet_style: dietStyle,
      intolerances,
      cooking_freq: cookingFreq,
      drinks,
      work_type: workType,
      coach_style: coachStyle,
      onboarded: true,
    };

    const { error: upErr } = await supabase
      .from("profiles")
      .update(profilePayload)
      .eq("user_id", auth.user.id);

    if (upErr) {
      setError(upErr.message);
      setSaving(false);
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

    if (apiKey.trim()) {
      const res = await fetch("/api/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(`Profiel opgeslagen, key niet: ${j.error || "onbekend"}`);
        setSaving(false);
        return;
      }
    }

    router.push("/dashboard");
  };

  const canContinue = () => {
    switch (step) {
      case 1:
        return name.trim().length > 0 && age > 0;
      case 2:
        return height > 0 && startWeight > 0;
      case 3:
        return targetWeight > 0 && goal.trim().length > 0;
      case 4:
        return preferredSports.length > 0 && trainingDays > 0;
      default:
        return true;
    }
  };

  const cur = STEPS[step - 1];

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-9 h-9 bg-orange-500 rounded-md flex items-center justify-center">
            <Zap size={16} className="text-stone-950" strokeWidth={2.5} />
          </div>
          <h1 className="text-lg font-bold tracking-tight">FORGE</h1>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1.5 mb-8">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s.n <= step ? "bg-orange-500" : "bg-stone-800"
              }`}
            />
          ))}
        </div>

        <p className="text-xs uppercase tracking-wider text-stone-500 mb-1">
          Stap {step} van {STEPS.length}
        </p>
        <h2 className="text-2xl font-semibold mb-1">{cur.title}</h2>
        <p className="text-stone-400 mb-8">{cur.subtitle}</p>

        <div className="border border-stone-800 bg-stone-950 rounded-lg p-6 space-y-5">
          {/* Step 1 — basics */}
          {step === 1 && (
            <>
              <Field label="Hoe heet je?">
                <TextInput
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Voornaam"
                  autoFocus
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Leeftijd">
                  <TextInput
                    type="number"
                    value={age}
                    onChange={(e) => setAge(+e.target.value)}
                  />
                </Field>
                <Field label="Geslacht">
                  <Select
                    value={gender}
                    onChange={(e) =>
                      setGender(e.target.value as "male" | "female")
                    }
                  >
                    <option value="male">Man</option>
                    <option value="female">Vrouw</option>
                  </Select>
                </Field>
              </div>
            </>
          )}

          {/* Step 2 — body */}
          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Lengte (cm)">
                  <TextInput
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(+e.target.value)}
                  />
                </Field>
                <Field label="Huidig gewicht (kg)">
                  <TextInput
                    type="number"
                    step="0.1"
                    value={startWeight}
                    onChange={(e) => setStartWeight(+e.target.value)}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Vetpercentage (%)" hint="Optioneel — schat zo nodig">
                  <TextInput
                    type="number"
                    step="0.1"
                    value={bodyFatPct}
                    onChange={(e) => setBodyFatPct(e.target.value)}
                    placeholder="bv 22"
                  />
                </Field>
                <Field label="Taille omtrek (cm)" hint="Optioneel">
                  <TextInput
                    type="number"
                    step="0.1"
                    value={waistCm}
                    onChange={(e) => setWaistCm(e.target.value)}
                    placeholder="bv 92"
                  />
                </Field>
              </div>
            </>
          )}

          {/* Step 3 — goal + timeline */}
          {step === 3 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Doel gewicht (kg)">
                  <TextInput
                    type="number"
                    step="0.1"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(+e.target.value)}
                  />
                </Field>
                <Field
                  label="Binnen hoeveel weken?"
                  hint="Voor realistische cut/bulk planning"
                >
                  <TextInput
                    type="number"
                    value={targetWeeks}
                    onChange={(e) => setTargetWeeks(e.target.value)}
                    placeholder="bv 16"
                  />
                </Field>
              </div>
              <Field
                label="Wat is je hoofddoel?"
                hint="Beschrijf wat je écht wilt bereiken"
              >
                <TextArea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows={3}
                  placeholder="Bijv: 8kg afvallen voor de zomer, spiermassa behouden, afgetraind worden in de schouders en armen"
                />
              </Field>
            </>
          )}

          {/* Step 4 — training */}
          {step === 4 && (
            <>
              <Field label="Hoeveel jaar train je consistent?">
                <div className="grid gap-2">
                  {EXPERIENCE_LEVELS.map((e) => (
                    <RadioCard
                      key={e.value}
                      active={experienceLevel === e.value}
                      onClick={() => setExperienceLevel(e.value)}
                      title={e.label}
                      desc={e.desc}
                    />
                  ))}
                </div>
              </Field>
              <Field label="Trainingen per week">
                <TextInput
                  type="number"
                  min={0}
                  max={14}
                  value={trainingDays}
                  onChange={(e) => setTrainingDays(+e.target.value)}
                />
              </Field>
              <Field
                label="Welke sporten beoefen je / wil je doen?"
                hint="Selecteer alle die van toepassing zijn"
              >
                <div className="flex flex-wrap gap-2">
                  {SPORTS.map((s) => (
                    <Chip
                      key={s}
                      active={preferredSports.includes(s)}
                      onClick={() =>
                        toggle(preferredSports, setPreferredSports, s)
                      }
                    >
                      {s}
                    </Chip>
                  ))}
                </div>
              </Field>
            </>
          )}

          {/* Step 5 — nutrition */}
          {step === 5 && (
            <>
              <Field label="Dieet stijl">
                <Select
                  value={dietStyle}
                  onChange={(e) => setDietStyle(e.target.value as DietStyle)}
                >
                  {DIET_STYLES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Intoleranties / allergieën" hint="Optioneel">
                <div className="flex flex-wrap gap-2">
                  {COMMON_INTOLERANCES.map((i) => (
                    <Chip
                      key={i}
                      active={intolerances.includes(i)}
                      onClick={() => toggle(intolerances, setIntolerances, i)}
                    >
                      {i}
                    </Chip>
                  ))}
                </div>
              </Field>
              <Field label="Hoe vaak kook je zelf?">
                <Select
                  value={cookingFreq}
                  onChange={(e) =>
                    setCookingFreq(e.target.value as CookingFreq)
                  }
                >
                  {COOKING_FREQS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Drinkgewoonten"
                hint="Bijv: 2-3 koffie/dag, glas wijn weekenden, 2 Monster Zero/dag"
              >
                <TextArea
                  value={drinks}
                  onChange={(e) => setDrinks(e.target.value)}
                  rows={2}
                  placeholder="Beschrijf alcohol, koffie, energy drinks, fris"
                />
              </Field>
            </>
          )}

          {/* Step 6 — lifestyle */}
          {step === 6 && (
            <>
              <Field label="Werk type">
                <Select
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value as WorkType)}
                >
                  {WORK_TYPES.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Slaap (uren/nacht)">
                  <TextInput
                    type="number"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(+e.target.value)}
                  />
                </Field>
                <Field label="Stress level">
                  <Select
                    value={stressLevel}
                    onChange={(e) => setStressLevel(e.target.value)}
                  >
                    <option value="low">Laag</option>
                    <option value="medium">Middel</option>
                    <option value="medium-high">Middel-hoog</option>
                    <option value="high">Hoog</option>
                  </Select>
                </Field>
              </div>
              <Field
                label="Iets wat de coach moet weten?"
                hint="Vrije tekst — blessures, medicatie, doelen, deadlines"
              >
                <TextArea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Bijv: oude kniepijn rechts, werk shifts, ga in juli op vakantie"
                />
              </Field>
            </>
          )}

          {/* Step 7 — coach + key */}
          {step === 7 && (
            <>
              <Field label="Coach-stijl voorkeur">
                <div className="grid gap-2">
                  {COACH_STYLES.map((c) => (
                    <RadioCard
                      key={c.value}
                      active={coachStyle === c.value}
                      onClick={() => setCoachStyle(c.value)}
                      title={c.label}
                      desc={c.desc}
                    />
                  ))}
                </div>
              </Field>
              <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-md p-4 text-sm text-stone-300 leading-relaxed">
                ✓ <strong>AI is ingebouwd</strong> — je hoeft niets te
                configureren. Klik gewoon "Naar dashboard" en je AI coach werkt
                meteen.
              </div>
              <details className="border border-stone-800 bg-stone-900/40 rounded-md">
                <summary className="cursor-pointer p-4 text-sm text-stone-400 hover:text-stone-200">
                  Liever je eigen Anthropic API key gebruiken? (optioneel)
                </summary>
                <div className="px-4 pb-4 space-y-3">
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Voor extra privacy kun je je eigen key gebruiken. Pak 'm
                    gratis op{" "}
                    <a
                      href="https://console.anthropic.com/settings/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-orange-400 underline"
                    >
                      console.anthropic.com
                    </a>
                    . Wij slaan 'm versleuteld op.
                  </p>
                  <TextInput
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-ant-..."
                  />
                </div>
              </details>
            </>
          )}

          {error && (
            <p className="text-sm text-orange-400">{error}</p>
          )}
        </div>

        {/* Nav buttons */}
        <div className="flex gap-2 mt-6">
          {step > 1 ? (
            <SecondaryButton
              onClick={back}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={14} /> Terug
            </SecondaryButton>
          ) : (
            <div />
          )}
          {step < STEPS.length ? (
            <PrimaryButton
              onClick={next}
              disabled={!canContinue()}
              className="ml-auto flex items-center gap-2"
            >
              Volgende <ArrowRight size={14} />
            </PrimaryButton>
          ) : (
            <PrimaryButton
              onClick={finish}
              disabled={saving}
              className="ml-auto flex items-center gap-2"
            >
              {saving ? "Opslaan..." : (
                <>
                  Naar dashboard <Check size={14} />
                </>
              )}
            </PrimaryButton>
          )}
        </div>
      </div>
    </main>
  );
}
