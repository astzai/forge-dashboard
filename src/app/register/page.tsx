"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // If email confirmation is OFF (default for free tier with auto-confirm), session is established.
    // If ON, user gets a magic link. We try to sign in immediately for the no-confirm case:
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(
        "Account aangemaakt. Check je inbox voor de bevestigingsmail en log daarna in.",
      );
      return;
    }
    router.push("/onboarding");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-stone-950 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-orange-500 flex items-center justify-center">
            <Zap size={18} className="text-stone-950" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-display font-bold tracking-tight uppercase">
            FORGE
          </h1>
        </Link>
        <div className="border border-stone-800 bg-stone-950 p-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-mono mb-6">
            Nieuw account
          </h2>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
                Naam
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
                Wachtwoord (min 6 tekens)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
            {error && <p className="text-xs text-orange-400 font-mono">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-stone-950 py-3 font-mono uppercase tracking-[0.2em] text-xs hover:bg-orange-400 transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "Maak account"}
            </button>
          </form>
          <p className="mt-6 text-xs text-stone-500 font-mono text-center">
            Al een account?{" "}
            <Link href="/login" className="text-orange-400 hover:text-orange-300">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
