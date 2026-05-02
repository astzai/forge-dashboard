"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Field,
  TextInput,
  PrimaryButton,
} from "@/components/ui/Field";

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
          <div className="w-9 h-9 bg-orange-500 rounded-md flex items-center justify-center">
            <Zap size={16} className="text-stone-950" strokeWidth={2.5} />
          </div>
          <h1 className="text-lg font-bold tracking-tight">FORGE</h1>
        </Link>
        <div className="border border-stone-800 bg-stone-950 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-1">Welkom terug</h2>
          <p className="text-sm text-stone-400 mb-6">Log in op je account.</p>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Email">
              <TextInput
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jij@example.com"
              />
            </Field>
            <Field label="Wachtwoord">
              <TextInput
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            {error && <p className="text-sm text-orange-400">{error}</p>}
            <PrimaryButton type="submit" disabled={loading} className="w-full">
              {loading ? "..." : "Login"}
            </PrimaryButton>
          </form>
          <p className="mt-6 text-sm text-stone-500 text-center">
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
