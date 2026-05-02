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
      className={`group relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
        active
          ? "text-orange-400 border-orange-500"
          : "text-stone-500 border-transparent hover:text-stone-300"
      }`}
    >
      <Icon size={15} />
      <span>{label}</span>
    </button>
  );
}
