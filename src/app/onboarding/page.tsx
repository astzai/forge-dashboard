"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  CARDIO_PREFERENCES,
  COACH_STYLES,
  COMMON_INJURIES,
  COMMON_INTOLERANCES,
  COOKING_FREQS,
  DAYS,
  DEFAULT_SCHEDULE,
  DIET_STYLES,
  EQUIPMENTS,
  EXPERIENCE_LEVELS,
  FOCUS_AREAS,
  SPLIT_PREFERENCES,
  SPORTS,
  TIMES_OF_DAY,
  TRAINING_GOALS,
  WEEKDAYS,
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
  CardioPreference,
  CoachStyle,
  CookingFreq,
  DietStyle,
  Equipment,
  ExperienceLevel,
  SplitPreference,
  TimeOfDay,
  TrainingGoal,
  WorkType,
} from "@/lib/types";

const STEPS = [
  { n: 1, title: "Wie ben je", subtitle: "Korte basisinfo" },
  { n: 2, title: "Lichaam", subtitle: "Lengte, gewicht, lichaamssamenstelling" },
  { n: 3, title: "Je doel", subtitle: "Wat wil je bereiken en wanneer" },
  { n: 4, title: "Training — basis", subtitle: "Doel, split, dagen en tijd" },
  { n: 5, title: "Training — focus", subtitle: "Sporten, prioriteiten, materiaal" },
  { n: 6, title: "Training — cijfers", subtitle: "PR's & overige activiteiten" },
  { n: 7, title: "Voeding", subtitle: "Dieet, koken, drinkgewoonten" },
  { n: 8, title: "Leefstijl", subtitle: "Slaap, stress, werk" },
  { n: 9, title: "AI Coach", subtitle: "Coach-stijl + Anthropic key" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingSchedule, setGeneratingSchedule] = useState(false);

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

  // Step 4 — training basis
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel>("intermediate");
  const [trainingGoal, setTrainingGoal] = useState<TrainingGoal>(
    "fatloss_keep_muscle",
  );
  const [splitPreference, setSplitPreference] =
    useState<SplitPreference>("no_preference");
  const [trainingDayNames, setTrainingDayNames] = useState<string[]>([
    "Maandag",
    "Dinsdag",
    "Donderdag",
    "Vrijdag",
  ]);
  const [sessionMinutes, setSessionMinutes] = useState(60);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("evening");

  // Step 5 — training focus
  const [preferredSports, setPreferredSports] = useState<string[]>([
    "Krachttraining",
  ]);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [cardioPreference, setCardioPreference] =
    useState<CardioPreference>("zone2");
  const [equipment, setEquipment] = useState<Equipment>("full_gym");
  const [injuries, setInjuries] = useState<string[]>([]);
  const [injuryNotes, setInjuryNotes] = useState("");
  const [hatedExercises, setHatedExercises] = useState("");

  // Step 6 — training cijfers
  const [prsUnknown, setPrsUnknown] = useState(false);
  const [prBench, setPrBench] = useState<string>("");
  const [prSquat, setPrSquat] = useState<string>("");
  const [prDeadlift, setPrDeadlift] = useState<string>("");
  const [otherActivities, setOtherActivities] = useState("");

  // Step 7 — nutrition
  const [dietStyle, setDietStyle] = useState<DietStyle>("omnivore");
  const [intolerances, setIntolerances] = useState<string[]>([]);
  const [cookingFreq, setCookingFreq] = useState<CookingFreq>("sometimes");
  const [drinks, setDrinks] = useState("");

  // Step 8 — lifestyle
  const [sleepHours, setSleepHours] = useState(7);
  const [stressLevel, setStressLevel] = useState("medium");
  const [workType, setWorkType] = useState<WorkType>("sedentary");
  const [notes, setNotes] = useState("");

  // Step 9 — coach + key
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

    const current_prs = prsUnknown
      ? { unknown: true }
      : {
          bench: prBench ? parseFloat(prBench) : null,
          squat: prSquat ? parseFloat(prSquat) : null,
          deadlift: prDeadlift ? parseFloat(prDeadlift) : null,
        };

    const profilePayload: Record<string, any> = {
      name,
      height,
      start_weight: startWeight,
      current_weight: startWeight,
      target_weight: targetWeight,
      age,
      gender,
      goal,
      training_days: trainingDayNames.length, // afgeleid uit dagen
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
      // Nieuwe trainingsvelden
      training_goal: trainingGoal,
      split_preference: splitPreference,
      training_day_names: trainingDayNames,
      session_minutes: sessionMinutes,
      time_of_day: timeOfDay,
      focus_areas: focusAreas,
      cardio_preference: cardioPreference,
      equipment,
      injuries,
      injury_notes: injuryNotes,
      hated_exercises: hatedExercises,
      current_prs,
      other_activities: otherActivities,
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

    // AI-genereer een persoonlijk schema. Faalt 'ie? Dan val terug op default.
    setGeneratingSchedule(true);
    try {
      const res = await fetch("/api/generate-schedule", { method: "POST" });
      if (!res.ok) {
        // Stille fallback: seed default schedule zodat user iets heeft
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
      }
    } catch {
      // ignore — user kan alsnog 'Genereer opnieuw' op Schema-tab klikken
    } finally {
      setGeneratingSchedule(false);
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
        return trainingDayNames.length > 0 && sessionMinutes > 0;
      case 5:
        return preferredSports.length > 0;
      case 6:
        return true; // alles optioneel
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

          {/* Step 4 — training basis */}
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

              <Field label="Wat is je training doel?">
                <div className="grid gap-2">
                  {TRAINING_GOALS.map((g) => (
                    <RadioCard
                      key={g.value}
                      active={trainingGoal === g.value}
                      onClick={() => setTrainingGoal(g.value)}
                      title={g.label}
                      desc={g.desc}
                    />
                  ))}
                </div>
              </Field>

              <Field
                label="Voorkeur voor split"
                hint="Geen idee? Kies 'Geen voorkeur' — coach kiest de beste"
              >
                <div className="grid gap-2">
                  {SPLIT_PREFERENCES.map((s) => (
                    <RadioCard
                      key={s.value}
                      active={splitPreference === s.value}
                      onClick={() => setSplitPreference(s.value)}
                      title={s.label}
                      desc={s.desc}
                    />
                  ))}
                </div>
              </Field>

              <Field
                label="Welke dagen kun je trainen?"
                hint="Tap aan/uit — coach houdt rekening met rustdagen"
              >
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((d) => (
                    <Chip
                      key={d}
                      active={trainingDayNames.includes(d)}
                      onClick={() =>
                        toggle(trainingDayNames, setTrainingDayNames, d)
                      }
                    >
                      {d.slice(0, 2)}
                    </Chip>
                  ))}
                </div>
                <div className="text-xs text-stone-500 mt-1.5">
                  {trainingDayNames.length} dagen geselecteerd
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Tijd per sessie (min)">
                  <Select
                    value={sessionMinutes}
                    onChange={(e) => setSessionMinutes(+e.target.value)}
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={75}>75 min</option>
                    <option value={90}>90 min</option>
                    <option value={120}>120+ min</option>
                  </Select>
                </Field>
                <Field label="Voorkeurstijd dag">
                  <Select
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
                  >
                    {TIMES_OF_DAY.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </>
          )}

          {/* Step 5 — training focus */}
          {step === 5 && (
            <>
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

              <Field
                label="Focuspunten / wat wil je extra opbouwen?"
                hint="Optioneel — coach geeft deze gebieden meer volume"
              >
                <div className="flex flex-wrap gap-2">
                  {FOCUS_AREAS.map((f) => (
                    <Chip
                      key={f}
                      active={focusAreas.includes(f)}
                      onClick={() => toggle(focusAreas, setFocusAreas, f)}
                    >
                      {f}
                    </Chip>
                  ))}
                </div>
              </Field>

              <Field label="Cardio voorkeur">
                <Select
                  value={cardioPreference}
                  onChange={(e) =>
                    setCardioPreference(e.target.value as CardioPreference)
                  }
                >
                  {CARDIO_PREFERENCES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label} — {c.desc}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Wat heb je tot je beschikking?">
                <div className="grid gap-2">
                  {EQUIPMENTS.map((e) => (
                    <RadioCard
                      key={e.value}
                      active={equipment === e.value}
                      onClick={() => setEquipment(e.value)}
                      title={e.label}
                      desc={e.desc}
                    />
                  ))}
                </div>
              </Field>

              <Field
                label="Blessures / no-go's"
                hint="Tap wat van toepassing is"
              >
                <div className="flex flex-wrap gap-2">
                  {COMMON_INJURIES.map((i) => (
                    <Chip
                      key={i}
                      active={injuries.includes(i)}
                      onClick={() => toggle(injuries, setInjuries, i)}
                    >
                      {i}
                    </Chip>
                  ))}
                </div>
              </Field>

              {injuries.length > 0 && (
                <Field
                  label="Toelichting blessures"
                  hint="Optioneel — wat moet de coach precies vermijden?"
                >
                  <TextArea
                    value={injuryNotes}
                    onChange={(e) => setInjuryNotes(e.target.value)}
                    rows={2}
                    placeholder="Bijv: oude meniscus rechts — geen diepe squats, geen jumping"
                  />
                </Field>
              )}

              <Field
                label="Oefeningen die je écht haat"
                hint="Optioneel — coach skipt deze"
              >
                <TextInput
                  type="text"
                  value={hatedExercises}
                  onChange={(e) => setHatedExercises(e.target.value)}
                  placeholder="Bijv: burpees, lunges, deadlifts"
                />
              </Field>
            </>
          )}

          {/* Step 6 — training cijfers */}
          {step === 6 && (
            <>
              <div className="border border-stone-800 bg-stone-900/40 rounded-md p-4">
                <div className="text-sm text-stone-300 font-medium mb-1">
                  Huidige PR's (1RM in kg)
                </div>
                <p className="text-xs text-stone-500 mb-3">
                  Helpt de coach met progressie-planning. Allemaal optioneel.
                </p>

                <label className="flex items-center gap-2.5 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={prsUnknown}
                    onChange={(e) => setPrsUnknown(e.target.checked)}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className="text-sm text-stone-300">
                    Geen idee / nooit gemeten
                  </span>
                </label>

                {!prsUnknown && (
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Bench">
                      <TextInput
                        type="number"
                        step="2.5"
                        value={prBench}
                        onChange={(e) => setPrBench(e.target.value)}
                        placeholder="bv 100"
                      />
                    </Field>
                    <Field label="Squat">
                      <TextInput
                        type="number"
                        step="2.5"
                        value={prSquat}
                        onChange={(e) => setPrSquat(e.target.value)}
                        placeholder="bv 120"
                      />
                    </Field>
                    <Field label="Deadlift">
                      <TextInput
                        type="number"
                        step="2.5"
                        value={prDeadlift}
                        onChange={(e) => setPrDeadlift(e.target.value)}
                        placeholder="bv 140"
                      />
                    </Field>
                  </div>
                )}
              </div>

              <Field
                label="Wat doe je nog meer dat de coach moet weten?"
                hint="Trainingen die niet in de standaard categorieën vallen — vrij invullen"
              >
                <TextArea
                  value={otherActivities}
                  onChange={(e) => setOtherActivities(e.target.value)}
                  rows={4}
                  placeholder={
                    "Bijv:\n- 2x per week jiu-jitsu op di/do avond\n- Zaterdag wandeling van 2 uur met de hond\n- 1x per maand bouldering"
                  }
                />
              </Field>
            </>
          )}

          {/* Step 7 — nutrition */}
          {step === 7 && (
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

          {/* Step 8 — lifestyle */}
          {step === 8 && (
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
                hint="Vrije tekst — medicatie, deadlines, life events"
              >
                <TextArea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Bijv: werk shifts, ga in juli op vakantie, bruiloft over 12 weken"
                />
              </Field>
            </>
          )}

          {/* Step 9 — coach + key */}
          {step === 9 && (
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
                configureren. Klik gewoon "Maak mijn schema" en je AI coach werkt
                meteen.
              </div>
              <div className="border border-orange-500/30 bg-orange-500/5 rounded-md p-4 text-sm text-stone-300 leading-relaxed flex items-start gap-3">
                <Sparkles size={18} className="text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-orange-300">Direct na opslaan</strong>{" "}
                  bouwt de AI-coach een persoonlijk 7-daags trainingsschema op
                  basis van alles wat je hebt ingevuld. Je kunt dat later altijd
                  zelf aanpassen of opnieuw laten genereren.
                </div>
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

          {error && <p className="text-sm text-orange-400">{error}</p>}
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
              disabled={saving || generatingSchedule}
              className="ml-auto flex items-center gap-2"
            >
              {generatingSchedule ? (
                <>
                  <Sparkles size={14} className="animate-pulse" /> Schema
                  bouwen...
                </>
              ) : saving ? (
                "Opslaan..."
              ) : (
                <>
                  Maak mijn schema <Sparkles size={14} />
                </>
              )}
            </PrimaryButton>
          )}
        </div>
      </div>
    </main>
  );
}
