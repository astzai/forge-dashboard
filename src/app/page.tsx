import Link from "next/link";
import { Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      <header className="border-b border-stone-800/70">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-md flex items-center justify-center">
              <Zap size={16} className="text-stone-950" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">FORGE</h1>
              <div className="text-xs text-stone-500">Sport Journey OS</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-stone-300 border border-stone-800 rounded-md hover:border-orange-500/50 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium bg-orange-500 text-stone-950 rounded-md hover:bg-orange-400 transition-colors"
            >
              Account aanmaken
            </Link>
          </div>
        </div>
      </header>

      <section className="flex-1 flex items-center">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="text-xs uppercase tracking-[0.2em] text-orange-400 mb-5 font-medium">
            Personal Sport OS
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tightest leading-[1.05] mb-6">
            Bouw de athlete
            <br />
            <span className="text-orange-500">die je wilt zijn.</span>
          </h2>
          <p className="text-stone-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Track gewicht, training, voeding en voortgang in één plek. Met een
            AI coach die je profiel kent en feedback geeft op elke dag.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="px-6 py-3 text-sm font-medium bg-orange-500 text-stone-950 rounded-md hover:bg-orange-400 transition-colors"
            >
              Start je traject →
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 text-sm border border-stone-800 rounded-md hover:border-orange-500 text-stone-300 transition-colors"
            >
              Heb al een account
            </Link>
          </div>
          <div className="mt-16 grid sm:grid-cols-3 gap-3 text-left">
            {[
              {
                t: "Daily logs",
                d: "Gewicht, sport, voeding — AI scoort je dag en geeft 1 ding voor morgen.",
              },
              {
                t: "Coach chat",
                d: "Stel vragen aan een coach die jouw historie en doelen kent.",
              },
              {
                t: "Eigen API key",
                d: "Je gebruikt je eigen Anthropic key. Volledig privé per gebruiker.",
              },
            ].map((f) => (
              <div
                key={f.t}
                className="border border-stone-800 bg-stone-950/60 rounded-lg p-5"
              >
                <div className="text-sm font-semibold text-orange-400 mb-1.5">
                  {f.t}
                </div>
                <p className="text-sm text-stone-400 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-800/70 py-6">
        <div className="max-w-5xl mx-auto px-6 flex justify-between text-xs text-stone-600">
          <span>FORGE · Personal Sport OS</span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}
