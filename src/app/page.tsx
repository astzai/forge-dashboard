import Link from "next/link";
import {
  Activity,
  Brain,
  Camera,
  ChevronDown,
  ClipboardCheck,
  Dumbbell,
  FileText,
  Lock,
  Sparkles,
  TrendingDown,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-stone-100 overflow-hidden">
      <Header />
      <Hero />
      <SocialProof />
      <HowItWorks />
      <FeaturesGrid />
      <DashboardPreview />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-stone-950/80 backdrop-blur border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Zap size={15} className="text-stone-950" strokeWidth={2.8} />
          </div>
          <span className="font-bold tracking-tight">FORGE</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-stone-400">
          <a href="#features" className="hover:text-stone-100 transition-colors">
            Features
          </a>
          <a href="#pricing" className="hover:text-stone-100 transition-colors">
            Prijs
          </a>
          <a href="#faq" className="hover:text-stone-100 transition-colors">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="px-3 py-1.5 text-sm text-stone-300 hover:text-stone-100 transition-colors"
          >
            Login
          </Link>
          <Link href="/register" className="btn-primary">
            Start gratis
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative bg-grid">
      <div className="absolute inset-0 bg-glow pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-20 md:pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/5 text-xs text-orange-300 font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 pulse-soft" />
          Nieuw — wekelijkse foto check-ins met AI
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tightest leading-[0.95] mb-6">
          Bouw de athlete
          <br />
          <span className="text-gradient">die je wilt zijn.</span>
        </h1>
        <p className="text-lg md:text-xl text-stone-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Track gewicht, training, voeding en foto's in één plek. Een AI coach
          die je profiel kent, je dag scoort en zegt waar je morgen op moet
          letten.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/register" className="btn-primary text-base px-7 py-3.5">
            Start je traject →
          </Link>
          <a
            href="#how"
            className="px-6 py-3.5 text-sm border border-white/10 rounded-md hover:border-white/20 transition-colors"
          >
            Hoe het werkt
          </a>
        </div>
        <div className="mt-6 flex flex-wrap justify-center items-center gap-4 text-xs text-stone-500">
          <span className="flex items-center gap-1.5">
            <Lock size={12} /> Privé per gebruiker
          </span>
          <span className="hidden sm:inline">·</span>
          <span>Geen credit card nodig</span>
          <span className="hidden sm:inline">·</span>
          <span>Cancel wanneer je wilt</span>
        </div>

        {/* Floating preview card */}
        <div className="mt-14 md:mt-20 max-w-4xl mx-auto">
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-stone-950/90 backdrop-blur shadow-2xl shadow-orange-500/10 overflow-hidden">
      <div className="border-b border-white/5 px-5 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-stone-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-stone-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-stone-700" />
        </div>
        <div className="text-xs text-stone-500 ml-3">forge — Dashboard</div>
      </div>
      <div className="p-6 md:p-8 grid md:grid-cols-3 gap-4 text-left">
        <div className="md:col-span-2 bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-xl p-5">
          <div className="text-xs text-orange-300 font-medium mb-1">
            Vandaag · Maandag
          </div>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            Push (Borst, Schouders, Triceps)
          </h3>
          <p className="text-sm text-stone-400">
            Bench Press 4×8, Incline DB Press 3×10, Shoulder Press 3×10...
          </p>
        </div>
        <div className="bg-stone-900/60 border border-white/5 rounded-xl p-5">
          <div className="text-xs text-stone-500 font-medium mb-2">
            Voortgang
          </div>
          <div className="hero-num text-5xl text-stone-100 mb-1">62%</div>
          <div className="text-xs text-stone-500 mb-3">van je doel</div>
          <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full"
              style={{ width: "62%" }}
            />
          </div>
        </div>
        {[
          { l: "Gewicht", v: "98.2", u: "kg", trend: "-1.2" },
          { l: "Stappen", v: "8.4k", u: "" },
          { l: "Calorieën", v: "2,140", u: "kcal" },
          { l: "Eiwit", v: "186", u: "g" },
        ].map((s) => (
          <div
            key={s.l}
            className="bg-stone-900/60 border border-white/5 rounded-xl p-4"
          >
            <div className="text-xs text-stone-500 font-medium mb-1">{s.l}</div>
            <div className="flex items-baseline gap-1">
              <div className="hero-num text-2xl text-stone-100">{s.v}</div>
              <div className="text-xs text-stone-500">{s.u}</div>
            </div>
            {s.trend && (
              <div className="text-xs text-emerald-400 num mt-1">
                {s.trend}kg week
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialProof() {
  return (
    <section className="border-y border-white/5 bg-stone-950/50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          { n: "8", l: "Tabs", sub: "Dashboard, log, foto's, week, AI..." },
          { n: "3", l: "Foto-hoeken", sub: "Voor / zij / rug check-ins" },
          { n: "1×", l: "Per gebruiker", sub: "100% privé, RLS-locked" },
          { n: "€2", l: "Per maand", sub: "Cancel wanneer je wilt" },
        ].map((s) => (
          <div key={s.l}>
            <div className="hero-num text-3xl md:text-4xl text-orange-400 mb-1">
              {s.n}
            </div>
            <div className="text-sm text-stone-200 font-semibold">{s.l}</div>
            <div className="text-xs text-stone-500 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      icon: ClipboardCheck,
      title: "Log je dag in 30 seconden",
      desc: "Gewicht, stappen, sport, en wat je gegeten hebt. AI rekent macros uit, scoort je dag en geeft 1 ding voor morgen.",
    },
    {
      n: "02",
      icon: Camera,
      title: "Foto's elke week",
      desc: "Upload 3 foto's (voor/zij/rug). AI vergelijkt met vorige week en wijst zichtbare veranderingen aan.",
    },
    {
      n: "03",
      icon: FileText,
      title: "Wekelijks coach-rapport",
      desc: "Elke zondag krijg je een samenvatting van je week, wat goed ging, wat niet, en het ene focus-punt voor de week erop.",
    },
  ];
  return (
    <section id="how" className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <div className="text-xs uppercase tracking-[0.2em] text-orange-400 mb-3 font-semibold">
            Hoe het werkt
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tightest leading-tight max-w-2xl mx-auto">
            3 minuten per dag.
            <br />
            <span className="text-stone-500">De rest doet de coach.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.n}
                className="card p-6 md:p-7 hover:border-orange-500/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                    <Icon size={20} className="text-orange-400" />
                  </div>
                  <span className="hero-num text-2xl text-stone-700">
                    {s.n}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-stone-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeaturesGrid() {
  const features = [
    {
      icon: Activity,
      title: "Dashboard met live scores",
      desc: "Zie je voortgang als één getal. Trend over de week. Vandaag-stats.",
    },
    {
      icon: Brain,
      title: "AI coach die jou kent",
      desc: "Trained op je profiel, dieet, training-historie. Antwoordt in jouw taal, jouw context.",
    },
    {
      icon: TrendingDown,
      title: "Gewicht trajectory",
      desc: "Mooie line chart. Week-trend, hoogste, laagste, gemiddelde. Geen Excel meer.",
    },
    {
      icon: Camera,
      title: "Side-by-side foto compare",
      desc: "Sleep slider om week 1 vs week 8 te morphen. Niemand anders ziet je foto's.",
    },
    {
      icon: Dumbbell,
      title: "Trainings­schema",
      desc: "Custom per dag. Klik om je workout te zien. Werkt op je telefoon in de gym.",
    },
    {
      icon: Sparkles,
      title: "Voedingsanalyse",
      desc: "Type wat je gegeten hebt — AI rekent kcal en macros uit. Geen scannen, geen barcodes.",
    },
  ];
  return (
    <section id="features" className="py-20 md:py-28 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <div className="text-xs uppercase tracking-[0.2em] text-orange-400 mb-3 font-semibold">
            Wat je krijgt
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tightest leading-tight max-w-2xl mx-auto">
            Alles wat je nodig hebt.
            <br />
            <span className="text-stone-500">Niet meer, niet minder.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="card p-6 hover:border-orange-500/30 transition-colors"
              >
                <Icon size={22} className="text-orange-400 mb-4" />
                <h3 className="font-bold mb-1.5">{f.title}</h3>
                <p className="text-sm text-stone-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <section className="py-20 md:py-28 border-t border-white/5 bg-grid relative">
      <div className="absolute inset-0 bg-glow pointer-events-none opacity-50" />
      <div className="relative max-w-6xl mx-auto px-4 md:px-6 text-center">
        <div className="text-xs uppercase tracking-[0.2em] text-orange-400 mb-3 font-semibold">
          Op je telefoon en laptop
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tightest leading-tight max-w-3xl mx-auto mb-4">
          Voelt als een echte sport-app.
        </h2>
        <p className="text-lg text-stone-400 max-w-xl mx-auto mb-12">
          Bottom nav op mobile. Volledige dashboard op desktop. Zelfde
          functionaliteit, geen compromis.
        </p>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="card p-6">
            <div className="text-sm text-orange-400 font-semibold mb-2">
              📱 Mobile
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Bottom nav voor duim-bereik. Camera-capture voor foto's. Snel
              loggen tussen sets door.
            </p>
          </div>
          <div className="card p-6">
            <div className="text-sm text-orange-400 font-semibold mb-2">
              💻 Desktop
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Volledige dashboard, alle 8 tabs zichtbaar, perfect voor de
              wekelijkse review.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <div className="text-xs uppercase tracking-[0.2em] text-orange-400 mb-3 font-semibold">
            Prijs
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tightest leading-tight max-w-2xl mx-auto">
            Twee euro per maand.
          </h2>
          <p className="text-lg text-stone-400 mt-4 max-w-xl mx-auto">
            Genoeg om de servers en AI te dekken. Niet meer, niet minder.
          </p>
        </div>
        <div className="max-w-md mx-auto">
          <div className="card p-8 relative overflow-hidden glow-orange transition-shadow">
            <div className="absolute top-0 right-0 px-3 py-1 bg-orange-500 text-stone-950 text-xs font-bold rounded-bl-lg">
              SOON
            </div>
            <div className="text-sm text-stone-400 mb-2">FORGE Pro</div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="hero-num text-6xl text-stone-100">€2</span>
              <span className="text-stone-500">/ maand</span>
            </div>
            <ul className="space-y-3 mb-8 text-sm">
              {[
                "Onbeperkte daglogs",
                "Wekelijkse foto check-ins (3 hoeken)",
                "AI coach met jouw eigen Anthropic key",
                "Wekelijkse coach-rapporten",
                "Volledige history & export",
                "Cancel wanneer je wilt",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-stone-300">
                  <span className="text-orange-400 mt-0.5">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block text-center btn-primary w-full"
            >
              Start nu gratis
            </Link>
            <p className="text-xs text-stone-500 mt-3 text-center">
              Betaling komt later — eerst alles werkend
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const faqs = [
  {
    q: "Hoe is dit anders dan MyFitnessPal of Strava?",
    a: "MyFitnessPal heeft barcode scanning maar geen AI coach die je profiel kent. Strava is voor cardio. FORGE combineert daglogs + foto's + AI coaching in één tool, gemaakt voor mensen die thuis trainen of in de gym en geen 50 features willen.",
  },
  {
    q: "Wat doen jullie met mijn data?",
    a: "Niets. Je data staat in een Supabase database met Row Level Security — niemand anders dan jij kan het zien, ook ik niet. Foto's staan in een private bucket met dezelfde RLS. Je Anthropic key is versleuteld opgeslagen.",
  },
  {
    q: "Heb ik een eigen AI key nodig?",
    a: "Ja. Je gebruikt je eigen Anthropic API key (gratis aan te maken op console.anthropic.com). Hierdoor blijft de prijs laag en is je data 100% van jou. Eerste paar dollar credits zijn gratis bij Anthropic, daarna ~$0.01-0.05 per dag bij normaal gebruik.",
  },
  {
    q: "Werkt het op mijn telefoon?",
    a: "Ja. Volledige mobile-eerst design met bottom nav, camera-capture voor foto-uploads en touch-vriendelijke inputs. Open de site in Safari/Chrome en voeg toe aan home screen voor app-feel.",
  },
  {
    q: "Kan ik mijn data exporteren?",
    a: "Ja. Alle data is in standaard tabellen in Supabase. Je kan altijd alles als CSV downloaden via je Supabase dashboard, of vragen of we een export-knop in de app bouwen.",
  },
  {
    q: "Wanneer komt de betaling?",
    a: "We zijn nog in early-access. Voor nu gratis. Wanneer Stripe + abonnement live staan krijg je een notificatie en 30 dagen om te kiezen.",
  },
];

function FAQ() {
  return (
    <section id="faq" className="py-20 md:py-28 border-t border-white/5">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-[0.2em] text-orange-400 mb-3 font-semibold">
            Vragen
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tightest leading-tight">
            Vaak gestelde vragen.
          </h2>
        </div>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <details
              key={i}
              className="card p-5 group cursor-pointer hover:border-white/15 transition-colors"
            >
              <summary className="flex items-center justify-between font-semibold list-none">
                <span>{f.q}</span>
                <ChevronDown
                  size={18}
                  className="text-stone-500 transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 text-sm text-stone-400 leading-relaxed">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20 md:py-28 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-glow pointer-events-none" />
      <div className="relative max-w-3xl mx-auto px-4 md:px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tightest leading-[0.95] mb-6">
          Klaar om te beginnen?
        </h2>
        <p className="text-lg text-stone-400 mb-10 max-w-xl mx-auto">
          Account in 10 seconden. Onboarding in 3 minuten. Eerste dag-feedback
          vanavond.
        </p>
        <Link href="/register" className="btn-primary text-base px-7 py-3.5">
          Start nu gratis →
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-orange-500 rounded-md flex items-center justify-center">
            <Zap size={13} className="text-stone-950" strokeWidth={2.8} />
          </div>
          <span>FORGE · Personal Sport OS</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/login" className="hover:text-stone-300">
            Login
          </Link>
          <a href="#pricing" className="hover:text-stone-300">
            Prijs
          </a>
          <a href="#faq" className="hover:text-stone-300">
            FAQ
          </a>
        </div>
        <span>{new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
