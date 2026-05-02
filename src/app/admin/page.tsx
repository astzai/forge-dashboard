"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Eye,
  RotateCcw,
  Save,
  Zap,
} from "lucide-react";
import {
  DEFAULT_CONTENT,
  fetchSiteContent,
  isOwnerUser,
  saveSiteContent,
  type SiteContent,
} from "@/lib/content";

export default function AdminPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string | null>("hero");

  useEffect(() => {
    (async () => {
      const ok = await isOwnerUser();
      setAllowed(ok);
      if (!ok) {
        setLoading(false);
        return;
      }
      try {
        const c = await fetchSiteContent();
        setContent(c);
      } catch (e: any) {
        setError(`Kon content niet laden: ${e.message}`);
      }
      setLoading(false);
    })();
  }, []);

  const update = (
    section: keyof SiteContent,
    key: string,
    value: string | number,
  ) => {
    setContent((prev) => ({
      ...prev,
      [section]: { ...(prev[section] as any), [key]: value },
    }));
  };

  const resetSection = (section: keyof SiteContent) => {
    if (!confirm(`Reset ${section} naar default tekst?`)) return;
    setContent((prev) => ({
      ...prev,
      [section]: { ...(DEFAULT_CONTENT[section] as any) },
    }));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveSiteContent(content);
      setSavedAt(Date.now());
    } catch (e: any) {
      setError(`Opslaan mislukt: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (allowed === false) {
    return (
      <main className="min-h-screen bg-stone-950 flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Geen toegang</h1>
          <p className="text-stone-400 mb-6">
            Deze pagina is alleen voor de site eigenaar.
          </p>
          <Link href="/" className="text-orange-400 hover:text-orange-300">
            ← Terug naar home
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-stone-500 text-sm">Loading admin...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-stone-100">
      <header className="border-b border-white/5 sticky top-0 bg-stone-950/80 backdrop-blur z-40">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-stone-400 hover:text-orange-400 flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> App
            </Link>
            <div className="w-px h-5 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-orange-600 rounded-md flex items-center justify-center">
                <Zap size={13} className="text-stone-950" strokeWidth={2.8} />
              </div>
              <div>
                <h1 className="text-sm font-bold">Admin</h1>
                <div className="text-[10px] text-stone-500 -mt-0.5">
                  Site content editor
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-sm text-stone-300 hover:text-orange-400 px-3 py-1.5 rounded-md border border-white/10"
            >
              <Eye size={13} /> Preview
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-4 pb-32">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
            Landing copy
          </h2>
          <p className="text-stone-400">
            Klap een sectie open en pas tekst aan. Save bovenaan om live te
            zetten — landing leest direct uit DB.
          </p>
        </div>

        {error && (
          <div className="border border-orange-500 bg-orange-500/5 rounded-lg p-3 text-sm text-orange-300">
            {error}
          </div>
        )}

        <Section
          id="hero"
          title="Hero (boven aan landing)"
          openSection={openSection}
          setOpenSection={setOpenSection}
          onReset={() => resetSection("hero")}
        >
          <Field
            label="Badge tekst"
            value={content.hero.badge}
            onChange={(v) => update("hero", "badge", v)}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Titel regel 1"
              value={content.hero.title_line1}
              onChange={(v) => update("hero", "title_line1", v)}
            />
            <Field
              label="Titel regel 2 (oranje gradient)"
              value={content.hero.title_line2_gradient}
              onChange={(v) => update("hero", "title_line2_gradient", v)}
            />
          </div>
          <Field
            label="Subtitel"
            value={content.hero.subtitle}
            onChange={(v) => update("hero", "subtitle", v)}
            multiline
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Primary CTA knop"
              value={content.hero.primary_cta}
              onChange={(v) => update("hero", "primary_cta", v)}
            />
            <Field
              label="Secondary CTA knop"
              value={content.hero.secondary_cta}
              onChange={(v) => update("hero", "secondary_cta", v)}
            />
          </div>
        </Section>

        <Section
          id="hero_dashboard"
          title="Hero · Dashboard mockup"
          openSection={openSection}
          setOpenSection={setOpenSection}
          onReset={() => resetSection("hero_dashboard")}
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Dag label"
              value={content.hero_dashboard.day_label}
              onChange={(v) => update("hero_dashboard", "day_label", v)}
            />
            <Field
              label="Workout titel"
              value={content.hero_dashboard.workout_title}
              onChange={(v) => update("hero_dashboard", "workout_title", v)}
            />
          </div>
          <Field
            label="Workout subtitel"
            value={content.hero_dashboard.workout_subtitle}
            onChange={(v) => update("hero_dashboard", "workout_subtitle", v)}
            multiline
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field
              label="Gewicht (kg)"
              value={String(content.hero_dashboard.weight_kg)}
              onChange={(v) =>
                update("hero_dashboard", "weight_kg", parseFloat(v) || 0)
              }
              type="number"
            />
            <Field
              label="Δ kg"
              value={String(content.hero_dashboard.weight_delta)}
              onChange={(v) =>
                update("hero_dashboard", "weight_delta", parseFloat(v) || 0)
              }
              type="number"
            />
            <Field
              label="Stappen"
              value={String(content.hero_dashboard.steps)}
              onChange={(v) =>
                update("hero_dashboard", "steps", parseInt(v) || 0)
              }
              type="number"
            />
            <Field
              label="Kcal"
              value={String(content.hero_dashboard.kcal)}
              onChange={(v) =>
                update("hero_dashboard", "kcal", parseInt(v) || 0)
              }
              type="number"
            />
          </div>
          <Field
            label="Eiwit (g)"
            value={String(content.hero_dashboard.protein)}
            onChange={(v) =>
              update("hero_dashboard", "protein", parseInt(v) || 0)
            }
            type="number"
          />
        </Section>

        <Section
          id="hero_chat"
          title="Hero · AI Coach mini"
          openSection={openSection}
          setOpenSection={setOpenSection}
          onReset={() => resetSection("hero_chat")}
        >
          <Field
            label="User vraag"
            value={content.hero_chat.user_message}
            onChange={(v) => update("hero_chat", "user_message", v)}
          />
          <Field
            label="AI antwoord"
            value={content.hero_chat.ai_message}
            onChange={(v) => update("hero_chat", "ai_message", v)}
            multiline
          />
        </Section>

        <Section
          id="hero_log"
          title="Hero · Daglog mini"
          openSection={openSection}
          setOpenSection={setOpenSection}
          onReset={() => resetSection("hero_log")}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field
              label="Hoofd score (0-10)"
              value={String(content.hero_log.score)}
              onChange={(v) => update("hero_log", "score", parseInt(v) || 0)}
              type="number"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field
              label="Metric 1 label"
              value={content.hero_log.metric1_label}
              onChange={(v) => update("hero_log", "metric1_label", v)}
            />
            <Field
              label="Metric 1 score"
              value={String(content.hero_log.metric1_score)}
              onChange={(v) =>
                update("hero_log", "metric1_score", parseInt(v) || 0)
              }
              type="number"
            />
            <div />
            <Field
              label="Metric 2 label"
              value={content.hero_log.metric2_label}
              onChange={(v) => update("hero_log", "metric2_label", v)}
            />
            <Field
              label="Metric 2 score"
              value={String(content.hero_log.metric2_score)}
              onChange={(v) =>
                update("hero_log", "metric2_score", parseInt(v) || 0)
              }
              type="number"
            />
            <div />
            <Field
              label="Metric 3 label"
              value={content.hero_log.metric3_label}
              onChange={(v) => update("hero_log", "metric3_label", v)}
            />
            <Field
              label="Metric 3 score"
              value={String(content.hero_log.metric3_score)}
              onChange={(v) =>
                update("hero_log", "metric3_score", parseInt(v) || 0)
              }
              type="number"
            />
            <div />
          </div>
          <Field
            label="Tip voor morgen"
            value={content.hero_log.tomorrow_tip}
            onChange={(v) => update("hero_log", "tomorrow_tip", v)}
          />
        </Section>

        <Section
          id="coach"
          title="AI Coach sectie"
          openSection={openSection}
          setOpenSection={setOpenSection}
          onReset={() => resetSection("coach")}
        >
          <Field
            label="Eyebrow (klein label boven titel)"
            value={content.coach.eyebrow}
            onChange={(v) => update("coach", "eyebrow", v)}
          />
          <div className="grid sm:grid-cols-3 gap-3">
            <Field
              label="Titel start"
              value={content.coach.title_part1}
              onChange={(v) => update("coach", "title_part1", v)}
            />
            <Field
              label="Titel midden (oranje)"
              value={content.coach.title_gradient}
              onChange={(v) => update("coach", "title_gradient", v)}
            />
            <Field
              label="Titel einde"
              value={content.coach.title_part2}
              onChange={(v) => update("coach", "title_part2", v)}
            />
          </div>
          <Field
            label="Subtitel"
            value={content.coach.subtitle}
            onChange={(v) => update("coach", "subtitle", v)}
            multiline
          />
          <div className="border-t border-white/5 pt-4">
            <h4 className="text-sm font-semibold mb-3">4 stat blokjes</h4>
            <StatRow
              valueLabel="Stat 1 waarde"
              valueValue={String(content.coach.stat1_value)}
              valueOnChange={(v) =>
                update("coach", "stat1_value", parseInt(v) || 0)
              }
              labelLabel="Label"
              labelValue={content.coach.stat1_label}
              labelOnChange={(v) => update("coach", "stat1_label", v)}
              subLabel="Sub"
              subValue={content.coach.stat1_sub}
              subOnChange={(v) => update("coach", "stat1_sub", v)}
            />
            <StatRow
              valueLabel="Stat 2 waarde"
              valueValue={String(content.coach.stat2_value)}
              valueOnChange={(v) =>
                update("coach", "stat2_value", parseInt(v) || 0)
              }
              labelLabel="Label"
              labelValue={content.coach.stat2_label}
              labelOnChange={(v) => update("coach", "stat2_label", v)}
              subLabel="Sub"
              subValue={content.coach.stat2_sub}
              subOnChange={(v) => update("coach", "stat2_sub", v)}
            />
            <StatRow
              valueLabel="Stat 3 waarde"
              valueValue={String(content.coach.stat3_value)}
              valueOnChange={(v) =>
                update("coach", "stat3_value", parseInt(v) || 0)
              }
              labelLabel="Label"
              labelValue={content.coach.stat3_label}
              labelOnChange={(v) => update("coach", "stat3_label", v)}
              subLabel="Sub"
              subValue={content.coach.stat3_sub}
              subOnChange={(v) => update("coach", "stat3_sub", v)}
            />
            <StatRow
              valueLabel="Stat 4 waarde"
              valueValue={String(content.coach.stat4_value)}
              valueOnChange={(v) =>
                update("coach", "stat4_value", parseInt(v) || 0)
              }
              labelLabel="Label"
              labelValue={content.coach.stat4_label}
              labelOnChange={(v) => update("coach", "stat4_label", v)}
              subLabel="Sub"
              subValue={content.coach.stat4_sub}
              subOnChange={(v) => update("coach", "stat4_sub", v)}
            />
          </div>
          <div className="border-t border-white/5 pt-4">
            <h4 className="text-sm font-semibold mb-3">
              Voorbeeld chat (live typing)
            </h4>
            <Field
              label="User vraag 1"
              value={content.coach.chat_user1}
              onChange={(v) => update("coach", "chat_user1", v)}
            />
            <Field
              label="AI antwoord 1"
              value={content.coach.chat_ai1}
              onChange={(v) => update("coach", "chat_ai1", v)}
              multiline
            />
            <Field
              label="User vraag 2"
              value={content.coach.chat_user2}
              onChange={(v) => update("coach", "chat_user2", v)}
            />
            <Field
              label="AI antwoord 2"
              value={content.coach.chat_ai2}
              onChange={(v) => update("coach", "chat_ai2", v)}
              multiline
            />
          </div>
        </Section>

        <Section
          id="features"
          title="Features grid"
          openSection={openSection}
          setOpenSection={setOpenSection}
          onReset={() => resetSection("features")}
        >
          <Field
            label="Eyebrow"
            value={content.features.eyebrow}
            onChange={(v) => update("features", "eyebrow", v)}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Titel deel 1"
              value={content.features.title_part1}
              onChange={(v) => update("features", "title_part1", v)}
            />
            <Field
              label="Titel deel 2 (gemute)"
              value={content.features.title_part2}
              onChange={(v) => update("features", "title_part2", v)}
            />
          </div>
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="border-t border-white/5 pt-3 grid sm:grid-cols-3 gap-3"
            >
              <div className="text-xs text-stone-500 sm:col-span-3 font-semibold">
                Card {n}
              </div>
              <Field
                label="Titel"
                value={(content.features as any)[`card${n}_title`]}
                onChange={(v) => update("features", `card${n}_title`, v)}
              />
              <div className="sm:col-span-2">
                <Field
                  label="Beschrijving"
                  value={(content.features as any)[`card${n}_desc`]}
                  onChange={(v) => update("features", `card${n}_desc`, v)}
                  multiline
                />
              </div>
            </div>
          ))}
        </Section>

        <Section
          id="pricing"
          title="Pricing kaart"
          openSection={openSection}
          setOpenSection={setOpenSection}
          onReset={() => resetSection("pricing")}
        >
          <Field
            label="Eyebrow"
            value={content.pricing.eyebrow}
            onChange={(v) => update("pricing", "eyebrow", v)}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Titel deel 1"
              value={content.pricing.title_part1}
              onChange={(v) => update("pricing", "title_part1", v)}
            />
            <Field
              label="Titel deel 2 (gemute)"
              value={content.pricing.title_part2}
              onChange={(v) => update("pricing", "title_part2", v)}
            />
          </div>
          <Field
            label="Subtitel"
            value={content.pricing.subtitle}
            onChange={(v) => update("pricing", "subtitle", v)}
            multiline
          />
          <div className="grid sm:grid-cols-3 gap-3">
            <Field
              label="Badge top-rechts"
              value={content.pricing.badge}
              onChange={(v) => update("pricing", "badge", v)}
            />
            <Field
              label="Plan naam"
              value={content.pricing.plan_name}
              onChange={(v) => update("pricing", "plan_name", v)}
            />
            <Field
              label="Prijs"
              value={content.pricing.price}
              onChange={(v) => update("pricing", "price", v)}
            />
          </div>
          <Field
            label="Periode (bv '/ maand')"
            value={content.pricing.period}
            onChange={(v) => update("pricing", "period", v)}
          />
          <div className="border-t border-white/5 pt-4">
            <h4 className="text-sm font-semibold mb-3">6 features bullets</h4>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Field
                key={n}
                label={`Feature ${n}`}
                value={(content.pricing as any)[`feature${n}`]}
                onChange={(v) => update("pricing", `feature${n}`, v)}
              />
            ))}
          </div>
          <Field
            label="CTA knop"
            value={content.pricing.cta}
            onChange={(v) => update("pricing", "cta", v)}
          />
          <Field
            label="Kleine tekst onder knop"
            value={content.pricing.small_text}
            onChange={(v) => update("pricing", "small_text", v)}
          />
        </Section>

        <Section
          id="cta"
          title="Final CTA (onderaan)"
          openSection={openSection}
          setOpenSection={setOpenSection}
          onReset={() => resetSection("cta")}
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Titel deel 1"
              value={content.cta.title_part1}
              onChange={(v) => update("cta", "title_part1", v)}
            />
            <Field
              label="Titel deel 2 (oranje)"
              value={content.cta.title_gradient}
              onChange={(v) => update("cta", "title_gradient", v)}
            />
          </div>
          <Field
            label="Subtitel"
            value={content.cta.subtitle}
            onChange={(v) => update("cta", "subtitle", v)}
            multiline
          />
          <Field
            label="Knop"
            value={content.cta.button}
            onChange={(v) => update("cta", "button", v)}
          />
        </Section>
      </section>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-stone-950/95 backdrop-blur-xl pb-safe z-50">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <div className="text-sm">
            {savedAt && Date.now() - savedAt < 4000 ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <Check size={14} /> Opgeslagen — live op{" "}
                <Link href="/" target="_blank" className="underline">
                  /
                </Link>
              </span>
            ) : (
              <span className="text-stone-500">
                Edit en klik save om live te zetten
              </span>
            )}
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={14} />
            {saving ? "Saving..." : "Save & publish"}
          </button>
        </div>
      </div>
    </main>
  );
}

function Section({
  id,
  title,
  openSection,
  setOpenSection,
  onReset,
  children,
}: {
  id: string;
  title: string;
  openSection: string | null;
  setOpenSection: (s: string | null) => void;
  onReset: () => void;
  children: React.ReactNode;
}) {
  const open = openSection === id;
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpenSection(open ? null : id)}
        className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <h3 className="font-semibold">{title}</h3>
        <ChevronDown
          size={18}
          className={`text-stone-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-white/5 p-4 md:p-5 space-y-3">
          {children}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onReset}
              className="text-xs text-stone-500 hover:text-orange-400 flex items-center gap-1"
            >
              <RotateCcw size={11} /> Reset deze sectie naar default
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  type?: "text" | "number";
}) {
  const base =
    "w-full bg-stone-900 border border-white/10 rounded-md px-3 py-2.5 text-stone-100 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-colors";
  return (
    <label className="block">
      <div className="text-xs text-stone-400 font-medium mb-1.5">{label}</div>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={`${base} leading-relaxed`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      )}
    </label>
  );
}

function StatRow({
  valueLabel,
  valueValue,
  valueOnChange,
  labelLabel,
  labelValue,
  labelOnChange,
  subLabel,
  subValue,
  subOnChange,
}: {
  valueLabel: string;
  valueValue: string;
  valueOnChange: (v: string) => void;
  labelLabel: string;
  labelValue: string;
  labelOnChange: (v: string) => void;
  subLabel: string;
  subValue: string;
  subOnChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
      <Field
        label={valueLabel}
        value={valueValue}
        onChange={valueOnChange}
        type="number"
      />
      <Field label={labelLabel} value={labelValue} onChange={labelOnChange} />
      <Field label={subLabel} value={subValue} onChange={subOnChange} />
    </div>
  );
}
