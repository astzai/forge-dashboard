"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
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
            Login
          </h2>
          <form onSubmit={submit} className="space-y-4">
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
                Wachtwoord
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
            {error && (
              <p className="text-xs text-orange-400 font-mono">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-stone-950 py-3 font-mono uppercase tracking-[0.2em] text-xs hover:bg-orange-400 transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "Login"}
            </button>
          </form>
          <p className="mt-6 text-xs text-stone-500 font-mono text-center">
            Nog geen account?{" "}
            <Link href="/register" className="text-orange-400 hover:text-orange-300">
              Registreer
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
