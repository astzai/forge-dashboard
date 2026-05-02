"use client";

import { createClient } from "@/lib/supabase/client";

/* ============================================================
   Editable site content — types + defaults
   ============================================================ */

export type SiteContent = {
  hero: {
    badge: string;
    title_line1: string;
    title_line2_gradient: string;
    subtitle: string;
    primary_cta: string;
    secondary_cta: string;
  };
  hero_chat: {
    user_message: string;
    ai_message: string;
  };
  hero_log: {
    score: number;
    metric1_label: string;
    metric1_score: number;
    metric2_label: string;
    metric2_score: number;
    metric3_label: string;
    metric3_score: number;
    tomorrow_tip: string;
  };
  hero_dashboard: {
    day_label: string;
    workout_title: string;
    workout_subtitle: string;
    weight_kg: number;
    weight_delta: number;
    steps: number;
    kcal: number;
    protein: number;
  };
  coach: {
    eyebrow: string;
    title_part1: string;
    title_gradient: string;
    title_part2: string;
    subtitle: string;
    stat1_value: number;
    stat1_label: string;
    stat1_sub: string;
    stat2_value: number;
    stat2_prefix: string;
    stat2_label: string;
    stat2_sub: string;
    stat3_value: number;
    stat3_label: string;
    stat3_sub: string;
    stat4_value: number;
    stat4_suffix: string;
    stat4_label: string;
    stat4_sub: string;
    chat_user1: string;
    chat_ai1: string;
    chat_user2: string;
    chat_ai2: string;
  };
  features: {
    eyebrow: string;
    title_part1: string;
    title_part2: string;
    card1_title: string;
    card1_desc: string;
    card2_title: string;
    card2_desc: string;
    card3_title: string;
    card3_desc: string;
    card4_title: string;
    card4_desc: string;
    card5_title: string;
    card5_desc: string;
  };
  pricing: {
    eyebrow: string;
    title_part1: string;
    title_part2: string;
    subtitle: string;
    badge: string;
    plan_name: string;
    price: string;
    period: string;
    feature1: string;
    feature2: string;
    feature3: string;
    feature4: string;
    feature5: string;
    feature6: string;
    cta: string;
    small_text: string;
  };
  cta: {
    title_part1: string;
    title_gradient: string;
    subtitle: string;
    button: string;
  };
};

export const DEFAULT_CONTENT: SiteContent = {
  hero: {
    badge: "Coach in je broekzak — €2/mo",
    title_line1: "Train. Eet.",
    title_line2_gradient: "Verbeter.",
    subtitle:
      "Eén dashboard voor je hele journey. AI coach die je profiel kent en elke dag zegt wat je morgen moet doen.",
    primary_cta: "Start je traject →",
    secondary_cta: "Zie de coach",
  },
  hero_chat: {
    user_message: "Wat eet ik vandaag?",
    ai_message:
      "Cut-doel: 2400 kcal, 200g eiwit. Vandaag rest, dus 50g minder carbs.",
  },
  hero_log: {
    score: 8,
    metric1_label: "Voeding",
    metric1_score: 8,
    metric2_label: "Training",
    metric2_score: 9,
    metric3_label: "Herstel",
    metric3_score: 6,
    tomorrow_tip: "1L meer water morgen",
  },
  hero_dashboard: {
    day_label: "Maandag · 5 mei",
    workout_title: "Push Day",
    workout_subtitle: "Bench Press 4×8 · Incline DB 3×10 · Shoulder Press 3×10",
    weight_kg: 98.2,
    weight_delta: -1.2,
    steps: 8400,
    kcal: 2140,
    protein: 186,
  },
  coach: {
    eyebrow: "AI Coach",
    title_part1: "Een coach die ",
    title_gradient: "jou",
    title_part2: " kent.",
    subtitle:
      "Niet zomaar een chatbot. FORGE's coach wordt gevoed met je hele profiel. Antwoord altijd in jouw context.",
    stat1_value: 4,
    stat1_label: "Coach-stijlen",
    stat1_sub: "Streng / motiverend / educatief / chill",
    stat2_value: 20,
    stat2_prefix: "+",
    stat2_label: "Profielvelden",
    stat2_sub: "Lichaam, dieet, training, slaap...",
    stat3_value: 7,
    stat3_label: "Dagen geheugen",
    stat3_sub: "Trend-context bij elk antwoord",
    stat4_value: 100,
    stat4_suffix: "%",
    stat4_label: "Privé",
    stat4_sub: "Jouw key, jouw data, alleen jij",
    chat_user1: "Hoe ga ik mijn cut beter aanpakken?",
    chat_ai1:
      "Je weegt 98.2 richting 92 in 16 weken — 0.4kg/week. Realistisch. Drie dingen: 1) Eiwit naar 200g (nu 186 gem) 2) Stappen naar 8k op rustdagen 3) Bewaar Monster Zero voor pre-workout.",
    chat_user2: "En mijn slaap?",
    chat_ai2:
      "Je 7u is OK maar stress is hoog. Probeer 1 week: laatste maaltijd 3u voor bed, geen scherm 30 min ervoor, kamer onder 18°.",
  },
  features: {
    eyebrow: "Alles in één",
    title_part1: "Eén app. ",
    title_part2: "Volledige controle.",
    card1_title: "Live dashboard",
    card1_desc: "Hero-metrics, trends, voortgang. Update bij elke log.",
    card2_title: "Foto check-ins",
    card2_desc: "3 hoeken per week, AI vergelijkt en wijst veranderingen aan.",
    card3_title: "Voedingsanalyse",
    card3_desc: "Type wat je at, AI rekent kcal en macros uit.",
    card4_title: "Wekelijks coach-rapport",
    card4_desc: "Wat ging goed, wat niet, focus voor volgende week.",
    card5_title: "Trainings­schema",
    card5_desc: "Per dag wat je traint. Werkt op je telefoon in de gym.",
  },
  pricing: {
    eyebrow: "Prijs",
    title_part1: "Twee euro ",
    title_part2: "per maand.",
    subtitle: "Genoeg om hosting + AI te dekken. Niet meer.",
    badge: "EARLY ACCESS",
    plan_name: "FORGE Pro",
    price: "€2",
    period: "/ maand",
    feature1: "Unlimited daily logs + AI feedback",
    feature2: "Wekelijkse foto check-ins (3 hoeken)",
    feature3: "Persoonlijke AI coach met jouw key",
    feature4: "Wekelijkse coach-rapporten",
    feature5: "Dashboard met 10+ tabs",
    feature6: "100% privé per gebruiker (RLS)",
    cta: "Start nu gratis",
    small_text: "Tijdens early-access gratis. Stripe komt later.",
  },
  cta: {
    title_part1: "Tijd om ",
    title_gradient: "te starten.",
    subtitle:
      "Account in 10 seconden. Onboarding in 3 minuten. Eerste dag-feedback vanavond.",
    button: "Start je traject →",
  },
};

/* ============================================================
   Helpers
   ============================================================ */

const OWNER_EMAIL = "woutassink@hotmail.nl";

/** Deep-merge user-saved content over defaults so missing fields fall back. */
export function mergeContent(
  partial: Partial<SiteContent> | null | undefined,
): SiteContent {
  if (!partial || typeof partial !== "object") return DEFAULT_CONTENT;
  const merged: any = {};
  for (const k of Object.keys(DEFAULT_CONTENT) as (keyof SiteContent)[]) {
    merged[k] = { ...DEFAULT_CONTENT[k], ...((partial as any)[k] ?? {}) };
  }
  return merged as SiteContent;
}

export async function fetchSiteContent(): Promise<SiteContent> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("content")
    .eq("id", "global")
    .single();
  if (error || !data) return DEFAULT_CONTENT;
  return mergeContent(data.content as Partial<SiteContent>);
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Niet ingelogd");
  const { error } = await supabase
    .from("site_content")
    .upsert({
      id: "global",
      content,
      updated_by: auth.user.id,
      updated_at: new Date().toISOString(),
    });
  if (error) throw error;
}

export async function isOwnerUser(): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
}

export { OWNER_EMAIL };
