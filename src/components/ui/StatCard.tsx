"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

export function StatCard({
  label,
  value,
  unit,
  trend,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  unit?: string;
  trend?: number | null;
  icon?: LucideIcon;
  accent?: boolean;
}) {
  return (
    <div className="relative overflow-hidden border border-stone-800 bg-stone-950 p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-mono">
          {label}
        </span>
        {Icon && <Icon size={14} className="text-stone-600" />}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-light tracking-tight text-stone-100">
          {value}
        </span>
        {unit && <span className="text-xs text-stone-500 font-mono">{unit}</span>}
      </div>
      {trend !== undefined && trend !== null && (
        <div
          className={`mt-2 flex items-center gap-1 text-xs font-mono ${
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
          <span>
            {trend > 0 ? "+" : ""}
            {trend}
            {unit}
          </span>
        </div>
      )}
      {accent && <div className="absolute top-0 right-0 w-1 h-full bg-orange-500" />}
    </div>
  );
}
