"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Calculator,
  Calendar,
  ClipboardCheck,
  Dumbbell,
  Flame,
  MessageSquare,
  Settings,
  TrendingDown,
  Zap,
} from "lucide-react";
import { NavTab } from "@/components/ui/NavTab";
import { DashboardTab } from "@/components/tabs/DashboardTab";
import { DailyLogTab } from "@/components/tabs/DailyLogTab";
import { WeightTab } from "@/components/tabs/WeightTab";
import { ChatTab } from "@/components/tabs/ChatTab";
import { ScheduleTab } from "@/components/tabs/ScheduleTab";
import { AgendaTab } from "@/components/tabs/AgendaTab";
import { CalculatorTab } from "@/components/tabs/CalculatorTab";
import { SportBurnTab } from "@/components/tabs/SportBurnTab";
import {
  getProfile,
  listLogs,
  listSchedule,
  updateProfile,
} from "@/lib/db";
import type { DailyLog, Profile, ScheduleEntry } from "@/lib/types";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "log", label: "Daglog", icon: ClipboardCheck },
  { id: "weight", label: "Gewicht", icon: TrendingDown },
  { id: "chat", label: "AI Coach", icon: MessageSquare },
  { id: "schedule", label: "Schema", icon: Dumbbell },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "calculator", label: "Calorieën", icon: Calculator },
  { id: "sports", label: "Sport burn", icon: Flame },
] as const;

export function DashboardShell() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [schedule, setSchedule] = useState<Record<string, ScheduleEntry>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProfile(), listLogs(), listSchedule()])
      .then(([p, l, s]) => {
        setProfile(p);
        setLogs(l);
        setSchedule(s);
      })
      .finally(() => setLoading(false));
  }, []);

  // Auto-update current_weight from latest log
  useEffect(() => {
    if (!profile) return;
    const sorted = [...logs]
      .filter((l) => l.weight)
      .sort((a, b) => b.date.localeCompare(a.date));
    if (sorted.length > 0 && sorted[0].weight !== profile.current_weight) {
      const newWeight = sorted[0].weight as number;
      setProfile({ ...profile, current_weight: newWeight });
      updateProfile({ current_weight: newWeight }).catch(() => {});
    }
  }, [logs, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-stone-500 font-mono text-xs uppercase tracking-[0.3em]">
          Loading...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-300 font-mono">
        Profiel niet gevonden. <Link href="/onboarding" className="text-orange-400 ml-2">Onboarding starten →</Link>
      </div>
    );
  }

  const onLogSaved = (log: DailyLog) => {
    setLogs((prev) => {
      const others = prev.filter((l) => l.date !== log.date);
      const next = [...others, log].sort((a, b) => a.date.localeCompare(b.date));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200">
      <header className="border-b border-stone-800 bg-stone-950 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-500 flex items-center justify-center">
                <Zap size={18} className="text-stone-950" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-stone-100 tracking-tight uppercase leading-none">
                  FORGE
                </h1>
                <div className="text-[10px] uppercase tracking-[0.25em] text-stone-500 font-mono mt-0.5">
                  Sport Journey OS
                </div>
              </div>
            </div>
            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-2 border border-stone-800 hover:border-orange-500/50 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs text-stone-200">{profile.name}</div>
                <div className="text-[10px] text-stone-500 font-mono">
                  {profile.current_weight}kg → {profile.target_weight}kg
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-stone-950 text-xs font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <Settings size={14} className="text-stone-500" />
            </Link>
          </div>
          <nav className="flex gap-1 overflow-x-auto -mb-px">
            {TABS.map((t) => (
              <NavTab
                key={t.id}
                active={activeTab === t.id}
                onClick={() => setActiveTab(t.id)}
                icon={t.icon}
                label={t.label}
              />
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "dashboard" && (
          <DashboardTab
            profile={profile}
            logs={logs}
            schedule={schedule}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === "log" && (
          <DailyLogTab logs={logs} onSaved={onLogSaved} profile={profile} />
        )}
        {activeTab === "weight" && <WeightTab logs={logs} profile={profile} />}
        {activeTab === "chat" && <ChatTab profile={profile} />}
        {activeTab === "schedule" && (
          <ScheduleTab schedule={schedule} onChange={setSchedule} />
        )}
        {activeTab === "agenda" && <AgendaTab logs={logs} />}
        {activeTab === "calculator" && <CalculatorTab profile={profile} />}
        {activeTab === "sports" && <SportBurnTab profile={profile} />}
      </main>

      <footer className="border-t border-stone-800 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 flex justify-between text-[10px] uppercase tracking-[0.2em] text-stone-600 font-mono">
          <span>FORGE · Personal Sport OS</span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
