import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, ApiError } from "../api/client";
import { today } from "../api/types";
import type { Goal, Recommendation, Suggest } from "../api/types";
import { healthyKg } from "../bmi";
import BmiLine, { BMI_NOTE } from "./BmiLine";
import { Button, ErrorBanner, Input } from "./ui";

const card = "rounded-3xl border border-mist-200 bg-white p-6 shadow-card md:p-8";
const DIRECTION = { lose: "Lose weight", maintain: "Maintain my weight", gain: "Gain weight" } as const;

function reasoning(r: Recommendation, s: Suggest, target: number | null, eventName: string) {
  if (r.basis === "maintain") return "That keeps your weight steady.";
  if (r.basis === "date" && target !== null && s.currentKg !== undefined) {
    return `To go from ${s.currentKg} kg to ${target} kg by ${eventName} (${s.daysLeft} days) you'd need about ${r.neededWeeklyKg} kg a week.`;
  }
  return `This assumes a gentle ${Math.abs(r.weeklyKg)} kg a week. Add ${r.missing.join(" and ")} and I'll tailor it.`;
}

export default function PlanGoal({ refreshKey = 0, onSaved }: { refreshKey?: number; onSaved?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<Goal["type"]>("maintain");
  const [target, setTarget] = useState("");
  const [date, setDate] = useState("");
  const [label, setLabel] = useState("");
  const [budget, setBudget] = useState("2000");
  const [sug, setSug] = useState<Suggest | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load the saved goal once. Later refreshes must not overwrite what you're typing.
  useEffect(() => {
    api<Goal>("/goal")
      .then((g) => {
        setType(g.type);
        setBudget(String(g.dailyCalorieBudget));
        setTarget(g.targetWeightKg ? String(g.targetWeightKg) : "");
        setDate(g.targetDate ?? "");
        setLabel(g.eventLabel ?? "");
      })
      .catch((e) => {
        if (!(e instanceof ApiError && e.status === 404)) setError(e instanceof ApiError ? e.message : "Could not load your goal");
      })
      .finally(() => setLoading(false));
  }, []);

  const t = target.trim() === "" ? null : Number(target);
  const validTarget = t !== null && Number.isFinite(t) && t >= 30 && t <= 300 ? t : null;

  // Live suggestion: re-asked (after a short pause) whenever the target, date or goal type changes
  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ today: today(), type });
    if (validTarget !== null) params.set("targetWeightKg", String(validTarget));
    if (date) params.set("targetDate", date);
    const timer = setTimeout(() => {
      api<Suggest>(`/profile/suggest?${params}`)
        .then((s) => { if (!cancelled) setSug(s); })
        .catch(() => { if (!cancelled) setSug(null); });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [validTarget, date, type, refreshKey]);

  const cur = sug?.currentKg;
  // With a target weight, the direction follows from it. Otherwise you choose.
  const derived: Goal["type"] | null =
    validTarget !== null && cur !== undefined
      ? Math.abs(validTarget - cur) < 0.5 ? "maintain" : validTarget < cur ? "lose" : "gain"
      : null;
  const effectiveType = derived ?? type;
  const eventName = label.trim() || "your date";
  const rec = sug?.recommendation;
  const req = rec?.requiredBudget ?? null;
  const typed = Number(budget);
  const tooLow = !!rec && rec.direction === "lose" && Number.isFinite(typed) && typed < rec.budget - 100;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const n = Number(budget);
    if (!Number.isInteger(n) || n < 800 || n > 10000) return setError("Budget must be a whole number from 800 to 10000");
    if (target.trim() !== "" && validTarget === null) return setError("Target weight must be between 30 and 300 kg");
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await api("/goal", {
        method: "PUT",
        body: {
          type: effectiveType,
          dailyCalorieBudget: n,
          ...(validTarget !== null && { targetWeightKg: validTarget }),
          ...(date && { targetDate: date }),
          ...(label.trim() && { eventLabel: label.trim() }),
        },
      });
      setSaved(true);
      onSaved?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save your goal");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <section className={`${card} text-center text-sm font-semibold text-mist-500`}>Loading your goal…</section>;

  return (
    <section className={card}>
      <h2 className="font-display text-2xl font-extrabold tracking-tight">Your goal</h2>
      <p className="mt-1 text-sm text-mist-500">Set a target and a date, and I'll suggest a daily budget to match.</p>

      <form onSubmit={submit} noValidate className="mt-5 max-w-xl space-y-4">
        {error && <ErrorBanner message={error} />}

        <div className="grid grid-cols-2 gap-3">
          <Input label="Target weight (kg, optional)" type="number" step="0.1" value={target} onChange={(e) => setTarget(e.target.value)} />
          <Input label="Date (optional)" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <div className="col-span-2">
            <Input label="What's it for? (optional)" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Goa trip" />
          </div>
        </div>

        {derived ? (
          <p className="text-sm font-semibold text-mist-700">
            Your goal: <span className="text-blush-600">{DIRECTION[derived]}</span>{" "}
            <span className="font-normal text-mist-500">(worked out from your target weight)</span>
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-mist-100 p-1">
            {(["lose", "maintain", "gain"] as const).map((o) => (
              <button
                type="button"
                key={o}
                onClick={() => setType(o)}
                className={`rounded-lg py-2 text-sm font-semibold capitalize transition ${
                  type === o ? "bg-white text-blush-600 shadow-sm" : "text-mist-500 hover:text-mist-700"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        )}

        {sug && !sug.hasProfile && (
          <p className="rounded-2xl bg-mist-50 p-4 text-sm font-semibold text-mist-700">
            Add your body stats in Profile and I'll suggest a budget that fits your goal.
          </p>
        )}

        {sug?.hasProfile && cur !== undefined && sug.heightCm !== undefined && (
          <div className="space-y-1.5 rounded-2xl bg-mist-50 p-4">
            <BmiLine label="Your BMI now" kg={cur} cm={sug.heightCm} />
            {validTarget !== null && <BmiLine label="BMI at your target" kg={validTarget} cm={sug.heightCm} />}
            <p className="text-xs text-mist-500">
              Healthy range for your height: {healthyKg(sug.heightCm)[0]} to {healthyKg(sug.heightCm)[1]} kg (BMI 18.5 to 24.9). {BMI_NOTE}
            </p>
          </div>
        )}

        {sug?.hasProfile && rec && (
          <div className="rounded-2xl bg-blush-50 p-4">
            <p className="text-sm font-semibold text-mist-700">{rec.limited ? "Safe suggestion for you" : "Suggested for you"}</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
              <p className="font-display text-4xl font-extrabold tracking-tight text-blush-600">
                {rec.budget}
                <span className="ml-1.5 text-base font-semibold text-mist-500">kcal a day</span>
              </p>
              <Button type="button" variant="soft" onClick={() => setBudget(String(rec.budget))} className="!py-2">
                Use {rec.budget}
              </Button>
            </div>
            <p className="mt-2 text-sm text-mist-700">{reasoning(rec, sug, validTarget, eventName)}</p>

            {rec.limited && req !== null && (
              <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                <p className="font-semibold">
                  {req <= 0
                    ? `To reach your target by ${eventName}, the math says you'd have to eat almost nothing. That pace just isn't possible, so the safe plan above is the way.`
                    : `To reach your target by ${eventName}, the math says about ${req} kcal a day (that's about ${rec.neededWeeklyKg} kg a week, and the safe limit is about ${rec.safeWeeklyKg}).`}
                </p>
                <p className="mt-1">
                  {rec.direction === "lose"
                    ? "That's faster than is usually safe, and hard to keep up: you'd likely feel hungry and tired, and you could lose muscle. The safe plan above gets you most of the way, and you'll feel much better doing it. Honestly, I'd pick that one."
                    : "That's a faster pace than is usually comfortable to keep up. The safe plan above gets you most of the way. I'd pick that one."}
                </p>
                {req >= 800 && (
                  <Button type="button" variant="soft" onClick={() => setBudget(String(req))} className="mt-2 !py-2">
                    Use {req} anyway
                  </Button>
                )}
              </div>
            )}

            {rec.notes.map((note) => (
              <p key={note} className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">{note}</p>
            ))}
            {tooLow && (
              <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                Your budget is lower than the safe suggestion of {rec.budget}. It's your choice, but I'd gently suggest the safe one.
              </p>
            )}
            <p className="mt-2 text-xs text-mist-500">
              You burn about {rec.maintenance} kcal a day before workouts, and logged workouts are added on top. A rough estimate, not medical advice.
            </p>
          </div>
        )}

        <Input label="Daily calorie budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
        <div className="flex items-center gap-3">
          <Button type="submit" loading={saving}>Save goal</Button>
          {saved && <p role="status" className="text-sm font-semibold text-sage-600">Saved. Today now uses this budget.</p>}
        </div>
      </form>
    </section>
  );
}