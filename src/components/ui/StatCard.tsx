"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

export function StatCard({
  label,
  value,
  unit,
  trend,
  icon: Icon,
  accent,
  spark,
}: {
  label: string;
  value: number | string;
  unit?: string;
  trend?: number | null;
  icon?: LucideIcon;
  accent?: boolean;
  spark?: number[];
}) {
  return (
    <div className="relative overflow-hidden card p-4 md:p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-stone-400 font-medium">{label}</span>
        {Icon && <Icon size={14} className="text-stone-600" />}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="hero-num text-3xl md:text-4xl text-stone-100">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-stone-500 font-medium">{unit}</span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 min-h-[20px]">
        {trend !== undefined && trend !== null ? (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend < 0
                ? "text-emerald-400"
                : trend > 0
                  ? "text-orange-400"
                  : "text-stone-500"
            }`}
          >
            {trend < 0 ? (
              <TrendingDown size={12} />
            ) : trend > 0 ? (
              <TrendingUp size={12} />
            ) : null}
            <span className="num">
              {trend > 0 ? "+" : ""}
              {trend}
              {unit}
            </span>
          </div>
        ) : (
          <div />
        )}
        {spark && spark.length > 1 && (
          <div className="flex-1 h-6 max-w-[80px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spark.map((v, i) => ({ i, v }))}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#f97316"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      {accent && (
        <div className="absolute top-0 right-0 w-1 h-full bg-orange-500" />
      )}
    </div>
  );
}
