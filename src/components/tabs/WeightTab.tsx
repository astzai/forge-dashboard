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
import { Activity, Award, Target, TrendingDown } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import type { DailyLog, Profile } from "@/lib/types";

export function WeightTab({
  logs,
  profile,
}: {
  logs: DailyLog[];
  profile: Profile;
}) {
  const weightData = logs
    .filter((l) => l.weight)
    .map((l) => ({
      date: l.date.slice(5),
      weight: typeof l.weight === "string" ? parseFloat(l.weight) : (l.weight as number),
    }));

  const current = profile.current_weight;
  const start = profile.start_weight;
  const target = profile.target_weight;
  const lost = (start - current).toFixed(1);
  const toGo = (current - target).toFixed(1);
  const progress = (
    ((start - current) / (start - target || 1)) *
    100
  ).toFixed(0);

  const weeklyAvg =
    weightData.length >= 7
      ? (
          weightData.slice(-7).reduce((a, b) => a + b.weight, 0) /
          Math.min(7, weightData.length)
        ).toFixed(1)
      : null;
  const lastWeek =
    weightData.length >= 14
      ? (weightData.slice(-14, -7).reduce((a, b) => a + b.weight, 0) / 7).toFixed(
          1,
        )
      : null;
  const weeklyTrend =
    weeklyAvg && lastWeek ? (+weeklyAvg - +lastWeek).toFixed(1) : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Huidig" value={current} unit="kg" icon={Activity} accent />
        <StatCard label="Verloren" value={lost} unit="kg" icon={TrendingDown} />
        <StatCard label="Te gaan" value={toGo} unit="kg" icon={Target} />
        <StatCard label="Voortgang" value={progress} unit="%" icon={Award} />
      </div>

      <div className="border border-stone-800 bg-stone-950 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-mono">
              Gewicht traject
            </h3>
            <p className="text-xl font-light text-stone-100 mt-1">
              {start}kg → {target}kg
            </p>
          </div>
          {weeklyTrend !== null && (
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.2em] text-stone-600 font-mono">
                Week trend
              </div>
              <div
                className={`text-lg font-mono ${
                  +weeklyTrend < 0 ? "text-emerald-400" : "text-orange-400"
                }`}
              >
                {+weeklyTrend > 0 ? "+" : ""}
                {weeklyTrend}kg
              </div>
            </div>
          )}
        </div>

        {weightData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightData}>
                <defs>
                  <linearGradient id="wColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  labelStyle={{ color: "#a8a29e" }}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#f97316"
                  strokeWidth={2}
                  fill="url(#wColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-stone-600 font-mono text-sm">
            Vul je dagelijkse log in om je traject te zien
          </div>
        )}
      </div>

      {weightData.length >= 3 && (
        <div className="border border-stone-800 bg-stone-950 p-6">
          <h3 className="text-xs uppercase tracking-[0.2em] text-stone-500 font-mono mb-4">
            Statistieken
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Stat
              label="Hoogste"
              value={`${Math.max(...weightData.map((d) => d.weight)).toFixed(1)} kg`}
            />
            <Stat
              label="Laagste"
              value={`${Math.min(...weightData.map((d) => d.weight)).toFixed(1)} kg`}
            />
            <Stat
              label="Gemiddeld"
              value={`${(weightData.reduce((a, b) => a + b.weight, 0) / weightData.length).toFixed(1)} kg`}
            />
            <Stat label="Logs" value={`${weightData.length}x`} />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-stone-600 font-mono">
        {label}
      </div>
      <div className="text-stone-200 font-mono">{value}</div>
    </div>
  );
}
