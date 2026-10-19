import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, ApiError } from "../api/client";
import { today } from "../api/types";
import type { Goal, Stats } from "../api/types";
import { Button, ErrorBanner, Input } from "./ui";

function daysUntil(date: string) {
  const ms = new Date(date + "T00:00:00").getTime() - new Date(today() + "T00:00:00").getTime();
  return Math.round(ms / 86400000);
}

function GoalForm({ initial, onSaved }: { initial: Goal | null; onSaved: () => void }) {
  const [type, setType] = useState<Goal["type"]>(initial?.type ?? "maintain");
  const [budget, setBudget] = useState(String(initial?.dailyCalorieBudget ?? 2000));
  const [targetDate, setTargetDate] = useState(initial?.targetDate ?? "");
  const [label, setLabel] = useState(initial?.eventLabel ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const n = Number(budget);
    if (!Number.isInteger(n) || n < 800 || n > 10000) return setError("Budget must be a whole number from 800 to 10000");
    setLoading(true);
    setError("");
    try {
      await api("/goal", {
        method: "PUT",
        body: {
          type,
          dailyCalorieBudget: n,
          ...(targetDate && { targetDate }),
          ...(label.trim() && { eventLabel: label.trim() }),
        },
      });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save goal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && <ErrorBanner message={error} />}
      <div className="grid grid-cols-3 gap-2">
        {(["lose", "maintain", "gain"] as const).map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setType(t)}
            className={`rounded-2xl py-2 text-sm font-extrabold capitalize ${
              type === t ? "bg-blush-500 text-white" : "bg-mist-100 text-mist-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <Input label="Daily calorie budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Event name (optional)" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Goa trip" />
        <Input label="Event date (optional)" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
      </div>
      <Button type="submit" loading={loading} className="w-full">Save goal</Button>
    </form>
  );
}

export default function BudgetCard({ refreshKey }: { refreshKey: number }) {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setStats(await api<Stats>(`/stats/daily?date=${today()}`));
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
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const card = "rounded-3xl bg-white p-6 shadow-lg shadow-blush-200/50";
  if (loading) return <div className={`${card} text-center font-semibold text-mist-500`}>Loading your day…</div>;
  if (error) return <div className={card}><ErrorBanner message={error} /></div>;

  if (!goal || editing) {
    return (
      <div className={card}>
        <h2 className="mb-1 text-xl font-extrabold text-blush-600">{goal ? "Edit your goal" : "Set your goal 🎯"}</h2>
        <p className="mb-4 text-sm font-semibold text-mist-500">This sets your daily budget.</p>
        <GoalForm initial={goal} onSaved={() => { setEditing(false); load(); }} />
      </div>
    );
  }

  const eaten = stats?.eaten ?? 0;
  const burned = stats?.burned ?? 0;
  const remaining = stats?.remaining ?? goal.dailyCalorieBudget;
  const allowance = goal.dailyCalorieBudget + burned;
  const pct = Math.min(100, Math.round((eaten / allowance) * 100));
  const days = goal.targetDate ? daysUntil(goal.targetDate) : null;

  return (
    <div className={card}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-mist-500">Left today</p>
          <p className={`text-5xl font-extrabold ${remaining < 0 ? "text-red-500" : "text-blush-600"}`}>
            {remaining} <span className="text-lg text-mist-500">kcal</span>
          </p>
        </div>
        <button onClick={() => setEditing(true)} className="text-sm font-bold text-mist-500 hover:text-blush-600">Edit goal</button>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-blush-100">
        <div className="h-full rounded-full bg-blush-400 transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-mist-50 p-3"><p className="text-xs font-bold text-mist-500">Budget</p><p className="font-extrabold">{goal.dailyCalorieBudget}</p></div>
        <div className="rounded-2xl bg-mist-50 p-3"><p className="text-xs font-bold text-mist-500">Eaten</p><p className="font-extrabold">{eaten}</p></div>
        <div className="rounded-2xl bg-mist-50 p-3"><p className="text-xs font-bold text-mist-500">Burned</p><p className="font-extrabold">{burned}</p></div>
      </div>

      {days !== null && (
        <p className="mt-4 rounded-2xl bg-blush-50 p-3 text-center text-sm font-extrabold text-blush-600">
          {days > 0 ? `${days} day${days === 1 ? "" : "s"} until ${goal.eventLabel || "your event"} ✨`
            : days === 0 ? `${goal.eventLabel || "Your event"} is today! 🎉`
            : `${goal.eventLabel || "Your event"} was ${-days} day${days === -1 ? "" : "s"} ago`}
        </p>
      )}
    </div>
  );
}