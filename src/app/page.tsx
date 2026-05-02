import Link from "next/link";
import { Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-stone-950 text-stone-200 flex flex-col">
      <header className="border-b border-stone-800">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 flex items-center justify-center">
              <Zap size={18} className="text-stone-950" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight uppercase leading-none">
                FORGE
              </h1>
              <div className="text-[10px] uppercase tracking-[0.25em] text-stone-500 font-mono mt-0.5">
                Sport Journey OS
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/login"
              className="px-4 py-2 text-xs uppercase tracking-[0.15em] font-mono text-stone-300 border border-stone-800 hover:border-orange-500/50"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-xs uppercase tracking-[0.15em] font-mono bg-orange-500 text-stone-950 hover:bg-orange-400"
            >
              Account
            </Link>
          </div>
        </div>
      </header>

      <section className="flex-1 flex items-center">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="text-[10px] uppercase tracking-[0.3em] text-orange-400 font-mono mb-6">
            Personal Sport OS · v1
          </div>
          <h2 className="text-5xl md:text-6xl font-display font-extrabold tracking-tight uppercase leading-none mb-6">
            Build the
            <br />
            <span className="text-orange-500">athlete you want.</span>
          </h2>
          <p className="text-stone-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Track gewicht, training, voeding en voortgang in één plek. Met een AI
            coach die je profiel kent en feedback geeft op elke dag.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="px-6 py-3 text-xs uppercase tracking-[0.2em] font-mono bg-orange-500 text-stone-950 hover:bg-orange-400"
            >
              Start je traject →
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 text-xs uppercase tracking-[0.2em] font-mono border border-stone-800 hover:border-orange-500"
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
                className="border border-stone-800 bg-stone-950/50 p-5"
              >
                <div className="text-[10px] uppercase tracking-[0.2em] text-orange-400 font-mono mb-2">
                  {f.t}
                </div>
                <p className="text-sm text-stone-400 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-800 py-6">
        <div className="max-w-5xl mx-auto px-6 flex justify-between text-[10px] uppercase tracking-[0.2em] text-stone-600 font-mono">
          <span>FORGE · Personal Sport OS</span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}
