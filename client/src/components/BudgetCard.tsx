import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../api/client";
import { today } from "../api/types";
import type { Goal, Stats } from "../api/types";
import { MyCoach, coachLine, useCoach } from "./Coach";
import { ErrorBanner } from "./ui";

function daysUntil(date: string) {
  const ms = new Date(date + "T00:00:00").getTime() - new Date(today() + "T00:00:00").getTime();
  return Math.round(ms / 86400000);
}

function Ring({ pct, over, children }: { pct: number; over: boolean; children: ReactNode }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-44 w-44 shrink-0 place-items-center">
      <svg viewBox="0 0 160 160" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="80" cy="80" r={r} fill="none" strokeWidth="10" className="stroke-white/25" />
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          className={`${over ? "stroke-amber-200" : "stroke-blush-100"} transition-all duration-700`}
        />
      </svg>
      {children}
    </div>
  );
}

export default function BudgetCard({ refreshKey, date }: { refreshKey: number; date: string }) {
  const { prefs } = useCoach();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setStats(await api<Stats>(`/stats/daily?date=${date}`));
      try {
        setGoal(await api<Goal>("/goal"));
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) setGoal(null); // no goal yet is normal
        else throw e;
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load your day");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const plain = "rounded-3xl border border-mist-200 bg-white p-6 shadow-card md:p-8";
  if (loading) return <section className={`${plain} text-center text-sm font-semibold text-mist-500`}>Loading your day…</section>;
  if (error) return <section className={plain}><ErrorBanner message={error} /></section>;

  if (!goal) {
    return (
      <section className={`${plain} pattern-sparkles`}>
        <h2 className="font-display text-2xl font-extrabold tracking-tight">Set your daily goal</h2>
        <p className="mt-1 max-w-md text-sm text-mist-500">Pick a target and a date, and I'll suggest a daily budget that fits your body and your timeline.</p>
        <Link to="/plan" className="mt-5 inline-block rounded-xl bg-blush-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-blush-600">
          Set up my plan
        </Link>
      </section>
    );
  }

  const eaten = stats?.eaten ?? 0;
  const burned = stats?.burned ?? 0;
  const remaining = stats?.remaining ?? goal.dailyCalorieBudget;
  const allowance = goal.dailyCalorieBudget + burned;
  const over = remaining < 0;
  const pct = over ? 100 : Math.min(100, Math.round((eaten / allowance) * 100));
  const days = goal.targetDate ? daysUntil(goal.targetDate) : null;
  const eventName = goal.eventLabel || "your event";

  const numbers = [
    { label: "Budget", value: goal.dailyCalorieBudget },
    { label: "Eaten", value: eaten },
    { label: "Burned", value: burned },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-blush-500 p-6 text-white shadow-lift md:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full bg-white/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 right-24 h-36 w-36 rounded-full bg-white/[0.07]" />

      <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
        <Ring pct={pct} over={over}>
          <MyCoach cheer={!over} size={104} />
        </Ring>

        <div className="w-full flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blush-100">
                {over ? "Over budget by" : date === today() ? "Left today" : "Left on this day"}
              </p>
              <p className="font-display text-6xl font-extrabold tracking-tight">
                {Math.abs(remaining)}
                <span className="ml-1.5 text-lg font-semibold text-blush-100">kcal</span>
              </p>
            </div>
            <Link to="/plan" className="rounded-lg px-2 py-1 text-sm font-semibold text-blush-100 hover:bg-white/10">
              Edit goal
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-3 divide-x divide-white/20 border-t border-white/20 pt-4 text-center">
            {numbers.map((n) => (
              <div key={n.label} className="px-2">
                <p className="font-display text-xl font-bold">{n.value}</p>
                <p className="text-xs font-semibold text-blush-100">{n.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {days !== null && (
              <span className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold">
                {days > 0
                  ? `${days} day${days === 1 ? "" : "s"} until ${eventName}`
                  : days === 0
                    ? `${eventName} is today`
                    : `${eventName} was ${-days} day${days === -1 ? "" : "s"} ago`}
              </span>
            )}
            <span className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold">{coachLine(prefs.kind, over)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}