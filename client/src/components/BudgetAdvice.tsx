import { useState } from "react";
import { api, ApiError } from "../api/client";
import type { Forecast } from "../api/types";
import { Button, ErrorBanner } from "./ui";

function dateIn(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function BudgetAdvice({ f, onApplied }: { f: Forecast; onApplied: () => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const rec = f.recommendation;
  if (!rec || !f.profile) return null;

  const current = f.budget ?? null;
  const same = current !== null && Math.abs(current - rec.budget) < 10;
  const eventName = f.eventLabel || "your event";
  const weekly = Math.abs(rec.weeklyKg);

  const headline =
    rec.direction === "lose" ? `To lose about ${weekly} kg a week`
    : rec.direction === "gain" ? `To gain about ${weekly} kg a week`
    : "To keep your weight steady";

  const apply = async () => {
    setSaving(true);
    setError("");
    try {
      await api("/goal", {
        method: "PUT",
        body: {
          type: rec.direction,
          dailyCalorieBudget: rec.budget,
          ...(f.targetDate && { targetDate: f.targetDate }),
          ...(f.eventLabel && { eventLabel: f.eventLabel }),
        },
      });
      onApplied();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not update your budget");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-8 border-t border-mist-100 pt-6">
      <h3 className="font-display text-xl font-extrabold tracking-tight">Suggested daily budget</h3>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-5xl font-extrabold tracking-tight">
            {rec.budget}
            <span className="ml-1.5 text-lg font-semibold text-mist-500">kcal</span>
          </p>
          <p className="mt-1 text-sm font-semibold text-mist-500">
            {headline}.{" "}
            {current === null ? "You haven't set a budget yet." : same ? "That matches your current budget." : `Your current budget is ${current}.`}
          </p>
        </div>
        {!same && (
          <Button onClick={apply} loading={saving}>
            Use {rec.budget} as my budget
          </Button>
        )}
      </div>

      {error && <div className="mt-3"><ErrorBanner message={error} /></div>}

      <ul className="mt-4 space-y-1.5 text-sm text-mist-700">
        <li>You burn about {rec.maintenance} kcal a day before workouts. Workouts you log are added on top of this budget.</li>
        {rec.projectedKg !== null && f.daysLeft !== null && f.daysLeft !== undefined && (
          <li>At this budget you'd be around {rec.projectedKg} kg by {eventName}, in {f.daysLeft} day{f.daysLeft === 1 ? "" : "s"}, without counting workouts.</li>
        )}
        {rec.daysToTarget !== null && f.profile.targetWeightKg !== null && (
          <li>
            {rec.daysToTarget === 0
              ? `You're already at ${f.profile.targetWeightKg} kg.`
              : `You'd reach ${f.profile.targetWeightKg} kg around ${dateIn(rec.daysToTarget)}, without counting workouts.`}
          </li>
        )}
      </ul>

      {rec.notes.length > 0 && (
        <div className="mt-4 space-y-2">
          {rec.notes.map((n) => (
            <p key={n} className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{n}</p>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-mist-500">A rough estimate, not medical advice. If you have a health condition, check with a doctor before changing how you eat.</p>
    </div>
  );
}