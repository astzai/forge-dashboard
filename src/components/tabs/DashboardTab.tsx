"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ClipboardCheck,
  Dumbbell,
  Flame,
  MessageSquare,
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
  const dayName = new Date().toLocaleDateString("nl-NL", { weekday: "long" });
  const dayKey = dayName.charAt(0).toUpperCase() + dayName.slice(1);
  const todaySchedule = schedule[dayKey];

  const denom = profile.start_weight - profile.target_weight || 1;
  const progressPct = Math.min(
    100,
    Math.max(0, ((profile.start_weight - profile.current_weight) / denom) * 100),
  );

  const last7 = logs
    .filter((l) => l.weight)
    .slice(-7)
    .map((l) => ({ date: l.date.slice(5), weight: l.weight as number }));

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 border border-stone-800 bg-gradient-to-br from-stone-950 to-stone-900 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-3xl rounded-full" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.2em] text-orange-400 font-mono mb-2">
              {dayName.toUpperCase()} ·{" "}
              {new Date().toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "long",
              })}
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-stone-100 leading-tight tracking-tight uppercase mb-4">
              {todaySchedule?.duration === 0
                ? "Recovery Day"
                : todaySchedule?.type || "Train hard"}
            </h2>
            {todaySchedule?.exercises && todaySchedule.duration > 0 && (
              <p className="text-sm text-stone-400 font-mono leading-relaxed mb-4 max-w-2xl">
                {todaySchedule.exercises}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => setActiveTab("log")}
                className="bg-orange-500 text-stone-950 px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-mono hover:bg-orange-400 transition-colors flex items-center gap-2"
              >
                <ClipboardCheck size={14} /> Log dag
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className="border border-stone-800 hover:border-orange-500 text-stone-300 px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-mono transition-colors flex items-center gap-2"
              >
                <MessageSquare size={14} /> Vraag coach
              </button>
            </div>
          </div>
        </div>

        <div className="border border-stone-800 bg-stone-950 p-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-mono mb-4">
            Voortgang
          </div>
          <div className="text-5xl font-light text-stone-100 mb-1">
            {progressPct.toFixed(0)}
            <span className="text-2xl text-stone-500">%</span>
          </div>
          <div className="text-xs text-stone-500 font-mono mb-4">van je doel</div>
          <div className="h-1.5 bg-stone-900 mb-3">
            <div
              className="h-full bg-orange-500 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-stone-600">
            <span>{profile.start_weight}kg</span>
            <span>{profile.target_weight}kg</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Huidig gewicht"
          value={profile.current_weight}
          unit="kg"
          icon={Activity}
          accent
        />
        <StatCard
          label="Vandaag stappen"
          value={todayLog?.steps || 0}
          icon={TrendingUp}
        />
        <StatCard
          label="Vandaag kcal"
          value={todayLog?.calories || 0}
          icon={Flame}
        />
        <StatCard
          label="Vandaag eiwit"
          value={todayLog?.protein || 0}
          unit="g"
          icon={Dumbbell}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-stone-800 bg-stone-950 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-mono">
              Laatste 7 dagen
            </h3>
            <button
              onClick={() => setActiveTab("weight")}
              className="text-[10px] uppercase tracking-wider text-orange-400 font-mono hover:text-orange-300"
            >
              Meer →
            </button>
          </div>
          {last7.length > 0 ? (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={last7}>
                  <CartesianGrid stroke="#292524" strokeDasharray="2 4" />
                  <XAxis
                    dataKey="date"
                    stroke="#57534e"
                    tick={{ fontSize: 10, fontFamily: "monospace" }}
                  />
                  <YAxis
                    stroke="#57534e"
                    tick={{ fontSize: 10, fontFamily: "monospace" }}
                    domain={["dataMin - 1", "dataMax + 1"]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0c0a09",
                      border: "1px solid #292524",
                      fontFamily: "monospace",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ fill: "#f97316", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-stone-600 text-xs font-mono">
              Geen data — log je eerste dag
            </div>
          )}
        </div>

        <div className="border border-stone-800 bg-stone-950 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-mono">
              Recente feedback
            </h3>
            <button
              onClick={() => setActiveTab("agenda")}
              className="text-[10px] uppercase tracking-wider text-orange-400 font-mono hover:text-orange-300"
            >
              Alle →
            </button>
          </div>
          {lastLog?.feedback ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 border border-orange-500/50 bg-orange-500/10 flex items-center justify-center">
                  <span className="text-xl font-light text-orange-400">
                    {lastLog.feedback.score}
                  </span>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
                    {lastLog.date}
                  </div>
                  <div className="text-xs text-stone-400 font-mono">/ 10</div>
                </div>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {lastLog.feedback.feedback}
              </p>
              <p className="text-xs text-orange-300 leading-relaxed border-l-2 border-orange-500 pl-3">
                → {lastLog.feedback.tomorrow}
              </p>
            </div>
          ) : (
            <div className="text-stone-600 text-xs font-mono py-8 text-center">
              Vul je eerste log in voor coach feedback
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
