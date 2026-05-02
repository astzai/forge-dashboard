"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Trash2, Zap } from "lucide-react";
import { getProfile, updateProfile } from "@/lib/db";
import {
  COACH_STYLES,
  COMMON_INTOLERANCES,
  COOKING_FREQS,
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
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/Field";
import type {
  CoachStyle,
  CookingFreq,
  DietStyle,
  ExperienceLevel,
  Profile,
  WorkType,
} from "@/lib/types";

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-stone-800 bg-stone-950 rounded-lg p-6">
      <h2 className="text-base font-semibold text-stone-100 mb-1">{title}</h2>
      {desc && <p className="text-sm text-stone-500 mb-5">{desc}</p>}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const [apiKey, setApiKey] = useState("");
  const [apiKeyMsg, setApiKeyMsg] = useState<string | null>(null);
  const [apiKeyBusy, setApiKeyBusy] = useState(false);

  useEffect(() => {
    getProfile()
      .then((p) => {
        if (!p) {
          router.replace("/login");
          return;
        }
        setProfile(p);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const update = (patch: Partial<Profile>) => {
    if (!profile) return;
    setProfile({ ...profile, ...patch });
  };

  const toggleArr = (
    key: "preferred_sports" | "intolerances",
    item: string,
  ) => {
    if (!profile) return;
    const arr = profile[key] || [];
    update({
      [key]: arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item],
    } as any);
  };

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateProfile(profile);
      setSavedAt(Date.now());
    } catch (e: any) {
      alert(`Kon niet opslaan: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const saveApiKey = async () => {
    setApiKeyBusy(true);
    setApiKeyMsg(null);
    const res = await fetch("/api/api-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: apiKey.trim() }),
    });
    setApiKeyBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setApiKeyMsg(j.error || "Kon key niet opslaan");
      return;
    }
    setApiKey("");
    setApiKeyMsg("API key opgeslagen.");
    if (profile) setProfile({ ...profile, has_anthropic_key: true });
  };

  const deleteApiKey = async () => {
    if (!confirm("API key verwijderen?")) return;
    setApiKeyBusy(true);
    const res = await fetch("/api/api-key", { method: "DELETE" });
    setApiKeyBusy(false);
    if (!res.ok) {
      setApiKeyMsg("Kon key niet verwijderen");
      return;
    }
    setApiKeyMsg("API key verwijderd.");
    if (profile) setProfile({ ...profile, has_anthropic_key: false });
  };

  const signOut = async () => {
    await fetch("/auth/signout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  if (loading || !profile) {
    return (
      <main className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-stone-500 text-sm">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100">
      <header className="border-b border-stone-800/70 sticky top-0 bg-stone-950 z-40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-stone-400 hover:text-orange-400"
          >
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded flex items-center justify-center">
              <Zap size={13} className="text-stone-950" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold tracking-tight">FORGE</span>
          </div>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            Instellingen
          </h1>
          <p className="text-stone-400">
            Profiel, doelen, voeding, training en AI-coach.
          </p>
        </div>

        {/* BASICS */}
        <Section title="Basics">
          <Field label="Naam">
            <TextInput
              value={profile.name}
              onChange={(e) => update({ name: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Leeftijd">
              <TextInput
                type="number"
                value={profile.age}
                onChange={(e) => update({ age: +e.target.value })}
              />
            </Field>
            <Field label="Geslacht">
              <Select
                value={profile.gender}
                onChange={(e) =>
                  update({ gender: e.target.value as "male" | "female" })
                }
              >
                <option value="male">Man</option>
                <option value="female">Vrouw</option>
              </Select>
            </Field>
            <Field label="Lengte (cm)">
              <TextInput
                type="number"
                value={profile.height}
                onChange={(e) => update({ height: +e.target.value })}
              />
            </Field>
          </div>
        </Section>

        {/* BODY */}
        <Section title="Lichaam" desc="Gewicht en samenstelling">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Start gewicht (kg)">
              <TextInput
                type="number"
                step="0.1"
                value={profile.start_weight}
                onChange={(e) => update({ start_weight: +e.target.value })}
              />
            </Field>
            <Field label="Huidig gewicht (kg)">
              <TextInput
                type="number"
                step="0.1"
                value={profile.current_weight}
                onChange={(e) => update({ current_weight: +e.target.value })}
              />
            </Field>
            <Field label="Doel gewicht (kg)">
              <TextInput
                type="number"
                step="0.1"
                value={profile.target_weight}
                onChange={(e) => update({ target_weight: +e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Vetpercentage (%)">
              <TextInput
                type="number"
                step="0.1"
                value={profile.body_fat_pct ?? ""}
                onChange={(e) =>
                  update({
                    body_fat_pct: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  })
                }
              />
            </Field>
            <Field label="Taille omtrek (cm)">
              <TextInput
                type="number"
                step="0.1"
                value={profile.waist_cm ?? ""}
                onChange={(e) =>
                  update({
                    waist_cm: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  })
                }
              />
            </Field>
          </div>
        </Section>

        {/* GOAL */}
        <Section title="Je doel">
          <Field label="Hoofddoel">
            <TextArea
              value={profile.goal}
              onChange={(e) => update({ goal: e.target.value })}
              rows={2}
            />
          </Field>
          <Field label="Tijdslijn (binnen X weken)">
            <TextInput
              type="number"
              value={profile.target_weeks ?? ""}
              onChange={(e) =>
                update({
                  target_weeks: e.target.value
                    ? parseInt(e.target.value)
                    : null,
                })
              }
            />
          </Field>
        </Section>

        {/* TRAINING */}
        <Section title="Training">
          <Field label="Niveau">
            <Select
              value={profile.experience_level}
              onChange={(e) =>
                update({
                  experience_level: e.target.value as ExperienceLevel,
                })
              }
            >
              {EXPERIENCE_LEVELS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label} — {e.desc}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Trainingen per week">
            <TextInput
              type="number"
              min={0}
              max={14}
              value={profile.training_days}
              onChange={(e) => update({ training_days: +e.target.value })}
            />
          </Field>
          <Field label="Voorkeur sporten">
            <div className="flex flex-wrap gap-2">
              {SPORTS.map((s) => (
                <Chip
                  key={s}
                  active={(profile.preferred_sports || []).includes(s)}
                  onClick={() => toggleArr("preferred_sports", s)}
                >
                  {s}
                </Chip>
              ))}
            </div>
          </Field>
        </Section>

        {/* NUTRITION */}
        <Section title="Voeding">
          <Field label="Dieet">
            <Select
              value={profile.diet_style}
              onChange={(e) =>
                update({ diet_style: e.target.value as DietStyle })
              }
            >
              {DIET_STYLES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Intoleranties">
            <div className="flex flex-wrap gap-2">
              {COMMON_INTOLERANCES.map((i) => (
                <Chip
                  key={i}
                  active={(profile.intolerances || []).includes(i)}
                  onClick={() => toggleArr("intolerances", i)}
                >
                  {i}
                </Chip>
              ))}
            </div>
          </Field>
          <Field label="Hoe vaak kook je zelf?">
            <Select
              value={profile.cooking_freq}
              onChange={(e) =>
                update({ cooking_freq: e.target.value as CookingFreq })
              }
            >
              {COOKING_FREQS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Drinkgewoonten">
            <TextArea
              value={profile.drinks ?? ""}
              onChange={(e) => update({ drinks: e.target.value })}
              rows={2}
            />
          </Field>
        </Section>

        {/* LIFESTYLE */}
        <Section title="Leefstijl">
          <Field label="Werk type">
            <Select
              value={profile.work_type}
              onChange={(e) => update({ work_type: e.target.value as WorkType })}
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
                value={profile.sleep_hours}
                onChange={(e) => update({ sleep_hours: +e.target.value })}
              />
            </Field>
            <Field label="Stress level">
              <Select
                value={profile.stress_level}
                onChange={(e) => update({ stress_level: e.target.value })}
              >
                <option value="low">Laag</option>
                <option value="medium">Middel</option>
                <option value="medium-high">Middel-hoog</option>
                <option value="high">Hoog</option>
              </Select>
            </Field>
          </div>
          <Field label="Notes (vrije tekst voor de coach)">
            <TextArea
              value={profile.notes}
              onChange={(e) => update({ notes: e.target.value })}
              rows={3}
            />
          </Field>
        </Section>

        {/* COACH */}
        <Section title="AI Coach">
          <Field label="Coach-stijl">
            <Select
              value={profile.coach_style}
              onChange={(e) =>
                update({ coach_style: e.target.value as CoachStyle })
              }
            >
              {COACH_STYLES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label} — {c.desc}
                </option>
              ))}
            </Select>
          </Field>

          {profile.has_anthropic_key ? (
            <div className="flex items-center justify-between border border-emerald-500/40 bg-emerald-500/5 rounded-md p-4">
              <div className="text-sm text-emerald-400">
                ● Eigen key actief — jouw key wordt gebruikt voor AI calls.
              </div>
              <button
                onClick={deleteApiKey}
                disabled={apiKeyBusy}
                className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-orange-400"
              >
                <Trash2 size={13} /> Verwijder
              </button>
            </div>
          ) : (
            <div className="border border-stone-700 bg-stone-900/60 rounded-md p-4">
              <p className="text-sm text-stone-300">
                ✓ Managed mode actief — AI features werken zonder eigen key.
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Je hoeft niets te configureren. Wil je je eigen key gebruiken
                voor extra privacy? Vul 'm hieronder in.
              </p>
            </div>
          )}

          <Field
            label="Eigen Anthropic key (optioneel)"
            hint="Optioneel: gebruik je eigen key i.p.v. managed mode. Pak op console.anthropic.com → API Keys"
          >
            <div className="flex gap-2">
              <TextInput
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="flex-1"
              />
              <PrimaryButton
                onClick={saveApiKey}
                disabled={apiKeyBusy || !apiKey.trim()}
              >
                {profile.has_anthropic_key ? "Vervang" : "Opslaan"}
              </PrimaryButton>
            </div>
          </Field>
          {apiKeyMsg && (
            <p className="text-sm text-stone-400">{apiKeyMsg}</p>
          )}
        </Section>

        {/* SAVE BAR */}
        <div className="sticky bottom-4 flex items-center justify-between gap-3 bg-stone-950/90 border border-stone-800 rounded-lg p-4 backdrop-blur shadow-lg shadow-black/50">
          {savedAt && Date.now() - savedAt < 3000 ? (
            <span className="text-sm text-emerald-400 flex items-center gap-1.5">
              <Check size={14} /> Opgeslagen
            </span>
          ) : (
            <span className="text-sm text-stone-500">
              Klik opslaan om wijzigingen vast te leggen
            </span>
          )}
          <PrimaryButton onClick={save} disabled={saving}>
            {saving ? "Opslaan..." : "Opslaan"}
          </PrimaryButton>
        </div>

        {/* DANGER */}
        <div className="border border-stone-900 bg-stone-950 rounded-lg p-6">
          <h2 className="text-base font-semibold text-stone-100 mb-4">
            Account
          </h2>
          <div className="flex flex-wrap gap-2">
            <SecondaryButton onClick={signOut}>Uitloggen</SecondaryButton>
            {profile && (
              <Link
                href="/admin"
                className="border border-stone-800 hover:border-orange-500/60 text-stone-300 px-5 py-3 rounded-md text-sm transition-colors"
              >
                Site admin →
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
