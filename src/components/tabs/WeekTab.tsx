"use client";

import { useEffect, useState } from "react";
import { Sparkles, ThumbsDown, ThumbsUp, TrendingDown, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NoApiKeyBanner } from "@/components/NoApiKeyBanner";
import { PrimaryButton } from "@/components/ui/Field";
import type { Profile, WeeklyReport } from "@/lib/types";

function mondayOf(date = new Date()): string {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

function fmtWeek(weekStart: string): string {
  const start = new Date(weekStart);
  const end = new Date(weekStart);
  end.setUTCDate(end.getUTCDate() + 6);
  const opt: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${start.toLocaleDateString("nl-NL", opt)} – ${end.toLocaleDateString("nl-NL", opt)}`;
}

export function WeekTab({ profile }: { profile: Profile }) {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  const [activeWeek, setActiveWeek] = useState<string>(mondayOf());

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("weekly_reports")
        .select("*")
        .order("week_start", { ascending: false });
      if (!error && data) setReports(data as WeeklyReport[]);
      setLoading(false);
    })();
  }, []);

  const generate = async () => {
    setError(null);
    if (!profile.has_anthropic_key) {
      setNeedsKey(true);
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/weekly-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week_start: activeWeek }),
      });
      if (res.status === 402) {
        setNeedsKey(true);
        setGenerating(false);
        return;
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Genereren mislukt");
      }
      const data = await res.json();
      setReports((prev) => {
        const others = prev.filter((r) => r.week_start !== activeWeek);
        return [
          { week_start: activeWeek, report: data.report } as WeeklyReport,
          ...others,
        ].sort((a, b) => b.week_start.localeCompare(a.week_start));
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  if (needsKey) return <NoApiKeyBanner />;
  if (loading)
    return (
      <div className="text-stone-500 text-sm py-8 text-center">Loading...</div>
    );

  const current = reports.find((r) => r.week_start === activeWeek);

  return (
    <div className="space-y-6">
      <div className="border border-stone-800 bg-stone-950 rounded-lg p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-base font-semibold mb-1">Week rapport</h3>
          <p className="text-sm text-stone-500">
            AI overzicht van je hele week. Genereer 1× per week, op zondag is de
            beste timing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={activeWeek}
            onChange={(e) => {
              const d = new Date(e.target.value);
              setActiveWeek(mondayOf(d));
            }}
            className="bg-stone-900 border border-stone-800 rounded-md px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-orange-500"
          />
          <PrimaryButton
            onClick={generate}
            disabled={generating}
            className="flex items-center gap-2"
          >
            {generating ? (
              "Genereren..."
            ) : (
              <>
                <Sparkles size={14} />
                {current ? "Hergenereer" : "Genereer"}
              </>
            )}
          </PrimaryButton>
        </div>
      </div>

      {error && (
        <p className="text-sm text-orange-400">{error}</p>
      )}

      {current ? (
        <Report report={current} />
      ) : (
        <div className="border border-stone-800 bg-stone-950 rounded-lg p-12 text-center">
          <Sparkles size={32} className="text-stone-700 mx-auto mb-3" />
          <p className="text-sm text-stone-500">
            Nog geen rapport voor week van {fmtWeek(activeWeek)}. Klik
            "Genereer" om er één te maken.
          </p>
        </div>
      )}

      {/* History */}
      {reports.length > 0 && (
        <div className="border border-stone-800 bg-stone-950 rounded-lg p-6">
          <h4 className="text-sm font-semibold mb-3">Eerdere weken</h4>
          <div className="space-y-2">
            {reports.map((r) => (
              <button
                key={r.week_start}
                onClick={() => setActiveWeek(r.week_start)}
                className={`w-full flex items-center justify-between p-3 rounded-md border text-left transition-colors ${
                  r.week_start === activeWeek
                    ? "border-orange-500/50 bg-orange-500/5"
                    : "border-stone-800 bg-stone-950 hover:border-orange-500/30"
                }`}
              >
                <div>
                  <div className="text-sm text-stone-200 font-medium">
                    {fmtWeek(r.week_start)}
                  </div>
                  <div className="text-xs text-stone-500 line-clamp-1">
                    {r.report.summary}
                  </div>
                </div>
                <div className="text-xs num text-stone-500 flex items-center gap-1">
                  {r.report.weight_change_kg != null && (
                    <>
                      {r.report.weight_change_kg < 0 ? (
                        <TrendingDown size={12} className="text-emerald-400" />
                      ) : r.report.weight_change_kg > 0 ? (
                        <TrendingUp size={12} className="text-orange-400" />
                      ) : null}
                      {r.report.weight_change_kg > 0 ? "+" : ""}
                      {r.report.weight_change_kg}kg
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Report({ report }: { report: WeeklyReport }) {
  const r = report.report;
  return (
    <div className="space-y-4">
      <div className="border border-stone-800 bg-gradient-to-br from-stone-950 to-stone-900 rounded-lg p-6">
        <div className="text-sm text-orange-400 font-medium mb-2">
          {fmtWeek(report.week_start)}
        </div>
        <p className="text-lg text-stone-100 leading-relaxed">{r.summary}</p>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          label="Gewicht"
          value={
            r.weight_change_kg != null
              ? `${r.weight_change_kg > 0 ? "+" : ""}${r.weight_change_kg}kg`
              : "—"
          }
          accent={r.weight_change_kg != null && r.weight_change_kg < 0}
        />
        <Stat
          label="Gem kcal/dag"
          value={r.avg_calories != null ? String(r.avg_calories) : "—"}
        />
        <Stat
          label="Gem eiwit/dag"
          value={r.avg_protein != null ? `${r.avg_protein}g` : "—"}
        />
        <Stat label="Sport sessies" value={String(r.sport_count)} />
      </div>

      {(r.wins?.length || r.misses?.length) && (
        <div className="grid md:grid-cols-2 gap-4">
          {r.wins?.length > 0 && (
            <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsUp size={14} className="text-emerald-400" />
                <h4 className="text-sm font-semibold text-emerald-300">
                  Wat ging goed
                </h4>
              </div>
              <ul className="space-y-1.5 text-sm text-stone-200">
                {r.wins.map((w, i) => (
                  <li key={i}>✓ {w}</li>
                ))}
              </ul>
            </div>
          )}
          {r.misses?.length > 0 && (
            <div className="border border-orange-500/30 bg-orange-500/5 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsDown size={14} className="text-orange-400" />
                <h4 className="text-sm font-semibold text-orange-300">
                  Wat kon beter
                </h4>
              </div>
              <ul className="space-y-1.5 text-sm text-stone-200">
                {r.misses.map((m, i) => (
                  <li key={i}>• {m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {r.next_week_focus && (
        <div className="border border-orange-500 bg-stone-950 rounded-lg p-6">
          <div className="text-xs text-stone-500 font-medium mb-2">
            Focus volgende week
          </div>
          <p className="text-stone-100 text-lg leading-relaxed">
            {r.next_week_focus}
          </p>
        </div>
      )}

      {r.photo_observation && (
        <div className="border border-stone-800 bg-stone-950 rounded-lg p-5">
          <div className="text-xs text-stone-500 font-medium mb-1">
            Foto observatie
          </div>
          <p className="text-stone-300 text-sm leading-relaxed">
            {r.photo_observation}
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="border border-stone-800 bg-stone-950 rounded-lg p-4">
      <div className="text-xs text-stone-500 mb-1">{label}</div>
      <div
        className={`text-2xl num font-medium ${accent ? "text-emerald-400" : "text-stone-100"}`}
      >
        {value}
      </div>
    </div>
  );
}
