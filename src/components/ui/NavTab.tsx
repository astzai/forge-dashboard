"use client";

import type { LucideIcon } from "lucide-react";

export function NavTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center gap-2.5 px-4 py-3 text-xs uppercase tracking-[0.15em] font-mono transition-all border-b ${
        active
          ? "text-orange-400 border-orange-500"
          : "text-stone-500 border-transparent hover:text-stone-300"
      }`}
    >
      <Icon size={14} />
      <span>{label}</span>
    </button>
  );
}
