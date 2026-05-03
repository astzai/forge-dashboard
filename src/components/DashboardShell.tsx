"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Calculator,
  Calendar,
  ClipboardCheck,
  Dumbbell,
  FileText,
  Flame,
  MessageSquare,
  Settings,
  Shield,
  TrendingDown,
  Zap,
} from "lucide-react";
import { NavTab } from "@/components/ui/NavTab";
import { MobileBottomNav, type NavItem } from "@/components/MobileBottomNav";
import { DashboardTab } from "@/components/tabs/DashboardTab";
import { DailyLogTab } from "@/components/tabs/DailyLogTab";
import { WeightTab } from "@/components/tabs/WeightTab";
import { ChatTab } from "@/components/tabs/ChatTab";
import { ScheduleTab } from "@/components/tabs/ScheduleTab";
import { AgendaTab } from "@/components/tabs/AgendaTab";
import { CalculatorTab } from "@/components/tabs/CalculatorTab";
import { SportBurnTab } from "@/components/tabs/SportBurnTab";
import { WeekTab } from "@/components/tabs/WeekTab";
import { AdminTab } from "@/components/tabs/AdminTab";
import { isOwnerUser } from "@/lib/content";
import {
  getProfile,
  listLogs,
  listSchedule,
  updateProfile,
} from "@/lib/db";
import type { DailyLog, Profile, ScheduleEntry } from "@/lib/types";

const ALL_TABS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "log", label: "Daglog", icon: ClipboardCheck },
  { id: "week", label: "Week", icon: FileText },
  { id: "weight", label: "Gewicht", icon: TrendingDown },
  { id: "chat", label: "Coach", icon: MessageSquare },
  { id: "schedule", label: "Schema", icon: Dumbbell },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "calculator", label: "Calorieën", icon: Calculator },
  { id: "sports", label: "Sport burn", icon: Flame },
];

const ADMIN_TAB: NavItem = { id: "admin", label: "Admin", icon: Shield };

// Mobile bottom nav: 4 most-used tabs (+ Meer button = 5 slots)
const PRIMARY_MOBILE: NavItem[] = [
  ALL_TABS.find((t) => t.id === "dashboard")!,
  ALL_TABS.find((t) => t.id === "log")!,
  ALL_TABS.find((t) => t.id === "week")!,
  ALL_TABS.find((t) => t.id === "chat")!,
];
const OVERFLOW_MOBILE: NavItem[] = ALL_TABS.filter(
  (t) => !PRIMARY_MOBILE.find((p) => p.id === t.id),
);

export function DashboardShell() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [schedule, setSchedule] = useState<Record<string, ScheduleEntry>>({});
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    Promise.all([getProfile(), listLogs(), listSchedule(), isOwnerUser()])
      .then(([p, l, s, owner]) => {
        setProfile(p);
        setLogs(l);
        setSchedule(s);
        setIsOwner(owner);
      })
      .finally(() => setLoading(false));
  }, []);

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
        <div className="flex items-center gap-3 text-stone-500">
          <div className="w-2 h-2 rounded-full bg-orange-500 pulse-soft" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-300">
        Profiel niet gevonden.{" "}
        <Link href="/onboarding" className="text-orange-400 ml-2">
          Onboarding starten →
        </Link>
      </div>
    );
  }

  const onLogSaved = (log: DailyLog) => {
    setLogs((prev) => {
      const others = prev.filter((l) => l.date !== log.date);
      const next = [...others, log].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-stone-100">
      <header className="border-b border-white/5 bg-stone-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between py-3.5 md:py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-500 rounded-md flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Zap size={16} className="text-stone-950" strokeWidth={2.8} />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight">FORGE</h1>
                <div className="text-[11px] text-stone-500 -mt-0.5">
                  Sport Journey OS
                </div>
              </div>
            </div>
            <Link
              href="/settings"
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-white/5 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <div className="text-sm text-stone-100 font-medium">
                  {profile.name}
                </div>
                <div className="text-[11px] text-stone-500 num">
                  {profile.current_weight}kg → {profile.target_weight}kg
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-stone-950 text-sm font-bold shadow-md shadow-orange-500/20">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <Settings size={14} className="text-stone-500 hidden md:block" />
            </Link>
          </div>
          <nav className="hidden md:flex gap-1 overflow-x-auto -mb-px no-scrollbar">
            {ALL_TABS.map((t) => (
              <NavTab
                key={t.id}
                active={activeTab === t.id}
                onClick={() => setActiveTab(t.id)}
                icon={t.icon}
                label={t.label}
              />
            ))}
            {isOwner && (
              <NavTab
                active={activeTab === ADMIN_TAB.id}
                onClick={() => setActiveTab(ADMIN_TAB.id)}
                icon={ADMIN_TAB.icon}
                label={ADMIN_TAB.label}
              />
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-32 md:pb-12">
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
        {activeTab === "week" && <WeekTab profile={profile} />}
        {activeTab === "weight" && <WeightTab logs={logs} profile={profile} />}
        {activeTab === "chat" && <ChatTab profile={profile} />}
        {activeTab === "schedule" && (
          <ScheduleTab schedule={schedule} onChange={setSchedule} />
        )}
        {activeTab === "agenda" && <AgendaTab logs={logs} />}
        {activeTab === "calculator" && <CalculatorTab profile={profile} />}
        {activeTab === "sports" && <SportBurnTab profile={profile} />}
        {activeTab === "admin" && isOwner && <AdminTab />}
      </main>

      <MobileBottomNav
        primary={PRIMARY_MOBILE}
        overflow={OVERFLOW_MOBILE}
        active={activeTab}
        onSelect={setActiveTab}
      />

      <footer className="hidden md:block border-t border-white/5 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 flex justify-between text-xs text-stone-600">
          <span>FORGE · Personal Sport OS</span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
