"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ClipboardCheck,
  Dumbbell,
  FileText,
  Flame,
  MessageSquare,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import type { DailyLog, Profile, ScheduleEntry } from "@/lib/types";

export function DashboardTab({
  profile,
  logs,
  schedule,
  setActiveTab,
}: {
  profile: Profile;
  logs: DailyLog[];
  schedule: Record<string, ScheduleEntry>;
  setActiveTab: (tab: string) => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const todayLog = logs.find((l) => l.date === today);
  const lastLog = [...logs].sort((a, b) => b.date.localeCompare(a.date))[0];
  const todayDate = new Date();
  const dayName = todayDate.toLocaleDateString("nl-NL", { weekday: "long" });
  const dayKey = dayName.charAt(0).toUpperCase() + dayName.slice(1);
  const todaySchedule = schedule[dayKey];

  // Week-analyse CTA: alleen op Zaterdag (6), Zondag (0), Maandag (1)
  const dayNum = todayDate.getDay();
  const showWeekCta = dayNum === 0 || dayNum === 1 || dayNum === 6;
  const weekCtaCopy =
    dayNum === 6
      ? "Het weekend is begonnen — tijd om je week te reviewen"
      : dayNum === 0
        ? "Zondag — perfecte dag voor je week-analyse"
        : "Maandag — review je vorige week voor een sterke start";

  const denom = profile.start_weight - profile.target_weight || 1;
  const progressPct = Math.min(
    100,
    Math.max(
      0,
      ((profile.start_weight - profile.current_weight) / denom) * 100,
    ),
  );

  const last30 = logs
    .filter((l) => l.weight)
    .slice(-30)
    .map((l) => ({ date: l.date.slice(5), weight: l.weight as number }));
  const sparkWeights = last30.slice(-14).map((l) => l.weight);

  const lostKg = profile.start_weight - profile.current_weight;
  const lostKgRounded = Math.round(lostKg * 10) / 10;

  return (
    <div className="space-y-5 md:space-y-6">
      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-stone-950 to-stone-950 border border-white/10 p-6 md:p-10">
        <div className="absolute inset-0 bg-grid pointer-events-none opacity-40" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 pulse-soft" />
            <span className="text-xs uppercase tracking-wider text-orange-400 font-semibold">
              {dayName} ·{" "}
              {new Date().toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "long",
              })}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tightest leading-[1.05] mb-3 max-w-2xl text-stone-50">
            {todaySchedule?.duration === 0
              ? "Recovery Day"
              : todaySchedule?.type || "Train hard"}
          </h1>
          {todaySchedule?.exercises && todaySchedule.duration > 0 && (
            <p className="text-stone-300 leading-relaxed mb-5 max-w-2xl">
              {todaySchedule.exercises}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("log")}
              className="btn-primary flex items-center gap-2"
            >
              <ClipboardCheck size={15} /> Log dag
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className="px-5 py-2.5 text-sm font-medium border border-white/15 rounded-md hover:border-white/30 text-stone-100 transition-colors flex items-center gap-2"
            >
              <MessageSquare size={15} /> Vraag coach
            </button>
          </div>
        </div>
      </div>

      {/* WEEK ANALYSE CTA — alleen Za/Zo/Ma */}
      {showWeekCta && (
        <button
          onClick={() => setActiveTab("week")}
          className="w-full text-left card p-5 md:p-6 relative overflow-hidden card-hover bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/30 group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 flex-shrink-0">
              <Sparkles size={20} className="text-stone-950" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold">
                  Week analyse
                </span>
                <span className="w-1 h-1 rounded-full bg-amber-400 pulse-soft" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-stone-100 leading-tight">
                {weekCtaCopy}
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Klik om je AI-rapport van de afgelopen week te genereren
              </p>
            </div>
            <div className="flex items-center gap-1 text-amber-300 text-sm font-medium opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <FileText size={14} /> Open
            </div>
          </div>
        </button>
      )}

      {/* HERO METRICS — big number + progress */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 card p-6 md:p-7">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">
              Huidig gewicht
            </span>
            {lostKg > 0 && (
              <span className="text-xs text-emerald-400 num font-medium flex items-center gap-1">
                <TrendingDown size={12} />
                {lostKgRounded}kg sinds start
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="hero-num text-6xl md:text-7xl text-stone-100">
              {profile.current_weight}
            </span>
            <span className="text-xl text-stone-500 font-medium">kg</span>
          </div>
          {last30.length > 1 && (
            <div className="h-20 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last30}>
                  <defs>
                    <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#f97316"
                        stopOpacity={0.3}
                      />
                      <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#f97316"
                    strokeWidth={2}
                    fill="url(#hg)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          <button
            onClick={() => setActiveTab("weight")}
            className="text-xs text-orange-400 hover:text-orange-300 mt-2"
          >
            Volledig traject →
          </button>
        </div>

        <div className="card p-6 md:p-7">
          <div className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-2">
            Voortgang
          </div>
          <div className="hero-num text-6xl text-stone-100 mb-1">
            {progressPct.toFixed(0)}
            <span className="text-2xl text-stone-500">%</span>
          </div>
          <div className="text-sm text-stone-500 mb-4">van je doel</div>
          <div className="h-2 bg-stone-900 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs num text-stone-500 font-medium">
            <span>{profile.start_weight}kg</span>
            <span>{profile.target_weight}kg</span>
          </div>
        </div>
      </div>

      {/* TODAY METRICS */}
      <div>
        <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold mb-3 px-1">
          Vandaag
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Stappen"
            value={(todayLog?.steps || 0).toLocaleString("nl-NL")}
            icon={Activity}
          />
          <StatCard
            label="Calorieën"
            value={(todayLog?.calories || 0).toLocaleString("nl-NL")}
            unit="kcal"
            icon={Flame}
          />
          <StatCard
            label="Eiwit"
            value={todayLog?.protein || 0}
            unit="g"
            icon={Dumbbell}
          />
          <StatCard
            label="Sport"
            value={todayLog?.sport_duration || 0}
            unit="min"
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* RECENT FEEDBACK */}
      {lastLog?.feedback && (
        <div className="card p-6 md:p-7 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 h-full bg-orange-500" />
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold">
              Laatste coach feedback · {lastLog.date}
            </div>
            <button
              onClick={() => setActiveTab("agenda")}
              className="text-xs text-orange-400 hover:text-orange-300"
            >
              Alle →
            </button>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 border-2 border-orange-500 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <span className="hero-num text-3xl text-orange-400">
                {lastLog.feedback.score}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-stone-200 leading-relaxed">
                {lastLog.feedback.feedback}
              </p>
            </div>
          </div>
          <div className="border-l-2 border-orange-500 pl-3">
            <div className="text-xs text-stone-500 font-medium mb-1">
              Voor morgen
            </div>
            <p className="text-orange-300 leading-relaxed">
              → {lastLog.feedback.tomorrow}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
