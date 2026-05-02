import Link from "next/link";
import {
  Activity,
  Apple,
  Brain,
  Calendar,
  Camera,
  ChevronDown,
  ClipboardCheck,
  Dumbbell,
  FileText,
  Flame,
  LineChart as LineChartIcon,
  MessageSquare,
  Moon,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-stone-100 overflow-x-hidden">
      <Header />
      <Hero />
      <LogoStrip />
      <BentoFeatures />
      <CoachSpotlight />
      <DashboardShowcase />
      <TrackEverything />
      <TransformationTimeline />
      <Pricing />
      <FAQ />
      <FinalCTA />
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
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-md flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Zap size={15} className="text-stone-950" strokeWidth={2.8} />
          </div>
          <span className="font-bold tracking-tight">FORGE</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-stone-400">
          <a href="#features" className="hover:text-stone-100 transition-colors">Features</a>
          <a href="#dashboard" className="hover:text-stone-100 transition-colors">Dashboard</a>
          <a href="#pricing" className="hover:text-stone-100 transition-colors">Prijs</a>
          <a href="#faq" className="hover:text-stone-100 transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="px-3 py-1.5 text-sm text-stone-300 hover:text-stone-100 transition-colors">
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
   HERO
   ============================================================ */
function Hero() {
  return (
    <section className="relative pt-12 md:pt-20 pb-24 md:pb-40 overflow-hidden">
      <div className="absolute inset-0 bg-mesh pointer-events-none" />
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-50" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/5 backdrop-blur text-xs text-orange-200 font-medium mb-7 rise-in">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 pulse-soft" />
            Een complete coach in je broekzak — €2/mo
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tightest leading-[0.9] mb-7 rise-in">
            Train. Eet. Track.
            <br />
            <span className="text-gradient-orange">Verbeter.</span>
          </h1>

          <p className="text-lg md:text-xl text-stone-400 max-w-2xl mx-auto mb-10 leading-relaxed rise-in" style={{ animationDelay: "0.1s" }}>
            Eén dashboard voor je hele journey. AI coach die je profiel kent,
            voeding analyseert, foto's vergelijkt en elke dag zegt wat je
            morgen moet doen.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 rise-in" style={{ animationDelay: "0.2s" }}>
            <Link href="/register" className="btn-primary text-base px-8 py-4">
              Start je traject →
            </Link>
            <a href="#dashboard" className="btn-ghost text-base px-8 py-4">
              Bekijk dashboard
            </a>
          </div>

          <div className="mt-7 flex flex-wrap justify-center items-center gap-x-5 gap-y-2 text-xs text-stone-500 rise-in" style={{ animationDelay: "0.3s" }}>
            <span>✓ Geen credit card nodig</span>
            <span className="text-stone-700">·</span>
            <span>✓ 100% privé per gebruiker</span>
            <span className="text-stone-700">·</span>
            <span>✓ Cancel wanneer je wilt</span>
          </div>
        </div>

        {/* Floating layered mockups */}
        <div className="relative mt-16 md:mt-24 max-w-5xl mx-auto h-[420px] md:h-[560px]">
          <div className="absolute inset-0 bg-glow-orange opacity-50 pointer-events-none" />

          {/* Main dashboard mockup (center, biggest) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] md:w-[80%] z-20 float-y">
            <DashboardMockup />
          </div>

          {/* Coach chat mockup (left, smaller, behind) */}
          <div className="hidden md:block absolute left-0 top-12 w-[280px] z-10 float-y-delay">
            <ChatMockup />
          </div>

          {/* Daglog mockup (right, smaller, behind) */}
          <div className="hidden md:block absolute right-0 bottom-0 w-[260px] z-10 float-y-delay-2">
            <LogMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-stone-950/95 backdrop-blur-sm shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden">
      <div className="border-b border-white/5 px-5 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-stone-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-stone-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-stone-700" />
        </div>
        <div className="text-xs text-stone-500 ml-3">forge — Dashboard</div>
      </div>
      <div className="p-5 md:p-7 space-y-4">
        {/* Hero row */}
        <div className="bg-gradient-to-br from-orange-500/15 via-stone-900/0 to-transparent border border-orange-500/20 rounded-xl p-5 md:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 blur-3xl rounded-full" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 pulse-soft" />
              <span className="text-[11px] uppercase tracking-wider text-orange-300 font-semibold">Maandag · 5 mei</span>
            </div>
            <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-1">
              Push Day
            </h3>
            <p className="text-sm text-stone-400">Bench Press 4×8 · Incline DB 3×10 · Shoulder Press 3×10...</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {[
            { l: "Gewicht", v: "98.2", u: "kg", trend: "-1.2", color: "text-emerald-400" },
            { l: "Stappen", v: "8.4k", u: "" },
            { l: "Kcal", v: "2,140", u: "" },
            { l: "Eiwit", v: "186", u: "g" },
          ].map((s, i) => (
            <div key={i} className="bg-stone-900/60 border border-white/5 rounded-lg p-3">
              <div className="text-[10px] text-stone-500 font-medium mb-1">{s.l}</div>
              <div className="flex items-baseline gap-1">
                <div className="hero-num text-xl text-stone-100">{s.v}</div>
                <div className="text-[10px] text-stone-500">{s.u}</div>
              </div>
              {s.trend && (
                <div className={`text-[10px] num mt-0.5 ${s.color ?? "text-stone-500"}`}>
                  {s.trend}kg
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Chart placeholder */}
        <div className="bg-stone-900/60 border border-white/5 rounded-xl p-4 h-24 md:h-32 relative overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 h-3/4">
            <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,80 C50,70 80,30 130,40 C180,50 220,20 280,28 C340,35 380,18 400,22 L400,100 L0,100 Z" fill="url(#g)" />
              <path d="M0,80 C50,70 80,30 130,40 C180,50 220,20 280,28 C340,35 380,18 400,22" fill="none" stroke="#f97316" strokeWidth="2" />
            </svg>
          </div>
          <div className="absolute top-2 left-3 text-[10px] text-stone-500 font-medium">Gewicht 30 dagen</div>
        </div>
      </div>
    </div>
  );
}

function ChatMockup() {
  return (
    <div className="rounded-2xl border border-white/10 bg-stone-950/95 backdrop-blur-sm shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden">
      <div className="border-b border-white/5 px-4 py-2.5 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-soft" />
        <span className="text-xs text-stone-400 font-medium">AI Coach</span>
      </div>
      <div className="p-4 space-y-2.5">
        <div className="bg-orange-500 text-stone-950 rounded-2xl rounded-tr-sm px-3 py-2 text-xs ml-6">
          Wat moet ik vandaag eten?
        </div>
        <div className="bg-stone-900 border border-white/5 rounded-2xl rounded-tl-sm px-3 py-2 text-xs">
          <span className="text-stone-200">Met je 105kg en cut-doel: ~2400 kcal, 200g eiwit. Vandaag is rest day, dus ~50g minder carbs. Tip: 4 eieren + havermout ontbijt scheelt al 40g eiwit.</span>
        </div>
      </div>
    </div>
  );
}

function LogMockup() {
  return (
    <div className="rounded-2xl border border-white/10 bg-stone-950/95 backdrop-blur-sm shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden">
      <div className="border-b border-white/5 px-4 py-2.5 flex items-center justify-between">
        <span className="text-xs text-stone-400 font-medium">Dag-feedback</span>
        <div className="w-8 h-8 rounded-md bg-orange-500/10 border border-orange-500/40 flex items-center justify-center">
          <span className="hero-num text-sm text-orange-400">8</span>
        </div>
      </div>
      <div className="p-4 space-y-2 text-xs">
        {[
          { l: "Voeding", s: 8, c: "text-emerald-400" },
          { l: "Training", s: 9, c: "text-emerald-400" },
          { l: "Herstel", s: 6, c: "text-orange-400" },
        ].map((r) => (
          <div key={r.l} className="flex items-center justify-between">
            <span className="text-stone-400">{r.l}</span>
            <span className={`hero-num ${r.c}`}>{r.s}</span>
          </div>
        ))}
        <div className="border-l-2 border-orange-500 pl-2 text-stone-300 text-[11px] mt-2">
          → Morgen: 1L meer water
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   LOGO STRIP / METRICS
   ============================================================ */
function LogoStrip() {
  const items = [
    { n: "10+", l: "tabs in dashboard" },
    { n: "AI", l: "coach + voeding + foto" },
    { n: "100%", l: "privé per gebruiker" },
    { n: "€2", l: "per maand, all-in" },
  ];
  return (
    <section className="border-y border-white/5 bg-stone-950/40">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {items.map((s) => (
          <div key={s.l}>
            <div className="hero-num text-3xl md:text-5xl text-gradient-orange mb-1">{s.n}</div>
            <div className="text-xs text-stone-500 font-medium">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   BENTO FEATURES
   ============================================================ */
function BentoFeatures() {
  return (
    <section id="features" className="py-20 md:py-32 relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-glow-pink pointer-events-none opacity-50" />
      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        <SectionHeader
          eyebrow="Alles in één plek"
          title="Eén app. Volledige controle."
          sub="Niet weer 5 verschillende tools om jezelf te managen. FORGE doet het allemaal."
        />

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {/* Big card top-left: AI Coach */}
          <div className="md:col-span-2 md:row-span-2 card card-hover p-7 md:p-9 relative overflow-hidden min-h-[340px] md:min-h-[440px]">
            <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/10 blur-3xl rounded-full" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-xs text-orange-300 font-medium mb-5">
                <Sparkles size={11} /> AI driven
              </div>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Persoonlijke AI coach</h3>
              <p className="text-stone-400 leading-relaxed mb-6 max-w-md">
                Niet zomaar een chatbot. Hij kent je lengte, gewicht, doelen,
                training-historie, dieet en intoleranties. Antwoord altijd in
                jouw context.
              </p>
              <div className="space-y-2 max-w-md">
                <div className="bg-orange-500 text-stone-950 rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm ml-12 font-medium">
                  Plateau bij bench press, wat doe ik?
                </div>
                <div className="bg-stone-900 border border-white/5 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm">
                  <span className="text-stone-200">Met 3 jaar ervaring en 4×/week is jouw plateau waarschijnlijk volume. Voeg 2 sets toe aan accessoires (DB press, dips). Check ook je slaap — 6h is te weinig voor 87.5kg bench progressie.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Foto compare */}
          <FeatureCard
            icon={Camera}
            iconColor="text-pink-400"
            iconBg="bg-pink-500/10 border-pink-500/30"
            title="Foto check-ins"
            desc="3 hoeken per week, AI vergelijkt en wijst veranderingen aan."
            visual={
              <div className="grid grid-cols-3 gap-1 mt-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="aspect-[3/4] rounded bg-gradient-to-br from-stone-800 to-stone-900 border border-white/5" />
                ))}
              </div>
            }
          />

          {/* Voeding */}
          <FeatureCard
            icon={Apple}
            iconColor="text-lime-400"
            iconBg="bg-lime-500/10 border-lime-500/30"
            title="Voedingsanalyse"
            desc="Type wat je at, AI rekent kcal en macros uit. Geen barcode-gedoe."
            visual={
              <div className="mt-4 space-y-1.5">
                {[
                  { l: "Eiwit", v: 80, c: "bg-orange-500" },
                  { l: "Carbs", v: 55, c: "bg-orange-400" },
                  { l: "Vet", v: 40, c: "bg-orange-300" },
                ].map((r) => (
                  <div key={r.l} className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-500 w-10">{r.l}</span>
                    <div className="flex-1 h-1.5 bg-stone-900 rounded-full overflow-hidden">
                      <div className={`h-full ${r.c} rounded-full`} style={{ width: `${r.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            }
          />

          {/* Wide card: Wekelijks rapport */}
          <div className="md:col-span-2 card card-hover p-6 md:p-7 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-40 h-40 bg-glow-amber pointer-events-none" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-medium mb-4">
                <FileText size={11} /> Elke zondag
              </div>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-2">Wekelijks coach-rapport</h3>
              <p className="text-stone-400 mb-5">
                Wat ging goed, wat niet, en het ENE focus-punt voor de week erop.
              </p>
              <div className="grid grid-cols-3 gap-2 max-w-md">
                {[
                  { l: "Sport", v: "5×" },
                  { l: "Cal/dag", v: "2,180" },
                  { l: "Eiwit", v: "192g" },
                ].map((s) => (
                  <div key={s.l} className="bg-stone-900/60 border border-white/5 rounded-lg p-3">
                    <div className="text-[10px] text-stone-500 mb-0.5">{s.l}</div>
                    <div className="hero-num text-lg text-stone-100">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trainings schema */}
          <FeatureCard
            icon={Dumbbell}
            iconColor="text-cyan-400"
            iconBg="bg-cyan-500/10 border-cyan-500/30"
            title="Training­schema"
            desc="Per dag wat je traint, oefeningen en duur. Werkt op je telefoon in de gym."
            visual={
              <div className="mt-4 space-y-1">
                {["MA · Push", "DI · Pull", "WO · Legs"].map((d) => (
                  <div key={d} className="text-xs text-stone-300 bg-stone-900/60 border border-white/5 rounded px-2 py-1.5">{d}</div>
                ))}
              </div>
            }
          />

          {/* Calorieën calculator */}
          <FeatureCard
            icon={Flame}
            iconColor="text-orange-400"
            iconBg="bg-orange-500/10 border-orange-500/30"
            title="Macros & TDEE"
            desc="Mifflin-St Jeor calculator. Berekent je behoefte en macro split."
            visual={
              <div className="mt-4">
                <div className="hero-num text-3xl text-stone-100">2,420</div>
                <div className="text-[10px] text-stone-500">kcal/dag · cut</div>
              </div>
            }
          />

          {/* Trends */}
          <FeatureCard
            icon={LineChartIcon}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-500/10 border-emerald-500/30"
            title="Gewicht traject"
            desc="Volledige trend met week-gemiddeldes, hoogste/laagste, voortgang naar doel."
            visual={
              <div className="mt-4 h-12">
                <svg width="100%" height="100%" viewBox="0 0 200 50" preserveAspectRatio="none">
                  <path d="M0,40 C30,35 50,15 80,20 C110,25 140,5 170,12 L200,8" fill="none" stroke="#34d399" strokeWidth="2" />
                </svg>
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  desc,
  visual,
}: any) {
  return (
    <div className="card card-hover p-5 md:p-6">
      <div className={`inline-flex w-9 h-9 rounded-lg border ${iconBg} items-center justify-center mb-3`}>
        <Icon size={16} className={iconColor} />
      </div>
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-sm text-stone-400 leading-relaxed">{desc}</p>
      {visual}
    </div>
  );
}

/* ============================================================
   COACH SPOTLIGHT
   ============================================================ */
function CoachSpotlight() {
  return (
    <section className="py-20 md:py-32 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-glow-orange opacity-30 pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-orange-400 mb-3 font-semibold flex items-center gap-2">
            <Brain size={14} /> AI Coach
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tightest leading-[1.05] mb-5">
            Een coach die jou kent.
            <br />
            <span className="text-stone-500">Niet jouw stats.</span>
          </h2>
          <p className="text-lg text-stone-400 mb-6 leading-relaxed">
            FORGE's AI coach wordt gevoed met je hele profiel: lichaam, doelen,
            training­historie, dieet, intoleranties, slaap­patroon en
            coach-stijl voorkeur. Elke vraag krijgt antwoord ín jouw context.
          </p>
          <div className="space-y-3">
            {[
              { l: "Streng / motiverend / educatief / chill", icon: MessageSquare },
              { l: "Past op je dieet (vegan, keto, intoleranties)", icon: Apple },
              { l: "Begrijpt je training-niveau & ervaring", icon: Dumbbell },
              { l: "Houdt rekening met slaap & stress", icon: Moon },
            ].map((f) => {
              const I = f.icon;
              return (
                <div key={f.l} className="flex items-center gap-3 text-sm text-stone-300">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                    <I size={14} className="text-orange-400" />
                  </div>
                  <span>{f.l}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5 md:p-6 shadow-2xl shadow-orange-500/10 glow-pulse">
          <div className="flex items-center gap-2 pb-3 border-b border-white/5 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-soft" />
            <span className="text-xs text-stone-400 font-medium">AI Coach — Online</span>
          </div>
          <div className="space-y-3">
            <Bubble side="user">Hoe ga ik mijn cut beter aanpakken?</Bubble>
            <Bubble side="ai">
              Je weegt nu 98.2kg richting 92kg in 16 weken — dat's 0.4kg/week.
              Realistisch. Drie dingen:
              <br />1. Eiwit naar 200g (nu 186g gem)
              <br />2. Stappen naar 8k op rustdagen (nu 6.5k)
              <br />3. Bewaar Monster Zero voor pre-workout, niet de hele dag
            </Bubble>
            <Bubble side="user">En wat doe ik aan mijn slaap?</Bubble>
            <Bubble side="ai">
              Je gemiddeld 7u is OK maar je stress staat op 'hoog'. Probeer 1
              week: laatste maaltijd 3u voor bed, geen scherm 30 min voor slaap,
              kamer onder 18°. Track je herstel-score in dag-feedback.
            </Bubble>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bubble({ side, children }: { side: "user" | "ai"; children: React.ReactNode }) {
  if (side === "user") {
    return (
      <div className="bg-orange-500 text-stone-950 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm font-medium ml-12">
        {children}
      </div>
    );
  }
  return (
    <div className="bg-stone-900 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-stone-200 mr-12 leading-relaxed">
      {children}
    </div>
  );
}

/* ============================================================
   DASHBOARD SHOWCASE
   ============================================================ */
function DashboardShowcase() {
  return (
    <section id="dashboard" className="py-20 md:py-32 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <SectionHeader
          eyebrow="Dashboard"
          title="Alles wat je nodig hebt op één scherm."
          sub="Van vandaag's training tot je 90-dagen trend. Geen tabs zoeken."
        />
        <div className="mt-12 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-stone-950/95 shadow-2xl shadow-orange-500/10 overflow-hidden">
            <div className="border-b border-white/5 px-5 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-stone-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-stone-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-stone-700" />
              </div>
              <div className="text-xs text-stone-500">forge-dashboard.app/dashboard</div>
            </div>
            <DashboardMockup />
          </div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-stone-500 text-center">
            {[
              "10+ tabs",
              "Realtime data",
              "Mobile + desktop",
              "100% jouw data",
            ].map((t) => (
              <div key={t} className="bg-stone-950/50 border border-white/5 rounded-lg px-3 py-2">
                ✓ {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   TRACK EVERYTHING
   ============================================================ */
function TrackEverything() {
  const items = [
    { icon: Activity, l: "Gewicht", c: "from-orange-500/20 to-transparent" },
    { icon: Apple, l: "Voeding & macros", c: "from-lime-500/20 to-transparent" },
    { icon: Dumbbell, l: "Training", c: "from-cyan-500/20 to-transparent" },
    { icon: Camera, l: "Foto's", c: "from-pink-500/20 to-transparent" },
    { icon: Moon, l: "Slaap & stress", c: "from-violet-500/20 to-transparent" },
    { icon: Flame, l: "Stappen", c: "from-amber-500/20 to-transparent" },
    { icon: Target, l: "Doelen", c: "from-emerald-500/20 to-transparent" },
    { icon: ClipboardCheck, l: "Dag-feedback", c: "from-rose-500/20 to-transparent" },
  ];
  return (
    <section className="py-20 md:py-32 border-t border-white/5 bg-stone-950/40">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <SectionHeader
          eyebrow="Wat je tracked"
          title="8 metrics. 1 dashboard."
          sub="Geen 5 apps die niet met elkaar praten. Eén plek voor alles."
        />
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((it) => {
            const I = it.icon;
            return (
              <div
                key={it.l}
                className={`card card-hover p-5 bg-gradient-to-br ${it.c} relative overflow-hidden`}
              >
                <I size={24} className="text-stone-300 mb-3" />
                <div className="font-semibold text-stone-100">{it.l}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   TRANSFORMATION TIMELINE
   ============================================================ */
function TransformationTimeline() {
  const stages = [
    {
      day: "Dag 1",
      title: "Onboarding",
      desc: "7-step wizard voor profiel, doelen, dieet en coach-stijl.",
      pct: 5,
    },
    {
      day: "Week 1",
      title: "Eerste data",
      desc: "Eerste foto check-in, eerste dag-feedback, eerste week-rapport.",
      pct: 25,
    },
    {
      day: "Week 4",
      title: "Patterns zichtbaar",
      desc: "Gewicht trendlijn, macro adherence, training consistency duidelijk.",
      pct: 60,
    },
    {
      day: "Week 12",
      title: "Resultaten",
      desc: "Side-by-side foto's vergelijken. Coach geeft data-driven advies.",
      pct: 100,
    },
  ];
  return (
    <section className="py-20 md:py-32 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <SectionHeader
          eyebrow="Het traject"
          title="Van aanmelding tot resultaat."
          sub="Geen quick fix. Een systeem dat 12+ weken consistent werkt."
        />
        <div className="mt-14 relative">
          <div className="hidden md:block absolute left-0 right-0 top-7 h-0.5 bg-gradient-to-r from-orange-500/0 via-orange-500/50 to-orange-500/0" />
          <div className="grid md:grid-cols-4 gap-5">
            {stages.map((s, i) => (
              <div key={s.day} className="relative">
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-3 w-7 h-7 rounded-full bg-orange-500 border-4 border-stone-950 items-center justify-center text-[10px] font-bold text-stone-950">
                  {i + 1}
                </div>
                <div className="card p-5 md:mt-12">
                  <div className="text-xs text-orange-400 font-semibold mb-1">{s.day}</div>
                  <h3 className="font-bold mb-1">{s.title}</h3>
                  <p className="text-sm text-stone-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   PRICING
   ============================================================ */
function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-32 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-glow-orange opacity-40 pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        <SectionHeader eyebrow="Prijs" title="Twee euro per maand." sub="Genoeg om hosting en AI te dekken. Niet meer, niet minder." />
        <div className="mt-14 max-w-md mx-auto">
          <div className="card relative overflow-hidden p-8 glow-pulse">
            <div className="absolute -top-px -right-px px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 text-xs font-bold rounded-bl-lg rounded-tr-[14px]">
              EARLY ACCESS
            </div>
            <div className="text-sm text-stone-400 mb-2 font-medium">FORGE Pro</div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="hero-num text-7xl text-gradient-orange">€2</span>
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
                "Cancel wanneer je wilt",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-stone-300">
                  <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Link href="/register" className="block text-center btn-primary w-full text-base py-3.5">
              Start nu gratis
            </Link>
            <p className="text-xs text-stone-500 mt-3 text-center">
              Tijdens early-access gratis. Stripe betaling komt later.
            </p>
          </div>
          <p className="text-center text-xs text-stone-500 mt-6">
            Wat dekt €2? Servers, database, storage voor foto's. AI-kosten betaal
            je via je eigen Anthropic key (~€0.50–€2/mo bij normaal gebruik).
          </p>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FAQ
   ============================================================ */
const faqs = [
  {
    q: "Wat doet FORGE écht anders dan MyFitnessPal of Strava?",
    a: "MyFitnessPal scant barcodes maar heeft geen AI coach die jou kent. Strava is voor cardio. FORGE combineert dag-tracking, voedingsanalyse, foto-checkins, AI coach, en wekelijkse rapporten in één tool — gemaakt voor mensen die thuis of in de gym trainen en geen 50 features willen.",
  },
  {
    q: "Wat doen jullie met mijn data?",
    a: "Niets. Je data staat in een Supabase database met Row Level Security — niemand anders dan jij ziet het. Foto's staan in een private bucket met dezelfde RLS. Anthropic key is versleuteld opgeslagen.",
  },
  {
    q: "Heb ik een eigen AI key nodig?",
    a: "Ja. Je gebruikt je eigen Anthropic API key (gratis aan te maken). Hierdoor blijft de prijs €2/mo. Eerste paar dollar credits zijn gratis bij Anthropic, daarna ~€0.50–€2/maand bij normaal gebruik.",
  },
  {
    q: "Werkt het op mijn telefoon?",
    a: "Ja. Volledige mobile-eerst design met bottom nav, foto-upload via camera en touch-vriendelijke inputs. Voeg toe aan home-screen voor app-feel.",
  },
  {
    q: "Kan ik mijn data exporteren?",
    a: "Ja. Alles staat in standaard tabellen. Download als CSV via Supabase dashboard of vraag een export-knop in de app.",
  },
  {
    q: "Wanneer komt de betaling?",
    a: "Tijdens early-access (nu) is alles gratis. Wanneer Stripe + abonnement live staan krijg je een notificatie en 30 dagen om te kiezen.",
  },
  {
    q: "Wat als ik een bug vind of feature wens heb?",
    a: "Stuur een bericht — feedback gaat direct in de roadmap. Hoe minder users, hoe persoonlijker de service.",
  },
];

function FAQ() {
  return (
    <section id="faq" className="py-20 md:py-32 border-t border-white/5">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <SectionHeader eyebrow="Vragen" title="Vaak gestelde vragen." />
        <div className="mt-12 space-y-2">
          {faqs.map((f, i) => (
            <details key={i} className="card p-5 group cursor-pointer hover:border-white/15 transition-colors">
              <summary className="flex items-center justify-between font-semibold list-none gap-4">
                <span>{f.q}</span>
                <ChevronDown size={18} className="text-stone-500 transition-transform group-open:rotate-180 flex-shrink-0" />
              </summary>
              <p className="mt-3 text-sm text-stone-400 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FINAL CTA
   ============================================================ */
function FinalCTA() {
  return (
    <section className="py-24 md:py-40 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh pointer-events-none" />
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-50" />
      <div className="relative max-w-3xl mx-auto px-4 md:px-6 text-center">
        <h2 className="text-5xl md:text-7xl font-extrabold tracking-tightest leading-[0.95] mb-6">
          Tijd om te starten.
        </h2>
        <p className="text-lg text-stone-400 mb-10 max-w-xl mx-auto">
          Account in 10 seconden. Onboarding in 3 minuten. Eerste dag-feedback
          vanavond.
        </p>
        <Link href="/register" className="btn-primary text-lg px-10 py-5">
          Start je traject →
        </Link>
        <p className="text-xs text-stone-500 mt-5">
          Geen credit card · Geen verborgen kosten · Cancel wanneer je wilt
        </p>
      </div>
    </section>
  );
}

/* ============================================================
   FOOTER + helpers
   ============================================================ */
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
          <a href="#features" className="hover:text-stone-300">Features</a>
          <a href="#pricing" className="hover:text-stone-300">Prijs</a>
          <a href="#faq" className="hover:text-stone-300">FAQ</a>
          <Link href="/login" className="hover:text-stone-300">Login</Link>
        </div>
        <span>{new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="text-xs uppercase tracking-[0.2em] text-orange-400 mb-3 font-semibold">{eyebrow}</div>
      <h2 className="text-4xl md:text-6xl font-extrabold tracking-tightest leading-[1.05]">{title}</h2>
      {sub && <p className="text-lg text-stone-400 mt-4 leading-relaxed">{sub}</p>}
    </div>
  );
}
