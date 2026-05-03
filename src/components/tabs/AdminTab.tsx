"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ChevronRight,
  Coins,
  ExternalLink,
  Eye,
  Key,
  MessageSquare,
  Pencil,
  Trash2,
  Users as UsersIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CountUp, useInView } from "@/components/landing/interactions";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Field";

type Section = "overview" | "users" | "content";

type ActivityRow = {
  user_id: string;
  name: string;
  current_weight: number;
  target_weight: number;
  onboarded: boolean;
  profile_created: string;
  has_byok: boolean;
  total_logs: number;
  last_log_date: string | null;
  logs_last_7d: number;
  ai_calls_30d: number;
  managed_cost_30d: number;
};

type UsageRow = {
  call_type: string;
  used_managed: boolean;
  cost_eur: number;
  created_at: string;
};

export function AdminTab() {
  const [section, setSection] = useState<Section>("overview");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
          Admin paneel
        </h2>
        <p className="text-stone-400">
          Alleen jij ziet dit. Beheer users, monitor activiteit, edit copy.
        </p>
      </div>

      {/* Sub-nav */}
      <div className="flex gap-1 border-b border-white/5">
        {(
          [
            { id: "overview", label: "Overview", icon: Activity },
            { id: "users", label: "Users", icon: UsersIcon },
            { id: "content", label: "Site copy", icon: Pencil },
          ] as const
        ).map((t) => {
          const I = t.icon;
          const active = section === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSection(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                active
                  ? "text-orange-400 border-orange-500"
                  : "text-stone-500 border-transparent hover:text-stone-300"
              }`}
            >
              <I size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {section === "overview" && <Overview />}
      {section === "users" && <Users />}
      {section === "content" && <ContentSection />}
    </div>
  );
}

/* ============================================================
   OVERVIEW
   ============================================================ */
function Overview() {
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [usage, setUsage] = useState<UsageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [u1, u2] = await Promise.all([
        supabase
          .from("admin_user_activity")
          .select("*")
          .order("profile_created", { ascending: false }),
        supabase
          .from("ai_usage")
          .select("call_type, used_managed, cost_eur, created_at")
          .gte(
            "created_at",
            new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
          ),
      ]);
      if (u1.data) setRows(u1.data as ActivityRow[]);
      if (u2.data) setUsage(u2.data as UsageRow[]);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loading />;

  const totalUsers = rows.length;
  const onboarded = rows.filter((r) => r.onboarded).length;
  const active7d = rows.filter((r) => r.logs_last_7d > 0).length;
  const totalLogs = rows.reduce((s, r) => s + r.total_logs, 0);
  const totalCalls30d = usage.length;
  const managedCost30d = usage
    .filter((u) => u.used_managed)
    .reduce((s, u) => s + Number(u.cost_eur), 0);
  const last7dCalls = usage.filter(
    (u) =>
      new Date(u.created_at).getTime() >
      Date.now() - 7 * 24 * 3600 * 1000,
  ).length;
  const last7dManagedCost = usage
    .filter(
      (u) =>
        u.used_managed &&
        new Date(u.created_at).getTime() >
          Date.now() - 7 * 24 * 3600 * 1000,
    )
    .reduce((s, u) => s + Number(u.cost_eur), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          icon={UsersIcon}
          label="Total users"
          value={<CountUp to={totalUsers} />}
          sub={`${onboarded} onboarded`}
        />
        <Stat
          icon={Activity}
          label="Active (7d)"
          value={<CountUp to={active7d} />}
          sub={`${totalUsers > 0 ? Math.round((active7d / totalUsers) * 100) : 0}% retention`}
          accent
        />
        <Stat
          icon={MessageSquare}
          label="AI calls (30d)"
          value={<CountUp to={totalCalls30d} />}
          sub={`${last7dCalls} laatste 7d`}
        />
        <Stat
          icon={Coins}
          label="Managed cost (30d)"
          value={
            <>
              €
              <CountUp to={managedCost30d} decimals={2} />
            </>
          }
          sub={`€${last7dManagedCost.toFixed(2)} laatste 7d`}
          accent
        />
      </div>

      {/* Cost breakdown by call type */}
      <div className="card p-5">
        <h3 className="text-base font-semibold mb-3">
          Managed kosten per type (30d)
        </h3>
        <CostBreakdown usage={usage} />
      </div>

      {/* Top spenders */}
      <div className="card p-5">
        <h3 className="text-base font-semibold mb-3">
          Top users laatste 30 dagen
        </h3>
        {rows.length === 0 ? (
          <p className="text-sm text-stone-500">Geen users.</p>
        ) : (
          <div className="space-y-1.5">
            {rows
              .slice()
              .sort((a, b) => b.ai_calls_30d - a.ai_calls_30d)
              .slice(0, 8)
              .map((r) => (
                <div
                  key={r.user_id}
                  className="flex items-center justify-between p-2 rounded hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={r.name} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {r.name}
                      </div>
                      <div className="text-xs text-stone-500">
                        {r.total_logs} logs · {r.logs_last_7d} laatste 7d
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="num text-sm">
                      €{Number(r.managed_cost_30d).toFixed(2)}
                    </div>
                    <div className="text-xs text-stone-500">
                      {r.ai_calls_30d} calls
                      {r.has_byok && " · own key"}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CostBreakdown({ usage }: { usage: UsageRow[] }) {
  const managed = usage.filter((u) => u.used_managed);
  const types = ["chat", "photo", "daily", "weekly", "food"] as const;
  const grouped = types.map((t) => {
    const calls = managed.filter((u) => u.call_type === t);
    const cost = calls.reduce((s, u) => s + Number(u.cost_eur), 0);
    return { type: t, count: calls.length, cost };
  });
  const max = Math.max(...grouped.map((g) => g.cost), 0.01);
  return (
    <div className="space-y-2">
      {grouped.map((g) => (
        <div key={g.type} className="flex items-center gap-3">
          <span className="text-xs text-stone-400 w-16 capitalize">
            {g.type}
          </span>
          <div className="flex-1 h-2 bg-stone-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
              style={{ width: `${(g.cost / max) * 100}%` }}
            />
          </div>
          <span className="num text-xs text-stone-300 w-20 text-right">
            €{g.cost.toFixed(3)}
          </span>
          <span className="text-xs text-stone-500 w-10 text-right num">
            {g.count}×
          </span>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   USERS
   ============================================================ */
function Users() {
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [openUser, setOpenUser] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("admin_user_activity")
      .select("*")
      .order("profile_created", { ascending: false });
    if (data) setRows(data as ActivityRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const deleteUser = async (userId: string, name: string) => {
    if (
      !confirm(
        `User "${name}" volledig verwijderen? Dit verwijdert profiel + logs + foto's. Niet terug te draaien.`,
      )
    )
      return;
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("user_id", userId);
    if (error) {
      alert(`Verwijderen mislukt: ${error.message}`);
      return;
    }
    setRows((prev) => prev.filter((r) => r.user_id !== userId));
  };

  if (loading) return <Loading />;

  const filtered = filter
    ? rows.filter((r) =>
        r.name.toLowerCase().includes(filter.toLowerCase()),
      )
    : rows;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <input
          type="search"
          placeholder="Zoek op naam..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 max-w-xs bg-stone-900 border border-white/10 rounded-md px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-orange-500"
        />
        <span className="text-xs text-stone-500">
          {filtered.length} van {rows.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center text-stone-500 text-sm">
          Geen users gevonden.
        </div>
      ) : (
        <div className="card overflow-hidden">
          {filtered.map((r, i) => (
            <div
              key={r.user_id}
              className={`${
                i > 0 ? "border-t border-white/5" : ""
              }`}
            >
              <button
                onClick={() =>
                  setOpenUser(openUser === r.user_id ? null : r.user_id)
                }
                className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={r.name} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium flex items-center gap-2">
                      {r.name}
                      {!r.onboarded && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300">
                          niet onboarded
                        </span>
                      )}
                      {r.has_byok && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 inline-flex items-center gap-1">
                          <Key size={9} /> BYOK
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-500 num truncate">
                      {r.current_weight}kg → {r.target_weight}kg ·{" "}
                      {r.total_logs} logs · {r.logs_last_7d} 7d
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-stone-300 num">
                      €{Number(r.managed_cost_30d).toFixed(2)}
                    </div>
                    <div className="text-xs text-stone-500 num">
                      {r.ai_calls_30d} AI · 30d
                    </div>
                  </div>
                  <ChevronRight
                    size={14}
                    className={`text-stone-600 transition-transform ${
                      openUser === r.user_id ? "rotate-90" : ""
                    }`}
                  />
                </div>
              </button>

              {openUser === r.user_id && (
                <div className="border-t border-white/5 p-4 bg-stone-900/30">
                  <div className="grid sm:grid-cols-2 gap-4 mb-4 text-sm">
                    <Detail
                      label="Aangemeld"
                      value={new Date(r.profile_created).toLocaleDateString(
                        "nl-NL",
                      )}
                    />
                    <Detail
                      label="Laatste log"
                      value={r.last_log_date ?? "—"}
                    />
                    <Detail
                      label="Totaal logs"
                      value={String(r.total_logs)}
                    />
                    <Detail
                      label="AI calls (30d)"
                      value={String(r.ai_calls_30d)}
                    />
                    <Detail
                      label="Managed cost (30d)"
                      value={`€${Number(r.managed_cost_30d).toFixed(3)}`}
                    />
                    <Detail
                      label="Eigen API key?"
                      value={r.has_byok ? "Ja" : "Nee — managed"}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <SecondaryButton
                      onClick={() => alert("Detail-view komt later")}
                      className="text-xs flex items-center gap-1.5"
                    >
                      <Eye size={12} /> Bekijk logs
                    </SecondaryButton>
                    <button
                      onClick={() => deleteUser(r.user_id, r.name)}
                      className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/60 px-4 py-2 rounded-md flex items-center gap-1.5"
                    >
                      <Trash2 size={12} /> Verwijder user
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   CONTENT
   ============================================================ */
function ContentSection() {
  return (
    <div className="card p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
          <Pencil size={20} className="text-orange-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">Landing copy editor</h3>
          <p className="text-sm text-stone-400 mb-4 leading-relaxed">
            Edit alle teksten op de marketing landing — hero, features,
            pricing, CTA. Save = direct live op{" "}
            <Link
              href="/"
              target="_blank"
              className="text-orange-400 underline"
            >
              forge-dashboard-silk.vercel.app
            </Link>
            .
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin">
              <PrimaryButton className="flex items-center gap-2">
                <Pencil size={14} /> Open editor
              </PrimaryButton>
            </Link>
            <Link href="/" target="_blank">
              <SecondaryButton className="flex items-center gap-2">
                <ExternalLink size={14} /> Preview landing
              </SecondaryButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   shared bits
   ============================================================ */
function Stat({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="card p-4 md:p-5 relative overflow-hidden">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-stone-400 font-medium">{label}</span>
        <Icon size={14} className="text-stone-600" />
      </div>
      <div className="hero-num text-2xl md:text-3xl text-stone-100">
        {value}
      </div>
      {sub && <div className="text-xs text-stone-500 mt-1">{sub}</div>}
      {accent && (
        <div className="absolute top-0 right-0 w-1 h-full bg-orange-500" />
      )}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-stone-950 text-xs font-bold flex-shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-stone-500 font-medium mb-0.5">{label}</div>
      <div className="text-sm text-stone-200">{value}</div>
    </div>
  );
}

function Loading() {
  return (
    <div className="text-stone-500 text-sm py-8 text-center flex items-center justify-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 pulse-soft" />
      Loading...
    </div>
  );
}
