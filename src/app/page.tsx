"use client";

import Link from "next/link";
import {
  Activity,
  Brain,
  Camera,
  Dumbbell,
  Flame,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  CountUp,
  CursorGlow,
  DrawChart,
  Reveal,
  TiltCard,
  Typewriter,
} from "@/components/landing/interactions";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-stone-100 overflow-x-hidden relative">
      <CursorGlow />
      <Header />
      <Hero />
      <Coach />
      <FeaturesGrid />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}

/* ============================================================
   HEADER
   ============================================================ */
function Header() {
  return (
    <header className="sticky top-0 z-50 bg-stone-950/70 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-md flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-shadow">
            <Zap size={15} className="text-stone-950" strokeWidth={2.8} />
          </div>
          <span className="font-bold tracking-tight">FORGE</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-stone-400">
          <a href="#coach" className="hover:text-stone-100 transition-colors">
            AI Coach
          </a>
          <a href="#features" className="hover:text-stone-100 transition-colors">
            Features
          </a>
          <a href="#pricing" className="hover:text-stone-100 transition-colors">
            Prijs
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="px-3 py-1.5 text-sm text-stone-300 hover:text-stone-100 transition-colors"
          >
            Login
          </Link>
          <Link href="/register" className="btn-primary text-sm">
            Start gratis
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ============================================================
   HERO — title + dashboard mockup with floaters poking out
   ============================================================ */
function Hero() {
  return (
    <section className="relative pt-10 md:pt-14 pb-16 md:pb-20">
      <div className="absolute inset-0 bg-mesh pointer-events-none opacity-80" />
      <div className="absolute inset-0 bg-grid pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-4xl mx-auto">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/5 backdrop-blur text-xs text-orange-200 font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 pulse-soft" />
              Coach in je broekzak — €2/mo
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tightest leading-[0.9] mb-5">
              Train. Eet.
              <br />
              <span className="text-gradient-orange">Verbeter.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-lg md:text-xl text-stone-400 max-w-2xl mx-auto mb-7 leading-relaxed">
              Eén dashboard voor je hele journey. AI coach die je profiel kent
              en elke dag zegt wat je morgen moet doen.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/register" className="btn-primary text-base px-8 py-4">
                Start je traject →
              </Link>
              <a href="#coach" className="btn-ghost text-base px-8 py-4">
                Zie de coach
              </a>
            </div>
          </Reveal>
        </div>

        {/* Mockup composition — dashboard centraal in normale flow,
            chat + daglog floaters overlappen de hoeken (alsof ze eruit poppen) */}
        <Reveal delay={400}>
          <div className="relative mt-10 md:mt-14 max-w-3xl mx-auto">
            <div className="absolute -inset-12 bg-glow-orange opacity-60 pointer-events-none" />

            {/* DASHBOARD — main mockup, normal flow */}
            <div className="relative z-20 float-y">
              <TiltCard className="rounded-2xl" intensity={3}>
                <div className="rounded-2xl border border-white/10 bg-stone-950/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden">
                  <div className="border-b border-white/5 px-4 py-2.5 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-stone-700" />
                      <div className="w-2 h-2 rounded-full bg-stone-700" />
                      <div className="w-2 h-2 rounded-full bg-stone-700" />
                    </div>
                    <div className="text-[10px] text-stone-500 ml-2">forge — Dashboard</div>
                  </div>
                  <div className="p-4 md:p-5">
                    <DashboardPreview />
                  </div>
                </div>
              </TiltCard>
            </div>

            {/* CHAT MINI — pops out of top-left corner */}
            <div className="hidden md:block absolute -top-6 -left-12 lg:-left-20 w-[210px] z-30 float-y-delay">
              <TiltCard className="rounded-2xl" intensity={6}>
                <ChatMini />
              </TiltCard>
            </div>

            {/* LOG MINI — pops out of bottom-right corner */}
            <div className="hidden md:block absolute -bottom-6 -right-12 lg:-right-20 w-[210px] z-30 float-y-delay-2">
              <TiltCard className="rounded-2xl" intensity={6}>
                <LogMini />
              </TiltCard>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ChatMini() {
  return (
    <div className="rounded-2xl border border-white/10 bg-stone-950/95 backdrop-blur-sm shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden">
      <div className="border-b border-white/5 px-3 py-2 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-soft" />
        <span className="text-[10px] text-stone-400 font-medium">AI Coach</span>
      </div>
      <div className="p-3 space-y-2">
        <div className="bg-orange-500 text-stone-950 rounded-xl rounded-tr-sm px-2.5 py-1.5 text-[11px] font-medium ml-6">
          <Typewriter text="Wat eet ik vandaag?" speedMs={28} />
        </div>
        <div className="bg-stone-900 border border-white/5 rounded-xl rounded-tl-sm px-2.5 py-1.5 text-[11px] leading-snug text-stone-200">
          <Typewriter
            text="Cut-doel: 2400 kcal, 200g eiwit. Vandaag rest, dus 50g minder carbs."
            speedMs={16}
            startDelayMs={1200}
          />
        </div>
      </div>
    </div>
  );
}

function LogMini() {
  return (
    <div className="rounded-2xl border border-white/10 bg-stone-950/95 backdrop-blur-sm shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden">
      <div className="border-b border-white/5 px-3 py-2 flex items-center justify-between">
        <span className="text-[10px] text-stone-400 font-medium">Dag-feedback</span>
        <div className="w-7 h-7 rounded-md bg-orange-500/10 border border-orange-500/40 flex items-center justify-center">
          <span className="hero-num text-xs text-orange-400">
            <CountUp to={8} duration={900} />
          </span>
        </div>
      </div>
      <div className="p-3 space-y-1.5 text-[11px]">
        {[
          { l: "Voeding", s: 8, c: "text-emerald-400" },
          { l: "Training", s: 9, c: "text-emerald-400" },
          { l: "Herstel", s: 6, c: "text-orange-400" },
        ].map((r, i) => (
          <div key={r.l} className="flex items-center justify-between">
            <span className="text-stone-400">{r.l}</span>
            <span className={`hero-num ${r.c}`}>
              <CountUp to={r.s} duration={800 + i * 150} />
            </span>
          </div>
        ))}
        <div className="border-l-2 border-orange-500 pl-2 text-stone-300 text-[10px] mt-2 leading-snug">
          → 1L meer water morgen
        </div>
      </div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="space-y-4 rise-in">
      <div className="bg-gradient-to-br from-orange-500/15 to-transparent border border-orange-500/20 rounded-xl p-5 md:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 blur-3xl rounded-full" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 pulse-soft" />
            <span className="text-[11px] uppercase tracking-wider text-orange-300 font-semibold">
              Maandag · 5 mei
            </span>
          </div>
          <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-1">
            Push Day
          </h3>
          <p className="text-sm text-stone-400">
            Bench Press 4×8 · Incline DB 3×10 · Shoulder Press 3×10
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <PreviewStat label="Gewicht" value={<><CountUp to={98.2} decimals={1} /><span className="text-xs text-stone-500 ml-1">kg</span></>} sub={<span className="text-emerald-400 num">−<CountUp to={1.2} decimals={1} />kg</span>} />
        <PreviewStat label="Stappen" value={<><CountUp to={8400} /></>} />
        <PreviewStat label="Kcal" value={<CountUp to={2140} />} />
        <PreviewStat label="Eiwit" value={<><CountUp to={186} /><span className="text-xs text-stone-500 ml-1">g</span></>} />
      </div>

      <div className="bg-stone-900/60 border border-white/5 rounded-xl p-4 h-28 md:h-32 relative">
        <div className="text-[10px] text-stone-500 font-medium absolute top-3 left-3">
          Gewicht 30 dagen
        </div>
        <DrawChart
          width={400}
          height={100}
          duration={1800}
          delay={300}
          fillId="hero-fill"
          pathD="M0,80 C50,70 80,30 130,40 C180,50 220,20 280,28 C340,35 380,18 400,22"
          className="absolute inset-x-0 bottom-0 h-3/4"
        />
      </div>
    </div>
  );
}

function PreviewStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="bg-stone-900/60 border border-white/5 rounded-lg p-3">
      <div className="text-[10px] text-stone-500 font-medium mb-1">{label}</div>
      <div className="hero-num text-xl md:text-2xl text-stone-100">{value}</div>
      {sub && <div className="text-[10px] mt-1">{sub}</div>}
    </div>
  );
}

/* (CoachPreview & LogPreview removed — replaced by ChatMini & LogMini in Hero) */

/* ============================================================
   COACH section (showcase + counts)
   ============================================================ */
function Coach() {
  return (
    <section
      id="coach"
      className="py-20 md:py-32 border-t border-white/5 relative"
    >
      <div className="absolute top-0 right-0 w-1/2 h-full bg-glow-pink pointer-events-none opacity-40" />
      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <Reveal>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-orange-400 mb-3 font-semibold flex items-center gap-2">
                <Brain size={14} /> AI Coach
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tightest leading-[0.95] mb-6">
                Een coach die <span className="text-gradient-orange">jou</span>{" "}
                kent.
              </h2>
              <p className="text-lg text-stone-400 mb-8 leading-relaxed">
                Niet zomaar een chatbot. FORGE's coach wordt gevoed met je hele
                profiel. Antwoord altijd in jouw context.
              </p>
              <div className="grid grid-cols-2 gap-5">
                <CountStat
                  to={4}
                  label="Coach-stijlen"
                  sub="Streng / motiverend / educatief / chill"
                />
                <CountStat
                  to={20}
                  prefix="+"
                  label="Profielvelden"
                  sub="Lichaam, dieet, training, slaap..."
                />
                <CountStat
                  to={7}
                  label="Dagen geheugen"
                  sub="Trend-context bij elk antwoord"
                />
                <CountStat
                  to={100}
                  suffix="%"
                  label="Privé"
                  sub="Jouw key, jouw data, alleen jij"
                />
              </div>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <CoachChatBig />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CountStat({
  to,
  prefix,
  suffix,
  label,
  sub,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  label: string;
  sub: string;
}) {
  return (
    <div>
      <div className="hero-num text-4xl md:text-5xl text-gradient-orange mb-1">
        <CountUp to={to} prefix={prefix} suffix={suffix} duration={1600} />
      </div>
      <div className="text-sm text-stone-100 font-semibold">{label}</div>
      <div className="text-xs text-stone-500 mt-0.5 leading-snug">{sub}</div>
    </div>
  );
}

function CoachChatBig() {
  return (
    <div className="card p-6 shadow-2xl shadow-orange-500/10 glow-pulse">
      <div className="flex items-center gap-2 pb-3 border-b border-white/5 mb-4">
        <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-soft" />
        <span className="text-xs text-stone-400 font-medium">
          AI Coach — Online
        </span>
      </div>
      <div className="space-y-3">
        <div className="bg-orange-500 text-stone-950 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm font-medium ml-10">
          <Typewriter text="Hoe ga ik mijn cut beter aanpakken?" />
        </div>
        <div className="bg-stone-900 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-stone-200 mr-10 leading-relaxed">
          <Typewriter
            text="Je weegt 98.2 richting 92 in 16 weken — 0.4kg/week. Realistisch. Drie dingen: 1) Eiwit naar 200g (nu 186 gem) 2) Stappen naar 8k op rustdagen 3) Bewaar Monster Zero voor pre-workout."
            speedMs={14}
            startDelayMs={1700}
          />
        </div>
        <div className="bg-orange-500 text-stone-950 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm font-medium ml-10">
          <Typewriter
            text="En mijn slaap?"
            startDelayMs={7500}
          />
        </div>
        <div className="bg-stone-900 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-stone-200 mr-10 leading-relaxed">
          <Typewriter
            text="Je 7u is OK maar stress is hoog. Probeer 1 week: laatste maaltijd 3u voor bed, geen scherm 30 min ervoor, kamer onder 18°."
            speedMs={14}
            startDelayMs={9000}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FEATURES — 4 bento cards (simpler than before)
   ============================================================ */
function FeaturesGrid() {
  return (
    <section
      id="features"
      className="py-20 md:py-32 border-t border-white/5"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs uppercase tracking-[0.2em] text-orange-400 mb-3 font-semibold">
              Alles in één
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tightest leading-[1.05]">
              Eén app. <span className="text-gradient-mute">Volledige controle.</span>
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Reveal delay={0}>
            <TiltCard className="rounded-2xl">
              <div className="card p-6 h-full md:h-[280px] relative overflow-hidden card-hover bg-gradient-to-br from-orange-500/5 to-transparent">
                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 blur-3xl rounded-full" />
                <Activity className="text-orange-400 mb-3" size={24} />
                <h3 className="font-bold text-lg mb-1.5">Live dashboard</h3>
                <p className="text-sm text-stone-400 mb-4">
                  Hero-metrics, trends, voortgang. Update bij elke log.
                </p>
                <div className="hero-num text-4xl md:text-5xl text-stone-100">
                  <CountUp to={98.2} decimals={1} />
                  <span className="text-lg text-stone-500 ml-1">kg</span>
                </div>
              </div>
            </TiltCard>
          </Reveal>

          <Reveal delay={100}>
            <TiltCard className="rounded-2xl">
              <div className="card p-6 h-full md:h-[280px] relative overflow-hidden card-hover bg-gradient-to-br from-pink-500/5 to-transparent">
                <Camera className="text-pink-400 mb-3" size={24} />
                <h3 className="font-bold text-lg mb-1.5">Foto check-ins</h3>
                <p className="text-sm text-stone-400 mb-4">
                  3 hoeken per week, AI vergelijkt en wijst veranderingen aan.
                </p>
                <div className="grid grid-cols-3 gap-1.5 mt-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="aspect-[3/4] rounded bg-gradient-to-br from-stone-700 to-stone-900 border border-white/5"
                    />
                  ))}
                </div>
              </div>
            </TiltCard>
          </Reveal>

          <Reveal delay={200}>
            <TiltCard className="rounded-2xl">
              <div className="card p-6 h-full md:h-[280px] relative overflow-hidden card-hover bg-gradient-to-br from-lime-500/5 to-transparent">
                <Sparkles className="text-lime-400 mb-3" size={24} />
                <h3 className="font-bold text-lg mb-1.5">Voedingsanalyse</h3>
                <p className="text-sm text-stone-400 mb-4">
                  Type wat je at, AI rekent kcal en macros uit.
                </p>
                <div className="space-y-1.5">
                  {[
                    { l: "Eiwit", v: 80, c: "bg-orange-500" },
                    { l: "Carbs", v: 55, c: "bg-orange-400" },
                    { l: "Vet", v: 40, c: "bg-orange-300" },
                  ].map((r) => (
                    <div key={r.l} className="flex items-center gap-2">
                      <span className="text-[10px] text-stone-500 w-10">
                        {r.l}
                      </span>
                      <div className="flex-1 h-1.5 bg-stone-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${r.c} rounded-full`}
                          style={{ width: `${r.v}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TiltCard>
          </Reveal>

          <Reveal delay={50}>
            <TiltCard className="rounded-2xl md:col-span-2">
              <div className="card p-6 h-full relative overflow-hidden card-hover bg-gradient-to-br from-amber-500/5 to-transparent">
                <Flame className="text-amber-400 mb-3" size={24} />
                <h3 className="font-bold text-lg mb-1.5">
                  Wekelijks coach-rapport
                </h3>
                <p className="text-sm text-stone-400 mb-4">
                  Wat ging goed, wat niet, focus voor volgende week.
                </p>
                <div className="grid grid-cols-3 gap-2 max-w-md">
                  <RapportStat label="Sport" v={5} suffix="×" />
                  <RapportStat label="Cal/dag" v={2180} />
                  <RapportStat label="Eiwit" v={192} suffix="g" />
                </div>
              </div>
            </TiltCard>
          </Reveal>

          <Reveal delay={150}>
            <TiltCard className="rounded-2xl">
              <div className="card p-6 h-full md:h-[260px] relative overflow-hidden card-hover bg-gradient-to-br from-cyan-500/5 to-transparent">
                <Dumbbell className="text-cyan-400 mb-3" size={24} />
                <h3 className="font-bold text-lg mb-1.5">Training­schema</h3>
                <p className="text-sm text-stone-400 mb-3">
                  Per dag wat je traint. Werkt op je telefoon in de gym.
                </p>
                <div className="space-y-1">
                  {["MA · Push", "DI · Pull", "WO · Legs"].map((d) => (
                    <div
                      key={d}
                      className="text-xs text-stone-300 bg-stone-900/60 border border-white/5 rounded px-2 py-1.5"
                    >
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function RapportStat({
  label,
  v,
  suffix,
}: {
  label: string;
  v: number;
  suffix?: string;
}) {
  return (
    <div className="bg-stone-900/60 border border-white/5 rounded-lg p-3">
      <div className="text-[10px] text-stone-500 mb-0.5">{label}</div>
      <div className="hero-num text-xl text-stone-100">
        <CountUp to={v} suffix={suffix} />
      </div>
    </div>
  );
}

/* ============================================================
   PRICING
   ============================================================ */
function Pricing() {
  return (
    <section
      id="pricing"
      className="py-20 md:py-32 border-t border-white/5 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-glow-orange opacity-30 pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        <Reveal>
          <div className="text-center mb-14">
            <div className="text-xs uppercase tracking-[0.2em] text-orange-400 mb-3 font-semibold">
              Prijs
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tightest leading-[1.05]">
              Twee euro <span className="text-gradient-mute">per maand.</span>
            </h2>
            <p className="text-lg text-stone-400 mt-4 max-w-xl mx-auto">
              Genoeg om hosting + AI te dekken. Niet meer.
            </p>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="max-w-md mx-auto">
            <TiltCard className="rounded-2xl" intensity={5}>
              <div className="card relative overflow-hidden p-8 glow-pulse">
                <div className="absolute -top-px -right-px px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 text-xs font-bold rounded-bl-lg rounded-tr-[14px]">
                  EARLY ACCESS
                </div>
                <div className="text-sm text-stone-400 mb-2 font-medium">
                  FORGE Pro
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="hero-num text-7xl text-gradient-orange">
                    €<CountUp to={2} duration={1000} />
                  </span>
                  <span className="text-stone-500 ml-1">/ maand</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm">
                  {[
                    "Unlimited daily logs + AI feedback",
                    "Wekelijkse foto check-ins (3 hoeken)",
                    "Persoonlijke AI coach met jouw key",
                    "Wekelijkse coach-rapporten",
                    "Dashboard met 10+ tabs",
                    "100% privé per gebruiker (RLS)",
                  ].map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2.5 text-stone-300"
                    >
                      <span className="text-emerald-400 mt-0.5 font-bold">
                        ✓
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="block text-center btn-primary w-full text-base py-3.5"
                >
                  Start nu gratis
                </Link>
                <p className="text-xs text-stone-500 mt-3 text-center">
                  Tijdens early-access gratis. Stripe komt later.
                </p>
              </div>
            </TiltCard>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   FINAL CTA
   ============================================================ */
function CTA() {
  return (
    <section className="py-24 md:py-40 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh pointer-events-none" />
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-50" />
      <div className="relative max-w-3xl mx-auto px-4 md:px-6 text-center">
        <Reveal>
          <h2 className="text-5xl md:text-8xl font-extrabold tracking-tightest leading-[0.95] mb-6">
            Tijd om <span className="text-gradient-orange">te starten.</span>
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="text-lg text-stone-400 mb-10 max-w-xl mx-auto">
            Account in 10 seconden. Onboarding in 3 minuten. Eerste
            dag-feedback vanavond.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <Link href="/register" className="btn-primary text-lg px-10 py-5">
            Start je traject →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-orange-600 rounded-md flex items-center justify-center">
            <Zap size={13} className="text-stone-950" strokeWidth={2.8} />
          </div>
          <span>FORGE · Personal Sport OS</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="#features" className="hover:text-stone-300">
            Features
          </a>
          <a href="#pricing" className="hover:text-stone-300">
            Prijs
          </a>
          <Link href="/login" className="hover:text-stone-300">
            Login
          </Link>
        </div>
        <span>{new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
