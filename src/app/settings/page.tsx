"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Trash2, Zap } from "lucide-react";
import { getProfile, updateProfile } from "@/lib/db";
import type { Profile } from "@/lib/types";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const [apiKey, setApiKey] = useState("");
  const [apiKeyMsg, setApiKeyMsg] = useState<string | null>(null);
  const [apiKeyBusy, setApiKeyBusy] = useState(false);

  useEffect(() => {
    getProfile()
      .then((p) => {
        if (!p) {
          router.replace("/login");
          return;
        }
        setProfile(p);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateProfile(profile);
      setSavedAt(Date.now());
    } catch (e: any) {
      alert(`Kon niet opslaan: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const saveApiKey = async () => {
    setApiKeyBusy(true);
    setApiKeyMsg(null);
    const res = await fetch("/api/api-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: apiKey.trim() }),
    });
    setApiKeyBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setApiKeyMsg(j.error || "Kon key niet opslaan");
      return;
    }
    setApiKey("");
    setApiKeyMsg("API key opgeslagen.");
    if (profile) setProfile({ ...profile, has_anthropic_key: true });
  };

  const deleteApiKey = async () => {
    if (!confirm("API key verwijderen?")) return;
    setApiKeyBusy(true);
    const res = await fetch("/api/api-key", { method: "DELETE" });
    setApiKeyBusy(false);
    if (!res.ok) {
      setApiKeyMsg("Kon key niet verwijderen");
      return;
    }
    setApiKeyMsg("API key verwijderd.");
    if (profile) setProfile({ ...profile, has_anthropic_key: false });
  };

  const signOut = async () => {
    await fetch("/auth/signout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  if (loading || !profile) {
    return (
      <main className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-stone-500 font-mono text-xs uppercase tracking-[0.3em]">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-200">
      <header className="border-b border-stone-800 sticky top-0 bg-stone-950 z-40">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-mono text-stone-400 hover:text-orange-400"
          >
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 flex items-center justify-center">
              <Zap size={14} className="text-stone-950" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-display font-bold uppercase tracking-tight">
              FORGE
            </span>
          </div>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-display font-bold uppercase tracking-tight mb-2">
            Instellingen
          </h1>
          <p className="text-sm text-stone-400 font-mono">
            Profiel, doelen en API key.
          </p>
        </div>

        {/* PROFILE */}
        <div className="border border-stone-800 bg-stone-950 p-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-mono mb-6">
            Profiel
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="Naam"
              type="text"
              value={profile.name}
              onChange={(v) => setProfile({ ...profile, name: v as string })}
            />
            <Field
              label="Lengte (cm)"
              type="number"
              value={profile.height}
              onChange={(v) => setProfile({ ...profile, height: +v })}
            />
            <Field
              label="Start gewicht"
              type="number"
              value={profile.start_weight}
              onChange={(v) =>
                setProfile({ ...profile, start_weight: +v })
              }
            />
            <Field
              label="Huidig gewicht"
              type="number"
              value={profile.current_weight}
              onChange={(v) =>
                setProfile({ ...profile, current_weight: +v })
              }
            />
            <Field
              label="Doel gewicht"
              type="number"
              value={profile.target_weight}
              onChange={(v) =>
                setProfile({ ...profile, target_weight: +v })
              }
            />
            <Field
              label="Leeftijd"
              type="number"
              value={profile.age}
              onChange={(v) => setProfile({ ...profile, age: +v })}
            />
            <Field
              label="Trainingsdagen/week"
              type="number"
              value={profile.training_days}
              onChange={(v) => setProfile({ ...profile, training_days: +v })}
            />
            <Field
              label="Slaap (uren)"
              type="number"
              value={profile.sleep_hours}
              onChange={(v) => setProfile({ ...profile, sleep_hours: +v })}
            />
          </div>
          <div className="mt-4">
            <label className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
              Doel
            </label>
            <textarea
              value={profile.goal}
              onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
              rows={2}
              className="w-full mt-1 bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="mt-4">
            <label className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
              Notes (voor AI coach)
            </label>
            <textarea
              value={profile.notes}
              onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
              rows={3}
              className="w-full mt-1 bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="bg-orange-500 text-stone-950 px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-mono hover:bg-orange-400 disabled:opacity-50"
            >
              {saving ? "Opslaan..." : "Opslaan"}
            </button>
            {savedAt && Date.now() - savedAt < 3000 && (
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <Check size={12} /> Opgeslagen
              </span>
            )}
          </div>
        </div>

        {/* API KEY */}
        <div className="border border-stone-800 bg-stone-950 p-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-mono mb-2">
            Anthropic API Key
          </h2>
          <p className="text-sm text-stone-400 mb-4 leading-relaxed">
            Nodig voor AI coach + voedingsanalyse. Pak een key op{" "}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noreferrer"
              className="text-orange-400 underline"
            >
              console.anthropic.com
            </a>
            . Wij slaan 'm versleuteld op (AES-256-GCM, server-side).
          </p>
          {profile.has_anthropic_key ? (
            <div className="flex items-center justify-between border border-emerald-500/40 bg-emerald-500/5 p-4 mb-4">
              <div className="text-sm text-emerald-400 font-mono">
                ● Key actief — AI features ingeschakeld.
              </div>
              <button
                onClick={deleteApiKey}
                disabled={apiKeyBusy}
                className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-orange-400 font-mono"
              >
                <Trash2 size={12} /> Verwijder
              </button>
            </div>
          ) : (
            <p className="text-xs text-orange-400 font-mono mb-4">
              Geen key ingesteld — AI features uitgeschakeld.
            </p>
          )}
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="flex-1 bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono text-sm focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={saveApiKey}
              disabled={apiKeyBusy || !apiKey.trim()}
              className="bg-orange-500 text-stone-950 px-5 text-xs uppercase tracking-[0.2em] font-mono hover:bg-orange-400 disabled:opacity-30"
            >
              {profile.has_anthropic_key ? "Vervang" : "Opslaan"}
            </button>
          </div>
          {apiKeyMsg && (
            <p className="text-xs font-mono mt-2 text-stone-400">{apiKeyMsg}</p>
          )}
        </div>

        {/* DANGER ZONE */}
        <div className="border border-stone-900 bg-stone-950 p-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-mono mb-4">
            Account
          </h2>
          <button
            onClick={signOut}
            className="border border-stone-800 hover:border-orange-500 text-stone-300 px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-mono"
          >
            Uitloggen
          </button>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
}: {
  label: string;
  value: string | number;
  onChange: (v: string | number) => void;
  type: "text" | "number";
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(type === "number" ? +e.target.value : e.target.value)
        }
        className="w-full mt-1 bg-stone-900 border border-stone-800 px-3 py-2 text-stone-200 font-mono focus:outline-none focus:border-orange-500"
      />
    </div>
  );
}
