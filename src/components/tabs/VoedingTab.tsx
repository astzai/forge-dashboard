"use client";

import { useEffect, useState } from "react";
import {
  ChefHat,
  ChevronDown,
  ChevronRight,
  Clock,
  Flame,
  ShoppingCart,
  Sparkles,
  Utensils,
  Calculator,
  Dumbbell,
} from "lucide-react";
import { CalculatorTab } from "@/components/tabs/CalculatorTab";
import { SportBurnTab } from "@/components/tabs/SportBurnTab";
import {
  getCurrentMealPlan,
  getCurrentShoppingList,
  updateShoppingList,
} from "@/lib/db";
import { DAYS } from "@/lib/constants";
import type {
  MealPlan,
  Profile,
  ShoppingList,
  Meal,
  ShoppingItem,
} from "@/lib/types";

const MOMENT_LABEL: Record<string, string> = {
  ontbijt: "Ontbijt",
  lunch: "Lunch",
  diner: "Diner",
  snack: "Snack",
};

const MOMENT_ORDER = ["ontbijt", "lunch", "diner", "snack"];

type SubTab = "schema" | "boodschappen" | "tools";

export function VoedingTab({ profile }: { profile: Profile }) {
  const [sub, setSub] = useState<SubTab>("schema");
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [list, setList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [genMessage, setGenMessage] = useState<string | null>(null);
  const [generating, setGenerating] = useState<"plan" | "list" | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCurrentMealPlan(), getCurrentShoppingList()])
      .then(([p, l]) => {
        setPlan(p);
        setList(l);
        if (p) {
          // open vandaag standaard
          const todayName = new Date().toLocaleDateString("nl-NL", {
            weekday: "long",
          });
          const cap = todayName.charAt(0).toUpperCase() + todayName.slice(1);
          if (p.plan?.[cap]) setExpandedDay(cap);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const generatePlan = async () => {
    if (
      plan &&
      !confirm(
        "Je hebt al een eetschema voor deze week. Een nieuwe genereren overschrijft het oude. Doorgaan?",
      )
    ) {
      return;
    }
    setGenerating("plan");
    setGenMessage(null);
    try {
      const res = await fetch("/api/generate-meal-plan", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setGenMessage(`Fout: ${json.error || "onbekend"}`);
      } else {
        setPlan(json);
        setList(null); // wordt straks bij shopping-genereer opnieuw aangemaakt
        setGenMessage(
          `Eetschema klaar! Targets: ${json.daily_targets?.kcal} kcal · ${json.daily_targets?.protein}g eiwit · ${json.daily_targets?.carbs}g KH · ${json.daily_targets?.fat}g vet per dag.`,
        );
      }
    } catch (err: any) {
      setGenMessage(`Fout: ${err.message}`);
    } finally {
      setGenerating(null);
    }
  };

  const generateList = async () => {
    if (!plan) {
      setGenMessage("Genereer eerst een eetschema.");
      return;
    }
    setGenerating("list");
    setGenMessage(null);
    try {
      const res = await fetch("/api/generate-shopping-list", {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) {
        setGenMessage(`Fout: ${json.error || "onbekend"}`);
      } else {
        setList(json);
        setSub("boodschappen");
        setGenMessage(
          `Boodschappenlijst klaar — ${json.items?.length || 0} items, ${json.prep_plan?.length || 0} prep blok(ken).`,
        );
      }
    } catch (err: any) {
      setGenMessage(`Fout: ${err.message}`);
    } finally {
      setGenerating(null);
    }
  };

  const toggleItem = async (idx: number) => {
    if (!list) return;
    const updated = [...list.items];
    updated[idx] = { ...updated[idx], checked: !updated[idx].checked };
    setList({ ...list, items: updated });
    try {
      await updateShoppingList(list.week_start, updated);
    } catch {
      // niet fataal — UI blijft gesynced
    }
  };

  if (loading) {
    return (
      <div className="text-stone-500 text-sm py-12 text-center">Laden...</div>
    );
  }

  return (
    <div className="space-y-5">
      {/* AI generate-CTA */}
      <div className="card p-5 md:p-6 relative overflow-hidden bg-gradient-to-br from-amber-500/8 via-orange-500/4 to-transparent border-amber-500/20">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 flex-shrink-0">
            <ChefHat size={18} className="text-stone-950" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-base font-bold text-stone-100">
                  AI eetschema &amp; boodschappen
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Persoonlijk schema op basis van je kcal-doel, dieet,
                  intoleranties en kook-frequentie
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={generatePlan}
                  disabled={!!generating}
                  className="btn-primary text-xs flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
                >
                  {generating === "plan" ? (
                    <>
                      <Sparkles size={13} className="animate-pulse" /> Bouwen...
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />{" "}
                      {plan ? "Nieuw schema" : "Maak schema"}
                    </>
                  )}
                </button>
                <button
                  onClick={generateList}
                  disabled={!!generating || !plan}
                  className="px-3 py-2 text-xs border border-amber-500/40 hover:border-amber-500 text-amber-300 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {generating === "list" ? (
                    <>
                      <ShoppingCart size={13} className="animate-pulse" /> ...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={13} /> Boodschappen
                    </>
                  )}
                </button>
              </div>
            </div>
            {genMessage && (
              <p className="text-xs text-amber-300 mt-3 leading-relaxed">
                {genMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sub-nav */}
      <div className="flex gap-1 border-b border-white/5">
        <SubNavBtn
          active={sub === "schema"}
          onClick={() => setSub("schema")}
          icon={Utensils}
          label="Eetschema"
        />
        <SubNavBtn
          active={sub === "boodschappen"}
          onClick={() => setSub("boodschappen")}
          icon={ShoppingCart}
          label="Boodschappen"
        />
        <SubNavBtn
          active={sub === "tools"}
          onClick={() => setSub("tools")}
          icon={Calculator}
          label="Tools"
        />
      </div>

      {/* SCHEMA */}
      {sub === "schema" && (
        <div>
          {!plan ? (
            <EmptyState
              icon={ChefHat}
              title="Nog geen eetschema voor deze week"
              hint="Klik op 'Maak schema' bovenaan — AI bouwt een persoonlijk 7-daags eetschema in ~10 sec."
            />
          ) : (
            <div className="space-y-3">
              {plan.daily_targets && (
                <div className="card p-4 flex items-center justify-around gap-3 text-center">
                  <Stat
                    label="Kcal/dag"
                    value={plan.daily_targets.kcal}
                    icon={Flame}
                  />
                  <Divider />
                  <Stat
                    label="Eiwit"
                    value={`${plan.daily_targets.protein}g`}
                    icon={Dumbbell}
                  />
                  <Divider />
                  <Stat
                    label="KH"
                    value={`${plan.daily_targets.carbs}g`}
                  />
                  <Divider />
                  <Stat label="Vet" value={`${plan.daily_targets.fat}g`} />
                </div>
              )}

              {DAYS.map((day) => {
                const meals: Meal[] = (plan.plan?.[day] as Meal[]) ?? [];
                const isOpen = expandedDay === day;
                const dayKcal = meals.reduce(
                  (s, m) => s + (m.kcal || 0),
                  0,
                );
                const dayProtein = meals.reduce(
                  (s, m) => s + (m.protein || 0),
                  0,
                );
                return (
                  <div key={day} className="card overflow-hidden">
                    <button
                      onClick={() => setExpandedDay(isOpen ? null : day)}
                      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        {isOpen ? (
                          <ChevronDown size={16} className="text-orange-400" />
                        ) : (
                          <ChevronRight size={16} className="text-stone-500" />
                        )}
                        <span className="text-sm font-semibold text-stone-100">
                          {day}
                        </span>
                        <span className="text-xs text-stone-500">
                          {meals.length} maaltijden
                        </span>
                      </div>
                      <div className="text-xs text-stone-400 num">
                        {dayKcal} kcal · {dayProtein}g eiwit
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-white/5 divide-y divide-white/5">
                        {MOMENT_ORDER.map((moment) => {
                          const meal = meals.find((m) => m.moment === moment);
                          if (!meal) return null;
                          const key = `${day}-${moment}`;
                          const mealOpen = expandedMeal === key;
                          return (
                            <div key={moment}>
                              <button
                                onClick={() =>
                                  setExpandedMeal(mealOpen ? null : key)
                                }
                                className="w-full px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] text-left"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="text-[11px] uppercase tracking-wider text-orange-400 font-semibold mb-0.5">
                                    {MOMENT_LABEL[moment]}
                                  </div>
                                  <div className="text-sm text-stone-100 font-medium truncate">
                                    {meal.name}
                                  </div>
                                </div>
                                <div className="text-xs text-stone-400 num text-right flex-shrink-0 ml-3">
                                  {meal.kcal}kcal
                                  <div className="text-[10px] text-stone-500">
                                    {meal.protein}g E · {meal.carbs}g K ·{" "}
                                    {meal.fat}g V
                                  </div>
                                </div>
                              </button>

                              {mealOpen && (
                                <div className="px-5 pb-4 space-y-3 bg-stone-950/40">
                                  <div>
                                    <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1.5">
                                      Ingrediënten
                                    </div>
                                    <ul className="space-y-1">
                                      {(meal.ingredients || []).map(
                                        (ing, i) => (
                                          <li
                                            key={i}
                                            className="text-xs text-stone-300 flex justify-between"
                                          >
                                            <span>{ing.item}</span>
                                            <span className="text-stone-500 num">
                                              {ing.amount} {ing.unit}
                                            </span>
                                          </li>
                                        ),
                                      )}
                                    </ul>
                                  </div>
                                  <div>
                                    <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1.5 flex items-center gap-1.5">
                                      Bereiding
                                      {meal.prep_minutes && (
                                        <span className="text-stone-400 normal-case font-normal flex items-center gap-1">
                                          <Clock size={10} />{" "}
                                          {meal.prep_minutes}min
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-stone-300 leading-relaxed">
                                      {meal.prep}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* BOODSCHAPPEN */}
      {sub === "boodschappen" && (
        <div>
          {!list ? (
            <EmptyState
              icon={ShoppingCart}
              title="Nog geen boodschappenlijst"
              hint={
                plan
                  ? "Klik 'Boodschappen' bovenaan om een lijst te genereren uit je huidige eetschema."
                  : "Genereer eerst een eetschema, dan een boodschappenlijst."
              }
            />
          ) : (
            <div className="space-y-5">
              {/* Meal prep blokken */}
              {list.prep_plan?.length > 0 && (
                <div className="card p-5">
                  <div className="text-xs uppercase tracking-wider text-orange-400 font-semibold mb-3 flex items-center gap-1.5">
                    <ChefHat size={12} /> Meal prep planning
                  </div>
                  <div className="space-y-3">
                    {list.prep_plan.map((p, i) => (
                      <div
                        key={i}
                        className="border border-white/5 rounded-md p-3 bg-stone-950/40"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-semibold text-stone-100">
                            {p.day}
                          </span>
                          <span className="text-xs text-amber-300 num flex items-center gap-1">
                            <Clock size={11} /> {p.minutes} min
                          </span>
                        </div>
                        <div className="text-xs text-stone-400 mb-1.5">
                          {p.meals.join(" · ")}
                        </div>
                        {p.note && (
                          <p className="text-xs text-stone-500 italic">
                            {p.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Boodschappenlijst gegroepeerd per categorie */}
              <ShoppingByCategory
                items={list.items}
                onToggle={toggleItem}
              />

              <div className="text-center text-xs text-stone-500">
                Lijst voor week startende {list.week_start}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOOLS */}
      {sub === "tools" && (
        <div className="space-y-10">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-1">
              Calorieën calculator
            </h2>
            <p className="text-sm text-stone-400 mb-5">
              Bereken je BMR, TDEE en macro-doelen.
            </p>
            <CalculatorTab profile={profile} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-1">
              Sport calorieën
            </h2>
            <p className="text-sm text-stone-400 mb-5">
              Verbruik per sport, aangepast aan jouw gewicht.
            </p>
            <SportBurnTab profile={profile} />
          </div>
        </div>
      )}
    </div>
  );
}

// ============== sub-components ==============

function SubNavBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active
          ? "border-orange-500 text-orange-300"
          : "border-transparent text-stone-500 hover:text-stone-300"
      }`}
    >
      <Icon size={14} /> {label}
    </button>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon?: any;
}) {
  return (
    <div className="flex-1">
      <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold flex items-center gap-1 justify-center">
        {Icon && <Icon size={10} />} {label}
      </div>
      <div className="text-lg font-bold text-stone-100 num mt-0.5">{value}</div>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-8 bg-white/5" />;
}

function EmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon: any;
  title: string;
  hint: string;
}) {
  return (
    <div className="card p-10 text-center">
      <Icon size={28} className="mx-auto text-stone-700 mb-3" />
      <div className="text-sm text-stone-300 font-medium mb-1">{title}</div>
      <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
        {hint}
      </p>
    </div>
  );
}

function ShoppingByCategory({
  items,
  onToggle,
}: {
  items: ShoppingItem[];
  onToggle: (idx: number) => void;
}) {
  // Group with original indexes preserved
  const groups: Record<string, Array<{ item: ShoppingItem; idx: number }>> = {};
  items.forEach((item, idx) => {
    const cat = item.category || "Overig";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push({ item, idx });
  });

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold flex items-center gap-1.5">
          <ShoppingCart size={12} /> Boodschappenlijst
        </div>
        <div className="text-xs text-stone-400 num">
          {checkedCount} / {items.length}
        </div>
      </div>
      {Object.entries(groups).map(([cat, entries]) => (
        <div
          key={cat}
          className="border-b border-white/5 last:border-b-0"
        >
          <div className="px-5 pt-3 pb-1 text-[10px] uppercase tracking-wider text-orange-400 font-semibold">
            {cat}
          </div>
          <ul className="px-2 pb-2">
            {entries.map(({ item, idx }) => (
              <li key={idx}>
                <button
                  onClick={() => onToggle(idx)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/[0.04] text-left transition-colors"
                >
                  <span
                    className={`w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center ${
                      item.checked
                        ? "bg-orange-500 border-orange-500"
                        : "border-stone-700"
                    }`}
                  >
                    {item.checked && (
                      <svg
                        viewBox="0 0 24 24"
                        className="w-3 h-3 text-stone-950"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span
                    className={`flex-1 text-sm ${
                      item.checked
                        ? "text-stone-600 line-through"
                        : "text-stone-200"
                    }`}
                  >
                    {item.item}
                  </span>
                  <span
                    className={`text-xs num ${
                      item.checked ? "text-stone-700" : "text-stone-500"
                    }`}
                  >
                    {item.amount} {item.unit}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
