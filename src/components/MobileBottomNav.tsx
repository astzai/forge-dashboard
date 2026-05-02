"use client";

import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { MoreHorizontal, X } from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export function MobileBottomNav({
  primary,
  overflow,
  active,
  onSelect,
}: {
  primary: NavItem[];
  overflow: NavItem[];
  active: string;
  onSelect: (id: string) => void;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-stone-950/95 backdrop-blur border-t border-white/10 pb-safe"
        aria-label="Hoofdnavigatie"
      >
        <div className="grid grid-cols-5 gap-0">
          {primary.map((t) => {
            const Icon = t.icon;
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelect(t.id)}
                className={`relative flex flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] transition-colors ${
                  isActive
                    ? "text-orange-400"
                    : "text-stone-500 hover:text-stone-300"
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-orange-500 rounded-full" />
                )}
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{t.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setSheetOpen(true)}
            className="flex flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] text-stone-500 hover:text-stone-300"
          >
            <MoreHorizontal size={20} />
            <span className="text-[10px] font-medium">Meer</span>
          </button>
        </div>
      </nav>

      {sheetOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-stone-950 border-t border-white/10 rounded-t-2xl p-6 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Meer</h3>
              <button
                onClick={() => setSheetOpen(false)}
                className="w-9 h-9 rounded-full bg-stone-900 flex items-center justify-center text-stone-400"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {overflow.map((t) => {
                const Icon = t.icon;
                const isActive = active === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelect(t.id);
                      setSheetOpen(false);
                    }}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                      isActive
                        ? "border-orange-500/50 bg-orange-500/5 text-orange-400"
                        : "border-stone-800 bg-stone-900/50 text-stone-200 hover:border-orange-500/30"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
