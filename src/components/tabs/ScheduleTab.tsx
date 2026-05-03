"use client";

import { useState } from "react";
import { Check, Edit2, Sparkles, X } from "lucide-react";
import { listSchedule, upsertScheduleDay } from "@/lib/db";
import type { ScheduleEntry } from "@/lib/types";

export function ScheduleTab({
  schedule,
  onChange,
}: {
  schedule: Record<string, ScheduleEntry>;
  onChange: (next: Record<string, ScheduleEntry>) => void;
}) {
  const [editDay, setEditDay] = useState<string | null>(null);
  const [editData, setEditData] = useState<ScheduleEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState<string | null>(null);

  const days = Object.keys(schedule);

  const regenerate = async () => {
    if (
      !confirm(
        "AI maakt een nieuw 7-daags schema op basis van je profiel. Je huidige schema wordt overschreven. Doorgaan?",
      )
    ) {
      return;
    }
    setGenerating(true);
    setGenMessage(null);
    try {
      const res = await fetch("/api/generate-schedule", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setGenMessage(`Fout: ${json.error || "onbekend"}`);
      } else {
        // Herlaad het schema
        const fresh = await listSchedule();
        onChange(fresh);
        setGenMessage(
          json.rationale
            ? `Nieuw schema klaar. ${json.rationale}`
            : "Nieuw schema klaar.",
        );
      }
    } catch (err: any) {
      setGenMessage(`Fout: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const startEdit = (day: string) => {
    setEditDay(day);
    setEditData({ ...schedule[day] });
  };

  const save = async () => {
    if (!editDay || !editData) return;
    setSaving(true);
    try {
      await upsertScheduleDay({ ...editData, day: editDay });
      onChange({ ...schedule, [editDay]: { ...editData, day: editDay } });
      setEditDay(null);
    } catch (err: any) {
      alert(`Kon niet opslaan: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI generate-CTA bovenaan */}
      <div className="card p-5 md:p-6 relative overflow-hidden bg-gradient-to-br from-amber-500/8 via-orange-500/4 to-transparent border-amber-500/20">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 flex-shrink-0">
            <Sparkles size={18} className="text-stone-950" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-base font-bold text-stone-100">
                  AI-gegenereerd schema
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Gebaseerd op je doel, ervaring, dagen, blessures &amp;
                  voorkeuren
                </p>
              </div>
              <button
                onClick={regenerate}
                disabled={generating}
                className="btn-primary text-xs flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Sparkles size={13} className="animate-pulse" /> Bouwen...
                  </>
                ) : (
                  <>
                    <Sparkles size={13} /> Genereer opnieuw
                  </>
                )}
              </button>
            </div>
            {genMessage && (
              <p className="text-xs text-amber-300 mt-3 leading-relaxed">
                {genMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border border-stone-800 bg-stone-950 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-mono">
            Wekelijks trainingsschema
          </h3>
          <span className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
            Tap om aan te passen
          </span>
        </div>
        <div className="grid gap-3">
          {days.map((day, i) => {
            const data = schedule[day];
            const isEditing = editDay === day;
            const isRest = data.duration === 0;

            if (isEditing && editData) {
              return (
                <div
                  key={day}
                  className="border border-orange-500 bg-stone-900 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.2em] text-orange-400 font-mono">
                      {day}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={save}
                        disabled={saving}
                        className="p-1.5 bg-orange-500 text-stone-950 hover:bg-orange-400 disabled:opacity-50"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditDay(null)}
                        className="p-1.5 border border-stone-800 text-stone-400 hover:text-stone-200"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <input
                    value={editData.type}
                    onChange={(e) =>
                      setEditData({ ...editData, type: e.target.value })
                    }
                    placeholder="Type training"
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-2 text-sm text-stone-200 font-mono focus:outline-none focus:border-orange-500"
                  />
                  <textarea
                    value={editData.exercises}
                    onChange={(e) =>
                      setEditData({ ...editData, exercises: e.target.value })
                    }
                    placeholder="Oefeningen"
                    rows={3}
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-2 text-sm text-stone-200 font-mono focus:outline-none focus:border-orange-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={editData.duration}
                      onChange={(e) =>
                        setEditData({ ...editData, duration: +e.target.value })
                      }
                      placeholder="Duur (min)"
                      className="bg-stone-950 border border-stone-800 px-3 py-2 text-sm text-stone-200 font-mono focus:outline-none focus:border-orange-500"
                    />
                    <input
                      value={editData.time}
                      onChange={(e) =>
                        setEditData({ ...editData, time: e.target.value })
                      }
                      placeholder="Tijd"
                      className="bg-stone-950 border border-stone-800 px-3 py-2 text-sm text-stone-200 font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              );
            }

            return (
              <button
                key={day}
                onClick={() => startEdit(day)}
                className={`group text-left border ${
                  isRest
                    ? "border-stone-900 bg-stone-950/50"
                    : "border-stone-800 bg-stone-950 hover:border-orange-500/50"
                } p-4 transition-all`}
              >
                <div className="grid md:grid-cols-12 gap-4 items-start">
                  <div className="md:col-span-2">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-stone-600 font-mono">
                      {["MA", "DI", "WO", "DO", "VR", "ZA", "ZO"][i]}
                    </div>
                    <div className="text-sm font-light text-stone-200 mt-0.5">
                      {day}
                    </div>
                  </div>
                  <div className="md:col-span-7">
                    <div
                      className={`text-sm ${
                        isRest ? "text-stone-500" : "text-orange-400"
                      } font-medium mb-1`}
                    >
                      {data.type}
                    </div>
                    <div className="text-xs text-stone-500 font-mono leading-relaxed">
                      {data.exercises}
                    </div>
                  </div>
                  <div className="md:col-span-2 text-xs font-mono text-stone-500">
                    {data.duration > 0 && <div>{data.duration} min</div>}
                    {data.time !== "-" && <div>{data.time}</div>}
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    <Edit2
                      size={14}
                      className="text-stone-700 group-hover:text-orange-400 transition-colors"
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
