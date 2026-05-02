"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Field, TextInput, PrimaryButton } from "@/components/ui/Field";

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
      options: { data: { name } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
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
          <div className="w-9 h-9 bg-orange-500 rounded-md flex items-center justify-center">
            <Zap size={16} className="text-stone-950" strokeWidth={2.5} />
          </div>
          <h1 className="text-lg font-bold tracking-tight">FORGE</h1>
        </Link>
        <div className="border border-stone-800 bg-stone-950 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-1">Maak je account</h2>
          <p className="text-sm text-stone-400 mb-6">
            Gratis, eigen privé data, geen email-bevestiging.
          </p>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Naam">
              <TextInput
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Voornaam"
              />
            </Field>
            <Field label="Email">
              <TextInput
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jij@example.com"
              />
            </Field>
            <Field label="Wachtwoord (min 6 tekens)">
              <TextInput
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            {error && <p className="text-sm text-orange-400">{error}</p>}
            <PrimaryButton type="submit" disabled={loading} className="w-full">
              {loading ? "..." : "Account aanmaken"}
            </PrimaryButton>
          </form>
          <p className="mt-6 text-sm text-stone-500 text-center">
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
